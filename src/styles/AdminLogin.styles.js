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

  ghostLink: { alignItems: "center", padding: spacing["2"] },
  ghostLinkText: { color: "#6b7280", fontWeight: "600", fontSize: font.md, textDecorationLine: "underline" },
  backLink: { alignSelf: "flex-start", padding: 0, marginBottom: spacing["4"] },
  backLinkText: { color: "#6b7280", fontWeight: "700", fontSize: font.base },
  rememberedHint: { fontSize: font.base, color: colors.green, marginTop: -spacing["2"], marginBottom: spacing["3"] },
  rememberedHintLink: { color: "#6b7280", textDecorationLine: "underline" },

  passkeyStage: { alignItems: "center", justifyContent: "center", paddingVertical: spacing["4"] },
  fpCircle: { width: 84, height: 84, borderRadius: radius.round, backgroundColor: "#eef2ff", borderWidth: 2, borderColor: "#c7d2fe", alignItems: "center", justifyContent: "center", marginBottom: spacing["4"] },
  fpCircleScanning: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  fpCircleError: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  fpIcon: { fontSize: 36 },
  passkeyTitle: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: spacing["1"] },
  passkeyDesc: { fontSize: font.base, color: colors.textMuted, textAlign: "center", marginBottom: spacing["5"], lineHeight: 18 },

  kakaoBtn: { backgroundColor: "#FEE500", borderRadius: radius.lg, padding: spacing["3.5"], flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing["1.5"], marginBottom: spacing["3.5"] },
  kakaoBtnText: { color: "#191919", fontWeight: "700", fontSize: font.xl },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], marginBottom: spacing["3.5"] },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: font.base, color: colors.textSubtle },
});
