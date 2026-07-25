import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminBizApprovals.styles";
import api from "../../lib/api";
import { formatBizRegNo } from "../../lib/formatBizRegNo";
import ConfirmModal from "../../components/ConfirmModal";

// 국세청 상태조회 결과 문자열을 뱃지 색상으로 매핑 — "계속사업자"만 정상, 나머지(휴업/폐업/미확인)는 경고 처리
const ntsBadgeStyle = (ntsStatus) => {
  if (ntsStatus === "계속사업자") return { box: s.ntsBadgeOk, text: s.ntsBadgeTextOk };
  if (!ntsStatus) return { box: s.ntsBadgeUnknown, text: s.ntsBadgeTextUnknown };
  return { box: s.ntsBadgeWarn, text: s.ntsBadgeTextWarn };
};

export default function AdminBizApprovals() {
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState([]);
  const [busyBizNo, setBusyBizNo] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // bizRegNo | null
  const [rejectReason, setRejectReason] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    setLoaded(false);
    const result = await api.biz.pendingApprovals();
    setList(Array.isArray(result) ? result : []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const approve = async (bizRegNo) => {
    setBusyBizNo(bizRegNo);
    const { error } = await api.biz.approveBiz(bizRegNo);
    setBusyBizNo(null);
    if (error) { setAlertMsg(`승인 실패: ${error?.message || "알 수 없는 오류"}`); return; }
    setList(prev => prev.filter(b => b.bizRegNo !== bizRegNo));
  };

  const openReject = (bizRegNo) => { setRejectTarget(bizRegNo); setRejectReason(""); };
  const closeReject = () => { setRejectTarget(null); setRejectReason(""); };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    setBusyBizNo(rejectTarget);
    const { error } = await api.biz.rejectBiz(rejectTarget, { reason: rejectReason.trim() });
    setBusyBizNo(null);
    if (error) { setAlertMsg(`거부 실패: ${error?.message || "알 수 없는 오류"}`); return; }
    setList(prev => prev.filter(b => b.bizRegNo !== rejectTarget));
    closeReject();
  };

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>가입 승인 관리</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : list.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>승인 대기 중인 가입건이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {list.map(biz => {
            const badge = ntsBadgeStyle(biz.ntsStatus);
            const busy = busyBizNo === biz.bizRegNo;
            return (
              <View key={biz.bizRegNo} style={s.card}>
                <View style={s.cardTopRow}>
                  <View>
                    <Text style={s.bizNm}>{biz.bizNm}</Text>
                    <Text style={s.bizRegNo}>{formatBizRegNo(biz.bizRegNo)}</Text>
                    <Text style={s.repNm}>대표자 {biz.repNm}</Text>
                  </View>
                  <View style={[s.ntsBadge, badge.box]}>
                    <Text style={[s.ntsBadgeText, badge.text]}>
                      국세청: {biz.ntsStatus || "확인 불가"}
                    </Text>
                  </View>
                </View>

                <View>
                  <View style={s.detailRow}><Text style={s.detailKey}>전화</Text><Text style={s.detailVal}>{biz.telNo || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>휴대폰</Text><Text style={s.detailVal}>{biz.mobileTel || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>이메일</Text><Text style={s.detailVal}>{biz.emailAddr || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>주소</Text><Text style={s.detailVal}>{[biz.addr, biz.addrDtl].filter(Boolean).join(" ") || "-"}</Text></View>
                </View>

                {biz.bizCertUrl ? (
                  <Image source={{ uri: biz.bizCertUrl }} style={s.certImage} resizeMode="contain" />
                ) : (
                  <Text style={s.certMissing}>사업자등록증이 아직 업로드되지 않았습니다.</Text>
                )}

                <View style={s.btnRow}>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => openReject(biz.bizRegNo)} disabled={busy}>
                    <Text style={s.rejectBtnText}>거부</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.approveBtn} onPress={() => approve(biz.bizRegNo)} disabled={busy}>
                    {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.approveBtnText}>승인</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {!!rejectTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={closeReject}>
          <View style={s.rejectOverlay}>
            <View style={s.rejectCard}>
              <Text style={s.rejectTitle}>가입 거부 사유</Text>
              <TextInput
                style={s.rejectInput}
                placeholder="거부 사유를 입력해주세요"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
              />
              <View style={s.btnRow}>
                <TouchableOpacity style={s.rejectBtn} onPress={closeReject}>
                  <Text style={s.rejectBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.approveBtn} onPress={submitReject} disabled={!rejectReason.trim()}>
                  <Text style={s.approveBtnText}>거부하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
