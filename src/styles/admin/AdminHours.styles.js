import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["2.5"], paddingBottom: spacing["10"] },
  dayCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: spacing["3.5"], gap: spacing["2.5"], borderWidth: 1, borderColor: colors.border },
  dayTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayLabel: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  closedToggle: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  closedToggleText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },

  timeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2.5"] },
  timeField: { flexGrow: 1, minWidth: 140 },
  timeLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted, marginBottom: 4 },
  timeInp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["3"], fontSize: font.md, color: colors.text },

  rangeBox: { backgroundColor: colors.slate50, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing["3"] },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  rangeField: { flex: 1 },
  rangeTilde: { fontSize: font.md, fontWeight: "700", color: colors.textMuted },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600", marginBottom: spacing["2"] },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["3"], alignItems: "center", marginTop: spacing["2"] },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
