import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";

export default function AdminLogin({ visible, onClose, onLogin, onSignupClick }) {
  const [form, setForm] = useState({ id: "", pw: "" });
  const [totpCode, setTotpCode] = useState("");
  const [totpRequired, setTotpRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);
  const totpRef = useRef(null);

  const handleLogin = async () => {
    if (!form.id || !form.pw) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    if (totpRequired && !totpCode) { setError("인증 코드를 입력해주세요."); return; }
    setLoading(true); setError("");
    const { data, error: apiError } = await api.admin.login({
      adminId: form.id, password: form.pw, totpCode: totpRequired ? totpCode : undefined,
    });
    setLoading(false);
    // TOTP를 등록한 계정은 비밀번호까지 맞으면 이 신호를 받아 인증 코드 입력창을 추가로 띄운다.
    if (apiError?.message === "TOTP_REQUIRED") {
      setTotpRequired(true);
      setTimeout(() => totpRef.current?.focus(), 0);
      return;
    }
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
              editable={!totpRequired}
              returnKeyType={totpRequired ? "default" : "done"}
              onSubmitEditing={totpRequired ? undefined : handleLogin}
            />
            {totpRequired && (
              <>
                <Text style={s.label}>인증 코드</Text>
                <TextInput
                  ref={totpRef}
                  style={s.inp}
                  placeholder="인증 앱의 6자리 코드 입력"
                  value={totpCode}
                  onChangeText={v => setTotpCode(v.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </>
            )}
            {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
            <TouchableOpacity style={[s.loginBtn, { opacity: loading ? 0.7 : 1 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>로그인</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            {!!onSignupClick && (
              <TouchableOpacity onPress={onSignupClick} style={{ marginTop: 14, alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#6b7280", textDecorationLine: "underline" }}>
                  사업자이신가요? 신규 가입하기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
