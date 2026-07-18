import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminDashboard.styles";
import api from "../../lib/api";

const ORDER_STATUS_LABEL = { PENDING: "주문접수", PAID: "결제완료", CANCELED: "취소" };
const ORDER_STATUS_COLOR = { PENDING: "#f59e0b", PAID: "#22c55e", CANCELED: "#94a3b8" };
const RSVN_STATUS_LABEL = { PENDING: "대기", CONFIRMED: "확정", REJECTED: "거절", CANCELLED: "취소", COMPLETED: "완료" };
const RSVN_STATUS_COLOR = { PENDING: "#f59e0b", CONFIRMED: "#22c55e", REJECTED: "#ef4444", CANCELLED: "#94a3b8", COMPLETED: "#64748b" };
const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

const dateStr = (iso) => (iso ? String(iso).slice(0, 10) : null);
const todayStr = () => new Date().toISOString().slice(0, 10);

const last7Dates = () => {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
};

const formatDt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function AdminDashboard({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const [orderList, paymentList, rsvnList] = await Promise.all([
      api.order.listByBiz(bizRegNo),
      api.payment.listByBiz(bizRegNo),
      api.reservation.listByBiz(bizRegNo),
    ]);
    setOrders(Array.isArray(orderList) ? orderList : []);
    setPayments(Array.isArray(paymentList) ? paymentList : []);
    setReservations(Array.isArray(rsvnList) ? rsvnList : []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  if (!loaded) {
    return <ActivityIndicator style={{ marginTop: 60 }} color="#f97316" />;
  }

  const today = todayStr();
  const todayRevenue = payments
    .filter(p => dateStr(p.approvedDt) === today)
    .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const todayOrderCount = orders.filter(o => dateStr(o.regDt) === today).length;
  const todayRsvnCount = reservations.filter(r =>
    dateStr(r.rsvnDt) === today && r.rsvnStatus !== "CANCELLED" && r.rsvnStatus !== "REJECTED"
  ).length;
  const pendingRsvnCount = reservations.filter(r => r.rsvnStatus === "PENDING").length;

  const days = last7Dates();
  const revenueByDay = days.map(d =>
    payments.filter(p => dateStr(p.approvedDt) === d).reduce((sum, p) => sum + Number(p.totalAmount || 0), 0)
  );
  const maxRevenue = Math.max(1, ...revenueByDay);

  const orderStatusCounts = ["PENDING", "PAID", "CANCELED"].map(st => ({
    st, count: orders.filter(o => o.status === st).length,
  }));
  const rsvnStatusCounts = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].map(st => ({
    st, count: reservations.filter(r => r.rsvnStatus === st).length,
  }));

  const menuCounts = {};
  orders.filter(o => o.status !== "CANCELED").forEach(o => {
    (o.items || []).forEach(item => {
      if (!item.menuNm) return;
      menuCounts[item.menuNm] = (menuCounts[item.menuNm] || 0) + Number(item.qty || 0);
    });
  });
  const topMenus = Object.entries(menuCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxMenuCount = Math.max(1, ...topMenus.map(([, c]) => c));

  const recentActivity = [
    ...orders.map(o => ({
      key: `order-${o.orderNo}`, type: "order", dt: o.regDt,
      label: `주문 ${o.orderNo}`, sub: `₩${Number(o.totalAmount || 0).toLocaleString()}`,
    })),
    ...reservations.map(r => ({
      key: `rsvn-${r.rsvnNo}`, type: "rsvn", dt: r.regDt,
      label: `${r.guestName || "고객"}님 예약`, sub: `${r.partySize}명 · ${RSVN_STATUS_LABEL[r.rsvnStatus] || r.rsvnStatus}`,
    })),
  ].filter(a => a.dt).sort((a, b) => new Date(b.dt) - new Date(a.dt)).slice(0, 8);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>대시보드</Text>

      <View style={s.statRow}>
        <View style={s.statTile}>
          <Text style={s.statLabel}>오늘 매출</Text>
          <Text style={s.statValue}>₩{todayRevenue.toLocaleString()}</Text>
        </View>
        <View style={s.statTile}>
          <Text style={s.statLabel}>오늘 주문</Text>
          <Text style={s.statValue}>{todayOrderCount}건</Text>
        </View>
        <View style={s.statTile}>
          <Text style={s.statLabel}>오늘 예약</Text>
          <Text style={s.statValue}>{todayRsvnCount}건</Text>
        </View>
        <View style={[s.statTile, pendingRsvnCount > 0 && s.statTileAlert]}>
          <Text style={s.statLabel}>승인대기 예약</Text>
          <Text style={[s.statValue, pendingRsvnCount > 0 && s.statValueAlert]}>{pendingRsvnCount}건</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>최근 7일 매출</Text>
        <View style={s.chartRow}>
          {days.map((d, i) => {
            const value = revenueByDay[i];
            const heightPct = Math.max(4, Math.round((value / maxRevenue) * 100));
            const dow = DAY_KR[new Date(`${d}T00:00:00`).getDay()];
            return (
              <View key={d} style={s.barCol}>
                <Text style={s.barValue}>{value > 0 ? `${Math.round(value / 1000)}k` : ""}</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { height: `${heightPct}%` }]} />
                </View>
                <Text style={[s.barDayLabel, d === today && s.barDayLabelToday]}>{dow}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={s.twoColRow}>
        <View style={[s.card, s.halfCard]}>
          <Text style={s.cardTitle}>주문 현황</Text>
          {orderStatusCounts.map(({ st, count }) => (
            <View key={st} style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: ORDER_STATUS_COLOR[st] }]} />
              <Text style={s.statusLabel}>{ORDER_STATUS_LABEL[st]}</Text>
              <Text style={s.statusCount}>{count}건</Text>
            </View>
          ))}
        </View>
        <View style={[s.card, s.halfCard]}>
          <Text style={s.cardTitle}>예약 현황</Text>
          {rsvnStatusCounts.map(({ st, count }) => (
            <View key={st} style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: RSVN_STATUS_COLOR[st] }]} />
              <Text style={s.statusLabel}>{RSVN_STATUS_LABEL[st]}</Text>
              <Text style={s.statusCount}>{count}건</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>인기 메뉴 TOP 5</Text>
        {topMenus.length === 0 ? (
          <Text style={s.emptySmallText}>주문 데이터가 없습니다</Text>
        ) : (
          topMenus.map(([nm, count], i) => (
            <View key={nm} style={s.menuRow}>
              <Text style={s.menuRank}>{i + 1}</Text>
              <Text style={s.menuNm} numberOfLines={1}>{nm}</Text>
              <View style={s.menuBarTrack}>
                <View style={[s.menuBarFill, { width: `${Math.round((count / maxMenuCount) * 100)}%` }]} />
              </View>
              <Text style={s.menuCount}>{count}개</Text>
            </View>
          ))
        )}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>최근 활동</Text>
        {recentActivity.length === 0 ? (
          <Text style={s.emptySmallText}>최근 활동이 없습니다</Text>
        ) : (
          recentActivity.map(a => (
            <View key={a.key} style={s.activityRow}>
              <Text style={s.activityIcon}>{a.type === "order" ? "🧾" : "📅"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.activityLabel}>{a.label}</Text>
                <Text style={s.activitySub}>{a.sub}</Text>
              </View>
              <Text style={s.activityTime}>{formatDt(a.dt)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
