import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], outlineStyle: "none" },
  refreshBtnText: { fontSize: font.md },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted },

  list: { gap: spacing["3.5"], paddingBottom: spacing["10"] },

  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.slate300, padding: spacing["4"], gap: spacing["3"] },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing["2"] },
  bizNm: { fontSize: font.xl, fontWeight: "900", color: colors.text },
  bizRegNo: { fontSize: font.sm, color: colors.textGray },
  repNm: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },

  ntsBadge: { borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 4, borderWidth: 1 },
  ntsBadgeOk: { backgroundColor: "#dcfce7", borderColor: "#4ade80" },
  ntsBadgeWarn: { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
  ntsBadgeUnknown: { backgroundColor: colors.slate100, borderColor: colors.slate300 },
  ntsBadgeText: { fontSize: font.sm, fontWeight: "800" },
  ntsBadgeTextOk: { color: "#15803d" },
  ntsBadgeTextWarn: { color: "#92400e" },
  ntsBadgeTextUnknown: { color: colors.textGray },

  detailRow: { flexDirection: "row", gap: spacing["1"] },
  detailKey: { fontSize: font.sm, color: colors.textMuted, width: 70 },
  detailVal: { flex: 1, fontSize: font.sm, color: colors.text, fontWeight: "600" },

  certImage: { width: "100%", height: 220, borderRadius: radius.lg, backgroundColor: colors.slate100 },
  certMissing: { fontSize: font.sm, color: colors.textMuted, fontStyle: "italic" },

  btnRow: { flexDirection: "row", gap: spacing["2.5"] },
  approveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center", outlineStyle: "none" },
  approveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderColor: "#ef4444", borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center", outlineStyle: "none" },
  rejectBtnText: { fontSize: font.md, fontWeight: "800", color: "#ef4444" },

  rejectOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: spacing["4"] },
  rejectCard: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["5"], width: 340, gap: spacing["3"] },
  rejectTitle: { fontSize: font.xl, fontWeight: "900", color: colors.text },
  rejectInput: { borderWidth: 1, borderColor: colors.slate300, borderRadius: radius.lg, padding: spacing["3"], fontSize: font.md, minHeight: 80, textAlignVertical: "top" },
});
