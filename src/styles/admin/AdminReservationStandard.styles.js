import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.textGray, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  form: { gap: spacing["3"], paddingBottom: spacing["10"], maxWidth: 560 },
  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: spacing["4"], gap: spacing["2"], borderWidth: 1, borderColor: colors.border },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing["3"] },
  row: { flexDirection: "row", gap: spacing["3"] },

  fieldLabel: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  fieldDesc: { fontSize: font.sm, color: colors.textMuted },

  inp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], fontSize: font.md, color: colors.text, marginTop: spacing["1"] },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["3"], alignItems: "center", marginTop: spacing["1"] },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
