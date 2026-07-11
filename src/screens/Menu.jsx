import { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, Platform, Animated, Easing } from "react-native";
import AiChat from "../components/AiChat";
import ChatRoom from "../components/ChatRoom";
import MenuDetail from "./MenuDetail";
import supabase from "../lib/supabase";
import SeatsView from "./SeatsView";

const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || "test_ck_vZnjEJeQVxexx5pMqG4brPmOoBN0";


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

const FALL_COLORS = ["#f97316", "#16a34a", "#0f172a", "#dc2626", "#7c3aed", "#fbbf24", "#06b6d4", "#ec4899", "#f43f5e", "#a29bfe"];

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

const formatOptions = (labels) => {
  if (!labels || !labels.length) return null;
  return labels.join(" · ");
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
    if (Platform.OS !== "web" || !bizno) return;
    (async () => {
      let uuid = localStorage.getItem("scaneat_uuid");
      if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem("scaneat_uuid", uuid);
      }
      const now = new Date().toISOString();
      const src = new URLSearchParams(window.location.search).get("src");
      const { data: existing } = await supabase.from("tb_usr_scan_log").select("id").eq("uuid", uuid).eq("biz_reg_no", bizno).single();
      if (!existing) {
        supabase.from("tb_usr_scan_log").insert({
          uuid,
          biz_reg_no: bizno,
          vst_dt: now,
          vst_typ_cd: src === "qr" ? "qr" : "url",
          reg_usr_id: "guest",
          reg_dt: now,
        });
      }
    })();
  }, [bizno]);

  const [cart, setCart] = useState(() => {
    if (Platform.OS !== "web") return {};
    try {
      const pending = sessionStorage.getItem(`scaneat_pending_cart_${bizno}`);
      if (pending) { sessionStorage.removeItem(`scaneat_pending_cart_${bizno}`); return JSON.parse(pending); }
    } catch {}
    return {};
  });
  const [showCart, setShowCart] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkoutHint, setCheckoutHint] = useState(false);
  const [showOrderDone, setShowOrderDone] = useState(false);
  const [orderType, setOrderType] = useState("매장주문");
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingCartId, setEditingCartId] = useState(null);
  const aiToastOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(aiToastOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(aiToastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const [showChatRoom, setShowChatRoom] = useState(false);
  const [showSeats, setShowSeats] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const filtered = activeCat === "전체" ? menuItems : menuItems.filter(i => i.category === activeCat);
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const addToCart = (item) => {
    // item.quantity는 MenuDetail에서 선택한 "담을 개수"일 뿐, 장바구니에
    // 저장된 뒤에는 의미가 없는 값이라 보관하면 +버튼을 누를 때마다
    // 그 값만큼 재추가되는 버그가 생김 → 저장 전에 떼어냄
    const { quantity: addQty = 1, totalPrice, ...storedItem } = item;
    setCart(prev => {
      const next = { ...prev, [item.id]: { item: storedItem, quantity: (prev[item.id]?.quantity || 0) + addQty } };
      saveCart(bizno, next);
      return next;
    });
  };

  // 이미 담긴 항목의 옵션을 수정한 경우: 기존 수량에 더하지 않고 그대로 교체
  const updateCartItem = (item) => {
    const { quantity: newQty = 1, totalPrice, ...storedItem } = item;
    setCart(prev => {
      const next = { ...prev, [item.id]: { item: storedItem, quantity: newQty } };
      saveCart(bizno, next);
      return next;
    });
  };

  const editCartItem = (item, quantity) => {
    setEditingCartId(item.id);
    setSelectedItem({ ...item, price: item.basePrice ?? item.price, quantity });
    setShowCart(false);
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

  // AI 채팅에서 "빼줘"는 수량 일부가 아니라 항목 자체를 완전히 삭제하는 의도라
  // "-" 버튼용 removeFromCart(1개씩 감소)와 분리
  const removeItemCompletely = (itemId) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[itemId];
      saveCart(bizno, next);
      return next;
    });
  };

  // AI 채팅에서 "하나만 빼줘"/"두 개 빼줘"처럼 수량을 지정한 경우 그만큼만 줄임
  // (0 이하가 되면 항목 자체를 제거)
  const decrementCartItem = (itemId, qty) => {
    setCart(prev => {
      const cur = prev[itemId];
      if (!cur) return prev;
      const next = { ...prev };
      const newQty = cur.quantity - qty;
      if (newQty > 0) {
        next[itemId] = { ...cur, quantity: newQty };
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

  // AI는 실제 결제를 처리하지 않음 — 장바구니 화면을 열어 손님이 직접
  // "주문하기" 버튼을 눌러야만 결제가 진행되도록 안내만 함
  const requestCheckout = () => {
    setShowCart(true);
    setCheckoutHint(true);
    setTimeout(() => setCheckoutHint(false), 3500);
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
          <TouchableOpacity onPress={() => { if (Platform.OS === "web") window.location.href = "/"; }} style={s.scanListBtn}>
            <Text style={s.scanListBtnText}>내 스캔 목록</Text>
          </TouchableOpacity>
        </View>
        <View style={s.shopMeta}>
          <Text style={s.shopRating}><Text style={s.star}>★</Text> 4.8</Text>
          <Text style={s.shopInfo}>리뷰 142개 · {bizInfo?.ind_nm || ""}</Text>
        </View>
        <View style={s.shopTags}>
          {[
            { label: "매장주문", icon: "🍽️" },
            { label: "포장주문", icon: "📦" },
          ].map(t => (
            <TouchableOpacity key={t.label} style={[s.shopTag, orderType === t.label && s.shopTagActive]} onPress={() => setOrderType(t.label)}>
              <Text style={s.shopTagIcon}>{t.icon}</Text>
              <Text style={[s.shopTagText, orderType === t.label && s.shopTagTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.seatBtn} onPress={() => setShowSeats(true)}>
            <Text style={s.seatBtnText}>🪑 테이블 예약</Text>
          </TouchableOpacity>
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
          <View style={s.cartBarCenter}>
            <Text style={s.cartBarText}>장바구니 보기</Text>
            <View style={s.cartOrderTypeBadge}>
              <Text style={s.cartOrderTypeText}>{orderType === "포장주문" ? "📦 포장주문" : "🍽️ 매장주문"}</Text>
            </View>
          </View>
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
        <View style={[
          StyleSheet.absoluteFillObject,
          { zIndex: 110, overflow: "hidden" },
          Platform.OS === "web" && { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 },
        ]}>
          <MenuDetail
            item={selectedItem}
            onClose={() => { setSelectedItem(null); setEditingCartId(null); }}
            onAddToCart={(itemWithOptions) => {
              if (editingCartId) {
                updateCartItem(itemWithOptions);
                setEditingCartId(null);
              } else {
                addToCart(itemWithOptions);
              }
              setSelectedItem(null);
            }}
          />
        </View>
      )}

      {/* 채팅방 FAB */}
      <TouchableOpacity
        style={[s.chatFab, Platform.OS === "web" && { position: "fixed", bottom: 160, right: 130, zIndex: 200 }]}
        onPress={() => setShowChatRoom(true)}
      >
        <Text style={s.chatFabText}>💬 공유채팅</Text>
      </TouchableOpacity>

      {/* 채팅방 */}
      <ChatRoom visible={showChatRoom} bizno={bizno} onClose={() => setShowChatRoom(false)} />

      {/* 테이블 예약 상세화면 */}
      {showSeats && <SeatsView visible={showSeats} onClose={() => setShowSeats(false)} />}

      {/* AI 채팅 */}
      <AiChat
        bizno={bizno}
        tableNo={tableNo}
        menuItems={menuItems}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onRemoveFromCart={removeItemCompletely}
        onDecrementCart={decrementCartItem}
        onClearCart={clearCart}
        onRequestCheckout={requestCheckout}
      />

      {/* 장바구니 팝업 */}
      <Modal visible={showCart} transparent animationType="slide" onRequestClose={() => setShowCart(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.overlayBg} onPress={() => setShowCart(false)} activeOpacity={1} />
          <View style={s.sheet}>
            {/* 팝업 헤더 */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>🛒 장바구니</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity onPress={() => setShowClearConfirm(true)} style={s.trashBtn}>
                  <Text style={s.trashBtnText}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCart(false)} style={s.closeBtn}>
                  <Text style={s.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* AI 채팅에서 결제 의사를 밝힌 경우 안내 배너 */}
            {checkoutHint && (
              <View style={s.checkoutHint}>
                <Text style={s.checkoutHintText}>💳 장바구니를 확인하신 후 결제를 진행해 주세요</Text>
              </View>
            )}

            {/* 아이템 목록 */}
            <ScrollView style={s.sheetList}>
              {cartItems.map(({ item, quantity }) => (
                <View key={item.id} style={s.cartItem}>
                  <Image source={{ uri: item.image }} style={s.cartItemImg} />
                  <View style={s.cartItemInfo}>
                    <Text style={s.cartItemName}>{item.name}</Text>
                    {formatOptions(item.optionLabels) && (
                      <Text style={s.cartItemOptions} numberOfLines={1}>{formatOptions(item.optionLabels)}</Text>
                    )}
                    {item.optionPrice > 0 && (
                      <Text style={s.cartItemBreakdown}>
                        기본 ₩{item.basePrice.toLocaleString()} + 옵션 ₩{item.optionPrice.toLocaleString()}
                      </Text>
                    )}
                    <Text style={s.cartItemPrice}>₩{(item.price * quantity).toLocaleString()}</Text>
                    {item.optionIds && (
                      <TouchableOpacity onPress={() => editCartItem(item, quantity)}>
                        <Text style={s.cartItemEdit}>옵션 변경</Text>
                      </TouchableOpacity>
                    )}
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
                setTimeout(() => setShowPayment(true), 300);
              }}>
                <Text style={s.orderBtnText}>주문하기 ({cartCount}개) →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 장바구니 전체 삭제 확인 */}
      <Modal visible={showClearConfirm} transparent animationType="fade" onRequestClose={() => setShowClearConfirm(false)}>
        <View style={s.confirmOverlay}>
          <View style={s.confirmBox}>
            <Text style={s.confirmEmoji}>🗑️</Text>
            <Text style={s.confirmTitle}>장바구니 비우기</Text>
            <Text style={s.confirmMsg}>장바구니를 모두 비우시겠어요?</Text>
            <View style={s.confirmBtns}>
              <TouchableOpacity style={s.confirmCancelBtn} onPress={() => setShowClearConfirm(false)}>
                <Text style={s.confirmCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmOkBtn} onPress={() => { clearCart(); setShowClearConfirm(false); }}>
                <Text style={s.confirmOkText}>비우기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Animated.View
        pointerEvents="none"
        style={[s.aiToast, { opacity: aiToastOpacity }, Platform.OS === "web" && { position: "fixed" }]}
      >
        <Text style={s.aiToastText}>✦ AI도움으로 주문 및 예약 가능합니다</Text>
      </Animated.View>

      {/* 결제 모달 */}
      <Modal visible={showPayment} transparent animationType="slide" onRequestClose={() => setShowPayment(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={() => setShowPayment(false)} />
          <View style={s.paySheet}>
            {/* 헤더 */}
            <View style={s.payHeader}>
              <View style={s.payHeaderLeft}>
                <View style={s.tossLogo}>
                  <Text style={s.tossLogoText}>toss</Text>
                </View>
                <Text style={s.payHeaderTitle}>결제하기</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPayment(false)} style={s.closeBtn}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 주문 요약 */}
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: 20 }}>
              <View style={s.paySection}>
                <Text style={s.paySectionTitle}>주문 내역</Text>
                {cartItems.map(({ item, quantity }) => (
                  <View key={item.id} style={s.payOrderRow}>
                    <Text style={s.payOrderName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.payOrderQty}>x{quantity}</Text>
                    <Text style={s.payOrderPrice}>₩{(item.price * quantity).toLocaleString()}</Text>
                  </View>
                ))}
                <View style={s.payDivider} />
                <View style={s.payOrderRow}>
                  <Text style={[s.payOrderName, { fontWeight: "900", color: "#111" }]}>합계</Text>
                  <Text style={s.payTotalAmt}>₩{cartTotal.toLocaleString()}</Text>
                </View>
              </View>

              <Text style={s.payTossNote}>결제 수단 선택은 토스페이먼츠 화면에서 진행됩니다</Text>
            </ScrollView>

            {/* 결제 버튼 */}
            <View style={s.payFooter}>
              <View style={s.payAmtRow}>
                <Text style={s.payAmtLabel}>최종 결제금액</Text>
                <Text style={s.payAmtValue}>₩{cartTotal.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={s.payBtn} onPress={async () => {
                try {
                  if (!TOSS_CLIENT_KEY) { alert("토스 클라이언트 키가 없습니다 (EXPO_PUBLIC_TOSS_CLIENT_KEY)"); return; }
                  try { sessionStorage.setItem(`scaneat_pending_cart_${bizno}`, JSON.stringify(cart)); } catch {}
                  const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
                  const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                  const payment = tossPayments.payment({ customerKey: ANONYMOUS });
                  await payment.requestPayment({
                    method: "CARD",
                    amount: { currency: "KRW", value: cartTotal },
                    orderId: `scaneat-${Date.now()}`,
                    orderName: cartItems.length === 1
                      ? cartItems[0].item.name
                      : `${cartItems[0].item.name} 외 ${cartItems.length - 1}건`,
                    successUrl: window.location.origin + `/payment/success?bizno=${bizno}&biz_nm=${encodeURIComponent(bizInfo?.biz_nm || "")}`,
                    failUrl: window.location.origin + `/payment/fail?bizno=${bizno}&biz_nm=${encodeURIComponent(bizInfo?.biz_nm || "")}`,
                  });
                } catch (e) {
                  if (e?.code === "USER_CANCEL") { setShowPayment(false); return; }
                  alert(`[결제 오류] ${e?.message || JSON.stringify(e)}`);
                  console.error("[Toss]", e);
                }
              }}>
                <Text style={s.payBtnText}>₩{cartTotal.toLocaleString()} 결제하기</Text>
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
  scanListBtn: { marginLeft: "auto", borderWidth: 1.5, borderColor: "#16a34a", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#f0fdf4" },
  scanListBtnText: { fontSize: 11, fontWeight: "700", color: "#16a34a" },

  chatFab: { height: 48, borderRadius: 24, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center", paddingHorizontal: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  chatFabText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  aiToast: { position: "absolute", bottom: 216, right: 20, backgroundColor: "#0f172a", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 },
  aiToastText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  shopMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  shopRating: { fontSize: 13, fontWeight: "700", color: "#111" },
  star: { color: "#f97316" },
  shopInfo: { fontSize: 12, color: "#888" },
  shopTags: { flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" },
  shopTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f1f5f9", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  shopTagActive: { backgroundColor: "#0f172a" },
  shopTagIcon: { fontSize: 12 },
  shopTagText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  shopTagTextActive: { color: "#fff" },
  seatBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  seatBtnText: { fontSize: 11, fontWeight: "700", color: "#fff" },
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
  cartBarCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  cartBarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cartOrderTypeBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  cartOrderTypeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cartBarTotal: { color: "#f97316", fontSize: 15, fontWeight: "900" },

  /* 팝업 오버레이 */
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "75%", overflow: "hidden" },

  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  sheetTitle: { fontSize: 17, fontWeight: "900", color: "#111" },
  closeBtn: { width: 32, height: 32, backgroundColor: "#f3f4f6", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 13, color: "#555", fontWeight: "700" },
  trashBtn: { width: 32, height: 32, backgroundColor: "#fff1f2", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  trashBtnText: { fontSize: 15 },

  confirmOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  confirmBox: { backgroundColor: "#fff", borderRadius: 20, padding: 28, alignItems: "center", width: 280, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20 },
  confirmEmoji: { fontSize: 36, marginBottom: 12 },
  confirmTitle: { fontSize: 17, fontWeight: "900", color: "#111", marginBottom: 6 },
  confirmMsg: { fontSize: 14, color: "#888", marginBottom: 24, textAlign: "center" },
  confirmBtns: { flexDirection: "row", gap: 10, width: "100%" },
  confirmCancelBtn: { flex: 1, borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  confirmCancelText: { fontSize: 14, fontWeight: "700", color: "#888" },
  confirmOkBtn: { flex: 1, backgroundColor: "#ef4444", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  confirmOkText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  checkoutHint: { backgroundColor: "#fff7ed", paddingVertical: 10, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  checkoutHintText: { fontSize: 13, fontWeight: "700", color: "#f97316", textAlign: "center" },

  sheetList: { flexShrink: 1 },
  cartItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  cartItemImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#eee" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 4 },
  cartItemOptions: { fontSize: 11, color: "#999", fontWeight: "600", marginBottom: 4 },
  cartItemBreakdown: { fontSize: 11, color: "#aaa", fontWeight: "600", marginBottom: 4 },
  cartItemPrice: { fontSize: 13, fontWeight: "800", color: "#f97316" },
  cartItemEdit: { fontSize: 11, color: "#16a34a", fontWeight: "700", marginTop: 4, textDecorationLine: "underline" },

  successSheet: { backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", margin: 32 },
  successEmoji: { fontSize: 60, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: "900", color: "#111", marginBottom: 8 },
  successDesc: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 24, marginBottom: 24 },
  successBank: { fontSize: 15, fontWeight: "800", color: "#111" },
  successNote: { fontSize: 13, fontWeight: "800", color: "#f97316" },
  successBtn: { backgroundColor: "#111", borderRadius: 14, paddingHorizontal: 48, paddingVertical: 14 },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  /* 결제 모달 */
  paySheet: { backgroundColor: "#f8fafc", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", overflow: "hidden" },
  payHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  payHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  tossLogo: { backgroundColor: "#0064FF", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  tossLogoText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: -0.5 },
  payHeaderTitle: { fontSize: 18, fontWeight: "900", color: "#111" },

  paySection: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10 },
  paySectionTitle: { fontSize: 13, fontWeight: "800", color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  payOrderRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  payOrderName: { flex: 1, fontSize: 14, fontWeight: "700", color: "#374151" },
  payOrderQty: { fontSize: 13, color: "#94a3b8", fontWeight: "600", marginHorizontal: 4 },
  payOrderPrice: { fontSize: 14, fontWeight: "700", color: "#374151" },
  payDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
  payTotalAmt: { fontSize: 18, fontWeight: "900", color: "#0f172a" },

  payTossNote: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 16, fontWeight: "600" },

  payFooter: { backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0", gap: 12 },
  payAmtRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  payAmtLabel: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  payAmtValue: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  payBtn: { backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  payBtnText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },

  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { fontSize: 13, color: "#888", fontWeight: "600" },
  totalPrice: { fontSize: 20, fontWeight: "900", color: "#111" },
  orderBtn: { backgroundColor: "#111", borderRadius: 14, padding: 15, alignItems: "center" },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
