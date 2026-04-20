import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

const s = {
  pageHeader: { marginBottom: 22 },
  pageTitle: { margin: "0 0 5px", fontSize: 22, fontWeight: 800, color: "#111827" },
  pageDesc: { margin: 0, color: "#6b7280", fontSize: 13 },
  listCard: { background: "#fff", borderRadius: 11, border: "1px solid #e5e7eb", overflow: "hidden", transition: "border-color 0.2s" },
  listTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", cursor: "pointer" },
  statusTag: { fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, flexShrink: 0 },
  answerBox: { padding: "11px 15px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" },
  formCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 16 },
  inp: { padding: "8px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" },
  outlineBtn: { padding: "7px 16px", border: "1.5px solid #1d3557", color: "#1d3557", background: "transparent", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  solidBtn: { padding: "9px 18px", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", background: "#1d3557" },
};

function QnA() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", author: "" });
  const [open, setOpen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    supabase.from("qna").select("*").then(({ data, error }) => {
      if (!error) setPosts(data || []);
      setLoading(false);
    });
  }, []);

  const submit = async () => {
    if (!form.title || !form.content || !form.author) return alert("모든 항목을 입력해주세요.");
    const { error } = await supabase.from("qna").insert({ title: form.title, content: form.content, author: form.author });
    if (error) { alert("등록 중 오류가 발생했습니다."); return; }
    setPosts([{ id: Date.now(), title: form.title, author: form.author, answer: null, created_at: new Date().toISOString() }, ...posts]);
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
        <button style={s.outlineBtn} onClick={() => setShowForm(!showForm)}>{showForm ? "✕ 닫기" : "✏️ 문의 작성"}</button>
      </div>
      {showForm && (
        <div style={s.formCard}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>새 문의 작성</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={s.inp} placeholder="작성자 이름" value={form.author} onChange={sf("author")}/>
            <input style={s.inp} placeholder="제목" value={form.title} onChange={sf("title")}/>
          </div>
          <textarea style={{ ...s.inp, height: 72, resize: "none", width: "100%", boxSizing: "border-box" }} placeholder="문의 내용" value={form.content} onChange={sf("content")}/>
          <button style={{ ...s.solidBtn, marginTop: 10 }} onClick={submit}>등록하기</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>문의 목록을 불러오는 중...</div>
        ) : posts.map((p) => (
          <div key={p.id} style={{ ...s.listCard, borderLeft: open === p.id ? "3px solid #1d3557" : "3px solid transparent" }}>
            <div style={s.listTop} onClick={() => setOpen(open === p.id ? null : p.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ ...s.statusTag, background: p.answer ? "#dcfce7" : "#fef9c3", color: p.answer ? "#166534" : "#854d0e" }}>{p.answer ? "답변완료" : "대기중"}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
              </div>
              <div style={{ display: "flex", gap: 10, color: "#9ca3af", fontSize: 12, flexShrink: 0, marginLeft: 12 }}>
                <span>{p.author}</span><span>{(p.created_at || "").slice(0, 10)}</span><span>{open === p.id ? "▲" : "▼"}</span>
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

export default QnA;
