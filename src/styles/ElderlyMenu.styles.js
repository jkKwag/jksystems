import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", backgroundColor: "#f1f5f9", overflow: "hidden" },

  loading: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#fff", fontSize: 22, fontWeight: "700" },

  header: { backgroundColor: "#0f172a", paddingVertical: 12, paddingHorizontal: 16, flexShrink: 0 },
  headerGuide: { backgroundColor: "rgba(74,222,128,0.15)", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  headerGuideText: { color: "#4ade80", fontSize: 18, fontWeight: "800" },

  catBar: { backgroundColor: "#fff", borderBottomWidth: 2, borderBottomColor: "#e2e8f0", flexShrink: 0, flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 6, paddingVertical: 4 },
  catBarContent: {},
  catItem: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, margin: 4 },
  catItemActive: { backgroundColor: "#0f172a" },
  catText: { fontSize: 17, fontWeight: "700", color: "#94a3b8" },
  catTextActive: { color: "#fff" },

  list: { flex: 1 },
  listContent: { paddingVertical: 6, paddingHorizontal: 8, paddingBottom: 100 },

  card: { backgroundColor: "#fff", marginBottom: 8, borderRadius: 20, padding: 16, flexDirection: "row", gap: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  img: { width: 110, height: 110, borderRadius: 14, backgroundColor: "#f1f5f9" },
  noImg: { alignItems: "center", justifyContent: "center" },
  noImgIcon: { fontSize: 48 },
  info: { flex: 1 },
  menuName: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  menuDesc: { fontSize: 15, color: "#64748b", fontWeight: "600", marginBottom: 12, lineHeight: 22 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 28, fontWeight: "900", color: "#0f172a" },

  addBtn: { width: 56, height: 56, backgroundColor: "#0f172a", borderRadius: 28, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 32, fontWeight: "300", lineHeight: 36 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#f1f5f9", borderRadius: 28, paddingHorizontal: 4, paddingVertical: 2 },
  qtyBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  qtyNum: { fontSize: 22, fontWeight: "900", color: "#0f172a", minWidth: 32, textAlign: "center" },

  cartBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#0f172a", padding: 18, flexDirection: "row", alignItems: "center", gap: 12 },
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
