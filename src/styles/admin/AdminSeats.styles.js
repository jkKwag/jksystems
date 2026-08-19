import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerBtnRow: { flexDirection: "row", gap: spacing["2"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.textGray, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  addBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  addBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },
  hintText: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing["1"], marginBottom: spacing["3"] },

  capFilterBox: { backgroundColor: colors.slate200, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate300, padding: spacing["3.5"], marginBottom: spacing["4"] },
  capFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"] },
  capChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.bgCard },
  capChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  capChipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  capChipTextActive: { color: colors.white },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["3.5"], gap: spacing["3"], borderWidth: 1, borderColor: colors.border },
  cardTopSection: { flexDirection: "row", gap: spacing["3"], alignItems: "center" },
  cardHighlight: { backgroundColor: colors.accentLight },
  // 손님QR 위 풍선도움말이 뜰 때만 위 카드와 겹치지 않도록 여백을 임시로 늘린다
  cardQrHintSpace: { marginTop: 36 },

  thumbWrap: { width: 64, alignItems: "center" },
  thumb: { width: 64, height: 64, borderRadius: radius.lg },
  thumbEmpty: { backgroundColor: colors.slate100, justifyContent: "center", alignItems: "center" },
  thumbEmptyText: { fontSize: 9, fontWeight: "700", color: colors.slate400, textAlign: "center" },
  qrBtnWrap: { position: "relative" },
  qrBtn: {
    width: "100%", paddingVertical: spacing["2.5"],
    backgroundColor: colors.primary, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  qrBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
  qrBtnDisabled: { backgroundColor: colors.slate300 },
  qrBtnTextDisabled: { color: colors.slate500 },

  qrHintBubble: {
    position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: spacing["1.5"], alignItems: "center",
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1.5"],
    zIndex: 30, elevation: 6,
  },
  qrHintText: { fontSize: font.sm, fontWeight: "700", color: colors.white, textAlign: "center" },
  qrHintArrow: {
    // 카드 전체 폭으로 넓어진 손님QR 버튼 중앙을 가리키도록 고정 위치로 지정
    position: "absolute", bottom: -5, left: "50%", marginLeft: -5,
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 5,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: colors.accent,
  },

  cardInfo: { flex: 1, gap: 2 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"], flexWrap: "wrap" },
  seatNm: { fontSize: font.xl, fontWeight: "800", color: colors.text, flexShrink: 1 },
  capacity: { fontSize: font.md, color: colors.textSecondary, fontWeight: "700" },
  desc: { fontSize: font.sm, color: colors.textMuted },

  offBadge: { backgroundColor: colors.slate200, borderRadius: radius.sm, paddingHorizontal: spacing["1.5"], paddingVertical: 2 },
  offBadgeText: { fontSize: font.xs, fontWeight: "700", color: colors.textGray },

  cardActions: { gap: spacing["1.5"] },
  sortBtnRow: { flexDirection: "row", gap: spacing["1"], justifyContent: "center" },
  sortBtn: { borderWidth: 1, borderColor: "#ef4444", borderRadius: radius.sm, paddingHorizontal: spacing["2"], paddingVertical: spacing["1"], alignItems: "center" },
  sortBtnDisabled: { opacity: 0.35 },
  sortBtnText: { fontSize: font.sm, fontWeight: "800", color: "#ef4444" },
  sortOrdText: { fontSize: font.sm, fontWeight: "800", color: colors.text, textAlign: "center" },
  actionBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["1.5"], alignItems: "center" },
  actionBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },
  deleteBtn: { borderColor: "#ef4444" },
  deleteBtnText: { color: "#ef4444" },
});
