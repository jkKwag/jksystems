import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", backgroundColor: "#f8fafc", overflow: "hidden" },

  loading: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#fff", fontSize: 20, fontWeight: "700" },

  header: { backgroundColor: "#0f172a", padding: 14, flexShrink: 0 },
  headerGuide: { backgroundColor: "rgba(74,222,128,0.12)", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  headerGuideText: { color: "#4ade80", fontSize: 17, fontWeight: "800" },

  catBar: { backgroundColor: "#fff", borderBottomWidth: 2, borderBottomColor: "#e2e8f0", flexShrink: 0, height: 54 },
  catBarContent: { alignItems: "center", paddingHorizontal: 4 },
  catItem: { height: 54, paddingHorizontal: 20, justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  catItemActive: { borderBottomColor: "#0f172a" },
  catText: { fontSize: 18, fontWeight: "700", color: "#94a3b8" },
  catTextActive: { color: "#0f172a" },

  list: { flex: 1, flexShrink: 1 },
  listContent: { paddingVertical: 8, paddingBottom: 120 },

  card: { backgroundColor: "#fff", margin: 8, marginHorizontal: 10, borderRadius: 16, padding: 16, flexDirection: "row", gap: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  img: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#f1f5f9" },
  noImg: { alignItems: "center", justifyContent: "center" },
  noImgIcon: { fontSize: 40 },
  info: { flex: 1 },
  menuName: { fontSize: 20, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  menuDesc: { fontSize: 14, color: "#64748b", fontWeight: "600", marginBottom: 10, lineHeight: 20 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 24, fontWeight: "900", color: "#0f172a" },

  addBtn: { width: 48, height: 48, backgroundColor: "#0f172a", borderRadius: 24, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 28, fontWeight: "300", lineHeight: 32 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f1f5f9", borderRadius: 24, paddingHorizontal: 6, paddingVertical: 2 },
  qtyBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  qtyNum: { fontSize: 20, fontWeight: "900", color: "#0f172a", minWidth: 28, textAlign: "center" },

  cartBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#0f172a", padding: 16, flexDirection: "row", alignItems: "center", gap: 12, cursor: "pointer" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBg: { ...{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "80%" },
  modalTitle: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginBottom: 20 },
  modalList: { flexShrink: 1, marginBottom: 20 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  modalItemName: { flex: 1, fontSize: 18, fontWeight: "700", color: "#0f172a" },
  modalItemPrice: { fontSize: 18, fontWeight: "900", color: "#0f172a", minWidth: 80, textAlign: "right" },
  modalFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTopWidth: 2, borderTopColor: "#e2e8f0" },
  modalTotal: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  modalOrderBtn: { backgroundColor: "#0f172a", borderRadius: 16, paddingHorizontal: 28, paddingVertical: 16 },
  modalOrderBtnText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  cartBadge: { backgroundColor: "#f59e0b", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  cartBadgeText: { color: "#fff", fontSize: 17, fontWeight: "900" },
  cartText: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 },
  cartPrice: { color: "#f59e0b", fontSize: 22, fontWeight: "900" },
});
