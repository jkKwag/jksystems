import { useState } from "react";

function AdminLogin({ onClose }) {
  const [form, setForm] = useState({ id: "", pw: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = () => {
    if (!form.id || !form.pw) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      setLoading(false);
      if (form.id === "admin" && form.pw === "1234") { alert("✅ 관리자로 로그인되었습니다."); onClose(); }
      else { setError("아이디 또는 비밀번호가 올바르지 않습니다."); }
    }, 800);
  };

  return (
    <div style={al.overlay} onClick={onClose}>
      <div style={al.card} onClick={e => e.stopPropagation()}>
        <div style={al.header}>
          <div style={al.iconWrap}>⚙️</div>
          <h2 style={al.title}>관리자 로그인</h2>
          <p style={al.sub}>CampRoad 관리자 전용 페이지입니다</p>
        </div>
        <div style={al.body}>
          {[{k:"id",l:"아이디",p:"관리자 아이디 입력",icon:"👤",t:"text"},{k:"pw",l:"비밀번호",p:"비밀번호 입력",icon:"🔒",t:"password"}].map(({k,l,p,icon,t}) => (
            <div key={k} style={al.field}>
              <label style={al.label}>{l}</label>
              <div style={al.inputWrap}>
                <span style={al.icon}>{icon}</span>
                <input style={al.input} type={t} placeholder={p} value={form[k]} onChange={set(k)} onKeyDown={e => e.key === "Enter" && handleLogin()}/>
              </div>
            </div>
          ))}
          {error && <div style={al.errorBox}>⚠️ {error}</div>}
          <button style={{ ...al.loginBtn, opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
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

export default AdminLogin;
