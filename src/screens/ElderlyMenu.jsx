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

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const { width } = useWindowDimensions();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);

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

  const addToCart = (menuCd) => setCart(prev => ({ ...prev, [menuCd]: (prev[menuCd] || 0) + 1 }));
  const deleteFromCart = (menuCd) => setCart(prev => { const next = { ...prev }; delete next[menuCd]; return next; });
  const removeFromCart = (menuCd) => setCart(prev => {
    const next = { ...prev };
    if ((next[menuCd] || 0) <= 1) delete next[menuCd];
    else next[menuCd]--;
    return next;
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (showCartModal && cartCount === 0) setShowCartModal(false);
  }, [cartCount, showCartModal]);

  const cartTotal = Object.entries(cart).reduce((sum, [cd, qty]) => {
    const menu = menus.find(m => m.menuCd === cd);
    return sum + (menu ? menu.price * qty : 0);
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
              const qty = cart[menu.menuCd] || 0;
              return (
                <View key={menu.menuCd} style={[s.slide, { width }]}>
                  <View style={s.card}>
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
                        <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(menu.menuCd)}>
                          <Text style={s.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={s.addBtn} onPress={() => addToCart(menu.menuCd)}>
                        <Text style={s.addBtnText}>추가</Text>
                      </TouchableOpacity>
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
              {Object.entries(cart).map(([cd, qty]) => {
                const menu = menus.find(m => m.menuCd === cd);
                if (!menu) return null;
                return (
                  <View key={cd} style={s.modalItem}>
                    <View style={s.modalItemHeader}>
                      <Text style={s.modalItemName} numberOfLines={1}>{menu.menuNm}</Text>
                      <TouchableOpacity style={s.deleteBtn} onPress={() => deleteFromCart(cd)}>
                        <Text style={s.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.modalItemBottom}>
                      <View style={s.qtyRow}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(cd)}>
                          <Text style={s.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyNum}>{qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(cd)}>
                          <Text style={s.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={s.modalItemPrice}>{(menu.price * qty).toLocaleString()}원</Text>
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
