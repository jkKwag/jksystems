import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from "react-native";
import supabase from "../lib/supabase";
import { s } from "../styles/ElderlyMenu.styles";

const DEMO_MENUS = [
  { menu_cd: "d1", menu_nm: "된장찌개 정식", price: 9000 },
  { menu_cd: "d2", menu_nm: "캠프 직화 삼겹살", price: 17000 },
  { menu_cd: "d3", menu_nm: "돌솥 비빔밥", price: 13000 },
  { menu_cd: "d4", menu_nm: "잔치국수", price: 7000 },
  { menu_cd: "d5", menu_nm: "허브 치킨 구이", price: 18000 },
];

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const { width } = useWindowDimensions();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    supabase
      .from("tb_biz_menu")
      .select("menu_cd,menu_nm,price")
      .eq("biz_reg_no", bizno)
      .eq("use_yn", "Y")
      .order("sort_ord")
      .then(({ data }) => {
        setMenus(data && data.length > 0 ? data : DEMO_MENUS);
        setLoading(false);
      })
      .catch(() => {
        setMenus(DEMO_MENUS);
        setLoading(false);
      });
  }, [bizno]);

  const goTo = (newIndex) => {
    if (newIndex < 0 || newIndex >= menus.length) return;
    Animated.timing(translateX, {
      toValue: -newIndex * width,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setCurrentIndex(newIndex);
  };

  const addToCart = (menuCd) => setCart(prev => ({ ...prev, [menuCd]: (prev[menuCd] || 0) + 1 }));
  const removeFromCart = (menuCd) => setCart(prev => {
    const next = { ...prev };
    if ((next[menuCd] || 0) <= 1) delete next[menuCd];
    else next[menuCd]--;
    return next;
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [cd, qty]) => {
    const menu = menus.find(m => m.menu_cd === cd);
    return sum + (menu ? menu.price * qty : 0);
  }, 0);

  if (loading) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingText}>메뉴 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerGuide}>
          <Text style={s.headerGuideText}>👴 큰 글씨 보기 모드</Text>
        </View>
      </View>

      <View style={s.carouselOuter}>
        {/* 슬라이드 — 전체 너비 */}
        <View style={s.carouselClip}>
          <Animated.View style={[s.track, { width: width * menus.length, transform: [{ translateX }] }]}>
            {menus.map((menu) => {
              const qty = cart[menu.menu_cd] || 0;
              return (
                <View key={menu.menu_cd} style={[s.slide, { width }]}>
                  <View style={s.card}>
                    <Text style={s.menuName}>{menu.menu_nm}</Text>
                    <Text style={[s.menuQty, qty > 0 && s.menuQtyActive]}>
                      {qty > 0 ? `${qty}개 담음` : "0개"}
                    </Text>
                    <Text style={s.price}>{menu.price?.toLocaleString()}원</Text>
                    {qty > 0 ? (
                      <View style={s.qtyRow}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(menu.menu_cd)}>
                          <Text style={s.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyNum}>{qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(menu.menu_cd)}>
                          <Text style={s.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={s.addBtn} onPress={() => addToCart(menu.menu_cd)}>
                        <Text style={s.addBtnText}>추가</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </View>

        {/* 떠 있는 화살표 — clip 밖, carouselOuter 기준 절대배치 */}
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
            <Text style={s.modalTitle}>장바구니</Text>
            <ScrollView style={s.modalList}>
              {Object.entries(cart).map(([cd, qty]) => {
                const menu = menus.find(m => m.menu_cd === cd);
                if (!menu) return null;
                return (
                  <View key={cd} style={s.modalItem}>
                    <Text style={s.modalItemName} numberOfLines={1}>{menu.menu_nm}</Text>
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
                );
              })}
            </ScrollView>
            <View style={s.modalFooter}>
              <Text style={s.modalTotal}>총 {cartTotal.toLocaleString()}원</Text>
              <TouchableOpacity style={s.modalOrderBtn} onPress={() => setShowCartModal(false)}>
                <Text style={s.modalOrderBtnText}>주문하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
