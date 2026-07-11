import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase, overflow: "hidden" },
  content: { padding: spacing["4"], paddingBottom: spacing["10"] },

  summaryCard: { backgroundColor: colors.text, borderRadius: radius["2xl"], padding: spacing["5"], flexDirection: "row", alignItems: "center", marginBottom: spacing["5"] },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: font["7xl"], fontWeight: "900", color: colors.accent, marginBottom: spacing["1"] },
  summaryLabel: { fontSize: font.base, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  summaryDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.15)" },

  sectionTitle: { fontSize: font.lg, fontWeight: "800", color: colors.textGray, marginBottom: spacing["3"], letterSpacing: 0.5 },

  addBtn: { borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.md, padding: spacing["3"], alignItems: "center", marginBottom: spacing["3"] },
  addBtnText: { color: colors.accent, fontWeight: "800", fontSize: font.lg },

  formCard: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing["3.5"], marginBottom: spacing["3.5"], gap: spacing["2"] },
  inp: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm, padding: spacing["2.5"], fontSize: font.md, backgroundColor: "#fafafa" },
  btn: { backgroundColor: colors.text, borderRadius: radius.sm, padding: spacing["3"], alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800", fontSize: font.md },

  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: font["2xl"], fontWeight: "700", color: colors.textLight, marginBottom: spacing["2"] },
  emptySubText: { fontSize: font.md, color: colors.textDisabled },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing["3.5"], flexDirection: "row", alignItems: "center", marginBottom: spacing["2"], gap: spacing["3"] },
  cardLeft: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgInput, justifyContent: "center", alignItems: "center" },
  rank: { fontSize: font.md, fontWeight: "900", color: colors.textGray },
  cardInfo: { flex: 1 },
  name: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: 2 },
  message: { fontSize: font.base, color: colors.textMuted, fontStyle: "italic", marginBottom: 2 },
  date: { fontSize: font.sm, color: colors.textFaint },
  amount: { fontSize: font["2xl"], fontWeight: "900", color: colors.accent },
});
