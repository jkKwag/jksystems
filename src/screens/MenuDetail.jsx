import { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Platform, Animated,
} from "react-native";

// 더미 옵션 데이터 (추후 DB 연동)
const DUMMY_OPTIONS = {
  spice: {
    label: "맵기 선택",
    required: true,
    choices: [
      { id: "s1", name: "순한맛" },
      { id: "s2", name: "보통맛" },
      { id: "s3", name: "매운맛" },
    ],
  },
  size: {
    label: "사이즈",
    required: true,
    choices: [
      { id: "sz1", name: "1인분", price: 0 },
      { id: "sz2", name: "2인분", price: 8000 },
    ],
  },
  extras: {
    label: "추가 옵션",
    required: false,
    choices: [
      { id: "e1", name: "공기밥 추가", price: 1000 },
      { id: "e2", name: "치즈 추가",   price: 2000 },
      { id: "e3", name: "음료 추가",   price: 2500 },
    ],
  },
};

function RadioGroup({ label, required, choices, selected, onSelect }) {
  return (
    <View style={s.optionBlock}>
      <View style={s.optionLabelRow}>
        <Text style={s.optionLabel}>{label}</Text>
        {required && <View style={s.requiredBadge}><Text style={s.requiredText}>필수</Text></View>}
      </View>
      {choices.map(c => (
        <TouchableOpacity
          key={c.id}
          style={[s.choiceRow, selected === c.id && s.choiceRowActive]}
          onPress={() => onSelect(c.id)}
          activeOpacity={0.7}
        >
          <View style={[s.radio, selected === c.id && s.radioActive]}>
            {selected === c.id && <View style={s.radioDot} />}
          </View>
          <Text style={[s.choiceName, selected === c.id && s.choiceNameActive]}>{c.name}</Text>
          {c.price > 0 && (
            <Text style={s.choicePrice}>+₩{c.price.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CheckGroup({ label, required, choices, selected, onToggle }) {
  return (
    <View style={s.optionBlock}>
      <View style={s.optionLabelRow}>
        <Text style={s.optionLabel}>{label}</Text>
        {required && <View style={s.requiredBadge}><Text style={s.requiredText}>필수</Text></View>}
        {!required && <Text style={s.optionalText}>선택</Text>}
      </View>
      {choices.map(c => {
        const checked = selected.includes(c.id);
        return (
          <TouchableOpacity
            key={c.id}
            style={[s.choiceRow, checked && s.choiceRowActive]}
            onPress={() => onToggle(c.id)}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, checked && s.checkboxActive]}>
              {checked && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={[s.choiceName, checked && s.choiceNameActive]}>{c.name}</Text>
            {c.price > 0 && (
              <Text style={s.choicePrice}>+₩{c.price.toLocaleString()}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MenuDetail({ item, onClose, onAddToCart }) {
  const [spice,    setSpice]    = useState("s2");
  const [size,     setSize]     = useState("sz1");
  const [extras,   setExtras]   = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const [animDone, setAnimDone] = useState(false);
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start(() => setAnimDone(true));
  }, []);

  // 총 가격 계산
  const sizePrice  = DUMMY_OPTIONS.size.choices.find(c => c.id === size)?.price || 0;
  const extraPrice = extras.reduce((sum, id) => {
    const c = DUMMY_OPTIONS.extras.choices.find(x => x.id === id);
    return sum + (c?.price || 0);
  }, 0);
  const unitPrice = (item?.price || 0) + sizePrice + extraPrice;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (id) => {
    setExtras(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    const selectedSpice  = DUMMY_OPTIONS.spice.choices.find(c => c.id === spice)?.name;
    const selectedSize   = DUMMY_OPTIONS.size.choices.find(c => c.id === size)?.name;
    const selectedExtras = extras.map(id => DUMMY_OPTIONS.extras.choices.find(c => c.id === id)?.name);

    onAddToCart?.({
      ...item,
      options: { spice: selectedSpice, size: selectedSize, extras: selectedExtras },
      quantity,
      totalPrice,
    });
    onClose?.();
  };

  // 진입 애니메이션이 끝나면 transform을 DOM에서 제거하되, 컴포넌트 타입은
  // 항상 Animated.View로 유지해 DOM이 재생성(remount)되지 않게 함
  // (타입을 바꾸면 스크롤 도중 DOM이 통째로 교체되어 제스처가 끊김)
  const wrapperStyle = animDone ? s.container : [s.container, { transform: [{ translateY: slideAnim }] }];

  return (
    <Animated.View style={wrapperStyle}>
      {/* 헤더 */}
      <View style={[s.header, Platform.OS === "web" && { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }]}>
        <TouchableOpacity style={s.backBtn} onPress={onClose}>
          <Text style={s.backBtnText}>← 메뉴로</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{item?.name || "메뉴 상세"}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* 히어로 이미지 */}
        <View style={s.heroWrap}>
          {imgError || !item?.image ? (
            <View style={[s.hero, s.heroNoImg]}>
              <Text style={s.heroNoImgText}>NO IMAGE</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.image }}
              style={s.hero}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          )}
          {item?.badge && (
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>

        {/* 메뉴 정보 */}
        <View style={s.infoSection}>
          <Text style={s.category}>{item?.category || ""}</Text>
          <Text style={s.name}>{item?.name || ""}</Text>
          <Text style={s.desc}>{item?.desc || ""}</Text>
          <Text style={s.basePrice}>₩{(item?.price || 0).toLocaleString()}</Text>
        </View>

        <View style={s.divider} />

        {/* 옵션: 맵기 */}
        <RadioGroup
          {...DUMMY_OPTIONS.spice}
          selected={spice}
          onSelect={setSpice}
        />

        <View style={s.divider} />

        {/* 옵션: 사이즈 */}
        <RadioGroup
          {...DUMMY_OPTIONS.size}
          selected={size}
          onSelect={setSize}
        />

        <View style={s.divider} />

        {/* 옵션: 추가 */}
        <CheckGroup
          {...DUMMY_OPTIONS.extras}
          selected={extras}
          onToggle={toggleExtra}
        />

        <View style={s.divider} />

        {/* 수량 */}
        <View style={s.optionBlock}>
          <Text style={s.optionLabel}>수량</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity
              style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{quantity}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
              <Text style={s.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 여백 (MenuDetail 바 + 장바구니 바 높이) */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* 하단 담기 바 */}
      <View style={[s.bottomBar, Platform.OS === "web" && { position: "fixed", bottom: 0, left: 0, right: 0 }]}>
        <View style={s.totalWrap}>
          <Text style={s.totalLabel}>총 금액</Text>
          <Text style={s.totalPrice}>₩{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={handleAddToCart}>
          <Text style={s.cartBtnText}>🛒 장바구니 담기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", overflow: "hidden" },

  header: {
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "800", textAlign: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  heroWrap: { position: "relative" },
  hero: { width: "100%", height: 260, backgroundColor: "#eee" },
  heroNoImg: { justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  heroNoImgText: { fontSize: 14, color: "#bbb", fontWeight: "600" },
  heroBadge: { position: "absolute", top: 14, left: 14, backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  infoSection: { backgroundColor: "#fff", padding: 20 },
  category: { fontSize: 12, color: "#f97316", fontWeight: "700", marginBottom: 4 },
  name: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 8 },
  desc: { fontSize: 14, color: "#666", lineHeight: 21, marginBottom: 14 },
  basePrice: { fontSize: 20, fontWeight: "900", color: "#111" },

  divider: { height: 8, backgroundColor: "#f3f4f6" },

  optionBlock: { backgroundColor: "#fff", padding: 20 },
  optionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  optionLabel: { fontSize: 15, fontWeight: "800", color: "#111" },
  requiredBadge: { backgroundColor: "#f97316", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  requiredText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  optionalText: { fontSize: 11, color: "#aaa", fontWeight: "600" },

  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  choiceRowActive: { borderColor: "#f97316", backgroundColor: "#fff8f5" },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
  radioActive: { borderColor: "#f97316" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f97316" },

  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
  checkboxActive: { borderColor: "#f97316", backgroundColor: "#f97316" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "900", lineHeight: 14 },

  choiceName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#555" },
  choiceNameActive: { color: "#111", fontWeight: "700" },
  choicePrice: { fontSize: 13, fontWeight: "700", color: "#f97316" },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0, alignSelf: "flex-start", backgroundColor: "#f3f4f6", borderRadius: 24, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 18 },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyBtnText: { fontSize: 20, fontWeight: "700", color: "#111" },
  qtyNum: { minWidth: 36, textAlign: "center", fontSize: 16, fontWeight: "900", color: "#111" },

  bottomBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    padding: 16,
    gap: 12,
  },
  totalWrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 13, color: "#888", fontWeight: "600" },
  totalPrice: { fontSize: 22, fontWeight: "900", color: "#111" },
  cartBtn: { backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
