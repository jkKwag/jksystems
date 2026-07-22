import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizCategory.styles";
import api from "../../lib/api";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminBizCategory({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined); // undefined=닫힘, null=신규, object=수정
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const list = await api.biz.categories(bizRegNo);
    setCategories(Array.isArray(list) ? list : []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const handleSaveCategory = async (form) => {
    setSaving(true);
    const isEdit = !!formTarget?.bizCatCd;
    const { data, error } = isEdit
      ? await api.biz.updateCategory(bizRegNo, formTarget.bizCatCd, form)
      : await api.biz.createCategory(bizRegNo, form);
    setSaving(false);
    if (error || !data) { setAlertMsg("저장에 실패했습니다. 다시 시도해주세요."); return; }
    setFormTarget(undefined);
    setCategories(prev => {
      const next = isEdit ? prev.map(c => c.bizCatCd === data.bizCatCd ? data : c) : [...prev, data];
      return [...next].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));
    });
  };

  const doDelete = async () => {
    const bizCatCd = deleteTarget?.bizCatCd;
    setDeleteTarget(null);
    const { error } = await api.biz.deleteCategory(bizRegNo, bizCatCd);
    if (error) {
      const msg = error?.message || error?.error || "삭제에 실패했습니다. 다시 시도해주세요.";
      setAlertMsg(msg);
      return;
    }
    setCategories(prev => prev.filter(c => c.bizCatCd !== bizCatCd));
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
        <Text style={s.title}>카테고리 관리</Text>
        <View style={s.headerBtnRow}>
          <TouchableOpacity style={s.refreshBtn} onPress={load}>
            <Text style={s.refreshBtnText}>새로고침</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => setFormTarget(null)}>
            <Text style={s.addBtnText}>+ 새 카테고리</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={s.hintText}>카테고리 카드를 클릭하면 수정할 수 있어요.</Text>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : categories.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>등록된 카테고리가 없습니다</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.bizCatCd} style={s.card} onPress={() => setFormTarget(cat)} activeOpacity={0.75}>
              <View style={s.cardInfo}>
                <View style={s.cardTopRow}>
                  <Text style={s.catNm} numberOfLines={1}>{cat.bizCatNm}</Text>
                  {cat.useYn === "N" && <View style={s.offBadge}><Text style={s.offBadgeText}>미노출</Text></View>}
                </View>
                {cat.catCd ? <Text style={s.catCdText}>참조코드 {cat.catCd}</Text> : null}
                {cat.rmrk ? <Text style={s.rmrk} numberOfLines={1}>{cat.rmrk}</Text> : null}
              </View>
              <View style={s.cardActions}>
                <Text style={s.sortOrdText}>정렬순번 {cat.sortOrd ?? "-"}</Text>
                <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={(e) => { e?.stopPropagation?.(); setDeleteTarget(cat); }}>
                  <Text style={[s.actionBtnText, s.deleteBtnText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <CategoryFormModal
        visible={formTarget !== undefined}
        initial={formTarget}
        saving={saving}
        onSave={handleSaveCategory}
        onClose={() => setFormTarget(undefined)}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        message={`"${deleteTarget?.bizCatNm}" 카테고리를 삭제하시겠어요?`}
        confirmText="삭제"
        cancelText="취소"
        danger
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
