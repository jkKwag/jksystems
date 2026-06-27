import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Modal } from "react-native";
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

const MUSIC_URL = "https://raw.githubusercontent.com/jkKwag/jksystems/main/assets/bgmusic.m4a";

const Logo = () => (
  <View style={s.headerLeft}>
    <View style={s.logoBox}>
      <Text style={s.logoJK}>JK</Text>
      <View style={s.logoLine} />
    </View>
    <Text style={s.headerTitle}><Text style={s.headerTitleAccent}>Scan</Text>eat</Text>
  </View>
);

export default function App() {
  const [tab, setTab] = useState("cars");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState(null); // null | "qna" | "faq"
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useState(() => {
    if (Platform.OS === "web" && menuBizno && MUSIC_URL) {
      const a = new window.Audio(MUSIC_URL);
      a.loop = true;
      a.volume = 0.4;
      return a;
    }
    return null;
  })[0];

  useEffect(() => {
    if (!audioRef) return;
    const play = () => {
      audioRef.play().then(() => setMusicOn(true)).catch(() => {});
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    };
    document.addEventListener("click", play, { once: true });
    document.addEventListener("touchstart", play, { once: true });
    return () => {
      audioRef.pause();
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    };
  }, [audioRef]);

  const toggleMusic = () => {
    if (!audioRef) return;
    if (musicOn) { audioRef.pause(); setMusicOn(false); }
    else { audioRef.play().then(() => setMusicOn(true)).catch(() => {}); }
  };

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
          {menuOverlay ? (
            <TouchableOpacity style={s.backBtn} onPress={() => setMenuOverlay(null)}>
              <Text style={s.backBtnText}>← 메뉴로</Text>
            </TouchableOpacity>
          ) : (
            <Logo />
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {MUSIC_URL ? (
              <TouchableOpacity onPress={toggleMusic} style={s.musicBtn}>
                <Text style={s.musicBtnText}>{musicOn ? "🔊" : "🔇"}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={s.hamburger} onPress={() => setShowDrawer(true)}>
              <View style={s.hLine} /><View style={s.hLine} /><View style={s.hLine} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.content}>
          {menuOverlay === "qna" ? <QnA isAdmin={false} /> :
           menuOverlay === "faq" ? <FAQ /> :
           <Menu bizno={menuBizno} />}
        </View>

        <Modal visible={showDrawer} transparent animationType="fade" onRequestClose={() => setShowDrawer(false)}>
          <View style={s.drawerOverlay}>
            <TouchableOpacity style={s.drawerBg} activeOpacity={1} onPress={() => setShowDrawer(false)} />
            <View style={s.drawerPanel}>
              <Text style={s.drawerTitle}>더보기</Text>
              {[
                { key: "qna", icon: "💬", label: "Q&A", desc: "자주 묻는 질문 답변" },
                { key: "faq", icon: "❓", label: "FAQ", desc: "공지 및 안내사항" },
              ].map(item => (
                <TouchableOpacity key={item.key} style={s.drawerItem} onPress={() => { setMenuOverlay(item.key); setShowDrawer(false); }}>
                  <Text style={s.drawerItemIcon}>{item.icon}</Text>
                  <View>
                    <Text style={s.drawerItemLabel}>{item.label}</Text>
                    <Text style={s.drawerItemDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={[s.header, HEADER_GRADIENT]}>
        <Logo />
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
  header: { backgroundColor: "#0f172a", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#0f172a", borderWidth: 1.5, borderColor: "#f97316", justifyContent: "center", alignItems: "center", gap: 2 },
  logoJK: { fontSize: 13, fontWeight: "900", color: "#f97316", letterSpacing: -1 },
  logoLine: { width: 20, height: 1.5, backgroundColor: "#f97316", opacity: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  headerTitleAccent: { color: "#f97316" },
  adminBtn: { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.1)" },
  adminBtnActive: { borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.15)" },
  adminBtnText: { color: "rgba(255,255,255,0.85)", fontWeight: "600", fontSize: 12 },
  adminBtnTextActive: { color: "#f87171" },
  content: { flex: 1, overflow: "hidden" },

  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  musicBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  musicBtnText: { fontSize: 16 },
  hamburger: { padding: 8, gap: 5, justifyContent: "center" },
  hLine: { width: 22, height: 2, backgroundColor: "#fff", borderRadius: 2 },

  drawerOverlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  drawerBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  drawerPanel: { width: 240, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  drawerTitle: { fontSize: 13, fontWeight: "800", color: "#aaa", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase" },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  drawerItemIcon: { fontSize: 24 },
  drawerItemLabel: { fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 2 },
  drawerItemDesc: { fontSize: 12, color: "#999" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", flexShrink: 0, shadowColor: "#0f172a", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10, paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10, position: "relative" },
  tabIcon: { fontSize: 20, marginBottom: 2, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  tabLabelActive: { color: "#16a34a", fontWeight: "700" },
  tabIndicator: { position: "absolute", top: 0, left: "30%", right: "30%", height: 3, backgroundColor: "#16a34a", borderRadius: 2 },
});
