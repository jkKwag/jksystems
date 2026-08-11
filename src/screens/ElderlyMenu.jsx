import { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing, Platform, ActivityIndicator, useWindowDimensions, TextInput } from "react-native";
import api from "../lib/api";
import { s } from "../styles/ElderlyMenu.styles";

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

const ORDER_STATUS_LABEL = { RECEIVED: "주문접수", PREPARING: "준비중", READY: "준비완료" };
const ORDER_STATUS_STYLE_KEY = { RECEIVED: "statusReceived", PREPARING: "statusPreparing", READY: "statusReady" };

const STUCK_ORDER_MAX_AGE_MS = 3 * 60 * 60 * 1000; // 상태 무관, 주문 후 3시간 지나면 숨김
const isOrderExpired = (order) => {
  const now = Date.now();
  if (order.regDt && now - new Date(order.regDt).getTime() > STUCK_ORDER_MAX_AGE_MS) return true;
  return false;
};

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

// 선택된 옵션들을 주문 API 형식([{id, name, price}])으로 변환
function selectedOptionsOf(groups, sel) {
  const result = [];
  groups.forEach(g => {
    const v = sel[g.id];
    if (g.type === "C") {
      (v || []).forEach(cid => { const c = g.choices.find(c => c.id === cid); if (c) result.push({ id: c.id, name: c.name, price: c.price || 0 }); });
    } else {
      const c = g.choices.find(c => c.id === v);
      if (c) result.push({ id: c.id, name: c.name, price: c.price || 0 });
    }
  });
  return result;
}

const PENDING_CART_KEY = (bizno) => `scaneat_elderly_pending_cart_${bizno}`;

export default function ElderlyMenu({ bizno, tableNo, onBack }) {
  const { width } = useWindowDimensions();
  // 테이블번호 없이 들어온 경우(테이블 QR을 거치지 않은 접근)는 매장에 앉아있다고 볼 수 없으므로
  // 포장주문으로 처리한다 (일반 화면의 매장주문/포장주문 토글과 동일한 규칙).
  const orderTypCd = tableNo ? "DINE_IN" : "TAKEOUT";
  const [guestPhoneFront, setGuestPhoneFront] = useState("010");
  const [guestPhoneBack, setGuestPhoneBack] = useState("");
  const [guestPhoneError, setGuestPhoneError] = useState(false);
  const [menus, setMenus] = useState([]);
  // { [menuCd]: { qty, optionsTotal, optionLabels, selectedOptions } }
  const [cart, setCart] = useState(() => {
    if (Platform.OS !== "web" || !bizno) return {};
    try {
      const pending = sessionStorage.getItem(PENDING_CART_KEY(bizno));
      if (pending) { sessionStorage.removeItem(PENDING_CART_KEY(bizno)); return JSON.parse(pending); }
    } catch {}
    return {};
  });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [statusRefreshing, setStatusRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(false);
  const [selectedCancelOrders, setSelectedCancelOrders] = useState([]);

  // 메뉴별 옵션그룹/선택상태: { [menuCd]: group[] }, { [menuCd]: { [optGrpCd]: choiceId | choiceId[] } }
  const [optionGroupsByMenu, setOptionGroupsByMenu] = useState({});
  const [selections, setSelections] = useState({});

  // 이미 "주문하기"로 접수했지만 아직 결제 안 한 주문 (다시 들어왔을 때 결제할 수 있게)
  const [pendingOrders, setPendingOrders] = useState([]);
  // 취소/만료되지 않은 전체 주문 (결제 여부 무관, 이미지 위 "주문현황" 뱃지용)
  const [activeOrders, setActiveOrders] = useState([]);
  const refreshPendingOrders = async () => {
    const uuid = getUuid();
    if (!uuid || !bizno) return;
    const orders = await api.order.list(uuid);
    if (!Array.isArray(orders)) return;
    const bizOrders = orders.filter(o => o.bizRegNo === bizno && o.status !== "CANCELED" && !isOrderExpired(o));
    setPendingOrders(bizOrders.filter(o => !o.paymentStatus));
    setActiveOrders(bizOrders);
  };
  useEffect(() => { refreshPendingOrders(); }, [bizno]);

  // 이전에 남긴 휴대폰번호가 있으면 결제 모달의 입력란에 한 번만 자동으로 채워준다
  // (뒷자리가 이미 채워져 있으면 사용자가 직접 입력한 것으로 보고 건드리지 않음).
  useEffect(() => {
    const uuid = getUuid();
    if (!uuid) return;
    api.order.lastGuestPhone(uuid).then(phone => {
      if (!phone || phone.length !== 11) return;
      setGuestPhoneBack(prev => {
        if (prev !== "") return prev;
        setGuestPhoneFront(phone.slice(0, 3));
        return phone.slice(3);
      });
    });
  }, []);

  // 포장주문일 때만 휴대폰번호가 필요 — 앞자리(010~019)와 뒷자리(8자리)를 각각 검증
  const isGuestPhoneFrontValid = /^01[016789]$/.test(guestPhoneFront);
  const isGuestPhoneBackValid = /^\d{8}$/.test(guestPhoneBack);
  const isGuestPhoneValid = orderTypCd !== "TAKEOUT" || (isGuestPhoneFrontValid && isGuestPhoneBackValid);
  const guestPhone = guestPhoneFront + guestPhoneBack;

  const flipY = useRef(new Animated.Value(0)).current;
  const orderStatusPop = useRef(new Animated.Value(0)).current;
  const cartModalPop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showOrderStatusModal) { orderStatusPop.setValue(0); return; }
    Animated.spring(orderStatusPop, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
  }, [showOrderStatusModal]);

  useEffect(() => {
    if (!showCartModal) { cartModalPop.setValue(0); return; }
    Animated.spring(cartModalPop, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
  }, [showCartModal]);
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

  const FLIP_DURATION = 420;

  const goTo = (newIndex) => {
    if (newIndex < 0 || newIndex >= menus.length) return;
    if (bubbleShown.current) {
      bubbleShown.current = false;
      Animated.timing(bubbleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
    // 사진과 카드가 함께 뒤집히면서 다음 메뉴로 바뀐다 — 90도(옆면)로 접혀
    // 안 보이는 순간에 내용을 바꿔치기해서 계속 회전하는 것처럼 보이게 한다.
    flipY.setValue(0);
    Animated.timing(flipY, { toValue: 1, duration: FLIP_DURATION, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
    setTimeout(() => setCurrentIndex(newIndex), FLIP_DURATION / 2);
  };

  const cardRotateY = flipY.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: ["0deg", "90deg", "-90deg", "0deg"],
  });

  // 카드 영역을 손가락으로 좌우로 밀면 화살표 버튼과 같은 동작(goTo)을 하게 한다.
  // 세로 스크롤(옵션 목록)과 헷갈리지 않도록 가로 이동이 세로 이동보다 뚜렷할 때만 넘긴다.
  const SWIPE_THRESHOLD = 50;
  const swipeStartRef = useRef(null);

  const handleCarouselTouchStart = (e) => {
    const t = e.nativeEvent.touches[0];
    if (!t) return;
    swipeStartRef.current = { x: t.pageX, y: t.pageY };
  };

  const handleCarouselTouchEnd = (e) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const t = e.nativeEvent.changedTouches[0];
    if (!t) return;
    const dx = t.pageX - start.x;
    const dy = t.pageY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
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
    const selectedOptions = selectedOptionsOf(groups, sel);
    setCart(prev => ({
      ...prev,
      [menu.menuCd]: { qty: (prev[menu.menuCd]?.qty || 0) + 1, optionsTotal, optionLabels, selectedOptions },
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
    if (showCartModal && cartCount === 0 && pendingOrders.length === 0) setShowCartModal(false);
  }, [cartCount, pendingOrders.length, showCartModal]);

  const cartTotal = Object.entries(cart).reduce((sum, [cd, c]) => {
    const menu = menus.find(m => m.menuCd === cd);
    return sum + (menu ? (Number(menu.price || 0) + (c.optionsTotal || 0)) * c.qty : 0);
  }, 0);

  const pendingCount = pendingOrders.length;
  const pendingTotal = pendingOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const grandTotal = cartTotal + pendingTotal;
  // 아직 주방에서 준비를 시작하지 않은(주문접수 단계) 주문만 취소할 수 있다
  const cancelableOrders = pendingOrders.filter(o => o.status === "RECEIVED");
  // 취소 대상으로 실제 선택된 주문 (여러 건일 때 라디오로 골라낸 것)
  const ordersToCancel = cancelableOrders.filter(o => selectedCancelOrders.includes(o.orderNo));

  // 주문 목록이 바뀔 때마다 취소 가능한 주문은 기본적으로 전부 선택된 상태로 초기화
  useEffect(() => {
    setSelectedCancelOrders(pendingOrders.filter(o => o.status === "RECEIVED").map(o => o.orderNo));
  }, [pendingOrders]);

  const toggleCancelSelect = (orderNo) => {
    setSelectedCancelOrders(prev =>
      prev.includes(orderNo) ? prev.filter(no => no !== orderNo) : [...prev, orderNo]
    );
  };

  const cancelPendingOrders = async () => {
    setCancelingOrder(true);
    const results = await Promise.all(
      ordersToCancel.map(o => api.order.updateStatus(o.orderNo, { status: "CANCELED" }))
    );
    setCancelingOrder(false);
    setShowCancelConfirm(false);
    const failCount = results.filter(r => r.error).length;
    if (failCount > 0) {
      alert(
        failCount === results.length
          ? "주문 취소에 실패했습니다. 다시 시도해주세요."
          : `일부 주문(${failCount}건)은 이미 준비가 시작되어 취소되지 않았습니다. 나머지는 취소되었습니다.`
      );
    }
    await refreshPendingOrders();
    if (pendingCount <= ordersToCancel.length && cartCount === 0) setShowCartModal(false);
  };

  // 현재 장바구니 내용을 POST /api/order 요청 형식으로 변환
  const buildOrderItemsPayload = () => Object.entries(cart).map(([cd, c]) => {
    const menu = menus.find(m => m.menuCd === cd);
    return {
      menuCd: cd,
      menuNm: menu?.menuNm || "",
      price: Number(menu?.price || 0),
      qty: c.qty,
      options: (c.selectedOptions || []).map(o => ({ optCd: o.id, optNm: o.name, addPrice: o.price || 0 })),
    };
  });

  // "주문하기": 결제 없이 바로 주문 생성 (결제 대기 상태로 접수) — 나중에 이 화면에
  // 다시 들어오면 pendingOrders로 잡혀서 하단 바에서 바로 결제할 수 있다.
  const orderOnly = async () => {
    const uuid = getUuid();
    if (!uuid || cartCount === 0) return;
    if (!isGuestPhoneValid) { setGuestPhoneError(true); return; }
    setSubmitting(true);
    const { data, error } = await api.order.post({
      uuid,
      bizRegNo: bizno,
      seatNo: tableNo || null,
      orderTypCd,
      guestPhone: orderTypCd === "TAKEOUT" ? guestPhone : null,
      items: buildOrderItemsPayload(),
    });
    setSubmitting(false);
    if (error || !data) { alert("주문 생성에 실패했습니다. 다시 시도해주세요."); return; }
    setCart({});
    setShowCartModal(false);
    await refreshPendingOrders();
    alert(data.pickupNo ? `주문이 접수되었어요. 픽업번호: ${data.pickupNo}` : "주문이 접수되었어요.");
  };

  // "결제하기": 결제 전에는 새 주문을 만들지 않는다 — 결제 취소/실패해도 미결제 주문이
  // 남지 않도록, 결제가 실제로 승인된 뒤(PaymentSuccess)에 장바구니 내용으로 주문을 생성한다.
  // 이미 "주문하기"로 접수해둔 결제 대기 주문(pendingOrders)이 있으면 함께 결제한다.
  const payNow = async () => {
    if (!TOSS_CLIENT_KEY) { alert("토스 클라이언트 키가 없습니다 (EXPO_PUBLIC_TOSS_CLIENT_KEY)"); return; }
    if (cartCount === 0 && pendingCount === 0) { alert("결제할 주문이 없습니다."); return; }
    if (cartCount > 0 && !isGuestPhoneValid) { setGuestPhoneError(true); return; }
    const checkoutId = `scaneat-${Date.now()}`;
    const existingOrderNos = pendingOrders.map(o => o.orderNo);
    let storedCheckout = false;
    let storedPendingCart = false;
    setSubmitting(true);
    try {
      if (cartCount > 0) {
        sessionStorage.setItem(`scaneat_checkout_${checkoutId}`, JSON.stringify({
          uuid: getUuid(),
          bizRegNo: bizno,
          seatNo: tableNo || null,
          orderTypCd,
          guestPhone: orderTypCd === "TAKEOUT" ? guestPhone : null,
          items: buildOrderItemsPayload(),
        }));
        storedCheckout = true;
        // 결제창으로 넘어갔다가 취소하고 돌아오는 경우에만 장바구니를 복원해준다
        sessionStorage.setItem(PENDING_CART_KEY(bizno), JSON.stringify(cart));
        storedPendingCart = true;
      }

      const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      const firstMenu = menus.find(m => m.menuCd === Object.keys(cart)[0]);
      const orderCountForName = cartCount > 0 ? cartCount : pendingCount;
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: grandTotal },
        orderId: checkoutId,
        orderName: cartCount === 1 && firstMenu ? firstMenu.menuNm : `주문 ${orderCountForName}건`,
        successUrl: window.location.origin + `/payment/success?bizno=${bizno}&orderNos=${existingOrderNos.join(",")}&checkoutId=${checkoutId}`,
        failUrl: window.location.origin + `/payment/fail?bizno=${bizno}&checkoutId=${checkoutId}`,
      });
    } catch (e) {
      if (storedCheckout) { try { sessionStorage.removeItem(`scaneat_checkout_${checkoutId}`); } catch {} }
      if (storedPendingCart) { try { sessionStorage.removeItem(PENDING_CART_KEY(bizno)); } catch {} }
      if (e?.code === "USER_CANCEL") return;
      alert(`[결제 오류] ${e?.message || JSON.stringify(e)}`);
    } finally {
      setSubmitting(false);
      await refreshPendingOrders();
    }
  };

  if (loading) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingText}>메뉴 불러오는 중...</Text>
      </View>
    );
  }

  const currentMenu = menus[currentIndex];
  const currentQty = currentMenu ? (cart[currentMenu.menuCd]?.qty || 0) : 0;
  const currentGroups = currentMenu ? (optionGroupsByMenu[currentMenu.menuCd] || []) : [];
  const currentHasOptions = currentGroups.length > 0;
  const currentMenuSel = currentMenu ? (selections[currentMenu.menuCd] || {}) : {};

  return (
    <View style={s.container}>
      {/* 음식 사진 영역 — 카드와 같은 flipY 값으로 함께 뒤집힌다 */}
      <Animated.View style={[s.photoArea, { transform: [{ perspective: 1200 }, { rotateY: cardRotateY }] }]}>
        {currentMenu?.imgUrl ? (
          <Image source={{ uri: currentMenu.imgUrl }} style={s.photo} />
        ) : (
          <View style={s.photoPlaceholder}>
            <Text style={s.photoEmoji}>{currentMenu?.emoji || "🍽"}</Text>
          </View>
        )}
        {activeOrders.length > 0 && (
          <TouchableOpacity
            style={s.orderStatusBadge}
            onPress={async () => {
              setShowOrderStatusModal(true);
              setStatusRefreshing(true);
              await refreshPendingOrders();
              setStatusRefreshing(false);
            }}
            activeOpacity={0.8}
          >
            <Text style={s.orderStatusBadgeText}>{"주문\n" + activeOrders.length + "건"}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* 카드 캐러셀 — 옆으로 미끄러지는 대신 카드가 뒤집히며 다음 메뉴로 바뀐다. 화살표 버튼 대신
          손가락으로 좌우로 밀어도 같은 동작을 하도록 캐러셀 전체에 스와이프 핸들러를 붙인다. */}
      <View style={s.carouselOuter} onTouchStart={handleCarouselTouchStart} onTouchEnd={handleCarouselTouchEnd}>
        <View style={s.carouselClip}>
          <Animated.View style={[s.slide, { width, transform: [{ perspective: 1200 }, { rotateY: cardRotateY }] }]}>
            {currentMenu && (
              <View style={[s.card, currentHasOptions && s.cardWithOptions]}>
                <Text style={s.menuName}>{currentMenu.menuNm}</Text>
                <Text style={[s.menuQty, currentQty > 0 && s.menuQtyActive]}>
                  {currentQty > 0 ? `${currentQty}개 담음` : "0개"}
                </Text>
                <Text style={s.price}>{currentMenu.price?.toLocaleString()}원</Text>
                {currentQty > 0 ? (
                  <View style={s.qtyRow}>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(currentMenu.menuCd)}>
                      <Text style={s.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qtyNum}>{currentQty}</Text>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(currentMenu)}>
                      <Text style={s.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={s.addBtn} onPress={() => addToCart(currentMenu)}>
                    <Text style={s.addBtnText}>추가</Text>
                  </TouchableOpacity>
                )}

                {/* 옵션 선택 (스크롤 영역) */}
                {currentHasOptions && (
                  <ScrollView style={s.optionsScroll} contentContainerStyle={s.optionsScrollContent}>
                    {currentGroups.map(g => (
                      <View key={g.id} style={s.optionGroupBlock}>
                        <View style={s.optionGroupLabelRow}>
                          <Text style={s.optionGroupLabel}>{g.label}</Text>
                          {g.required && <View style={s.optionRequiredBadge}><Text style={s.optionRequiredText}>필수</Text></View>}
                        </View>
                        {g.choices.map(c => {
                          const sel = currentMenuSel[g.id];
                          const checked = g.type === "C" ? (sel || []).includes(c.id) : sel === c.id;
                          return (
                            <TouchableOpacity
                              key={c.id}
                              style={[s.optionChoiceRow, checked && s.optionChoiceRowActive]}
                              onPress={() => toggleOption(currentMenu.menuCd, g, c.id)}
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
            )}
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

      <View style={[s.dots, (cartCount > 0 || pendingCount > 0) && Platform.OS === "web" && { paddingBottom: 76 }]}>
        {menus.map((_, i) => (
          <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
        ))}
      </View>

      {cartCount > 0 ? (
        <TouchableOpacity
          style={[s.cartBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }]}
          onPress={() => setShowCartModal(true)}
          activeOpacity={0.85}
        >
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}개</Text></View>
          <Text style={s.cartText}>🛒 장바구니 보기</Text>
          <Text style={s.cartPrice}>{cartTotal.toLocaleString()}원</Text>
        </TouchableOpacity>
      ) : pendingCount > 0 ? (
        <TouchableOpacity
          style={[s.cartBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }]}
          onPress={() => setShowCartModal(true)}
          activeOpacity={0.85}
        >
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{pendingCount}건</Text></View>
          <Text style={s.cartText}>{"결제대기중·\n결제하기"}</Text>
          <Text style={s.cartPrice}>{pendingTotal.toLocaleString()}원</Text>
        </TouchableOpacity>
      ) : null}

      {showCartModal && (
        <View style={[
          StyleSheet.absoluteFillObject,
          s.modalOverlay,
          Platform.OS === "web" && { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 },
        ]}>
          <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowCartModal(false)} />
          <Animated.View
            style={[
              s.modalSheet,
              Platform.OS === "web" && { transformOrigin: "bottom" },
              {
                opacity: cartModalPop,
                transform: [{ scale: cartModalPop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
              },
            ]}
          >
            <View style={s.modalTitleRow}>
              <View style={s.modalTitleLeft}>
                {pendingCount > 0 && (
                  <View style={s.tossLogo}>
                    <Text style={s.tossLogoText}>toss</Text>
                  </View>
                )}
                <Text style={s.modalTitle}>{cartCount > 0 ? "장바구니" : "결제 대기 중"}</Text>
              </View>
              <View style={s.modalTitleActions}>
                {cartCount > 0 && (
                  <TouchableOpacity style={s.trashBtn} onPress={() => setCart({})}>
                    <Text style={s.trashBtnIcon}>🗑️</Text>
                  </TouchableOpacity>
                )}
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

              {orderTypCd === "TAKEOUT" && cartCount > 0 && (
                <View style={s.payPhoneField}>
                  <Text style={s.payPhoneLabel}>📞 연락받으실 휴대폰번호</Text>
                  <View style={s.payPhoneRow}>
                    <TextInput
                      style={[s.payPhoneInputFront, guestPhoneError && !isGuestPhoneFrontValid && s.payPhoneInputError]}
                      placeholder="010"
                      placeholderTextColor="#94a3b8"
                      value={guestPhoneFront}
                      onChangeText={(t) => { setGuestPhoneFront(t.replace(/[^0-9]/g, "").slice(0, 3)); setGuestPhoneError(false); }}
                      keyboardType="phone-pad"
                      maxLength={3}
                    />
                    <Text style={s.payPhoneSep}>-</Text>
                    <TextInput
                      style={[s.payPhoneInputBack, guestPhoneError && isGuestPhoneFrontValid && !isGuestPhoneBackValid && s.payPhoneInputError]}
                      placeholder="숫자 8자리"
                      placeholderTextColor="#94a3b8"
                      value={guestPhoneBack}
                      onChangeText={(t) => { setGuestPhoneBack(t.replace(/[^0-9]/g, "").slice(0, 8)); setGuestPhoneError(false); }}
                      keyboardType="phone-pad"
                      maxLength={8}
                    />
                  </View>
                  {guestPhoneError && !isGuestPhoneFrontValid && (
                    <Text style={s.payPhoneErrorText}>앞자리를 010~019 형식으로 입력해주세요.</Text>
                  )}
                  {guestPhoneError && isGuestPhoneFrontValid && !isGuestPhoneBackValid && (
                    <Text style={s.payPhoneErrorText}>뒷자리 8자리를 입력해주세요.</Text>
                  )}
                </View>
              )}

              {pendingCount > 0 && (
                <View style={s.pendingSection}>
                  <Text style={s.pendingSectionTitle}>이미 주문한 내역 ({pendingCount}건, 결제 대기)</Text>
                  {pendingOrders.map((order, oi) => (
                    <View key={order.orderNo} style={s.pendingOrderBlock}>
                      <View style={s.pendingOrderBadgeRow}>
                        {pendingOrders.length > 1 && (
                          order.status === "RECEIVED" ? (
                            <TouchableOpacity
                              onPress={() => toggleCancelSelect(order.orderNo)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <View style={[s.cancelRadioOuter, selectedCancelOrders.includes(order.orderNo) && s.cancelRadioOuterActive]}>
                                {selectedCancelOrders.includes(order.orderNo) && <View style={s.cancelRadioInner} />}
                              </View>
                            </TouchableOpacity>
                          ) : (
                            // 주문접수 단계가 지나 취소할 수 없는 건은 선택 불가 상태로만 표시
                            <View style={[s.cancelRadioOuter, s.cancelRadioOuterDisabled]} />
                          )
                        )}
                        <View style={s.pendingOrderBadge}>
                          <Text style={s.pendingOrderBadgeText}>주문{pendingOrders.length - oi}</Text>
                        </View>
                      </View>
                      {order.items?.map(item => (
                        <View key={item.orderSeq} style={s.pendingItemRow}>
                          <Text style={s.pendingItemName} numberOfLines={1}>{item.menuNm}</Text>
                          <Text style={s.pendingItemQty}>x{item.qty}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <View style={s.modalFooter}>
              <Text style={s.modalTotal}>총 {grandTotal.toLocaleString()}원</Text>
              <View style={s.modalBtnCol}>
                {cartCount === 0 && pendingCount > 0 ? (
                  // 취소할 수 있는(주문접수 단계) 건이 하나도 없으면 버튼 자체를 숨긴다
                  cancelableOrders.length > 0 && (
                    <TouchableOpacity
                      style={[s.modalOrderOnlyBtn, s.modalOrderOnlyBtnCancel, (ordersToCancel.length === 0 || cancelingOrder) && s.modalOrderBtnDisabled]}
                      onPress={() => setShowCancelConfirm(true)}
                      disabled={ordersToCancel.length === 0 || cancelingOrder}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.modalOrderOnlyBtnText, s.modalOrderOnlyBtnTextCancel]}>주문취소</Text>
                    </TouchableOpacity>
                  )
                ) : cartCount > 0 && orderTypCd !== "TAKEOUT" && (
                  <TouchableOpacity
                    style={s.modalOrderOnlyBtn}
                    onPress={orderOnly}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    <Text style={s.modalOrderOnlyBtnText}>주문하기</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[s.modalPayBtn, (cartCount === 0 && pendingCount === 0 || submitting) && s.modalOrderBtnDisabled]}
                  onPress={payNow}
                  disabled={(cartCount === 0 && pendingCount === 0) || submitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.modalPayBtnText}>결제하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {/* 주문취소 확인 — 장바구니 모달 위에 떠야 하므로 그 뒤에 배치 */}
      {showCancelConfirm && (
        <View style={[
          StyleSheet.absoluteFillObject,
          s.confirmOverlay,
          Platform.OS === "web" && { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 },
        ]}>
          <View style={s.confirmBox}>
            <Text style={s.confirmEmoji}>⚠️</Text>
            <Text style={s.confirmTitle}>주문취소</Text>
            <Text style={s.confirmMsg}>
              {ordersToCancel.length > 1 ? `선택한 주문 ${ordersToCancel.length}건을 취소하시겠어요?` : "접수된 주문을 취소하시겠어요?"}
            </Text>
            <View style={s.confirmBtns}>
              <TouchableOpacity style={s.confirmCancelBtn} onPress={() => setShowCancelConfirm(false)} disabled={cancelingOrder}>
                <Text style={s.confirmCancelText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmOkBtn} onPress={cancelPendingOrders} disabled={cancelingOrder}>
                <Text style={s.confirmOkText}>주문취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showOrderStatusModal && (
        <View style={[
          StyleSheet.absoluteFillObject,
          s.modalOverlay,
          Platform.OS === "web" && { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 },
        ]}>
          <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowOrderStatusModal(false)} />
          <Animated.View
            style={[
              s.modalSheet,
              Platform.OS === "web" && { transformOrigin: "top right" },
              {
                opacity: orderStatusPop,
                transform: [{ scale: orderStatusPop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
              },
            ]}
          >
            <View style={s.modalTitleRow}>
              <Text style={s.modalTitle}>주문현황</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setShowOrderStatusModal(false)}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalList}>
              {(() => {
                // 주문번호(주문N)는 실제 주문한 순서 그대로 매기고, 화면에는 먼저 주문한 게
                // 아래로 가도록(최신 주문이 위) 뒤집어서 보여준다.
                const chronologicalOrders = [...activeOrders].sort((a, b) => new Date(a.regDt) - new Date(b.regDt));
                const orderIndexByNo = new Map(chronologicalOrders.map((o, i) => [o.orderNo, i]));
                return [...chronologicalOrders].reverse().map((order) => {
                  const oi = orderIndexByNo.get(order.orderNo);
                  return (
                <View key={order.orderNo} style={s.statusOrderBlock}>
                  <View style={s.statusHeaderRow}>
                    <View style={s.pendingOrderBadge}>
                      <Text style={s.pendingOrderBadgeText}>주문{oi + 1}</Text>
                    </View>
                    {statusRefreshing && order.status !== "READY" ? (
                      <ActivityIndicator size="small" color="#94a3b8" />
                    ) : (
                      <View style={[s.statusStateBadge, s[ORDER_STATUS_STYLE_KEY[order.status]]]}>
                        <Text style={s.statusStateBadgeText}>{ORDER_STATUS_LABEL[order.status] || order.status}</Text>
                      </View>
                    )}
                  </View>
                  {order.items?.map(item => (
                    <View key={item.orderSeq} style={s.pendingItemRow}>
                      <Text style={s.pendingItemName} numberOfLines={1}>{item.menuNm}</Text>
                      <Text style={s.pendingItemQty}>x{item.qty}</Text>
                    </View>
                  ))}
                  {order.pickupNo && <Text style={s.statusPickupText}>픽업번호 {order.pickupNo}</Text>}
                </View>
                  );
                });
              })()}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
