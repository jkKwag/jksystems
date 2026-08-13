import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], width: "100%", maxWidth: 420, maxHeight: "80%", overflow: "hidden" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: spacing["5"], paddingVertical: spacing["4"] },
  title: { fontSize: font["6xl"], fontWeight: "900", color: colors.white },
  closeBtn: { width: 28, height: 28, borderRadius: radius.round, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  closeBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },

  body: { padding: spacing["5"] },

  searchWrap: { marginBottom: spacing["3"] },
  searchInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.slate50, paddingVertical: spacing["2.5"], paddingHorizontal: spacing["3.5"],
    fontSize: font.lg, color: colors.text, outlineStyle: "none",
  },

  crumbsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing["1.5"], marginBottom: spacing["3"] },
  crumbGroup: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"] },
  crumbPill: { borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1"], backgroundColor: colors.slate100, borderWidth: 1, borderColor: colors.border },
  crumbPillCurrent: { backgroundColor: colors.accent, borderColor: colors.accent },
  crumbPillText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  crumbPillTextCurrent: { color: colors.white },
  crumbSep: { fontSize: font.sm, color: colors.slate400 },

  list: { flexGrow: 0, maxHeight: 340 },
  center: { paddingVertical: spacing["8"], alignItems: "center" },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing["3"], paddingHorizontal: spacing["1"], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowMain: { flex: 1 },
  rowName: { fontSize: font.lg, fontWeight: "700", color: colors.text },
  rowCrumb: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: font.sm, fontWeight: "700", color: colors.blue, marginLeft: spacing["2"] },

  cancelBtn: { marginTop: spacing["4"], paddingVertical: spacing["2.5"], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", outlineStyle: "none" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
});
