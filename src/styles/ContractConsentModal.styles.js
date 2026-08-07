import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], width: "100%", maxWidth: 460, maxHeight: "85%", overflow: "hidden" },

  header: { padding: spacing["5"], paddingBottom: spacing["3"], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  title: { fontSize: font["6xl"], fontWeight: "900", color: colors.text },
  sub: { fontSize: font.base, color: colors.textMuted, marginTop: spacing["1"] },

  body: { paddingHorizontal: spacing["5"] },
  bodyContent: { paddingVertical: spacing["4"] },

  chapter: { marginTop: spacing["5"] },
  chapterFirst: { marginTop: 0 },
  chapterTitle: { fontSize: font.xl, fontWeight: "900", color: colors.greenDark, marginBottom: spacing["2.5"], borderBottomWidth: 2, borderBottomColor: colors.greenBorder, paddingBottom: spacing["1"] },

  article: { marginBottom: spacing["3"] },
  articleTitle: { fontSize: font.md, fontWeight: "800", color: colors.text, marginBottom: spacing["1"] },
  bodyText: { fontSize: font.base, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing["1"] },

  itemRow: { flexDirection: "row", marginBottom: spacing["1"] },
  itemNo: { fontSize: font.base, color: colors.textSecondary, width: 16 },
  itemBody: { flex: 1 },
  itemText: { fontSize: font.base, color: colors.textSecondary, lineHeight: 19 },

  subItemRow: { flexDirection: "row", marginTop: 3, paddingLeft: spacing["2.5"] },
  subItemNo: { fontSize: font.sm, color: colors.textMuted, width: 16 },
  subItemText: { flex: 1, fontSize: font.sm, color: colors.textMuted, lineHeight: 17 },

  footer: { padding: spacing["5"], paddingTop: spacing["3"], borderTopWidth: 1, borderTopColor: colors.borderLight },

  agreeRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], marginBottom: spacing["4"], outlineStyle: "none" },
  checkbox: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: colors.blue, borderColor: colors.blue },
  checkboxMark: { fontSize: font.md, fontWeight: "900", color: colors.white },
  agreeText: { fontSize: font.md, fontWeight: "700", color: colors.text },

  btnRow: { flexDirection: "row", gap: spacing["2.5"] },
  cancelBtn: { flex: 1, paddingVertical: spacing["2.5"], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", outlineStyle: "none" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  agreeBtn: { flex: 1, paddingVertical: spacing["2.5"], borderRadius: radius.md, backgroundColor: colors.blue, alignItems: "center", outlineStyle: "none" },
  agreeBtnDisabled: { backgroundColor: colors.slate300 },
  agreeBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
