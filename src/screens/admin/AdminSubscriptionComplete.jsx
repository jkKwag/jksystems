import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { s } from "../../styles/admin/AdminSubscriptionComplete.styles";
import api from "../../lib/api";

// 토스페이먼츠 카드 등록(빌링 인증) 위젯이 끝나면 이 화면으로 돌아온다.
// 성공 시 authKey/customerKey가, 실패 시 code/message가 쿼리스트링에 실려 온다.
const getParams = () => {
  if (Platform.OS !== "web") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    planCd: p.get("planCd"),
    authKey: p.get("authKey"),
    customerKey: p.get("customerKey"),
    failCode: p.get("code"),
    failMessage: p.get("message"),
  };
};

export default function AdminSubscriptionComplete() {
  const { planCd, authKey, customerKey, failCode, failMessage } = getParams();
  const [status, setStatus] = useState("processing"); // processing | done | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (failCode) {
      setStatus("error");
      setErrorMsg(failMessage || "카드 등록이 취소되었습니다.");
      return;
    }
    if (!planCd || !authKey || !customerKey) {
      setStatus("error");
      setErrorMsg("구독 인증 정보가 올바르지 않습니다.");
      return;
    }
    (async () => {
      const adminInfoRaw = await AsyncStorage.getItem("adminInfo");
      const adminInfo = adminInfoRaw ? JSON.parse(adminInfoRaw) : null;
      if (!adminInfo?.bizRegNo) {
        setStatus("error");
        setErrorMsg("로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }
      const { data, error } = await api.biz.startSubscription(adminInfo.bizRegNo, { planCd, authKey, customerKey });
      if (error || !data) {
        setStatus("error");
        setErrorMsg(error?.message || "구독 등록에 실패했습니다.");
        return;
      }
      setStatus("done");
    })();
  }, []);

  const goHome = () => { if (Platform.OS === "web") window.location.href = "/"; };

  if (status === "processing") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={[s.desc, { marginTop: 16 }]}>구독 등록 처리 중입니다…</Text>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={s.container}>
        <View style={s.card}>
          <Text style={s.icon}>⚠️</Text>
          <Text style={s.title}>구독 등록 실패</Text>
          <Text style={s.desc}>{errorMsg}</Text>
          <TouchableOpacity style={s.btn} onPress={goHome}>
            <Text style={s.btnText}>관리자 홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>✅</Text>
        <Text style={s.title}>구독 등록 완료</Text>
        <Text style={s.desc}>카드 등록과 첫 구독료 결제가 완료됐어요.</Text>
        <TouchableOpacity style={s.btn} onPress={goHome}>
          <Text style={s.btnText}>관리자 홈으로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
