import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { s } from "../../styles/admin/AdminReservationStandard.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const emptyForm = { useYn: "Y", timeUnitMin: "30", useTimeMin: "90", minPartySize: "", maxPartySize: "", maxAdvanceDays: "", minAdvanceHours: "" };

export default function AdminReservationStandard({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    setError("");
    const std = await api.biz.reservationStandard(bizRegNo);
    setForm(std ? {
      useYn: std.useYn || "Y",
      timeUnitMin: std.timeUnitMin != null ? String(std.timeUnitMin) : "30",
      useTimeMin: std.useTimeMin != null ? String(std.useTimeMin) : "90",
      minPartySize: std.minPartySize != null ? String(std.minPartySize) : "",
      maxPartySize: std.maxPartySize != null ? String(std.maxPartySize) : "",
      maxAdvanceDays: std.maxAdvanceDays != null ? String(std.maxAdvanceDays) : "",
      minAdvanceHours: std.minAdvanceHours != null ? String(std.minAdvanceHours) : "",
    } : emptyForm);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = async () => {
    const timeUnitMin = Number(form.timeUnitMin);
    const useTimeMin = Number(form.useTimeMin);
    if (!form.timeUnitMin || Number.isNaN(timeUnitMin) || timeUnitMin <= 0) { setError("예약 시간 단위를 올바르게 입력해주세요."); return; }
    if (!form.useTimeMin || Number.isNaN(useTimeMin) || useTimeMin <= 0) { setError("좌석 점유 시간을 올바르게 입력해주세요."); return; }
    const minPartySize = form.minPartySize ? Number(form.minPartySize) : null;
    const maxPartySize = form.maxPartySize ? Number(form.maxPartySize) : null;
    if (minPartySize != null && maxPartySize != null && minPartySize > maxPartySize) {
      setError("최소 인원이 최대 인원보다 클 수 없습니다.");
      return;
    }
    setError("");
    setSaving(true);
    const { error: apiError } = await api.biz.saveReservationStandard(bizRegNo, {
      useYn: form.useYn,
      timeUnitMin,
      useTimeMin,
      minPartySize,
      maxPartySize,
      maxAdvanceDays: form.maxAdvanceDays ? Number(form.maxAdvanceDays) : null,
      minAdvanceHours: form.minAdvanceHours ? Number(form.minAdvanceHours) : null,
    });
    setSaving(false);
    if (apiError) { setAlertMsg("저장에 실패했습니다. 다시 시도해주세요."); return; }
    setAlertMsg("예약기준이 저장되었습니다.");
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
        <Text style={s.title}>예약기준 관리</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : (
        <ScrollView contentContainerStyle={s.form}>
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View>
                <Text style={s.fieldLabel}>예약 기능 사용</Text>
                <Text style={s.fieldDesc}>끄면 고객 앱에서 예약 탭이 비활성화됩니다.</Text>
              </View>
              <Switch value={form.useYn === "Y"} onValueChange={(v) => update("useYn")(v ? "Y" : "N")} />
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.fieldLabel}>예약 시간 단위 (분)</Text>
            <Text style={s.fieldDesc}>예: 30분 단위로 예약 슬롯을 생성합니다.</Text>
            <TextInput style={s.inp} placeholder="30" value={form.timeUnitMin} onChangeText={update("timeUnitMin")} keyboardType="numeric" />
          </View>

          <View style={s.card}>
            <Text style={s.fieldLabel}>좌석 점유 시간 (분)</Text>
            <Text style={s.fieldDesc}>예약 1건이 좌석을 점유하는 시간입니다.</Text>
            <TextInput style={s.inp} placeholder="90" value={form.useTimeMin} onChangeText={update("useTimeMin")} keyboardType="numeric" />
          </View>

          <View style={s.card}>
            <Text style={s.fieldLabel}>인원 제한</Text>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldDesc}>최소 인원</Text>
                <TextInput style={s.inp} placeholder="제한 없음" value={form.minPartySize} onChangeText={update("minPartySize")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldDesc}>최대 인원</Text>
                <TextInput style={s.inp} placeholder="제한 없음" value={form.maxPartySize} onChangeText={update("maxPartySize")} keyboardType="numeric" />
              </View>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.fieldLabel}>사전예약 범위</Text>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldDesc}>최대 며칠 전까지 (일)</Text>
                <TextInput style={s.inp} placeholder="제한 없음" value={form.maxAdvanceDays} onChangeText={update("maxAdvanceDays")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldDesc}>최소 몇 시간 전까지 (시간)</Text>
                <TextInput style={s.inp} placeholder="제한 없음" value={form.minAdvanceHours} onChangeText={update("minAdvanceHours")} keyboardType="numeric" />
              </View>
            </View>
          </View>

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
