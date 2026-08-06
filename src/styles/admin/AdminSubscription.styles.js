import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  sub: { fontSize: font.md, color: colors.textMuted, marginTop: spacing["1"], marginBottom: spacing["4"] },

  scrollBody: { paddingBottom: spacing["10"] },

  planCard: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.slate300, padding: spacing["5"] },
  planHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { fontSize: font["6xl"], fontWeight: "900", color: colors.text },
  planBadge: { backgroundColor: colors.greenTagBg, borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 4 },
  planBadgeText: { fontSize: font.sm, fontWeight: "800", color: colors.greenTagText },

  planPrice: { fontSize: font.hero, fontWeight: "900", color: colors.primary, marginTop: spacing["3"] },
  planPriceUnit: { fontSize: font.lg, fontWeight: "700", color: colors.textMuted },
  planCycle: { fontSize: font.md, color: colors.textMuted, marginTop: spacing["1"] },

  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing["4"] },

  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing["2"] },
  infoKey: { fontSize: font.md, color: colors.textGray },
  infoVal: { fontSize: font.md, fontWeight: "700", color: colors.text },

  payBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing["3"], alignItems: "center", marginTop: spacing["4"], outlineStyle: "none" },
  payBtnText: { fontSize: font.lg, fontWeight: "800", color: colors.white },

  noticeBox: { backgroundColor: colors.slate50, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing["3"], marginTop: spacing["4"] },
  noticeText: { fontSize: font.base, color: colors.textMuted },

  cancelSubBtn: { borderWidth: 1.5, borderColor: colors.red, borderRadius: radius.md, paddingVertical: spacing["3"], alignItems: "center", marginTop: spacing["4"], outlineStyle: "none" },
  cancelSubBtnText: { fontSize: font.lg, fontWeight: "800", color: colors.red },

  sectionTitle: { fontSize: font.xl, fontWeight: "900", color: colors.text, marginTop: spacing["6"], marginBottom: spacing["2.5"] },

  planOptionCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate300, padding: spacing["4"], marginBottom: spacing["2.5"] },
  planOptionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planOptionName: { fontSize: font.xl, fontWeight: "900", color: colors.text },
  planOptionPrice: { fontSize: font.xl, fontWeight: "900", color: colors.primary },
  planOptionFeatures: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"], marginTop: spacing["2"] },
  planOptionFeature: { fontSize: font.sm, fontWeight: "700", color: colors.textGray, backgroundColor: colors.slate100, borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 4 },

  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing["3"], marginBottom: spacing["2"] },
  paymentPeriod: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  paymentPlan: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  paymentAmount: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  paymentStatus: { fontSize: font.sm, fontWeight: "700", color: colors.greenTagText, marginTop: 2 },
  paymentStatusFail: { color: colors.red },
});
