import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Modal } from "react-native";
import { s } from "../../styles/admin/AdminReservations.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
const formatRsvnDt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_KR[d.getDay()]}) ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const STATUS_STYLE_KEY = { PENDING: "statusPending", CONFIRMED: "statusConfirmed", REJECTED: "statusRejected", CANCELLED: "statusCancelled", COMPLETED: "statusCompleted" };
const isPast = (iso) => new Date(iso) <= new Date();
// 상태 상관없이 예약일시가 가장 최근(미래로 가장 늦은) 순으로 정렬
const sortReservations = (list) => [...list].sort((a, b) => new Date(b.rsvnDt) - new Date(a.rsvnDt));

export default function AdminReservations({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [statusLabels, setStatusLabels] = useState({});
  const [busyRsvnNo, setBusyRsvnNo] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmCompleteRsvnNo, setConfirmCompleteRsvnNo] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const [list, statusCodes] = await Promise.all([
      api.reservation.listByBiz(bizRegNo),
      api.commonCode.list("RSVN_STATUS"),
    ]);
    setReservations(sortReservations(Array.isArray(list) ? list : []));
    const labelMap = {};
    (Array.isArray(statusCodes) ? statusCodes : []).forEach(c => { labelMap[c.cd] = c.cdNm; });
    setStatusLabels(labelMap);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const approve = async (rsvnNo) => {
    setBusyRsvnNo(rsvnNo);
    const { data, error } = await api.reservation.updateStatus(rsvnNo, { rsvnStatus: "CONFIRMED" });
    setBusyRsvnNo(null);
    if (error || !data) { setAlertMsg("승인 처리에 실패했습니다. 다시 시도해주세요."); return; }
    setReservations(prev => sortReservations(prev.map(r => r.rsvnNo === rsvnNo ? data : r)));
  };

  const doReject = async () => {
    const rsvnNo = rejectTarget;
    setRejectTarget(null);
    setBusyRsvnNo(rsvnNo);
    const { data, error } = await api.reservation.updateStatus(rsvnNo, { rsvnStatus: "REJECTED", rejectRsn: rejectReason.trim() || null });
    setBusyRsvnNo(null);
    setRejectReason("");
    if (error || !data) { setAlertMsg("거절 처리에 실패했습니다. 다시 시도해주세요."); return; }
    setReservations(prev => sortReservations(prev.map(r => r.rsvnNo === rsvnNo ? data : r)));
  };

  const doComplete = async () => {
    const rsvnNo = confirmCompleteRsvnNo;
    setConfirmCompleteRsvnNo(null);
    setBusyRsvnNo(rsvnNo);
    const { data, error } = await api.reservation.updateStatus(rsvnNo, { rsvnStatus: "COMPLETED" });
    setBusyRsvnNo(null);
    if (error || !data) { setAlertMsg("처리에 실패했습니다. 다시 시도해주세요."); return; }
    setReservations(prev => sortReservations(prev.map(r => r.rsvnNo === rsvnNo ? data : r)));
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
        <Text style={s.title}>예약 승인/거절</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : reservations.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>예약 내역이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {reservations.map(r => {
            const busy = busyRsvnNo === r.rsvnNo;
            return (
              <View key={r.rsvnNo} style={s.card}>
                <View style={s.cardTopRow}>
                  <Text style={s.dt}>{formatRsvnDt(r.rsvnDt)}</Text>
                  <View style={[s.statusBadge, s[STATUS_STYLE_KEY[r.rsvnStatus]]]}>
                    <Text style={s.statusBadgeText}>{statusLabels[r.rsvnStatus] || r.rsvnStatus}</Text>
                  </View>
                </View>
                <Text style={s.meta}>{r.guestName} · {r.guestPhone || "연락처 없음"} · {r.partySize}명 · 좌석 {r.seatCd || "미지정"}</Text>
                {r.memo ? <Text style={s.memo}>메모: {r.memo}</Text> : null}
                {r.rsvnStatus === "REJECTED" && r.rejectRsn ? <Text style={s.rejectRsn}>거절사유: {r.rejectRsn}</Text> : null}
                <Text style={s.rsvnNo}>예약번호 {r.rsvnNo}</Text>

                {r.rsvnStatus === "PENDING" && (
                  <View style={s.btnRow}>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => setRejectTarget(r.rsvnNo)} disabled={busy}>
                      <Text style={s.rejectBtnText}>거절</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.approveBtn} onPress={() => approve(r.rsvnNo)} disabled={busy}>
                      {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.approveBtnText}>승인</Text>}
                    </TouchableOpacity>
                  </View>
                )}
                {r.rsvnStatus === "CONFIRMED" && isPast(r.rsvnDt) && (
                  <View style={s.btnRow}>
                    <TouchableOpacity style={s.completeBtn} onPress={() => setConfirmCompleteRsvnNo(r.rsvnNo)} disabled={busy}>
                      {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.completeBtnText}>이용완료 처리</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* 거절 사유 입력 */}
      {!!rejectTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setRejectTarget(null)}>
          <View style={s.rejectOverlay}>
            <View style={s.rejectCard}>
              <Text style={s.rejectTitle}>예약을 거절하시겠어요?</Text>
              <TextInput
                style={s.rejectInput}
                placeholder="거절 사유 (선택)"
                placeholderTextColor="#94a3b8"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
              />
              <View style={s.rejectBtnRow}>
                <TouchableOpacity style={s.rejectCancelBtn} onPress={() => { setRejectTarget(null); setRejectReason(""); }}>
                  <Text style={s.rejectCancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.rejectConfirmBtn} onPress={doReject}>
                  <Text style={s.rejectConfirmBtnText}>거절하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal
        visible={!!confirmCompleteRsvnNo}
        message="이용완료 처리하시겠어요?"
        confirmText="완료 처리"
        cancelText="취소"
        onConfirm={doComplete}
        onCancel={() => setConfirmCompleteRsvnNo(null)}
      />
      <ConfirmModal
        visible={!!alertMsg}
        message={alertMsg}
        onConfirm={() => setAlertMsg(null)}
      />
    </View>
  );
}
