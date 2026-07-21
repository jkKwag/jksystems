import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { s } from "../../styles/admin/AdminPayments.styles";
import api from "../../lib/api";
import OrderTypeBadge from "../../components/OrderTypeBadge";
import PickupBadge from "../../components/PickupBadge";
import ConfirmModal from "../../components/ConfirmModal";

const PAY_STATUS_FILTERS = ["ALL", "DONE", "CANCELED"];

const pad = (n) => String(n).padStart(2, "0");
const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

const formatDt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}(${DAY_KR[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};
const formatDateLabel = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

const CAL_THEME = {
  backgroundColor: "#1e293b",
  calendarBackground: "#1e293b",
  textSectionTitleColor: "#94a3b8",
  selectedDayBackgroundColor: "#f97316",
  selectedDayTextColor: "#fff",
  todayTextColor: "#f97316",
  dayTextColor: "#e2e8f0",
  textDisabledColor: "#475569",
  arrowColor: "#f97316",
  monthTextColor: "#fff",
  indicatorColor: "#f97316",
};

export default function AdminPayments({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;
  const todayStr = toDateStr(new Date());

  const [loaded, setLoaded] = useState(false);
  const [payments, setPayments] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const [dateFrom, setDateFrom] = useState(addDays(todayStr, -1));
  const [dateTo, setDateTo] = useState(todayStr);
  const [calTarget, setCalTarget] = useState(null); // null | "from" | "to"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [payStatusLabels, setPayStatusLabels] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await api.commonCode.list("PAY_STT_CD");
      const map = {};
      (Array.isArray(list) ? list : []).forEach(c => { map[c.cd] = c.cdNm; });
      setPayStatusLabels(map);
    })();
  }, []);

  const load = async (from = dateFrom, to = dateTo) => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const list = await api.payment.listByBiz(bizRegNo, from, to);
    setPayments(Array.isArray(list) ? list : []);
    setExpandedKey(null);
    setOrderDetails({});
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const pickDate = (dateString) => {
    if (calTarget === "from") {
      const nextFrom = dateString > dateTo ? dateTo : dateString;
      setDateFrom(nextFrom);
      setCalTarget(null);
      load(nextFrom, dateTo);
    } else if (calTarget === "to") {
      const nextTo = dateString < dateFrom ? dateFrom : dateString;
      setDateTo(nextTo);
      setCalTarget(null);
      load(dateFrom, nextTo);
    }
  };

  const toggleExpand = async (p) => {
    if (expandedKey === p.paymentKey) { setExpandedKey(null); return; }
    setExpandedKey(p.paymentKey);
    if (orderDetails[p.paymentKey]) return;
    setLoadingKey(p.paymentKey);
    const orders = await Promise.all((p.orderNos || []).map(no => api.order.get(no)));
    const sorted = orders.filter(Boolean).sort((a, b) => new Date(b.regDt) - new Date(a.regDt));
    setOrderDetails(prev => ({ ...prev, [p.paymentKey]: sorted }));
    setLoadingKey(null);
  };

  const cancelPayment = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    await api.payment.cancel(cancelTarget, { cancelReason: "관리자 요청에 의한 취소" });
    setCanceling(false);
    setCancelTarget(null);
    load();
  };

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  const filteredPayments = statusFilter === "ALL" ? payments : payments.filter(p => p.status === statusFilter);

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>결제내역 조회</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={() => load()}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      <View style={s.dateRangeRow}>
        <TouchableOpacity style={s.dateField} onPress={() => setCalTarget("from")}>
          <Text style={s.dateFieldText}>📅 {formatDateLabel(dateFrom)}</Text>
        </TouchableOpacity>
        <Text style={s.dateRangeSep}>~</Text>
        <TouchableOpacity style={s.dateField} onPress={() => setCalTarget("to")}>
          <Text style={s.dateFieldText}>📅 {formatDateLabel(dateTo)}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.statusFilterBox}>
        <View style={s.statusFilterRow}>
          {PAY_STATUS_FILTERS.map(status => (
            <TouchableOpacity
              key={status}
              style={[s.statusChip, statusFilter === status && s.statusChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[s.statusChipText, statusFilter === status && s.statusChipTextActive]}>
                {status === "ALL" ? "전체" : (payStatusLabels[status] || status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {calTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setCalTarget(null)}>
          <TouchableOpacity style={s.calOverlay} activeOpacity={1} onPress={() => setCalTarget(null)}>
            <View style={s.calBox}>
              <Calendar
                current={calTarget === "from" ? dateFrom : dateTo}
                maxDate={todayStr}
                onDayPress={(day) => pickDate(day.dateString)}
                markedDates={{
                  [calTarget === "from" ? dateFrom : dateTo]: { selected: true, selectedColor: "#f97316" },
                }}
                theme={CAL_THEME}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : filteredPayments.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>결제 내역이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {filteredPayments.map(p => {
            const expanded = expandedKey === p.paymentKey;
            return (
              <View key={p.paymentKey} style={s.card}>
                <View style={s.cardTopRow}>
                  <Text style={s.dt}>{formatDt(p.approvedDt)}</Text>
                  <Text style={s.amount}>₩{Number(p.totalAmount || 0).toLocaleString()}</Text>
                </View>
                <View style={s.metaRow}>
                  <Text style={s.meta}>{p.method || "결제"}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.meta}>주문 {p.orderNos?.length || 0}건</Text>
                </View>

                <View style={s.actionRow}>
                  <TouchableOpacity style={s.actionBtn} onPress={() => toggleExpand(p)}>
                    <Text style={s.actionBtnText}>{expanded ? "접기 ▴" : "상세보기 ▾"}</Text>
                  </TouchableOpacity>
                  {!!p.pg?.receiptUrl && (
                    <TouchableOpacity style={[s.actionBtn, s.receiptBtn]} onPress={() => Linking.openURL(p.pg.receiptUrl)}>
                      <Text style={[s.actionBtnText, s.receiptBtnText]}>영수증 보기</Text>
                    </TouchableOpacity>
                  )}
                  {p.status === "DONE" && (
                    <TouchableOpacity style={[s.actionBtn, s.cancelBtn]} onPress={() => setCancelTarget(p.paymentKey)}>
                      <Text style={[s.actionBtnText, s.cancelBtnText]}>취소요청</Text>
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
                          <View style={s.orderBadgeRow}>
                            <View style={s.orderBadge}>
                              <Text style={s.orderBadgeText}>주문{orderDetails[p.paymentKey].length - oi}</Text>
                            </View>
                            <OrderTypeBadge isTakeout={order.orderTypCd === "TAKEOUT"} textStyle={s.orderTypText} />
                          </View>
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
                          <PickupBadge pickupNo={order.pickupNo} />
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <ConfirmModal
        visible={!!cancelTarget}
        message={canceling ? "취소 처리 중입니다..." : "결제를 취소하시겠습니까?\n이 작업은 되돌릴 수 없습니다."}
        confirmText="취소요청"
        cancelText="닫기"
        danger
        onConfirm={cancelPayment}
        onCancel={() => setCancelTarget(null)}
      />
    </View>
  );
}
