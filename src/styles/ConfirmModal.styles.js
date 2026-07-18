import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayStrong, justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { width: "100%", maxWidth: 340, backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["5"] },
  message: { fontSize: font.xl, fontWeight: "600", color: colors.text, textAlign: "center", lineHeight: 21, marginBottom: spacing["5"] },
  btnRow: { flexDirection: "row", gap: spacing["2.5"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  cancelBtnText: { fontSize: font.lg, fontWeight: "700", color: colors.textGray },
  confirmBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  confirmBtnDanger: { backgroundColor: colors.red },
  confirmBtnText: { fontSize: font.lg, fontWeight: "700", color: colors.white },
});
