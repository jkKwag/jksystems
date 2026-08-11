import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { width: "100%", maxWidth: 360, backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["5"], alignItems: "center" },

  title: { fontSize: font["4xl"], fontWeight: "800", color: colors.text },
  subtitle: { fontSize: font.base, color: colors.textMuted, textAlign: "center", marginTop: spacing["1.5"], marginBottom: spacing["4"] },

  qrBox: { width: 280, height: 280, alignItems: "center", justifyContent: "center", backgroundColor: colors.slate50, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  qrTouchable: { width: "100%", height: "100%" },
  qrImage: { width: "100%", height: "100%" },
  errorText: { fontSize: font.md, color: colors.red, fontWeight: "700", textAlign: "center", paddingHorizontal: spacing["4"] },
  expiredBox: { alignItems: "center", justifyContent: "center" },
  expiredText: { fontSize: font.lg, color: colors.textGray, fontWeight: "700" },

  timerText: { fontSize: font["2xl"], fontWeight: "800", color: colors.accent, marginTop: spacing["3"], fontVariant: ["tabular-nums"] },
  downloadHint: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing["1"] },

  btnRow: { flexDirection: "row", gap: spacing["2.5"], marginTop: spacing["5"], width: "100%" },
  reissueBtn: { flex: 1, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  reissueBtnText: { fontSize: font.md, fontWeight: "700", color: colors.accent },
  closeBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  closeBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
