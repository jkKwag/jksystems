import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const faqs = [
  { q: "캠핑카 운전 면허가 필요한가요?", a: "일반 1종 보통 또는 2종 보통 면허로 운전 가능합니다. 차량 크기에 따라 다를 수 있으니 예약 시 확인해 주세요." },
  { q: "반려동물 동반이 가능한가요?", a: "일부 차량은 반려동물 동반이 가능합니다. 예약 시 반려동물 동반 여부를 미리 알려주시면 안내해 드리겠습니다." },
  { q: "취소 및 환불 정책이 어떻게 되나요?", a: "이용일 7일 전 취소 시 전액 환불, 3~6일 전 50% 환불, 2일 이내 취소 시 환불 불가합니다." },
  { q: "캠핑카 내부 시설이 어떻게 되나요?", a: "침대, 주방, 화장실, 샤워실, 냉난방 시설이 기본으로 제공됩니다. 차량마다 시설이 다를 수 있으니 상세 페이지를 확인해 주세요." },
  { q: "연료는 어떻게 처리하나요?", a: "반납 시 출발 시와 동일한 연료량으로 반납해 주셔야 합니다. 부족할 경우 추가 요금이 발생합니다." },
  { q: "픽업 및 반납 장소가 어디인가요?", a: "서울 강남구 본사에서 픽업 및 반납이 가능합니다. 원하시는 장소로 딜리버리 서비스도 제공합니다(추가 요금)." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>FAQ</Text>
      <Text style={s.desc}>자주 묻는 질문들을 모아놓았습니다.</Text>
      {faqs.map((f, i) => (
        <View key={i} style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => setOpen(open === i ? null : i)}>
            <Text style={s.question}>{f.q}</Text>
            <Text style={s.arrow}>{open === i ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {open === i && <Text style={s.answer}>{f.a}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7f0" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "#1b4332", marginBottom: 4 },
  desc: { fontSize: 13, color: "#52796f", marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 11, marginBottom: 8, overflow: "hidden", borderWidth: 1, borderColor: "#d8f3dc" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  question: { fontSize: 14, fontWeight: "600", color: "#1b4332", flex: 1, marginRight: 10 },
  arrow: { fontSize: 12, color: "#74c69d" },
  answer: { padding: 15, paddingTop: 0, fontSize: 14, color: "#52796f", lineHeight: 22, borderTopWidth: 1, borderTopColor: "#d8f3dc" },
});
