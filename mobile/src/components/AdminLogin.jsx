import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from "react-native";
import bcrypt from "bcryptjs";
import supabase from "../lib/supabase";

export default function AdminLogin({ visible, onClose, onLogin }) {
  const [form, setForm] = useState({ id: "", pw: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.id || !form.pw) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    setLoading(true); setError("");
    const { data, error: dbError } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("user_id", form.id)
      .single();
    setLoading(false);
    if (dbError || !data) { setError("아이디 또는 비밀번호가 올바르지 않습니다."); return; }
    const match = await bcrypt.compare(form.pw, data.password_hash);
    if (match) { onLogin(); }
    else { setError("아이디 또는 비밀번호가 올바르지 않습니다."); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.icon}>⚙️</Text>
            <Text style={s.title}>관리자 로그인</Text>
            <Text style={s.sub}>CampRoad 관리자 전용 페이지입니다</Text>
          </View>
          <View style={s.body}>
            <Text style={s.label}>아이디</Text>
            <TextInput style={s.inp} placeholder="관리자 아이디 입력" value={form.id} onChangeText={v => setForm(f => ({ ...f, id: v }))} autoCapitalize="none" />
            <Text style={s.label}>비밀번호</Text>
            <TextInput style={s.inp} placeholder="비밀번호 입력" value={form.pw} onChangeText={v => setForm(f => ({ ...f, pw: v }))} secureTextEntry />
            {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
            <TouchableOpacity style={[s.loginBtn, { opacity: loading ? 0.7 : 1 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>로그인</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 400, borderRadius: 24, overflow: "hidden", backgroundColor: "#fff" },
  header: { backgroundColor: "#1d3557", padding: 32, alignItems: "center" },
  icon: { fontSize: 44, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 6 },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  body: { padding: 24 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 6 },
  inp: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: "#f9fafb", marginBottom: 14 },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { fontSize: 13, color: "#dc2626" },
  loginBtn: { backgroundColor: "#1d3557", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 10 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { backgroundColor: "#f1f5f9", borderRadius: 12, padding: 12, alignItems: "center" },
  cancelBtnText: { color: "#6b7280", fontWeight: "600", fontSize: 14 },
});
