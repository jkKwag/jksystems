import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { width: "100%", maxWidth: 480, maxHeight: "85%", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["5"] },
  title: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: spacing["4"] },
  body: { flexGrow: 0 },

  row: { flexDirection: "row", gap: spacing["3"] },

  label: { fontSize: font.base, fontWeight: "700", color: colors.textGray, marginBottom: spacing["1.5"] },
  inp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], fontSize: font.md, color: colors.text },
  inpMultiline: { minHeight: 70, textAlignVertical: "top" },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.slate50 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  chipTextActive: { color: colors.white },
  noCatText: { fontSize: font.sm, color: colors.textMuted },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },

  btnRow: { flexDirection: "row", gap: spacing["2.5"], marginTop: spacing["4"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
