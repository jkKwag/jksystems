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

// 직원(tb_biz 하위 1:M) 테이블이 아직 없어서 화면 형태만 미리 보여주는 정적 시안 데이터
const STAFF_PREVIEW = [
  { empId: "EMP0001", empNm: "이서연", position: "홀 매니저", mobileTel: "010-2222-3333", onDuty: true, hireDt: "2025-11-03" },
  { empId: "EMP0002", empNm: "박도현", position: "주방", mobileTel: "010-4444-5555", onDuty: true, hireDt: "2026-01-20" },
  { empId: "EMP0003", empNm: "최민아", position: "홀 서빙", mobileTel: "010-6666-7777", onDuty: false, hireDt: "2025-06-15" },
];

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
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          <View style={[s.sectionTitleRow, s.sectionTitleRowFirst]}>
            <Text style={s.sectionTitleText}>관리자 계정</Text>
            <Text style={s.sectionCount}>{users.length}명</Text>
          </View>

          {users.length === 0 ? (
            <Text style={s.emptyText}>등록된 관리자 계정이 없습니다</Text>
          ) : (
            users.map(u => {
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
            })
          )}

          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitleText}>직원 목록</Text>
            <Text style={s.sectionCount}>{STAFF_PREVIEW.length}명</Text>
            <Text style={s.sectionBadge}>시안</Text>
          </View>

          {STAFF_PREVIEW.map(emp => (
            <View key={emp.empId} style={s.card}>
              <View style={s.cardTopRow}>
                <View>
                  <Text style={s.adminNm}>{emp.empNm}</Text>
                  <Text style={s.adminId}>{emp.empId}</Text>
                </View>
                <View style={[s.roleBadge, s.roleBadgePosition]}>
                  <Text style={[s.roleBadgeText, s.roleBadgeTextPosition]}>{emp.position}</Text>
                </View>
              </View>

              <View style={s.metaRow}>
                <Text style={s.meta}>{emp.mobileTel}</Text>
                <Text style={s.metaDot}>·</Text>
                <View style={s.useBadge}>
                  <View style={[s.useDot, emp.onDuty ? s.useDotOn : s.useDotOff]} />
                  <Text style={s.useText}>{emp.onDuty ? "재직중" : "퇴직"}</Text>
                </View>
              </View>

              <Text style={s.regDt}>입사일 {formatDt(emp.hireDt)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
