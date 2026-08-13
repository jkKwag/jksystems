import { View, Text, useWindowDimensions } from "react-native";
import { s } from "../../styles/admin/AdminSeatStatus.styles";

const BOARD_BREAKPOINT = 820;

// 하드코딩 목업 데이터 — 실제 좌석/주문 연동 전까지 화면 확인용
const SEATS = [
  { seatNm: "창가 4인석", capacity: 4, zone: "창가", state: "paid", elapsedMin: 23, amount: 34000 },
  { seatNm: "룸 B", capacity: 8, zone: "룸", state: "seated", elapsedMin: 6 },
  { seatNm: "룸 A", capacity: 6, zone: "룸", state: "ordered", elapsedMin: 14, amount: 58000 },
  { seatNm: "테라스 2인석", capacity: 2, zone: "야외", state: "empty" },
  { seatNm: "바 좌석 1", capacity: 2, zone: "카운터", state: "ordered", elapsedMin: 3, amount: 17000 },
  { seatNm: "바 좌석 2", capacity: 2, zone: "카운터", state: "empty" },
  { seatNm: "창가 2인석", capacity: 2, zone: "창가", state: "seated", elapsedMin: 41, warn: true },
  { seatNm: "룸 C", capacity: 4, zone: "룸", state: "paid", elapsedMin: 52, amount: 61500 },
];

const STATE_META = {
  empty: { color: "#5b6480", bg: "#161b28", label: "비어있음" },
  seated: { color: "#f0a03c", bg: "#241b0c", label: "착석" },
  ordered: { color: "#4c8dff", bg: "#0e1a30", label: "주문완료" },
  paid: { color: "#34d399", bg: "#0b2019", label: "결제완료" },
};
const STATE_ORDER = ["empty", "seated", "ordered", "paid"];
const WARN_COLOR = "#f0603c";

const fmtWon = (n) => `₩${n.toLocaleString()}`;

export default function AdminSeatStatus() {
  const { width } = useWindowDimensions();
  const isNarrow = width < BOARD_BREAKPOINT;

  const total = SEATS.length;
  const occupied = SEATS.filter(v => v.state !== "empty").length;
  const counts = Object.fromEntries(STATE_ORDER.map(k => [k, SEATS.filter(v => v.state === k).length]));
  const warnCount = SEATS.filter(v => v.warn).length;

  return (
    <View style={s.page}>
      <View style={s.topbar}>
        <View>
          <Text style={s.eyebrow}>FLOOR · LIVE</Text>
          <Text style={s.title}>좌석 점유현황</Text>
        </View>
        <View style={s.clockRow}>
          <View style={s.liveDot} />
          <Text style={s.clockText}>2026.08.13(목) 13:42 기준</Text>
        </View>
      </View>

      <View style={s.summary}>
        <View style={s.summaryTopRow}>
          <View style={s.summaryFigureRow}>
            <Text style={s.summaryNum}>{occupied}</Text>
            <Text style={s.summaryOf}>/ {total}석 사용 중</Text>
          </View>
          {warnCount > 0 && (
            <View style={s.warnTag}>
              <Text style={s.warnTagText}>⚠ 주문 확인 {warnCount}건</Text>
            </View>
          )}
        </View>

        <View style={s.capacityBar}>
          {SEATS.map((v, i) => (
            <View key={i} style={[s.capacitySeg, v.state !== "empty" && s.capacitySegFilled]} />
          ))}
        </View>

        <View style={s.legendRow}>
          {STATE_ORDER.map(key => (
            <View key={key} style={s.legendItem}>
              <View style={[s.legendSwatch, { backgroundColor: STATE_META[key].color }]} />
              <Text style={s.legendLabel} numberOfLines={1}>{STATE_META[key].label}</Text>
              <Text style={[s.legendCount, { color: STATE_META[key].color }]}>{counts[key]}</Text>
            </View>
          ))}
        </View>
      </View>

      {isNarrow ? <TileGrid seats={SEATS} /> : <Board seats={SEATS} />}
    </View>
  );
}

// 넓은 화면 — 상태별 칸반 보드 (비어있음 → 착석 → 주문완료 → 결제완료 흐름)
function Board({ seats }) {
  return (
    <View style={s.board}>
      {STATE_ORDER.map(stateKey => {
        const meta = STATE_META[stateKey];
        const items = seats.filter(v => v.state === stateKey);
        return (
          <View key={stateKey} style={s.col}>
            <View style={[s.colHead, { borderBottomColor: meta.color }]}>
              <View style={s.colHeadLabelRow}>
                <View style={[s.colHeadSwatch, { backgroundColor: meta.color }]} />
                <Text style={s.colHeadLabel}>{meta.label}</Text>
              </View>
              <View style={[s.colCountBadge, { backgroundColor: meta.color + "29" }]}>
                <Text style={[s.colCountText, { color: meta.color }]}>{items.length}</Text>
              </View>
            </View>
            <View style={s.colBody}>
              {items.map((v, i) => <TableCard key={i} seat={v} meta={meta} variant="board" />)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// 좁은 화면 — 전체 좌석을 색상 타일로 한 화면에
function TileGrid({ seats }) {
  return (
    <View style={s.grid}>
      {seats.map((v, i) => (
        <TableCard key={i} seat={v} meta={STATE_META[v.state]} variant="tile" />
      ))}
    </View>
  );
}

function TableCard({ seat, meta, variant }) {
  const isBoard = variant === "board";
  const cardStyle = isBoard
    ? [s.boardCard, { borderLeftColor: seat.warn ? WARN_COLOR : meta.color }, seat.state === "empty" && s.boardCardEmpty]
    : [s.tile, { backgroundColor: meta.bg, borderTopColor: seat.warn ? WARN_COLOR : meta.color }];

  return (
    <View style={cardStyle}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[s.cardName, seat.state === "empty" && s.cardNameEmpty]} numberOfLines={1}>{seat.seatNm}</Text>
          <Text style={s.cardCap}>{seat.capacity}인 · {seat.zone}</Text>
        </View>
        {seat.elapsedMin != null && (
          <Text style={[s.cardTime, seat.warn && s.cardTimeWarn]}>{seat.elapsedMin}분</Text>
        )}
      </View>

      {isBoard ? (
        <View style={s.boardCardMeta}>
          {seat.state === "empty" ? (
            <Text style={s.emptyCta}>입장 대기</Text>
          ) : (
            <>
              {seat.amount != null && <Text style={s.cardAmt}>{fmtWon(seat.amount)}</Text>}
              <Text style={[s.cardTag, { color: seat.warn ? WARN_COLOR : meta.color }]}>
                {seat.state === "seated" ? (seat.warn ? "주문 확인 필요" : "주문 전") : seat.state === "ordered" ? "결제 대기" : "완료"}
              </Text>
            </>
          )}
        </View>
      ) : (
        <>
          <View style={s.cardStateRow}>
            <View style={[s.cardStateDot, { backgroundColor: seat.warn ? WARN_COLOR : meta.color }]} />
            <Text style={[s.cardStateText, { color: seat.warn ? WARN_COLOR : meta.color }]} numberOfLines={1}>
              {seat.state === "seated" ? `착석${seat.warn ? " · 확인필요" : " · 주문 전"}` : meta.label}
            </Text>
          </View>
          {seat.amount != null && <Text style={s.cardAmtSmall}>{fmtWon(seat.amount)}</Text>}
        </>
      )}
    </View>
  );
}
