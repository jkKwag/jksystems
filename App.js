import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StatusBar, Platform, Modal, ScrollView, Animated, Image, StyleSheet } from "react-native";

const QR_ICON_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMSAyMSc+PHJlY3QgeD0nMScgeT0nMScgd2lkdGg9JzgnIGhlaWdodD0nOCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnLz48cmVjdCB4PSczLjUnIHk9JzMuNScgd2lkdGg9JzMnIGhlaWdodD0nMycgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMicgeT0nMScgd2lkdGg9JzgnIGhlaWdodD0nOCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnLz48cmVjdCB4PScxNC41JyB5PSczLjUnIHdpZHRoPSczJyBoZWlnaHQ9JzMnIGZpbGw9J3doaXRlJy8+PHJlY3QgeD0nMScgeT0nMTInIHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9J25vbmUnIHN0cm9rZT0nd2hpdGUnIHN0cm9rZS13aWR0aD0nMS41Jy8+PHJlY3QgeD0nMy41JyB5PScxNC41JyB3aWR0aD0nMycgaGVpZ2h0PSczJyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzExJyB5PScxMScgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxNCcgeT0nMTEnIHdpZHRoPScxLjUnIGhlaWdodD0nMS41JyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzE3JyB5PScxMScgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMScgeT0nMTQnIHdpZHRoPScxLjUnIGhlaWdodD0nMS41JyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzE0JyB5PScxNCcgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMScgeT0nMTcnIHdpZHRoPScyJyBoZWlnaHQ9JzInIGZpbGw9J3doaXRlJy8+PHJlY3QgeD0nMTcnIHk9JzE3JyB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPSd3aGl0ZScvPjwvc3ZnPgo=";
import supabase from "./src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Supporters from "./src/screens/Supporters";
import QnA from "./src/screens/QnA";
import FAQ from "./src/screens/FAQ";
import ElderlyTest from "./src/screens/ElderlyTest";
import ElderlyMenu from "./src/screens/ElderlyMenu";
import Menu from "./src/screens/Menu";
import PaymentSuccess from "./src/screens/PaymentSuccess";
import PaymentFail from "./src/screens/PaymentFail";
import AdminLogin from "./src/components/AdminLogin";
import QrScanner from "./src/components/QrScanner";
import { s } from "./src/styles/App.styles";

const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

const getMenuBizno = () => {
  if (Platform.OS !== "web") return null;
  const match = window.location.pathname.match(/^\/menu\/(.+)/);
  return match ? match[1] : null;
};

const getTableNo = () => {
  if (Platform.OS !== "web") return null;
  try {
    return new URLSearchParams(window.location.search).get("table") || null;
  } catch { return null; }
};

const menuBizno = getMenuBizno();
const tableNo = getTableNo();
const isPaymentSuccess = Platform.OS === "web" && window.location.pathname === "/payment/success";
const isPaymentFail = Platform.OS === "web" && window.location.pathname === "/payment/fail";

const MUSIC_URL = "https://raw.githubusercontent.com/jkKwag/jksystems/main/assets/bgmusic.mp3";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitHistory, setVisitHistory] = useState([]);
  const [visitCountMap, setVisitCountMap] = useState({});   // { biz_reg_no: { order: N, rsvn: M } }
  const [visitLoaded, setVisitLoaded] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const [showLogin, setShowLogin] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState(null); // null | "supporters" | "qna" | "faq"
  const [menuMode, setMenuMode] = useState(null); // null | "test" | "elderly"

  useEffect(() => {
    if (!menuBizno) return;
    const saved = localStorage.getItem("scaneat_display_mode");
    if (saved === "elderly") setMenuMode("elderly");
    else if (!saved) setMenuMode("test");
  }, []);

  const menuModeRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const showDrawerRef = useRef(false);
  useEffect(() => { menuModeRef.current = menuMode; }, [menuMode]);
  useEffect(() => { menuOverlayRef.current = menuOverlay; }, [menuOverlay]);
  useEffect(() => { showDrawerRef.current = showDrawer; }, [showDrawer]);

  useEffect(() => {
    if (Platform.OS !== "web" || !menuBizno) return;
    window.history.pushState(null, "");
    const onPop = () => {
      window.history.pushState(null, "");
      if (showDrawerRef.current) { setShowDrawer(false); }
      else if (menuModeRef.current === "elderly") { setMenuMode("test"); }
      else if (menuModeRef.current === "test") { setMenuMode(null); }
      else if (menuOverlayRef.current) { setMenuOverlay(null); }
      else { window.location.href = "/"; }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !menuBizno || !MUSIC_URL) return;
    const audio = new window.Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) { audio.pause(); setMusicOn(false); }
    else { audio.play().then(() => setMusicOn(true)).catch(() => {}); }
  };

  useEffect(() => {
    AsyncStorage.getItem("isAdmin").then(v => { if (v === "true") setIsAdmin(true); });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || menuBizno) return;
    (async () => {
      const uuid = localStorage.getItem("scaneat_uuid");
      if (!uuid) { setVisitLoaded(true); return; }
      const [{ data: scanData }, { data: cnsData }] = await Promise.all([
        supabase.from("tb_usr_scan_log").select("biz_reg_no").eq("uuid", uuid),
        supabase.from("tb_usr_prv_cns").select("biz_reg_no,guest_name").eq("uuid", uuid),
      ]);
      const countMap = {};
      (cnsData || []).forEach(r => {
        if (!r.biz_reg_no) return;
        if (!countMap[r.biz_reg_no]) countMap[r.biz_reg_no] = { order: 0, rsvn: 0 };
        if (r.guest_name) countMap[r.biz_reg_no].rsvn += 1;
        else countMap[r.biz_reg_no].order += 1;
      });
      const bizNos = [...new Set((scanData || []).map(r => r.biz_reg_no))];
      if (bizNos.length > 0) {
        const { data: bizData } = await supabase
          .from("tb_biz")
          .select("biz_reg_no,biz_nm,addr")
          .in("biz_reg_no", bizNos);
        if (bizData) {
          const total = (k) => (countMap[k]?.order || 0) + (countMap[k]?.rsvn || 0);
          setVisitHistory([...bizData].sort((a, b) => total(b.biz_reg_no) - total(a.biz_reg_no)));
          setVisitCountMap(countMap);
        }
      }
      setVisitLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!visitLoaded || visitHistory.length === 0) return;
    Animated.spring(badgeAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }, [visitLoaded, visitHistory.length]);

  const handleQrScan = (result) => {
    setShowQrScanner(false);
    try {
      const url = new URL(result);
      const match = url.pathname.match(/^\/menu\/(.+)/);
      if (match) window.location.href = `/menu/${match[1]}`;
    } catch {
      const match = result.match(/\/menu\/(.+)/);
      if (match) window.location.href = `/menu/${match[1]}`;
    }
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  if (isPaymentSuccess) return <PaymentSuccess />;
  if (isPaymentFail) return <PaymentFail />;

  const AppHeader = () => (
    <View style={[s.header, HEADER_GRADIENT]}>
      <Logo />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {menuBizno && (
          <View style={s.displayToggle}>
            {[{ label: "아주크게", mode: "elderly" }, { label: "보통", mode: null }].map(({ label, mode }) => {
              const active = menuMode === mode;
              return (
                <TouchableOpacity
                  key={label}
                  style={[s.displayToggleBtn, active && s.displayToggleBtnActive]}
                  onPress={() => {
                    localStorage.setItem("scaneat_display_mode", mode === "elderly" ? "elderly" : "normal");
                    setMenuMode(mode);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.displayToggleBtnText, active && s.displayToggleBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  );

  const AppDrawer = () => (
    <Modal visible={showDrawer} transparent animationType="fade" onRequestClose={() => setShowDrawer(false)}>
      <View style={s.drawerOverlay}>
        <TouchableOpacity style={s.drawerBg} activeOpacity={1} onPress={() => setShowDrawer(false)} />
        <View style={s.drawerPanel}>
          <Text style={s.drawerTitle}>더보기</Text>
          {[
            { key: "supporters", icon: "💝", label: "후원자", desc: "후원자 명단 보기" },
            { key: "qna", icon: "💬", label: "Q&A", desc: "자주 묻는 질문 답변" },
            { key: "faq", icon: "❓", label: "FAQ", desc: "공지 및 안내사항" },
            { key: "elderly", icon: "🔡", label: "글씨크기", desc: "화면 글씨 크기 선택" },
          ].map(item => (
            <TouchableOpacity key={item.key} style={s.drawerItem} onPress={() => {
              setShowDrawer(false);
              if (item.key === "elderly") setMenuMode("test");
              else setMenuOverlay(item.key);
            }}>
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
  );

  if (menuBizno && menuMode === "elderly") {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <AppHeader />
        <ElderlyMenu bizno={menuBizno} tableNo={tableNo} onBack={() => setMenuMode(null)} />
        <AppDrawer />
      </View>
    );
  }

  if (menuBizno) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <AppHeader />
        <View style={s.content}>
          <Menu bizno={menuBizno} tableNo={tableNo} />
          {(menuOverlay === "supporters" || menuOverlay === "qna" || menuOverlay === "faq") && (
            <View style={[StyleSheet.absoluteFillObject, s.overlayScreen]}>
              {menuOverlay === "supporters" && <Supporters isAdmin={false} />}
              {menuOverlay === "qna" && <QnA isAdmin={false} />}
              {menuOverlay === "faq" && <FAQ />}
            </View>
          )}
          {menuMode === "test" && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.72)", zIndex: 50 }]}>
              <ElderlyTest
                onSelect={() => { localStorage.setItem("scaneat_display_mode", "normal"); setMenuMode(null); }}
                onSelectElderly={() => { localStorage.setItem("scaneat_display_mode", "elderly"); setMenuMode("elderly"); }}
              />
            </View>
          )}
        </View>
        <AppDrawer />
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

      <ScrollView style={s.content} contentContainerStyle={s.visitPage}>
        <Text style={s.visitPageTitle}>내 스캔 목록</Text>
        {!visitLoaded ? (
          <Text style={s.visitEmptyText}>불러오는 중...</Text>
        ) : visitHistory.length === 0 ? (
          <View style={s.visitEmptyBox}>
            <Text style={s.visitEmptyIcon}>🍽</Text>
            <Text style={s.visitEmptyText}>방문 기록이 없습니다</Text>
            <Text style={s.visitEmptyDesc}>식당에서 QR 코드를 스캔하고{"\n"}예약하면 여기에 기록됩니다.</Text>
          </View>
        ) : (
          visitHistory.map(biz => (
            <TouchableOpacity
              key={biz.biz_reg_no}
              style={s.visitCard}
              onPress={() => { if (Platform.OS === "web") window.location.href = `/menu/${biz.biz_reg_no}`; }}
            >
              <View style={s.visitCardInner}>
                <View style={s.visitCardIcon}><Text style={s.visitCardIconText}>🍴</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.visitCardName}>{biz.biz_nm}</Text>
                  {!!biz.addr && <Text style={s.visitCardAddr} numberOfLines={1}>{biz.addr}</Text>}
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Animated.View style={{ flexDirection: "row", gap: 4, transform: [{ scale: badgeAnim }] }}>
                    {(visitCountMap[biz.biz_reg_no]?.order || 0) === 0 && (visitCountMap[biz.biz_reg_no]?.rsvn || 0) === 0 ? (
                      <Text style={s.visitCardCountNone}>주문/예약 없음</Text>
                    ) : (
                      <>
                        {(visitCountMap[biz.biz_reg_no]?.order || 0) > 0 && (
                          <Text style={s.visitCardCount}>주문 {visitCountMap[biz.biz_reg_no].order}회</Text>
                        )}
                        {(visitCountMap[biz.biz_reg_no]?.rsvn || 0) > 0 && (
                          <Text style={[s.visitCardCount, s.visitCardCountRsvn]}>예약 {visitCountMap[biz.biz_reg_no].rsvn}회</Text>
                        )}
                      </>
                    )}
                  </Animated.View>
                  <Text style={s.visitCardArrow}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {Platform.OS === "web" && (
        <TouchableOpacity style={s.qrFab} onPress={() => setShowQrScanner(true)}>
          <Image source={{ uri: QR_ICON_URI }} style={{ width: 20, height: 20 }} />
          <Text style={s.qrFabText}>QR 스캔</Text>
        </TouchableOpacity>
      )}

      <QrScanner visible={showQrScanner} onScan={handleQrScan} onClose={() => setShowQrScanner(false)} />
      <AdminLogin visible={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </View>
  );
}

