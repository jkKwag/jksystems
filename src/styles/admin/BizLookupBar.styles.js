import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  bar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing["2.5"], backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing["4"], paddingVertical: spacing["2.5"] },
  inputWrap: { position: "relative", minWidth: 220, justifyContent: "center" },
  input: { minWidth: 220, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingRight: spacing["8"], paddingVertical: spacing["2"], fontSize: font.md, color: colors.text },
  clearBtn: { position: "absolute", right: spacing["2"], padding: spacing["1"] },
  clearBtnText: { fontSize: font.base, fontWeight: "700", color: colors.textMuted },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3.5"], paddingVertical: spacing["2"] },
  btnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
  result: { fontSize: font.md, fontWeight: "700", color: colors.green },
  error: { fontSize: font.md, fontWeight: "700", color: "#ef4444" },
});
