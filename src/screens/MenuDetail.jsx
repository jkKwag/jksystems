import { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated,
} from "react-native";
import { s } from "../styles/MenuDetail.styles";
import api from "../lib/api";

const sortByOrd = (arr) => [...arr].sort((a, b) => (a.sortOrd ?? 999) - (b.sortOrd ?? 999));

async function fetchOptionGroups(menuCd) {
  const data = await api.menu.options(menuCd);
  if (!Array.isArray(data)) return [];
  return sortByOrd(data.filter(g => g.useYn === "Y")).map(g => ({
    id: g.optGrpCd,
    label: g.optGrpNm,
    type: g.optType,
    required: g.requiredYn === "Y",
    choices: sortByOrd((g.options || []).filter(c => c.useYn === "Y")).map(c => ({
      id: c.optCd,
      name: c.optNm,
      price: c.addPrice,
    })),
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
  // 사이드만 추가: 기본 메뉴 가격은 빼고 선택한 옵션 가격만 담아서, 이미 결제/주문한
  // 메뉴에 옵션(사이드)만 추가로 주문하고 싶을 때 쓴다 (장바구니엔 별도 줄로 담김)
  const [sideOnly, setSideOnly] = useState(!!item?.sideOnly);

  useEffect(() => {
    if (Platform.OS === "web") window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setOptionGroups(null);
    // 사이드만 추가로 담긴 항목을 다시 열어 수정할 때는 item.id가 장바구니 내부용
    // 합성 코드(실제 menuCd + "_side")라서, 옵션 조회는 항상 진짜 menuCd로 해야 한다.
    const menuCd = item?.menuCd || item?.id;
    if (!menuCd) { setOptionGroups([]); return; }

    fetchOptionGroups(menuCd).then(groups => {
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
  // 사이드만 추가로 한 번 담겼던 항목을 다시 열어 수정할 때는 item.price가 이미
  // 0(기본가격 제외)으로 저장돼 있을 수 있어, 진짜 메뉴 단가는 menuBasePrice에 따로 보존해둔다.
  const trueBasePrice = item?.menuBasePrice ?? (item?.price || 0);
  const basePrice = sideOnly ? 0 : trueBasePrice;
  const unitPrice = basePrice + optionPrice;
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
    const selectedOptions = []; // [{id, name, price}] — 주문 API로 그대로 보낼 수 있는 형태
    groups.forEach(g => {
      const sel = selections[g.id];
      optionIds[g.id] = sel;
      if (g.type === "C") {
        (sel || []).forEach(cid => {
          const c = g.choices.find(c => c.id === cid);
          if (c) { optionLabels.push(c.name); selectedOptions.push({ id: c.id, name: c.name, price: c.price || 0 }); }
        });
      } else {
        const c = g.choices.find(c => c.id === sel);
        if (c) { optionLabels.push(c.name); selectedOptions.push({ id: c.id, name: c.name, price: c.price || 0 }); }
      }
    });
    const hasOptions = groups.length > 0;
    if (sideOnly && optionPrice <= 0) {
      alert("사이드만 추가하려면 가격이 있는 옵션을 선택해주세요.");
      return;
    }
    // 사이드만 추가로 담긴 항목을 다시 열어 수정할 때 item.id/name은 이미
    // 장바구니용으로 가공된 값이라, 진짜 menuCd와 원래 메뉴명은 따로 보존해둔다.
    const realMenuCd = item.menuCd || item.id;
    const baseName = item.baseName || item.name;

    onAddToCart?.({
      ...item,
      id: sideOnly ? `${realMenuCd}_side` : realMenuCd,
      menuCd: realMenuCd,
      baseName,
      name: sideOnly ? `사이드만 추가(${baseName})` : baseName,
      price: unitPrice,
      basePrice,
      menuBasePrice: trueBasePrice,
      optionPrice,
      sideOnly,
      optionLabels: hasOptions ? optionLabels : undefined,
      optionIds: hasOptions ? optionIds : undefined,
      selectedOptions: hasOptions ? selectedOptions : undefined,
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
        <Text style={s.headerTitle} numberOfLines={1}>{item?.baseName || item?.name || "메뉴 상세"}</Text>
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
          <Text style={s.name}>{item?.baseName || item?.name || ""}</Text>
          <Text style={s.desc}>{item?.desc || ""}</Text>
          <Text style={s.basePrice}>₩{trueBasePrice.toLocaleString()}</Text>
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

          {groups.length > 0 && (
            <TouchableOpacity style={s.sideOnlyRow} onPress={() => setSideOnly(v => !v)} activeOpacity={0.7}>
              <View style={[s.checkbox, sideOnly && s.checkboxActive]}>
                {sideOnly && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.sideOnlyLabel}>사이드만 추가 (기본 메뉴 가격 제외, 선택한 옵션만 담겨요)</Text>
            </TouchableOpacity>
          )}
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
