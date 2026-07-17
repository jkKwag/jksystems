import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlayDark },
  sheet: { backgroundColor: colors.bgBase, borderTopLeftRadius: radius["3xl"], borderTopRightRadius: radius["3xl"], maxHeight: "80%", overflow: "hidden" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing["4.5"], backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: radius.round, backgroundColor: colors.slate100, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: font.lg, color: colors.textGray, fontWeight: "700" },

  list: { flexShrink: 1 },
  listContent: { padding: spacing["4"], gap: spacing["3"] },

  emptyBox: { alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.lg, color: colors.slate400 },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderMedium, padding: spacing["3.5"], marginBottom: spacing["3"] },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["1.5"] },
  bizName: { fontSize: font.xl, fontWeight: "800", color: colors.primary },
  amount: { fontSize: font["2xl"], fontWeight: "900", color: colors.accent },

  cardMeta: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"] },
  metaText: { fontSize: font.base, color: colors.slate400 },
  metaDot: { fontSize: font.base, color: colors.slate300 },

  actionRow: { flexDirection: "row", gap: spacing["2"], marginTop: spacing["2.5"] },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderMedium, borderRadius: radius.lg, paddingVertical: spacing["2"], backgroundColor: colors.slate50 },
  actionBtnText: { fontSize: font.base, fontWeight: "700", color: colors.textSecondary },
  receiptBtn: { borderColor: colors.blue, backgroundColor: colors.bluePaleBg },
  receiptBtnText: { color: colors.blue },

  detailBox: { marginTop: spacing["3"], paddingTop: spacing["3"], borderTopWidth: 1, borderTopColor: colors.borderLight },
  detailLoading: { fontSize: font.base, color: colors.slate400, textAlign: "center", paddingVertical: spacing["2"] },

  orderBlock: { gap: spacing["1.5"] },
  orderBlockDivider: { marginTop: spacing["2.5"], paddingTop: spacing["2.5"], borderTopWidth: 1, borderTopColor: colors.borderLight },

  orderBadge: { alignSelf: "flex-start", backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: 3, marginBottom: spacing["1"] },
  orderBadgeText: { fontSize: font.sm, fontWeight: "800", color: colors.white },

  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing["2"] },
  itemName: { fontSize: font.md, fontWeight: "700", color: colors.textSecondary },
  itemOptions: { fontSize: font.sm, color: colors.slate400, marginTop: 1 },
  itemPrice: { fontSize: font.md, fontWeight: "700", color: colors.textSecondary },
});
