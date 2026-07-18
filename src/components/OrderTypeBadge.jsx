import { View, Text } from "react-native";
import { s } from "../styles/OrderTypeBadge.styles";

// 매장주문/포장주문 표시를 색상 원형 아이콘 + 라벨로 통일해서 보여주는 공통 컴포넌트.
// coloredText=false면 라벨 색은 건드리지 않고(예: 어두운 배경 위 흰 글씨) 아이콘만 색칠함.
export default function OrderTypeBadge({ isTakeout, textStyle, coloredText = true, iconSize = 16 }) {
  return (
    <View style={s.row}>
      <View style={[s.iconWrap, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }, isTakeout ? s.iconTakeout : s.iconDineIn]}>
        <Text style={[s.iconText, { fontSize: iconSize * 0.55 }]}>{isTakeout ? "📦" : "🍽️"}</Text>
      </View>
      <Text style={[textStyle, coloredText && (isTakeout ? s.labelTakeout : s.labelDineIn)]}>
        {isTakeout ? "포장주문" : "매장주문"}
      </Text>
    </View>
  );
}
