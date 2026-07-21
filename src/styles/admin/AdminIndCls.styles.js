import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["1.5"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  sub: { fontSize: font.base, color: colors.textMuted, marginBottom: spacing["4"] },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  searchWrap: { position: "relative", marginBottom: spacing["4"] },
  searchIcon: { position: "absolute", left: spacing["3.5"], top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  searchIconText: { fontSize: font.lg, color: colors.slate400 },
  searchInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.slate50, paddingVertical: spacing["3"], paddingHorizontal: spacing["3"],
    paddingLeft: spacing["10"], fontSize: font.lg, color: colors.text,
  },

  resultRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], paddingVertical: spacing["2.5"], paddingHorizontal: spacing["2.5"], borderRadius: radius.lg },
  resultMain: { flex: 1 },
  resultName: { fontSize: font.lg, fontWeight: "700", color: colors.text },
  resultCrumb: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  resultCode: {
    fontSize: font.sm, color: colors.slate400, backgroundColor: colors.slate100,
    borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: 3,
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
  },

  crumbsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing["1.5"], marginBottom: spacing["3"], minHeight: 22 },
  crumbPill: { borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.slate100, borderWidth: 1, borderColor: colors.border },
  crumbPillCurrent: { backgroundColor: colors.accent, borderColor: colors.accent },
  crumbPillText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  crumbPillTextCurrent: { color: colors.white },
  crumbSep: { fontSize: font.sm, color: colors.slate400 },

  levelCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing["3.5"], backgroundColor: colors.bgCard, marginBottom: spacing["3"] },
  levelTitle: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted, marginBottom: spacing["2.5"] },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  chip: {
    flexDirection: "row", alignItems: "center", gap: spacing["1.5"],
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
    borderRadius: radius.pill, paddingHorizontal: spacing["3.5"], paddingVertical: spacing["2.5"],
  },
  chipExpanded: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  chipDim: { opacity: 0.5 },
  chipText: { fontSize: font.lg, fontWeight: "600", color: colors.textSecondary },
  chipTextExpanded: { color: colors.accent },
  chipArrow: { fontSize: font.sm, color: colors.slate400 },

  detailCard: { marginTop: spacing["3"], borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing["3.5"], backgroundColor: colors.slate50 },
  detailTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing["2.5"] },
  detailName: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  badge: { fontSize: font.sm, fontWeight: "700", borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 3 },
  badgeOn: { color: colors.green, backgroundColor: colors.greenPaleBg2 },
  badgeOff: { color: colors.slate400, backgroundColor: colors.slate100 },

  detailGrid: { gap: spacing["1.5"] },
  detailRow: { flexDirection: "row", gap: spacing["3"] },
  detailKey: { width: 64, fontSize: font.base, fontWeight: "600", color: colors.textMuted },
  detailVal: { flex: 1, fontSize: font.base, fontWeight: "600", color: colors.textSecondary, fontFamily: Platform.OS === "web" ? "monospace" : undefined },
});
