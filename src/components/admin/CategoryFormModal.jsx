import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/CategoryFormModal.styles";

const emptyForm = { bizCatNm: "", catCd: "", sortOrd: "", useYn: "Y", rmrk: "" };
const emptyFieldErrors = { bizCatNm: "" };

export default function CategoryFormModal({ visible, initial, saving, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setForm({
        bizCatNm: initial.bizCatNm || "",
        catCd: initial.catCd || "",
        sortOrd: initial.sortOrd != null ? String(initial.sortOrd) : "",
        useYn: initial.useYn || "Y",
        rmrk: initial.rmrk || "",
      });
    } else {
      setForm(emptyForm);
    }
    setFieldErrors(emptyFieldErrors);
  }, [visible, initial]);

  if (!visible) return null;

  const update = (key) => (v) => {
    setForm(f => ({ ...f, [key]: v }));
    setFieldErrors(fe => (fe[key] ? { ...fe, [key]: "" } : fe));
  };

  const submit = () => {
    const errors = {
      bizCatNm: form.bizCatNm.trim() ? "" : "카테고리명을 입력해주세요.",
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    onSave({
      bizCatNm: form.bizCatNm.trim(),
      catCd: form.catCd.trim() || null,
      sortOrd: form.sortOrd ? Number(form.sortOrd) : null,
      useYn: form.useYn,
      rmrk: form.rmrk.trim() || null,
    });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>{initial ? "카테고리 수정" : "새 카테고리 등록"}</Text>
          </View>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={s.label}>카테고리명</Text>
              <TextInput style={s.inp} placeholder="예: 커피, 디저트" value={form.bizCatNm} onChangeText={update("bizCatNm")} />
              {!!fieldErrors.bizCatNm && <Text style={s.fieldError}>{fieldErrors.bizCatNm}</Text>}
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>참조코드</Text>
                <TextInput style={s.inp} placeholder="선택" value={form.catCd} onChangeText={update("catCd")} autoCapitalize="none" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>정렬순서</Text>
                <TextInput style={s.inp} placeholder="자동" value={form.sortOrd} onChangeText={update("sortOrd")} keyboardType="numeric" />
              </View>
            </View>

            <View>
              <Text style={s.label}>비고</Text>
              <TextInput style={[s.inp, s.inpMultiline]} placeholder="비고 (선택)" value={form.rmrk} onChangeText={update("rmrk")} multiline />
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={s.label}>노출여부</Text>
              <Switch
                value={form.useYn === "Y"}
                onValueChange={(v) => update("useYn")(v ? "Y" : "N")}
              />
            </View>
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
