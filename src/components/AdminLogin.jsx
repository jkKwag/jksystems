import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";

export default function AdminLogin({ visible, onClose, onLogin }) {
  const [form, setForm] = useState({ id: "", pw: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);

  const handleLogin = async () => {
    if (!form.id || !form.pw) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    setLoading(true); setError("");
    const { data, error: apiError } = await api.admin.login({ adminId: form.id, password: form.pw });
    setLoading(false);
    if (apiError || !data) {
      setError(apiError?.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    onLogin(data);
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
            <TextInput
              style={s.inp}
              placeholder="관리자 아이디 입력"
              value={form.id}
              onChangeText={v => setForm(f => ({ ...f, id: v }))}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => pwRef.current?.focus()}
              blurOnSubmit={false}
            />
            <Text style={s.label}>비밀번호</Text>
            <TextInput
              ref={pwRef}
              style={s.inp}
              placeholder="비밀번호 입력"
              value={form.pw}
              onChangeText={v => setForm(f => ({ ...f, pw: v }))}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
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
