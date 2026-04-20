import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import MapView from "../components/MapView";
import BookingModal from "../components/BookingModal";

const s = {
  pageTitle: { margin: "0 0 5px", fontSize: 22, fontWeight: 800, color: "#111827" },
  pageDesc: { margin: 0, color: "#6b7280", fontSize: 13 },
  toggleBtn: { padding: "10px 20px", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", background: "#1d3557", color: "#fff", boxShadow: "0 2px 8px rgba(29,53,87,0.3)", transition: "all 0.2s" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  cardTop: { height: 130, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  cardBadge: { position: "absolute", top: 11, left: 11, background: "rgba(255,255,255,0.28)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)" },
  cardSeat: { position: "absolute", bottom: 9, right: 11, background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20 },
  cardBody: { padding: "14px 16px 16px" },
  cardName: { margin: "0 0 1px", fontSize: 16, fontWeight: 800, color: "#111827" },
  cardType: { fontSize: 11, color: "#9ca3af", fontWeight: 500 },
  cardDesc: { margin: "7px 0 8px", fontSize: 12, color: "#6b7280", lineHeight: 1.6 },
  chips: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 },
  chip: { background: "#f1f5f9", color: "#475569", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 500 },
  cardBtn: { width: "100%", padding: "9px", border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" },
};

function Cars() {
  const [campingCars, setCampingCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fetchCars = async () => {
      setCarsLoading(true);
      const { data, error } = await supabase.from("cars").select("*");
      if (!error && data) {
        setCampingCars(data.map(c => ({
          ...c,
          features: typeof c.features === "string" ? c.features.split(",").map(f => f.trim()) : c.features || [],
        })));
      }
      setCarsLoading(false);
    };
    fetchCars();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ ...s.pageTitle, margin: 0 }}>캠핑카 소개</h2>
          <button style={s.toggleBtn} onClick={() => setViewMode(v => v === "list" ? "map" : "list")}>
            {viewMode === "list" ? "🗺 지도 보기" : "☰ 목록 보기"}
          </button>
        </div>
        <p style={s.pageDesc}>다양한 캠핑카 중 여행에 딱 맞는 차량을 골라보세요. 카드를 클릭하면 바로 예약할 수 있습니다.</p>
      </div>

      {viewMode === "list" ? (
        carsLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚐</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>캠핑카 목록을 불러오는 중...</p>
          </div>
        ) : campingCars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😅</div>
            <p style={{ fontSize: 14 }}>등록된 캠핑카가 없습니다.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {campingCars.map((car) => (
              <div key={car.id}
                style={{ ...s.card, transform: hovered === car.id ? "translateY(-5px)" : "none", boxShadow: hovered === car.id ? "0 14px 36px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.06)" }}
                onClick={() => setSelected(car)} onMouseEnter={() => setHovered(car.id)} onMouseLeave={() => setHovered(null)}>
                <div style={{ ...s.cardTop, background: car.bg }}>
                  <span style={{ fontSize: 50, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>{car.image}</span>
                  <span style={s.cardBadge}>{car.tag}</span>
                  <span style={s.cardSeat}>👤 최대 {car.seats}인</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div><h3 style={s.cardName}>{car.name}</h3><span style={s.cardType}>{car.type}</span></div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>1박부터</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: car.color }}>₩{Number(car.price).toLocaleString()}</div>
                    </div>
                  </div>
                  <p style={s.cardDesc}>{car.desc}</p>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>📍 {car.location}</div>
                  <div style={s.chips}>{(car.features || []).slice(0, 4).map(f => <span key={f} style={s.chip}>{f}</span>)}</div>
                  <button style={{ ...s.cardBtn, background: car.bg }}>예약하기 →</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <MapView campingCars={campingCars} onSelectCar={(car) => setSelected(car)} />
      )}

      {selected && <BookingModal car={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default Cars;
