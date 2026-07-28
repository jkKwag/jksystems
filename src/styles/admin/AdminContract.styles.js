import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["1"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  sub: { fontSize: font.md, color: colors.textMuted, marginBottom: spacing["4"] },

  downloadBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], outlineStyle: "none" },
  downloadBtnText: { fontSize: font.md, fontWeight: "700", color: colors.primary },

  paper: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.slate300, padding: spacing["6"], paddingBottom: spacing["10"] },

  docTitle: { fontSize: font["8xl"], fontWeight: "900", color: colors.text, textAlign: "center" },
  docSubtitle: { fontSize: font.lg, color: colors.textMuted, textAlign: "center", marginTop: spacing["1"], marginBottom: spacing["5"] },

  introText: { fontSize: font.lg, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing["4"] },

  partyBox: { backgroundColor: colors.slate50, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing["3"], marginBottom: spacing["2.5"] },
  partyRow: { marginBottom: spacing["1"] },
  partyLabel: { fontSize: font.md, fontWeight: "800", color: colors.text },
  partyLine: { fontSize: font.base, color: colors.textGray, fontFamily: Platform.OS === "web" ? "monospace" : undefined, marginTop: 2 },

  chapter: { marginTop: spacing["6"] },
  chapterTitle: { fontSize: font["6xl"], fontWeight: "900", color: colors.greenDark, marginBottom: spacing["3"], borderBottomWidth: 2, borderBottomColor: colors.greenBorder, paddingBottom: spacing["1.5"] },

  article: { marginBottom: spacing["4"] },
  articleTitle: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: spacing["1.5"] },
  bodyText: { fontSize: font.lg, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing["1.5"] },

  itemRow: { flexDirection: "row", marginBottom: spacing["1.5"] },
  itemNo: { fontSize: font.lg, color: colors.textSecondary, width: 20 },
  itemBody: { flex: 1 },
  itemText: { fontSize: font.lg, color: colors.textSecondary, lineHeight: 21 },

  subItemRow: { flexDirection: "row", marginTop: 4, paddingLeft: spacing["3"] },
  subItemNo: { fontSize: font.md, color: colors.textMuted, width: 18 },
  subItemText: { flex: 1, fontSize: font.md, color: colors.textMuted, lineHeight: 19 },

  closingText: { fontSize: font.lg, color: colors.textSecondary, lineHeight: 21, marginTop: spacing["2"] },

  signRow: { flexDirection: "row", gap: spacing["3"], marginTop: spacing["5"] },
  signBox: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing["3"] },
});
