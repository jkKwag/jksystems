import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerBtnRow: { flexDirection: "row", gap: spacing["2"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  addBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
  hintText: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing["1"], marginBottom: spacing["3"] },

  catFilterBox: { backgroundColor: colors.slate200, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate300, padding: spacing["3.5"], marginBottom: spacing["4"] },
  catFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  catChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.bgCard },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  catChipTextActive: { color: colors.white },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { flexDirection: "row", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["3.5"], gap: spacing["3"], borderWidth: 1, borderColor: colors.border, alignItems: "center" },

  thumb: { width: 64, height: 64, borderRadius: radius.lg },
  thumbEmpty: { backgroundColor: colors.slate100, justifyContent: "center", alignItems: "center" },
  thumbEmptyText: { fontSize: 9, fontWeight: "700", color: colors.slate400, textAlign: "center" },

  cardInfo: { flex: 1, gap: 2 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"], flexWrap: "wrap" },
  menuNm: { fontSize: font.xl, fontWeight: "800", color: colors.text, flexShrink: 1 },
  cat: { fontSize: font.sm, color: colors.textMuted, fontWeight: "600" },
  desc: { fontSize: font.sm, color: colors.textMuted },
  price: { fontSize: font.lg, fontWeight: "800", color: colors.accent, marginTop: 2 },

  offBadge: { backgroundColor: colors.slate200, borderRadius: radius.sm, paddingHorizontal: spacing["1.5"], paddingVertical: 2 },
  offBadgeText: { fontSize: font.xs, fontWeight: "700", color: colors.textGray },
  badgeChip: { backgroundColor: colors.accentLight, borderRadius: radius.sm, paddingHorizontal: spacing["1.5"], paddingVertical: 2 },
  badgeChipText: { fontSize: font.xs, fontWeight: "700", color: colors.accent },

  cardActions: { gap: spacing["1.5"] },
  actionBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1.5"], alignItems: "center" },
  actionBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  deleteBtn: { borderColor: "#ef4444" },
  deleteBtnText: { color: "#ef4444" },
});
