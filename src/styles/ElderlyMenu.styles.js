import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", backgroundColor: "#0f172a" },

  loading: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#fff", fontSize: 22, fontWeight: "700" },

  header: { backgroundColor: "#0f172a", paddingVertical: 14, paddingHorizontal: 16, flexShrink: 0 },
  headerGuide: { backgroundColor: "rgba(74,222,128,0.12)", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  headerGuideText: { color: "#4ade80", fontSize: 18, fontWeight: "800" },

  carouselOuter: { flex: 1 },
  carouselClip: { flex: 1, overflow: "hidden" },
  track: { flexDirection: "row", height: "100%" },
  slide: { height: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16 },

  card: { backgroundColor: "#fff", borderRadius: 28, padding: 32, width: "100%", flexDirection: "column", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 },
  menuName: { fontSize: 44, fontWeight: "900", color: "#0f172a", lineHeight: 52 },
  menuQty: { fontSize: 30, fontWeight: "800", color: "#94a3b8" },
  menuQtyActive: { color: "#f59e0b" },
  price: { fontSize: 52, fontWeight: "900", color: "#1d4ed8" },

  addBtn: { width: "100%", paddingVertical: 22, backgroundColor: "#0f172a", borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
  addBtnText: { color: "#fff", fontSize: 32, fontWeight: "900" },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0, backgroundColor: "#f1f5f9", borderRadius: 44, paddingHorizontal: 6, paddingVertical: 4, alignSelf: "stretch", justifyContent: "space-between", marginTop: 4 },
  qtyBtn: { width: 70, height: 70, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 44, fontWeight: "700", color: "#0f172a" },
  qtyNum: { fontSize: 40, fontWeight: "900", color: "#0f172a", minWidth: 48, textAlign: "center" },

  prevBtn: { position: "absolute", left: 0, top: 0, bottom: 0, width: 64, alignItems: "center", justifyContent: "center", zIndex: 30 },
  nextBtn: { position: "absolute", right: 0, top: 0, bottom: 0, width: 64, alignItems: "center", justifyContent: "center", zIndex: 30 },
  navArrowPrev: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  navArrowNext: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center", shadowColor: "#f59e0b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  navArrowPrevText: { fontSize: 30, fontWeight: "900", color: "#0f172a", lineHeight: 34 },
  navArrowNextText: { fontSize: 30, fontWeight: "900", color: "#fff", lineHeight: 34 },

  bubbleContainer: { position: "absolute", right: 62, top: 0, bottom: 0, justifyContent: "center", zIndex: 20 },
  bubble: { backgroundColor: "#f59e0b", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { color: "#fff", fontSize: 16, fontWeight: "900", textAlign: "center", lineHeight: 22 },

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
  modalTitle: { fontSize: 26, fontWeight: "900", color: "#0f172a", marginBottom: 20 },
  modalList: { flexShrink: 1, marginBottom: 20 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  modalItemName: { flex: 1, fontSize: 20, fontWeight: "700", color: "#0f172a" },
  modalItemPrice: { fontSize: 20, fontWeight: "900", color: "#0f172a", minWidth: 90, textAlign: "right" },
  modalFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 18, borderTopWidth: 2, borderTopColor: "#e2e8f0" },
  modalTotal: { fontSize: 24, fontWeight: "900", color: "#0f172a" },
  modalOrderBtn: { backgroundColor: "#0f172a", borderRadius: 18, paddingHorizontal: 32, paddingVertical: 18 },
  modalOrderBtnText: { color: "#fff", fontSize: 22, fontWeight: "900" },
});
