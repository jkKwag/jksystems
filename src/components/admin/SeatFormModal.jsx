import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/SeatFormModal.styles";

const emptyForm = { seatNm: "", capacity: "", seatDesc: "", imgUrl: "", sortOrd: "", useYn: "Y" };

export default function SeatFormModal({ visible, initial, saving, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setForm({
        seatNm: initial.seatNm || "",
        capacity: initial.capacity != null ? String(initial.capacity) : "",
        seatDesc: initial.seatDesc || "",
        imgUrl: initial.imgUrl || "",
        sortOrd: initial.sortOrd != null ? String(initial.sortOrd) : "",
        useYn: initial.useYn || "Y",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [visible, initial]);

  if (!visible) return null;

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = () => {
    if (!form.seatNm.trim()) { setError("좌석명을 입력해주세요."); return; }
    const capacity = Number(form.capacity);
    if (!form.capacity || Number.isNaN(capacity) || capacity <= 0) { setError("수용인원을 올바르게 입력해주세요."); return; }
    setError("");
    onSave({
      seatNm: form.seatNm.trim(),
      capacity,
      seatDesc: form.seatDesc.trim() || null,
      imgUrl: form.imgUrl.trim() || null,
      sortOrd: form.sortOrd ? Number(form.sortOrd) : null,
      useYn: form.useYn,
    });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{initial ? "좌석 수정" : "새 좌석 등록"}</Text>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={s.label}>좌석명</Text>
              <TextInput style={s.inp} placeholder="예: 창가 4인석" value={form.seatNm} onChangeText={update("seatNm")} />
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>수용인원</Text>
                <TextInput style={s.inp} placeholder="0" value={form.capacity} onChangeText={update("capacity")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>정렬순서</Text>
                <TextInput style={s.inp} placeholder="자동" value={form.sortOrd} onChangeText={update("sortOrd")} keyboardType="numeric" />
              </View>
            </View>

            <View>
              <Text style={s.label}>설명</Text>
              <TextInput style={[s.inp, s.inpMultiline]} placeholder="좌석 설명 (선택)" value={form.seatDesc} onChangeText={update("seatDesc")} multiline />
            </View>

            <View>
              <Text style={s.label}>이미지 URL</Text>
              <TextInput style={s.inp} placeholder="https:// (선택)" value={form.imgUrl} onChangeText={update("imgUrl")} autoCapitalize="none" />
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={s.label}>노출여부</Text>
              <Switch
                value={form.useYn === "Y"}
                onValueChange={(v) => update("useYn")(v ? "Y" : "N")}
              />
            </View>

            {!!error && <Text style={s.error}>⚠️ {error}</Text>}
          </ScrollView>

          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={submit} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>저장</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
