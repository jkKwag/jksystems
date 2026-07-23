import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Animated, Easing } from "react-native";
import { s } from "../../styles/admin/AdminSeats.styles";
import api from "../../lib/api";
import SeatFormModal from "../../components/admin/SeatFormModal";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminSeats({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [seats, setSeats] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined); // undefined=닫힘, null=신규, object=수정
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState(null); // null = 전체
  const [reordering, setReordering] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const highlightTimer = useRef(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const list = await api.biz.seatsAdmin(bizRegNo);
    setSeats(Array.isArray(list) ? list : []);
    setSelectedCapacity(null);
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

  const handleSaveSeat = async (form) => {
    setSaving(true);
    const isEdit = !!formTarget?.seatCd;
    const { data, error } = isEdit
      ? await api.biz.updateSeat(bizRegNo, formTarget.seatCd, form)
      : await api.biz.createSeat(bizRegNo, form);
    setSaving(false);
    if (error || !data) { setAlertMsg("저장에 실패했습니다. 다시 시도해주세요."); return; }
    setFormTarget(undefined);
    setSeats(prev => {
      const next = isEdit ? prev.map(v => v.seatCd === data.seatCd ? data : v) : [...prev, data];
      return [...next].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));
    });
  };

  const doDelete = async () => {
    const seatCd = deleteTarget?.seatCd;
    setDeleteTarget(null);
    const { error } = await api.biz.deleteSeat(bizRegNo, seatCd);
    if (error) { setAlertMsg("삭제에 실패했습니다. 다시 시도해주세요."); return; }
    setSeats(prev => prev.filter(v => v.seatCd !== seatCd));
  };

  const moveSeat = async (list, index, direction) => {
    if (reordering) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const movedSeatCd = list[index].seatCd;
    const arr = [...list];
    [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
    const renumbered = arr.map((v, i) => ({ ...v, sortOrd: i }));
    setReordering(true);
    const results = await Promise.all(renumbered.map(v => api.biz.updateSeat(bizRegNo, v.seatCd, {
      seatNm: v.seatNm,
      seatDesc: v.seatDesc,
      imgUrl: v.imgUrl,
      capacity: v.capacity,
      sortOrd: v.sortOrd,
      useYn: v.useYn,
    })));
    setReordering(false);
    if (results.some(r => r.error)) {
      setAlertMsg("순서 변경에 실패했습니다. 다시 시도해주세요.");
      load();
      return;
    }
    setSeats(prev => {
      const renumberedMap = new Map(renumbered.map(v => [v.seatCd, v]));
      const next = prev.map(v => renumberedMap.get(v.seatCd) || v);
      return [...next].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));
    });
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightId(movedSeatCd);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 3000);
  };

  useEffect(() => () => { if (highlightTimer.current) clearTimeout(highlightTimer.current); }, []);

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  const capacities = [...new Set(seats.map(v => v.capacity))].sort((a, b) => a - b);
  const filteredSeats = selectedCapacity != null ? seats.filter(v => v.capacity === selectedCapacity) : seats;

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>좌석 관리</Text>
        <View style={s.headerBtnRow}>
          <TouchableOpacity style={s.refreshBtn} onPress={load}>
            <Animated.Text style={[s.refreshBtnText, { transform: [{ rotate: spin }] }]}>🔄</Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => setFormTarget(null)}>
            <Text style={s.addBtnText}>+ 새 좌석</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={s.hintText}>좌석 카드를 클릭하면 수정할 수 있어요.</Text>

      {capacities.length > 0 && (
        <View style={s.capFilterBox}>
          <View style={s.capFilterRow}>
            <TouchableOpacity
              style={[s.capChip, selectedCapacity == null && s.capChipActive]}
              onPress={() => setSelectedCapacity(null)}
            >
              <Text style={[s.capChipText, selectedCapacity == null && s.capChipTextActive]}>전체</Text>
            </TouchableOpacity>
            {capacities.map(cap => {
              const active = selectedCapacity === cap;
              return (
                <TouchableOpacity
                  key={cap}
                  style={[s.capChip, active && s.capChipActive]}
                  onPress={() => setSelectedCapacity(cap)}
                >
                  <Text style={[s.capChipText, active && s.capChipTextActive]}>{cap}인</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : filteredSeats.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>{selectedCapacity != null ? "해당 인원의 좌석이 없습니다" : "등록된 좌석이 없습니다"}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {filteredSeats.map((seat, index) => (
            <TouchableOpacity
              key={seat.seatCd}
              style={[s.card, highlightId === seat.seatCd && s.cardHighlight]}
              onPress={() => setFormTarget(seat)}
              activeOpacity={0.75}
            >
              {seat.imgUrl ? (
                <Image source={{ uri: seat.imgUrl }} style={s.thumb} resizeMode="cover" />
              ) : (
                <View style={[s.thumb, s.thumbEmpty]}><Text style={s.thumbEmptyText}>NO IMAGE</Text></View>
              )}
              <View style={s.cardInfo}>
                <View style={s.cardTopRow}>
                  <Text style={s.seatNm} numberOfLines={1}>{seat.seatNm}</Text>
                  {seat.useYn === "N" && <View style={s.offBadge}><Text style={s.offBadgeText}>미노출</Text></View>}
                </View>
                <Text style={s.capacity}>{seat.capacity}인석</Text>
                {seat.seatDesc ? <Text style={s.desc} numberOfLines={1}>{seat.seatDesc}</Text> : null}
              </View>
              <View style={s.cardActions}>
                <View style={s.sortBtnRow}>
                  <TouchableOpacity
                    style={[s.sortBtn, (index === 0 || reordering) && s.sortBtnDisabled]}
                    disabled={index === 0 || reordering}
                    onPress={(e) => { e?.stopPropagation?.(); moveSeat(filteredSeats, index, -1); }}
                  >
                    <Text style={s.sortBtnText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.sortBtn, (index === filteredSeats.length - 1 || reordering) && s.sortBtnDisabled]}
                    disabled={index === filteredSeats.length - 1 || reordering}
                    onPress={(e) => { e?.stopPropagation?.(); moveSeat(filteredSeats, index, 1); }}
                  >
                    <Text style={s.sortBtnText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.sortOrdText}>좌석정렬순번 {seat.sortOrd ?? "-"}</Text>
                <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={(e) => { e?.stopPropagation?.(); setDeleteTarget(seat); }}>
                  <Text style={[s.actionBtnText, s.deleteBtnText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <SeatFormModal
        visible={formTarget !== undefined}
        initial={formTarget}
        saving={saving}
        bizRegNo={bizRegNo}
        onSave={handleSaveSeat}
        onClose={() => setFormTarget(undefined)}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        message={`"${deleteTarget?.seatNm}" 좌석을 삭제하시겠어요?`}
        confirmText="삭제"
        cancelText="취소"
        danger
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
