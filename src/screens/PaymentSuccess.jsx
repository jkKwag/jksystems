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
    checkoutId: p.get("checkoutId"),
    bizno: p.get("bizno"),
    bizNm: decodeURIComponent(p.get("biz_nm") || ""),
    tableNo: p.get("table"),
  };
};

export default function PaymentSuccess() {
  const { paymentKey, orderId, amount, orderNos: existingOrderNos, checkoutId, bizno, bizNm, tableNo } = getParams();
  const menuUrl = bizno ? `/menu/${bizno}${tableNo ? `?table=${encodeURIComponent(tableNo)}` : ""}` : "/";
  const [status, setStatus] = useState("confirming"); // confirming | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [orderCount, setOrderCount] = useState(existingOrderNos.length);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }
    (async () => {
      // 결제 전에는 주문을 만들지 않는다 — 장바구니 스냅샷(checkoutId)은 결제 승인
      // 요청에 실어 보내고, 서버가 토스 결제 검증에 실제로 성공했을 때만 주문을 생성한다.
      let newOrder = null;
      if (checkoutId) {
        const stored = sessionStorage.getItem(`scaneat_checkout_${checkoutId}`);
        if (stored) newOrder = JSON.parse(stored);
      }

      if (existingOrderNos.length === 0 && !newOrder) {
        setStatus("error");
        setErrorMsg("결제할 주문 정보를 찾을 수 없습니다.");
        return;
      }

      const { data, error } = await api.payment.confirm({
        paymentKey, orderId, amount: Number(amount), orderNos: existingOrderNos, newOrder,
      });
      if (error || !data) {
        setStatus("error");
        setErrorMsg(error?.message || "결제 승인에 실패했습니다.");
        return;
      }
      if (checkoutId) sessionStorage.removeItem(`scaneat_checkout_${checkoutId}`);
      setOrderCount(data.orderNos?.length || existingOrderNos.length);
      if (Platform.OS === "web" && bizno) {
        try { localStorage.removeItem(`scaneat_cart_${bizno}`); } catch {}
        try { sessionStorage.removeItem(`scaneat_pending_cart_${bizno}`); } catch {}
        try { sessionStorage.removeItem(`scaneat_elderly_pending_cart_${bizno}`); } catch {}
      }
      setStatus("done");
    })();
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
          <TouchableOpacity style={s.btn} onPress={() => { if (Platform.OS === "web") window.location.href = menuUrl; }}>
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
          <Row label="주문건수" value={`${orderCount}건`} />
          <Row label="결제키" value={paymentKey ? paymentKey.slice(0, 20) + "…" : "-"} mono />
        </View>

        <TouchableOpacity style={s.btn} onPress={() => { if (Platform.OS === "web") window.location.href = menuUrl; }}>
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
