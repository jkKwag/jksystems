import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminAccounts.styles";
import api from "../../lib/api";
import { formatBizRegNo } from "../../lib/formatBizRegNo";

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
  const [employees, setEmployees] = useState([]);
  const [expandedAdminId, setExpandedAdminId] = useState(null);
  const [expandedEmpId, setExpandedEmpId] = useState(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const [userList, empList] = await Promise.all([
      api.admin.users(bizRegNo),
      api.biz.employees(bizRegNo),
    ]);
    setUsers(Array.isArray(userList) ? userList : []);
    setEmployees(Array.isArray(empList) ? empList : []);
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
      <Text style={s.sub}>이 사업장에 등록된 관리자 계정과 직원 목록입니다</Text>

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
              const expanded = expandedAdminId === u.adminId;
              return (
                <TouchableOpacity
                  key={u.adminId}
                  style={s.card}
                  activeOpacity={0.8}
                  onPress={() => setExpandedAdminId(expanded ? null : u.adminId)}
                >
                  <View style={s.cardTopRow}>
                    <View>
                      <Text style={s.adminNm}>{u.adminNm || "이름 미등록"}</Text>
                      <Text style={s.adminId}>{u.adminId}</Text>
                    </View>
                    <View style={s.cardTopRight}>
                      <View style={[s.roleBadge, isSuper ? s.roleBadgeSuper : s.roleBadgeBiz]}>
                        <Text style={[s.roleBadgeText, isSuper ? s.roleBadgeTextSuper : s.roleBadgeTextBiz]}>
                          {ROLE_LABEL[u.adminRole] || u.adminRole}
                        </Text>
                      </View>
                      <Text style={[s.chev, expanded && s.chevOpen]}>›</Text>
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

                  {expanded && (
                    <View style={s.detailBox}>
                      <View style={s.detailRow}><Text style={s.detailKey}>사업자번호</Text><Text style={s.detailVal}>{formatBizRegNo(u.bizRegNo)}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>관리자ID</Text><Text style={s.detailVal}>{u.adminId}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>권한</Text><Text style={s.detailVal}>{ROLE_LABEL[u.adminRole] || u.adminRole}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>휴대전화</Text><Text style={s.detailVal}>{u.mobileTel || "-"}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>전화</Text><Text style={s.detailVal}>{u.tel || "-"}</Text></View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitleText}>직원 목록</Text>
            <Text style={s.sectionCount}>{employees.length}명</Text>
          </View>

          {employees.length === 0 ? (
            <Text style={s.emptyText}>등록된 직원이 없습니다</Text>
          ) : (
            employees.map(emp => {
              const isOn = emp.useYn === "Y";
              const expanded = expandedEmpId === emp.empId;
              return (
                <TouchableOpacity
                  key={emp.empId}
                  style={s.card}
                  activeOpacity={0.8}
                  onPress={() => setExpandedEmpId(expanded ? null : emp.empId)}
                >
                  <View style={s.cardTopRow}>
                    <View>
                      <Text style={s.adminNm}>{emp.empNm}</Text>
                      <Text style={s.adminId}>{emp.empId}</Text>
                    </View>
                    <View style={s.cardTopRight}>
                      <View style={[s.roleBadge, s.roleBadgePosition]}>
                        <Text style={[s.roleBadgeText, s.roleBadgeTextPosition]}>{emp.positionNm || "직책 미등록"}</Text>
                      </View>
                      <Text style={[s.chev, expanded && s.chevOpen]}>›</Text>
                    </View>
                  </View>

                  <View style={s.metaRow}>
                    <Text style={s.meta}>{emp.mobileTel || "휴대전화 없음"}</Text>
                    <Text style={s.metaDot}>·</Text>
                    <View style={s.useBadge}>
                      <View style={[s.useDot, isOn ? s.useDotOn : s.useDotOff]} />
                      <Text style={s.useText}>{isOn ? "재직중" : "퇴직"}</Text>
                    </View>
                  </View>

                  <Text style={s.regDt}>입사일 {formatDt(emp.hireDt)}{emp.resignDt ? ` · 퇴직일 ${formatDt(emp.resignDt)}` : ""}</Text>

                  {expanded && (
                    <View style={s.detailBox}>
                      <View style={s.detailRow}><Text style={s.detailKey}>소속</Text><Text style={s.detailVal}>{emp.deptNm || "-"}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>이메일</Text><Text style={s.detailVal}>{emp.email || "-"}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>휴대전화</Text><Text style={s.detailVal}>{emp.mobileTel || "-"}</Text></View>
                      <View style={s.detailRow}><Text style={s.detailKey}>메모</Text><Text style={s.detailVal}>{emp.rmrk || "-"}</Text></View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
