import { useState, useEffect, useRef } from "react";

// ─── Supabase 설정 ───────────────────────────────────────────
const SUPABASE_URL = "https://zhtqkjorhhqnnhgsddmn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodHFram9yaGhxbm5oZ3NkZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzIwNTksImV4cCI6MjA5MTgwODA1OX0.yGME2-cI6Rms8oXH612THOnXq_-eWW7wqIxAi3OCm1Y";

const supabase = {
  from: (table) => ({
    select: async (cols = "*") => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    insert: async (row) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
  }),
};



const faqs = [
  { q: "예약 취소는 언제까지 가능한가요?", a: "출발 3일 전까지 100% 환불, 1~2일 전 50% 환불, 당일 취소는 환불 불가합니다." },
  { q: "운전면허가 필요한가요?", a: "1종 보통 또는 2종 보통 면허 소지자라면 이용 가능합니다. 면허 취득 후 1년 이상이어야 합니다." },
  { q: "반려동물 동반이 가능한가요?", a: "일부 차량에 한해 소형 반려동물 동반이 가능합니다. 예약 시 사전 문의 바랍니다." },
  { q: "연료비는 포함인가요?", a: "연료비는 포함되지 않습니다. 반납 시 출발 시점과 동일한 연료량으로 반납해주셔야 합니다." },
  { q: "보험은 어떻게 적용되나요?", a: "기본 자동차 보험이 포함되어 있으며, 추가 요금으로 완전자차 보험 가입이 가능합니다." },
  { q: "최소 대여 기간이 있나요?", a: "최소 1박 2일(2일)부터 대여 가능합니다. 성수기에는 최소 3박 4일부터 예약 가능합니다." },
];

// ─── Map View (SVG 한국 지도) ───────────────────────────────
function MapView({ onSelectCar }) {
  const [activeCar, setActiveCar] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const W = 600, H = 580;

  // 위경도 → SVG 좌표 (한국 범위 맞춤)
  const toXY = (lat, lng) => ({
    x: ((lng - 124.5) / (130.2 - 124.5)) * W,
    y: ((38.9 - lat) / (38.9 - 32.8)) * H,
  });

  const onMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };
  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.8, Math.min(3, z - e.deltaY * 0.001)));
  };

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", background: "#cfe8f5", userSelect: "none" }}>
      <div
        style={{ width: "100%", height: 520, overflow: "hidden", cursor: dragging.current ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "100%", display: "block", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: dragging.current ? "none" : "transform 0.1s" }}
        >
          {/* 바다 그라디언트 */}
          <defs>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7ec8e3" />
              <stop offset="100%" stopColor="#5ba4c4" />
            </linearGradient>
            <filter id="landShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#2d6a4f" floodOpacity="0.25" />
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#seaGrad)" />

          {/* 위경도 격자 */}
          {[125,126,127,128,129,130].map(lng => {
            const x = toXY(36, lng).x;
            return <g key={lng}>
              <line x1={x} y1={0} x2={x} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
              <text x={x+3} y={H-6} fontSize="8" fill="rgba(255,255,255,0.6)">{lng}°E</text>
            </g>;
          })}
          {[33,34,35,36,37,38].map(lat => {
            const y = toXY(lat, 127).y;
            return <g key={lat}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
              <text x={4} y={y-3} fontSize="8" fill="rgba(255,255,255,0.6)">{lat}°N</text>
            </g>;
          })}

          {/* ── 한반도 본토 (정밀 경로) ── */}
          <path filter="url(#landShadow)"
            d="
              M 298,14 C 308,13 322,14 338,17 C 352,19 365,17 378,22
              C 390,26 400,34 408,44 C 415,53 420,64 424,76
              C 428,88 430,100 430,112 C 430,122 432,132 436,143
              C 440,154 442,165 441,176 C 440,186 443,196 446,207
              C 449,218 450,229 449,240 C 448,251 450,262 449,273
              C 448,283 445,293 440,303 C 435,313 429,323 421,333
              C 413,342 403,351 392,359 C 380,367 366,374 351,380
              C 336,385 320,390 304,393 C 289,395 274,394 260,391
              C 246,388 233,382 221,374 C 210,367 200,357 192,346
              C 185,336 180,324 176,312 C 172,300 169,288 167,276
              C 164,263 162,250 160,237 C 158,224 157,211 156,198
              C 155,185 154,172 153,159 C 152,146 150,133 150,120
              C 149,107 149,94 151,82 C 153,70 157,59 163,49
              C 169,39 177,31 187,25 C 197,19 209,16 222,14
              C 235,12 250,12 264,12 C 278,12 290,13 298,14 Z
            "
            fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.5" strokeLinejoin="round"
          />

          {/* 서해안 굴곡 (리아스식) */}
          <path d="
            M 156,198 C 150,204 144,212 142,222 C 140,232 142,242 144,252
            C 146,262 148,272 148,282 C 148,292 146,302 148,312 C 150,322 155,330 160,337
          " fill="none" stroke="#5a9e50" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round"/>

          {/* 남해안 굴곡 */}
          <path d="
            M 192,346 C 196,352 202,358 210,363 C 218,368 226,371 234,373
            C 242,375 250,375 258,374 C 266,373 274,370 282,368
          " fill="none" stroke="#5a9e50" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round"/>

          {/* 강원도 산지 (백두대간) */}
          <path d="
            M 362,22 C 370,40 378,62 383,85 C 388,108 390,132 390,156
            C 390,178 387,200 382,222 C 377,244 368,265 357,284
            C 346,302 333,318 318,332
          " fill="none" stroke="#4a8a40" strokeWidth="5" strokeOpacity="0.28" strokeLinecap="round"/>

          {/* 태백산맥 음영 */}
          <ellipse cx="375" cy="155" rx="38" ry="65" fill="#78b565" opacity="0.35" />
          <ellipse cx="360" cy="245" rx="28" ry="45" fill="#78b565" opacity="0.25" />

          {/* 소백산맥 */}
          <ellipse cx="310" cy="310" rx="50" ry="25" fill="#78b565" opacity="0.2" transform="rotate(-20,310,310)" />

          {/* 도 경계선 (간략) */}
          {/* 경기/강원 */}
          <path d="M 270,120 C 290,118 310,115 330,118 C 350,120 368,128 375,140" fill="none" stroke="#4a8a40" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,3"/>
          {/* 충청/경상 */}
          <path d="M 200,250 C 220,248 245,245 270,244 C 295,243 320,245 340,248" fill="none" stroke="#4a8a40" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4,3"/>
          {/* 전라/경상 */}
          <path d="M 215,330 C 235,325 260,320 285,318 C 308,316 330,318 348,322" fill="none" stroke="#4a8a40" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4,3"/>

          {/* 제주도 */}
          <ellipse cx="248" cy="495" rx="55" ry="26" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.5" filter="url(#landShadow)" />
          <ellipse cx="256" cy="490" rx="10" ry="8" fill="#78b565" opacity="0.5" />
          <text x="248" y="499" textAnchor="middle" fontSize="10" fill="#2d6a20" fontWeight="700">제주도</text>

          {/* 울릉도 */}
          <ellipse cx="478" cy="192" rx="13" ry="15" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.2" filter="url(#landShadow)" />
          <text x="478" y="215" textAnchor="middle" fontSize="9" fill="#2d6a20" fontWeight="600">울릉도</text>

          {/* 독도 */}
          <circle cx="512" cy="180" r="5" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1" />
          <text x="512" y="171" textAnchor="middle" fontSize="8" fill="#2d6a20">독도</text>

          {/* 한강 */}
          <path d="M 195,138 C 210,140 228,138 245,136 C 262,134 278,132 295,133 C 312,133 328,136 338,140" fill="none" stroke="#5ba4c4" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round"/>
          {/* 낙동강 */}
          <path d="M 358,155 C 362,175 366,200 368,225 C 370,250 368,275 362,298 C 356,320 346,340 334,355" fill="none" stroke="#5ba4c4" strokeWidth="1.8" strokeOpacity="0.55" strokeLinecap="round"/>
          {/* 금강 */}
          <path d="M 232,210 C 245,218 260,224 276,228 C 292,232 308,232 322,228" fill="none" stroke="#5ba4c4" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round"/>

          {/* 주요 도시 */}
          {[
            { name:"서울", lat:37.56, lng:126.98, size:13 },
            { name:"부산", lat:35.18, lng:129.08, size:11 },
            { name:"대구", lat:35.87, lng:128.60, size:10 },
            { name:"인천", lat:37.46, lng:126.70, size:10 },
            { name:"광주", lat:35.16, lng:126.85, size:10 },
            { name:"대전", lat:36.35, lng:127.38, size:10 },
            { name:"울산", lat:35.54, lng:129.31, size:9 },
            { name:"춘천", lat:37.88, lng:127.73, size:9 },
          ].map(city => {
            const { x, y } = toXY(city.lat, city.lng);
            const isSeoul = city.name === "서울";
            return (
              <g key={city.name}>
                <circle cx={x} cy={y} r={isSeoul ? 5 : 3.5} fill="#fff" stroke={isSeoul ? "#e63946" : "#888"} strokeWidth={isSeoul ? 1.5 : 1} />
                <text x={x + 7} y={y + 4} fontSize={city.size} fill={isSeoul ? "#c1121f" : "#333"} fontWeight={isSeoul ? "700" : "500"}>{city.name}</text>
              </g>
            );
          })}

          {/* 캠핑카 마커 */}
          {campingCars.map((car) => {
            const { x, y } = toXY(car.lat, car.lng);
            const isActive = activeCar?.id === car.id;
            const r = isActive ? 22 : 17;
            return (
              <g key={car.id} style={{ cursor: "pointer" }} onClick={() => setActiveCar(c => c?.id === car.id ? null : car)}>
                {/* 그림자 */}
                <ellipse cx={x} cy={y + r + 6} rx={r * 0.7} ry={4} fill="rgba(0,0,0,0.18)" />
                {/* 핀 꼬리 */}
                <polygon points={`${x - 7},${y + r - 2} ${x + 7},${y + r - 2} ${x},${y + r + 10}`} fill={car.color} />
                {/* 핀 원 */}
                <circle cx={x} cy={y} r={r} fill={car.color} stroke="#fff" strokeWidth={isActive ? 3 : 2.5}
                  style={{ filter: isActive ? `drop-shadow(0 0 8px ${car.color})` : `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`, transition: "all 0.2s" }} />
                {/* 이모지 */}
                <text x={x} y={y + (isActive ? 7 : 5)} textAnchor="middle" fontSize={isActive ? 16 : 12} style={{ userSelect: "none" }}>{car.image}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 줌 컨트롤 */}
      <div style={{ position: "absolute", bottom: 20, left: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 50 }}>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.8, z - 0.2))} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>↺</button>
      </div>

      {/* 조작 힌트 */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "5px 14px", fontSize: 11, color: "#fff", zIndex: 50, whiteSpace: "nowrap" }}>
        드래그 이동 · 스크롤 줌 · 핀 클릭
      </div>

      {/* 팝업 카드 */}
      {activeCar && (
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 380, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.22)", overflow: "hidden", zIndex: 200 }}>
          <div style={{ height: 5, background: activeCar.bg }} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: activeCar.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{activeCar.image}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{activeCar.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>📍 {activeCar.location} · {activeCar.type}</div>
                </div>
              </div>
              <button style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#6b7280" }} onClick={() => setActiveCar(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {activeCar.features.slice(0, 4).map(f => <span key={f} style={{ background: "#f1f5f9", color: "#475569", fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>{f}</span>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>1박부터</div>
                <span style={{ fontWeight: 800, fontSize: 18, color: activeCar.color }}>₩{activeCar.price.toLocaleString()}</span>
              </div>
              <button style={{ background: activeCar.bg, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                onClick={() => { onSelectCar(activeCar); setActiveCar(null); }}>예약하기 →</button>
            </div>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 2 }}>🚐 캠핑카 위치</div>
        {campingCars.map(car => (
          <div key={car.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#374151", cursor: "pointer" }}
            onClick={() => setActiveCar(c => c?.id === car.id ? null : car)}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: car.color, display: "inline-block", flexShrink: 0 }} />
            <span>{car.image} {car.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Booking Modal ───────────────────────────────────────────
function BookingModal({ car, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", startDate: "", endDate: "", people: 1, request: "" });
  const [done, setDone] = useState(false);

  const nights = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const d = (new Date(form.endDate) - new Date(form.startDate)) / 86400000;
    return d > 0 ? d : 0;
  })();
  const total = nights * car.price;
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.phone || !form.startDate || !form.endDate) return alert("필수 항목을 입력해주세요.");
    if (nights <= 0) return alert("올바른 날짜를 선택해주세요.");
    const { error } = await supabase.from("reservations").insert({
      car_id: car.id,
      car_name: car.name,
      name: form.name,
      phone: form.phone,
      start_date: form.startDate,
      end_date: form.endDate,
      people: Number(form.people),
      total_price: total,
      request: form.request,
    });
    if (error) { alert("예약 저장 중 오류가 발생했습니다."); return; }
    setDone(true);
  };

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.sheet} onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div style={{ ...ms.modalHeader, background: car.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>{car.image}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{car.name}</h2>
                <span style={ms.badge}>{car.tag}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.82)" }}>
                {car.type} · 최대 {car.seats}인 · <b>1박 ₩{car.price.toLocaleString()}</b>
              </p>
            </div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 본문 */}
        <div style={ms.body}>
          {done ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>예약 완료!</h3>
              <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 13 }}><b>{form.name}</b>님의 예약이 접수되었습니다.</p>
              <div style={ms.receipt}>
                {[["차량", car.name], ["기간", `${form.startDate} ~ ${form.endDate}`], ["박수", `${nights}박 ${nights + 1}일`], ["인원", `${form.people}명`]].map(([k, v]) => (
                  <div key={k} style={ms.receiptRow}>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}
                <div style={{ ...ms.receiptRow, borderTop: "1px solid #d1fae5", marginTop: 8, paddingTop: 10 }}>
                  <span style={{ fontWeight: 700 }}>총 금액</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#059669" }}>₩{total.toLocaleString()}</span>
                </div>
              </div>
              <p style={{ color: "#9ca3af", fontSize: 11, margin: "12px 0 14px" }}>예약 확인 문자가 발송되었습니다 · 문의 1588-0000</p>
              <button style={{ ...ms.submitBtn, background: car.bg }} onClick={onClose}>닫기</button>
            </div>
          ) : (
            <>
              <div style={ms.formGrid}>
                {[
                  { key: "name", label: "이름", placeholder: "홍길동", required: true },
                  { key: "phone", label: "연락처", placeholder: "010-0000-0000", required: true },
                  { key: "startDate", label: "출발일", type: "date", required: true },
                  { key: "endDate", label: "반납일", type: "date", required: true },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key} style={ms.field}>
                    <label style={ms.lbl}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>
                    <input style={ms.inp} type={type || "text"} placeholder={placeholder} value={form[key]} onChange={setField(key)} />
                  </div>
                ))}
                <div style={ms.field}>
                  <label style={ms.lbl}>인원</label>
                  <select style={ms.inp} value={form.people} onChange={setField("people")}>
                    {Array.from({ length: car.seats }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}명</option>
                    ))}
                  </select>
                </div>
                <div style={ms.field}>
                  <label style={ms.lbl}>요청사항</label>
                  <input style={ms.inp} placeholder="선택 입력" value={form.request} onChange={setField("request")} />
                </div>
              </div>
              <div style={{ ...ms.costBar, borderColor: car.color + "44" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  {nights > 0 ? `₩${car.price.toLocaleString()} × ${nights}박` : "날짜를 선택하면 요금이 계산됩니다"}
                </span>
                <span style={{ fontWeight: 800, fontSize: 20, color: car.color }}>
                  {nights > 0 ? `₩${total.toLocaleString()}` : "—"}
                </span>
              </div>
              <button style={{ ...ms.submitBtn, background: car.bg }} onClick={submit}>예약 확정하기 →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ms = {
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  sheet: { display: "flex", flexDirection: "column", width: "100%", maxWidth: 480, maxHeight: "90vh", borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", background: "#fff" },
  modalHeader: { padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  badge: { background: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: "#fff" },
  closeBtn: { background: "rgba(255,255,255,0.22)", border: "none", color: "#fff", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  body: { padding: "20px 20px 18px", overflowY: "auto", display: "flex", flexDirection: "column" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", marginBottom: 14 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  lbl: { fontSize: 11, fontWeight: 600, color: "#6b7280" },
  inp: { padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f9fafb", color: "#111", boxSizing: "border-box", width: "100%" },
  costBar: { border: "2px solid", borderRadius: 12, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  submitBtn: { width: "100%", padding: "13px", border: "none", borderRadius: 11, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  receipt: { width: "100%", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: 12, padding: "12px 16px", boxSizing: "border-box" },
  receiptRow: { display: "flex", justifyContent: "space-between", padding: "4px 0" },
};

// ─── Admin Login ─────────────────────────────────────────────
function AdminLogin({ onClose }) {
  const [form, setForm] = useState({ id: "", pw: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = () => {
    if (!form.id || !form.pw) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (form.id === "admin" && form.pw === "1234") {
        alert("✅ 관리자로 로그인되었습니다.");
        onClose();
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    }, 800);
  };

  return (
    <div style={al.overlay} onClick={onClose}>
      <div style={al.card} onClick={e => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div style={al.header}>
          <div style={al.iconWrap}>⚙️</div>
          <h2 style={al.title}>관리자 로그인</h2>
          <p style={al.sub}>CampRoad 관리자 전용 페이지입니다</p>
        </div>

        {/* 폼 */}
        <div style={al.body}>
          <div style={al.field}>
            <label style={al.label}>아이디</label>
            <div style={al.inputWrap}>
              <span style={al.icon}>👤</span>
              <input
                style={al.input}
                placeholder="관리자 아이디 입력"
                value={form.id}
                onChange={set("id")}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <div style={al.field}>
            <label style={al.label}>비밀번호</label>
            <div style={al.inputWrap}>
              <span style={al.icon}>🔒</span>
              <input
                style={al.input}
                type="password"
                placeholder="비밀번호 입력"
                value={form.pw}
                onChange={set("pw")}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <div style={al.errorBox}>⚠️ {error}</div>
          )}

          <button
            style={{ ...al.loginBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <button style={al.cancelBtn} onClick={onClose}>취소</button>

          <p style={al.hint}>테스트 계정: admin / 1234</p>
        </div>
      </div>
    </div>
  );
}

const al = {
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: "#fff", borderRadius: 24, width: "100%", maxWidth: 400, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" },
  header: { background: "linear-gradient(135deg,#1d3557,#457b9d)", padding: "36px 32px 28px", textAlign: "center", color: "#fff" },
  iconWrap: { fontSize: 44, marginBottom: 12 },
  title: { margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#fff" },
  sub: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" },
  body: { padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#374151" },
  inputWrap: { display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 12, background: "#f9fafb", overflow: "hidden" },
  icon: { padding: "0 12px", fontSize: 16 },
  input: { flex: 1, padding: "12px 12px 12px 0", border: "none", background: "transparent", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#111" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" },
  loginBtn: { padding: "14px", background: "linear-gradient(135deg,#1d3557,#457b9d)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  cancelBtn: { padding: "11px", background: "#f1f5f9", color: "#6b7280", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  hint: { margin: 0, textAlign: "center", fontSize: 11, color: "#9ca3af" },
};

// ─── QnA ────────────────────────────────────────────────────
function QnA() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", author: "" });
  const [open, setOpen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const fetchQna = async () => {
      const { data, error } = await supabase.from("qna").select("*");
      if (!error) setPosts(data || []);
      setLoading(false);
    };
    fetchQna();
  }, []);

  const submit = async () => {
    if (!form.title || !form.content || !form.author) return alert("모든 항목을 입력해주세요.");
    const { data, error } = await supabase.from("qna").insert({
      title: form.title,
      content: form.content,
      author: form.author,
    });
    if (error) { alert("등록 중 오류가 발생했습니다."); return; }
    const newPost = { id: Date.now(), title: form.title, author: form.author, content: form.content, answer: null, created_at: new Date().toISOString() };
    setPosts([newPost, ...posts]);
    setForm({ title: "", content: "", author: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Q&A</h2>
        <p style={s.pageDesc}>궁금한 점을 남겨주세요. 빠르게 답변 드리겠습니다.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button style={s.outlineBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ 닫기" : "✏️ 문의 작성"}
        </button>
      </div>
      {showForm && (
        <div style={s.formCard}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>새 문의 작성</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={s.inp} placeholder="작성자 이름" value={form.author} onChange={sf("author")} />
            <input style={s.inp} placeholder="제목" value={form.title} onChange={sf("title")} />
          </div>
          <textarea style={{ ...s.inp, height: 72, resize: "none", width: "100%", boxSizing: "border-box" }} placeholder="문의 내용" value={form.content} onChange={sf("content")} />
          <button style={{ ...s.solidBtn, marginTop: 10 }} onClick={submit}>등록하기</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 14 }}>문의 목록을 불러오는 중...</p>
          </div>
        ) : posts.map((p) => (
          <div key={p.id} style={{ ...s.listCard, borderLeft: open === p.id ? "3px solid #1d3557" : "3px solid transparent" }}>
            <div style={s.listTop} onClick={() => setOpen(open === p.id ? null : p.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ ...s.statusTag, background: p.answer ? "#dcfce7" : "#fef9c3", color: p.answer ? "#166534" : "#854d0e" }}>
                  {p.answer ? "답변완료" : "대기중"}
                </span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
              </div>
              <div style={{ display: "flex", gap: 10, color: "#9ca3af", fontSize: 12, flexShrink: 0, marginLeft: 12 }}>
                <span>{p.author}</span>
                <span>{(p.created_at || p.date || "").slice(0, 10)}</span>
                <span>{open === p.id ? "▲" : "▼"}</span>
              </div>
            </div>
            {open === p.id && (
              <div style={s.answerBox}>
                {p.answer
                  ? <><span style={{ color: "#2563eb", fontWeight: 800, marginRight: 8 }}>A.</span><span style={{ color: "#374151", lineHeight: 1.7, fontSize: 14 }}>{p.answer}</span></>
                  : <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 13 }}>답변 준비 중입니다. 빠른 시일 내에 답변 드리겠습니다.</span>
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>자주 묻는 질문</h2>
        <p style={s.pageDesc}>가장 많이 궁금해하시는 내용을 정리했습니다.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ ...s.listCard, cursor: "pointer", borderLeft: open === i ? "3px solid #e76f51" : "3px solid transparent" }}>
            <div style={s.listTop} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={s.qNum}>Q{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{f.q}</span>
              </div>
              <span style={{ color: "#9ca3af", fontSize: 18, display: "inline-block", transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
            </div>
            {open === i && (
              <div style={s.answerBox}>
                <span style={{ color: "#e76f51", fontWeight: 800, marginRight: 8 }}>A.</span>
                <span style={{ color: "#374151", lineHeight: 1.7, fontSize: 14 }}>{f.a}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────
export default function App() {
  const [menu, setMenu] = useState("cars");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [campingCars, setCampingCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);

  // Supabase에서 캠핑카 목록 불러오기
  useEffect(() => {
    const fetchCars = async () => {
      setCarsLoading(true);
      const { data, error } = await supabase.from("cars").select("*");
      if (error) {
        console.error("cars 불러오기 실패:", error);
      } else {
        // features가 문자열로 저장된 경우 배열로 변환
        const parsed = data.map(c => ({
          ...c,
          features: typeof c.features === "string"
            ? c.features.split(",").map(f => f.trim())
            : c.features || [],
        }));
        setCampingCars(parsed);
      }
      setCarsLoading(false);
    };
    fetchCars();
  }, []);

  const menuItems = [["cars", "🏕", "캠핑카 소개"], ["qna", "💬", "Q&A"], ["faq", "❓", "FAQ"]];
  const goMenu = (key) => { setMenu(key); setDrawerOpen(false); };

  return (
    <div style={s.app}>
      {/* 로그인 모달 */}
      {menu === "admin" && <AdminLogin onClose={() => setMenu("cars")} />}

      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚐</span>
            <span style={s.logoText}>CampRoad</span>
          </div>
          <button style={s.hamburger} onClick={() => setDrawerOpen((v) => !v)}>
            <span style={{ ...s.bar, transform: drawerOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ ...s.bar, opacity: drawerOpen ? 0 : 1 }} />
            <span style={{ ...s.bar, transform: drawerOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
      </header>

      {/* 사이드 드로어 */}
      {drawerOpen && (
        <div style={s.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={s.drawerHeader}>
              <span style={{ fontSize: 22 }}>🚐</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1d3557" }}>CampRoad</span>
            </div>
            {menuItems.map(([key, icon, label]) => (
              <button
                key={key}
                style={{ ...s.drawerItem, background: menu === key ? "#f0f4ff" : "transparent", color: menu === key ? "#1d3557" : "#374151", fontWeight: menu === key ? 700 : 500 }}
                onClick={() => goMenu(key)}
              >
                {menu === key && <span style={s.activeBar} />}
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}

            {/* 구분선 */}
            <div style={{ margin: "12px 20px", borderTop: "1px solid #f1f5f9" }} />

            {/* 관리자 버튼 */}
            <button
              style={{ ...s.drawerItem, color: "#6b4c9a", fontWeight: 600, marginTop: "auto" }}
              onClick={() => { setMenu("admin"); setDrawerOpen(false); }}
            >
              <span style={{ fontSize: 18 }}>⚙️</span>
              <span>관리자</span>
            </button>
          </div>
        </div>
      )}

      {/* 메인 */}
      <main style={s.main}>
        {menu === "cars" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <h2 style={{ ...s.pageTitle, margin: 0 }}>캠핑카 소개</h2>
                <button style={s.toggleBtn} onClick={() => setViewMode(v => v === "list" ? "map" : "list")}>
                  {viewMode === "list" ? "🗺 3D 지도 보기" : "☰ 목록 보기"}
                </button>
              </div>
              <p style={s.pageDesc}>다양한 캠핑카 중 여행에 딱 맞는 차량을 골라보세요. 카드를 클릭하면 바로 예약할 수 있습니다.</p>
            </div>

            {viewMode === "list" ? (
              <>
                {carsLoading ? (
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
                    <div
                      key={car.id}
                      style={{ ...s.card, transform: hovered === car.id ? "translateY(-5px)" : "none", boxShadow: hovered === car.id ? "0 14px 36px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.06)" }}
                      onClick={() => setSelected(car)}
                      onMouseEnter={() => setHovered(car.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div style={{ ...s.cardTop, background: car.bg }}>
                        <span style={{ fontSize: 50, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>{car.image}</span>
                        <span style={s.cardBadge}>{car.tag}</span>
                        <span style={s.cardSeat}>👤 최대 {car.seats}인</span>
                      </div>
                      <div style={s.cardBody}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                          <div>
                            <h3 style={s.cardName}>{car.name}</h3>
                            <span style={s.cardType}>{car.type}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>1박부터</div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: car.color }}>₩{car.price.toLocaleString()}</div>
                          </div>
                        </div>
                        <p style={s.cardDesc}>{car.desc}</p>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>📍 {car.location}</div>
                        <div style={s.chips}>
                          {car.features.slice(0, 4).map((f) => <span key={f} style={s.chip}>{f}</span>)}
                        </div>
                        <button style={{ ...s.cardBtn, background: car.bg }}>예약하기 →</button>
                      </div>
                    </div>
                  ))}
                </div>
                )} {/* 로딩/빈 상태 끝 */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                </div>
              </>
            ) : (
              <>
                <MapView onSelectCar={(car) => setSelected(car)} />
              </>
            )}
          </>
        )}
        {menu === "qna" && <QnA />}
        {menu === "faq" && <FAQ />}
      </main>

      {selected && <BookingModal car={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const s = {
  app: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  headerInner: { maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoText: { fontSize: 20, fontWeight: 900, color: "#1d3557", letterSpacing: "-1px" },
  hamburger: { display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 4px", borderRadius: 8 },
  bar: { display: "block", width: 24, height: 2.5, background: "#1d3557", borderRadius: 2, transition: "transform 0.25s, opacity 0.2s" },
  drawerOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 200, display: "flex", justifyContent: "flex-end" },
  drawer: { width: 240, height: "100%", background: "#fff", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", paddingBottom: 24 },
  drawerHeader: { display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9", marginBottom: 8 },
  drawerItem: { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", border: "none", cursor: "pointer", fontSize: 15, textAlign: "left", position: "relative", transition: "background 0.15s", width: "100%" },
  activeBar: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 28, background: "#1d3557", borderRadius: "0 3px 3px 0" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "28px 24px" },
  pageHeader: { marginBottom: 22 },
  pageTitle: { margin: "0 0 5px", fontSize: 22, fontWeight: 800, color: "#111827" },
  pageDesc: { margin: 0, color: "#6b7280", fontSize: 13 },
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
  listCard: { background: "#fff", borderRadius: 11, border: "1px solid #e5e7eb", overflow: "hidden", transition: "border-color 0.2s" },
  listTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", cursor: "pointer" },
  statusTag: { fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, flexShrink: 0 },
  answerBox: { padding: "11px 15px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" },
  qNum: { background: "#1d3557", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0 },
  formCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 16 },
  inp: { padding: "8px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" },
  outlineBtn: { padding: "7px 16px", border: "1.5px solid #1d3557", color: "#1d3557", background: "transparent", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  solidBtn: { padding: "9px 18px", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", background: "#1d3557" },
  toggleBtn: { padding: "10px 20px", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", background: "#1d3557", color: "#fff", boxShadow: "0 2px 8px rgba(29,53,87,0.3)", transition: "all 0.2s" },
};
