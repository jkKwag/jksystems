import { View, Text } from "react-native";
import { s } from "../styles/PickupBadge.styles";

// 픽업번호(pickupNo) 형식: yyMMdd-##### — 뒤 5자리(랜덤 부분)만 굵게 표시
export default function PickupBadge({ pickupNo }) {
  if (!pickupNo) return null;
  const [datePart, numPart] = pickupNo.split("-");

  return (
    <View style={s.badge}>
      <Text style={s.label}>픽업번호</Text>
      <Text style={s.value}>
        {datePart}-<Text style={s.valueBold}>{numPart}</Text>
      </Text>
    </View>
  );
}
