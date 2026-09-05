import { View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const GRADIENT_COLORS = ["#0f172a", "#14532d"];

// 헤더 등에 쓰는 남색→초록 대각선 그라디언트 배경. 웹은 CSS background로 렌더링하고,
// 네이티브(RN)는 CSS linear-gradient가 없어서 expo-linear-gradient로 대신 그린다.
export default function GradientHeader({ style, children }) {
  if (Platform.OS === "web") {
    return (
      <View style={[style, { background: `linear-gradient(135deg, ${GRADIENT_COLORS[0]} 0%, ${GRADIENT_COLORS[1]} 100%)` }]}>
        {children}
      </View>
    );
  }
  return (
    <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}
