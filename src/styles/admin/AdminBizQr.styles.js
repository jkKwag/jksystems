import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "../theme";

export const s = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: spacing["5"], alignItems: "center" },
  title: { alignSelf: "flex-start", fontSize: font["3xl"], fontWeight: "900", color: colors.text, marginBottom: spacing["4"] },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["10"] },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: "center" },

  infoBox: { width: "100%", maxWidth: 360, backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.border, padding: spacing["4"], gap: spacing["2"], marginBottom: spacing["5"] },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: font.base, fontWeight: "700", color: colors.textGray },
  infoValue: { fontSize: font.md, fontWeight: "800", color: colors.text },

  qrBox: { width: "100%", maxWidth: 360, height: 280, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgCard, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.border, marginBottom: spacing["2"] },
  qrImage: { width: 240, height: 240 },
  hintText: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing["3"] },

  urlText: { fontSize: font.sm, color: colors.textSecondary, marginBottom: spacing["4"], textAlign: "center" },
});
