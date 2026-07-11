import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase, justifyContent: "center", alignItems: "center", padding: spacing["6"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["4xl"], padding: spacing["8"], width: "100%", maxWidth: 400, alignItems: "center", shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  icon: { fontSize: font.hero, marginBottom: spacing["3"] },
  title: { fontSize: font["8xl"], fontWeight: "900", color: colors.primary, marginBottom: spacing["1.5"] },
  desc: { fontSize: font.lg, color: colors.slate500, marginBottom: spacing["6"] },
  infoBox: { width: "100%", backgroundColor: colors.bgBase, borderRadius: radius.xl, padding: spacing["4"], gap: spacing["2.5"], marginBottom: spacing["4"] },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: font.md, color: colors.slate400, fontWeight: "600" },
  rowValue: { fontSize: font.md, color: colors.primary, fontWeight: "700", maxWidth: "65%", textAlign: "right" },
  rowMono: { fontFamily: Platform.OS === "web" ? "monospace" : undefined, fontSize: font.sm },
  notice: { backgroundColor: colors.accentLight, borderRadius: radius.md, paddingHorizontal: radius.xl, paddingVertical: spacing["2.5"], marginBottom: spacing["6"], width: "100%" },
  noticeText: { fontSize: font.base, color: colors.accent, fontWeight: "600", textAlign: "center" },
  btn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: spacing["8"], paddingVertical: spacing["3.5"], width: "100%", alignItems: "center" },
  btnText: { color: colors.white, fontSize: font.xl, fontWeight: "800" },
});
