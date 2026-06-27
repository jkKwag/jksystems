import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cars from "./src/screens/Cars";
import QnA from "./src/screens/QnA";
import FAQ from "./src/screens/FAQ";
import Menu from "./src/screens/Menu";
import AdminLogin from "./src/components/AdminLogin";

const TABS = [
  { key: "cars", icon: "🏕", label: "캠핑카" },
  { key: "qna", icon: "💬", label: "Q&A" },
  { key: "faq", icon: "❓", label: "FAQ" },
];

const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

const getMenuBizno = () => {
  if (Platform.OS !== "web") return null;
  const match = window.location.pathname.match(/^\/menu\/(.+)/);
  return match ? match[1] : null;
};

const menuBizno = getMenuBizno();

export default function App() {
  const [tab, setTab] = useState("cars");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("isAdmin").then(v => { if (v === "true") setIsAdmin(true); });
  }, []);

  const handleLogin = async () => {
    await AsyncStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  if (menuBizno) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={[s.header, HEADER_GRADIENT]}>
          <View style={s.headerLeft}>
            <Text style={s.headerIcon}>🚐</Text>
            <Text style={s.headerTitle}>CampRoad</Text>
          </View>
        </View>
        <View style={s.content}>
          <Menu bizno={menuBizno} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={[s.header, HEADER_GRADIENT]}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🚐</Text>
          <Text style={s.headerTitle}>CampRoad</Text>
        </View>
        <TouchableOpacity style={[s.adminBtn, isAdmin && s.adminBtnActive]} onPress={isAdmin ? handleLogout : () => setShowLogin(true)}>
          <Text style={[s.adminBtnText, isAdmin && s.adminBtnTextActive]}>{isAdmin ? "🔓 로그아웃" : "⚙️ 관리자"}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        {tab === "cars" && <Cars />}
        {tab === "qna" && <QnA isAdmin={isAdmin} />}
        {tab === "faq" && <FAQ />}
      </View>

      <View style={s.tabBar}>
        {TABS.map(({ key, icon, label }) => (
          <TouchableOpacity key={key} style={s.tabItem} onPress={() => setTab(key)}>
            <Text style={[s.tabIcon, tab === key && s.tabIconActive]}>{icon}</Text>
            <Text style={[s.tabLabel, tab === key && s.tabLabelActive]}>{label}</Text>
            {tab === key && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <AdminLogin visible={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#0f172a", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  adminBtn: { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.1)" },
  adminBtnActive: { borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.15)" },
  adminBtnText: { color: "rgba(255,255,255,0.85)", fontWeight: "600", fontSize: 12 },
  adminBtnTextActive: { color: "#f87171" },
  content: { flex: 1, overflow: "hidden" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", flexShrink: 0, shadowColor: "#0f172a", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10, paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10, position: "relative" },
  tabIcon: { fontSize: 20, marginBottom: 2, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  tabLabelActive: { color: "#16a34a", fontWeight: "700" },
  tabIndicator: { position: "absolute", top: 0, left: "30%", right: "30%", height: 3, backgroundColor: "#16a34a", borderRadius: 2 },
});
