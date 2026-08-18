import { StyleSheet, Platform } from "react-native";

const BG = "#0c0f16";
const SURFACE = "#161b28";
const BORDER = "#262e44";
const BORDER_SOFT = "#1e2436";
const TEXT = "#eef1f8";
const TEXT_DIM = "#929bb3";
const TEXT_FAINT = "#565f78";
const C_SEATED = "#f0a03c";
const C_PAID = "#34d399";
const C_EMPTY_SOFT = "#1a1f2e";

const tabularNums = Platform.OS === "web" ? { fontVariantNumeric: "tabular-nums" } : {};

export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  pageContent: { flexGrow: 1, padding: 20, gap: 18 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 13, fontWeight: "700", color: TEXT_FAINT },

  topbar: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", color: C_SEATED, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "800", color: TEXT, letterSpacing: -0.2 },
  clockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C_PAID },
  clockText: { fontSize: 12.5, fontWeight: "700", color: TEXT_DIM, ...tabularNums },

  summary: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 16, gap: 12 },
  summaryTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  summaryFigureRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  summaryNum: { fontSize: 28, fontWeight: "800", color: TEXT, letterSpacing: -0.4, ...tabularNums },
  summaryOf: { fontSize: 13, fontWeight: "700", color: TEXT_FAINT },
  warnTag: { backgroundColor: "rgba(240, 96, 60, 0.14)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  warnTagText: { fontSize: 11, fontWeight: "800", color: "#f0603c" },

  sortField: { borderWidth: 1, borderColor: C_SEATED, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(240, 160, 60, 0.16)" },
  sortFieldText: { fontSize: 11.5, fontWeight: "800", color: C_SEATED },

  sortOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  sortBox: { width: "100%", maxWidth: 280, borderRadius: 16, overflow: "hidden", backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, paddingVertical: 6 },
  sortRow: { paddingHorizontal: 16, paddingVertical: 12 },
  sortRowActive: { backgroundColor: "rgba(240, 160, 60, 0.12)" },
  sortRowText: { fontSize: 13, fontWeight: "700", color: TEXT_DIM },
  sortRowTextActive: { color: C_SEATED },

  capacityBar: { flexDirection: "row", gap: 3, height: 9 },
  capacitySeg: { flex: 1, borderRadius: 3, backgroundColor: C_EMPTY_SOFT, borderWidth: 1, borderColor: BORDER_SOFT },
  capacitySegFilled: { backgroundColor: C_SEATED, borderColor: C_SEATED },

  legendRow: { flexDirection: "row", justifyContent: "space-between", gap: 6, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendSwatch: { width: 8, height: 8, borderRadius: 2 },
  legendLabel: { fontSize: 11, fontWeight: "700", color: TEXT_DIM },
  legendCount: { fontSize: 11.5, fontWeight: "800", ...tabularNums },

  // 화면 너비에 따라 한 줄에 들어가는 타일 개수가 자연스럽게 늘어나거나 줄어든다
  // (좁으면 2열, 넓은 PC 모니터에서는 여러 열로 채워짐)
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  tile: { flexGrow: 1, flexBasis: 170, maxWidth: 280, minWidth: 150, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, borderTopWidth: 3 },
  cardStateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardStateDot: { width: 6, height: 6, borderRadius: 3 },
  cardStateText: { fontSize: 11.5, fontWeight: "800", flexShrink: 1 },
  amountRow: { marginTop: 4, gap: 1 },
  cardAmtSmall: { fontSize: 11, fontWeight: "700", color: TEXT_DIM, ...tabularNums },
  cardAmtPaid: { color: C_PAID },
  cardAmtUnpaid: { color: C_SEATED },

  // ---- shared card top row ----
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 },
  cardName: { fontSize: 14, fontWeight: "800", color: TEXT, letterSpacing: -0.1 },
  cardNameEmpty: { color: TEXT_FAINT },
  cardCap: { fontSize: 11, fontWeight: "600", color: TEXT_FAINT, marginTop: 2 },
  cardTime: { fontSize: 11.5, fontWeight: "800", color: TEXT_DIM, ...tabularNums },
  cardTimeWarn: { color: "#f0603c" },

  cardAction: { marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: BORDER_SOFT, alignItems: "center" },
  cardActionText: { fontSize: 11.5, fontWeight: "800", color: TEXT_DIM },
});
