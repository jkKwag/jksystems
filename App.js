import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StatusBar, Platform, Modal, ScrollView, Animated, Image, StyleSheet } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

const QR_ICON_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMSAyMSc+PHJlY3QgeD0nMScgeT0nMScgd2lkdGg9JzgnIGhlaWdodD0nOCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnLz48cmVjdCB4PSczLjUnIHk9JzMuNScgd2lkdGg9JzMnIGhlaWdodD0nMycgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMicgeT0nMScgd2lkdGg9JzgnIGhlaWdodD0nOCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnLz48cmVjdCB4PScxNC41JyB5PSczLjUnIHdpZHRoPSczJyBoZWlnaHQ9JzMnIGZpbGw9J3doaXRlJy8+PHJlY3QgeD0nMScgeT0nMTInIHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9J25vbmUnIHN0cm9rZT0nd2hpdGUnIHN0cm9rZS13aWR0aD0nMS41Jy8+PHJlY3QgeD0nMy41JyB5PScxNC41JyB3aWR0aD0nMycgaGVpZ2h0PSczJyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzExJyB5PScxMScgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxNCcgeT0nMTEnIHdpZHRoPScxLjUnIGhlaWdodD0nMS41JyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzE3JyB5PScxMScgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMScgeT0nMTQnIHdpZHRoPScxLjUnIGhlaWdodD0nMS41JyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzE0JyB5PScxNCcgd2lkdGg9JzInIGhlaWdodD0nMicgZmlsbD0nd2hpdGUnLz48cmVjdCB4PScxMScgeT0nMTcnIHdpZHRoPScyJyBoZWlnaHQ9JzInIGZpbGw9J3doaXRlJy8+PHJlY3QgeD0nMTcnIHk9JzE3JyB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPSd3aGl0ZScvPjwvc3ZnPgo=";
import supabase from "./src/lib/supabase";
import api from "./src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Supporters from "./src/screens/Supporters";
import QnA from "./src/screens/QnA";
import FAQ from "./src/screens/FAQ";
import DisplaySelect from "./src/screens/DisplaySelect";
import RmLocalStorage from "./src/screens/rmLocalStorage";
import ElderlyMenu from "./src/screens/ElderlyMenu";
import Menu from "./src/screens/Menu";
import PaymentSuccess from "./src/screens/PaymentSuccess";
import PaymentFail from "./src/screens/PaymentFail";
import AdminSubscriptionComplete from "./src/screens/admin/AdminSubscriptionComplete";
import AdminLogin from "./src/components/AdminLogin";
import BizSignup from "./src/components/BizSignup";
import AdminHome from "./src/screens/admin/AdminHome";
import QrScanner from "./src/components/QrScanner";
import NativeQrScanner from "./src/components/NativeQrScanner";
import { s } from "./src/styles/App.styles";
import GradientHeader from "./src/components/GradientHeader";

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
const isSubscriptionComplete = Platform.OS === "web" && window.location.pathname === "/admin/subscription-complete";

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

function AppInner() {
  const insets = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null); // { adminId, adminNm, adminRole, bizRegNo }
  const [visitHistory, setVisitHistory] = useState([]);
  const [visitCountMap, setVisitCountMap] = useState({});   // { biz_reg_no: { order: N, rsvn: M } }
  const [visitLoaded, setVisitLoaded] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const [showLogin, setShowLogin] = useState(false);
  const [showBizSignup, setShowBizSignup] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState(null); // null | "supporters" | "qna" | "faq"
  const [menuMode, setMenuMode] = useState(null); // null | "test" | "elderly"
  // 웹은 URL(/menu/:bizno)로 메뉴 화면에 진입하지만, 네이티브는 URL 라우팅이 없어서
  // QR 스캔 성공 시 이 state를 채워서 메뉴 화면으로 전환한다.
  const [nativeMenuBizno, setNativeMenuBizno] = useState(null);
  const [nativeTableNo, setNativeTableNo] = useState(null);
  const activeBizno = menuBizno || nativeMenuBizno;
  const activeTableNo = tableNo || nativeTableNo;

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
    (async () => {
      const [storedIsAdmin, storedToken, storedInfo] = await Promise.all([
        AsyncStorage.getItem("isAdmin"),
        AsyncStorage.getItem("adminToken"),
        AsyncStorage.getItem("adminInfo"),
      ]);
      // 세션 토큰 도입 이전에 로그인해있던 세션은 토큰이 없어서 이제 서버가 전부 401로
      // 거부한다 — 화면만 로그인된 것처럼 보이는 깨진 상태로 남지 않도록 강제 로그아웃한다.
      if (storedIsAdmin === "true" && !storedToken) {
        await AsyncStorage.multiRemove(["isAdmin", "adminInfo", "adminToken"]);
        return;
      }
      if (storedIsAdmin === "true") setIsAdmin(true);
      if (storedInfo) setAdminInfo(JSON.parse(storedInfo));
    })();
  }, []);

  useEffect(() => {
    if (menuBizno) return;
    // "내 스캔 목록"은 브라우저 localStorage 기반 익명 UUID로 스캔 이력을 추적하는
    // 웹 전용 기능이라, 네이티브에서는 그냥 빈 목록으로 즉시 로딩 완료 처리한다
    // (안 그러면 setVisitLoaded(true)가 호출될 일이 없어 로딩 화면에서 영원히 멈춘다).
    if (Platform.OS !== "web") { setVisitLoaded(true); return; }
    (async () => {
      const uuid = localStorage.getItem("scaneat_uuid");
      if (!uuid) { setVisitLoaded(true); return; }
      const [{ data: scanData }, reservations, orders] = await Promise.all([
        supabase.from("tb_usr_scan_log").select("biz_reg_no").eq("uuid", uuid),
        api.reservation.list(uuid),
        api.order.list(uuid),
      ]);
      const countMap = {};
      // 예약 횟수는 실제 예약 상태가 확정(CONFIRMED) 또는 이용완료(COMPLETED)인 건만 카운트
      (Array.isArray(reservations) ? reservations : []).forEach(r => {
        if (!r.bizRegNo || (r.rsvnStatus !== "CONFIRMED" && r.rsvnStatus !== "COMPLETED")) return;
        if (!countMap[r.bizRegNo]) countMap[r.bizRegNo] = { order: 0, rsvn: 0 };
        countMap[r.bizRegNo].rsvn += 1;
      });
      // 주문 횟수는 실제 주문 테이블(GET /api/order) 기준
      (Array.isArray(orders) ? orders : []).forEach(o => {
        if (!o.bizRegNo) return;
        if (!countMap[o.bizRegNo]) countMap[o.bizRegNo] = { order: 0, rsvn: 0 };
        countMap[o.bizRegNo].order += 1;
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
    // 웹은 URL 이동(/menu/:bizno)으로 메뉴 화면에 진입하지만, 네이티브는 그런 라우팅이
    // 없어서 파싱한 사업자번호/테이블번호를 state로 넣어 화면을 전환한다.
    let bizno = null, table = null;
    try {
      const url = new URL(result);
      const match = url.pathname.match(/^\/menu\/(.+)/);
      if (match) { bizno = match[1]; table = url.searchParams.get("table"); }
    } catch {
      const match = result.match(/\/menu\/([^/?]+)/);
      if (match) bizno = match[1];
    }
    if (!bizno) return;
    if (Platform.OS === "web") {
      window.location.href = `/menu/${bizno}${table ? `?table=${encodeURIComponent(table)}` : ""}`;
    } else {
      setNativeMenuBizno(bizno);
      setNativeTableNo(table);
    }
  };

  const handleLogin = async (admin) => {
    await AsyncStorage.setItem("isAdmin", "true");
    await AsyncStorage.setItem("adminInfo", JSON.stringify(admin));
    if (admin?.token) await AsyncStorage.setItem("adminToken", admin.token);
    setIsAdmin(true);
    setAdminInfo(admin);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isAdmin");
    await AsyncStorage.removeItem("adminInfo");
    await AsyncStorage.removeItem("adminToken");
    setIsAdmin(false);
    setAdminInfo(null);
  };

  if (isPaymentSuccess) return <PaymentSuccess />;
  if (isPaymentFail) return <PaymentFail />;
  if (isSubscriptionComplete) return <AdminSubscriptionComplete />;
  if (isAdmin) return <AdminHome adminInfo={adminInfo} onLogout={handleLogout} />;

  const AppHeader = () => (
    <GradientHeader style={[s.header, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
      <Logo />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {activeBizno && (
          <TouchableOpacity
            style={s.displayToggle}
            onPress={() => {
              const next = menuMode === "elderly" ? null : "elderly";
              localStorage.setItem("scaneat_display_mode", next === "elderly" ? "elderly" : "normal");
              setMenuMode(next);
            }}
            activeOpacity={0.8}
          >
            <Text style={s.displayToggleBtnText}>{menuMode === "elderly" ? "보통" : "아주크게"}</Text>
          </TouchableOpacity>
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
    </GradientHeader>
  );

  const AppDrawer = () => (
    <Modal visible={showDrawer} transparent animationType="fade" onRequestClose={() => setShowDrawer(false)}>
      <View style={s.drawerOverlay}>
        <TouchableOpacity style={s.drawerBg} activeOpacity={1} onPress={() => setShowDrawer(false)} />
        <View style={s.drawerPanel}>
          <Text style={s.drawerTitle}>더보기</Text>
          {[
            { key: "main", icon: "🏠", label: "메인메뉴", desc: "주문 메뉴로 돌아가기" },
            { key: "supporters", icon: "💝", label: "후원자", desc: "후원자 명단 보기" },
            { key: "qna", icon: "💬", label: "Q&A", desc: "자주 묻는 질문 답변" },
            { key: "faq", icon: "❓", label: "FAQ", desc: "공지 및 안내사항" },
            { key: "elderly", icon: "🔡", label: "글씨크기", desc: "화면 글씨 크기 선택" },
            { key: "storage", icon: "🗄️", label: "저장소", desc: "로컬 저장소 관리 (테스트)" },
          ].map(item => (
            <TouchableOpacity key={item.key} style={s.drawerItem} onPress={() => {
              setShowDrawer(false);
              if (item.key === "main") setMenuOverlay(null);
              else if (item.key === "elderly") setMenuMode("test");
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

  if (activeBizno && menuMode === "elderly") {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <AppHeader />
        <View style={s.content}>
          <ElderlyMenu bizno={activeBizno} tableNo={activeTableNo} onBack={() => setMenuMode(null)} />
          {(menuOverlay === "supporters" || menuOverlay === "qna" || menuOverlay === "faq" || menuOverlay === "storage") && (
            <View style={[StyleSheet.absoluteFillObject, s.overlayScreen]}>
              {menuOverlay === "supporters" && <Supporters isAdmin={false} />}
              {menuOverlay === "qna" && <QnA isAdmin={false} />}
              {menuOverlay === "faq" && <FAQ />}
              {menuOverlay === "storage" && <RmLocalStorage />}
            </View>
          )}
        </View>
        <AppDrawer />
      </View>
    );
  }

  if (activeBizno) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <AppHeader />
        <View style={s.content}>
          <Menu bizno={activeBizno} tableNo={activeTableNo} />
          {(menuOverlay === "supporters" || menuOverlay === "qna" || menuOverlay === "faq" || menuOverlay === "storage") && (
            <View style={[StyleSheet.absoluteFillObject, s.overlayScreen]}>
              {menuOverlay === "supporters" && <Supporters isAdmin={false} />}
              {menuOverlay === "qna" && <QnA isAdmin={false} />}
              {menuOverlay === "faq" && <FAQ />}
              {menuOverlay === "storage" && <RmLocalStorage />}
            </View>
          )}
          {menuMode === "test" && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.72)", zIndex: 50 }]}>
              <DisplaySelect
                onSelect={() => { localStorage.setItem("scaneat_display_mode", "normal"); setMenuOverlay(null); setMenuMode(null); }}
                onSelectElderly={() => { localStorage.setItem("scaneat_display_mode", "elderly"); setMenuOverlay(null); setMenuMode("elderly"); }}
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

      <GradientHeader style={[s.header, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
        <Logo />
        <TouchableOpacity style={[s.adminBtn, isAdmin && s.adminBtnActive]} onPress={isAdmin ? handleLogout : () => setShowLogin(true)}>
          <Text style={[s.adminBtnText, isAdmin && s.adminBtnTextActive]}>{isAdmin ? "🔓 로그아웃" : "⚙️ 관리자"}</Text>
        </TouchableOpacity>
      </GradientHeader>

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

      <TouchableOpacity style={s.qrFab} onPress={() => setShowQrScanner(true)}>
        <Image source={{ uri: QR_ICON_URI }} style={{ width: 20, height: 20 }} />
        <Text style={s.qrFabText}>QR 스캔</Text>
      </TouchableOpacity>

      {Platform.OS === "web" ? (
        <QrScanner visible={showQrScanner} onScan={handleQrScan} onClose={() => setShowQrScanner(false)} />
      ) : (
        <NativeQrScanner visible={showQrScanner} onScan={handleQrScan} onClose={() => setShowQrScanner(false)} />
      )}
      <AdminLogin
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onSignupClick={() => { setShowLogin(false); setShowBizSignup(true); }}
      />
      <BizSignup visible={showBizSignup} onClose={() => setShowBizSignup(false)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

