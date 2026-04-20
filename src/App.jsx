import { useState } from "react";
import Cars from "./pages/Cars";
import QnA from "./pages/QnA";
import FAQ from "./pages/FAQ";
import AdminLogin from "./components/AdminLogin";

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
};

const menuItems = [["cars", "🏕", "캠핑카 소개"], ["qna", "💬", "Q&A"], ["faq", "❓", "FAQ"]];

export default function App() {
  const [menu, setMenu] = useState("cars");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const goMenu = (key) => { setMenu(key); setDrawerOpen(false); };

  return (
    <div style={s.app}>
      {menu === "admin" && <AdminLogin onClose={() => setMenu("cars")} />}

      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚐</span>
            <span style={s.logoText}>CampRoad</span>
          </div>
          <button style={s.hamburger} onClick={() => setDrawerOpen(v => !v)}>
            <span style={{ ...s.bar, transform: drawerOpen ? "rotate(45deg) translate(5px,5px)" : "none" }}/>
            <span style={{ ...s.bar, opacity: drawerOpen ? 0 : 1 }}/>
            <span style={{ ...s.bar, transform: drawerOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }}/>
          </button>
        </div>
      </header>

      {/* 사이드 드로어 */}
      {drawerOpen && (
        <div style={s.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <div style={s.drawerHeader}>
              <span style={{ fontSize: 22 }}>🚐</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1d3557" }}>CampRoad</span>
            </div>
            {menuItems.map(([key, icon, label]) => (
              <button key={key}
                style={{ ...s.drawerItem, background: menu === key ? "#f0f4ff" : "transparent", color: menu === key ? "#1d3557" : "#374151", fontWeight: menu === key ? 700 : 500 }}
                onClick={() => goMenu(key)}>
                {menu === key && <span style={s.activeBar}/>}
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            <div style={{ margin: "12px 20px", borderTop: "1px solid #f1f5f9" }}/>
            <button style={{ ...s.drawerItem, color: "#6b4c9a", fontWeight: 600 }}
              onClick={() => { setMenu("admin"); setDrawerOpen(false); }}>
              <span style={{ fontSize: 18 }}>⚙️</span>
              <span>관리자</span>
            </button>
          </div>
        </div>
      )}

      {/* 메인 */}
      <main style={s.main}>
        {menu === "cars" && <Cars />}
        {menu === "qna" && <QnA />}
        {menu === "faq" && <FAQ />}
      </main>
    </div>
  );
}
