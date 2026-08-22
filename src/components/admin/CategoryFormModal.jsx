import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator, Platform } from "react-native";
import { s } from "../../styles/admin/CategoryFormModal.styles";
import api from "../../lib/api";

const emptyForm = { bizCatNm: "", catCd: "", sortOrd: "", useYn: "Y", rmrk: "" };
const emptyFieldErrors = { bizCatNm: "" };

// 메뉴관리 상세(MenuFormModal)와 동일한 남색→녹색 그라데이션 헤더 (웹 전용, RN 네이티브는 primary 단색)
const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

export default function CategoryFormModal({ visible, initial, saving, bizRegNo, categories = [], onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [catOptions, setCatOptions] = useState([]);
  const [catFetched, setCatFetched] = useState(false);
  const [catQuery, setCatQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);

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
    setCatOpen(false);
    setCatOptions([]);
    setCatFetched(false);
    // 동종업종 등록 카테고리는 값을 새로 골라주는 편의 기능일 뿐이라, 기등록된 값으로
    // 미리 채워두지 않는다. 건드리지 않으면 기존 catCd가 그대로 저장된다.
    setCatQuery("");
  }, [visible, initial]);

  // 업종에 맞는 카테고리 목록은 콤보를 실제로 클릭(포인터 다운)해서 열 때만 조회 (신규/수정 공통).
  // RN Web Modal이 열리면서 첫 입력창에 자동으로 focus()를 걸어주는데, 이건 진짜 클릭이 아니라서
  // onFocus에 붙이면 모달이 열리자마자 오조회가 발생한다. pointerDown은 프로그램상 focus()로는
  // 발생하지 않으므로 실제 클릭에만 반응한다.
  const openCatCombo = async () => {
    setCatOpen(true);
    if (catFetched || !bizRegNo) return;
    setCatFetched(true);
    const list = await api.biz.indCategories(bizRegNo);
    setCatOptions(Array.isArray(list) ? list : []);
  };

  if (!visible) return null;

  const update = (key) => (v) => {
    setForm(f => ({ ...f, [key]: v }));
    setFieldErrors(fe => (fe[key] ? { ...fe, [key]: "" } : fe));
  };

  const onCatQueryChange = (v) => {
    setCatQuery(v);
    openCatCombo();
    setForm(f => ({ ...f, catCd: "" }));
  };

  const selectCat = (opt) => {
    setForm(f => {
      const next = { ...f, catCd: opt.catCd, bizCatNm: opt.catNm, useYn: "Y", rmrk: opt.catNm };
      // 정렬순번은 신규 등록일 때만 마지막 순번+1로 채워준다. 수정 화면에서는 기존 순번을 유지.
      if (!initial) {
        const maxSortOrd = categories.reduce((max, c) => Math.max(max, c.sortOrd ?? -1), -1);
        next.sortOrd = String(maxSortOrd + 1);
      }
      return next;
    });
    setCatQuery(opt.catNm);
    setCatOpen(false);
    setFieldErrors(emptyFieldErrors);
  };

  const filteredCatOptions = catOptions.filter(o => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return true;
    return o.catNm.toLowerCase().includes(q) || o.catCd.toLowerCase().includes(q);
  });

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
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.title}>{initial ? "카테고리 수정" : "새 카테고리 등록"}</Text>
          </View>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }} keyboardShouldPersistTaps="handled">
            <View style={s.catWrap}>
              <Text style={s.label}>동종업종 등록 카테고리</Text>
              <TextInput
                style={s.inp}
                placeholder="검색 또는 선택(선택하면 카테고리명이 자동 입력 됩니다)"
                value={catQuery}
                onChangeText={onCatQueryChange}
                onPointerDown={openCatCombo}
                onBlur={() => setTimeout(() => {
                  setCatOpen(false);
                  setForm(f => {
                    if (!f.catCd) setCatQuery("");
                    return f;
                  });
                }, 150)}
                autoCapitalize="none"
              />
              {catOpen && (
                <View style={s.comboBox}>
                  <ScrollView style={s.comboScroll} keyboardShouldPersistTaps="handled">
                    {filteredCatOptions.length === 0 ? (
                      <Text style={s.comboEmpty}>검색 결과가 없습니다</Text>
                    ) : (
                      filteredCatOptions.map(opt => (
                        <TouchableOpacity key={opt.catCd} style={s.comboRow} onPress={() => selectCat(opt)}>
                          <Text style={s.comboRowText}>{opt.catNm}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <View>
              <Text style={s.label}>카테고리명</Text>
              <TextInput style={s.inp} placeholder="예: 커피, 디저트" value={form.bizCatNm} onChangeText={update("bizCatNm")} />
              {!!fieldErrors.bizCatNm && <Text style={s.fieldError}>{fieldErrors.bizCatNm}</Text>}
            </View>

            <View>
              <Text style={s.label}>정렬순서</Text>
              <TextInput style={s.inp} placeholder="자동" value={form.sortOrd} onChangeText={update("sortOrd")} keyboardType="numeric" />
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
