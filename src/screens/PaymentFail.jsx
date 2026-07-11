import { View, Text, TouchableOpacity, Platform } from "react-native";
import { s } from "../styles/PaymentFail.styles";

const getParams = () => {
  if (Platform.OS !== "web") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    bizno: p.get("bizno"),
    bizNm: decodeURIComponent(p.get("biz_nm") || ""),
    message: p.get("message") || "",
  };
};

export default function PaymentFail() {
  const { bizno, bizNm, message } = getParams();

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>❌</Text>
        <Text style={s.title}>결제 취소</Text>
        <Text style={s.desc}>{message || "결제가 취소되었습니다"}</Text>

        <TouchableOpacity style={s.btn} onPress={() => { if (Platform.OS === "web") window.location.href = bizno ? `/menu/${bizno}` : "/"; }}>
          <Text style={s.btnText}>{bizNm ? `${bizNm} 홈` : "사업장 홈"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
