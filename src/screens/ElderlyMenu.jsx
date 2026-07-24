import { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from "react-native";
import api from "../lib/api";
import { s } from "../styles/ElderlyMenu.styles";

const DEMO_MENUS = [
  { menuCd: "d1", menuNm: "된장찌개 정식", price: 9000, imgUrl: null, emoji: "🍲" },
  { menuCd: "d2", menuNm: "캠프 직화 삼겹살", price: 17000, imgUrl: null, emoji: "🥩" },
  { menuCd: "d3", menuNm: "돌솥 비빔밥", price: 13000, imgUrl: null, emoji: "🍱" },
  { menuCd: "d4", menuNm: "잔치국수", price: 7000, imgUrl: null, emoji: "🍜" },
  { menuCd: "d5", menuNm: "허브 치킨 구이", price: 18000, imgUrl: null, emoji: "🍗" },
];

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

// 선택된 옵션들의 추가금 합계
function optionsTotalOf(groups, sel) {
  return groups.reduce((sum, g) => {
    const v = sel[g.id];
    if (g.type === "C") return sum + (v || []).reduce((s, cid) => s + (g.choices.find(c => c.id === cid)?.price || 0), 0);
    return sum + (g.choices.find(c => c.id === v)?.price || 0);
  }, 0);
}

// 선택된 옵션들의 이름 목록 (장바구니 표시용)
function optionLabelsOf(groups, sel) {
  const labels = [];
  groups.forEach(g => {
    const v = sel[g.id];
    if (g.type === "C") {
      (v || []).forEach(cid => { const c = g.choices.find(c => c.id === cid); if (c) labels.push(c.name); });
    } else {
      const c = g.choices.find(c => c.id === v);
      if (c) labels.push(c.name);
    }
  });
  return labels;
}

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const { width } = useWindowDimensions();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({}); // { [menuCd]: { qty, optionsTotal, optionLabels } }
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);

  // 메뉴별 옵션그룹/선택상태: { [menuCd]: group[] }, { [menuCd]: { [optGrpCd]: choiceId | choiceId[] } }
  const [optionGroupsByMenu, setOptionGroupsByMenu] = useState({});
  const [selections, setSelections] = useState({});

  const translateX = useRef(new Animated.Value(0)).current;
  const photoOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(1)).current;
  const bubbleShown = useRef(true);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (!bizno) {
      setMenus(DEMO_MENUS);
      setLoading(false);
      return;
    }
    api.biz.menus(bizno).then((data) => {
      setMenus(data && data.length > 0 ? data : DEMO_MENUS);
      setLoading(false);
    }).catch(() => {
      setMenus(DEMO_MENUS);
      setLoading(false);
    });
  }, [bizno]);

  // 메뉴 목록이 정해지면 각 메뉴의 옵션그룹을 한 번에 미리 불러온다
  useEffect(() => {
    if (menus.length === 0) return;
    let cancelled = false;
    Promise.all(menus.map(m => fetchOptionGroups(m.menuCd).then(groups => [m.menuCd, groups])))
      .then(entries => {
        if (cancelled) return;
        const groupMap = {};
        const initSel = {};
        entries.forEach(([menuCd, groups]) => {
          groupMap[menuCd] = groups;
          const sel = {};
          groups.forEach(g => { sel[g.id] = g.type === "C" ? [] : (g.choices[0]?.id || null); });
          initSel[menuCd] = sel;
        });
        setOptionGroupsByMenu(groupMap);
        setSelections(initSel);
      });
    return () => { cancelled = true; };
  }, [menus]);

  const goTo = (newIndex) => {
    if (newIndex < 0 || newIndex >= menus.length) return;
    if (bubbleShown.current) {
      bubbleShown.current = false;
      Animated.timing(bubbleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
    // 사진 페이드 아웃 → 인덱스 변경 → 페이드 인
    Animated.timing(photoOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setCurrentIndex(newIndex);
      Animated.timing(photoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
    Animated.timing(translateX, { toValue: -newIndex * width, duration: 280, useNativeDriver: true }).start();
  };

  const toggleOption = (menuCd, group, choiceId) => {
    setSelections(prev => {
      const menuSel = { ...(prev[menuCd] || {}) };
      if (group.type === "C") {
        const cur = menuSel[group.id] || [];
        menuSel[group.id] = cur.includes(choiceId) ? cur.filter(x => x !== choiceId) : [...cur, choiceId];
      } else {
        menuSel[group.id] = choiceId;
      }
      return { ...prev, [menuCd]: menuSel };
    });
  };

  // 지금 카드에서 선택돼 있는 옵션 그대로를 스냅샷으로 담는다 (+ 누를 때마다 최신 선택으로 갱신)
  const addToCart = (menu) => {
    const groups = optionGroupsByMenu[menu.menuCd] || [];
    const sel = selections[menu.menuCd] || {};
    const optionsTotal = optionsTotalOf(groups, sel);
    const optionLabels = optionLabelsOf(groups, sel);
    setCart(prev => ({
      ...prev,
      [menu.menuCd]: { qty: (prev[menu.menuCd]?.qty || 0) + 1, optionsTotal, optionLabels },
    }));
  };

  const deleteFromCart = (menuCd) => setCart(prev => { const next = { ...prev }; delete next[menuCd]; return next; });
  const removeFromCart = (menuCd) => setCart(prev => {
    const cur = prev[menuCd];
    if (!cur) return prev;
    const next = { ...prev };
    if (cur.qty <= 1) delete next[menuCd];
    else next[menuCd] = { ...cur, qty: cur.qty - 1 };
    return next;
  });

  const cartCount = Object.values(cart).reduce((a, c) => a + c.qty, 0);

  useEffect(() => {
    if (showCartModal && cartCount === 0) setShowCartModal(false);
  }, [cartCount, showCartModal]);

  const cartTotal = Object.entries(cart).reduce((sum, [cd, c]) => {
    const menu = menus.find(m => m.menuCd === cd);
    return sum + (menu ? (Number(menu.price || 0) + (c.optionsTotal || 0)) * c.qty : 0);
  }, 0);

  if (loading) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingText}>메뉴 불러오는 중...</Text>
      </View>
    );
  }

  const currentMenu = menus[currentIndex];

  return (
    <View style={s.container}>
      {/* 음식 사진 영역 */}
      <Animated.View style={[s.photoArea, { opacity: photoOpacity }]}>
        {currentMenu?.imgUrl ? (
          <Image source={{ uri: currentMenu.imgUrl }} style={s.photo} />
        ) : (
          <View style={s.photoPlaceholder}>
            <Text style={s.photoEmoji}>{currentMenu?.emoji || "🍽"}</Text>
          </View>
        )}
      </Animated.View>

      {/* 카드 캐러셀 */}
      <View style={s.carouselOuter}>
        <View style={s.carouselClip}>
          <Animated.View style={[s.track, { width: width * menus.length, transform: [{ translateX }] }]}>
            {menus.map((menu) => {
              const qty = cart[menu.menuCd]?.qty || 0;
              const groups = optionGroupsByMenu[menu.menuCd] || [];
              const hasOptions = groups.length > 0;
              const menuSel = selections[menu.menuCd] || {};
              return (
                <View key={menu.menuCd} style={[s.slide, { width }]}>
                  <View style={[s.card, hasOptions && s.cardWithOptions]}>
                    <Text style={s.menuName}>{menu.menuNm}</Text>
                    <Text style={[s.menuQty, qty > 0 && s.menuQtyActive]}>
                      {qty > 0 ? `${qty}개 담음` : "0개"}
                    </Text>
                    <Text style={s.price}>{menu.price?.toLocaleString()}원</Text>
                    {qty > 0 ? (
                      <View style={s.qtyRow}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(menu.menuCd)}>
                          <Text style={s.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyNum}>{qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(menu)}>
                          <Text style={s.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={s.addBtn} onPress={() => addToCart(menu)}>
                        <Text style={s.addBtnText}>추가</Text>
                      </TouchableOpacity>
                    )}

                    {/* 옵션 선택 (스크롤 영역) */}
                    {hasOptions && (
                      <ScrollView style={s.optionsScroll} contentContainerStyle={s.optionsScrollContent}>
                        {groups.map(g => (
                          <View key={g.id} style={s.optionGroupBlock}>
                            <View style={s.optionGroupLabelRow}>
                              <Text style={s.optionGroupLabel}>{g.label}</Text>
                              {g.required && <View style={s.optionRequiredBadge}><Text style={s.optionRequiredText}>필수</Text></View>}
                            </View>
                            {g.choices.map(c => {
                              const sel = menuSel[g.id];
                              const checked = g.type === "C" ? (sel || []).includes(c.id) : sel === c.id;
                              return (
                                <TouchableOpacity
                                  key={c.id}
                                  style={[s.optionChoiceRow, checked && s.optionChoiceRowActive]}
                                  onPress={() => toggleOption(menu.menuCd, g, c.id)}
                                  activeOpacity={0.7}
                                >
                                  <View style={[s.optionCheckCircle, checked && s.optionCheckCircleActive]}>
                                    {checked && <Text style={s.optionCheckMark}>✓</Text>}
                                  </View>
                                  <Text style={[s.optionChoiceName, checked && s.optionChoiceNameActive]}>{c.name}</Text>
                                  {c.price > 0 && (
                                    <Text style={s.optionChoicePrice}>+{c.price.toLocaleString()}원</Text>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </View>

        {currentIndex > 0 && (
          <TouchableOpacity style={s.prevBtn} onPress={() => goTo(currentIndex - 1)} activeOpacity={0.7}>
            <View style={s.navArrow}>
              <Text style={s.navArrowText}>‹</Text>
            </View>
          </TouchableOpacity>
        )}
        {currentIndex < menus.length - 1 && (
          <TouchableOpacity style={s.nextBtn} onPress={() => goTo(currentIndex + 1)} activeOpacity={0.7}>
            <Animated.View style={[s.navArrow, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={s.navArrowText}>›</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
        {currentIndex === 0 && (
          <Animated.View style={[s.bubble, { opacity: bubbleAnim }]} pointerEvents="none">
            <View style={s.bubbleBox}>
              <Text style={s.bubbleText}>더 있어요{"\n"}눌러보세요</Text>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={s.dots}>
        {menus.map((_, i) => (
          <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
        ))}
      </View>

      {cartCount > 0 && (
        <TouchableOpacity style={s.cartBar} onPress={() => setShowCartModal(true)} activeOpacity={0.85}>
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}개</Text></View>
          <Text style={s.cartText}>장바구니 보기</Text>
          <Text style={s.cartPrice}>{cartTotal.toLocaleString()}원</Text>
        </TouchableOpacity>
      )}

      {showCartModal && (
        <View style={[StyleSheet.absoluteFillObject, s.modalOverlay]}>
          <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowCartModal(false)} />
          <View style={s.modalSheet}>
            <View style={s.modalTitleRow}>
              <Text style={s.modalTitle}>장바구니</Text>
              <View style={s.modalTitleActions}>
                <TouchableOpacity style={s.trashBtn} onPress={() => { setCart({}); setShowCartModal(false); }}>
                  <Text style={s.trashBtnIcon}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.closeBtn} onPress={() => setShowCartModal(false)}>
                  <Text style={s.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={s.modalList}>
              {Object.entries(cart).map(([cd, c]) => {
                const menu = menus.find(m => m.menuCd === cd);
                if (!menu) return null;
                const unitPrice = Number(menu.price || 0) + (c.optionsTotal || 0);
                return (
                  <View key={cd} style={s.modalItem}>
                    <View style={s.modalItemHeader}>
                      <Text style={s.modalItemName} numberOfLines={1}>{menu.menuNm}</Text>
                      <TouchableOpacity style={s.deleteBtn} onPress={() => deleteFromCart(cd)}>
                        <Text style={s.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    {c.optionLabels?.length > 0 && (
                      <Text style={s.modalItemOptions} numberOfLines={1}>{c.optionLabels.join(", ")}</Text>
                    )}
                    <View style={s.modalItemBottom}>
                      <View style={s.qtyRow}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(cd)}>
                          <Text style={s.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyNum}>{c.qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(menu)}>
                          <Text style={s.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={s.modalItemPrice}>{(unitPrice * c.qty).toLocaleString()}원</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={s.modalFooter}>
              <Text style={s.modalTotal}>총 {cartTotal.toLocaleString()}원</Text>
              <TouchableOpacity
                style={[s.modalOrderBtn, cartCount === 0 && s.modalOrderBtnDisabled]}
                onPress={() => cartCount > 0 && setShowCartModal(false)}
                activeOpacity={cartCount > 0 ? 0.8 : 1}
              >
                <Text style={s.modalOrderBtnText}>주문하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
