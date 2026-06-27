import { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, Platform } from "react-native";

const CATEGORIES = ["전체", "고기류", "면·국밥", "피자", "음료"];

const DUMMY_ITEMS = [
  { id: 1, category: "고기류", name: "캠프 직화 삼겹살", desc: "국내산 생삼겹살 200g, 쌈채소·된장 포함", price: 18000, badge: "인기", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=180&h=180&fit=crop" },
  { id: 2, category: "고기류", name: "허브 치킨 구이", desc: "허브 마리네이드 반마리, 감자·옥수수 곁들임", price: 16000, badge: null, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=180&h=180&fit=crop" },
  { id: 3, category: "면·국밥", name: "야생 버섯 칼국수", desc: "직접 뽑은 수제면에 진한 사골 육수", price: 12000, badge: "베스트", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=180&h=180&fit=crop" },
  { id: 4, category: "피자", name: "캠프파이어 피자", desc: "화덕에서 구운 나폴리 스타일, 모짜렐라 듬뿍", price: 22000, badge: null, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=180&h=180&fit=crop" },
  { id: 5, category: "면·국밥", name: "그린 샐러드 볼", desc: "제철 채소와 수제 드레싱, 견과류 토핑", price: 10000, badge: null, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=180&h=180&fit=crop" },
  { id: 6, category: "음료", name: "캠프 아메리카노", desc: "직접 로스팅한 원두, 더치커피 선택 가능", price: 5000, badge: null, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=180&h=180&fit=crop" },
];

const saveCart = (bizno, cart) => {
  if (Platform.OS === "web") {
    try { localStorage.setItem(`scaneat_cart_${bizno}`, JSON.stringify(cart)); } catch {}
  }
};

const loadCart = (bizno) => {
  if (Platform.OS === "web") {
    try {
      const saved = localStorage.getItem(`scaneat_cart_${bizno}`);
      return saved ? JSON.parse(saved) : {};
    } catch {}
  }
  return {};
};

export default function Menu({ bizno }) {
  const [activeCat, setActiveCat] = useState("전체");
  const [cart, setCart] = useState(() => loadCart(bizno));
  const [showCart, setShowCart] = useState(false);

  const filtered = activeCat === "전체" ? DUMMY_ITEMS : DUMMY_ITEMS.filter(i => i.category === activeCat);
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const next = { ...prev, [item.id]: { item, quantity: (prev[item.id]?.quantity || 0) + 1 } };
      saveCart(bizno, next);
      return next;
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[itemId]?.quantity > 1) {
        next[itemId] = { ...next[itemId], quantity: next[itemId].quantity - 1 };
      } else {
        delete next[itemId];
      }
      saveCart(bizno, next);
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    saveCart(bizno, {});
  };

  return (
    <View style={s.container}>
      {/* 가게 정보 */}
      <View style={s.shopBanner}>
        <Text style={s.shopName}>🍽 맛찬들</Text>
        <View style={s.shopMeta}>
          <Text style={s.shopRating}><Text style={s.star}>★</Text> 4.8</Text>
          <Text style={s.shopInfo}>리뷰 142개 · 캠핑식당</Text>
        </View>
        <View style={s.shopTags}>
          {["야외석", "단체예약", "포장가능"].map(t => (
            <View key={t} style={s.shopTag}><Text style={s.shopTagText}>{t}</Text></View>
          ))}
        </View>
        <Text style={s.bizno}>사업자 {bizno}</Text>
      </View>

      {/* 카테고리 탭 */}
      <View style={s.catBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={s.catItem} onPress={() => setActiveCat(cat)}>
            <Text style={[s.catText, activeCat === cat && s.catTextActive]}>{cat}</Text>
            {activeCat === cat && <View style={s.catIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 메뉴 리스트 */}
      <ScrollView style={s.list} contentContainerStyle={[s.listContent, cartCount > 0 && { paddingBottom: 64 }]}>
        {filtered.map(item => {
          const qty = cart[item.id]?.quantity || 0;
          return (
            <View key={item.id} style={s.card}>
              <View style={s.imgWrap}>
                <Image source={{ uri: item.image }} style={s.img} />
                {item.badge && <View style={s.badge}><Text style={s.badgeText}>{item.badge}</Text></View>}
              </View>
              <View style={s.info}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.desc} numberOfLines={2}>{item.desc}</Text>
                <View style={s.cardBottom}>
                  <Text style={s.price}>₩{item.price.toLocaleString()}</Text>
                  {qty === 0 ? (
                    <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                      <Text style={s.addBtnText}>+</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.qtyRow}>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(item.id)}>
                        <Text style={s.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyNum}>{qty}</Text>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(item)}>
                        <Text style={s.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <View style={s.callBar}>
          <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL("tel:010-0000-0000")}>
            <Text style={s.callBtnText}>📞 전화 문의</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 장바구니 바 */}
      {cartCount > 0 && (
        <TouchableOpacity style={[s.cartBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }]} onPress={() => setShowCart(true)}>
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}</Text></View>
          <Text style={s.cartBarText}>장바구니 보기</Text>
          <Text style={s.cartBarTotal}>₩{cartTotal.toLocaleString()}</Text>
        </TouchableOpacity>
      )}

      {/* 장바구니 팝업 */}
      <Modal visible={showCart} transparent animationType="slide" onRequestClose={() => setShowCart(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.overlayBg} onPress={() => setShowCart(false)} activeOpacity={1} />
          <View style={s.sheet}>
            {/* 팝업 헤더 */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>🛒 장바구니</Text>
              <TouchableOpacity onPress={() => setShowCart(false)} style={s.closeBtn}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 아이템 목록 */}
            <ScrollView style={s.sheetList}>
              {cartItems.map(({ item, quantity }) => (
                <View key={item.id} style={s.cartItem}>
                  <Image source={{ uri: item.image }} style={s.cartItemImg} />
                  <View style={s.cartItemInfo}>
                    <Text style={s.cartItemName}>{item.name}</Text>
                    <Text style={s.cartItemPrice}>₩{(item.price * quantity).toLocaleString()}</Text>
                  </View>
                  <View style={s.qtyRow}>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={s.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qtyNum}>{quantity}</Text>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(item)}>
                      <Text style={s.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 합계 및 주문 */}
            <View style={s.sheetFooter}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>총 {cartCount}개</Text>
                <Text style={s.totalPrice}>₩{cartTotal.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={s.orderBtn} onPress={() => { setShowCart(false); clearCart(); }}>
                <Text style={s.orderBtnText}>주문하기 ({cartCount}개) →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", flexDirection: "column", overflow: "hidden" },

  shopBanner: { backgroundColor: "#fff", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", flexShrink: 0 },
  shopName: { fontSize: 19, fontWeight: "900", color: "#111", marginBottom: 6 },
  shopMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  shopRating: { fontSize: 13, fontWeight: "700", color: "#111" },
  star: { color: "#f97316" },
  shopInfo: { fontSize: 12, color: "#888" },
  shopTags: { flexDirection: "row", gap: 6, marginBottom: 8 },
  shopTag: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4 },
  shopTagText: { fontSize: 11, fontWeight: "600", color: "#555" },
  bizno: { fontSize: 11, color: "#bbb" },

  catBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", flexShrink: 0, flexDirection: "row", paddingHorizontal: 4 },
  catItem: { paddingHorizontal: 12, paddingVertical: 11, position: "relative" },
  catText: { fontSize: 13, fontWeight: "700", color: "#bbb" },
  catTextActive: { color: "#111" },
  catIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#111" },

  list: { flex: 1 },
  listContent: { paddingTop: 8, paddingBottom: 20 },

  card: { backgroundColor: "#fff", flexDirection: "row", padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  imgWrap: { position: "relative" },
  img: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#eee" },
  badge: { position: "absolute", top: 6, left: 6, backgroundColor: "#f97316", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 4 },
  desc: { fontSize: 12, color: "#888", lineHeight: 17, marginBottom: 10 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 16, fontWeight: "900", color: "#111" },

  addBtn: { width: 32, height: 32, backgroundColor: "#111", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 20, fontWeight: "300", lineHeight: 22 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 4, paddingVertical: 2 },
  qtyBtn: { width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#111" },
  qtyNum: { fontSize: 14, fontWeight: "800", color: "#111", minWidth: 20, textAlign: "center" },

  callBar: { padding: 16 },
  callBtn: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 13, alignItems: "center" },
  callBtnText: { color: "#555", fontSize: 14, fontWeight: "700" },

  /* 장바구니 바 */
  cartBar: { flexShrink: 0, backgroundColor: "#111", flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, gap: 10 },
  cartBadge: { backgroundColor: "#f97316", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cartBarText: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700" },
  cartBarTotal: { color: "#f97316", fontSize: 15, fontWeight: "900" },

  /* 팝업 오버레이 */
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "75%", overflow: "hidden" },

  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  sheetTitle: { fontSize: 17, fontWeight: "900", color: "#111" },
  closeBtn: { width: 32, height: 32, backgroundColor: "#f3f4f6", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 13, color: "#555", fontWeight: "700" },

  sheetList: { flexShrink: 1 },
  cartItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  cartItemImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#eee" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 4 },
  cartItemPrice: { fontSize: 13, fontWeight: "800", color: "#f97316" },

  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { fontSize: 13, color: "#888", fontWeight: "600" },
  totalPrice: { fontSize: 20, fontWeight: "900", color: "#111" },
  orderBtn: { backgroundColor: "#111", borderRadius: 14, padding: 15, alignItems: "center" },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
