import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  dateRangeRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], marginBottom: spacing["4"] },
  dateField: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2"], backgroundColor: colors.bgCard },
  dateFieldText: { fontSize: font.md, fontWeight: "700", color: colors.text },
  dateRangeSep: { fontSize: font.md, fontWeight: "700", color: colors.textMuted },

  statusFilterBox: { backgroundColor: colors.slate200, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate300, paddingHorizontal: spacing["3.5"], paddingVertical: 7, marginBottom: spacing["4"] },
  statusFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  statusChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.bgCard },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  statusChipTextActive: { color: colors.white },

  calOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  calBox: { width: "100%", maxWidth: 360, borderRadius: radius["2xl"], overflow: "hidden", backgroundColor: colors.slate800 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["4"], gap: spacing["1.5"], borderWidth: 1, borderColor: colors.border },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dt: { fontSize: font.xl, fontWeight: "900", color: colors.primary },
  meta: { fontSize: font.base, color: colors.textSecondary, fontWeight: "600" },
  memo: { fontSize: font.sm, color: colors.textMuted },
  rejectRsn: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },
  rsvnNoBadge: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2"], alignItems: "center", marginTop: spacing["1"] },
  rsvnNoBadgeText: { fontSize: font.md, fontWeight: "900", color: colors.accent, fontFamily: Platform.OS === "web" ? "monospace" : undefined },

  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 4 },
  statusBadgeText: { fontSize: font.sm, fontWeight: "800", color: colors.white },
  statusPending: { backgroundColor: "#f59e0b" },
  statusConfirmed: { backgroundColor: "#22c55e" },
  statusRejected: { backgroundColor: "#ef4444" },
  statusCancelled: { backgroundColor: "#94a3b8" },
  statusCompleted: { backgroundColor: "#64748b" },

  btnRow: { flexDirection: "row", gap: spacing["2.5"], marginTop: spacing["1"] },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: "#ef4444", borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  rejectBtnText: { fontSize: font.md, fontWeight: "800", color: "#ef4444" },
  approveBtn: { flex: 1, backgroundColor: colors.green, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  approveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
  completeBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  completeBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },

  rejectOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  rejectCard: { width: "100%", maxWidth: 380, backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["5"] },
  rejectTitle: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: spacing["3"] },
  rejectInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing["3"], minHeight: 80, textAlignVertical: "top", fontSize: font.md, color: colors.text, marginBottom: spacing["4"] },
  rejectBtnRow: { flexDirection: "row", gap: spacing["2.5"] },
  rejectCancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  rejectCancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  rejectConfirmBtn: { flex: 1, backgroundColor: "#ef4444", borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  rejectConfirmBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
});
