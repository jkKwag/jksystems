import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { s } from "../styles/PaymentSuccess.styles";
import api from "../lib/api";

const getParams = () => {
  if (Platform.OS !== "web") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    paymentKey: p.get("paymentKey"),
    orderId: p.get("orderId"),
    amount: p.get("amount"),
    orderNos: (p.get("orderNos") || "").split(",").filter(Boolean),
    bizno: p.get("bizno"),
    bizNm: decodeURIComponent(p.get("biz_nm") || ""),
  };
};

export default function PaymentSuccess() {
  const { paymentKey, orderId, amount, orderNos, bizno, bizNm } = getParams();
  const [status, setStatus] = useState("confirming"); // confirming | done | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || orderNos.length === 0) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }
    api.payment.confirm({ paymentKey, orderId, amount: Number(amount), orderNos }).then(({ data, error }) => {
      if (error || !data) {
        setStatus("error");
        setErrorMsg(error?.message || "결제 승인에 실패했습니다.");
        return;
      }
      if (Platform.OS === "web" && bizno) {
        try { localStorage.removeItem(`scaneat_cart_${bizno}`); } catch {}
        try { sessionStorage.removeItem(`scaneat_pending_cart_${bizno}`); } catch {}
      }
      setStatus("done");
    });
  }, []);

  if (status === "confirming") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={[s.desc, { marginTop: 16 }]}>결제 승인 처리 중입니다…</Text>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <Text style={s.icon}>⚠️</Text>
          <Text style={s.title}>결제 승인 실패</Text>
          <Text style={s.desc}>{errorMsg}</Text>
          <TouchableOpacity style={s.btn} onPress={() => { if (Platform.OS === "web") window.location.href = bizno ? `/menu/${bizno}` : "/"; }}>
            <Text style={s.btnText}>{bizNm ? `${bizNm} 홈` : "사업장 홈"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>✅</Text>
        <Text style={s.title}>결제 완료</Text>
        <Text style={s.desc}>결제가 정상적으로 처리되었습니다</Text>

        <View style={s.infoBox}>
          <Row label="결제금액" value={amount ? `₩${Number(amount).toLocaleString()}` : "-"} />
          <Row label="주문건수" value={`${orderNos.length}건`} />
          <Row label="결제키" value={paymentKey ? paymentKey.slice(0, 20) + "…" : "-"} mono />
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
