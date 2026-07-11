import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { width: "100%", maxWidth: 400, borderRadius: radius["4xl"], overflow: "hidden", backgroundColor: colors.bgCard },
  header: { backgroundColor: "#1d3557", padding: spacing["8"], alignItems: "center" },
  icon: { fontSize: 44, marginBottom: spacing["3"] },
  title: { fontSize: font["7xl"], fontWeight: "800", color: colors.white, marginBottom: spacing["1.5"] },
  sub: { fontSize: font.md, color: "rgba(255,255,255,0.75)" },
  body: { padding: spacing["6"] },
  label: { fontSize: font.base, fontWeight: "700", color: colors.textSecondary, marginBottom: spacing["1.5"] },
  inp: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing["3"], fontSize: font.lg, backgroundColor: "#f9fafb", marginBottom: spacing["3.5"] },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: radius.md, padding: spacing["2.5"], marginBottom: spacing["3.5"] },
  errorText: { fontSize: font.md, color: colors.redDark },
  loginBtn: { backgroundColor: "#1d3557", borderRadius: radius.lg, padding: spacing["3.5"], alignItems: "center", marginBottom: spacing["2.5"] },
  loginBtnText: { color: colors.white, fontWeight: "700", fontSize: font.xl },
  cancelBtn: { backgroundColor: colors.slate100, borderRadius: radius.lg, padding: spacing["3"], alignItems: "center" },
  cancelBtnText: { color: "#6b7280", fontWeight: "600", fontSize: font.lg },
});
