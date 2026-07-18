import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1.5"], marginBottom: spacing["1.5"], gap: spacing["1.5"] },
  label: { fontSize: font.xs, fontWeight: "700", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: font.md, fontWeight: "600", color: colors.white, fontFamily: Platform.OS === "web" ? "monospace" : undefined },
  valueBold: { fontWeight: "900", color: colors.accent },
});
