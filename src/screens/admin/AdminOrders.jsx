import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { s } from "../../styles/admin/AdminOrders.styles";
import api from "../../lib/api";
import OrderTypeBadge from "../../components/OrderTypeBadge";
import PickupBadge from "../../components/PickupBadge";

const STATUS_LABEL = { PENDING: "주문접수", PAID: "결제완료", CANCELED: "취소" };
const STATUS_STYLE_KEY = { PENDING: "statusPending", PAID: "statusPaid", CANCELED: "statusCanceled" };

const formatDt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};
const formatDateLabel = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()}`;
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

export default function AdminOrders({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;
  const todayStr = toDateStr(new Date());

  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [dateFrom, setDateFrom] = useState(addDays(todayStr, -1));
  const [dateTo, setDateTo] = useState(todayStr);
  const [calTarget, setCalTarget] = useState(null); // null | "from" | "to"

  const load = async (from = dateFrom, to = dateTo) => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const list = await api.order.listByBiz(bizRegNo, from, to);
    setOrders(Array.isArray(list) ? list : []);
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

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>주문 관리</Text>
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
      ) : orders.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>주문 내역이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {orders.map(order => (
            <View key={order.orderNo} style={s.card}>
              <View style={s.cardTopRow}>
                <Text style={s.dt}>{formatDt(order.regDt)}</Text>
                <View style={[s.statusBadge, s[STATUS_STYLE_KEY[order.status]]]}>
                  <Text style={s.statusBadgeText}>{STATUS_LABEL[order.status] || order.status}</Text>
                </View>
              </View>

              <View style={s.metaRow}>
                <OrderTypeBadge isTakeout={order.orderTypCd === "TAKEOUT"} textStyle={s.orderTypText} />
                {order.seatNo ? <Text style={s.meta}>좌석 {order.seatNo}</Text> : null}
              </View>

              {(order.items || []).map(item => {
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

              <View style={s.cardBottomRow}>
                {order.pickupNo ? <PickupBadge pickupNo={order.pickupNo} /> : <View />}
                <Text style={s.totalAmount}>₩{Number(order.totalAmount || 0).toLocaleString()}</Text>
              </View>
              <Text style={s.orderNo}>주문번호 {order.orderNo}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
