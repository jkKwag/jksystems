import { useState, useRef } from "react";

function MapView({ campingCars, onSelectCar }) {
  const [activeCar, setActiveCar] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const W = 600, H = 580;

  const toXY = (lat, lng) => ({
    x: ((lng - 124.5) / (130.2 - 124.5)) * W,
    y: ((38.9 - lat) / (38.9 - 32.8)) * H,
  });

  const onMouseDown = (e) => { dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };
  const onWheel = (e) => { e.preventDefault(); setZoom(z => Math.max(0.8, Math.min(3, z - e.deltaY * 0.001))); };

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", background: "#cfe8f5", userSelect: "none" }}>
      <div style={{ width: "100%", height: 520, overflow: "hidden", cursor: "grab" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: dragging.current ? "none" : "transform 0.1s" }}>
          <defs>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7ec8e3" /><stop offset="100%" stopColor="#5ba4c4" />
            </linearGradient>
            <filter id="landShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#2d6a4f" floodOpacity="0.25" />
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#seaGrad)" />
          {[125,126,127,128,129,130].map(lng => { const x = toXY(36,lng).x; return <g key={lng}><line x1={x} y1={0} x2={x} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7"/><text x={x+3} y={H-6} fontSize="8" fill="rgba(255,255,255,0.6)">{lng}°E</text></g>; })}
          {[33,34,35,36,37,38].map(lat => { const y = toXY(lat,127).y; return <g key={lat}><line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7"/><text x={4} y={y-3} fontSize="8" fill="rgba(255,255,255,0.6)">{lat}°N</text></g>; })}
          <path filter="url(#landShadow)" d="M 298,14 C 308,13 322,14 338,17 C 352,19 365,17 378,22 C 390,26 400,34 408,44 C 415,53 420,64 424,76 C 428,88 430,100 430,112 C 430,122 432,132 436,143 C 440,154 442,165 441,176 C 440,186 443,196 446,207 C 449,218 450,229 449,240 C 448,251 450,262 449,273 C 448,283 445,293 440,303 C 435,313 429,323 421,333 C 413,342 403,351 392,359 C 380,367 366,374 351,380 C 336,385 320,390 304,393 C 289,395 274,394 260,391 C 246,388 233,382 221,374 C 210,367 200,357 192,346 C 185,336 180,324 176,312 C 172,300 169,288 167,276 C 164,263 162,250 160,237 C 158,224 157,211 156,198 C 155,185 154,172 153,159 C 152,146 150,133 150,120 C 149,107 149,94 151,82 C 153,70 157,59 163,49 C 169,39 177,31 187,25 C 197,19 209,16 222,14 C 235,12 250,12 264,12 C 278,12 290,13 298,14 Z" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M 156,198 C 150,204 144,212 142,222 C 140,232 142,242 144,252 C 146,262 148,272 148,282 C 148,292 146,302 148,312 C 150,322 155,330 160,337" fill="none" stroke="#5a9e50" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round"/>
          <path d="M 362,22 C 370,40 378,62 383,85 C 388,108 390,132 390,156 C 390,178 387,200 382,222 C 377,244 368,265 357,284 C 346,302 333,318 318,332" fill="none" stroke="#4a8a40" strokeWidth="5" strokeOpacity="0.28" strokeLinecap="round"/>
          <ellipse cx="375" cy="155" rx="38" ry="65" fill="#78b565" opacity="0.35"/>
          <ellipse cx="248" cy="495" rx="55" ry="26" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.5" filter="url(#landShadow)"/>
          <text x="248" y="499" textAnchor="middle" fontSize="10" fill="#2d6a20" fontWeight="700">제주도</text>
          <ellipse cx="478" cy="192" rx="13" ry="15" fill="#8dcc78" stroke="#5a9e50" strokeWidth="1.2" filter="url(#landShadow)"/>
          <text x="478" y="215" textAnchor="middle" fontSize="9" fill="#2d6a20" fontWeight="600">울릉도</text>
          <path d="M 195,138 C 210,140 228,138 245,136 C 262,134 278,132 295,133 C 312,133 328,136 338,140" fill="none" stroke="#5ba4c4" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round"/>
          <path d="M 358,155 C 362,175 366,200 368,225 C 370,250 368,275 362,298 C 356,320 346,340 334,355" fill="none" stroke="#5ba4c4" strokeWidth="1.8" strokeOpacity="0.55" strokeLinecap="round"/>
          {[{name:"서울",lat:37.56,lng:126.98,size:13},{name:"부산",lat:35.18,lng:129.08,size:11},{name:"대구",lat:35.87,lng:128.60,size:10},{name:"인천",lat:37.46,lng:126.70,size:10},{name:"광주",lat:35.16,lng:126.85,size:10},{name:"대전",lat:36.35,lng:127.38,size:10}].map(city => {
            const { x, y } = toXY(city.lat, city.lng);
            const isSeoul = city.name === "서울";
            return (
              <g key={city.name}>
                <circle cx={x} cy={y} r={isSeoul ? 5 : 3.5} fill="#fff" stroke={isSeoul ? "#e63946" : "#888"} strokeWidth={isSeoul ? 1.5 : 1}/>
                <text x={x+7} y={y+4} fontSize={city.size} fill={isSeoul ? "#c1121f" : "#333"} fontWeight={isSeoul ? "700" : "500"}>{city.name}</text>
              </g>
            );
          })}
          {campingCars.map((car) => {
            const { x, y } = toXY(car.lat, car.lng);
            const isActive = activeCar?.id === car.id;
            const r = isActive ? 22 : 17;
            return (
              <g key={car.id} style={{ cursor: "pointer" }} onClick={() => setActiveCar(c => c?.id === car.id ? null : car)}>
                <ellipse cx={x} cy={y+r+6} rx={r*0.7} ry={4} fill="rgba(0,0,0,0.18)"/>
                <polygon points={`${x-7},${y+r-2} ${x+7},${y+r-2} ${x},${y+r+10}`} fill={car.color}/>
                <circle cx={x} cy={y} r={r} fill={car.color} stroke="#fff" strokeWidth={isActive ? 3 : 2.5} style={{ filter: isActive ? `drop-shadow(0 0 8px ${car.color})` : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))", transition: "all 0.2s" }}/>
                <text x={x} y={y+(isActive ? 7 : 5)} textAnchor="middle" fontSize={isActive ? 16 : 12} style={{ userSelect: "none" }}>{car.image}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ position: "absolute", bottom: 20, left: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 50 }}>
        <button onClick={() => setZoom(z => Math.min(3, z+0.2))} style={{ width:32, height:32, borderRadius:8, border:"1px solid #ddd", background:"#fff", fontSize:18, cursor:"pointer", fontWeight:700 }}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.8, z-0.2))} style={{ width:32, height:32, borderRadius:8, border:"1px solid #ddd", background:"#fff", fontSize:18, cursor:"pointer", fontWeight:700 }}>−</button>
        <button onClick={() => { setZoom(1); setPan({ x:0, y:0 }); }} style={{ width:32, height:32, borderRadius:8, border:"1px solid #ddd", background:"#fff", fontSize:11, cursor:"pointer", fontWeight:700 }}>↺</button>
      </div>
      <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.5)", borderRadius:20, padding:"5px 14px", fontSize:11, color:"#fff", zIndex:50, whiteSpace:"nowrap" }}>드래그 이동 · 스크롤 줌 · 핀 클릭</div>
      {activeCar && (
        <div style={{ position:"absolute", top:16, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 32px)", maxWidth:380, background:"#fff", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.22)", overflow:"hidden", zIndex:200 }}>
          <div style={{ height:5, background:activeCar.bg }}/>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:46, height:46, borderRadius:12, background:activeCar.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{activeCar.image}</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15 }}>{activeCar.name}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>📍 {activeCar.location} · {activeCar.type}</div>
                </div>
              </div>
              <button style={{ background:"#f1f5f9", border:"none", borderRadius:"50%", width:28, height:28, cursor:"pointer", color:"#6b7280" }} onClick={() => setActiveCar(null)}>✕</button>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>1박부터</div>
                <span style={{ fontWeight:800, fontSize:18, color:activeCar.color }}>₩{activeCar.price.toLocaleString()}</span>
              </div>
              <button style={{ background:activeCar.bg, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }} onClick={() => { onSelectCar(activeCar); setActiveCar(null); }}>예약하기 →</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.95)", borderRadius:12, padding:"10px 14px", display:"flex", flexDirection:"column", gap:6, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:2 }}>🚐 캠핑카 위치</div>
        {campingCars.map(car => (
          <div key={car.id} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#374151", cursor:"pointer" }} onClick={() => setActiveCar(c => c?.id === car.id ? null : car)}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:car.color, display:"inline-block", flexShrink:0 }}/>
            <span>{car.image} {car.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapView;
