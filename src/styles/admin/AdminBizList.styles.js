import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  addBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted },

  list: { gap: spacing["2.5"], paddingBottom: spacing["10"] },
  cardColumn: { gap: spacing["1.5"] },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.slate50, borderRadius: radius["2xl"], padding: spacing["4"], borderWidth: 1, borderColor: colors.border, gap: spacing["3"] },
  cardInfo: { flex: 1, gap: 2 },
  bizNm: { fontSize: font.xl, fontWeight: "800", color: colors.text },
  meta: { fontSize: font.base, color: colors.textSecondary, fontWeight: "600" },
  addr: { fontSize: font.sm, color: colors.textMuted },

  selectBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2"] },
  selectBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.white },

  moreBtn: { alignItems: "center", paddingVertical: spacing["3"], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  moreBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  editSection: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.borderLight, padding: spacing["4"], gap: spacing["3"] },
  fieldRow: {},
  fieldLabel: { fontSize: font.base, fontWeight: "700", color: colors.textGray, marginBottom: spacing["1.5"] },
  fieldInp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], fontSize: font.md, color: colors.text, backgroundColor: colors.bgCard },

  readonlyBox: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], backgroundColor: colors.slate100 },
  readonlyText: { fontSize: font.md, fontWeight: "600", color: colors.textGray },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },

  editBtnRow: { flexDirection: "row", gap: spacing["2.5"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center", backgroundColor: colors.bgCard },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center" },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
