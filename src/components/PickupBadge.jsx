import { View, Text } from "react-native";
import { s } from "../styles/PickupBadge.styles";

// 픽업번호/예약번호 형식: (R)yyMMdd-##### — 뒤 5자리(랜덤 부분)만 굵게 표시
export default function PickupBadge({ pickupNo, no, label = "픽업번호" }) {
  const value = no || pickupNo;
  if (!value) return null;
  const [datePart, numPart] = value.split("-");

  return (
    <View style={s.badge}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>
        {datePart}-<Text style={s.valueBold}>{numPart}</Text>
      </Text>
    </View>
  );
}
