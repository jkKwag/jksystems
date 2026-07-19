import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/BizFormModal.styles";

const emptyForm = { bizRegNo: "", bizNm: "", telNo: "", indCd: "", addr: "", addrDtl: "" };

export default function BizFormModal({ visible, initial, industries, saving, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setForm({
        bizRegNo: initial.bizRegNo || "",
        bizNm: initial.bizNm || "",
        telNo: initial.telNo || "",
        indCd: initial.indCd || "",
        addr: initial.addr || "",
        addrDtl: initial.addrDtl || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [visible, initial]);

  if (!visible) return null;

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = () => {
    if (!initial && !form.bizRegNo.trim()) { setError("사업자등록번호를 입력해주세요."); return; }
    if (!form.bizNm.trim()) { setError("사업장명을 입력해주세요."); return; }
    setError("");
    onSave({
      bizRegNo: form.bizRegNo.trim(),
      bizNm: form.bizNm.trim(),
      telNo: form.telNo.trim() || null,
      indCd: form.indCd || null,
      addr: form.addr.trim() || null,
      addrDtl: form.addrDtl.trim() || null,
    });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{initial ? "사업장 정보 수정" : "새 사업장 등록"}</Text>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={s.label}>사업자등록번호</Text>
              {initial ? (
                <Text style={s.readonlyText}>{form.bizRegNo}</Text>
              ) : (
                <TextInput
                  style={s.inp}
                  placeholder="숫자만 입력 (예: 2122544531)"
                  value={form.bizRegNo}
                  onChangeText={update("bizRegNo")}
                  keyboardType="numeric"
                />
              )}
            </View>

            <View>
              <Text style={s.label}>사업장명</Text>
              <TextInput style={s.inp} placeholder="사업장명 입력" value={form.bizNm} onChangeText={update("bizNm")} />
            </View>

            <View>
              <Text style={s.label}>전화번호</Text>
              <TextInput style={s.inp} placeholder="선택" value={form.telNo} onChangeText={update("telNo")} keyboardType="phone-pad" />
            </View>

            <View>
              <Text style={s.label}>업종</Text>
              <View style={s.chipRow}>
                {(industries || []).map(ind => (
                  <TouchableOpacity
                    key={ind.indCd}
                    style={[s.chip, form.indCd === ind.indCd && s.chipActive]}
                    onPress={() => update("indCd")(form.indCd === ind.indCd ? "" : ind.indCd)}
                  >
                    <Text style={[s.chipText, form.indCd === ind.indCd && s.chipTextActive]}>{ind.indNm}</Text>
                  </TouchableOpacity>
                ))}
                {(!industries || industries.length === 0) && <Text style={s.noIndText}>등록된 업종이 없습니다</Text>}
              </View>
            </View>

            <View>
              <Text style={s.label}>주소</Text>
              <TextInput style={s.inp} placeholder="선택" value={form.addr} onChangeText={update("addr")} />
            </View>

            <View>
              <Text style={s.label}>상세주소</Text>
              <TextInput style={s.inp} placeholder="선택" value={form.addrDtl} onChangeText={update("addrDtl")} />
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
