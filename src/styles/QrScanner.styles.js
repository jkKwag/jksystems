import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  panel: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius["4xl"], borderTopRightRadius: radius["4xl"], overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing["5"], paddingVertical: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.primary },
  closeBtn: { fontSize: font["4xl"], color: colors.slate400, padding: spacing["1"] },

  cameraBox: { width: "100%", height: 320, backgroundColor: colors.primary, position: "relative", justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.white, fontSize: font.lg, textAlign: "center", paddingHorizontal: spacing["6"], lineHeight: 22 },

  frameWrap: { position: "absolute", top: "50%", left: "50%", width: 200, height: 200, marginTop: -100, marginLeft: -100 },
  frameTL: { position: "absolute", top: 0, left: 0, width: 32, height: 32, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.green },
  frameTR: { position: "absolute", top: 0, right: 0, width: 32, height: 32, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.green },
  frameBL: { position: "absolute", bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.green },
  frameBR: { position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.green },

  hint: { fontSize: font.md, color: colors.red, textAlign: "center", paddingHorizontal: spacing["5"], paddingTop: spacing["3"] },

  footer: { padding: spacing["5"], alignItems: "center", gap: spacing["2.5"] },
  footerLabel: { fontSize: font.base, color: colors.slate400 },
  fileBtn: { backgroundColor: colors.slate100, borderRadius: radius.lg, paddingHorizontal: spacing["6"], paddingVertical: spacing["3"] },
  fileBtnText: { fontSize: font.lg, fontWeight: "700", color: colors.primary },
});
