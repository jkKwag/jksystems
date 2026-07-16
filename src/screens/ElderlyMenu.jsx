import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import supabase from "../lib/supabase";
import { s } from "../styles/ElderlyMenu.styles";

const DEMO_MENUS = [
  { menu_cd: "d1", biz_cat_cd: null, menu_nm: "된장찌개 정식", menu_desc: "구수한 된장찌개와 밥, 반찬 3종", price: 9000, img_url: null },
  { menu_cd: "d2", biz_cat_cd: null, menu_nm: "삼겹살 구이", menu_desc: "국내산 삼겹살 1인분 200g", price: 15000, img_url: null },
  { menu_cd: "d3", biz_cat_cd: null, menu_nm: "잔치국수", menu_desc: "시원한 멸치육수 국수", price: 7000, img_url: null },
  { menu_cd: "d4", biz_cat_cd: null, menu_nm: "순두부찌개", menu_desc: "부드러운 순두부와 신선한 재료", price: 9500, img_url: null },
];
const DEMO_ICONS = { d1: "🍚", d2: "🍖", d3: "🍜", d4: "🥘" };

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    if (!bizno) {
      setMenus(DEMO_MENUS);
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("tb_biz_cat").select("biz_cat_cd,biz_cat_nm,sort_ord").eq("biz_reg_no", bizno).eq("use_yn", "Y").order("sort_ord"),
      supabase.from("tb_biz_menu").select("menu_cd,biz_cat_cd,menu_nm,menu_desc,price,img_url,badge,sort_ord").eq("biz_reg_no", bizno).eq("use_yn", "Y").order("sort_ord"),
    ]).then(([{ data: cats }, { data: items }]) => {
      setCategories(cats || []);
      setMenus(items && items.length > 0 ? items : DEMO_MENUS);
      setLoading(false);
    }).catch(() => {
      setMenus(DEMO_MENUS);
      setLoading(false);
    });
  }, [bizno]);

  const filteredMenus = selectedCat ? menus.filter(m => m.biz_cat_cd === selectedCat) : menus;

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

      <View style={s.catBar}>
        <TouchableOpacity style={[s.catItem, !selectedCat && s.catItemActive]} onPress={() => setSelectedCat(null)}>
          <Text style={[s.catText, !selectedCat && s.catTextActive]}>전체</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity key={cat.biz_cat_cd} style={[s.catItem, selectedCat === cat.biz_cat_cd && s.catItemActive]} onPress={() => setSelectedCat(cat.biz_cat_cd)}>
            <Text style={[s.catText, selectedCat === cat.biz_cat_cd && s.catTextActive]}>{cat.biz_cat_nm}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filteredMenus.map(menu => (
          <View key={menu.menu_cd} style={s.card}>
            {menu.img_url
              ? <Image source={{ uri: menu.img_url }} style={s.img} />
              : <View style={[s.img, s.noImg]}><Text style={s.noImgIcon}>{DEMO_ICONS[menu.menu_cd] || "🍽"}</Text></View>
            }
            <View style={s.info}>
              <Text style={s.menuName}>{menu.menu_nm}</Text>
              {!!menu.menu_desc && <Text style={s.menuDesc} numberOfLines={2}>{menu.menu_desc}</Text>}
              <View style={s.cardBottom}>
                <Text style={s.price}>{menu.price?.toLocaleString()}원</Text>
                {cart[menu.menu_cd] ? (
                  <View style={s.qtyRow}>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(menu.menu_cd)}>
                      <Text style={s.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qtyNum}>{cart[menu.menu_cd]}</Text>
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
          </View>
        ))}
      </ScrollView>

      {cartCount > 0 && (
        <TouchableOpacity style={s.cartBar} onPress={() => setShowCartModal(true)} activeOpacity={0.85}>
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}개</Text></View>
          <Text style={s.cartText}>장바구니 보기</Text>
          <Text style={s.cartPrice}>{cartTotal.toLocaleString()}원</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showCartModal} transparent animationType="slide" onRequestClose={() => setShowCartModal(false)}>
        <View style={s.modalOverlay}>
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
      </Modal>
    </View>
  );
}
