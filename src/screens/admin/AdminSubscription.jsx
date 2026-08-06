import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { s } from "../../styles/admin/AdminSubscription.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || "test_ck_vZnjEJeQVxexx5pMqG4brPmOoBN0";

const won = (n) => (typeof n === "number" ? n.toLocaleString() : "0") + "원";

export default function AdminSubscription({ adminInfo }) {
  const bizno = adminInfo?.bizRegNo;

  const [plans, setPlans] = useState([]);
  const [subspt, setSubspt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [submittingPlanCd, setSubmittingPlanCd] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    const [planList, sub, pays] = await Promise.all([
      api.biz.subscriptionPlans(),
      bizno ? api.biz.getSubscription(bizno) : Promise.resolve(null),
      bizno ? api.biz.subscriptionPayments(bizno) : Promise.resolve(null),
    ]);
    setPlans(Array.isArray(planList) ? planList : []);
    setSubspt(sub || null);
    setPayments(Array.isArray(pays) ? pays : []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizno]);

  // 카드 등록(빌링 인증) 위젯으로 넘어갔다가 /admin/subscription-complete로 돌아오면
  // 거기서 최초 결제까지 끝내고 오므로, 여기서는 위젯을 띄우기만 하면 된다.
  const startBillingAuth = async (planCd) => {
    if (!bizno || Platform.OS !== "web") return;
    if (!TOSS_CLIENT_KEY) { setAlertMsg("토스 클라이언트 키가 없습니다 (EXPO_PUBLIC_TOSS_CLIENT_KEY)"); return; }
    setSubmittingPlanCd(planCd);
    try {
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: bizno });
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: window.location.origin + `/admin/subscription-complete?planCd=${planCd}`,
        failUrl: window.location.origin + `/admin/subscription-complete`,
      });
    } catch (e) {
      if (e?.code !== "USER_CANCEL") {
        setAlertMsg(`[구독 등록 오류] ${e?.message || JSON.stringify(e)}`);
      }
    } finally {
      setSubmittingPlanCd(null);
    }
  };

  const handleCancel = async () => {
    if (!bizno) return;
    setCanceling(true);
    const { error } = await api.biz.cancelSubscription(bizno);
    setCanceling(false);
    if (error) { setAlertMsg(error?.message || "구독 해지에 실패했습니다."); return; }
    setAlertMsg("구독이 해지되었습니다.");
    load();
  };

  if (!loaded) {
    return (
      <View style={s.container}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      </View>
    );
  }

  const isActive = subspt?.status === "ACTIVE";

  return (
    <View style={s.container}>
      <Text style={s.title}>구독료 결제</Text>
      <Text style={s.sub}>JK Scaneat 서비스 이용을 위한 구독료를 확인하고 결제할 수 있습니다.</Text>

      <ScrollView contentContainerStyle={s.scrollBody}>
        {isActive && (
          <View style={s.planCard}>
            <View style={s.planHeaderRow}>
              <Text style={s.planName}>{subspt.planNm}</Text>
              <View style={s.planBadge}><Text style={s.planBadgeText}>이용중</Text></View>
            </View>
            <Text style={s.planPrice}>{won(subspt.totalAmount)}<Text style={s.planPriceUnit}> / 월</Text></Text>
            <Text style={s.planCycle}>공급가액 {won(subspt.suppliedAmount)} + 부가세 {won(subspt.vat)}</Text>

            <View style={s.divider} />

            <View style={s.infoRow}>
              <Text style={s.infoKey}>다음 결제 예정일</Text>
              <Text style={s.infoVal}>{subspt.nextBillingDt || "-"}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>등록된 결제 수단</Text>
              <Text style={s.infoVal}>{subspt.hasBillingKey ? "카드 등록됨" : "등록된 카드가 없습니다"}</Text>
            </View>

            <TouchableOpacity style={s.cancelSubBtn} onPress={handleCancel} disabled={canceling}>
              <Text style={s.cancelSubBtnText}>구독 해지</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isActive && (
          <View style={s.noticeBox}>
            <Text style={s.noticeText}>
              {subspt ? "구독이 해지된 상태입니다. 아래에서 요금제를 다시 선택해 구독을 시작하세요." : "아직 구독 중인 요금제가 없어요. 아래에서 요금제를 선택해주세요."}
            </Text>
          </View>
        )}

        <Text style={s.sectionTitle}>{isActive ? "요금제 변경" : "요금제 선택"}</Text>
        {plans.map(plan => {
          const isCurrent = isActive && subspt.planCd === plan.planCd;
          const isSubmittingThis = submittingPlanCd === plan.planCd;
          return (
            <View key={plan.planCd} style={s.planOptionCard}>
              <View style={s.planOptionHeaderRow}>
                <Text style={s.planOptionName}>{plan.planNm}</Text>
                <Text style={s.planOptionPrice}>{won(plan.totalAmount)}/월</Text>
              </View>
              <View style={s.planOptionFeatures}>
                {plan.dineIn && <Text style={s.planOptionFeature}>🍽 매장주문</Text>}
                {plan.takeout && <Text style={s.planOptionFeature}>📦 포장주문</Text>}
                {plan.delivery && <Text style={s.planOptionFeature}>🛵 배달주문</Text>}
              </View>
              <TouchableOpacity
                style={s.payBtn}
                onPress={() => startBillingAuth(plan.planCd)}
                disabled={!!submittingPlanCd || isCurrent}
              >
                <Text style={s.payBtnText}>
                  {isCurrent ? "현재 이용중" : isSubmittingThis ? "처리 중..." : "이 요금제로 시작"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {payments.length > 0 && (
          <>
            <Text style={s.sectionTitle}>결제 내역</Text>
            {payments.map(p => (
              <View key={p.paymentKey} style={s.paymentRow}>
                <View>
                  <Text style={s.paymentPeriod}>{p.billingPeriod}</Text>
                  <Text style={s.paymentPlan}>{p.planCd}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.paymentAmount}>{won(p.totalAmount)}</Text>
                  <Text style={[s.paymentStatus, p.status !== "DONE" && s.paymentStatusFail]}>{p.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
