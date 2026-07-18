import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/MenuOptionsModal.styles";
import api from "../../lib/api";
import ConfirmModal from "../ConfirmModal";

const emptyRow = () => ({ key: Math.random().toString(36).slice(2), optNm: "", addPrice: "" });

export default function MenuOptionsModal({ visible, menu, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteGroupTarget, setDeleteGroupTarget] = useState(null);
  const [deleteOptionTarget, setDeleteOptionTarget] = useState(null);

  const [grpNm, setGrpNm] = useState("");
  const [optType, setOptType] = useState("R");
  const [requiredYn, setRequiredYn] = useState("N");
  const [rows, setRows] = useState([emptyRow()]);

  const resetForm = () => {
    setGrpNm("");
    setOptType("R");
    setRequiredYn("N");
    setRows([emptyRow()]);
    setError("");
  };

  const load = async () => {
    if (!menu?.menuCd) return;
    setLoaded(false);
    const list = await api.menu.options(menu.menuCd);
    setGroups(Array.isArray(list) ? list : []);
    setLoaded(true);
  };

  useEffect(() => {
    if (visible && menu?.menuCd) {
      resetForm();
      load();
    }
  }, [visible, menu?.menuCd]);

  if (!visible) return null;

  const updateRow = (key, field, value) => {
    setRows(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r));
  };
  const addRow = () => setRows(prev => [...prev, emptyRow()]);
  const removeRow = (key) => setRows(prev => prev.length > 1 ? prev.filter(r => r.key !== key) : prev);

  const submitGroup = async () => {
    if (!grpNm.trim()) { setError("옵션그룹 이름을 입력해주세요."); return; }
    const options = rows
      .filter(r => r.optNm.trim())
      .map(r => ({ optNm: r.optNm.trim(), addPrice: Number(r.addPrice) || 0 }));
    if (options.length === 0) { setError("옵션을 1개 이상 입력해주세요."); return; }
    setError("");
    setSaving(true);
    const { data, error: apiError } = await api.menu.createOptionGroup(menu.menuCd, {
      optGrpNm: grpNm.trim(),
      optType,
      requiredYn,
      options,
    });
    setSaving(false);
    if (apiError || !data) { setError("옵션그룹 등록에 실패했습니다."); return; }
    setGroups(prev => [...prev, data]);
    resetForm();
  };

  const doDeleteGroup = async () => {
    const optGrpCd = deleteGroupTarget;
    setDeleteGroupTarget(null);
    const { error: apiError } = await api.menu.deleteOptionGroup(menu.menuCd, optGrpCd);
    if (apiError) { setError("삭제에 실패했습니다."); return; }
    setGroups(prev => prev.filter(g => g.optGrpCd !== optGrpCd));
  };

  const doDeleteOption = async () => {
    const { optGrpCd, optCd } = deleteOptionTarget;
    setDeleteOptionTarget(null);
    const { error: apiError } = await api.menu.deleteOption(menu.menuCd, optGrpCd, optCd);
    if (apiError) { setError("삭제에 실패했습니다."); return; }
    setGroups(prev => prev
      .map(g => g.optGrpCd === optGrpCd ? { ...g, options: g.options.filter(o => o.optCd !== optCd) } : g)
      .filter(g => g.optGrpCd !== optGrpCd || g.options.length > 0));
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.headerTitle}>🧩 {menu?.menuNm} 옵션 관리</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
            {!loaded ? (
              <ActivityIndicator style={{ marginTop: 24 }} color="#f97316" />
            ) : groups.length === 0 ? (
              <Text style={s.emptyText}>등록된 옵션이 없습니다</Text>
            ) : (
              groups.map(g => (
                <View key={g.optGrpCd} style={s.groupCard}>
                  <View style={s.groupTopRow}>
                    <Text style={s.groupNm}>{g.optGrpNm}</Text>
                    <View style={s.groupMetaRow}>
                      <View style={s.typeBadge}><Text style={s.typeBadgeText}>{g.optType === "C" ? "다중선택" : "단일선택"}</Text></View>
                      {g.requiredYn === "Y" && <View style={s.requiredBadge}><Text style={s.requiredBadgeText}>필수</Text></View>}
                      <TouchableOpacity onPress={() => setDeleteGroupTarget(g.optGrpCd)}>
                        <Text style={s.groupDeleteText}>그룹삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {(g.options || []).map(o => (
                    <View key={o.optCd} style={s.optionRow}>
                      <Text style={s.optionNm}>{o.optNm}</Text>
                      <Text style={s.optionPrice}>{Number(o.addPrice) > 0 ? `+₩${Number(o.addPrice).toLocaleString()}` : "₩0"}</Text>
                      <TouchableOpacity onPress={() => setDeleteOptionTarget({ optGrpCd: g.optGrpCd, optCd: o.optCd })}>
                        <Text style={s.optionDeleteText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}

            <View style={s.divider} />
            <Text style={s.newGroupTitle}>새 옵션그룹 추가</Text>

            <TextInput style={s.inp} placeholder="옵션그룹 이름 (예: 사이즈)" value={grpNm} onChangeText={setGrpNm} />

            <View style={s.toggleRow}>
              <View style={s.toggleGroup}>
                <TouchableOpacity style={[s.toggleBtn, optType === "R" && s.toggleBtnActive]} onPress={() => setOptType("R")}>
                  <Text style={[s.toggleBtnText, optType === "R" && s.toggleBtnTextActive]}>단일선택</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.toggleBtn, optType === "C" && s.toggleBtnActive]} onPress={() => setOptType("C")}>
                  <Text style={[s.toggleBtnText, optType === "C" && s.toggleBtnTextActive]}>다중선택</Text>
                </TouchableOpacity>
              </View>
              <View style={s.toggleGroup}>
                <TouchableOpacity style={[s.toggleBtn, requiredYn === "N" && s.toggleBtnActive]} onPress={() => setRequiredYn("N")}>
                  <Text style={[s.toggleBtnText, requiredYn === "N" && s.toggleBtnTextActive]}>선택</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.toggleBtn, requiredYn === "Y" && s.toggleBtnActive]} onPress={() => setRequiredYn("Y")}>
                  <Text style={[s.toggleBtnText, requiredYn === "Y" && s.toggleBtnTextActive]}>필수</Text>
                </TouchableOpacity>
              </View>
            </View>

            {rows.map((r, i) => (
              <View key={r.key} style={s.optRowInput}>
                <TextInput
                  style={[s.inp, { flex: 2 }]}
                  placeholder={`옵션명 ${i + 1} (예: 톨)`}
                  value={r.optNm}
                  onChangeText={(v) => updateRow(r.key, "optNm", v)}
                />
                <TextInput
                  style={[s.inp, { flex: 1 }]}
                  placeholder="추가금액"
                  value={r.addPrice}
                  onChangeText={(v) => updateRow(r.key, "addPrice", v)}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={s.rowRemoveBtn} onPress={() => removeRow(r.key)}>
                  <Text style={s.rowRemoveBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={s.addRowBtn} onPress={addRow}>
              <Text style={s.addRowBtnText}>+ 옵션 추가</Text>
            </TouchableOpacity>

            {!!error && <Text style={s.error}>⚠️ {error}</Text>}

            <TouchableOpacity style={s.saveBtn} onPress={submitGroup} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>옵션그룹 저장</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <ConfirmModal
        visible={!!deleteGroupTarget}
        message="옵션그룹을 삭제하시겠어요? 그룹 내 옵션이 모두 삭제됩니다."
        confirmText="삭제"
        cancelText="취소"
        danger
        onConfirm={doDeleteGroup}
        onCancel={() => setDeleteGroupTarget(null)}
      />
      <ConfirmModal
        visible={!!deleteOptionTarget}
        message="옵션을 삭제하시겠어요?"
        confirmText="삭제"
        cancelText="취소"
        danger
        onConfirm={doDeleteOption}
        onCancel={() => setDeleteOptionTarget(null)}
      />
    </Modal>
  );
}
