import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { s } from "../../styles/admin/AdminSeatStatus.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const REFRESH_MS = 10000;

const STATE_META = {
  empty: { color: "#5b6480", bg: "#161b28", label: "비어있음" },
  seated: { color: "#f0a03c", bg: "#241b0c", label: "착석" },
  ordered: { color: "#4c8dff", bg: "#0e1a30", label: "주문완료" },
  paid: { color: "#34d399", bg: "#0b2019", label: "결제완료" },
};
const STATE_ORDER = ["empty", "seated", "ordered", "paid"];
const WARN_COLOR = "#f0603c";

const SORT_OPTIONS = [
  { key: null, label: "기본순서" },
  { key: "empty", label: "비어있음 우선" },
  { key: "seated", label: "착석 우선" },
  { key: "ordered", label: "주문완료 우선" },
  { key: "paid", label: "결제완료 우선" },
];

const pad = (n) => String(n).padStart(2, "0");
const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
const fmtWon = (n) => `₩${n.toLocaleString()}`;
const fmtClock = (d) =>
  `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${DAY_KR[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())} 기준`;
const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AdminSeatStatus({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [seats, setSeats] = useState([]);
  const [asOf, setAsOf] = useState(new Date());
  const [togglingSeat, setTogglingSeat] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortPickerOpen, setSortPickerOpen] = useState(false);
  const [detailSeat, setDetailSeat] = useState(null);
  const [releaseConfirmSeat, setReleaseConfirmSeat] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    const list = await api.biz.seatStatus(bizRegNo);
    setSeats(Array.isArray(list) ? list : []);
    setAsOf(new Date());
    setLoaded(true);
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [bizRegNo]);

  const toggleSeat = async (seatCd, nextStatus) => {
    setTogglingSeat(seatCd);
    await api.biz.updateSeatStatus(bizRegNo, seatCd, nextStatus);
    await load();
    setTogglingSeat(null);
  };

  // 미결제 내역이 남아있는 좌석을 해제할 땐 확인을 한 번 거친다 — 실수로 미결제 매출을 놓치지 않도록.
  const requestAction = (seat, nextStatus) => {
    if (nextStatus === "EMPTY" && seat.unpaidAmount != null) {
      setReleaseConfirmSeat(seat);
      return;
    }
    toggleSeat(seat.seatCd, nextStatus);
  };

  const total = seats.length;
  const occupied = seats.filter(v => v.state !== "empty").length;
  const counts = Object.fromEntries(STATE_ORDER.map(k => [k, seats.filter(v => v.state === k).length]));
  const warnCount = seats.filter(v => v.warn).length;

  // 선택한 상태를 맨 앞으로 보내고 나머지는 기존 순서 유지 — 목록에서 숨기지 않고 순서만 바꾼다.
  const displayOrder = sortKey ? [sortKey, ...STATE_ORDER.filter(k => k !== sortKey)] : STATE_ORDER;
  const sortedSeats = sortKey
    ? [...seats].sort((a, b) => displayOrder.indexOf(a.state) - displayOrder.indexOf(b.state))
    : seats;
  const sortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label || "기본순서";
  const detailSeatLive = detailSeat ? seats.find(v => v.seatCd === detailSeat.seatCd) || detailSeat : null;
  const detailOrders = detailSeatLive?.orders || [];
  const detailUnpaid = detailOrders.filter(o => !o.paid);
  const detailPaid = detailOrders.filter(o => o.paid);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.pageContent}>
      <View style={s.topbar}>
        <View>
          <Text style={s.eyebrow}>FLOOR · LIVE</Text>
          <Text style={s.title}>좌석 점유현황</Text>
        </View>
        <View style={s.clockRow}>
          <View style={s.liveDot} />
          <Text style={s.clockText}>{fmtClock(asOf)}</Text>
        </View>
      </View>

      {!loaded ? (
        <View style={s.center}><ActivityIndicator color="#eef1f8" /></View>
      ) : total === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>등록된 좌석이 없습니다</Text></View>
      ) : (
        <>
          <View style={s.summary}>
            <View style={s.summaryTopRow}>
              <View style={s.summaryFigureRow}>
                <Text style={s.summaryNum}>{occupied}</Text>
                <Text style={s.summaryOf}>/ {total}석 사용 중</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                {warnCount > 0 && (
                  <View style={s.warnTag}>
                    <Text style={s.warnTagText}>⚠ 주문 확인 {warnCount}건</Text>
                  </View>
                )}
                <TouchableOpacity style={s.sortField} onPress={() => setSortPickerOpen(true)}>
                  <Text style={s.sortFieldText}>정렬: {sortLabel} ▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.capacityBar}>
              {seats.map((v, i) => (
                <View key={i} style={[s.capacitySeg, v.state !== "empty" && s.capacitySegFilled]} />
              ))}
            </View>

            <View style={s.legendRow}>
              {displayOrder.map(key => (
                <View key={key} style={s.legendItem}>
                  <View style={[s.legendSwatch, { backgroundColor: STATE_META[key].color }]} />
                  <Text style={s.legendLabel} numberOfLines={1}>{STATE_META[key].label}</Text>
                  <Text style={[s.legendCount, { color: STATE_META[key].color }]}>{counts[key]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.grid}>
            {sortedSeats.map((v, i) => (
              <TableCard key={i} seat={v} meta={STATE_META[v.state]} onAction={requestAction} toggling={togglingSeat === v.seatCd} onOpenDetail={setDetailSeat} />
            ))}
          </View>
        </>
      )}

      <Modal visible={sortPickerOpen} transparent animationType="fade" onRequestClose={() => setSortPickerOpen(false)}>
        <TouchableOpacity style={s.sortOverlay} activeOpacity={1} onPress={() => setSortPickerOpen(false)}>
          <View style={s.sortBox}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[s.sortRow, sortKey === opt.key && s.sortRowActive]}
                onPress={() => { setSortKey(opt.key); setSortPickerOpen(false); }}
              >
                <Text style={[s.sortRowText, sortKey === opt.key && s.sortRowTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!detailSeat} transparent animationType="fade" onRequestClose={() => setDetailSeat(null)}>
        <TouchableOpacity style={s.sortOverlay} activeOpacity={1} onPress={() => setDetailSeat(null)}>
          <TouchableOpacity activeOpacity={1} style={s.detailBox}>
            <Text style={s.detailTitle}>{detailSeatLive?.seatNm}</Text>

            <ScrollView style={s.detailScroll}>
              <Text style={[s.detailSectionTitle, s.detailSectionUnpaid]}>미결제내역</Text>
              {detailUnpaid.length === 0 ? (
                <Text style={s.detailEmptyText}>없음</Text>
              ) : detailUnpaid.map(o => (
                <View key={o.orderNo} style={s.detailOrderCard}>
                  <View style={s.detailOrderRow}>
                    <Text style={s.detailOrderTime}>{fmtTime(o.regDt)}</Text>
                    <Text style={s.detailOrderAmt}>{fmtWon(o.amount)}</Text>
                  </View>
                  {o.items?.length > 0 && (
                    <Text style={s.detailOrderItems}>{o.items.map(it => `${it.menuNm} x${it.qty}`).join(", ")}</Text>
                  )}
                </View>
              ))}

              <Text style={[s.detailSectionTitle, s.detailSectionPaid]}>결제내역</Text>
              {detailPaid.length === 0 ? (
                <Text style={s.detailEmptyText}>없음</Text>
              ) : detailPaid.map(o => (
                <View key={o.orderNo} style={s.detailOrderCard}>
                  <View style={s.detailOrderRow}>
                    <Text style={s.detailOrderTime}>{fmtTime(o.regDt)}</Text>
                    <Text style={s.detailOrderAmt}>{fmtWon(o.amount)}</Text>
                  </View>
                  {o.items?.length > 0 && (
                    <Text style={s.detailOrderItems}>{o.items.map(it => `${it.menuNm} x${it.qty}`).join(", ")}</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.detailCloseBtn} onPress={() => setDetailSeat(null)}>
              <Text style={s.detailCloseBtnText}>닫기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ConfirmModal
        visible={!!releaseConfirmSeat}
        message={`"${releaseConfirmSeat?.seatNm}" 좌석에 미결제 ${releaseConfirmSeat ? fmtWon(releaseConfirmSeat.unpaidAmount) : ""}이 남아있습니다.\n그래도 해제하시겠어요?`}
        confirmText="해제"
        cancelText="취소"
        danger
        onConfirm={() => {
          const seatCd = releaseConfirmSeat.seatCd;
          setReleaseConfirmSeat(null);
          toggleSeat(seatCd, "EMPTY");
        }}
        onCancel={() => setReleaseConfirmSeat(null)}
      />
    </ScrollView>
  );
}

function TableCard({ seat, meta, onAction, toggling, onOpenDetail }) {
  const isEmpty = seat.state === "empty";
  const nextStatus = isEmpty ? "SEATED" : "EMPTY";
  const actionLabel = toggling ? "처리 중..." : isEmpty ? "착석 처리" : "해제";

  return (
    <View style={[s.tile, { backgroundColor: meta.bg, borderTopColor: seat.warn ? WARN_COLOR : meta.color }]}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[s.cardName, isEmpty && s.cardNameEmpty]} numberOfLines={1}>{seat.seatNm}</Text>
          <Text style={s.cardCap}>{seat.capacity}인{seat.zone ? ` · ${seat.zone}` : ""}</Text>
        </View>
        {seat.elapsedMin != null && (
          <Text style={[s.cardTime, seat.warn && s.cardTimeWarn]}>{seat.elapsedMin}분</Text>
        )}
      </View>

      <View style={s.cardStateRow}>
        <View style={[s.cardStateDot, { backgroundColor: seat.warn ? WARN_COLOR : meta.color }]} />
        <Text style={[s.cardStateText, { color: seat.warn ? WARN_COLOR : meta.color }]} numberOfLines={1}>
          {seat.state === "seated" ? `착석${seat.warn ? " · 확인필요" : " · 주문 전"}` : meta.label}
        </Text>
      </View>
      {(seat.paidAmount != null || seat.unpaidAmount != null) && (
        <TouchableOpacity style={s.amountRow} onPress={() => onOpenDetail(seat)}>
          {seat.paidAmount != null && <Text style={[s.cardAmtSmall, s.cardAmtPaid]}>결제 {fmtWon(seat.paidAmount)}</Text>}
          {seat.unpaidAmount != null && <Text style={[s.cardAmtSmall, s.cardAmtUnpaid]}>미결제 {fmtWon(seat.unpaidAmount)}</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.cardAction} disabled={toggling} onPress={() => onAction(seat, nextStatus)}>
        <Text style={s.cardActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
