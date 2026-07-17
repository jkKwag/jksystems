import { useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity, Linking } from "react-native";
import { s } from "../styles/PaymentHistory.styles";
import api from "../lib/api";

const formatDt = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const label = d.toDateString() === now.toDateString()
    ? "오늘"
    : d.toDateString() === yesterday.toDateString()
      ? "어제"
      : `${d.getMonth() + 1}/${d.getDate()}`;

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${label} ${hh}:${mm}`;
};

export default function PaymentHistory({ visible, onClose, payments, bizNameMap }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [orderDetails, setOrderDetails] = useState({}); // { [paymentKey]: OrderResponse[] }
  const [loadingKey, setLoadingKey] = useState(null);

  const toggleExpand = async (p) => {
    if (expandedKey === p.paymentKey) { setExpandedKey(null); return; }
    setExpandedKey(p.paymentKey);
    if (orderDetails[p.paymentKey]) return;
    setLoadingKey(p.paymentKey);
    const orders = await Promise.all((p.orderNos || []).map(no => api.order.get(no)));
    setOrderDetails(prev => ({ ...prev, [p.paymentKey]: orders.filter(Boolean) }));
    setLoadingKey(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.headerTitle}>💳 결제내역</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.list} contentContainerStyle={s.listContent}>
            {(!payments || payments.length === 0) ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>어제, 오늘 결제내역이 없습니다</Text>
              </View>
            ) : (
              payments.map(p => {
                const expanded = expandedKey === p.paymentKey;
                return (
                  <View key={p.paymentKey} style={s.card}>
                    <View style={s.cardTop}>
                      <Text style={s.bizName}>{bizNameMap?.[p.bizRegNo] || "가맹점"}</Text>
                      <Text style={s.amount}>₩{Number(p.totalAmount || 0).toLocaleString()}</Text>
                    </View>
                    <View style={s.cardMeta}>
                      <Text style={s.metaText}>{formatDt(p.approvedDt)}</Text>
                      <Text style={s.metaDot}>·</Text>
                      <Text style={s.metaText}>{p.method || "결제"}</Text>
                      <Text style={s.metaDot}>·</Text>
                      <Text style={s.metaText}>주문 {p.orderNos?.length || 0}건</Text>
                    </View>

                    <View style={s.actionRow}>
                      <TouchableOpacity style={s.actionBtn} onPress={() => toggleExpand(p)}>
                        <Text style={s.actionBtnText}>{expanded ? "접기 ▴" : "상세보기 ▾"}</Text>
                      </TouchableOpacity>
                      {!!p.pg?.receiptUrl && (
                        <TouchableOpacity
                          style={[s.actionBtn, s.receiptBtn]}
                          onPress={() => Linking.openURL(p.pg.receiptUrl)}
                        >
                          <Text style={[s.actionBtnText, s.receiptBtnText]}>영수증 보기</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {expanded && (
                      <View style={s.detailBox}>
                        {loadingKey === p.paymentKey ? (
                          <Text style={s.detailLoading}>불러오는 중...</Text>
                        ) : (orderDetails[p.paymentKey] || []).length === 0 ? (
                          <Text style={s.detailLoading}>주문 상세를 불러올 수 없습니다</Text>
                        ) : (
                          orderDetails[p.paymentKey].map((order, oi) => (
                            <View key={order.orderNo} style={[s.orderBlock, oi > 0 && s.orderBlockDivider]}>
                              {order.items?.map(item => {
                                const optionsTotal = (item.options || []).reduce((sum, o) => sum + Number(o.addPrice || 0), 0);
                                const lineTotal = (Number(item.price || 0) + optionsTotal) * Number(item.qty || 1);
                                return (
                                  <View key={item.orderSeq} style={s.itemRow}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={s.itemName}>{item.menuNm} x{item.qty}</Text>
                                      {item.options?.filter(o => o.optNm).map(o => (
                                        <Text key={o.optCd} style={s.itemOptions}>
                                          {o.optNm}{Number(o.addPrice || 0) > 0 ? ` (+₩${Number(o.addPrice).toLocaleString()})` : ""}
                                        </Text>
                                      ))}
                                    </View>
                                    <Text style={s.itemPrice}>₩{lineTotal.toLocaleString()}</Text>
                                  </View>
                                );
                              })}
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
