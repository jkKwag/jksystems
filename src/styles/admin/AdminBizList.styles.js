import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text, marginBottom: spacing["4"] },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted },

  list: { gap: spacing["2.5"], paddingBottom: spacing["10"] },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["4"], borderWidth: 1, borderColor: colors.border, gap: spacing["3"] },
  cardActive: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.accentLight },
  cardInfo: { flex: 1, gap: 2 },
  bizNmRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  bizNm: { fontSize: font.xl, fontWeight: "800", color: colors.text },
  meta: { fontSize: font.base, color: colors.textSecondary, fontWeight: "600" },
  addr: { fontSize: font.sm, color: colors.textMuted },

  activeBadge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing["2"], paddingVertical: 2 },
  activeBadgeText: { fontSize: font.xs, fontWeight: "800", color: colors.white },

  selectBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2"] },
  selectBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.white },
});
