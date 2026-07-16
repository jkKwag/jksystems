import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", backgroundColor: "#f1f5f9" },

  loading: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#fff", fontSize: 22, fontWeight: "700" },

  header: { backgroundColor: "#0f172a", paddingVertical: 14, paddingHorizontal: 16, flexShrink: 0 },
  headerGuide: { backgroundColor: "rgba(74,222,128,0.15)", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  headerGuideText: { color: "#4ade80", fontSize: 18, fontWeight: "800" },

  list: { flex: 1 },
  listContent: { paddingVertical: 10, paddingHorizontal: 10, paddingBottom: 100, gap: 8 },

  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, flexDirection: "column", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, gap: 10 },
  menuName: { fontSize: 40, fontWeight: "900", color: "#0f172a", lineHeight: 48 },
  menuQty: { fontSize: 28, fontWeight: "800", color: "#94a3b8" },
  menuQtyActive: { color: "#f59e0b" },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 12 },
  price: { fontSize: 48, fontWeight: "900", color: "#1d4ed8", flexShrink: 0 },

  addBtn: { width: 96, height: 96, backgroundColor: "#0f172a", borderRadius: 48, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  addBtnText: { color: "#fff", fontSize: 54, fontWeight: "300", lineHeight: 60 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#f1f5f9", borderRadius: 40, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  qtyBtn: { width: 68, height: 68, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 42, fontWeight: "700", color: "#0f172a" },
  qtyNum: { fontSize: 38, fontWeight: "900", color: "#0f172a", minWidth: 44, textAlign: "center" },

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
