import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlayDark },
  sheet: { backgroundColor: colors.bgBase, borderTopLeftRadius: radius["3xl"], borderTopRightRadius: radius["3xl"], maxHeight: "85%", overflow: "hidden" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing["4.5"], backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: font["2xl"], fontWeight: "900", color: colors.text, flexShrink: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: radius.round, backgroundColor: colors.slate100, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: font.lg, color: colors.textGray, fontWeight: "700" },

  body: { flexShrink: 1 },
  bodyContent: { padding: spacing["4"], gap: spacing["3"] },

  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center", paddingVertical: spacing["4"] },

  groupCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderMedium, padding: spacing["3.5"], gap: spacing["1.5"] },
  groupTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing["1.5"] },
  groupNm: { fontSize: font.lg, fontWeight: "800", color: colors.text },
  groupMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  typeBadge: { backgroundColor: colors.slate100, borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: 3 },
  typeBadgeText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  requiredBadge: { backgroundColor: colors.amberPaleBg, borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: 3 },
  requiredBadgeText: { fontSize: font.sm, fontWeight: "700", color: colors.amberDark },
  groupDeleteText: { fontSize: font.sm, fontWeight: "700", color: "#ef4444" },

  optionRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], paddingVertical: 3 },
  optionNm: { flex: 1, fontSize: font.md, color: colors.textSecondary, fontWeight: "600" },
  optionPrice: { fontSize: font.md, color: colors.textSecondary, fontWeight: "700" },
  optionDeleteText: { fontSize: font.sm, color: colors.textMuted, fontWeight: "600" },

  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing["1"] },
  newGroupTitle: { fontSize: font.lg, fontWeight: "800", color: colors.text },

  inp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"], fontSize: font.md, color: colors.text },

  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["3"] },
  toggleGroup: { flexDirection: "row", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden" },
  toggleBtn: { paddingHorizontal: spacing["3"], paddingVertical: spacing["2"], backgroundColor: colors.bgCard },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleBtnText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  toggleBtnTextActive: { color: colors.white },

  optRowInput: { flexDirection: "row", gap: spacing["2"], alignItems: "center" },
  rowRemoveBtn: { width: 32, height: 32, borderRadius: radius.round, backgroundColor: colors.slate100, justifyContent: "center", alignItems: "center" },
  rowRemoveBtnText: { fontSize: font.md, color: colors.textGray, fontWeight: "700" },

  addRowBtn: { alignSelf: "flex-start", paddingVertical: spacing["1"] },
  addRowBtnText: { fontSize: font.base, fontWeight: "700", color: colors.blue },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600" },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing["3"], alignItems: "center", marginTop: spacing["1"], marginBottom: spacing["6"] },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
