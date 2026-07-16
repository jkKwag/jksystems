import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import supabase from "../lib/supabase";
import { s } from "../styles/ElderlyMenu.styles";

const DEMO_MENUS = [
  { menu_cd: "d1", menu_nm: "된장찌개 정식", price: 9000 },
  { menu_cd: "d2", menu_nm: "삼겹살 구이", price: 15000 },
  { menu_cd: "d3", menu_nm: "잔치국수", price: 7000 },
  { menu_cd: "d4", menu_nm: "순두부찌개", price: 9500 },
];

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);

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

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {menus.map(menu => {
          const qty = cart[menu.menu_cd] || 0;
          return (
            <View key={menu.menu_cd} style={s.card}>
              <Text style={s.menuName}>{menu.menu_nm}</Text>
              <Text style={[s.menuQty, qty > 0 && s.menuQtyActive]}>
                {qty > 0 ? `${qty}개 담음` : "0개"}
              </Text>
              <View style={s.cardBottom}>
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
                    <Text style={s.addBtnText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

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
