import { StyleSheet, Platform } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", ...(Platform.OS === "web" ? { height: "100vh" } : {}) },
  containerMobile: { flex: 1, flexDirection: "column", ...(Platform.OS === "web" ? { height: "100vh" } : {}) },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primary, paddingHorizontal: spacing["4"], paddingVertical: spacing["3"] },
  hamburgerBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  hamburgerBtnText: { fontSize: font["2xl"], color: colors.white },
  topBarTitle: { fontSize: font.lg, fontWeight: "800", color: colors.white },

  drawerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", zIndex: 200, ...(Platform.OS === "web" ? { height: "100vh" } : {}) },
  drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },

  sidebar: { width: 260, backgroundColor: colors.primary, flexShrink: 0 },
  sidebarMobile: { width: 260, backgroundColor: colors.primary, flexShrink: 0, ...(Platform.OS === "web" ? { height: "100vh" } : { height: "100%" }) },
  sidebarHeader: { padding: spacing["4"], borderBottomWidth: 1, borderBottomColor: colors.slate800, gap: spacing["1"] },
  brand: { fontSize: font.lg, fontWeight: "900", color: colors.white },
  closeBtnText: { fontSize: font.xl, color: colors.slate300 },
  adminNm: { fontSize: font.md, color: colors.slate300, marginTop: spacing["1"] },
  roleBadge: { fontSize: font.sm, fontWeight: "700", color: colors.accent, marginTop: 2 },

  menuScroll: { flex: 1 },
  menuRow: { paddingVertical: 10, paddingRight: spacing["4"] },
  menuRowActive: { backgroundColor: colors.accent },
  menuRowText: { fontSize: font.md, fontWeight: "600", color: colors.slate300 },
  menuRowTextActive: { color: colors.white, fontWeight: "800" },

  logoutBtn: { padding: spacing["4"], borderTopWidth: 1, borderTopColor: colors.slate800, alignItems: "center" },
  logoutBtnText: { fontSize: font.md, fontWeight: "700", color: colors.slate300 },

  content: { flex: 1, backgroundColor: colors.bgLight, justifyContent: "center", alignItems: "center" },
  placeholder: { alignItems: "center", gap: spacing["2"] },
  placeholderTitle: { fontSize: font["3xl"], fontWeight: "900", color: colors.text },
  placeholderDesc: { fontSize: font.md, color: colors.textMuted },
});
