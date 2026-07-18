import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  bar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing["2.5"], backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing["4"], paddingVertical: spacing["2.5"] },
  input: { minWidth: 220, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2"], fontSize: font.md, color: colors.text },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3.5"], paddingVertical: spacing["2"] },
  btnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
  result: { fontSize: font.md, fontWeight: "700", color: colors.green },
  error: { fontSize: font.md, fontWeight: "700", color: "#ef4444" },
});
