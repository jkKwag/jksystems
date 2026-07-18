import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { s } from "../../styles/admin/AdminHome.styles";
import api from "../../lib/api";
import AdminReservations from "./AdminReservations";
import AdminBizList from "./AdminBizList";
import AdminOrders from "./AdminOrders";
import AdminPayments from "./AdminPayments";
import AdminMenu from "./AdminMenu";
import AdminSeats from "./AdminSeats";
import AdminHours from "./AdminHours";
import AdminReservationStandard from "./AdminReservationStandard";
import AdminDashboard from "./AdminDashboard";
import BizLookupBar from "../../components/admin/BizLookupBar";

const ROLE_LABEL = { SUPER: "최종관리자", BIZ: "사업자관리자" };
const MOBILE_BREAKPOINT = 768;
const DASHBOARD_URL = "/admin/dashboard";

// menu_url -> 실제 구현된 화면 컴포넌트. 없는 항목은 준비중 플레이스홀더로 표시.
const MENU_SCREENS = {
  "/admin/reservations": AdminReservations,
  "/admin/biz": AdminBizList,
  "/admin/orders": AdminOrders,
  "/admin/payments": AdminPayments,
  "/admin/menu": AdminMenu,
  "/admin/seat": AdminSeats,
  "/admin/hours": AdminHours,
  "/admin/reservation-standard": AdminReservationStandard,
  "/admin/dashboard": AdminDashboard,
};

function MenuNode({ node, depth, expanded, onToggle, selectedCd, onSelect }) {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = expanded.has(node.menuCd);
  return (
    <View>
      <TouchableOpacity
        style={[s.menuRow, { paddingLeft: 16 + depth * 16 }, selectedCd === node.menuCd && s.menuRowActive]}
        onPress={() => (hasChildren ? onToggle(node.menuCd) : onSelect(node))}
      >
        <Text style={[s.menuRowText, selectedCd === node.menuCd && s.menuRowTextActive]}>
          {hasChildren ? (isOpen ? "▾ " : "▸ ") : ""}{node.menuNm}
        </Text>
      </TouchableOpacity>
      {hasChildren && isOpen && node.children.map(child => (
        <MenuNode key={child.menuCd} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} selectedCd={selectedCd} onSelect={onSelect} />
      ))}
    </View>
  );
}

export default function AdminHome({ adminInfo, onLogout }) {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  const [loaded, setLoaded] = useState(false);
  const [menuTree, setMenuTree] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [bizNm, setBizNm] = useState(null);

  const isSuper = adminInfo?.adminRole === "SUPER";
  const [bizLookupInput, setBizLookupInput] = useState("");
  const [viewingBizRegNo, setViewingBizRegNo] = useState(null);
  const [viewingBizNm, setViewingBizNm] = useState(null);
  const [bizLookupError, setBizLookupError] = useState("");

  const effectiveBizRegNo = isSuper ? viewingBizRegNo : adminInfo?.bizRegNo;

  const handleBizInputChange = (text) => {
    setBizLookupInput(text);
    if (!text.trim()) {
      setViewingBizRegNo(null);
      setViewingBizNm(null);
      setBizLookupError("");
    }
  };

  const handleBizLookup = async (regNo) => {
    setBizLookupInput(regNo);
    setBizLookupError("");
    const biz = await api.biz.get(regNo);
    if (!biz) {
      setViewingBizRegNo(null);
      setViewingBizNm(null);
      setBizLookupError("사업장을 찾을 수 없습니다.");
      return;
    }
    setViewingBizRegNo(regNo);
    setViewingBizNm(biz.bizNm);
  };

  useEffect(() => {
    if (!adminInfo?.adminRole) return;
    (async () => {
      const tree = await api.admin.menu(adminInfo.adminRole);
      const list = Array.isArray(tree) ? tree : [];
      setMenuTree(list);
      setExpanded(new Set(list.map(m => m.menuCd)));
      const dashboard = list.find(m => m.menuUrl === DASHBOARD_URL);
      if (dashboard) setSelected(dashboard);
      setLoaded(true);
    })();
  }, [adminInfo?.adminRole]);

  useEffect(() => {
    if (!adminInfo?.bizRegNo) { setBizNm(null); return; }
    (async () => {
      const biz = await api.biz.get(adminInfo.bizRegNo);
      setBizNm(biz?.bizNm || null);
    })();
  }, [adminInfo?.bizRegNo]);

  const brandTitle = bizNm || "CampRoad 관리자";

  const toggle = (menuCd) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(menuCd)) next.delete(menuCd); else next.add(menuCd);
      return next;
    });
  };

  const selectMenu = (node) => {
    setSelected(node);
    if (isMobile) setShowMenu(false);
  };

  const Sidebar = () => (
    <View style={isMobile ? s.sidebarMobile : s.sidebar}>
      <View style={s.sidebarHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={s.brand}>{brandTitle}</Text>
          {isMobile && (
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.adminNm}>{adminInfo?.adminNm || adminInfo?.adminId}</Text>
        <Text style={s.roleBadge}>{ROLE_LABEL[adminInfo?.adminRole] || adminInfo?.adminRole}</Text>
      </View>
      <ScrollView style={s.menuScroll} contentContainerStyle={{ paddingVertical: 8 }}>
        {!loaded ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
        ) : (
          menuTree.map(node => (
            <MenuNode key={node.menuCd} node={node} depth={0} expanded={expanded} onToggle={toggle} selectedCd={selected?.menuCd} onSelect={selectMenu} />
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
        <Text style={s.logoutBtnText}>🔓 로그아웃</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={isMobile ? s.containerMobile : s.container}>
      {isMobile ? (
        <>
          <View style={s.topBar}>
            <TouchableOpacity style={s.hamburgerBtn} onPress={() => setShowMenu(true)}>
              <Text style={s.hamburgerBtnText}>☰</Text>
            </TouchableOpacity>
            <Text style={s.topBarTitle}>{brandTitle}</Text>
            <TouchableOpacity style={s.hamburgerBtn} onPress={onLogout}>
              <Text style={s.hamburgerBtnText}>🔓</Text>
            </TouchableOpacity>
          </View>
          {showMenu && (
            <View style={s.drawerOverlay}>
              <TouchableOpacity style={s.drawerBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)} />
              <Sidebar />
            </View>
          )}
        </>
      ) : (
        <Sidebar />
      )}

      <View style={s.rightCol}>
        {isSuper && (
          <BizLookupBar
            value={bizLookupInput}
            onChangeText={handleBizInputChange}
            onLookup={handleBizLookup}
            errorText={bizLookupError}
            resultText={viewingBizNm ? `조회중: ${viewingBizNm} (${viewingBizRegNo})` : null}
          />
        )}
        <View style={s.content}>
          {(() => {
            if (!selected) {
              return (
                <View style={s.placeholder}>
                  <Text style={s.placeholderTitle}>👋 환영합니다</Text>
                  <Text style={s.placeholderDesc}>
                    {isMobile ? "☰ 버튼을 눌러 메뉴를 열어주세요." : "왼쪽 메뉴에서 원하는 항목을 선택해주세요."}
                  </Text>
                </View>
              );
            }
            const ScreenComponent = MENU_SCREENS[selected.menuUrl];
            if (ScreenComponent) {
              return (
                <ScreenComponent
                  adminInfo={{ ...adminInfo, bizRegNo: effectiveBizRegNo }}
                  onSelectBiz={isSuper ? handleBizLookup : undefined}
                />
              );
            }
            return (
              <View style={s.placeholder}>
                <Text style={s.placeholderTitle}>{selected.menuNm}</Text>
                <Text style={s.placeholderDesc}>이 화면은 아직 준비 중입니다.</Text>
              </View>
            );
          })()}
        </View>
      </View>
    </View>
  );
}
