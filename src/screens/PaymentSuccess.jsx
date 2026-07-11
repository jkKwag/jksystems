import { View, Text, TouchableOpacity, Platform } from "react-native";
import { s } from "../styles/PaymentSuccess.styles";

const getParams = () => {
  if (Platform.OS !== "web") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    paymentKey: p.get("paymentKey"),
    orderId: p.get("orderId"),
    amount: p.get("amount"),
    bizno: p.get("bizno"),
    bizNm: decodeURIComponent(p.get("biz_nm") || ""),
  };
};

export default function PaymentSuccess() {
  const { paymentKey, orderId, amount, bizno, bizNm } = getParams();

  if (Platform.OS === "web" && bizno) {
    try { localStorage.removeItem(`scaneat_cart_${bizno}`); } catch {}
    try { sessionStorage.removeItem(`scaneat_pending_cart_${bizno}`); } catch {}
  }

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
          <Text style={s.btnText}>{bizNm ? `${bizNm} 홈` : "사업장 홈"}</Text>
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

