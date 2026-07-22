import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  content: { padding: spacing["5"], gap: spacing["3"], paddingBottom: spacing["10"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text, marginBottom: spacing["1"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.accent },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },
  emptySmallText: { fontSize: font.sm, color: colors.textMuted, paddingVertical: spacing["2"] },

  statRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2.5"] },
  statTile: { flexGrow: 1, minWidth: 140, backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing["3.5"], gap: 4 },
  statLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted },
  statValue: { fontSize: font["2xl"], fontWeight: "900", color: colors.accent },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing["4"], gap: spacing["2"] },
  cardTitle: { fontSize: font.lg, fontWeight: "800", color: colors.text, marginBottom: spacing["1"] },
  secGroupLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted, marginTop: spacing["1"] },

  twoColRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["3"] },
  halfCard: { flex: 1, minWidth: 220 },

  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], paddingVertical: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: font.md, color: colors.textSecondary, fontWeight: "600" },
  statusCount: { fontSize: font.md, fontWeight: "800", color: colors.text },

  rankRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], paddingVertical: spacing["1.5"], borderTopWidth: 1, borderTopColor: colors.borderLight },
  rankRowFirst: { borderTopWidth: 0 },
  rankNo: { width: 22, fontSize: font.lg, fontWeight: "900", color: colors.accent, textAlign: "center" },
  rankInfo: { flex: 1 },
  rankBizNm: { fontSize: font.md, fontWeight: "800", color: colors.text },
  rankMeta: { fontSize: font.sm, color: colors.textMuted, marginTop: 1 },
  rankAmount: { fontSize: font.lg, fontWeight: "900", color: colors.accent },

  secGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2.5"] },
  secTile: { flexGrow: 1, minWidth: 120, backgroundColor: colors.slate50, borderRadius: radius.lg, padding: spacing["3"], gap: 2 },
  secTileAlert: { backgroundColor: colors.amberPaleBg },
  secLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted },
  secValue: { fontSize: font.xl, fontWeight: "900", color: colors.text },
  secValueAlert: { color: colors.amberDark },
});
