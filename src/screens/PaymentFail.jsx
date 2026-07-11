import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  desc: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  btn: { backgroundColor: "#0f172a", borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
