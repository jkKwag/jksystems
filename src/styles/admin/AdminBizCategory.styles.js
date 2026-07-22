import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerBtnRow: { flexDirection: "row", gap: spacing["2"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.textGray, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  addBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  addBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
  hintText: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing["1"], marginBottom: spacing["3"] },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { flexDirection: "row", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["3.5"], gap: spacing["3"], borderWidth: 1, borderColor: colors.border, alignItems: "center" },

  cardInfo: { flex: 1, gap: 2 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"], flexWrap: "wrap" },
  catNm: { fontSize: font.xl, fontWeight: "800", color: colors.text, flexShrink: 1 },
  catCdText: { fontSize: font.sm, color: colors.textMuted, fontWeight: "600" },
  rmrk: { fontSize: font.sm, color: colors.textMuted },

  offBadge: { backgroundColor: colors.slate200, borderRadius: radius.sm, paddingHorizontal: spacing["1.5"], paddingVertical: 2 },
  offBadgeText: { fontSize: font.xs, fontWeight: "700", color: colors.textGray },

  cardActions: { gap: spacing["1.5"] },
  sortBtnRow: { flexDirection: "row", gap: spacing["1"], justifyContent: "center" },
  sortBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: spacing["1"], alignItems: "center" },
  sortBtnDisabled: { opacity: 0.35 },
  sortBtnText: { fontSize: font.sm, fontWeight: "800", color: colors.textGray },
  sortOrdText: { fontSize: font.sm, fontWeight: "800", color: colors.text, textAlign: "center" },
  actionBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1.5"], alignItems: "center" },
  actionBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  deleteBtn: { borderColor: "#ef4444" },
  deleteBtnText: { color: "#ef4444" },
});
