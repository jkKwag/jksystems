import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Platform } from "react-native";
import { s } from "../../styles/admin/AdminHours.styles";
import { colors, radius, font, spacing } from "../../styles/theme";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABEL = { MON: "월요일", TUE: "화요일", WED: "수요일", THU: "목요일", FRI: "금요일", SAT: "토요일", SUN: "일요일" };

const toHHMM = (v) => (v ? v.slice(0, 5) : "");

const emptyDay = () => ({ isClosed: "N", openTime: "", closeTime: "", breakStartTime: "", breakEndTime: "", lastOrderTime: "" });

// 브라우저 기본 시간 선택 UI(모바일: 휠/시계 피커, 데스크탑: 시/분 스피너) 사용.
// 브라우저 기본 파란색(accent-color/포커스 링) 대신 scaneat 톤으로 맞춤
const nativeTimeInputStyle = {
  borderWidth: 1,
  borderColor: colors.borderLight,
  borderRadius: radius.md,
  paddingHorizontal: spacing["3"],
  paddingVertical: spacing["3"],
  fontSize: font.md,
  color: colors.text,
  backgroundColor: colors.slate50,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  accentColor: colors.accent,
  outline: "none",
};

function HourMinuteSelect({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  if (Platform.OS !== "web") {
    return <Text style={s.timeInp}>{value || "-"}</Text>;
  }
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...nativeTimeInputStyle, borderColor: focused ? colors.accent : colors.borderLight }}
    />
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <View style={s.timeField}>
      <Text style={s.timeLabel}>{label}</Text>
      <HourMinuteSelect value={value} onChange={onChange} />
    </View>
  );
}

function TimeRangeField({ label, startValue, endValue, onChangeStart, onChangeEnd }) {
  return (
    <View style={s.rangeBox}>
      <Text style={s.timeLabel}>{label}</Text>
      <View style={s.rangeRow}>
        <View style={s.rangeField}><HourMinuteSelect value={startValue} onChange={onChangeStart} /></View>
        <Text style={s.rangeTilde}>~</Text>
        <View style={s.rangeField}><HourMinuteSelect value={endValue} onChange={onChangeEnd} /></View>
      </View>
    </View>
  );
}

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

  const submit = async () => {
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
                    <TimeRangeField
                      label="영업시간"
                      startValue={d.openTime}
                      endValue={d.closeTime}
                      onChangeStart={(v) => updateDay(day, "openTime", v)}
                      onChangeEnd={(v) => updateDay(day, "closeTime", v)}
                    />
                    <TimeRangeField
                      label="브레이크타임"
                      startValue={d.breakStartTime}
                      endValue={d.breakEndTime}
                      onChangeStart={(v) => updateDay(day, "breakStartTime", v)}
                      onChangeEnd={(v) => updateDay(day, "breakEndTime", v)}
                    />
                    <View style={s.timeRow}>
                      <TimeField label="라스트오더" value={d.lastOrderTime} onChange={(v) => updateDay(day, "lastOrderTime", v)} />
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
