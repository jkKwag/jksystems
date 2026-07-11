import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

const getParams = () => {
  if (Platform.OS !== "web") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    paymentKey: p.get("paymentKey"),
    orderId: p.get("orderId"),
    amount: p.get("amount"),
    bizno: p.get("bizno"),
  };
};

export default function PaymentSuccess() {
  const { paymentKey, orderId, amount, bizno } = getParams();

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>✅</Text>
        <Text style={s.title}>결제 완료</Text>
        <Text style={s.desc}>결제가 정상적으로 처리되었습니다</Text>

        <View style={s.infoBox}>
          <Row label="결제금액" value={amount ? `₩${Number(amount).toLocaleString()}` : "-"} />
          <Row label="주문번호" value={orderId || "-"} mono />
          <Row label="결제키" value={paymentKey ? paymentKey.slice(0, 20) + "…" : "-"} mono />
        </View>

        <View style={s.notice}>
          <Text style={s.noticeText}>⚡ 현재 테스트 모드 — 실제 승인 API 연동 전입니다</Text>
        </View>

        <TouchableOpacity style={s.btn} onPress={() => { if (Platform.OS === "web") window.location.href = bizno ? `/menu/${bizno}` : "/"; }}>
          <Text style={s.btnText}>사업장으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, mono }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, mono && s.rowMono]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  desc: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  infoBox: { width: "100%", backgroundColor: "#f8fafc", borderRadius: 14, padding: 16, gap: 10, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  rowValue: { fontSize: 13, color: "#0f172a", fontWeight: "700", maxWidth: "65%", textAlign: "right" },
  rowMono: { fontFamily: Platform.OS === "web" ? "monospace" : undefined, fontSize: 11 },
  notice: { backgroundColor: "#fff7ed", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 24, width: "100%" },
  noticeText: { fontSize: 12, color: "#f97316", fontWeight: "600", textAlign: "center" },
  btn: { backgroundColor: "#0f172a", borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
