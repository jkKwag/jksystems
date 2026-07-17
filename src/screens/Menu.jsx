import { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, Platform, Animated, Easing } from "react-native";
import AiChat from "../components/AiChat";
import ChatRoom from "../components/ChatRoom";
import MenuDetail from "./MenuDetail";
import PaymentHistory from "./PaymentHistory";
import api from "../lib/api";
import SeatsView from "./SeatsView";
import { s } from "../styles/Menu.styles";

const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || "test_ck_vZnjEJeQVxexx5pMqG4brPmOoBN0";

function getUuid() {
  if (Platform.OS !== "web") return null;
  let uuid = localStorage.getItem("scaneat_uuid");
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem("scaneat_uuid", uuid);
  }
  return uuid;
}



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
  // 결제 안 된(PENDING) 주문 목록. 새로고침해도 안 없어지도록 화면 상태에
  // 두지 않고, 매번 서버(GET /api/order)에서 다시 불러와 진짜 값(source of
  // truth)을 유지한다.
  const [pendingOrders, setPendingOrders] = useState([]);

  const refreshPendingOrders = async () => {
    const uuid = getUuid();
    if (!uuid || !bizno) return;
    const orders = await api.order.list(uuid);
    if (!Array.isArray(orders)) return;
    setPendingOrders(
      orders
        .filter(o => o.bizRegNo === bizno && o.status === "PENDING")
        .map(o => ({ orderNo: o.orderNo, amount: o.totalAmount }))
    );
  };

  useEffect(() => {
    refreshPendingOrders();
  }, [bizno]);

  // 결제내역 (서버가 최근 2일치만 내려줌). "내 스캔 목록" 버튼 옆에 조건부로 노출됨
  const [recentPayments, setRecentPayments] = useState([]);
  const [paymentBizNames, setPaymentBizNames] = useState({});
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  useEffect(() => {
    const uuid = getUuid();
    if (!uuid) return;
    (async () => {
      const recent = await api.payment.list(uuid);
      if (!Array.isArray(recent)) return;
      setRecentPayments(recent);

      const uniqueBizRegNos = [...new Set(recent.map(p => p.bizRegNo))];
      const entries = await Promise.all(uniqueBizRegNos.map(async (regNo) => {
        const data = await api.biz.get(regNo);
        return [regNo, data?.bizNm];
      }));
      setPaymentBizNames(Object.fromEntries(entries));
    })();
  }, []);

  useEffect(() => {
    if (!bizno) return;
    api.biz.get(bizno).then(async (data) => {
      if (!data) { console.warn("[BIZ] fetch 실패"); return; }
      setBizInfo(data);
      if (data.indCd) {
        const cls = await api.industry.get(data.indCd);
        if (cls) setBizInfo(prev => ({ ...prev, indNm: cls.indNm }));
      }
    });
  }, [bizno]);

  useEffect(() => {
    if (!bizno) return;

    Promise.all([api.biz.categories(bizno), api.biz.menus(bizno)]).then(([cats, menus]) => {
      cats = cats || [];
      menus = menus || [];

      const catMap = {};
      cats.forEach(c => { catMap[c.bizCatCd] = c.bizCatNm; });

      if (cats.length) setCategories(["전체", ...cats.map(c => c.bizCatNm)]);

      setMenuItems(menus.map(m => ({
        id: m.menuCd,
        category: catMap[m.bizCatCd] || "",
        name: m.menuNm,
        desc: m.menuDesc || "",
        price: m.price,
        badge: m.badge || null,
        image: m.imgUrl || null,
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
      const logs = await api.scanLog.list(uuid);
      const existing = Array.isArray(logs) && logs.some(l => l.bizRegNo === bizno);
      if (!existing) {
        api.scanLog.post({ uuid, bizRegNo: bizno, vstDt: now, vstTypCd: src === "qr" ? "qr" : "url", regUsrId: "guest", regDt: now });
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

  const pendingCount = pendingOrders.length;
  const pendingTotal = pendingOrders.reduce((sum, o) => sum + o.amount, 0);
  const grandTotal = cartTotal + pendingTotal;

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

  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // 현재 장바구니 내용을 POST /api/order 요청 형식으로 변환
  const buildOrderItemsPayload = () => cartItems.map(({ item, quantity }) => ({
    menuCd: item.id,
    menuNm: item.name,
    price: item.basePrice ?? item.price,
    qty: quantity,
    options: (item.selectedOptions || []).map(o => ({ optCd: o.id, optNm: o.name, addPrice: o.price || 0 })),
  }));

  // 지금 장바구니를 실제 주문으로 서버에 저장. 실패하면 null.
  const createOrderForCart = async () => {
    const uuid = getUuid();
    if (!uuid || cartItems.length === 0) return null;
    const { data, error } = await api.order.post({
      uuid,
      bizRegNo: bizno,
      seatNo: tableNo || null,
      items: buildOrderItemsPayload(),
    });
    if (error || !data) {
      console.error("[주문 생성 실패]", error);
      return null;
    }
    return data;
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
          <Text style={s.shopName}>🍽 {bizInfo?.bizNm || ""}</Text>
          <Text style={s.shopAiBadge}>[AI✨]</Text>
          {tableNo && (
            <View style={s.tableBadge}>
              <Text style={s.tableBadgeText}>{tableNo.toUpperCase()}</Text>
            </View>
          )}
          <View style={s.shopNameActions}>
            {recentPayments.length > 0 && (
              <TouchableOpacity style={s.paymentHistoryBtn} onPress={() => setShowPaymentHistory(true)}>
                <Text style={s.paymentHistoryBtnText}>💳 결제내역</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => { if (Platform.OS === "web") window.location.href = "/"; }} style={s.scanListBtn}>
              <Text style={s.scanListBtnText}>내 스캔 목록</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.shopMeta}>
          <Text style={s.shopRating}><Text style={s.star}>★</Text> 4.8</Text>
          <Text style={s.shopInfo}>리뷰 142개 · {bizInfo?.indNm || ""}</Text>
        </View>
        <View style={s.shopTags}>
          <View style={s.orderTypeGroup}>
            {[
              { label: "매장주문", icon: "🍽️" },
              { label: "포장주문", icon: "📦" },
            ].map((t, i) => (
              <TouchableOpacity
                key={t.label}
                style={[s.orderTypeBtn, orderType === t.label && s.orderTypeBtnActive, i === 0 && s.orderTypeBtnLeft, i === 1 && s.orderTypeBtnRight]}
                onPress={() => setOrderType(t.label)}
              >
                <Text style={s.shopTagIcon}>{t.icon}</Text>
                <Text style={[s.shopTagText, orderType === t.label && s.shopTagTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.seatBtn} onPress={() => setShowSeats(true)}>
            <Text style={s.seatBtnText}>🪑 테이블 예약</Text>
          </TouchableOpacity>
        </View>
        {bizInfo?.addr && (
          <Text style={s.bizAddr}>
            {bizInfo.addr}{bizInfo.addrDtl ? ` ${bizInfo.addrDtl}` : ""}
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
            style={[s.callBtn, !bizInfo?.telNo && s.callBtnDisabled]}
            onPress={() => bizInfo?.telNo && Linking.openURL(`tel:${bizInfo.telNo}`)}
          >
            <Text style={s.callBtnText}>📞 전화 문의</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 장바구니 바 / 결제 대기 바 */}
      {cartCount > 0 ? (
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
      ) : pendingCount > 0 ? (
        <TouchableOpacity style={[s.cartBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }]} onPress={() => setShowPayment(true)}>
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{pendingCount}</Text></View>
          <View style={s.cartBarCenter}>
            <Text style={s.cartBarText}>결제 대기 중 · 결제하기</Text>
          </View>
          <Text style={s.cartBarTotal}>₩{pendingTotal.toLocaleString()}</Text>
        </TouchableOpacity>
      ) : null}

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
        style={[s.chatFab, Platform.OS === "web" && { position: "fixed", bottom: 140, right: 115, zIndex: 200 }]}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={s.sheetTitle}>🛒 장바구니</Text>
                <View style={s.cartOrderTypeBadge}>
                  <Text style={s.cartOrderTypeText}>{orderType === "포장주문" ? "📦 포장주문" : "🍽️ 매장주문"}</Text>
                </View>
              </View>
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
              <TouchableOpacity
                style={[s.orderBtn, cartItems.length === 0 && s.orderBtnDisabled]}
                disabled={cartItems.length === 0}
                onPress={() => {
                  setShowCart(false);
                  setTimeout(() => setShowPayment(true), 300);
                }}
              >
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
              {cartItems.length > 0 && (
                <View style={s.paySection}>
                  <Text style={s.paySectionTitle}>이번 주문</Text>
                  {cartItems.map(({ item, quantity }) => (
                    <View key={item.id} style={s.payOrderRow}>
                      <Text style={s.payOrderName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.payOrderQty}>x{quantity}</Text>
                      <Text style={s.payOrderPrice}>₩{(item.price * quantity).toLocaleString()}</Text>
                    </View>
                  ))}
                  <View style={s.payDivider} />
                  <View style={s.payOrderRow}>
                    <Text style={[s.payOrderName, { fontWeight: "900", color: "#111" }]}>소계</Text>
                    <Text style={s.payTotalAmt}>₩{cartTotal.toLocaleString()}</Text>
                  </View>
                </View>
              )}

              {pendingCount > 0 && (
                <View style={s.pendingBar}>
                  <Text style={s.pendingBarText}>먼저 주문한 {pendingCount}건 (결제 대기)</Text>
                  <Text style={s.pendingBarAmt}>₩{pendingTotal.toLocaleString()}</Text>
                </View>
              )}

              <Text style={s.payTossNote}>결제 수단 선택은 토스페이먼츠 화면에서 진행됩니다</Text>
            </ScrollView>

            {/* 주문/결제 버튼 */}
            <View style={s.payFooter}>
              <View style={s.payAmtRow}>
                <Text style={s.payAmtLabel}>결제 시 총 금액</Text>
                <Text style={s.payAmtValue}>₩{grandTotal.toLocaleString()}</Text>
              </View>
              <View style={s.payBtnRow}>
                <TouchableOpacity
                  style={[s.orderOnlyBtn, cartItems.length === 0 && s.orderOnlyBtnDisabled]}
                  disabled={cartItems.length === 0 || orderSubmitting}
                  onPress={async () => {
                    setOrderSubmitting(true);
                    const order = await createOrderForCart();
                    setOrderSubmitting(false);
                    if (!order) { alert("주문 생성에 실패했습니다. 다시 시도해주세요."); return; }
                    clearCart();
                    setShowPayment(false);
                    await refreshPendingOrders();
                    alert("주문이 접수되었어요. 계속 주문하시거나, 준비되면 결제해주세요.");
                  }}
                >
                  <Text style={s.orderOnlyBtnText}>주문만 하기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.payNowBtn, (grandTotal === 0 || orderSubmitting) && s.payNowBtnDisabled]}
                  disabled={grandTotal === 0 || orderSubmitting}
                  onPress={async () => {
                    try {
                      if (!TOSS_CLIENT_KEY) { alert("토스 클라이언트 키가 없습니다 (EXPO_PUBLIC_TOSS_CLIENT_KEY)"); return; }

                      let orderNos = pendingOrders.map(o => o.orderNo);
                      if (cartItems.length > 0) {
                        setOrderSubmitting(true);
                        const newOrder = await createOrderForCart();
                        setOrderSubmitting(false);
                        if (!newOrder) { alert("주문 생성에 실패했습니다. 다시 시도해주세요."); return; }
                        orderNos = [...orderNos, newOrder.orderNo];
                        clearCart();
                      }
                      if (orderNos.length === 0) { alert("결제할 주문이 없습니다."); return; }

                      const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
                      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
                      await payment.requestPayment({
                        method: "CARD",
                        amount: { currency: "KRW", value: grandTotal },
                        orderId: `scaneat-${Date.now()}`,
                        orderName: cartItems.length === 1
                          ? cartItems[0].item.name
                          : cartItems.length > 0
                            ? `${cartItems[0].item.name} 외 ${cartItems.length - 1}건`
                            : `주문 ${orderNos.length}건`,
                        successUrl: window.location.origin + `/payment/success?bizno=${bizno}&biz_nm=${encodeURIComponent(bizInfo?.bizNm || "")}&orderNos=${orderNos.join(",")}`,
                        failUrl: window.location.origin + `/payment/fail?bizno=${bizno}&biz_nm=${encodeURIComponent(bizInfo?.bizNm || "")}`,
                      });
                    } catch (e) {
                      if (e?.code === "USER_CANCEL") { setShowPayment(false); return; }
                      alert(`[결제 오류] ${e?.message || JSON.stringify(e)}`);
                      console.error("[Toss]", e);
                    } finally {
                      await refreshPendingOrders();
                    }
                  }}
                >
                  <Text style={s.payNowBtnText}>₩{grandTotal.toLocaleString()} 결제하기</Text>
                  <View style={s.payOrderTypeBadge}>
                    <Text style={s.payOrderTypeText}>{orderType === "포장주문" ? "📦 포장주문" : "🍽️ 매장주문"}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <PaymentHistory
        visible={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        payments={recentPayments}
        bizNameMap={paymentBizNames}
      />
    </View>
  );
}
