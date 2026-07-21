import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["1.5"] },
  title: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  sub: { fontSize: font.base, color: colors.textMuted, marginBottom: spacing["4"] },
  refreshBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing["3"], paddingVertical: spacing["1.5"] },
  refreshBtnText: { fontSize: font.md, fontWeight: "700", color: colors.textGray },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  list: { gap: spacing["3"], paddingBottom: spacing["10"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["2xl"], padding: spacing["4"], gap: spacing["1.5"], borderWidth: 1, borderColor: colors.border },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adminNm: { fontSize: font.xl, fontWeight: "900", color: colors.text },
  adminId: { fontSize: font.sm, color: colors.textMuted, fontFamily: Platform.OS === "web" ? "monospace" : undefined, marginTop: 2 },

  roleBadge: { borderRadius: radius.pill, paddingHorizontal: spacing["2.5"], paddingVertical: 3 },
  roleBadgeSuper: { backgroundColor: colors.bluePaleBg },
  roleBadgeBiz: { backgroundColor: colors.greenPaleBg2 },
  roleBadgeText: { fontSize: font.sm, fontWeight: "800" },
  roleBadgeTextSuper: { color: colors.blueDark },
  roleBadgeTextBiz: { color: colors.green },

  useBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  useDot: { width: 7, height: 7, borderRadius: 999 },
  useDotOn: { backgroundColor: colors.green },
  useDotOff: { backgroundColor: colors.slate400 },
  useText: { fontSize: font.sm, fontWeight: "700", color: colors.textGray },

  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing["1.5"] },
  meta: { fontSize: font.base, color: colors.textSecondary, fontWeight: "600" },
  metaDot: { fontSize: font.base, color: colors.slate300 },

  regDt: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing["1"] },
});
