import { View, Text } from "react-native";
import { s } from "../styles/RsvnBadge.styles";

// 픽업번호(rsvnNo) 형식: yyMMdd-##### — 뒤 5자리(랜덤 부분)만 굵게 표시
export default function RsvnBadge({ rsvnNo }) {
  if (!rsvnNo) return null;
  const [datePart, numPart] = rsvnNo.split("-");

  return (
    <View style={s.badge}>
      <Text style={s.label}>픽업번호</Text>
      <Text style={s.value}>
        {datePart}-<Text style={s.valueBold}>{numPart}</Text>
      </Text>
    </View>
  );
}
