import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";

const DUMMY_ITEMS = [
  { id: 1, emoji: "🥩", name: "캠프 직화 삼겹살", category: "고기구이", price: 18000, desc: "국내산 생삼겹살 200g, 쌈채소·된장 포함", tags: ["인기", "2인이상"], color: "#c0392b", bg: "#fdf0f0" },
  { id: 2, emoji: "🍜", name: "야생 버섯 칼국수", category: "면류", price: 12000, desc: "직접 뽑은 수제면에 진한 사골 육수", tags: ["수제면", "베스트"], color: "#e67e22", bg: "#fef9f0" },
  { id: 3, emoji: "🍕", name: "캠프파이어 피자", category: "피자", price: 22000, desc: "화덕에서 구운 나폴리 스타일, 모짜렐라 듬뿍", tags: ["화덕", "쉐어"], color: "#d35400", bg: "#fef6f0" },
  { id: 4, emoji: "🍗", name: "허브 치킨 구이", category: "닭요리", price: 16000, desc: "허브 마리네이드 반마리, 감자·옥수수 곁들임", tags: ["단품", "어린이가능"], color: "#f39c12", bg: "#fffbf0" },
  { id: 5, emoji: "🥗", name: "그린 샐러드 볼", category: "샐러드", price: 10000, desc: "제철 채소와 수제 드레싱, 견과류 토핑", tags: ["웰빙", "비건"], color: "#27ae60", bg: "#f0fdf4" },
  { id: 6, emoji: "☕", name: "캠프 아메리카노", category: "음료", price: 5000, desc: "직접 로스팅한 원두, 더치커피 선택 가능", tags: ["음료", "디카페인가능"], color: "#6f4e37", bg: "#fdf5f0" },
];

export default function Menu({ bizno }) {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.shopHeader}>
        <Text style={s.shopEmoji}>🏕</Text>
        <View>
          <Text style={s.shopName}>캠프로드 식당</Text>
          <Text style={s.shopBizno}>사업자번호 {bizno}</Text>
          <View style={s.shopTagRow}>
            <View style={s.shopTag}><Text style={s.shopTagText}>캠핑식당</Text></View>
            <View style={s.shopTag}><Text style={s.shopTagText}>야외석 가능</Text></View>
            <View style={s.shopTag}><Text style={s.shopTagText}>단체예약</Text></View>
          </View>
        </View>
      </View>

      <Text style={s.sectionTitle}>메뉴 목록</Text>

      {DUMMY_ITEMS.map(item => (
        <View key={item.id} style={s.card}>
          <View style={[s.cardTop, { backgroundColor: item.bg }]}>
            <Text style={s.itemEmoji}>{item.emoji}</Text>
            <View style={s.categoryBadge}><Text style={s.categoryText}>{item.category}</Text></View>
          </View>
          <View style={s.cardBody}>
            <View style={s.cardHeader}>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={[s.itemPrice, { color: item.color }]}>₩{item.price.toLocaleString()}</Text>
            </View>
            <Text style={s.itemDesc}>{item.desc}</Text>
            <View style={s.chips}>
              {item.tags.map(t => (
                <View key={t} style={[s.chip, { borderColor: item.color + "44", backgroundColor: item.bg }]}>
                  <Text style={[s.chipText, { color: item.color }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL("tel:010-0000-0000")}>
        <Text style={s.callBtnText}>📞 전화 주문하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7f0" },
  content: { padding: 20, gap: 14 },
  shopHeader: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#d8f3dc", marginBottom: 4 },
  shopEmoji: { fontSize: 44 },
  shopName: { fontSize: 18, fontWeight: "800", color: "#1b4332", marginBottom: 2 },
  shopBizno: { fontSize: 11, color: "#74c69d", marginBottom: 6 },
  shopTagRow: { flexDirection: "row", gap: 6 },
  shopTag: { backgroundColor: "#d8f3dc", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  shopTagText: { color: "#2d6a4f", fontSize: 10, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1b4332" },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#d8f3dc", shadowColor: "#2d6a4f", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardTop: { height: 110, justifyContent: "center", alignItems: "center" },
  itemEmoji: { fontSize: 52 },
  categoryBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText: { fontSize: 10, fontWeight: "700", color: "#52796f" },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  itemName: { fontSize: 15, fontWeight: "800", color: "#1b4332", flex: 1 },
  itemPrice: { fontSize: 16, fontWeight: "800", marginLeft: 8 },
  itemDesc: { fontSize: 12, color: "#52796f", lineHeight: 18, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 10, fontWeight: "600" },
  callBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 4 },
  callBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
