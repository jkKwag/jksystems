import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", backgroundColor: "#0f172a" },

  loading: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#fff", fontSize: 22, fontWeight: "700" },

  photoArea: { height: 210, backgroundColor: "#1e293b", flexShrink: 0, overflow: "hidden" },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  photoEmoji: { fontSize: 90 },

  /* 카드 + 떠 있는 화살표 컨테이너 */
  carouselOuter: { flex: 1, minHeight: 0, overflow: "hidden" },
  carouselClip: { flex: 1, minHeight: 0, overflow: "hidden", zIndex: 0 },
  track: { flexDirection: "row", height: "100%" },
  slide: { height: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16 },

  card: { backgroundColor: "#fff", borderRadius: 28, padding: 32, width: "100%", flexDirection: "column", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 },
  menuName: { fontSize: 40, fontWeight: "900", color: "#0f172a", lineHeight: 48 },
  menuQty: { fontSize: 28, fontWeight: "800", color: "#94a3b8" },
  menuQtyActive: { color: "#f59e0b" },
  price: { fontSize: 48, fontWeight: "900", color: "#1d4ed8", textAlign: "center" },

  addBtn: { width: "100%", paddingVertical: 22, backgroundColor: "#0f172a", borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
  addBtnText: { color: "#fff", fontSize: 30, fontWeight: "900" },

  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 44, paddingHorizontal: 6, paddingVertical: 4, alignSelf: "stretch", justifyContent: "space-between", marginTop: 4 },
  qtyBtn: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 40, fontWeight: "700", color: "#0f172a" },
  qtyNum: { fontSize: 36, fontWeight: "900", color: "#0f172a", minWidth: 44, textAlign: "center" },

  /* 떠 있는 화살표 — 카드 위에 오버레이 */
  prevBtn: { position: "absolute", left: 10, top: 0, bottom: 0, width: 60, alignItems: "center", justifyContent: "center", zIndex: 20 },
  nextBtn: { position: "absolute", right: 10, top: 0, bottom: 0, width: 60, alignItems: "center", justifyContent: "center", zIndex: 20 },
  navArrow: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center", shadowColor: "#f59e0b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 10 },
  navArrowText: { fontSize: 30, fontWeight: "900", color: "#fff", lineHeight: 34 },

  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 10, flexShrink: 0 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { width: 28, borderRadius: 5, backgroundColor: "#f59e0b" },

  cartBar: { backgroundColor: "#0f172a", padding: 16, paddingBottom: 20, flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 0, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  cartBadge: { backgroundColor: "#f59e0b", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  cartBadgeText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  cartText: { color: "#fff", fontSize: 20, fontWeight: "700", flex: 1 },
  cartPrice: { color: "#f59e0b", fontSize: 24, fontWeight: "900" },

  modalOverlay: { justifyContent: "flex-end", zIndex: 200 },
  modalBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44, maxHeight: "80%" },
  modalTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 26, fontWeight: "900", color: "#0f172a" },
  modalTitleActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  trashBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  trashBtnIcon: { fontSize: 22 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  closeBtnText: { fontSize: 18, fontWeight: "900", color: "#64748b" },
  modalList: { flexShrink: 1, marginBottom: 20 },
  modalItem: { flexDirection: "column", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  modalItemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  modalItemName: { flex: 1, fontSize: 22, fontWeight: "800", color: "#0f172a" },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  deleteBtnText: { fontSize: 16, fontWeight: "900", color: "#ef4444" },
  modalItemBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalItemPrice: { fontSize: 22, fontWeight: "900", color: "#1d4ed8" },
  modalFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 18, borderTopWidth: 2, borderTopColor: "#e2e8f0" },
  modalTotal: { fontSize: 24, fontWeight: "900", color: "#0f172a" },
  modalOrderBtn: { backgroundColor: "#0f172a", borderRadius: 18, paddingHorizontal: 32, paddingVertical: 18 },
  modalOrderBtnDisabled: { backgroundColor: "#94a3b8" },
  modalOrderBtnText: { color: "#fff", fontSize: 22, fontWeight: "900" },
});
