import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, Platform, TextInput, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { s } from "../styles/SeatsView.styles";
import api from "../lib/api";
import PickupBadge from "../components/PickupBadge";
import ConfirmModal from "../components/ConfirmModal";

const fixedFill = Platform.OS === "web" ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 } : {};

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const getDayCode = (dateStr) => DAY_CODES[new Date(`${dateStr}T00:00:00`).getDay()];

const toMinutes = (hhmmss) => {
  const [h, m] = hhmmss.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// 영업시간(요일별) + 예약 단위시간으로 그날 예약 가능한 시간 슬롯 생성
const buildTimeSlots = (hour, timeUnitMin) => {
  if (!hour || hour.isClosed === "Y" || !hour.openTime || !hour.closeTime) return [];
  const unit = timeUnitMin || 30;
  const start = toMinutes(hour.openTime);
  const end = toMinutes(hour.lastOrderTime || hour.closeTime);
  const breakStart = hour.breakStartTime ? toMinutes(hour.breakStartTime) : null;
  const breakEnd = hour.breakEndTime ? toMinutes(hour.breakEndTime) : null;
  const slots = [];
  for (let t = start; t <= end; t += unit) {
    if (breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd) continue;
    slots.push(toHHMM(t));
  }
  return slots;
};

// 최소 사전예약 시간 이내인 슬롯은 제외
const filterByAdvance = (slots, dateStr, minAdvanceHours) => {
  if (!minAdvanceHours) return slots;
  const cutoff = new Date(Date.now() + minAdvanceHours * 60 * 60 * 1000);
  return slots.filter(t => new Date(`${dateStr}T${t}:00`) >= cutoff);
};

// 이용시간(useTimeMin) 동안 이미 그 좌석이 예약된 시간대이거나, 마감시간 전까지 이용시간이 안 나오는 슬롯인지 체크
const isSlotUnavailable = (t, occupiedWindows, useTimeMin, closeMin) => {
  if (!useTimeMin) return false;
  const start = toMinutes(t);
  const end = start + useTimeMin;
  if (closeMin != null && end > closeMin) return true;
  return occupiedWindows.some(([wStart, wEnd]) => start < wEnd && end > wStart);
};

const getUuid = () => {
  if (Platform.OS !== "web") return null;
  let uuid = localStorage.getItem("scaneat_uuid");
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem("scaneat_uuid", uuid);
  }
  return uuid;
};

const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
const formatRsvnDt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_KR[d.getDay()]}) ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 라벨(예: "예약대기")은 공통코드(RSVN_STATUS)에서 받아오고, 색상 매핑만 화면단에서 유지
const STATUS_STYLE_KEY = { PENDING: "statusPending", CONFIRMED: "statusConfirmed", REJECTED: "statusRejected", CANCELLED: "statusCancelled", COMPLETED: "statusCompleted" };

// 상태 상관없이 예약일시가 가장 최근(미래로 가장 늦은) 순으로 정렬
const sortReservations = (list) => [...list].sort((a, b) => new Date(b.rsvnDt) - new Date(a.rsvnDt));

export default function SeatsView({ visible, onClose, bizno }) {
  const today = new Date().toISOString().split("T")[0];

  const [loaded, setLoaded] = useState(false);
  const [seats, setSeats] = useState([]);
  const [rsvnStd, setRsvnStd] = useState(null);
  const [hoursByDay, setHoursByDay] = useState({});
  const [activeTab, setActiveTab] = useState("book");
  const [myReservations, setMyReservations] = useState([]);
  const [statusLabels, setStatusLabels] = useState({});

  const [expandedSeat, setExpandedSeat] = useState(null);
  const [category, setCategory] = useState("all");
  const [rsvnDate, setRsvnDate] = useState(today);
  const [rsvnTime, setRsvnTime] = useState("");
  const [rsvnPeople, setRsvnPeople] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestTel, setGuestTel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [submittedRsvn, setSubmittedRsvn] = useState(null);
  const [occupiedWindows, setOccupiedWindows] = useState([]);
  const [cancellingRsvn, setCancellingRsvn] = useState(null);
  const [confirmCancelRsvnNo, setConfirmCancelRsvnNo] = useState(null);
  const [cancelAlertMsg, setCancelAlertMsg] = useState(null);

  useEffect(() => {
    if (!expandedSeat || !rsvnDate || !bizno) { setOccupiedWindows([]); return; }
    (async () => {
      const list = await api.reservation.listByBiz(bizno, rsvnDate);
      const useTimeMin = rsvnStd?.useTimeMin || 90;
      const windows = (Array.isArray(list) ? list : [])
        .filter(r => r.seatCd === expandedSeat.seatCd && r.rsvnStatus !== "CANCELLED")
        .map(r => {
          const start = toMinutes(r.rsvnDt.slice(11, 19));
          return [start, start + useTimeMin];
        });
      setOccupiedWindows(windows);
    })();
  }, [expandedSeat, rsvnDate, bizno, rsvnStd]);

  useEffect(() => {
    if (!visible || !bizno) return;
    setLoaded(false);
    (async () => {
      const uuid = getUuid();
      const [std, hours, seatList, rsvnList, statusCodes] = await Promise.all([
        api.biz.reservationStandard(bizno),
        api.biz.hours(bizno),
        api.biz.seats(bizno),
        uuid ? api.reservation.list(uuid) : Promise.resolve([]),
        api.commonCode.list("RSVN_STATUS"),
      ]);
      setRsvnStd(std || null);
      const map = {};
      (Array.isArray(hours) ? hours : []).forEach(h => { map[h.dayOfWeek] = h; });
      setHoursByDay(map);
      setSeats(Array.isArray(seatList) ? seatList : []);
      const bizRsvns = sortReservations((Array.isArray(rsvnList) ? rsvnList : []).filter(r => r.bizRegNo === bizno));
      setMyReservations(bizRsvns);
      const labelMap = {};
      (Array.isArray(statusCodes) ? statusCodes : []).forEach(c => { labelMap[c.cd] = c.cdNm; });
      setStatusLabels(labelMap);
      const hasUpcoming = bizRsvns.some(r => new Date(r.rsvnDt) > new Date());
      setActiveTab(hasUpcoming ? "history" : "book");
      setLoaded(true);
    })();
  }, [visible, bizno]);

  if (!visible) return null;

  const reservationDisabled = loaded && (!rsvnStd || rsvnStd.useYn === "N");

  const maxDateStr = rsvnStd?.maxAdvanceDays
    ? new Date(Date.now() + rsvnStd.maxAdvanceDays * 86400000).toISOString().split("T")[0]
    : undefined;

  const dayHour = rsvnDate ? hoursByDay[getDayCode(rsvnDate)] : null;
  const isDayClosed = dayHour?.isClosed === "Y";
  const closeMin = dayHour?.closeTime ? toMinutes(dayHour.closeTime) : null;
  const timeSlots = rsvnDate
    ? filterByAdvance(buildTimeSlots(dayHour, rsvnStd?.timeUnitMin), rsvnDate, rsvnStd?.minAdvanceHours)
    : [];

  const categories = useMemo(() => {
    const cats = [{ key: "all", label: "전체" }];
    const smallCapacities = [...new Set(seats.filter(sv => sv.capacity < 6).map(sv => sv.capacity))].sort((a, b) => a - b);
    smallCapacities.forEach(c => cats.push({ key: String(c), label: `${c}인` }));
    if (seats.some(sv => sv.capacity >= 6)) cats.push({ key: "group", label: "단체석" });
    return cats;
  }, [seats]);

  const activeRsvnCount = myReservations.filter(r => r.rsvnStatus === "CONFIRMED" || r.rsvnStatus === "PENDING").length;

  const seatCapacity = expandedSeat?.capacity || 99;
  const minPeople = Math.max(1, Math.min(rsvnStd?.minPartySize || 1, seatCapacity));
  const maxPeople = Math.min(seatCapacity, rsvnStd?.maxPartySize || seatCapacity);

  const isNameValid = guestName.trim().length > 0 && guestName.trim().length <= 10;
  const isPhoneValid = /^\d{11}$/.test(guestTel);
  const canSubmitRsvn = !!(rsvnDate && rsvnTime && isNameValid && isPhoneValid && !submitting);

  const openSeat = (seat) => {
    setExpandedSeat(seat);
    setRsvnTime("");
    const seatMin = Math.max(1, Math.min(rsvnStd?.minPartySize || 1, seat.capacity));
    const seatMax = Math.min(seat.capacity, rsvnStd?.maxPartySize || seat.capacity);
    setRsvnPeople(Math.min(Math.max(seatMin, 2), seatMax));
  };

  const closeSeatModal = () => {
    if (submittedRsvn) setActiveTab("history");
    setExpandedSeat(null);
    setSubmittedRsvn(null);
    setGuestName("");
    setGuestTel("");
    setRsvnTime("");
  };

  const confirmReserve = async () => {
    const uuid = getUuid();
    if (!uuid || !bizno) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    await api.consent.postReservation({ uuid, bizRegNo: bizno, guestName: guestName.trim(), guestPhone: guestTel, consentAt: now, regUsrId: "guest", regDt: now });
    const { data, error } = await api.reservation.post({
      uuid,
      bizRegNo: bizno,
      guestName: guestName.trim(),
      guestPhone: guestTel,
      rsvnDt: `${rsvnDate}T${rsvnTime}:00`,
      seatCd: expandedSeat.seatCd,
      partySize: rsvnPeople,
      memo: expandedSeat.seatNm ? `좌석 희망: ${expandedSeat.seatNm}` : null,
    });
    setSubmitting(false);
    setShowConsent(false);
    if (error || !data) { alert("예약에 실패했습니다. 다시 시도해주세요."); return; }
    setSubmittedRsvn({ rsvnNo: data.rsvnNo });
    setMyReservations(prev => sortReservations([data, ...prev]));
  };

  const doCancelReservation = async () => {
    const rsvnNo = confirmCancelRsvnNo;
    setConfirmCancelRsvnNo(null);
    setCancellingRsvn(rsvnNo);
    const { data, error } = await api.reservation.updateStatus(rsvnNo, { rsvnStatus: "CANCELLED" });
    setCancellingRsvn(null);
    if (error || !data) { setCancelAlertMsg("예약 취소에 실패했습니다. 다시 시도해주세요."); return; }
    setMyReservations(prev => sortReservations(prev.map(r => r.rsvnNo === rsvnNo ? data : r)));
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, fixedFill, s.container]}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onClose}>
          <Text style={s.backBtnText}>← 메뉴로</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🪑 테이블 예약</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* 탭 */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tabBtn, activeTab === "book" && s.tabBtnActive]} onPress={() => setActiveTab("book")}>
          <Text style={[s.tabBtnText, activeTab === "book" && s.tabBtnTextActive]}>좌석 예약하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, activeTab === "history" && s.tabBtnActive]} onPress={() => setActiveTab("history")}>
          <Text style={[s.tabBtnText, activeTab === "history" && s.tabBtnTextActive]}>
            내 예약내역{activeRsvnCount > 0 ? ` (${activeRsvnCount})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <View style={s.content}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : activeTab === "history" ? (
        <ScrollView contentContainerStyle={s.historyList}>
          {myReservations.length === 0 ? (
            <Text style={s.notice}>예약내역이 없습니다</Text>
          ) : (
            myReservations.map(r => {
              const seat = seats.find(sv => sv.seatCd === r.seatCd);
              const canCancel = (r.rsvnStatus === "PENDING" || r.rsvnStatus === "CONFIRMED") && new Date(r.rsvnDt) > new Date();
              return (
                <View key={r.rsvnNo} style={s.historyCard}>
                  {seat?.imgUrl ? (
                    <Image source={{ uri: seat.imgUrl }} style={s.historyImg} />
                  ) : (
                    <View style={s.historyImgPlaceholder}>
                      <Text style={s.noImgIcon}>🪑</Text>
                    </View>
                  )}
                  <View style={s.historyInfo}>
                    <View style={s.historyTopRow}>
                      <Text style={s.historyDt}>{formatRsvnDt(r.rsvnDt)}</Text>
                      <View style={[s.statusBadge, s[STATUS_STYLE_KEY[r.rsvnStatus]]]}>
                        <Text style={s.statusBadgeText}>{statusLabels[r.rsvnStatus] || r.rsvnStatus}</Text>
                      </View>
                    </View>
                    <Text style={s.historyMeta}>
                      {seat ? seat.seatNm : "좌석 미지정"} · {r.partySize}명
                    </Text>
                    {r.rsvnStatus === "REJECTED" && r.rejectRsn ? (
                      <Text style={s.historyRejectRsn}>사유: {r.rejectRsn}</Text>
                    ) : null}
                    <View style={s.rsvnNoBadge}>
                      <Text style={s.rsvnNoBadgeText}>예약번호 {r.rsvnNo}</Text>
                    </View>
                    {canCancel && (
                      <TouchableOpacity
                        style={s.historyCancelBtn}
                        onPress={() => setConfirmCancelRsvnNo(r.rsvnNo)}
                        disabled={cancellingRsvn === r.rsvnNo}
                      >
                        {cancellingRsvn === r.rsvnNo ? (
                          <ActivityIndicator color="#ef4444" size="small" />
                        ) : (
                          <Text style={s.historyCancelBtnText}>예약 취소</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : reservationDisabled ? (
        <View style={s.content}>
          <Text style={s.notice}>이 매장은 현재 테이블 예약을 받지 않습니다</Text>
        </View>
      ) : (
        <>
          {/* 카테고리 필터 */}
          <View style={s.catBar}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[s.catChip, category === c.key && s.catChipActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[s.catChipText, category === c.key && s.catChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 좌석 그리드 */}
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.grid}>
              {seats
                .filter(seat =>
                  category === "all" ? true :
                  category === "group" ? seat.capacity >= 6 :
                  seat.capacity === Number(category)
                )
                .map(seat => (
                  <SeatCard key={seat.seatCd} seat={seat} onExpand={() => openSeat(seat)} />
                ))}
            </View>
            {seats.length === 0 && <Text style={s.notice}>등록된 좌석이 없습니다</Text>}
            <Text style={s.notice}>* 좌석 현황은 실시간 변동될 수 있습니다</Text>
          </ScrollView>
        </>
      )}

      {/* 이미지 확대 뷰어 */}
      {expandedSeat && (
        <Modal visible={!!expandedSeat} transparent animationType="fade" onRequestClose={closeSeatModal}>
          <View style={s.viewerBg}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeSeatModal} />
            <ScrollView style={{ width: "100%" }} contentContainerStyle={s.viewerScroll} keyboardShouldPersistTaps="handled">
              <View style={s.viewerBox}>
                {/* 이미지 */}
                {!submittedRsvn && expandedSeat.imgUrl ? (
                  <Image
                    source={{ uri: expandedSeat.imgUrl.replace("w=400&h=220", "w=800&h=500") }}
                    style={s.viewerImg}
                    resizeMode="cover"
                  />
                ) : null}
                <TouchableOpacity style={s.viewerClose} onPress={closeSeatModal}>
                  <Text style={s.viewerCloseText}>✕</Text>
                </TouchableOpacity>

                {submittedRsvn ? (
                  <View style={s.rsvnForm}>
                    <Text style={s.rsvnTitle}>🎉 예약이 접수됐어요!</Text>
                    <PickupBadge no={submittedRsvn.rsvnNo} label="예약번호" />
                    <Text style={{ color: "#94a3b8", fontSize: 13, lineHeight: 18 }}>
                      사장님 확인 후 예약이 확정됩니다.{"\n"}확정 여부는 곧 알림으로 안내해드릴게요.
                    </Text>
                    <TouchableOpacity style={s.rsvnBtn} onPress={closeSeatModal}>
                      <Text style={s.rsvnBtnText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                <>
                {/* 좌석 정보 */}
                <View style={s.viewerInfo}>
                  <View style={s.viewerRow}>
                    <Text style={s.viewerName}>{expandedSeat.seatNm}</Text>
                    <View style={s.viewerBadge}>
                      <Text style={s.viewerBadgeText}>최대 👤 {expandedSeat.capacity}인</Text>
                    </View>
                  </View>
                  <Text style={s.viewerDesc}>{expandedSeat.seatDesc}</Text>
                </View>

                {/* 예약 폼 */}
                <View style={s.rsvnForm}>
                  <Text style={s.rsvnTitle}>예약 정보 입력</Text>

                  {/* 날짜 + 인원 (같은 행) */}
                  <View style={s.rsvnRow}>
                    {/* 날짜 */}
                    <View style={[s.rsvnField, { flex: 1 }]}>
                      <Text style={s.rsvnLabel}>📅 날짜</Text>
                      <TouchableOpacity style={s.rsvnInput} onPress={() => setShowCalendar(true)}>
                        <Text style={rsvnDate ? s.rsvnDateText : s.rsvnDatePlaceholder}>
                          {rsvnDate || "날짜 선택"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 인원 */}
                    <View style={[s.rsvnField, s.rsvnPeopleField]}>
                      <Text style={s.rsvnLabel}>👥 인원</Text>
                      <View style={s.peopleRow}>
                        <TouchableOpacity
                          style={[s.peopleBtn, rsvnPeople <= minPeople && s.peopleBtnDisabled]}
                          onPress={() => setRsvnPeople(p => Math.max(minPeople, p - 1))}
                          disabled={rsvnPeople <= minPeople}
                        >
                          <Text style={s.peopleBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.peopleNum}>{rsvnPeople}명</Text>
                        <TouchableOpacity
                          style={[s.peopleBtn, rsvnPeople >= maxPeople && s.peopleBtnDisabled]}
                          onPress={() => setRsvnPeople(p => Math.min(maxPeople, p + 1))}
                          disabled={rsvnPeople >= maxPeople}
                        >
                          <Text style={s.peopleBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* 달력 모달 */}
                  {showCalendar && (
                    <Modal visible transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                      <TouchableOpacity style={s.calOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
                        <View style={s.calBox}>
                          <Calendar
                            minDate={today}
                            maxDate={maxDateStr}
                            onDayPress={day => { setRsvnDate(day.dateString); setRsvnTime(""); setShowCalendar(false); }}
                            markedDates={rsvnDate ? { [rsvnDate]: { selected: true, selectedColor: "#f97316" } } : {}}
                            theme={{
                              backgroundColor: "#1e293b",
                              calendarBackground: "#1e293b",
                              textSectionTitleColor: "#94a3b8",
                              selectedDayBackgroundColor: "#f97316",
                              selectedDayTextColor: "#fff",
                              todayTextColor: "#f97316",
                              dayTextColor: "#e2e8f0",
                              textDisabledColor: "#475569",
                              arrowColor: "#f97316",
                              monthTextColor: "#fff",
                              indicatorColor: "#f97316",
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  )}

                  {/* 시간 슬롯 */}
                  <View style={s.rsvnField}>
                    <Text style={s.rsvnLabel}>🕐 시간</Text>
                    {timeSlots.length === 0 ? (
                      isDayClosed ? (
                        <View style={s.rsvnClosedBox}>
                          <Text style={s.rsvnClosedText}>🚫 매장 휴무일 입니다</Text>
                        </View>
                      ) : (
                        <Text style={s.rsvnDatePlaceholder}>선택한 날짜엔 예약 가능한 시간이 없어요</Text>
                      )
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.timeScroll}>
                        {timeSlots.map(t => {
                          const disabled = isSlotUnavailable(t, occupiedWindows, rsvnStd?.useTimeMin, closeMin);
                          return (
                            <TouchableOpacity
                              key={t}
                              style={[s.timeSlot, rsvnTime === t && s.timeSlotActive, disabled && s.timeSlotDisabled]}
                              onPress={() => !disabled && setRsvnTime(prev => prev === t ? "" : t)}
                              disabled={disabled}
                            >
                              <Text style={[s.timeSlotText, rsvnTime === t && s.timeSlotTextActive, disabled && s.timeSlotTextDisabled]}>{t}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  {/* 예약자 이름 + 연락처 */}
                  <View style={s.rsvnRow}>
                    <View style={[s.rsvnField, { flex: 1 }]}>
                      <Text style={s.rsvnLabel}>👤 이름</Text>
                      <TextInput
                        style={[s.rsvnInput, { color: "#fff" }]}
                        placeholder="예약자 이름"
                        placeholderTextColor="#64748b"
                        value={guestName}
                        onChangeText={(t) => setGuestName(t.slice(0, 10))}
                        maxLength={10}
                      />
                    </View>
                    <View style={[s.rsvnField, { flex: 1 }]}>
                      <Text style={s.rsvnLabel}>📞 연락처</Text>
                      <TextInput
                        style={[s.rsvnInput, { color: "#fff" }]}
                        placeholder="숫자만 입력 (11자리)"
                        placeholderTextColor="#64748b"
                        value={guestTel}
                        onChangeText={(t) => setGuestTel(t.replace(/[^0-9]/g, "").slice(0, 11))}
                        keyboardType="phone-pad"
                        maxLength={11}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[s.rsvnBtn, !canSubmitRsvn && s.rsvnBtnOff]}
                    disabled={!canSubmitRsvn}
                    onPress={() => setShowConsent(true)}
                  >
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.rsvnBtnText}>예약하기</Text>}
                  </TouchableOpacity>
                </View>
                </>
                )}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* 개인정보 수집·이용 동의 */}
      {showConsent && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowConsent(false)}>
          <View style={s.consentOverlay}>
            <View style={s.consentCard}>
              <Text style={s.consentTitle}>📋 개인정보 수집·이용 동의</Text>
              <View style={s.consentBody}>
                <Text style={s.consentRow}>· 수집항목: 이름, 전화번호</Text>
                <Text style={s.consentRow}>· 수집목적: 예약 확인 및 승인 안내</Text>
                <Text style={s.consentRow}>· 보유기간: 예약일로부터 7일 후 삭제</Text>
              </View>
              <View style={s.consentSummary}>
                <Text style={s.consentSummaryText}>{guestName} {guestTel ? `· ${guestTel}` : ""}</Text>
                <Text style={s.consentSummaryText}>{rsvnPeople}명 · {rsvnDate} {rsvnTime}</Text>
              </View>
              <Text style={s.consentNote}>※ 동의 거부 시 예약 서비스 이용이 제한됩니다.</Text>
              <View style={s.consentBtns}>
                <TouchableOpacity style={s.consentNoBtn} onPress={() => setShowConsent(false)} disabled={submitting}>
                  <Text style={s.consentNoBtnText}>동의 안함</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.consentYesBtn} onPress={confirmReserve} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.consentYesBtnText}>✓ 동의하고 예약</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal
        visible={!!confirmCancelRsvnNo}
        message="예약을 취소하시겠어요?"
        confirmText="취소하기"
        cancelText="아니오"
        danger
        onConfirm={doCancelReservation}
        onCancel={() => setConfirmCancelRsvnNo(null)}
      />
      <ConfirmModal
        visible={!!cancelAlertMsg}
        message={cancelAlertMsg}
        onConfirm={() => setCancelAlertMsg(null)}
      />
    </View>
  );
}

function SeatCard({ seat, onExpand }) {
  const [imgError, setImgError] = useState(false);
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.imgWrap} activeOpacity={0.85} onPress={onExpand}>
        {seat.imgUrl && !imgError ? (
          <>
            <Image source={{ uri: seat.imgUrl }} style={s.img} onError={() => setImgError(true)} />
            <View style={s.zoomHint}><Text style={s.zoomHintText}>🔍</Text></View>
          </>
        ) : (
          <View style={s.noImg}>
            <Text style={s.noImgIcon}>🪑</Text>
          </View>
        )}
        <View style={s.capacityBadge}>
          <Text style={s.capacityText}>👤 {seat.capacity}인</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={s.cardInfo} activeOpacity={0.85} onPress={onExpand}>
        <Text style={s.seatName}>{seat.seatNm}</Text>
        <Text style={s.seatDesc} numberOfLines={2}>{seat.seatDesc}</Text>
      </TouchableOpacity>
    </View>
  );
}
