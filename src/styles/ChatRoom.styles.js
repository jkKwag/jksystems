import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  panel: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    height: 480,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing["4"], borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.primary, borderTopLeftRadius: radius["3xl"], borderTopRightRadius: radius["3xl"] },
  title: { fontSize: font["2xl"], fontWeight: "900", color: colors.white },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: font.md, color: colors.white, fontWeight: "700" },

  enterBox: { flex: 1, padding: spacing["6"], gap: spacing["3"] },
  enterDesc: { fontSize: font.lg, color: colors.slate500, lineHeight: 22, marginBottom: spacing["1"] },
  enterInput: { backgroundColor: colors.slate100, borderRadius: radius.lg, paddingHorizontal: spacing["4"], paddingVertical: 13, fontSize: font.lg, color: colors.primary },
  errorText: { fontSize: font.md, color: colors.red, fontWeight: "600" },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 15, alignItems: "center", marginTop: spacing["1"] },
  joinBtnOff: { backgroundColor: colors.slate400 },
  joinBtnText: { color: colors.white, fontSize: font.xl, fontWeight: "800" },

  roomBadge: { backgroundColor: colors.slate100, paddingHorizontal: spacing["4"], paddingVertical: spacing["2"], borderBottomWidth: 1, borderBottomColor: colors.borderMedium },
  roomBadgeText: { fontSize: font.base, fontWeight: "700", color: colors.slate600 },

  msgList: { flex: 1 },
  msgContent: { padding: spacing["3.5"], gap: spacing["2.5"] },
  emptyText: { textAlign: "center", fontSize: font.md, color: colors.slate400, marginTop: 40 },

  msgRow: { alignItems: "flex-start", gap: 3 },
  msgRowMe: { alignItems: "flex-end" },
  msgNick: { fontSize: font.sm, color: colors.slate400, fontWeight: "600", paddingHorizontal: spacing["1"] },
  bubble: { backgroundColor: colors.slate100, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: spacing["3.5"], paddingVertical: spacing["2.5"], maxWidth: "75%" },
  bubbleMe: { backgroundColor: colors.primary, borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: font.lg, color: colors.primary, lineHeight: 20 },
  bubbleTextMe: { color: colors.white },

  inputRow: { flexDirection: "row", padding: spacing["3"], gap: spacing["2"], borderTopWidth: 1, borderTopColor: colors.borderLight, alignItems: "center" },
  input: { flex: 1, backgroundColor: colors.slate100, borderRadius: 22, paddingHorizontal: spacing["4"], paddingVertical: spacing["2.5"], fontSize: font.lg, color: colors.text },
  sendBtn: { backgroundColor: colors.primary, borderRadius: 22, paddingHorizontal: spacing["4"], paddingVertical: spacing["2.5"] },
  sendBtnOff: { backgroundColor: colors.borderMedium },
  sendBtnText: { color: colors.white, fontWeight: "700", fontSize: font.md },
});
