import { StyleSheet } from 'react-native';
import { colors, radius, font, spacing } from './theme';

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: { backgroundColor: colors.primary, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing["4"], paddingVertical: spacing["3"] },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing["2.5"] },
  logoBox: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.accent, justifyContent: "center", alignItems: "center", gap: 2 },
  logoJK: { fontSize: font.md, fontWeight: "900", color: colors.accent, letterSpacing: -1 },
  logoLine: { width: 20, height: 1.5, backgroundColor: colors.accent, opacity: 0.5 },
  headerTitle: { fontSize: font["4xl"], fontWeight: "900", color: colors.white, letterSpacing: -0.5 },
  headerTitleAccent: { color: colors.accent },
  adminBtn: { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", borderRadius: radius.pill, paddingHorizontal: spacing["3.5"], paddingVertical: spacing["1.5"], backgroundColor: "rgba(255,255,255,0.1)" },
  adminBtnActive: { borderColor: colors.redLight, backgroundColor: "rgba(248,113,113,0.15)" },
  adminBtnText: { color: "rgba(255,255,255,0.85)", fontWeight: "600", fontSize: font.base },
  adminBtnTextActive: { color: colors.redLight },
  content: { flex: 1, overflow: "hidden" },

  overlayScreen: { backgroundColor: colors.bgBase, zIndex: 10 },

  backBtn: { paddingVertical: spacing["1.5"], paddingHorizontal: spacing["1"] },
  backBtnText: { color: colors.white, fontSize: font.lg, fontWeight: "700" },

  displayToggle: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  displayToggleBtnText: { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.85)" },
  musicBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  musicBtnText: { fontSize: font["2xl"] },
  hamburger: { padding: spacing["2"], gap: 5, justifyContent: "center" },
  hLine: { width: 22, height: 2, backgroundColor: colors.white, borderRadius: 2 },

  drawerOverlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  drawerBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  drawerPanel: { width: 240, backgroundColor: colors.bgCard, paddingTop: 60, paddingHorizontal: spacing["5"], paddingBottom: spacing["10"] },
  drawerTitle: { fontSize: font.md, fontWeight: "800", color: colors.textLight, letterSpacing: 1.5, marginBottom: spacing["5"], textTransform: "uppercase" },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: spacing["3.5"], paddingVertical: spacing["4"], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  drawerItemIcon: { fontSize: font["8xl"] },
  drawerItemLabel: { fontSize: font.xl, fontWeight: "800", color: colors.text, marginBottom: 2 },
  drawerItemDesc: { fontSize: font.base, color: colors.textGrayAlt },
  visitPage: { padding: spacing["5"], paddingBottom: spacing["10"] },
  visitPageTitle: { fontSize: font["6xl"], fontWeight: "900", color: colors.primary, marginBottom: spacing["4"] },

  paymentHistoryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.xl, backgroundColor: colors.accentLight, paddingVertical: spacing["3"], marginBottom: spacing["4"] },
  paymentHistoryBtnText: { fontSize: font.lg, fontWeight: "800", color: colors.accent },

  visitEmptyBox: { alignItems: "center", paddingTop: 60 },
  visitEmptyIcon: { fontSize: 48, marginBottom: spacing["3"] },
  visitEmptyText: { fontSize: font.xl, fontWeight: "700", color: colors.slate400, marginBottom: spacing["1.5"] },
  visitEmptyDesc: { fontSize: font.md, color: colors.slate300, textAlign: "center", lineHeight: 20 },

  visitCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, marginBottom: spacing["2.5"], borderWidth: 1, borderColor: colors.borderMedium, overflow: "hidden" },
  visitCardInner: { flexDirection: "row", alignItems: "center", padding: spacing["3.5"], gap: spacing["3"] },
  visitCardIcon: { width: 42, height: 42, borderRadius: radius.lg, backgroundColor: colors.greenPaleBg2, justifyContent: "center", alignItems: "center" },
  visitCardIconText: { fontSize: font["6xl"] },
  visitCardName: { fontSize: font.xl, fontWeight: "800", color: colors.primary, marginBottom: 2 },
  visitCardAddr: { fontSize: font.base, color: colors.slate400 },
  visitCardArrow: { fontSize: font["2xl"], color: colors.green, fontWeight: "700" },
  visitCardCount: { fontSize: font.base, fontWeight: "800", color: colors.accent, backgroundColor: colors.accentLight, paddingHorizontal: spacing["2"], paddingVertical: 2, borderRadius: radius.pill },
  visitCardCountRsvn: { color: colors.blue, backgroundColor: colors.bluePaleBg },
  visitCardCountNone: { fontSize: font.base, fontWeight: "600", color: colors.slate400, backgroundColor: colors.slate100, paddingHorizontal: spacing["2"], paddingVertical: 2, borderRadius: radius.pill },

  qrFab: { position: "absolute", bottom: spacing["7"], alignSelf: "center", flexDirection: "row", alignItems: "center", gap: spacing["2"], backgroundColor: colors.primary, borderRadius: 28, paddingHorizontal: spacing["6"], paddingVertical: spacing["3.5"], shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  qrFabText: { fontSize: font.xl, fontWeight: "800", color: colors.white },
});
