import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { s } from "../styles/AdminLogin.styles";
import api from "../lib/api";

const IMAGE_MAX_DIMENSION = 1400;
const IMAGE_QUALITY = 0.85;

const emptyForm = {
  bizRegNo: "", bizNm: "", repNm: "", telNo: "", emailAddr: "", addr: "", addrDtl: "",
  adminId: "", password: "", passwordConfirm: "",
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

export default function BizSignup({ visible, onClose }) {
  const [step, setStep] = useState("form"); // form | cert | done
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupResult, setSignupResult] = useState(null); // { bizRegNo, signupToken, ntsStatus }
  const [certUploaded, setCertUploaded] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const reset = () => {
    setStep("form");
    setForm(emptyForm);
    setError("");
    setSignupResult(null);
    setCertUploaded(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const submitSignup = async () => {
    if (!form.bizRegNo.trim() || !form.bizNm.trim() || !form.repNm.trim()) {
      setError("사업자등록번호, 상호명, 대표자명을 입력해주세요."); return;
    }
    if (!form.adminId.trim() || !form.password) {
      setError("관리자 아이디와 비밀번호를 입력해주세요."); return;
    }
    if (form.password.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    if (form.password !== form.passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }

    setLoading(true); setError("");
    const { data, error: apiError } = await api.biz.signup({
      bizRegNo: form.bizRegNo.trim(),
      bizNm: form.bizNm.trim(),
      repNm: form.repNm.trim(),
      telNo: form.telNo.trim() || null,
      emailAddr: form.emailAddr.trim() || null,
      addr: form.addr.trim() || null,
      addrDtl: form.addrDtl.trim() || null,
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
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.icon}>🏪</Text>
            <Text style={s.title}>사업자 가입</Text>
            <Text style={s.sub}>
              {step === "form" ? "CampRoad에 매장을 등록해보세요" : step === "cert" ? "사업자등록증을 업로드해주세요" : "가입 신청 완료"}
            </Text>
          </View>
          <View style={s.body}>
            {step === "form" && (
              <>
                <Text style={s.label}>사업자등록번호</Text>
                <TextInput style={s.inp} placeholder="숫자만 입력" value={form.bizRegNo} onChangeText={update("bizRegNo")} keyboardType="numeric" />
                <Text style={s.label}>상호명</Text>
                <TextInput style={s.inp} placeholder="상호명 입력" value={form.bizNm} onChangeText={update("bizNm")} />
                <Text style={s.label}>대표자명</Text>
                <TextInput style={s.inp} placeholder="대표자명 입력" value={form.repNm} onChangeText={update("repNm")} />
                <Text style={s.label}>전화번호</Text>
                <TextInput style={s.inp} placeholder="전화번호 입력" value={form.telNo} onChangeText={update("telNo")} keyboardType="phone-pad" />
                <Text style={s.label}>이메일</Text>
                <TextInput style={s.inp} placeholder="이메일 입력" value={form.emailAddr} onChangeText={update("emailAddr")} autoCapitalize="none" keyboardType="email-address" />
                <Text style={s.label}>주소</Text>
                <TextInput style={s.inp} placeholder="주소 입력" value={form.addr} onChangeText={update("addr")} />
                <Text style={s.label}>상세주소</Text>
                <TextInput style={s.inp} placeholder="상세주소 입력" value={form.addrDtl} onChangeText={update("addrDtl")} />
                <Text style={s.label}>관리자 아이디</Text>
                <TextInput style={s.inp} placeholder="로그인에 사용할 아이디" value={form.adminId} onChangeText={update("adminId")} autoCapitalize="none" />
                <Text style={s.label}>비밀번호</Text>
                <TextInput style={s.inp} placeholder="8자 이상" value={form.password} onChangeText={update("password")} secureTextEntry />
                <Text style={s.label}>비밀번호 확인</Text>
                <TextInput style={s.inp} placeholder="비밀번호 재입력" value={form.passwordConfirm} onChangeText={update("passwordConfirm")} secureTextEntry />

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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const local = StyleSheet.create({
  ntsResultBox: { backgroundColor: "#f0f9ff", borderWidth: 1, borderColor: "#7dd3fc", borderRadius: 12, padding: 12, marginBottom: 16 },
  ntsResultText: { fontSize: 15, color: "#0369a1", fontWeight: "600" },
  certPickBtn: { borderWidth: 1.5, borderColor: "#1d3557", borderStyle: "dashed", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16 },
  certPickBtnText: { fontSize: 16, fontWeight: "700", color: "#1d3557" },
  doneText: { fontSize: 17, color: "#334155", textAlign: "center", lineHeight: 26, marginBottom: 20 },
});
