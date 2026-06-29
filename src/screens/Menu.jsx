import { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, Platform, Animated, Easing } from "react-native";
import AiChat from "../components/AiChat";
import MenuDetail from "./MenuDetail";
import supabase from "../lib/supabase";

const KAKAO_JS_KEY = "YOUR_KAKAO_JS_KEY"; // developers.kakao.com 에서 발급

const BURST_COLORS = [
  ["#ff4757", "#ffa502", "#ff6348"],
  ["#2ed573", "#7bed9f", "#ffffff"],
  ["#1e90ff", "#70a1ff", "#ecf0f1"],
  ["#ff6b81", "#ff4757", "#fff9ae"],
  ["#ffa502", "#ffd700", "#ffffff"],
  ["#a29bfe", "#6c5ce7", "#fd79a8"],
  ["#00cec9", "#55efc4", "#ffffff"],
];

const BURST_CONFIGS = [
  { cx: 0.2,  cy: 0.22, delay: 0,    colorSet: 0 },
  { cx: 0.8,  cy: 0.18, delay: 260,  colorSet: 1 },
  { cx: 0.5,  cy: 0.12, delay: 550,  colorSet: 2 },
  { cx: 0.28, cy: 0.52, delay: 140,  colorSet: 3 },
  { cx: 0.75, cy: 0.44, delay: 420,  colorSet: 4 },
  { cx: 0.12, cy: 0.6,  delay: 730,  colorSet: 5 },
  { cx: 0.88, cy: 0.5,  delay: 310,  colorSet: 6 },
  { cx: 0.55, cy: 0.38, delay: 970,  colorSet: 0 },
  { cx: 0.38, cy: 0.28, delay: 1160, colorSet: 2 },
  { cx: 0.65, cy: 0.2,  delay: 1380, colorSet: 4 },
];

const PARTICLE_COUNT = 22;

function FireworkBurst({ cx, cy, delay, colorSet }) {
  const colors = BURST_COLORS[colorSet];

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() * 0.3 - 0.15);
      const dist = 90 + Math.random() * 100;
      const isCircle = Math.random() > 0.4;
      const size = isCircle ? 5 + Math.random() * 6 : 4 + Math.random() * 5;
      return {
        angle, dist, isCircle, size,
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: new Animated.Value(0),
        ty: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    })
  ).current;

  const flashScale = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = 950;
    const gravity = 100;

    const particleAnims = particles.map(p => {
      const tx = Math.cos(p.angle) * p.dist;
      const ty = Math.sin(p.angle) * p.dist + gravity;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.tx, { toValue: tx, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(p.ty, { toValue: ty, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(p.scale, { toValue: 0.1, duration: dur, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.85, duration: dur * 0.55, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: dur * 0.45, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    const flashAnim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(flashScale, { toValue: 6, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(flashOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
        ]),
      ]),
    ]);

    Animated.parallel([flashAnim, ...particleAnims]).start();
  }, []);

  return (
    <View style={{ position: "absolute", left: `${cx * 100}%`, top: `${cy * 100}%` }}>
      <Animated.View style={{
        position: "absolute",
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: colors[0],
        transform: [{ scale: flashScale }],
        opacity: flashOpacity,
        marginLeft: -14, marginTop: -14,
      }} />
      {particles.map((p, i) => (
        <Animated.View key={i} style={{
          position: "absolute",
          width: p.size, height: p.size,
          borderRadius: p.isCircle ? p.size / 2 : 1,
          backgroundColor: p.color,
          transform: [{ translateX: p.tx }, { translateY: p.ty }, { scale: p.scale }],
          opacity: p.opacity,
          marginLeft: -p.size / 2, marginTop: -p.size / 2,
        }} />
      ))}
    </View>
  );
}

const FALL_COLORS = ["#f97316", "#16a34a", "#2563eb", "#dc2626", "#7c3aed", "#fbbf24", "#06b6d4", "#ec4899", "#f43f5e", "#a29bfe"];

function FallingConfetti() {
  const particles = useRef(
    Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      drift: (Math.random() - 0.5) * 160,
      size: 5 + Math.random() * 8,
      color: FALL_COLORS[Math.floor(Math.random() * FALL_COLORS.length)],
      isCircle: Math.random() > 0.5,
      y: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(0),
      delay: Math.random() * 1200,
      duration: 1800 + Math.random() * 1200,
    }))
  ).current;

  useEffect(() => {
    const anims = particles.map(p =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.y, { toValue: 1, duration: p.duration, useNativeDriver: true }),
          Animated.timing(p.rot, { toValue: 1, duration: p.duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.9, duration: p.duration * 0.6, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: p.duration * 0.4, useNativeDriver: true }),
          ]),
        ]),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <Animated.View key={`fall-${i}`} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: 0,
          width: p.size,
          height: p.isCircle ? p.size : p.size * 1.6,
          borderRadius: p.isCircle ? p.size / 2 : 2,
          backgroundColor: p.color,
          opacity: p.opacity,
          transform: [
            { translateY: p.y.interpolate({ inputRange: [0, 1], outputRange: [-20, 950] }) },
            { translateX: p.y.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
            { rotate: p.rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] }) },
          ],
        }} />
      ))}
    </>
  );
}

function ConfettiOverlay({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        Platform.OS === "web" && { position: "fixed" },
        { zIndex: 9999 },
      ]}
    >
      <FallingConfetti />
      {BURST_CONFIGS.map((b, i) => (
        <FireworkBurst key={i} {...b} />
      ))}
    </View>
  );
}

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

export default function Menu({ bizno, tableNo }) {
  const [activeCat, setActiveCat] = useState("전체");
  const [categories, setCategories] = useState(["전체"]);
  const [menuItems, setMenuItems] = useState([]);
  const [bizInfo, setBizInfo] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (!bizno) return;
    supabase
      .from("tb_biz")
      .select("biz_nm,biz_reg_no,tel_no,ind_cd,addr,addr_dtl")
      .eq("biz_reg_no", bizno)
      .single()
      .then(({ data, error }) => {
        if (!data) { console.warn("[TB_BIZ] fetch 실패", error); return; }
        setBizInfo(data);
        supabase
          .from("tb_ind_cls")
          .select("ind_nm")
          .eq("ind_cd", data.ind_cd)
          .single()
          .then(({ data: cls, error: clsErr }) => {
            if (cls) setBizInfo(prev => ({ ...prev, ind_nm: cls.ind_nm }));
            else console.warn("[TB_IND_CLS] fetch 실패", clsErr);
          });
      });
  }, [bizno]);

  useEffect(() => {
    if (!bizno) return;

    const catFetch = supabase
      .from("tb_biz_cat")
      .select("biz_cat_cd,biz_cat_nm,sort_ord")
      .eq("biz_reg_no", bizno)
      .eq("use_yn", "Y")
      .order("sort_ord", { ascending: true });

    const menuFetch = supabase
      .from("tb_biz_menu")
      .select("menu_cd,biz_cat_cd,menu_nm,menu_desc,price,img_url,badge,sort_ord")
      .eq("biz_reg_no", bizno)
      .eq("use_yn", "Y")
      .order("sort_ord", { ascending: true });

    Promise.all([catFetch, menuFetch]).then(([catRes, menuRes]) => {
      const cats = catRes.data || [];
      const menus = menuRes.data || [];

      const catMap = {};
      cats.forEach(c => { catMap[c.biz_cat_cd] = c.biz_cat_nm; });

      if (cats.length) setCategories(["전체", ...cats.map(c => c.biz_cat_nm)]);

      setMenuItems(menus.map(m => ({
        id: m.menu_cd,
        category: catMap[m.biz_cat_cd] || "",
        name: m.menu_nm,
        desc: m.menu_desc || "",
        price: m.price,
        badge: m.badge || null,
        image: m.img_url || null,
      })));
    });
  }, [bizno]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
  }, []);

  const shareKakao = () => {
    if (Platform.OS !== "web" || !window.Kakao?.isInitialized()) return;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "🍽 맛찬들",
        description: "AI 메뉴 추천과 함께 맛있는 식사를 즐겨보세요!",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [{ title: "메뉴 보기", link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
    });
  };

  const [cart, setCart] = useState(() => loadCart(bizno));
  const [showCart, setShowCart] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOrderDone, setShowOrderDone] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = activeCat === "전체" ? menuItems : menuItems.filter(i => i.category === activeCat);
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
        <View style={s.shopNameRow}>
          <Text style={s.shopName}>🍽 {bizInfo?.biz_nm || ""}</Text>
          <Text style={s.shopAiBadge}>[AI✨]</Text>
          {tableNo && (
            <View style={s.tableBadge}>
              <Text style={s.tableBadgeText}>{tableNo.toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity onPress={shareKakao} style={s.kakaoBtn}>
            <Image source={{ uri: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" }} style={s.kakaoImg} />
          </TouchableOpacity>
        </View>
        <View style={s.shopMeta}>
          <Text style={s.shopRating}><Text style={s.star}>★</Text> 4.8</Text>
          <Text style={s.shopInfo}>리뷰 142개 · {bizInfo?.ind_nm || ""}</Text>
        </View>
        <View style={s.shopTags}>
          {["야외석", "단체예약", "포장가능"].map(t => (
            <View key={t} style={s.shopTag}><Text style={s.shopTagText}>{t}</Text></View>
          ))}
        </View>
        {bizInfo?.addr && (
          <Text style={s.bizAddr}>
            {bizInfo.addr}{bizInfo.addr_dtl ? ` ${bizInfo.addr_dtl}` : ""}
          </Text>
        )}
      </View>

      {/* 카테고리 탭 */}
      <View style={s.catBar}>
        {categories.map(cat => (
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
            <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.85} onPress={() => setSelectedItem(item)}>
              <View style={s.imgWrap}>
                {imgErrors[item.id] || !item.image ? (
                  <View style={[s.img, s.noImg]}>
                    <Text style={s.noImgText}>NO IMAGE</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.image }}
                    style={s.img}
                    onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                  />
                )}
                {item.badge && <View style={s.badge}><Text style={s.badgeText}>{item.badge}</Text></View>}
              </View>
              <View style={s.info}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.desc} numberOfLines={2}>{item.desc}</Text>
                <View style={s.cardBottom}>
                  <Text style={s.price}>₩{item.price.toLocaleString()}</Text>
                  {qty === 0 ? (
                    <TouchableOpacity style={s.addBtn} onPress={() => setSelectedItem(item)}>
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
            </TouchableOpacity>
          );
        })}
        <View style={s.callBar}>
          <TouchableOpacity
            style={[s.callBtn, !bizInfo?.tel_no && s.callBtnDisabled]}
            onPress={() => bizInfo?.tel_no && Linking.openURL(`tel:${bizInfo.tel_no}`)}
          >
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

      {/* 폭죽 애니메이션 */}
      {showConfetti && (
        <ConfettiOverlay onDone={() => { setShowConfetti(false); setShowOrderDone(true); }} />
      )}

      {/* 주문 완료 팝업 */}
      <Modal visible={showOrderDone} transparent animationType="fade" onRequestClose={() => setShowOrderDone(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={() => setShowOrderDone(false)} />
          <View style={s.successSheet}>
            <Text style={s.successEmoji}>🚀</Text>
            <Text style={s.successTitle}>결제 기능 준비중!</Text>
            <Text style={s.successDesc}>
              {"응원하고 싶다면 후원금으로\n100원 입금하시오\n\n"}
              <Text style={s.successBank}>국민은행 813002-04-052391{"\n"}곽종근</Text>
              {"\n\n"}
              <Text style={s.successNote}>(초과 입금 시 전액 환불)</Text>
            </Text>
            <TouchableOpacity style={s.successBtn} onPress={() => setShowOrderDone(false)}>
              <Text style={s.successBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 메뉴 상세 오버레이 */}
      {selectedItem && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 50 }]}>
          <MenuDetail
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAddToCart={(itemWithOptions) => {
              addToCart(itemWithOptions);
              setSelectedItem(null);
            }}
          />
        </View>
      )}

      {/* AI 채팅 */}
      <AiChat
        menuItems={menuItems}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onOrder={() => {
          setShowCart(false);
          clearCart();
          setTimeout(() => setShowConfetti(true), 300);
        }}
      />

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
              <TouchableOpacity style={s.orderBtn} onPress={() => {
                setShowCart(false);
                clearCart();
                setTimeout(() => setShowConfetti(true), 300);
              }}>
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
  shopNameRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  shopName: { fontSize: 19, fontWeight: "900", color: "#111" },
  shopAiBadge: { fontSize: 11, color: "#f97316", fontWeight: "800" },
  tableBadge: { backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tableBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  kakaoBtn: { marginLeft: "auto" },
  kakaoImg: { width: 32, height: 32 },
  shopMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  shopRating: { fontSize: 13, fontWeight: "700", color: "#111" },
  star: { color: "#f97316" },
  shopInfo: { fontSize: 12, color: "#888" },
  shopTags: { flexDirection: "row", gap: 6, marginBottom: 8 },
  shopTag: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4 },
  shopTagText: { fontSize: 11, fontWeight: "600", color: "#555" },
  bizAddr: { fontSize: 12, color: "#888", marginTop: 2 },

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
  noImg: { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  noImgText: { fontSize: 10, color: "#bbb", fontWeight: "600" },
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
  callBtnDisabled: { opacity: 0.4 },
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

  successSheet: { backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", margin: 32 },
  successEmoji: { fontSize: 60, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: "900", color: "#111", marginBottom: 8 },
  successDesc: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 24, marginBottom: 24 },
  successBank: { fontSize: 15, fontWeight: "800", color: "#111" },
  successNote: { fontSize: 13, fontWeight: "800", color: "#f97316" },
  successBtn: { backgroundColor: "#111", borderRadius: 14, paddingHorizontal: 48, paddingVertical: 14 },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { fontSize: 13, color: "#888", fontWeight: "600" },
  totalPrice: { fontSize: 20, fontWeight: "900", color: "#111" },
  orderBtn: { backgroundColor: "#111", borderRadius: 14, padding: 15, alignItems: "center" },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
