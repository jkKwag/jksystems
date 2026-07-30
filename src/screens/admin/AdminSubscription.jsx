import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { s } from "../../styles/admin/AdminSubscription.styles";
import ConfirmModal from "../../components/ConfirmModal";

// TODO: 요금제/결제수단/다음 결제일은 아직 DB·API가 없어서 화면 틀만 잡아둔 상태 — 연동 시 실제 값으로 교체할 것.
const PLAN = {
  name: "Basic 요금제",
  price: "00,000원",
  cycle: "매월 자동 결제",
};

export default function AdminSubscription() {
  const [alertMsg, setAlertMsg] = useState(null);

  return (
    <View style={s.container}>
      <Text style={s.title}>구독료 결제</Text>
      <Text style={s.sub}>Scaneat 서비스 이용을 위한 구독료를 확인하고 결제할 수 있습니다.</Text>

      <ScrollView contentContainerStyle={s.scrollBody}>
        <View style={s.planCard}>
          <View style={s.planHeaderRow}>
            <Text style={s.planName}>{PLAN.name}</Text>
            <View style={s.planBadge}><Text style={s.planBadgeText}>이용중</Text></View>
          </View>
          <Text style={s.planPrice}>{PLAN.price}<Text style={s.planPriceUnit}> / 월</Text></Text>
          <Text style={s.planCycle}>{PLAN.cycle}</Text>

          <View style={s.divider} />

          <View style={s.infoRow}>
            <Text style={s.infoKey}>다음 결제 예정일</Text>
            <Text style={s.infoVal}>-</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoKey}>등록된 결제 수단</Text>
            <Text style={s.infoVal}>등록된 카드가 없습니다</Text>
          </View>

          <TouchableOpacity style={s.payBtn} onPress={() => setAlertMsg("결제 기능은 준비 중입니다. 곧 연동될 예정이에요.")}>
            <Text style={s.payBtnText}>결제하기</Text>
          </TouchableOpacity>
        </View>

        <View style={s.noticeBox}>
          <Text style={s.noticeText}>💡 결제 내역 조회, 결제수단 변경 등의 기능은 준비 중입니다.</Text>
        </View>
      </ScrollView>

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
