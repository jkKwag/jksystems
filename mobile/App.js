import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cars from "./src/screens/Cars";
import QnA from "./src/screens/QnA";
import FAQ from "./src/screens/FAQ";
import AdminLogin from "./src/components/AdminLogin";

const TABS = [
  { key: "cars", icon: "🏕", label: "캠핑카" },
  { key: "qna", icon: "💬", label: "Q&A" },
  { key: "faq", icon: "❓", label: "FAQ" },
];

export default function App() {
  const [tab, setTab] = useState("cars");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = async () => {
    await AsyncStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#1d3557", letterSpacing: -1 },
  adminBtn: { borderWidth: 1.5, borderColor: "#6b4c9a", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  adminBtnActive: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
  adminBtnText: { color: "#6b4c9a", fontWeight: "700", fontSize: 12 },
  adminBtnTextActive: { color: "#dc2626" },
  content: { flex: 1 },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 8, position: "relative" },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "500" },
  tabLabelActive: { color: "#1d3557", fontWeight: "700" },
  tabIndicator: { position: "absolute", top: 0, left: "25%", right: "25%", height: 2, backgroundColor: "#1d3557", borderRadius: 1 },
});
