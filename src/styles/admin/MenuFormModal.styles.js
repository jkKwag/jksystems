import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { width: "100%", maxWidth: 480, maxHeight: "85%", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], overflow: "hidden" },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing["5"], paddingVertical: spacing["4"] },
  title: { fontSize: font.xl, fontWeight: "800", color: colors.white },
  body: { flexGrow: 0, paddingHorizontal: spacing["5"], paddingTop: spacing["4"] },

  row: { flexDirection: "row", gap: spacing["3"] },

  label: { fontSize: font.base, fontWeight: "700", color: colors.textGray, marginBottom: spacing["1.5"] },
  inp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], fontSize: font.md, color: colors.text },
  inpMultiline: { minHeight: 70, textAlignVertical: "top" },

  chipBox: { backgroundColor: colors.slate200, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate300, padding: spacing["3.5"] },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.bgCard },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  chipTextActive: { color: colors.white },
  noCatText: { fontSize: font.sm, color: colors.textMuted },

  imgLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  imgActionRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  uploadBtn: { borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1"], marginBottom: spacing["1.5"] },
  uploadBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.accent },
  imgCheck: { fontSize: font.lg, fontWeight: "900", color: colors.green, marginBottom: spacing["1.5"] },
  imgErrorText: { fontSize: font.sm, color: "#ef4444", fontWeight: "600", marginTop: spacing["1"] },
  imgPreviewBox: { marginTop: spacing["2.5"], borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.slate100, borderWidth: 1, borderColor: colors.border },
  imgPreview: { width: "100%", height: 160 },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },

  btnRow: { flexDirection: "row", gap: spacing["2.5"], marginTop: spacing["4"], paddingHorizontal: spacing["5"], paddingBottom: spacing["5"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
