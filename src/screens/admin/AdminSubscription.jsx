import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { s } from "../../styles/admin/AdminSubscription.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || "test_ck_vZnjEJeQVxexx5pMqG4brPmOoBN0";

// 가입 시 상호명을 안 받은 사업자는 서버가 이 값으로 채워둔다 — 실제 값이 아니므로 "미입력"과 동일하게 취급한다.
const PLACEHOLDER_BIZ_NM = "사업장명 미입력";

const won = (n) => (typeof n === "number" ? n.toLocaleString() : "0") + "원";

export default function AdminSubscription({ adminInfo }) {
  const bizno = adminInfo?.bizRegNo;

  const [plans, setPlans] = useState([]);
  const [subspt, setSubspt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [biz, setBiz] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [submittingPlanCd, setSubmittingPlanCd] = useState(null);
  const [changingPlanCd, setChangingPlanCd] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmPlan, setConfirmPlan] = useState(null); // { planCd, planNm } | null — 최초 구독 시작 전 확인용
  const [confirmCancel, setConfirmCancel] = useState(false); // 구독 해지 전 확인용

  const load = async () => {
    const [planList, sub, pays, bizData] = await Promise.all([
      api.biz.subscriptionPlans(),
      bizno ? api.biz.getSubscription(bizno) : Promise.resolve(null),
      bizno ? api.biz.subscriptionPayments(bizno) : Promise.resolve(null),
      bizno ? api.biz.get(bizno) : Promise.resolve(null),
    ]);
    setPlans(Array.isArray(planList) ? planList : []);
    setSubspt(sub || null);
    setPayments(Array.isArray(pays) ? pays : []);
    setBiz(bizData || null);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizno]);

  const missingBizFields = [
    (!biz?.bizNm || biz.bizNm === PLACEHOLDER_BIZ_NM) && "상호",
    !biz?.repNm && "대표자",
    !biz?.addr && "주소",
    !biz?.telNo && "전화번호",
    !biz?.mobileTel && "핸드폰번호",
  ].filter(Boolean);

  // "이 요금제로 시작" 클릭 시 바로 위젯을 띄우지 않고, 사업장 정보부터 확인한 뒤 신청 확인 모달을 먼저 보여준다.
  const onStartPress = (plan) => {
    if (!bizno || Platform.OS !== "web") return;
    if (missingBizFields.length) {
      setAlertMsg(`사업장 정보 메뉴에서 저장 후 가능합니다\n${missingBizFields.map(f => `(${f})`).join(", ")}`);
      return;
    }
    setConfirmPlan(plan);
  };

  const confirmStart = () => {
    const plan = confirmPlan;
    setConfirmPlan(null);
    if (plan) startBillingAuth(plan.planCd);
  };

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

  // 이미 구독 중인 상태에서 요금제만 바꿀 때는 카드 재등록/즉시 결제 없이 예약만 한다.
  // 예약된 요금제를 다시 누르면(=현재 요금제로 되돌리면) 서버에서 예약이 자동 취소된다.
  const changePlan = async (planCd) => {
    if (!bizno) return;
    setChangingPlanCd(planCd);
    const { data, error } = await api.biz.changeSubscriptionPlan(bizno, planCd);
    setChangingPlanCd(null);
    if (error || !data) { setAlertMsg(error?.message || "요금제 변경에 실패했습니다."); return; }
    setSubspt(data);
    setAlertMsg(
      data.pendingPlanCd
        ? `다음 결제일(${data.nextBillingDt})부터 ${data.pendingPlanNm} 요금제로 변경됩니다.`
        : "요금제 변경 예약이 취소되었습니다."
    );
  };

  const handleCancel = async () => {
    if (!bizno) return;
    setConfirmCancel(false);
    setCanceling(true);
    const { data, error } = await api.biz.cancelSubscription(bizno);
    setCanceling(false);
    if (error) { setAlertMsg(error?.message || "구독 해지에 실패했습니다."); return; }
    const refundAmount = data?.refundAmount || 0;
    if (refundAmount > 0) {
      setAlertMsg(
        data.refundSucceeded
          ? `구독이 해지되었습니다.\n미사용 기간 ${won(refundAmount)}이 환불 처리되었습니다.`
          : `구독은 해지되었습니다.\n환불 처리 중 오류가 발생했습니다. 확인 후 처리해 드리겠습니다.`
      );
    } else {
      setAlertMsg("구독이 해지되었습니다.");
    }
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

            {subspt.pendingPlanCd && (
              <View style={s.pendingChangeBox}>
                <Text style={s.pendingChangeText}>
                  다음 결제일({subspt.nextBillingDt})부터 {subspt.pendingPlanNm} 요금제로 변경 예정
                </Text>
              </View>
            )}

            <View style={s.divider} />

            <View style={s.infoRow}>
              <Text style={s.infoKey}>다음 결제 예정일</Text>
              <Text style={s.infoVal}>{subspt.nextBillingDt || "-"}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>등록된 결제 수단</Text>
              <Text style={s.infoVal}>{subspt.hasBillingKey ? "카드 등록됨" : "등록된 카드가 없습니다"}</Text>
            </View>

            <TouchableOpacity style={s.cancelSubBtn} onPress={() => setConfirmCancel(true)} disabled={canceling}>
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
          const isPending = isActive && subspt.pendingPlanCd === plan.planCd;
          const isSubmittingThis = submittingPlanCd === plan.planCd;
          const isChangingThis = changingPlanCd === plan.planCd;
          const anyBusy = !!submittingPlanCd || !!changingPlanCd;

          const handlePress = () => (isActive ? changePlan(plan.planCd) : onStartPress(plan));

          let label = isActive ? "이 요금제로 변경" : "이 요금제로 시작";
          if (isCurrent) label = "현재 이용중";
          else if (isPending) label = isChangingThis ? "처리 중..." : "변경 예약됨 · 취소";
          else if (isSubmittingThis) label = "처리 중...";
          else if (isChangingThis) label = "처리 중...";

          return (
            <View key={plan.planCd} style={[s.planOptionCard, isPending && s.planOptionCardPending]}>
              <View style={s.planOptionHeaderRow}>
                <View style={s.planOptionNameRow}>
                  <Text style={s.planOptionName}>{plan.planNm}</Text>
                  {isPending && (
                    <View style={s.planOptionPendingBadge}>
                      <Text style={s.planOptionPendingBadgeText}>변경 예약됨</Text>
                    </View>
                  )}
                </View>
                <Text style={s.planOptionPrice}>{won(plan.totalAmount)}/월</Text>
              </View>
              <View style={s.planOptionFeatures}>
                {plan.dineIn && <Text style={s.planOptionFeature}>🍽 매장주문</Text>}
                {plan.takeout && <Text style={s.planOptionFeature}>📦 포장주문</Text>}
                {plan.delivery && <Text style={s.planOptionFeature}>🛵 배달주문</Text>}
              </View>
              <TouchableOpacity
                style={[s.payBtn, isPending && s.payBtnPending]}
                onPress={handlePress}
                disabled={anyBusy || isCurrent}
              >
                <Text style={[s.payBtnText, isPending && s.payBtnPendingText]}>{label}</Text>
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

      <ConfirmModal
        visible={!!confirmPlan}
        message={`${confirmPlan?.planNm} 요금제로 구독 신청 하시겠습니까?`}
        confirmText="신청"
        cancelText="취소"
        onConfirm={confirmStart}
        onCancel={() => setConfirmPlan(null)}
      />
      <ConfirmModal
        visible={confirmCancel}
        message="정말 구독 해지 하시겠습니까?"
        confirmText="해지"
        cancelText="취소"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
