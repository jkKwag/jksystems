import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Animated, Easing } from "react-native";
import { s } from "../../styles/admin/AdminMenu.styles";
import api from "../../lib/api";
import MenuFormModal from "../../components/admin/MenuFormModal";
import MenuOptionsModal from "../../components/admin/MenuOptionsModal";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminMenu({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined); // undefined=닫힘, null=신규, object=수정
  const [optionsTarget, setOptionsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCatCd, setSelectedCatCd] = useState(null); // null = 전체
  const [reordering, setReordering] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const highlightTimer = useRef(null);

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const [menuList, catList] = await Promise.all([
      api.biz.menus(bizRegNo),
      api.biz.categories(bizRegNo),
    ]);
    setMenus(Array.isArray(menuList) ? menuList : []);
    setCategories(Array.isArray(catList) ? catList : []);
    setSelectedCatCd(null);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  useEffect(() => {
    if (loaded) return;
    spinAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [loaded]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const catNm = (cd) => categories.find(c => c.bizCatCd === cd)?.bizCatNm || "미지정";

  const handleSaveMenu = async (form) => {
    setSaving(true);
    const isEdit = !!formTarget?.menuCd;
    const { data, error } = isEdit
      ? await api.biz.updateMenu(bizRegNo, formTarget.menuCd, form)
      : await api.biz.createMenu(bizRegNo, form);
    setSaving(false);
    if (error || !data) { setAlertMsg("저장에 실패했습니다. 다시 시도해주세요."); return; }
    setFormTarget(undefined);
    setMenus(prev => {
      const next = isEdit ? prev.map(m => m.menuCd === data.menuCd ? data : m) : [...prev, data];
      return [...next].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));
    });
  };

  const doDelete = async () => {
    const menuCd = deleteTarget?.menuCd;
    setDeleteTarget(null);
    const { error } = await api.biz.deleteMenu(bizRegNo, menuCd);
    if (error) { setAlertMsg("삭제에 실패했습니다. 다시 시도해주세요."); return; }
    setMenus(prev => prev.filter(m => m.menuCd !== menuCd));
  };

  const moveMenu = async (list, index, direction) => {
    if (reordering) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const movedMenuCd = list[index].menuCd;
    const arr = [...list];
    [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
    const renumbered = arr.map((m, i) => ({ ...m, sortOrd: i }));
    setReordering(true);
    const results = await Promise.all(renumbered.map(m => api.biz.updateMenu(bizRegNo, m.menuCd, {
      bizCatCd: m.bizCatCd,
      menuNm: m.menuNm,
      menuDesc: m.menuDesc,
      price: m.price,
      imgUrl: m.imgUrl,
      badge: m.badge,
      sortOrd: m.sortOrd,
      useYn: m.useYn,
    })));
    setReordering(false);
    if (results.some(r => r.error)) {
      setAlertMsg("순서 변경에 실패했습니다. 다시 시도해주세요.");
      load();
      return;
    }
    setMenus(prev => {
      const renumberedMap = new Map(renumbered.map(m => [m.menuCd, m]));
      const next = prev.map(m => renumberedMap.get(m.menuCd) || m);
      return [...next].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));
    });
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightId(movedMenuCd);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 3000);
  };

  useEffect(() => () => { if (highlightTimer.current) clearTimeout(highlightTimer.current); }, []);

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  const filteredMenus = selectedCatCd ? menus.filter(m => m.bizCatCd === selectedCatCd) : menus;

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>메뉴 관리</Text>
        <View style={s.headerBtnRow}>
          <TouchableOpacity style={s.refreshBtn} onPress={load}>
            <Animated.Text style={[s.refreshBtnText, { transform: [{ rotate: spin }] }]}>🔄</Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => setFormTarget(null)}>
            <Text style={s.addBtnText}>+ 새 메뉴</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={s.hintText}>메뉴 카드를 클릭하면 메뉴를 수정할 수 있어요.</Text>

      {categories.length > 0 && (
        <View style={s.catFilterBox}>
          <View style={s.catFilterRow}>
            <TouchableOpacity
              style={[s.catChip, !selectedCatCd && s.catChipActive]}
              onPress={() => setSelectedCatCd(null)}
            >
              <Text style={[s.catChipText, !selectedCatCd && s.catChipTextActive]}>전체 {menus.length}</Text>
            </TouchableOpacity>
            {categories.map(c => {
              const count = menus.filter(m => m.bizCatCd === c.bizCatCd).length;
              const active = selectedCatCd === c.bizCatCd;
              return (
                <TouchableOpacity
                  key={c.bizCatCd}
                  style={[s.catChip, active && s.catChipActive]}
                  onPress={() => setSelectedCatCd(c.bizCatCd)}
                >
                  <Text style={[s.catChipText, active && s.catChipTextActive]}>{c.bizCatNm} {count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : filteredMenus.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>{selectedCatCd ? "해당 카테고리에 메뉴가 없습니다" : "등록된 메뉴가 없습니다"}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {filteredMenus.map((menu, index) => (
            <TouchableOpacity
              key={menu.menuCd}
              style={[s.card, highlightId === menu.menuCd && s.cardHighlight]}
              onPress={() => setFormTarget(menu)}
              activeOpacity={0.75}
            >
              <View style={s.cardTopSection}>
                {menu.imgUrl ? (
                  <Image source={{ uri: menu.imgUrl }} style={s.thumb} resizeMode="cover" />
                ) : (
                  <View style={[s.thumb, s.thumbEmpty]}><Text style={s.thumbEmptyText}>NO IMAGE</Text></View>
                )}
                <View style={s.cardInfo}>
                  <View style={s.cardTopRow}>
                    <Text style={s.menuNm} numberOfLines={1}>{menu.menuNm}</Text>
                    {menu.useYn === "N" && <View style={s.offBadge}><Text style={s.offBadgeText}>미노출</Text></View>}
                    {menu.badge ? <View style={s.badgeChip}><Text style={s.badgeChipText}>{menu.badge}</Text></View> : null}
                  </View>
                  <Text style={s.cat}>{catNm(menu.bizCatCd)}</Text>
                  {menu.menuDesc ? <Text style={s.desc} numberOfLines={1}>{menu.menuDesc}</Text> : null}
                  <Text style={s.price}>₩{Number(menu.price || 0).toLocaleString()}</Text>
                </View>
                <View style={s.cardActions}>
                  <View style={s.sortBtnRow}>
                    <TouchableOpacity
                      style={[s.sortBtn, (index === 0 || reordering) && s.sortBtnDisabled]}
                      disabled={index === 0 || reordering}
                      onPress={(e) => { e?.stopPropagation?.(); moveMenu(filteredMenus, index, -1); }}
                    >
                      <Text style={s.sortBtnText}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.sortBtn, (index === filteredMenus.length - 1 || reordering) && s.sortBtnDisabled]}
                      disabled={index === filteredMenus.length - 1 || reordering}
                      onPress={(e) => { e?.stopPropagation?.(); moveMenu(filteredMenus, index, 1); }}
                    >
                      <Text style={s.sortBtnText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.sortOrdText}>메뉴정렬순번 {menu.sortOrd ?? "-"}</Text>
                  <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={(e) => { e?.stopPropagation?.(); setDeleteTarget(menu); }}>
                    <Text style={[s.actionBtnText, s.deleteBtnText]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={s.viewOptionsBtn} onPress={(e) => { e?.stopPropagation?.(); setOptionsTarget(menu); }}>
                <Text style={s.viewOptionsBtnText}>옵션보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <MenuFormModal
        visible={formTarget !== undefined}
        initial={formTarget}
        categories={categories}
        saving={saving}
        bizRegNo={bizRegNo}
        onSave={handleSaveMenu}
        onClose={() => setFormTarget(undefined)}
      />

      <MenuOptionsModal
        visible={!!optionsTarget}
        menu={optionsTarget}
        onClose={() => setOptionsTarget(null)}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        message={`"${deleteTarget?.menuNm}" 메뉴를 삭제하시겠어요?\n연결된 옵션도 함께 삭제됩니다.`}
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
