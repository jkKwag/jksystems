import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Platform } from "react-native";
import { s } from "../../styles/admin/MenuOptionsModal.styles";
import api from "../../lib/api";
import ConfirmModal from "../ConfirmModal";

// 카테고리/메뉴 등록 모달과 동일한 남색→녹색 그라데이션 헤더 (웹 전용, RN 네이티브는 primary 단색)
const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

const emptyRow = () => ({ key: Math.random().toString(36).slice(2), optCd: null, optNm: "", addPrice: "" });

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
  const [editingGroupCd, setEditingGroupCd] = useState(null);
  const [originalOptCds, setOriginalOptCds] = useState([]);
  const scrollRef = useRef(null);

  const resetForm = () => {
    setGrpNm("");
    setOptType("R");
    setRequiredYn("N");
    setRows([emptyRow()]);
    setEditingGroupCd(null);
    setOriginalOptCds([]);
    setError("");
  };

  // 그룹의 "수정"을 누르면 하단 폼이 그 그룹 값으로 채워지고, 저장 시 새로 만드는 대신
  // 이 그룹/옵션들을 업데이트하는 모드로 전환된다.
  const startEditGroup = (g) => {
    const existingRows = (g.options || []).map(o => ({
      key: o.optCd,
      optCd: o.optCd,
      optNm: o.optNm,
      addPrice: String(Number(o.addPrice) || 0),
    }));
    setEditingGroupCd(g.optGrpCd);
    setGrpNm(g.optGrpNm);
    setOptType(g.optType);
    setRequiredYn(g.requiredYn);
    setRows(existingRows.length ? existingRows : [emptyRow()]);
    setOriginalOptCds(existingRows.map(r => r.optCd));
    setError("");
    // 폼이 다시 그려진 뒤 옵션그룹 수정 위치(하단)로 부드럽게 스크롤
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const cancelEdit = () => resetForm();

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
  const moveRow = (index, direction) => {
    setRows(prev => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const arr = [...prev];
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      return arr;
    });
  };

  const submitGroup = async () => {
    if (!grpNm.trim()) { setError("옵션그룹 이름을 입력해주세요."); return; }
    const validRows = rows.filter(r => r.optNm.trim());
    if (validRows.length === 0) { setError("옵션을 1개 이상 입력해주세요."); return; }
    setError("");
    setSaving(true);

    if (editingGroupCd) {
      const { error: grpError } = await api.menu.updateOptionGroup(menu.menuCd, editingGroupCd, {
        optGrpNm: grpNm.trim(),
        optType,
        requiredYn,
      });
      if (grpError) { setSaving(false); setError("옵션그룹 수정에 실패했습니다."); return; }

      const currentOptCds = validRows.filter(r => r.optCd).map(r => r.optCd);
      const removedOptCds = originalOptCds.filter(optCd => !currentOptCds.includes(optCd));
      const results = await Promise.all([
        ...validRows.map((r, idx) => {
          const body = { optNm: r.optNm.trim(), addPrice: Number(r.addPrice) || 0, sortOrd: idx + 1 };
          return r.optCd
            ? api.menu.updateOption(menu.menuCd, editingGroupCd, r.optCd, body)
            : api.menu.addOption(menu.menuCd, editingGroupCd, body);
        }),
        ...removedOptCds.map(optCd => api.menu.deleteOption(menu.menuCd, editingGroupCd, optCd)),
      ]);
      setSaving(false);
      if (results.some(r => r?.error)) { setError("옵션그룹 수정에 실패했습니다."); return; }
      await load();
      resetForm();
      return;
    }

    const options = validRows.map(r => ({ optNm: r.optNm.trim(), addPrice: Number(r.addPrice) || 0 }));
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
    if (editingGroupCd === optGrpCd) resetForm();
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
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.headerTitle}>🧩 {menu?.menuNm} 옵션상세</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollRef} style={s.body} contentContainerStyle={s.bodyContent}>
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
                      <TouchableOpacity onPress={() => startEditGroup(g)}>
                        <Text style={s.groupEditText}>수정</Text>
                      </TouchableOpacity>
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
            <View style={s.newGroupBox}>
            <Text style={s.newGroupTitle}>{editingGroupCd ? "옵션그룹 수정" : "새 옵션그룹 추가"}</Text>

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
                <View style={s.rowSortBtns}>
                  <TouchableOpacity style={[s.rowSortBtn, i === 0 && s.rowSortBtnDisabled]} disabled={i === 0} onPress={() => moveRow(i, -1)}>
                    <Text style={s.rowSortBtnText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.rowSortBtn, i === rows.length - 1 && s.rowSortBtnDisabled]} disabled={i === rows.length - 1} onPress={() => moveRow(i, 1)}>
                    <Text style={s.rowSortBtnText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[s.inp, { flex: 2, minWidth: 0 }]}
                  placeholder="옵션명 (예: 톨)"
                  value={r.optNm}
                  onChangeText={(v) => updateRow(r.key, "optNm", v)}
                />
                <TextInput
                  style={[s.inp, { flex: 1, minWidth: 0 }]}
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
            </View>

            <View style={s.saveRow}>
              <TouchableOpacity style={[s.saveBtn, editingGroupCd && s.saveBtnUpdate]} onPress={submitGroup} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  <Text style={s.saveBtnText}>{editingGroupCd ? "옵션그룹 수정 저장" : "옵션그룹 저장"}</Text>
                )}
              </TouchableOpacity>
              {!!editingGroupCd && (
                <TouchableOpacity style={s.cancelEditBtn} onPress={cancelEdit} disabled={saving}>
                  <Text style={s.cancelEditText}>취소</Text>
                </TouchableOpacity>
              )}
            </View>
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
