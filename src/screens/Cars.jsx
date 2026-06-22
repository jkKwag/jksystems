import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import supabase from "../lib/supabase";
import BookingModal from "../components/BookingModal";

export default function Cars() {
  const [campingCars, setCampingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase.from("cars").select("*").then(({ data, error }) => {
      if (!error && data) {
        setCampingCars(data.map(c => ({
          ...c,
          features: typeof c.features === "string" ? c.features.split(",").map(f => f.trim()) : c.features || [],
        })));
      }
      setLoading(false);
    });
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>캠핑카 소개</Text>
      <Text style={s.desc}>다양한 캠핑카 중 여행에 딱 맞는 차량을 골라보세요.</Text>
      {loading ? (
        <View style={s.center}>
          <Text style={s.loadingIcon}>🚐</Text>
          <ActivityIndicator size="large" color="#1d3557" />
        </View>
      ) : campingCars.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40 }}>😅</Text>
          <Text style={s.emptyText}>등록된 캠핑카가 없습니다.</Text>
        </View>
      ) : campingCars.map((car) => (
        <TouchableOpacity key={car.id} style={s.card} onPress={() => setSelected(car)}>
          <View style={[s.cardTop, { backgroundColor: car.bg || "#1d3557" }]}>
            <Text style={s.carEmoji}>{car.image}</Text>
            <View style={s.badge}><Text style={s.badgeText}>{car.tag}</Text></View>
            <View style={s.seatBadge}><Text style={s.seatText}>👤 최대 {car.seats}인</Text></View>
          </View>
          <View style={s.cardBody}>
            <View style={s.cardHeader}>
              <View>
                <Text style={s.carName}>{car.name}</Text>
                <Text style={s.carType}>{car.type}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.priceLabel}>1박부터</Text>
                <Text style={[s.price, { color: car.color || "#1d3557" }]}>₩{Number(car.price).toLocaleString()}</Text>
              </View>
            </View>
            <Text style={s.cardDesc}>{car.desc}</Text>
            <Text style={s.location}>📍 {car.location}</Text>
            <View style={s.chips}>
              {(car.features || []).slice(0, 4).map(f => (
                <View key={f} style={s.chip}><Text style={s.chipText}>{f}</Text></View>
              ))}
            </View>
            <View style={[s.bookBtn, { backgroundColor: car.bg || "#1d3557" }]}>
              <Text style={s.bookBtnText}>예약하기 →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {selected && <BookingModal car={selected} onClose={() => setSelected(null)} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7f0" },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1b4332", marginBottom: 4 },
  desc: { fontSize: 13, color: "#52796f", marginBottom: 8 },
  center: { alignItems: "center", paddingVertical: 60 },
  loadingIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: "#9ca3af" },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#2d6a4f", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: "#d8f3dc" },
  cardTop: { height: 130, justifyContent: "center", alignItems: "center" },
  carEmoji: { fontSize: 50 },
  badge: { position: "absolute", top: 11, left: 11, backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  seatBadge: { position: "absolute", bottom: 9, right: 11, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  seatText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  carName: { fontSize: 16, fontWeight: "800", color: "#1b4332" },
  carType: { fontSize: 11, color: "#74c69d" },
  priceLabel: { fontSize: 10, color: "#74c69d" },
  price: { fontWeight: "800", fontSize: 15 },
  cardDesc: { fontSize: 12, color: "#52796f", lineHeight: 19, marginBottom: 6 },
  location: { fontSize: 11, color: "#74c69d", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 12 },
  chip: { backgroundColor: "#d8f3dc", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { color: "#2d6a4f", fontSize: 10, fontWeight: "500" },
  bookBtn: { borderRadius: 9, padding: 10, alignItems: "center" },
  bookBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
