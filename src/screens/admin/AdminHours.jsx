import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { s } from "../../styles/admin/AdminHours.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABEL = { MON: "월요일", TUE: "화요일", WED: "수요일", THU: "목요일", FRI: "금요일", SAT: "토요일", SUN: "일요일" };
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toHHMM = (v) => (v ? v.slice(0, 5) : "");

const emptyDay = () => ({ isClosed: "N", openTime: "", closeTime: "", breakStartTime: "", breakEndTime: "", lastOrderTime: "" });

export default function AdminHours({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(() => Object.fromEntries(DAY_ORDER.map(d => [d, emptyDay()])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    setError("");
    const list = await api.biz.hours(bizRegNo);
    const next = Object.fromEntries(DAY_ORDER.map(d => [d, emptyDay()]));
    (Array.isArray(list) ? list : []).forEach(h => {
      next[h.dayOfWeek] = {
        isClosed: h.isClosed || "N",
        openTime: toHHMM(h.openTime),
        closeTime: toHHMM(h.closeTime),
        breakStartTime: toHHMM(h.breakStartTime),
        breakEndTime: toHHMM(h.breakEndTime),
        lastOrderTime: toHHMM(h.lastOrderTime),
      };
    });
    setForm(next);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const updateDay = (day, field, value) => {
    setForm(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const validateTime = (label, day, value) => {
    if (!value) return null;
    if (!TIME_RE.test(value)) return `${DAY_LABEL[day]} ${label} 시간은 HH:mm 형식으로 입력해주세요 (예: 09:00).`;
    return null;
  };

  const submit = async () => {
    for (const day of DAY_ORDER) {
      const d = form[day];
      if (d.isClosed === "Y") continue;
      const errs = [
        validateTime("영업시작", day, d.openTime),
        validateTime("영업종료", day, d.closeTime),
        validateTime("브레이크 시작", day, d.breakStartTime),
        validateTime("브레이크 종료", day, d.breakEndTime),
        validateTime("라스트오더", day, d.lastOrderTime),
      ].filter(Boolean);
      if (errs.length > 0) { setError(errs[0]); return; }
    }
    setError("");
    setSaving(true);
    const hours = DAY_ORDER.map(day => {
      const d = form[day];
      return {
        dayOfWeek: day,
        isClosed: d.isClosed,
        openTime: d.isClosed === "Y" ? null : (d.openTime || null),
        closeTime: d.isClosed === "Y" ? null : (d.closeTime || null),
        breakStartTime: d.isClosed === "Y" ? null : (d.breakStartTime || null),
        breakEndTime: d.isClosed === "Y" ? null : (d.breakEndTime || null),
        lastOrderTime: d.isClosed === "Y" ? null : (d.lastOrderTime || null),
      };
    });
    const { error: apiError } = await api.biz.saveHours(bizRegNo, { hours });
    setSaving(false);
    if (apiError) { setAlertMsg("저장에 실패했습니다. 다시 시도해주세요."); return; }
    setAlertMsg("영업시간이 저장되었습니다.");
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
        <Text style={s.title}>영업시간 관리</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {DAY_ORDER.map(day => {
            const d = form[day];
            const closed = d.isClosed === "Y";
            return (
              <View key={day} style={s.dayCard}>
                <View style={s.dayTopRow}>
                  <Text style={s.dayLabel}>{DAY_LABEL[day]}</Text>
                  <View style={s.closedToggle}>
                    <Text style={s.closedToggleText}>휴무</Text>
                    <Switch value={closed} onValueChange={(v) => updateDay(day, "isClosed", v ? "Y" : "N")} />
                  </View>
                </View>

                {!closed && (
                  <>
                    <View style={s.timeRow}>
                      <View style={s.timeField}>
                        <Text style={s.timeLabel}>영업시작</Text>
                        <TextInput style={s.timeInp} placeholder="09:00" value={d.openTime} onChangeText={(v) => updateDay(day, "openTime", v)} />
                      </View>
                      <View style={s.timeField}>
                        <Text style={s.timeLabel}>영업종료</Text>
                        <TextInput style={s.timeInp} placeholder="22:00" value={d.closeTime} onChangeText={(v) => updateDay(day, "closeTime", v)} />
                      </View>
                    </View>
                    <View style={s.timeRow}>
                      <View style={s.timeField}>
                        <Text style={s.timeLabel}>브레이크 시작</Text>
                        <TextInput style={s.timeInp} placeholder="선택" value={d.breakStartTime} onChangeText={(v) => updateDay(day, "breakStartTime", v)} />
                      </View>
                      <View style={s.timeField}>
                        <Text style={s.timeLabel}>브레이크 종료</Text>
                        <TextInput style={s.timeInp} placeholder="선택" value={d.breakEndTime} onChangeText={(v) => updateDay(day, "breakEndTime", v)} />
                      </View>
                      <View style={s.timeField}>
                        <Text style={s.timeLabel}>라스트오더</Text>
                        <TextInput style={s.timeInp} placeholder="선택" value={d.lastOrderTime} onChangeText={(v) => updateDay(day, "lastOrderTime", v)} />
                      </View>
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {!!error && <Text style={s.error}>⚠️ {error}</Text>}

          <TouchableOpacity style={s.saveBtn} onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>저장</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
