import { View, Text, StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../styles/theme";

// 지금은 안 쓰지만 나중에 다시 쓸 수도 있는 화면 상단에 붙여서, 화면을 밀어내리지 않고 그 위에 떠 있게 표시한다.
export default function NotInUseBanner() {
  return (
    <View style={s.banner} pointerEvents="none">
      <Text style={s.text}>현재는 안씀</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
    paddingVertical: spacing["3"],
    backgroundColor: colors.amberPaleBg,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.amber,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  text: {
    fontSize: font["6xl"],
    fontWeight: "900",
    color: colors.amberDark,
    letterSpacing: 0.3,
  },
});
