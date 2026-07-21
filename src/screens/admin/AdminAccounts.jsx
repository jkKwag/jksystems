import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminAccounts.styles";
import api from "../../lib/api";

const pad = (n) => String(n).padStart(2, "0");
const formatDt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

const ROLE_LABEL = { SUPER: "최고관리자", BIZ: "사업장관리자" };

export default function AdminAccounts({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState([]);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const list = await api.admin.users(bizRegNo);
    setUsers(Array.isArray(list) ? list : []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>계정 관리</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>이 사업장에 등록된 관리자 계정 목록입니다</Text>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : users.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>등록된 관리자 계정이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {users.map(u => {
            const isSuper = u.adminRole === "SUPER";
            const isOn = u.useYn === "Y";
            return (
              <View key={u.adminId} style={s.card}>
                <View style={s.cardTopRow}>
                  <View>
                    <Text style={s.adminNm}>{u.adminNm || "이름 미등록"}</Text>
                    <Text style={s.adminId}>{u.adminId}</Text>
                  </View>
                  <View style={[s.roleBadge, isSuper ? s.roleBadgeSuper : s.roleBadgeBiz]}>
                    <Text style={[s.roleBadgeText, isSuper ? s.roleBadgeTextSuper : s.roleBadgeTextBiz]}>
                      {ROLE_LABEL[u.adminRole] || u.adminRole}
                    </Text>
                  </View>
                </View>

                <View style={s.metaRow}>
                  <Text style={s.meta}>{u.mobileTel || "휴대전화 없음"}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.meta}>{u.tel || "전화 없음"}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <View style={s.useBadge}>
                    <View style={[s.useDot, isOn ? s.useDotOn : s.useDotOff]} />
                    <Text style={s.useText}>{isOn ? "사용중" : "미사용"}</Text>
                  </View>
                </View>

                <Text style={s.regDt}>등록일 {formatDt(u.regDt)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
