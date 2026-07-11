import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greenPaleBg, overflow: "hidden" },
  content: { padding: spacing["5"] },
  title: { fontSize: font["7xl"], fontWeight: "800", color: colors.greenDark, marginBottom: spacing["1"] },
  desc: { fontSize: font.md, color: colors.greenMuted, marginBottom: spacing["4"] },
  outlineBtn: { alignSelf: "flex-end", borderWidth: 1.5, borderColor: colors.greenMedium, borderRadius: radius.sm, paddingHorizontal: spacing["4"], paddingVertical: 7, marginBottom: spacing["3.5"] },
  outlineBtnText: { color: colors.greenMedium, fontWeight: "700", fontSize: font.md },
  formCard: { backgroundColor: colors.greenFormBg, borderWidth: 1, borderColor: colors.greenBorder, borderRadius: radius.lg, padding: spacing["4"], marginBottom: spacing["4"] },
  formTitle: { fontSize: font.lg, fontWeight: "700", marginBottom: spacing["3"], color: colors.greenDark },
  inp: { borderWidth: 1.5, borderColor: colors.greenBorderAlt, borderRadius: radius.sm, padding: spacing["2.5"], fontSize: font.md, backgroundColor: colors.bgCard, marginBottom: spacing["2"] },
  textarea: { height: 80, textAlignVertical: "top" },
  solidBtn: { backgroundColor: colors.greenMedium, borderRadius: radius.sm, padding: spacing["3"], alignItems: "center" },
  solidBtnText: { color: colors.white, fontWeight: "700", fontSize: font.md },
  card: { backgroundColor: colors.bgCard, borderRadius: 11, borderWidth: 1, borderColor: colors.greenBorder, borderLeftWidth: 3, marginBottom: spacing["2"], overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 13 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: spacing["2"], flex: 1 },
  cardTitle: { fontWeight: "600", fontSize: font.lg, color: colors.greenDark, flex: 1 },
  cardRight: { flexDirection: "row", gap: spacing["2"], marginLeft: spacing["2"] },
  tag: { borderRadius: radius.pill, paddingHorizontal: spacing["2"], paddingVertical: 3 },
  tagText: { fontSize: font.xs, fontWeight: "700" },
  meta: { fontSize: font.base, color: colors.greenChat },
  answerBox: { padding: spacing["3"], backgroundColor: colors.greenFormBg, borderTopWidth: 1, borderTopColor: colors.greenBorder },
  answerLabel: { color: colors.greenMedium, fontWeight: "800" },
  answerText: { fontSize: font.lg, color: colors.textSecondary, lineHeight: 22 },
  noAnswer: { fontSize: font.md, color: colors.greenChat, fontStyle: "italic" },
});
