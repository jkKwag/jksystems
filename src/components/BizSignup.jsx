import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Platform, StyleSheet, ScrollView } from "react-native";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";

const IMAGE_MAX_DIMENSION = 1400;
const IMAGE_QUALITY = 0.85;

// 대표자명/주소는 나중에 사업자등록증 이미지 인식으로 채울 예정이라 가입 폼에서는 받지 않는다.
const emptyForm = {
  bizRegNo: "", bizNm: "", telNo: "", mobileTel: "", emailAddr: "",
  adminId: "", password: "", passwordConfirm: "",
};

const digitsOnly = (v) => v.replace(/\D/g, "");

// 필드별 유효성 검사 — 값이 비어있으면 required 필드만 에러, 나머지는 형식만 검사
const validators = {
  bizRegNo: (v) => {
    if (!v.trim()) return "사업자등록번호를 입력해주세요.";
    if (digitsOnly(v).length !== 10) return "사업자등록번호는 숫자 10자리여야 합니다.";
    return "";
  },
  bizNm: (v) => (!v.trim() ? "상호명을 입력해주세요." : ""),
  telNo: (v) => {
    if (!v.trim()) return "";
    return digitsOnly(v).length >= 9 && digitsOnly(v).length <= 11 ? "" : "전화번호 형식이 올바르지 않습니다.";
  },
  mobileTel: (v) => {
    if (!v.trim()) return "";
    return /^01[0-9]{8,9}$/.test(digitsOnly(v)) ? "" : "휴대폰번호 형식이 올바르지 않습니다. (예: 01012345678)";
  },
  emailAddr: (v) => {
    if (!v.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "이메일 형식이 올바르지 않습니다.";
  },
  adminId: (v) => {
    if (!v.trim()) return "관리자 아이디를 입력해주세요.";
    return /^[a-zA-Z0-9_]{4,20}$/.test(v.trim()) ? "" : "아이디는 영문/숫자/_ 4~20자여야 합니다.";
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

// 메뉴 이미지 업로드와 동일한 방식으로 리사이즈/압축 (사업자등록증은 글자를 읽어야 해서 조금 더 크게)
function resizeAndCompressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했습니다."))), "image/jpeg", quality);
      };
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

// 컴포넌트 함수 안에서 인라인으로 정의하면 매 렌더(키 입력마다)마다 새 컴포넌트로 취급되어
// TextInput이 언마운트/재마운트되면서 포커스(모바일에서는 키보드)가 날아간다 — 반드시 밖에 둬야 함.
function Field({ field, label, placeholder, keyboardType, secureTextEntry, autoCapitalize, value, error, onChangeText, onBlur }) {
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
      />
      {!!error && <Text style={local.fieldErrorText}>{error}</Text>}
    </>
  );
}

export default function BizSignup({ visible, onClose }) {
  const [step, setStep] = useState("form"); // form | cert | done
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupResult, setSignupResult] = useState(null); // { bizRegNo, signupToken, ntsStatus }
  const [certUploaded, setCertUploaded] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));
  const markTouched = (key) => () => setTouched(t => ({ ...t, [key]: true }));

  const fieldErrors = validateAll(form);
  const errorFor = (key) => (touched[key] ? fieldErrors[key] : "");

  const reset = () => {
    setStep("form");
    setForm(emptyForm);
    setTouched({});
    setError("");
    setSignupResult(null);
    setCertUploaded(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const submitSignup = async () => {
    const errors = validateAll(form);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    if (Object.keys(errors).length > 0) {
      setError("입력값을 다시 확인해주세요.");
      return;
    }

    setLoading(true); setError("");
    const { data, error: apiError } = await api.biz.signup({
      bizRegNo: digitsOnly(form.bizRegNo),
      bizNm: form.bizNm.trim(),
      telNo: form.telNo.trim() || null,
      mobileTel: form.mobileTel.trim() || null,
      emailAddr: form.emailAddr.trim() || null,
      adminId: form.adminId.trim(),
      password: form.password,
    });
    setLoading(false);
    if (apiError || !data) { setError(apiError?.message || "가입에 실패했습니다. 다시 시도해주세요."); return; }
    setSignupResult(data);
    setStep("cert");
  };

  const pickAndUploadCert = () => {
    if (Platform.OS !== "web" || !signupResult) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setCertUploading(true); setError("");
      try {
        const blob = await resizeAndCompressImage(file, IMAGE_MAX_DIMENSION, IMAGE_QUALITY);
        const formData = new FormData();
        formData.append("file", blob, "cert.jpg");
        const { error: uploadError } = await api.biz.uploadRegistrationCert(
          signupResult.bizRegNo, signupResult.signupToken, formData
        );
        if (uploadError) {
          setError(uploadError?.message || "사업자등록증 업로드에 실패했습니다.");
        } else {
          setCertUploaded(true);
        }
      } catch {
        setError("이미지 처리 중 오류가 발생했습니다.");
      }
      setCertUploading(false);
    };
    input.click();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={[s.card, local.card]}>
          <View style={s.header}>
            <Text style={s.icon}>🏪</Text>
            <Text style={s.title}>사업자 가입</Text>
            <Text style={s.sub}>
              {step === "form" ? "CampRoad에 매장을 등록해보세요" : step === "cert" ? "사업자등록증을 업로드해주세요" : "가입 신청 완료"}
            </Text>
          </View>
          <ScrollView style={local.scroll} contentContainerStyle={s.body}>
            {step === "form" && (
              <>
                <Field field="bizRegNo" label="사업자등록번호" placeholder="숫자만 입력" keyboardType="numeric"
                  value={form.bizRegNo} error={errorFor("bizRegNo")} onChangeText={update("bizRegNo")} onBlur={markTouched("bizRegNo")} />
                <Field field="bizNm" label="상호명" placeholder="상호명 입력"
                  value={form.bizNm} error={errorFor("bizNm")} onChangeText={update("bizNm")} onBlur={markTouched("bizNm")} />
                <Field field="telNo" label="전화번호" placeholder="전화번호 입력 (선택)" keyboardType="phone-pad"
                  value={form.telNo} error={errorFor("telNo")} onChangeText={update("telNo")} onBlur={markTouched("telNo")} />
                <Field field="mobileTel" label="휴대폰번호" placeholder="휴대폰번호 입력 (선택)" keyboardType="phone-pad"
                  value={form.mobileTel} error={errorFor("mobileTel")} onChangeText={update("mobileTel")} onBlur={markTouched("mobileTel")} />
                <Field field="emailAddr" label="이메일" placeholder="이메일 입력 (선택)" keyboardType="email-address" autoCapitalize="none"
                  value={form.emailAddr} error={errorFor("emailAddr")} onChangeText={update("emailAddr")} onBlur={markTouched("emailAddr")} />
                <Field field="adminId" label="관리자 아이디" placeholder="로그인에 사용할 아이디" autoCapitalize="none"
                  value={form.adminId} error={errorFor("adminId")} onChangeText={update("adminId")} onBlur={markTouched("adminId")} />
                <Field field="password" label="비밀번호" placeholder="8자 이상" secureTextEntry
                  value={form.password} error={errorFor("password")} onChangeText={update("password")} onBlur={markTouched("password")} />
                <Field field="passwordConfirm" label="비밀번호 확인" placeholder="비밀번호 재입력" secureTextEntry
                  value={form.passwordConfirm} error={errorFor("passwordConfirm")} onChangeText={update("passwordConfirm")} onBlur={markTouched("passwordConfirm")} />

                {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
                <TouchableOpacity style={[s.loginBtn, { opacity: loading ? 0.7 : 1 }]} onPress={submitSignup} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>가입 신청</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                  <Text style={s.cancelBtnText}>취소</Text>
                </TouchableOpacity>
              </>
            )}

            {step === "cert" && (
              <>
                <View style={local.ntsResultBox}>
                  <Text style={local.ntsResultText}>
                    국세청 상태조회 결과: {signupResult?.ntsStatus || "확인되지 않았습니다 (수동 검토 예정)"}
                  </Text>
                </View>
                <Text style={s.label}>사업자등록증 사진</Text>
                <TouchableOpacity style={local.certPickBtn} onPress={pickAndUploadCert} disabled={certUploading}>
                  {certUploading
                    ? <ActivityIndicator color="#1d3557" />
                    : <Text style={local.certPickBtnText}>{certUploaded ? "✓ 업로드 완료 (다시 선택하려면 탭)" : "사업자등록증 사진 선택"}</Text>}
                </TouchableOpacity>
                {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}
                <TouchableOpacity
                  style={[s.loginBtn, !certUploaded && { opacity: 0.5 }]}
                  onPress={() => setStep("done")}
                  disabled={!certUploaded}
                >
                  <Text style={s.loginBtnText}>다음</Text>
                </TouchableOpacity>
              </>
            )}

            {step === "done" && (
              <>
                <Text style={local.doneText}>
                  가입 신청이 접수되었습니다.{"\n"}관리자 승인 후 로그인하실 수 있어요.
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
  scroll: { flexShrink: 1 },
  inpError: { borderColor: "#ef4444" },
  fieldErrorText: { fontSize: 13, color: "#ef4444", marginTop: -10, marginBottom: 12 },
  ntsResultBox: { backgroundColor: "#f0f9ff", borderWidth: 1, borderColor: "#7dd3fc", borderRadius: 12, padding: 12, marginBottom: 16 },
  ntsResultText: { fontSize: 15, color: "#0369a1", fontWeight: "600" },
  certPickBtn: { borderWidth: 1.5, borderColor: "#1d3557", borderStyle: "dashed", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16 },
  certPickBtnText: { fontSize: 16, fontWeight: "700", color: "#1d3557" },
  doneText: { fontSize: 17, color: "#334155", textAlign: "center", lineHeight: 26, marginBottom: 20 },
});
