import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator, Platform } from "react-native";
import { s } from "../../styles/admin/MenuFormModal.styles";

const emptyForm = { bizCatCd: "", menuNm: "", menuDesc: "", price: "", imgUrl: "", badge: "", sortOrd: "", useYn: "Y" };

// 사이트 상단 헤더와 동일한 남색→녹색 그라데이션 (웹 전용, RN 네이티브는 primary 단색으로 대체)
const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

export default function MenuFormModal({ visible, initial, categories, saving, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setForm({
        bizCatCd: initial.bizCatCd || "",
        menuNm: initial.menuNm || "",
        menuDesc: initial.menuDesc || "",
        price: initial.price != null ? String(initial.price) : "",
        imgUrl: initial.imgUrl || "",
        badge: initial.badge || "",
        sortOrd: initial.sortOrd != null ? String(initial.sortOrd) : "",
        useYn: initial.useYn || "Y",
      });
    } else {
      setForm({ ...emptyForm, bizCatCd: categories?.[0]?.bizCatCd || "" });
    }
    setError("");
  }, [visible, initial]);

  if (!visible) return null;

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = () => {
    if (!form.bizCatCd) { setError("카테고리를 선택해주세요."); return; }
    if (!form.menuNm.trim()) { setError("메뉴명을 입력해주세요."); return; }
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price < 0) { setError("가격을 올바르게 입력해주세요."); return; }
    setError("");
    onSave({
      bizCatCd: form.bizCatCd,
      menuNm: form.menuNm.trim(),
      menuDesc: form.menuDesc.trim() || null,
      price,
      imgUrl: form.imgUrl.trim() || null,
      badge: form.badge.trim() || null,
      sortOrd: form.sortOrd ? Number(form.sortOrd) : null,
      useYn: form.useYn,
    });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.title}>{initial ? "메뉴 수정" : "새 메뉴 등록"}</Text>
          </View>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={s.label}>카테고리</Text>
              <View style={s.chipBox}>
                <View style={s.chipRow}>
                  {(categories || []).map(c => (
                    <TouchableOpacity
                      key={c.bizCatCd}
                      style={[s.chip, form.bizCatCd === c.bizCatCd && s.chipActive]}
                      onPress={() => update("bizCatCd")(c.bizCatCd)}
                    >
                      <Text style={[s.chipText, form.bizCatCd === c.bizCatCd && s.chipTextActive]}>{c.bizCatNm}</Text>
                    </TouchableOpacity>
                  ))}
                  {(!categories || categories.length === 0) && <Text style={s.noCatText}>등록된 카테고리가 없습니다</Text>}
                </View>
              </View>
            </View>

            <View>
              <Text style={s.label}>메뉴명</Text>
              <TextInput style={s.inp} placeholder="메뉴명 입력" value={form.menuNm} onChangeText={update("menuNm")} />
            </View>

            <View>
              <Text style={s.label}>설명</Text>
              <TextInput style={[s.inp, s.inpMultiline]} placeholder="메뉴 설명 (선택)" value={form.menuDesc} onChangeText={update("menuDesc")} multiline />
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>가격</Text>
                <TextInput style={s.inp} placeholder="0" value={form.price} onChangeText={update("price")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>뱃지</Text>
                <TextInput style={s.inp} placeholder="인기 등 (선택)" value={form.badge} onChangeText={update("badge")} />
              </View>
            </View>

            <View>
              <Text style={s.label}>이미지 URL</Text>
              <TextInput style={s.inp} placeholder="https:// (선택)" value={form.imgUrl} onChangeText={update("imgUrl")} autoCapitalize="none" />
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>정렬순서</Text>
                <TextInput style={s.inp} placeholder="자동" value={form.sortOrd} onChangeText={update("sortOrd")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20 }}>
                <Text style={s.label}>노출여부</Text>
                <Switch
                  value={form.useYn === "Y"}
                  onValueChange={(v) => update("useYn")(v ? "Y" : "N")}
                />
              </View>
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
