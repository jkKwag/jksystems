import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], outlineStyle: "none" },
  noOutline: { outlineStyle: "none" },
  addBtnText: { fontSize: font.md, fontWeight: "700", color: colors.white },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted },

  list: { gap: spacing["3.5"], paddingBottom: spacing["10"] },

  // ── 사업장 카드 (메뉴관리 카테고리 톤 밴드 + 정보 스트립) ──
  bizCard: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.slate300, overflow: "hidden" },

  bizBand: { backgroundColor: colors.slate200, borderBottomWidth: 1, borderBottomColor: colors.slate300, paddingHorizontal: spacing["4.5"], paddingVertical: spacing["4"], flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing["3"] },
  bizBandLeft: { flex: 1, minWidth: 0 },
  bizNm: { fontSize: font.xl, fontWeight: "900", color: "#15803d", marginBottom: 2 },
  bizRegNo: { fontSize: font.sm, color: colors.textGray, fontFamily: Platform.OS === "web" ? "monospace" : undefined },

  statusPill: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"], borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 5, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.slate300 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusPillText: { fontSize: font.sm, fontWeight: "800", color: colors.textGray },

  bizStrip: { flexDirection: "row", gap: spacing["2"], padding: spacing["3"], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  stripTile: { flex: 1, backgroundColor: colors.slate100, borderRadius: radius.lg, paddingHorizontal: spacing["2.5"], paddingVertical: spacing["2"] },
  stripValue: { fontSize: font.base, fontWeight: "700", color: colors.textSecondary },

  bizFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing["4"], paddingVertical: spacing["2.5"], gap: spacing["2"] },
  bizAddr: { flex: 1, fontSize: font.sm, color: colors.textMuted },
  chev: { fontSize: font.lg, color: colors.slate400, fontWeight: "700" },
  chevOpen: { color: colors.accent, transform: [{ rotate: "90deg" }] },

  selectBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], outlineStyle: "none" },
  selectBtnText: { fontSize: font.sm, fontWeight: "700", color: colors.white },

  moreBtn: { alignItems: "center", paddingVertical: spacing["3"], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, outlineStyle: "none" },
  moreBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  // ── 신규 등록 카드 (그라데이션 밴드 없음) ──
  newBizCard: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.accent, padding: spacing["4"] },

  // ── 상세/편집 영역 ──
  detailInner: { padding: spacing["4"], borderTopWidth: 1, borderTopColor: colors.borderLight, borderStyle: "dashed" },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], marginTop: spacing["4"], marginBottom: spacing["2.5"] },
  sectionTitleRowFirst: { marginTop: 0 },
  sectionBar: { width: 3, height: 13, borderRadius: 2, backgroundColor: colors.accent },
  sectionTitleText: { fontSize: font.sm, fontWeight: "900", color: colors.text, textTransform: "uppercase", letterSpacing: 0.4 },
  sectionRule: { flex: 1, height: 1, backgroundColor: colors.borderLight },

  fieldGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2.5"] },
  fieldBox: { flexGrow: 1, flexBasis: "45%", borderWidth: 1, borderColor: colors.slate300, borderRadius: radius.lg, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"] },
  fieldBoxFull: { flexBasis: "100%", borderWidth: 1, borderColor: colors.slate300, borderRadius: radius.lg, paddingHorizontal: spacing["3"], paddingVertical: spacing["2.5"] },
  fieldBoxFocused: { borderColor: colors.accent },
  fieldInput: { fontSize: font.md, fontWeight: "700", color: colors.text, padding: 0, outlineStyle: "none" },
  fieldStatic: { fontSize: font.md, fontWeight: "700", color: colors.text },

  error: { fontSize: font.sm, color: "#ef4444", fontWeight: "600", marginTop: spacing["3"] },

  btnRow: { flexDirection: "row", gap: spacing["2.5"], marginTop: spacing["4"] },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center", backgroundColor: colors.bgCard, outlineStyle: "none" },
  cancelBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },
  saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing["2.5"], alignItems: "center", outlineStyle: "none" },
  saveBtnText: { fontSize: font.md, fontWeight: "800", color: colors.white },
});
