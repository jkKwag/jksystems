import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Platform, StyleSheet, ScrollView } from "react-native";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";

// 상호명/전화번호/대표자명/주소/사업자등록증은 가입 직후 로그인해서 별도 화면(임시관리자 메뉴)에서
// 사업자등록증 업로드로 채우도록 이동했다. 가입 시에는 사업자등록번호만 받는다.
const emptyForm = {
  bizRegNo: "",
  adminId: "", password: "", passwordConfirm: "", mobileTel: "",
};

const digitsOnly = (v) => v.replace(/\D/g, "");

// 필드별 유효성 검사 — 값이 비어있으면 required 필드만 에러, 나머지는 형식만 검사
const validators = {
  bizRegNo: (v) => {
    if (!v.trim()) return "사업자등록번호를 입력해주세요.";
    if (digitsOnly(v).length !== 10) return "사업자등록번호는 숫자 10자리여야 합니다.";
    return "";
  },
  mobileTel: (v) => {
    if (!v.trim()) return "휴대폰번호를 입력해주세요.";
    return /^01[0-9]{8,9}$/.test(v.trim()) ? "" : "휴대폰번호 형식이 올바르지 않습니다. (예: 01012345678)";
  },
  adminId: (v) => {
    if (!v.trim()) return "이메일을 입력해주세요.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "이메일 형식이 올바르지 않습니다.";
  },
  password: (v) => {
    if (!v) return "비밀번호를 입력해주세요.";
    return v.length >= 8 ? "" : "비밀번호는 8자 이상이어야 합니다.";
  },
  passwordConfirm: (v, form) => {
    if (!v) return "비밀번호를 다시 입력해주세요.";
    return v === form.password ? "" : "비밀번호가 일치하지 않습니다.";
  },
};

const validateAll = (form) => {
  const errors = {};
  Object.keys(validators).forEach((key) => {
    const msg = validators[key](form[key], form);
    if (msg) errors[key] = msg;
  });
  return errors;
};

// 컴포넌트 함수 안에서 인라인으로 정의하면 매 렌더(키 입력마다)마다 새 컴포넌트로 취급되어
// TextInput이 언마운트/재마운트되면서 포커스(모바일에서는 키보드)가 날아간다 — 반드시 밖에 둬야 함.
function Field({ field, label, placeholder, keyboardType, secureTextEntry, autoCapitalize, maxLength, value, error, onChangeText, onBlur }) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.inp, !!error && local.inpError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
      {!!error && <Text style={local.fieldErrorText}>{error}</Text>}
    </>
  );
}

export default function BizSignup({ visible, onClose }) {
  const [step, setStep] = useState("form"); // form | done
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이메일 인증 — 어떤 이메일에 코드를 보냈는지/어떤 이메일이 인증됐는지를 값으로 들고 있다가
  // 매번 지금 입력된 adminId랑 비교한다. 그래야 인증 후 이메일을 바꾸면 자동으로 재인증이 걸린다.
  const [emailCodeSentFor, setEmailCodeSentFor] = useState("");
  const [emailCodeVerifiedFor, setEmailCodeVerifiedFor] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [emailCodeVerifying, setEmailCodeVerifying] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState("");

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));
  const markTouched = (key) => () => setTouched(t => ({ ...t, [key]: true }));

  const fieldErrors = validateAll(form);
  const errorFor = (key) => (touched[key] ? fieldErrors[key] : "");

  const normalizedAdminEmail = form.adminId.trim().toLowerCase();
  const emailCodeSent = !!normalizedAdminEmail && emailCodeSentFor === normalizedAdminEmail;
  const emailVerified = !!normalizedAdminEmail && emailCodeVerifiedFor === normalizedAdminEmail;

  const reset = () => {
    setStep("form");
    setForm(emptyForm);
    setTouched({});
    setError("");
    setEmailCodeSentFor("");
    setEmailCodeVerifiedFor("");
    setEmailCode("");
    setEmailCodeError("");
  };

  const sendEmailCode = async () => {
    if (validators.adminId(form.adminId)) { setTouched(t => ({ ...t, adminId: true })); return; }
    setEmailCodeSending(true); setEmailCodeError("");
    const { error: apiError } = await api.biz.sendEmailCode({ email: normalizedAdminEmail });
    setEmailCodeSending(false);
    if (apiError) { setEmailCodeError(apiError?.message || "인증코드 발송에 실패했습니다."); return; }
    setEmailCodeSentFor(normalizedAdminEmail);
    setEmailCode("");
  };

  const verifyEmailCode = async () => {
    if (!emailCode.trim()) { setEmailCodeError("인증코드를 입력해주세요."); return; }
    setEmailCodeVerifying(true); setEmailCodeError("");
    const { error: apiError } = await api.biz.verifyEmailCode({ email: normalizedAdminEmail, code: emailCode.trim() });
    setEmailCodeVerifying(false);
    if (apiError) { setEmailCodeError(apiError?.message || "인증코드가 올바르지 않습니다."); return; }
    setEmailCodeVerifiedFor(normalizedAdminEmail);
  };

  const handleClose = () => { reset(); onClose(); };

  const submitSignup = async () => {
    const errors = validateAll(form);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    if (Object.keys(errors).length > 0) {
      setError("입력값을 다시 확인해주세요.");
      return;
    }
    if (!emailVerified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    setLoading(true); setError("");
    const { data, error: apiError } = await api.biz.signup({
      bizRegNo: digitsOnly(form.bizRegNo),
      mobileTel: form.mobileTel.trim(),
      adminId: form.adminId.trim(),
      password: form.password,
    });
    setLoading(false);
    if (apiError || !data) { setError(apiError?.message || "가입에 실패했습니다. 다시 시도해주세요."); return; }
    setStep("done");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={[s.card, local.card]}>
          <TouchableOpacity style={local.closeBtn} onPress={handleClose}>
            <Text style={local.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={[s.header, local.headerPad]}>
            <Text style={s.title}>사업자 가입</Text>
            {step === "done" && <Text style={s.sub}>가입 신청 완료</Text>}
          </View>
          <ScrollView style={local.scroll} contentContainerStyle={s.body}>
            {step === "form" && (
              <>
                <View style={local.sectionCard}>
                  <Text style={local.sectionTitle}>🔐 관리자 계정</Text>
                  <Field field="adminId" label="이메일" placeholder="로그인에 사용할 이메일" keyboardType="email-address" autoCapitalize="none"
                    value={form.adminId} error={errorFor("adminId")} onChangeText={update("adminId")} onBlur={markTouched("adminId")} />
                  <Text style={local.noticeText}>현재는 관리자메일로만 확인 가능합니다.</Text>

                  {emailVerified ? (
                    <Text style={local.emailVerifiedText}>✓ 이메일 인증 완료</Text>
                  ) : emailCodeSent ? (
                    <View style={local.emailCodeRow}>
                      <TextInput
                        style={[s.inp, local.emailCodeInput]}
                        placeholder="6자리 코드"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={emailCode}
                        onChangeText={(v) => setEmailCode(digitsOnly(v).slice(0, 6))}
                      />
                      <TouchableOpacity
                        style={[local.emailCodeBtn, emailCode.length !== 6 && local.emailCodeBtnDisabled]}
                        onPress={verifyEmailCode}
                        disabled={emailCodeVerifying || emailCode.length !== 6}
                      >
                        {emailCodeVerifying ? <ActivityIndicator size="small" color="#fff" /> : <Text style={local.emailCodeBtnText} numberOfLines={1}>확인</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity style={local.resendBtn} onPress={sendEmailCode} disabled={emailCodeSending}>
                        {emailCodeSending ? <ActivityIndicator size="small" color="#1d3557" /> : <Text style={local.resendBtnText} numberOfLines={1}>재발송</Text>}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[local.emailCodeSendBtn, (!normalizedAdminEmail || !!validators.adminId(form.adminId)) && { opacity: 0.5 }]}
                      onPress={sendEmailCode}
                      disabled={emailCodeSending || !normalizedAdminEmail || !!validators.adminId(form.adminId)}
                    >
                      {emailCodeSending ? <ActivityIndicator size="small" color="#1d3557" /> : <Text style={local.emailCodeSendBtnText}>인증코드 발송</Text>}
                    </TouchableOpacity>
                  )}
                  {!!emailCodeError && <Text style={local.fieldErrorText}>{emailCodeError}</Text>}

                  <Field field="password" label="비밀번호" placeholder="8자 이상" secureTextEntry
                    value={form.password} error={errorFor("password")} onChangeText={update("password")} onBlur={markTouched("password")} />
                  <Field field="passwordConfirm" label="비밀번호 확인" placeholder="비밀번호 재입력" secureTextEntry
                    value={form.passwordConfirm} error={errorFor("passwordConfirm")} onChangeText={update("passwordConfirm")} onBlur={markTouched("passwordConfirm")} />
                  <Field field="mobileTel" label="휴대폰번호" placeholder="숫자만 입력 (예: 01012345678)" keyboardType="number-pad" maxLength={11}
                    value={form.mobileTel} error={errorFor("mobileTel")}
                    onChangeText={(v) => update("mobileTel")(digitsOnly(v).slice(0, 11))} onBlur={markTouched("mobileTel")} />
                </View>

                <View style={local.sectionCard}>
                  <Text style={local.sectionTitle}>📋 사업장 정보</Text>
                  <Field field="bizRegNo" label="사업자등록번호" placeholder="숫자만 입력" keyboardType="numeric" maxLength={10}
                    value={form.bizRegNo} error={errorFor("bizRegNo")}
                    onChangeText={(v) => update("bizRegNo")(digitsOnly(v).slice(0, 10))} onBlur={markTouched("bizRegNo")} />
                  <Text style={local.noticeText}>상호명 등 나머지 사업장 정보는 로그인 후 사업자등록증을 업로드하면 자동으로 채워집니다.</Text>
                </View>

                {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
                <TouchableOpacity style={[s.loginBtn, { opacity: loading ? 0.7 : 1 }]} onPress={submitSignup} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>가입 신청</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                  <Text style={s.cancelBtnText}>취소</Text>
                </TouchableOpacity>
              </>
            )}

            {step === "done" && (
              <>
                <Text style={local.doneText}>
                  가입 신청이 완료되었습니다.{"\n"}로그인하시면 기본정보 입력과 사업자등록증 업로드를 이어서 진행하실 수 있어요.
                </Text>
                <TouchableOpacity style={s.loginBtn} onPress={handleClose}>
                  <Text style={s.loginBtnText}>확인</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const local = StyleSheet.create({
  card: { maxHeight: Platform.OS === "web" ? "85vh" : "85%" },
  headerPad: { paddingTop: 16, paddingBottom: 16 },
  closeBtn: {
    position: "absolute", top: 14, right: 14, zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  closeBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  scroll: { flexShrink: 1 },
  sectionCard: { backgroundColor: "#f0f9ff", borderWidth: 1, borderColor: "#7dd3fc", borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  inpError: { borderColor: "#ef4444" },
  fieldErrorText: { fontSize: 13, color: "#ef4444", marginTop: -10, marginBottom: 12 },
  emailCodeSendBtn: { borderWidth: 1.5, borderColor: "#1d3557", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginBottom: 12 },
  emailCodeSendBtnText: { fontSize: 13, fontWeight: "700", color: "#1d3557" },
  emailCodeRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 12 },
  emailCodeInput: { flex: 1, minWidth: 0, marginBottom: 0 },
  emailCodeBtn: { flexShrink: 0, width: 70, backgroundColor: "#f97316", borderRadius: 8, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  emailCodeBtnDisabled: { backgroundColor: "#cbd5e1" },
  emailCodeBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  resendBtn: { flexShrink: 0, width: 70, backgroundColor: "#0f172a", borderRadius: 8, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  resendBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  noticeText: { fontSize: 12, color: "#94a3b8", marginTop: -10, marginBottom: 10 },
  emailVerifiedText: { fontSize: 13, fontWeight: "700", color: "#16a34a", marginBottom: 12 },
  doneText: { fontSize: 17, color: "#334155", textAlign: "center", lineHeight: 26, marginBottom: 20 },
});
