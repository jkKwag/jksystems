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

const fixedFill = Platform.OS === "web" ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 } : {};

export default function SeatsView({ visible, onClose }) {
  const [expandedSeat, setExpandedSeat] = useState(null);

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, fixedFill, s.container]}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onClose}>
          <Text style={s.backBtnText}>← 메뉴로</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🪑 테이블 예약</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* 좌석 그리드 */}
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.grid}>
          {MOCK_SEATS.map(seat => (
            <SeatCard key={seat.id} seat={seat} onExpand={() => setExpandedSeat(seat)} />
          ))}
        </View>
        <Text style={s.notice}>* 좌석 현황은 실시간 변동될 수 있습니다</Text>
      </ScrollView>

      {/* 이미지 확대 뷰어 */}
      {expandedSeat && (
        <Modal visible={!!expandedSeat} transparent animationType="fade" onRequestClose={() => setExpandedSeat(null)}>
          <TouchableOpacity style={s.viewerBg} activeOpacity={1} onPress={() => setExpandedSeat(null)}>
            <View style={s.viewerBox}>
              <Image
                source={{ uri: expandedSeat.image.replace("w=400&h=220", "w=800&h=500") }}
                style={s.viewerImg}
                resizeMode="cover"
              />
              <View style={s.viewerInfo}>
                <View style={s.viewerRow}>
                  <Text style={s.viewerName}>{expandedSeat.name}</Text>
                  <View style={s.viewerBadge}>
                    <Text style={s.viewerBadgeText}>👤 {expandedSeat.capacity}인</Text>
                  </View>
                </View>
                <Text style={s.viewerDesc}>{expandedSeat.desc}</Text>
              </View>
              <TouchableOpacity style={s.viewerClose} onPress={() => setExpandedSeat(null)}>
                <Text style={s.viewerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

function SeatCard({ seat, onExpand }) {
  const [imgError, setImgError] = useState(false);
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.imgWrap} activeOpacity={0.85} onPress={seat.image && !imgError ? onExpand : undefined}>
        {seat.image && !imgError ? (
          <>
            <Image source={{ uri: seat.image }} style={s.img} onError={() => setImgError(true)} />
            <View style={s.zoomHint}><Text style={s.zoomHintText}>🔍</Text></View>
          </>
        ) : (
          <View style={s.noImg}>
            <Text style={s.noImgIcon}>🪑</Text>
          </View>
        )}
        <View style={s.capacityBadge}>
          <Text style={s.capacityText}>👤 {seat.capacity}인</Text>
        </View>
      </TouchableOpacity>
      <View style={s.cardInfo}>
        <Text style={s.seatName}>{seat.name}</Text>
        <Text style={s.seatDesc} numberOfLines={2}>{seat.desc}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { zIndex: 110, backgroundColor: "#f8fafc" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },

  content: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  card: { width: "47.5%", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  imgWrap: { position: "relative" },
  img: { width: "100%", height: 130, backgroundColor: "#e2e8f0" },
  noImg: { width: "100%", height: 130, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  noImgIcon: { fontSize: 36 },
  zoomHint: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  zoomHintText: { fontSize: 10 },
  capacityBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "#0f172a", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  capacityText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  cardInfo: { padding: 12 },
  seatName: { fontSize: 15, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
  seatDesc: { fontSize: 12, color: "#64748b", fontWeight: "500", lineHeight: 17 },
  notice: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16 },

  viewerBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 24 },
  viewerBox: { width: "100%", maxWidth: 480, borderRadius: 20, overflow: "hidden", backgroundColor: "#1e293b" },
  viewerImg: { width: "100%", height: 280 },
  viewerInfo: { padding: 16, gap: 6 },
  viewerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  viewerName: { fontSize: 18, fontWeight: "900", color: "#fff" },
  viewerBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  viewerBadgeText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  viewerDesc: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  viewerClose: { position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  viewerCloseText: { fontSize: 13, color: "#fff", fontWeight: "700" },
});
