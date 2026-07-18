import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  content: { padding: spacing["5"], gap: spacing["3"], paddingBottom: spacing["10"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text, marginBottom: spacing["1"] },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },
  emptySmallText: { fontSize: font.sm, color: colors.textMuted, paddingVertical: spacing["2"] },

  statRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2.5"] },
  statTile: { flexGrow: 1, minWidth: 140, backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing["3.5"], gap: 4 },
  statTileAlert: { backgroundColor: colors.amberPaleBg, borderColor: colors.amber },
  statLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted },
  statValue: { fontSize: font["2xl"], fontWeight: "900", color: colors.text },
  statValueAlert: { color: colors.amberDark },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing["4"], gap: spacing["2"] },
  cardTitle: { fontSize: font.lg, fontWeight: "800", color: colors.text, marginBottom: spacing["1"] },

  chartRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing["2"], height: 160 },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" },
  barValue: { fontSize: 10, fontWeight: "700", color: colors.textMuted, height: 14 },
  barTrack: { width: "100%", height: 110, backgroundColor: colors.slate100, borderRadius: radius.sm, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", backgroundColor: colors.accent, borderTopLeftRadius: radius.xs, borderTopRightRadius: radius.xs, minHeight: 4 },
  barDayLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted },
  barDayLabelToday: { color: colors.accent },

  twoColRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["3"] },
  halfCard: { flex: 1, minWidth: 220 },

  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], paddingVertical: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: font.md, color: colors.textSecondary, fontWeight: "600" },
  statusCount: { fontSize: font.md, fontWeight: "800", color: colors.text },

  menuRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], paddingVertical: 4 },
  menuRank: { width: 18, fontSize: font.md, fontWeight: "900", color: colors.accent, textAlign: "center" },
  menuNm: { width: 110, fontSize: font.md, fontWeight: "700", color: colors.text },
  menuBarTrack: { flex: 1, height: 10, backgroundColor: colors.slate100, borderRadius: radius.xs, overflow: "hidden" },
  menuBarFill: { height: "100%", backgroundColor: colors.accent, borderRadius: radius.xs, minWidth: 4 },
  menuCount: { width: 44, fontSize: font.sm, fontWeight: "700", color: colors.textMuted, textAlign: "right" },

  activityRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], paddingVertical: spacing["1.5"], borderTopWidth: 1, borderTopColor: colors.borderLight },
  activityIcon: { fontSize: font.xl },
  activityLabel: { fontSize: font.md, fontWeight: "700", color: colors.text },
  activitySub: { fontSize: font.sm, color: colors.textMuted },
  activityTime: { fontSize: font.sm, color: colors.textMuted },
});
