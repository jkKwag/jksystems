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

// 자유 텍스트 입력 대신 브라우저 기본 시간 선택 UI(시/분 스피너)만 쓰도록 native time input 사용
const nativeTimeInputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: spacing["3"],
  paddingVertical: spacing["2"],
  fontSize: font.md,
  color: colors.text,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function TimeField({ label, value, onChange }) {
  return (
    <View style={s.timeField}>
      <Text style={s.timeLabel}>{label}</Text>
      {Platform.OS === "web" ? (
        <input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} style={nativeTimeInputStyle} />
      ) : (
        <Text style={s.timeInp}>{value || "-"}</Text>
      )}
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
                    <View style={s.timeRow}>
                      <TimeField label="영업시작" value={d.openTime} onChange={(v) => updateDay(day, "openTime", v)} />
                      <TimeField label="영업종료" value={d.closeTime} onChange={(v) => updateDay(day, "closeTime", v)} />
                    </View>
                    <View style={s.timeRow}>
                      <TimeField label="브레이크 시작" value={d.breakStartTime} onChange={(v) => updateDay(day, "breakStartTime", v)} />
                      <TimeField label="브레이크 종료" value={d.breakEndTime} onChange={(v) => updateDay(day, "breakEndTime", v)} />
                    </View>
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
