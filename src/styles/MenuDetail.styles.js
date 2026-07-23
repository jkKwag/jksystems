import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", overflow: "hidden" },

  header: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["4"],
    paddingVertical: 13,
  },
  backBtn: { paddingVertical: spacing["1"], paddingRight: spacing["3"] },
  backBtnText: { color: colors.white, fontSize: font.lg, fontWeight: "700" },
  headerTitle: { flex: 1, color: colors.white, fontSize: font.xl, fontWeight: "800", textAlign: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing["5"] },

  heroWrap: { position: "relative" },
  hero: { width: "100%", height: 260, backgroundColor: "#eee" },
  heroNoImg: { justifyContent: "center", alignItems: "center", backgroundColor: colors.bgInput },
  heroNoImgText: { fontSize: font.lg, color: colors.textFaint, fontWeight: "600" },
  heroBadge: { position: "absolute", top: 14, left: 14, backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1"] },
  heroBadgeText: { color: colors.white, fontSize: font.base, fontWeight: "800" },

  infoSection: { backgroundColor: colors.bgCard, padding: spacing["5"] },
  category: { fontSize: font.base, color: colors.accent, fontWeight: "700", marginBottom: spacing["1"] },
  name: { fontSize: font["8xl"], fontWeight: "900", color: colors.text, marginBottom: spacing["2"] },
  desc: { fontSize: font.lg, color: "#666", lineHeight: 21, marginBottom: spacing["3.5"] },
  basePrice: { fontSize: font["7xl"], fontWeight: "900", color: colors.text },

  divider: { height: 8, backgroundColor: colors.bgInput },

  optionBlock: { backgroundColor: colors.bgCard, padding: spacing["5"] },
  optionLabelRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], marginBottom: spacing["3.5"] },
  optionLabel: { fontSize: font.xl, fontWeight: "800", color: colors.text },
  requiredBadge: { backgroundColor: colors.accent, borderRadius: radius.xs, paddingHorizontal: 7, paddingVertical: 2 },
  requiredText: { color: colors.white, fontSize: font.xs, fontWeight: "800" },
  optionalText: { fontSize: font.sm, color: colors.textFaint, fontWeight: "600" },

  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    paddingVertical: 13,
    paddingHorizontal: spacing["3.5"],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing["2"],
    backgroundColor: colors.bgCard,
  },
  choiceRowActive: { borderColor: colors.accent, backgroundColor: "#fff8f5" },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderMedium, justifyContent: "center", alignItems: "center" },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },

  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: colors.borderMedium, justifyContent: "center", alignItems: "center" },
  checkboxActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkmark: { color: colors.white, fontSize: font.base, fontWeight: "900", lineHeight: 14 },

  choiceName: { flex: 1, fontSize: font.lg, fontWeight: "600", color: colors.textGray },
  choiceNameActive: { color: colors.text, fontWeight: "700" },
  choicePrice: { fontSize: font.md, fontWeight: "700", color: colors.accent },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0, alignSelf: "flex-start", backgroundColor: colors.bgInput, borderRadius: 24, paddingHorizontal: spacing["1"], paddingVertical: spacing["1"] },
  qtyBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 18 },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyBtnText: { fontSize: font["3xl"], fontWeight: "700", color: colors.text },
  qtyNum: { minWidth: 36, textAlign: "center", fontSize: font["2xl"], fontWeight: "900", color: colors.text },

  bottomBar: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: spacing["4"],
    gap: spacing["3"],
  },
  totalWrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: font.md, color: colors.textMuted, fontWeight: "600" },
  totalPrice: { fontSize: font["8xl"], fontWeight: "900", color: colors.text },
  cartBtn: { backgroundColor: colors.accent, borderRadius: radius.xl, paddingVertical: 15, alignItems: "center" },
  cartBtnText: { color: colors.white, fontSize: font["2xl"], fontWeight: "800" },
});
