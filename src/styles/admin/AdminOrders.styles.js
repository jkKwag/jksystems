import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["4"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  dateRangeRow: { flexDirection: "row", alignItems: "center", gap: spacing["2"], marginBottom: spacing["4"] },
  dateField: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["2"], backgroundColor: colors.bgCard },
  dateFieldText: { fontSize: font.md, fontWeight: "700", color: colors.text },
  dateRangeSep: { fontSize: font.md, fontWeight: "700", color: colors.textMuted },

  calOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: spacing["5"] },
  calBox: { width: "100%", maxWidth: 360, borderRadius: radius["2xl"], overflow: "hidden", backgroundColor: colors.slate800 },

  statusFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing["2"], marginBottom: spacing["4"] },
  statusChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"], backgroundColor: colors.bgCard },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  statusChipTextActive: { color: colors.white },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["4"], gap: spacing["1.5"], borderWidth: 1, borderColor: colors.border },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dt: { fontSize: font.xl, fontWeight: "900", color: colors.primary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"], marginBottom: spacing["1"] },
  meta: { fontSize: font.base, color: colors.textSecondary, fontWeight: "600" },
  orderTypText: { fontSize: font.sm, fontWeight: "700", color: colors.textSecondary },

  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing["2"], paddingVertical: 2 },
  itemName: { fontSize: font.md, fontWeight: "700", color: colors.textSecondary },
  itemOptions: { fontSize: font.sm, color: colors.slate400, marginTop: 1 },
  itemPrice: { fontSize: font.md, fontWeight: "700", color: colors.textSecondary },

  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing["1"] },
  totalAmount: { fontSize: font["2xl"], fontWeight: "900", color: colors.accent },
  orderNo: { fontSize: font.sm, color: colors.textMuted, fontFamily: Platform.OS === "web" ? "monospace" : undefined },

  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 4 },
  statusBadgeText: { fontSize: font.sm, fontWeight: "800", color: colors.white },
  statusPending: { backgroundColor: "#f59e0b" },
  statusPaid: { backgroundColor: "#22c55e" },
  statusCanceled: { backgroundColor: "#94a3b8" },
});
