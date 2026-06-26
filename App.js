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
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.innerHTML = "html,body,#root{height:100%;margin:0;padding:0;overflow:hidden;}";
      document.head.appendChild(style);
    }
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
        <StatusBar barStyle="light-content" backgroundColor="#2d6a4f" />
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerIcon}>🚐</Text>
            <Text style={s.headerTitle}>CampRoad</Text>
          </View>
        </View>
        <Menu bizno={menuBizno} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d6a4f" />

      {/* 헤더 */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🚐</Text>
          <Text style={s.headerTitle}>CampRoad</Text>
        </View>
        <TouchableOpacity style={[s.adminBtn, isAdmin && s.adminBtnActive]} onPress={isAdmin ? handleLogout : () => setShowLogin(true)}>
          <Text style={[s.adminBtnText, isAdmin && s.adminBtnTextActive]}>{isAdmin ? "🔓 로그아웃" : "⚙️ 관리자"}</Text>
        </TouchableOpacity>
      </View>

      {/* 콘텐츠 */}
      <View style={s.content}>
        {tab === "cars" && <Cars />}
        {tab === "qna" && <QnA isAdmin={isAdmin} />}
        {tab === "faq" && <FAQ />}
      </View>

      {/* 하단 탭 */}
      <View style={s.tabBar}>
        {TABS.map(({ key, icon, label }) => (
          <TouchableOpacity key={key} style={s.tabItem} onPress={() => setTab(key)}>
            <Text style={s.tabIcon}>{icon}</Text>
            <Text style={[s.tabLabel, tab === key && s.tabLabelActive]}>{label}</Text>
            {tab === key && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 관리자 로그인 모달 */}
      <AdminLogin visible={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7f0" },
  header: { backgroundColor: "#2d6a4f", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  adminBtn: { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.6)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.15)" },
  adminBtnActive: { borderColor: "#ff6b6b", backgroundColor: "rgba(255,107,107,0.2)" },
  adminBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  adminBtnTextActive: { color: "#ff6b6b" },
  content: { flex: 1, overflow: "hidden" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 2, borderTopColor: "#d8f3dc", paddingBottom: 4, flexShrink: 0 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 8, position: "relative" },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 11, color: "#95d5b2", fontWeight: "500" },
  tabLabelActive: { color: "#2d6a4f", fontWeight: "700" },
  tabIndicator: { position: "absolute", top: 0, left: "25%", right: "25%", height: 2, backgroundColor: "#2d6a4f", borderRadius: 1 },
});
