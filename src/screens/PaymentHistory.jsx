import { View, Text, Modal, ScrollView, TouchableOpacity, Linking } from "react-native";
import { s } from "../styles/PaymentHistory.styles";

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
              payments.map(p => (
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
                  {!!p.pg?.receiptUrl && (
                    <TouchableOpacity onPress={() => Linking.openURL(p.pg.receiptUrl)}>
                      <Text style={s.receiptLink}>영수증 보기 →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
