import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "900", color: "#fff" },
  clearBtn: { backgroundColor: "#ef4444", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  clearBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#475569", fontSize: 14, fontWeight: "600" },
  list: { flexGrow: 0 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, gap: 10 },
  cardBody: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  cardKey: { fontSize: 12, fontWeight: "800", color: "#94a3b8", flex: 1 },
  cardValue: { fontSize: 13, fontWeight: "700", color: "#f1f5f9", flex: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#334155", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  deleteBtnText: { fontSize: 12, fontWeight: "900", color: "#94a3b8" },

  detailPanel: { flex: 1, marginTop: 12, backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "#334155", overflow: "hidden" },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#334155" },
  detailKey: { flex: 1, fontSize: 13, fontWeight: "900", color: "#f1f5f9", marginRight: 10 },
  detailCloseText: { fontSize: 12, fontWeight: "800", color: "#94a3b8" },
  detailBody: { padding: 14 },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#e2e8f0", lineHeight: 19 },
});
