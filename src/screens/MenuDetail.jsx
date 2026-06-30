import { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Platform, Animated,
} from "react-native";
import supabase from "../lib/supabase";

const sortByOrd = (arr) => [...arr].sort((a, b) => (a.sort_ord ?? 999) - (b.sort_ord ?? 999));

// tb_biz_menu_opt_grp / tb_biz_menu_opt_choice 조회 → 화면에서 쓰기 쉬운 형태로 변환
async function fetchOptionGroups(menuCd) {
  const { data, error } = await supabase
    .from("tb_biz_menu_opt_grp")
    .select("opt_grp_cd,opt_grp_nm,opt_type,required_yn,sort_ord,tb_biz_menu_opt_choice(opt_cd,choice_nm,add_price,sort_ord,use_yn)")
    .eq("menu_cd", menuCd)
    .eq("use_yn", "Y");

  if (error || !data) return [];

  return sortByOrd(data).map(g => ({
    id: g.opt_grp_cd,
    label: g.opt_grp_nm,
    type: g.opt_type === "C" ? "C" : "R",
    required: g.required_yn === "Y",
    choices: sortByOrd((g.tb_biz_menu_opt_choice || []).filter(c => c.use_yn !== "N"))
      .map(c => ({ id: c.opt_cd, name: c.choice_nm, price: c.add_price || 0 })),
  }));
}

function RadioGroup({ label, required, choices, selected, onSelect }) {
  return (
    <View style={s.optionBlock}>
      <View style={s.optionLabelRow}>
        <Text style={s.optionLabel}>{label}</Text>
        {required && <View style={s.requiredBadge}><Text style={s.requiredText}>필수</Text></View>}
      </View>
      {choices.map(c => (
        <TouchableOpacity
          key={c.id}
          style={[s.choiceRow, selected === c.id && s.choiceRowActive]}
          onPress={() => onSelect(c.id)}
          activeOpacity={0.7}
        >
          <View style={[s.radio, selected === c.id && s.radioActive]}>
            {selected === c.id && <View style={s.radioDot} />}
          </View>
          <Text style={[s.choiceName, selected === c.id && s.choiceNameActive]}>{c.name}</Text>
          {c.price > 0 && (
            <Text style={s.choicePrice}>+₩{c.price.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CheckGroup({ label, required, choices, selected, onToggle }) {
  return (
    <View style={s.optionBlock}>
      <View style={s.optionLabelRow}>
        <Text style={s.optionLabel}>{label}</Text>
        {required && <View style={s.requiredBadge}><Text style={s.requiredText}>필수</Text></View>}
        {!required && <Text style={s.optionalText}>선택</Text>}
      </View>
      {choices.map(c => {
        const checked = selected.includes(c.id);
        return (
          <TouchableOpacity
            key={c.id}
            style={[s.choiceRow, checked && s.choiceRowActive]}
            onPress={() => onToggle(c.id)}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, checked && s.checkboxActive]}>
              {checked && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={[s.choiceName, checked && s.choiceNameActive]}>{c.name}</Text>
            {c.price > 0 && (
              <Text style={s.choicePrice}>+₩{c.price.toLocaleString()}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MenuDetail({ item, onClose, onAddToCart }) {
  const [optionGroups, setOptionGroups] = useState(null); // null = 로딩중
  const [selections,   setSelections]   = useState({});   // { [opt_grp_cd]: choiceId | choiceId[] }
  const [quantity,     setQuantity]     = useState(item?.quantity || 1);
  const [imgError,     setImgError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOptionGroups(null);
    if (!item?.id) { setOptionGroups([]); return; }

    fetchOptionGroups(item.id).then(groups => {
      if (cancelled) return;
      setOptionGroups(groups);
      const initial = {};
      groups.forEach(g => {
        const saved = item?.optionIds?.[g.id];
        initial[g.id] = g.type === "C"
          ? (Array.isArray(saved) ? saved : [])
          : (saved || g.choices[0]?.id || null);
      });
      setSelections(initial);
    });

    return () => { cancelled = true; };
  }, [item?.id]);

  // transform(translateY) 기반 슬라이드 애니메이션은 모바일 사파리에서
  // 애니메이션 종료 시 컴포지팅 레이어가 재정리되며 그 직후 첫 터치가
  // 스크롤 제스처로 인식되지 않는 문제가 있어, transform을 전혀 쓰지 않는
  // opacity 페이드인으로 대체함
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  const groups = optionGroups || [];

  // 총 가격 계산: 그룹별 선택된 선택지의 add_price 합산
  const optionPrice = groups.reduce((sum, g) => {
    const sel = selections[g.id];
    if (g.type === "C") {
      return sum + (sel || []).reduce((s, cid) => s + (g.choices.find(c => c.id === cid)?.price || 0), 0);
    }
    return sum + (g.choices.find(c => c.id === sel)?.price || 0);
  }, 0);
  const unitPrice = (item?.price || 0) + optionPrice;
  const totalPrice = unitPrice * quantity;

  const selectRadio = (groupId, choiceId) => {
    setSelections(prev => ({ ...prev, [groupId]: choiceId }));
  };

  const toggleCheck = (groupId, choiceId) => {
    setSelections(prev => {
      const cur = prev[groupId] || [];
      const next = cur.includes(choiceId) ? cur.filter(x => x !== choiceId) : [...cur, choiceId];
      return { ...prev, [groupId]: next };
    });
  };

  const handleAddToCart = () => {
    const optionLabels = [];
    const optionIds = {};
    groups.forEach(g => {
      const sel = selections[g.id];
      optionIds[g.id] = sel;
      if (g.type === "C") {
        (sel || []).forEach(cid => {
          const c = g.choices.find(c => c.id === cid);
          if (c) optionLabels.push(c.name);
        });
      } else {
        const c = g.choices.find(c => c.id === sel);
        if (c) optionLabels.push(c.name);
      }
    });
    const hasOptions = groups.length > 0;

    onAddToCart?.({
      ...item,
      price: unitPrice,
      basePrice: item?.price || 0,
      optionPrice,
      optionLabels: hasOptions ? optionLabels : undefined,
      optionIds: hasOptions ? optionIds : undefined,
      quantity,
      totalPrice,
    });
    onClose?.();
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* 헤더 */}
      <View style={[s.header, Platform.OS === "web" && { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }]}>
        <TouchableOpacity style={s.backBtn} onPress={onClose}>
          <Text style={s.backBtnText}>← 메뉴로</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{item?.name || "메뉴 상세"}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* 히어로 이미지 */}
        <View style={s.heroWrap}>
          {imgError || !item?.image ? (
            <View style={[s.hero, s.heroNoImg]}>
              <Text style={s.heroNoImgText}>NO IMAGE</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.image }}
              style={s.hero}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          )}
          {item?.badge && (
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>

        {/* 메뉴 정보 */}
        <View style={s.infoSection}>
          <Text style={s.category}>{item?.category || ""}</Text>
          <Text style={s.name}>{item?.name || ""}</Text>
          <Text style={s.desc}>{item?.desc || ""}</Text>
          <Text style={s.basePrice}>₩{(item?.price || 0).toLocaleString()}</Text>
        </View>

        {/* 옵션 (DB: tb_biz_menu_opt_grp / tb_biz_menu_opt_choice) */}
        {optionGroups === null ? (
          <>
            <View style={s.divider} />
            <View style={s.optionBlock}>
              <Text style={s.optionalText}>옵션을 불러오는 중...</Text>
            </View>
          </>
        ) : (
          groups.map(g => (
            <View key={g.id}>
              <View style={s.divider} />
              {g.type === "C" ? (
                <CheckGroup
                  label={g.label}
                  required={g.required}
                  choices={g.choices}
                  selected={selections[g.id] || []}
                  onToggle={(cid) => toggleCheck(g.id, cid)}
                />
              ) : (
                <RadioGroup
                  label={g.label}
                  required={g.required}
                  choices={g.choices}
                  selected={selections[g.id]}
                  onSelect={(cid) => selectRadio(g.id, cid)}
                />
              )}
            </View>
          ))
        )}

        <View style={s.divider} />

        {/* 수량 */}
        <View style={s.optionBlock}>
          <Text style={s.optionLabel}>수량</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity
              style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{quantity}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
              <Text style={s.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 여백 (MenuDetail 바 + 장바구니 바 높이) */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* 하단 담기 바 */}
      <View style={[s.bottomBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0 }]}>
        <View style={s.totalWrap}>
          <Text style={s.totalLabel}>총 금액</Text>
          <Text style={s.totalPrice}>₩{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={handleAddToCart}>
          <Text style={s.cartBtnText}>{item?.optionIds ? "✓ 변경사항 저장" : "🛒 장바구니 담기"}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", overflow: "hidden" },

  header: {
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "800", textAlign: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  heroWrap: { position: "relative" },
  hero: { width: "100%", height: 260, backgroundColor: "#eee" },
  heroNoImg: { justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  heroNoImgText: { fontSize: 14, color: "#bbb", fontWeight: "600" },
  heroBadge: { position: "absolute", top: 14, left: 14, backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  infoSection: { backgroundColor: "#fff", padding: 20 },
  category: { fontSize: 12, color: "#f97316", fontWeight: "700", marginBottom: 4 },
  name: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 8 },
  desc: { fontSize: 14, color: "#666", lineHeight: 21, marginBottom: 14 },
  basePrice: { fontSize: 20, fontWeight: "900", color: "#111" },

  divider: { height: 8, backgroundColor: "#f3f4f6" },

  optionBlock: { backgroundColor: "#fff", padding: 20 },
  optionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  optionLabel: { fontSize: 15, fontWeight: "800", color: "#111" },
  requiredBadge: { backgroundColor: "#f97316", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  requiredText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  optionalText: { fontSize: 11, color: "#aaa", fontWeight: "600" },

  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  choiceRowActive: { borderColor: "#f97316", backgroundColor: "#fff8f5" },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
  radioActive: { borderColor: "#f97316" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f97316" },

  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
  checkboxActive: { borderColor: "#f97316", backgroundColor: "#f97316" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "900", lineHeight: 14 },

  choiceName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#555" },
  choiceNameActive: { color: "#111", fontWeight: "700" },
  choicePrice: { fontSize: 13, fontWeight: "700", color: "#f97316" },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0, alignSelf: "flex-start", backgroundColor: "#f3f4f6", borderRadius: 24, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 18 },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyBtnText: { fontSize: 20, fontWeight: "700", color: "#111" },
  qtyNum: { minWidth: 36, textAlign: "center", fontSize: 16, fontWeight: "900", color: "#111" },

  bottomBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    padding: 16,
    gap: 12,
  },
  totalWrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 13, color: "#888", fontWeight: "600" },
  totalPrice: { fontSize: 22, fontWeight: "900", color: "#111" },
  cartBtn: { backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
