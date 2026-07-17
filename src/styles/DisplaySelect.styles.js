import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 32,
    paddingTop: 48,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    width: "100%",
    padding: 28,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  btnSenior: { backgroundColor: "#1d4ed8" },
  btnJunior: { backgroundColor: "#16a34a" },
  sampleBox: { width: 64, height: 64, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sampleBig: { fontSize: 22, fontWeight: "900", color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 26 },
  sampleSmall: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 16 },
  btnText: { flex: 1 },
  btnLabel: { fontSize: 24, fontWeight: "900", color: "#fff" },
  btnDesc: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 4 },
  btnArrow: { fontSize: 22, color: "rgba(255,255,255,0.5)" },
});
