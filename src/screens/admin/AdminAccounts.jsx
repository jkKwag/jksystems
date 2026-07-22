import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Animated, Easing } from "react-native";
import { s } from "../../styles/admin/AdminAccounts.styles";
import api from "../../lib/api";
import { formatBizRegNo } from "../../lib/formatBizRegNo";
import ConfirmModal from "../../components/ConfirmModal";

const pad = (n) => String(n).padStart(2, "0");
const formatDt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

const ROLE_LABEL = { SUPER: "최고관리자", BIZ: "사업장관리자" };

export default function AdminAccounts({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;
  const isSuperAdmin = adminInfo?.adminRole === "SUPER";
  const canChangePw = (targetId) => isSuperAdmin || adminInfo?.adminId === targetId;

  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expandedAdminId, setExpandedAdminId] = useState(null);
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [pwTarget, setPwTarget] = useState(null); // { type: "admin"|"emp", id, nm }
  const [currentPw, setCurrentPw] = useState("");
  const [currentPwCheck, setCurrentPwCheck] = useState(null); // null | "checking" | "valid" | "invalid"
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwTouched, setPwTouched] = useState({ current: false, next: false, confirm: false });
  const [resultMsg, setResultMsg] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const currentPwEmpty = pwTouched.current && !currentPw;
  const newPwTooShort = newPw.length < 8;
  const newPwSameAsCurrent = newPw.length > 0 && !!currentPw && newPw === currentPw;
  const newPwValid = !newPwTooShort && !newPwSameAsCurrent;
  const newPwConfirmValid = newPwConfirm.length > 0 && newPwConfirm === newPw;

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

  useEffect(() => {
    if (loaded) return;
    spinAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [loaded]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const closePwModal = () => {
    setPwTarget(null);
    setCurrentPw("");
    setCurrentPwCheck(null);
    setNewPw("");
    setNewPwConfirm("");
    setPwTouched({ current: false, next: false, confirm: false });
  };

  const checkCurrentPassword = async () => {
    setPwTouched(t => ({ ...t, current: true }));
    if (!currentPw) { setCurrentPwCheck(null); return; }
    setCurrentPwCheck("checking");
    const body = { password: currentPw, requesterId: adminInfo?.adminId, requesterRole: adminInfo?.adminRole };
    const { data, error } = pwTarget.type === "admin"
      ? await api.admin.verifyPassword(pwTarget.id, body)
      : await api.admin.verifyEmployeePassword(pwTarget.id, body);
    setCurrentPwCheck(!error && data?.valid ? "valid" : "invalid");
  };

  const submitPwChange = async () => {
    if (currentPwCheck !== "valid" || !newPwValid || !newPwConfirmValid) {
      setPwTouched({ current: true, next: true, confirm: true });
      return;
    }
    setPwBusy(true);
    const body = {
      currentPassword: currentPw,
      newPassword: newPw,
      requesterId: adminInfo?.adminId,
      requesterRole: adminInfo?.adminRole,
    };
    const { error } = pwTarget.type === "admin"
      ? await api.admin.changePassword(pwTarget.id, body)
      : await api.admin.changeEmployeePassword(pwTarget.id, body);
    setPwBusy(false);
    if (error) { setResultMsg(`비밀번호 변경 실패: ${error?.message || "알 수 없는 오류"}`); return; }
    setResultMsg("비밀번호가 변경되었습니다.");
    closePwModal();
  };

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
          <Animated.Text style={[s.refreshBtnText, { transform: [{ rotate: spin }] }]}>🔄</Animated.Text>
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
                      {canChangePw(u.adminId) && (
                        <TouchableOpacity
                          style={s.pwChangeBtn}
                          onPress={() => setPwTarget({ type: "admin", id: u.adminId, nm: u.adminNm || u.adminId })}
                        >
                          <Text style={s.pwChangeBtnText}>비밀번호 변경</Text>
                        </TouchableOpacity>
                      )}
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
                      {canChangePw(emp.empId) && (
                        <TouchableOpacity
                          style={s.pwChangeBtn}
                          onPress={() => setPwTarget({ type: "emp", id: emp.empId, nm: emp.empNm || emp.empId })}
                        >
                          <Text style={s.pwChangeBtnText}>비밀번호 변경</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {!!pwTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={closePwModal}>
          <View style={s.pwOverlay}>
            <View style={s.pwCard}>
              <Text style={s.pwTitle}>{pwTarget.nm} 비밀번호 변경</Text>

              <View style={s.pwFieldWrap}>
                <View style={s.pwInputRow}>
                  <TextInput
                    style={[
                      s.pwInput,
                      currentPwCheck === "valid" && s.pwInputValid,
                      (currentPwCheck === "invalid" || currentPwEmpty) && s.pwInputInvalid,
                    ]}
                    placeholder="현재 비밀번호"
                    placeholderTextColor="#94a3b8"
                    value={currentPw}
                    onChangeText={(v) => { setCurrentPw(v); setCurrentPwCheck(null); }}
                    onBlur={checkCurrentPassword}
                    secureTextEntry
                  />
                  {currentPwCheck === "checking" ? (
                    <ActivityIndicator style={s.pwValidIcon} size="small" color="#94a3b8" />
                  ) : currentPwCheck === "valid" ? (
                    <Text style={[s.pwValidIcon, s.pwValidIconOk]}>✓</Text>
                  ) : currentPwCheck === "invalid" ? (
                    <Text style={[s.pwValidIcon, s.pwValidIconBad]}>✕</Text>
                  ) : null}
                </View>
                {currentPwEmpty && (
                  <Text style={s.pwFieldError}>현재 비밀번호를 입력해주세요.</Text>
                )}
                {currentPwCheck === "checking" && (
                  <Text style={s.pwFieldHint}>확인 중...</Text>
                )}
                {currentPwCheck === "invalid" && (
                  <Text style={s.pwFieldError}>현재 비밀번호가 일치하지 않습니다.</Text>
                )}
              </View>

              <View style={s.pwFieldWrap}>
                <View style={s.pwInputRow}>
                  <TextInput
                    style={[s.pwInput, pwTouched.next && (newPwValid ? s.pwInputValid : s.pwInputInvalid)]}
                    placeholder="새 비밀번호 (8자 이상)"
                    placeholderTextColor="#94a3b8"
                    value={newPw}
                    onChangeText={setNewPw}
                    onBlur={() => setPwTouched(t => ({ ...t, next: true }))}
                    secureTextEntry
                  />
                  {pwTouched.next && (
                    <Text style={[s.pwValidIcon, newPwValid ? s.pwValidIconOk : s.pwValidIconBad]}>
                      {newPwValid ? "✓" : "✕"}
                    </Text>
                  )}
                </View>
                {pwTouched.next && !newPwValid && (
                  <Text style={s.pwFieldError}>
                    {newPwTooShort ? "비밀번호는 8자 이상이어야 합니다." : "현재 비밀번호와 다른 비밀번호를 입력해주세요."}
                  </Text>
                )}
              </View>

              <View style={s.pwFieldWrap}>
                <View style={s.pwInputRow}>
                  <TextInput
                    style={[s.pwInput, pwTouched.confirm && (newPwConfirmValid ? s.pwInputValid : s.pwInputInvalid)]}
                    placeholder="새 비밀번호 확인"
                    placeholderTextColor="#94a3b8"
                    value={newPwConfirm}
                    onChangeText={setNewPwConfirm}
                    onBlur={() => setPwTouched(t => ({ ...t, confirm: true }))}
                    secureTextEntry
                  />
                  {pwTouched.confirm && (
                    <Text style={[s.pwValidIcon, newPwConfirmValid ? s.pwValidIconOk : s.pwValidIconBad]}>
                      {newPwConfirmValid ? "✓" : "✕"}
                    </Text>
                  )}
                </View>
                {pwTouched.confirm && !newPwConfirmValid && (
                  <Text style={s.pwFieldError}>
                    {newPwConfirm.length === 0 ? "새 비밀번호 확인을 입력해주세요." : "비밀번호가 일치하지 않습니다."}
                  </Text>
                )}
              </View>
              <View style={s.pwBtnRow}>
                <TouchableOpacity style={s.pwCancelBtn} onPress={closePwModal} disabled={pwBusy}>
                  <Text style={s.pwCancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.pwConfirmBtn} onPress={submitPwChange} disabled={pwBusy}>
                  {pwBusy
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.pwConfirmBtnText}>변경하기</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal
        visible={!!resultMsg}
        message={resultMsg}
        onConfirm={() => setResultMsg(null)}
      />
    </View>
  );
}
