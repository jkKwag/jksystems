import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

const DIAL_SIZE = 220;

export const s = StyleSheet.create({
  field: { flexGrow: 1, minWidth: 140 },
  fieldLabel: { fontSize: font.sm, fontWeight: "700", color: colors.textMuted, marginBottom: 4 },

  trigger: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors.slate50,
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["3"],
  },
  triggerText: { fontSize: font.md, fontWeight: "700", color: colors.text },
  triggerPlaceholder: { color: colors.textFaint, fontWeight: "600" },
  clockIcon: { fontSize: font.base, opacity: 0.55 },

  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  overlayBg: { ...StyleSheet.absoluteFillObject },
  card: { width: 300, backgroundColor: colors.bgCard, borderRadius: radius["2xl"], overflow: "hidden" },

  header: { backgroundColor: colors.primary, paddingHorizontal: spacing["4"], paddingVertical: spacing["4"], alignItems: "center", gap: 4 },
  headerLabel: { fontSize: font.xs, fontWeight: "800", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 0.6 },
  headerDigits: { flexDirection: "row", alignItems: "center", gap: 4 },
  digit: { fontSize: 32, fontWeight: "800", color: "rgba(255,255,255,0.55)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  digitActive: { color: colors.white, backgroundColor: "rgba(255,255,255,0.14)" },
  digitColon: { fontSize: 32, fontWeight: "800", color: "rgba(255,255,255,0.55)" },

  dialWrap: { alignItems: "center", paddingVertical: spacing["5"] },
  dial: { width: DIAL_SIZE, height: DIAL_SIZE, borderRadius: DIAL_SIZE / 2, backgroundColor: colors.slate100 },
  dialCenter: { position: "absolute", top: DIAL_SIZE / 2 - 3, left: DIAL_SIZE / 2 - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, zIndex: 4 },

  hand: { position: "absolute", height: 2, backgroundColor: colors.accent, borderRadius: 1, zIndex: 2 },

  tick: { position: "absolute", width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", zIndex: 5 },
  tickSelected: { backgroundColor: colors.accent },
  tickText: { fontSize: font.md, fontWeight: "700", color: colors.textSecondary },
  tickTextInner: { fontSize: font.sm, color: colors.textFaint },
  tickTextSelected: { color: colors.white, fontWeight: "800" },

  footer: { flexDirection: "row", gap: spacing["2"], paddingHorizontal: spacing["4"], paddingBottom: spacing["4"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textMuted },
  confirmBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  confirmBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
