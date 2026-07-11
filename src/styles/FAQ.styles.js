import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greenPaleBg, overflow: "hidden" },
  content: { padding: spacing["5"] },
  title: { fontSize: font["7xl"], fontWeight: "800", color: colors.greenDark, marginBottom: spacing["1"] },
  desc: { fontSize: font.md, color: colors.greenMuted, marginBottom: spacing["5"] },
  card: { backgroundColor: colors.bgCard, borderRadius: 11, marginBottom: spacing["2"], overflow: "hidden", borderWidth: 1, borderColor: colors.greenBorder },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  question: { fontSize: font.lg, fontWeight: "600", color: colors.greenDark, flex: 1, marginRight: spacing["2.5"] },
  arrow: { fontSize: font.base, color: colors.greenChat },
  answer: { padding: 15, paddingTop: 0, fontSize: font.lg, color: colors.greenMuted, lineHeight: 22, borderTopWidth: 1, borderTopColor: colors.greenBorder },
});
