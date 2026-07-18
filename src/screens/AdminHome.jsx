import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../styles/AdminHome.styles";
import api from "../lib/api";

const ROLE_LABEL = { SUPER: "최종관리자", BIZ: "사업자관리자" };

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
  const [loaded, setLoaded] = useState(false);
  const [menuTree, setMenuTree] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!adminInfo?.adminRole) return;
    (async () => {
      const tree = await api.admin.menu(adminInfo.adminRole);
      setMenuTree(Array.isArray(tree) ? tree : []);
      setExpanded(new Set((Array.isArray(tree) ? tree : []).map(m => m.menuCd)));
      setLoaded(true);
    })();
  }, [adminInfo?.adminRole]);

  const toggle = (menuCd) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(menuCd)) next.delete(menuCd); else next.add(menuCd);
      return next;
    });
  };

  return (
    <View style={s.container}>
      <View style={s.sidebar}>
        <View style={s.sidebarHeader}>
          <Text style={s.brand}>CampRoad 관리자</Text>
          <Text style={s.adminNm}>{adminInfo?.adminNm || adminInfo?.adminId}</Text>
          <Text style={s.roleBadge}>{ROLE_LABEL[adminInfo?.adminRole] || adminInfo?.adminRole}</Text>
        </View>
        <ScrollView style={s.menuScroll} contentContainerStyle={{ paddingVertical: 8 }}>
          {!loaded ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
          ) : (
            menuTree.map(node => (
              <MenuNode key={node.menuCd} node={node} depth={0} expanded={expanded} onToggle={toggle} selectedCd={selected?.menuCd} onSelect={setSelected} />
            ))
          )}
        </ScrollView>
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutBtnText}>🔓 로그아웃</Text>
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        {selected ? (
          <View style={s.placeholder}>
            <Text style={s.placeholderTitle}>{selected.menuNm}</Text>
            <Text style={s.placeholderDesc}>이 화면은 아직 준비 중입니다.</Text>
          </View>
        ) : (
          <View style={s.placeholder}>
            <Text style={s.placeholderTitle}>👋 환영합니다</Text>
            <Text style={s.placeholderDesc}>왼쪽 메뉴에서 원하는 항목을 선택해주세요.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
