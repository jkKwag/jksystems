import { StyleSheet } from "react-native";
import { colors, radius, font, spacing } from "./theme";

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase, justifyContent: "center", alignItems: "center", padding: spacing["6"] },
  card: { backgroundColor: colors.bgCard, borderRadius: radius["4xl"], padding: spacing["8"], width: "100%", maxWidth: 400, alignItems: "center", shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  icon: { fontSize: font.hero, marginBottom: spacing["3"] },
  title: { fontSize: font["8xl"], fontWeight: "900", color: colors.primary, marginBottom: spacing["1.5"] },
  desc: { fontSize: font.lg, color: colors.slate500, marginBottom: spacing["7"] },
  btn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: spacing["8"], paddingVertical: spacing["3.5"], width: "100%", alignItems: "center" },
  btnText: { color: colors.white, fontSize: font.xl, fontWeight: "800" },
});
