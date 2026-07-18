import { StyleSheet } from "react-native";
import { colors, spacing } from "./theme";

export const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing["1"] },
  iconWrap: { justifyContent: "center", alignItems: "center" },
  iconDineIn: { backgroundColor: colors.green },
  iconTakeout: { backgroundColor: colors.accent },
  iconText: {},
  labelDineIn: { color: colors.green },
  labelTakeout: { color: colors.accent },
});
