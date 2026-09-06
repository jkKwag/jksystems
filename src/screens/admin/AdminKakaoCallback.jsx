import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { s } from "../../styles/admin/AdminSubscriptionComplete.styles";
import { s as loginStyles } from "../../styles/AdminLogin.styles";
import api from "../../lib/api";

const digitsOnly = (v) => v.replace(/\D/g, "");

// 카카오 인가코드를 받아서 돌아오는 화면 (카카오 디벨로퍼스에 등록해둔 Redirect URI).
// 이미 연동된 계정이면 그대로 로그인 완료, 처음 보는 카카오 계정이면 사업자등록번호/
// 휴대폰번호만 마저 입력받아 가입을 끝낸다.
const getCode = () => {
  if (Platform.OS !== "web") return { code: null, kakaoError: null };
  const p = new URLSearchParams(window.location.search);
  return { code: p.get("code"), kakaoError: p.get("error") };
};

async function completeLogin(loginData) {
  await AsyncStorage.setItem("isAdmin", "true");
  await AsyncStorage.setItem("adminInfo", JSON.stringify(loginData));
  if (loginData?.token) await AsyncStorage.setItem("adminToken", loginData.token);
  window.location.href = "/";
}

export default function AdminKakaoCallback() {
  const { code, kakaoError } = getCode();
  const [status, setStatus] = useState("processing"); // processing | signupForm | error
  const [errorMsg, setErrorMsg] = useState("");
  const [signupInfo, setSignupInfo] = useState(null); // { signupToken, nickname }
  const [bizRegNo, setBizRegNo] = useState("");
  const [mobileTel, setMobileTel] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (kakaoError) {
      setStatus("error");
      setErrorMsg("카카오 로그인이 취소되었습니다.");
      return;
    }
    if (!code) {
      setStatus("error");
      setErrorMsg("카카오 인증 정보가 올바르지 않습니다.");
      return;
    }
    (async () => {
      const { data, error } = await api.kakao.exchange(code);
      if (error || !data) {
        setStatus("error");
        setErrorMsg(error?.message || "카카오 인증에 실패했습니다.");
        return;
      }
      if (data.loggedIn) {
        await completeLogin(data.login);
        return;
      }
      setSignupInfo({ signupToken: data.signupToken, nickname: data.nickname });
      setStatus("signupForm");
    })();
  }, []);

  const goHome = () => { if (Platform.OS === "web") window.location.href = "/"; };

  const submitSignup = async () => {
    if (digitsOnly(bizRegNo).length !== 10) { setFormError("사업자등록번호는 숫자 10자리여야 합니다."); return; }
    if (!/^01[0-9]{8,9}$/.test(mobileTel.trim())) { setFormError("휴대폰번호 형식이 올바르지 않습니다. (예: 01012345678)"); return; }

    setSubmitting(true); setFormError("");
    const { data, error } = await api.kakao.signup({
      signupToken: signupInfo.signupToken,
      bizRegNo: digitsOnly(bizRegNo),
      mobileTel: mobileTel.trim(),
    });
    setSubmitting(false);
    if (error || !data) { setFormError(error?.message || "가입에 실패했습니다."); return; }
    await completeLogin(data);
  };

  if (status === "processing") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={[s.desc, { marginTop: 16 }]}>카카오 인증 확인 중입니다…</Text>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <Text style={s.icon}>⚠️</Text>
          <Text style={s.title}>카카오 로그인 실패</Text>
          <Text style={s.desc}>{errorMsg}</Text>
          <TouchableOpacity style={s.btn} onPress={goHome}>
            <Text style={s.btnText}>처음으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>💬</Text>
        <Text style={s.title}>사업자 정보 입력</Text>
        <Text style={s.desc}>카카오 인증 완료 · {signupInfo?.nickname || "회원"}님{"\n"}사업자 정보만 입력하면 가입이 끝나요.</Text>

        <View style={{ width: "100%" }}>
          <Text style={loginStyles.label}>사업자등록번호</Text>
          <TextInput
            style={loginStyles.inp}
            placeholder="숫자만 입력"
            keyboardType="numeric"
            maxLength={10}
            value={bizRegNo}
            onChangeText={(v) => setBizRegNo(digitsOnly(v).slice(0, 10))}
          />
          <Text style={loginStyles.label}>휴대폰번호</Text>
          <TextInput
            style={loginStyles.inp}
            placeholder="숫자만 입력 (예: 01012345678)"
            keyboardType="numeric"
            maxLength={11}
            value={mobileTel}
            onChangeText={(v) => setMobileTel(digitsOnly(v).slice(0, 11))}
          />
          {!!formError && <View style={loginStyles.errorBox}><Text style={loginStyles.errorText}>⚠️ {formError}</Text></View>}
          <TouchableOpacity style={[s.btn, { opacity: submitting ? 0.7 : 1 }]} onPress={submitSignup} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>가입 완료</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
