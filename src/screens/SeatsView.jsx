import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, Platform } from "react-native";

const MOCK_SEATS = [
  { id: 1, name: "A-1", capacity: 2, desc: "창가 2인석 · 조용한 분위기", image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=220&fit=crop" },
  { id: 2, name: "A-2", capacity: 2, desc: "창가 2인석 · 자연채광", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=220&fit=crop" },
  { id: 3, name: "B-1", capacity: 4, desc: "중앙 4인석 · 넓은 테이블", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=220&fit=crop" },
  { id: 4, name: "B-2", capacity: 4, desc: "중앙 4인석 · 편안한 소파", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=220&fit=crop" },
  { id: 5, name: "C-1", capacity: 6, desc: "단체석 6인 · 모임에 적합", image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=220&fit=crop" },
  { id: 6, name: "C-2", capacity: 6, desc: "단체석 6인 · 프라이빗 공간", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=220&fit=crop" },
  { id: 7, name: "D-1", capacity: 8, desc: "프라이빗 룸 · 독립 공간", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=220&fit=crop" },
  { id: 8, name: "D-2", capacity: 10, desc: "대형 단체석 · 행사 가능", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=220&fit=crop" },
];

export default function SeatsView({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          {/* 헤더 */}
          <View style={s.header}>
            <Text style={s.headerTitle}>🪑 좌석 안내</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.content}>
            {/* 좌석 그리드 */}
            <View style={s.grid}>
              {MOCK_SEATS.map(seat => (
                <SeatCard key={seat.id} seat={seat} />
              ))}
            </View>

            <Text style={s.notice}>* 좌석 현황은 실시간 변동될 수 있습니다</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SeatCard({ seat }) {
  const [imgError, setImgError] = useState(false);
  return (
    <View style={s.card}>
      <View style={s.imgWrap}>
        {seat.image && !imgError ? (
          <Image source={{ uri: seat.image }} style={s.img} onError={() => setImgError(true)} />
        ) : (
          <View style={s.noImg}>
            <Text style={s.noImgIcon}>🪑</Text>
          </View>
        )}
        <View style={s.capacityBadge}>
          <Text style={s.capacityText}>👤 {seat.capacity}인</Text>
        </View>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.seatName}>{seat.name}</Text>
        <Text style={s.seatDesc} numberOfLines={2}>{seat.desc}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },

  content: { padding: 16, paddingBottom: 32 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  card: {
    width: "47.5%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imgWrap: { position: "relative" },
  img: { width: "100%", height: 110, backgroundColor: "#e2e8f0" },
  noImg: { width: "100%", height: 110, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  noImgIcon: { fontSize: 36 },
  capacityBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  capacityText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  cardInfo: { padding: 12 },
  seatName: { fontSize: 15, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
  seatDesc: { fontSize: 12, color: "#64748b", fontWeight: "500", lineHeight: 17 },

  notice: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16 },
});
