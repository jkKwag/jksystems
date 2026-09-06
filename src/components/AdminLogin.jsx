import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";
import { isPasskeyAvailable, getPasskeyAssertion } from "../platform/passkey";
import { startKakaoLogin } from "../lib/kakao";

const LAST_EMAIL_KEY = "adminLoginLastEmail";

export default function AdminLogin({ visible, onClose, onLogin, onSignupClick }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpRequired, setTotpRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);
  const totpRef = useRef(null);

  // null=아직 확인 중, true=이 브라우저가 패스키를 지원(2단계 흐름), false=미지원(기존 한 화면 그대로)
  const [passkeySupported, setPasskeySupported] = useState(null);
  const [step, setStep] = useState("combined"); // combined | email | passkey | password
  const [passkeyOptions, setPasskeyOptions] = useState(null);
  const [passkeyStage, setPasskeyStage] = useState("idle"); // idle | scanning | error

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const supported = await isPasskeyAvailable();
      setPasskeySupported(supported);
      setStep(supported ? "email" : "combined");
      const remembered = await AsyncStorage.getItem(LAST_EMAIL_KEY);
      if (remembered) setEmail(remembered);
    })();
  }, [visible]);

  const rememberEmail = async (value) => {
    try { await AsyncStorage.setItem(LAST_EMAIL_KEY, value); } catch {}
  };

  // 1단계(패스키 지원 브라우저 전용): 이메일 입력 후 이 계정에 등록된 패스키가 있는지 서버에 확인
  const submitEmail = async () => {
    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    setError(""); setLoading(true);
    const { data, error: apiError } = await api.admin.passkeyLoginOptions(email.trim());
    setLoading(false);
    if (apiError || !data) { setStep("password"); return; }
    if (data.hasPasskey) {
      setPasskeyOptions(data);
      setPasskeyStage("idle");
      setStep("passkey");
    } else {
      setStep("password");
    }
  };

  const goBackToEmail = () => {
    setStep("email"); setError(""); setPw(""); setTotpCode(""); setTotpRequired(false);
  };

  const tryPasskey = async () => {
    setPasskeyStage("scanning"); setError("");
    try {
      const credentialJson = await getPasskeyAssertion(passkeyOptions);
      const { data, error: apiError } = await api.admin.passkeyLogin({ flowId: passkeyOptions.flowId, credentialJson });
      if (apiError || !data) {
        setPasskeyStage("error");
        setError(apiError?.message || "패스키 인증에 실패했습니다.");
        return;
      }
      await rememberEmail(email.trim());
      onLogin(data);
    } catch (e) {
      setPasskeyStage("error");
      // 사용자가 지문 인증 자체를 취소한 경우엔 에러 문구를 따로 안 보여준다.
      if (e?.name !== "NotAllowedError") setError("패스키 인증 중 문제가 발생했습니다.");
    }
  };

  const handleLogin = async () => {
    if (!email || !pw) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    if (totpRequired && !totpCode) { setError("인증 코드를 입력해주세요."); return; }
    setLoading(true); setError("");
    const { data, error: apiError } = await api.admin.login({
      adminId: email, password: pw, totpCode: totpRequired ? totpCode : undefined,
    });
    setLoading(false);
    // TOTP를 등록한 계정은 비밀번호까지 맞으면 이 신호를 받아 인증 코드 입력창을 추가로 띄운다.
    if (apiError?.message === "TOTP_REQUIRED") {
      setTotpRequired(true);
      setTimeout(() => totpRef.current?.focus(), 0);
      return;
    }
    if (apiError || !data) {
      setError(apiError?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    await rememberEmail(email.trim());
    onLogin(data);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <TouchableOpacity style={local.closeBtn} onPress={onClose}>
            <Text style={local.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={s.header}>
            <Text style={s.title}>사업자 로그인</Text>
            <Text style={s.sub}>JK Scaneat 사업자 전용 페이지입니다</Text>
          </View>
          <View style={s.body}>
            {step === "email" && (
              <>
                {Platform.OS === "web" && (
                  <>
                    <TouchableOpacity style={s.kakaoBtn} onPress={startKakaoLogin}>
                      <Text style={s.kakaoBtnText}>💬 카카오로 계속하기</Text>
                    </TouchableOpacity>
                    <View style={s.dividerRow}>
                      <View style={s.dividerLine} /><Text style={s.dividerText}>또는</Text><View style={s.dividerLine} />
                    </View>
                  </>
                )}
                <Text style={s.label}>이메일</Text>
                <TextInput
                  style={s.inp}
                  placeholder="이메일 입력"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={submitEmail}
                />
                {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
                <TouchableOpacity style={[s.loginBtn, { opacity: loading ? 0.7 : 1 }]} onPress={submitEmail} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>계속</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === "passkey" && (
              <>
                <TouchableOpacity style={s.backLink} onPress={goBackToEmail}>
                  <Text style={s.backLinkText}>← 다른 계정으로</Text>
                </TouchableOpacity>
                <View style={s.passkeyStage}>
                  <View style={[s.fpCircle, passkeyStage === "scanning" && s.fpCircleScanning, passkeyStage === "error" && s.fpCircleError]}>
                    <Text style={s.fpIcon}>👆</Text>
                  </View>
                  <Text style={s.passkeyTitle}>
                    {passkeyStage === "scanning" ? "지문을 인식하는 중..." : "지문으로 로그인"}
                  </Text>
                  <Text style={s.passkeyDesc}>{email}{"\n"}기기의 지문/Face ID로 본인 확인을 진행합니다.</Text>
                </View>
                {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
                <TouchableOpacity style={[s.loginBtn, { opacity: passkeyStage === "scanning" ? 0.7 : 1 }]} onPress={tryPasskey} disabled={passkeyStage === "scanning"}>
                  {passkeyStage === "scanning" ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>지문으로 계속하기</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.ghostLink} onPress={() => setStep("password")}>
                  <Text style={s.ghostLinkText}>비밀번호로 로그인</Text>
                </TouchableOpacity>
              </>
            )}

            {(step === "password" || step === "combined") && (
              <>
                {step === "password" && (
                  <TouchableOpacity style={s.backLink} onPress={goBackToEmail}>
                    <Text style={s.backLinkText}>← 다른 계정으로</Text>
                  </TouchableOpacity>
                )}
                {step === "combined" && (
                  <>
                    {Platform.OS === "web" && (
                      <>
                        <TouchableOpacity style={s.kakaoBtn} onPress={startKakaoLogin}>
                          <Text style={s.kakaoBtnText}>💬 카카오로 계속하기</Text>
                        </TouchableOpacity>
                        <View style={s.dividerRow}>
                          <View style={s.dividerLine} /><Text style={s.dividerText}>또는</Text><View style={s.dividerLine} />
                        </View>
                      </>
                    )}
                    <Text style={s.label}>이메일</Text>
                    <TextInput
                      style={s.inp}
                      placeholder="이메일 입력"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => pwRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </>
                )}
                <Text style={s.label}>비밀번호</Text>
                <TextInput
                  ref={pwRef}
                  style={s.inp}
                  placeholder="비밀번호 입력"
                  value={pw}
                  onChangeText={setPw}
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
                <View style={local.btnRow}>
                  <TouchableOpacity style={[s.loginBtn, local.btnRowItem, { opacity: loading ? 0.7 : 1 }]} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>로그인</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.cancelBtn, local.btnRowItem]} onPress={onClose}>
                    <Text style={s.cancelBtnText}>취소</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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

const local = StyleSheet.create({
  closeBtn: {
    position: "absolute", top: 14, right: 14, zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  closeBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10 },
  btnRowItem: { flex: 1, marginBottom: 0 },
});
