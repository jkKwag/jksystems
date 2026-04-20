import { useState } from "react";

const FAQS = [
  { q: "예약 취소는 언제까지 가능한가요?", a: "출발 3일 전까지 100% 환불, 1~2일 전 50% 환불, 당일 취소는 환불 불가합니다." },
  { q: "운전면허가 필요한가요?", a: "1종 보통 또는 2종 보통 면허 소지자라면 이용 가능합니다. 면허 취득 후 1년 이상이어야 합니다." },
  { q: "반려동물 동반이 가능한가요?", a: "일부 차량에 한해 소형 반려동물 동반이 가능합니다. 예약 시 사전 문의 바랍니다." },
  { q: "연료비는 포함인가요?", a: "연료비는 포함되지 않습니다. 반납 시 출발 시점과 동일한 연료량으로 반납해주셔야 합니다." },
  { q: "보험은 어떻게 적용되나요?", a: "기본 자동차 보험이 포함되어 있으며, 추가 요금으로 완전자차 보험 가입이 가능합니다." },
  { q: "최소 대여 기간이 있나요?", a: "최소 1박 2일(2일)부터 대여 가능합니다. 성수기에는 최소 3박 4일부터 예약 가능합니다." },
];

const s = {
  pageHeader: { marginBottom: 22 },
  pageTitle: { margin: "0 0 5px", fontSize: 22, fontWeight: 800, color: "#111827" },
  pageDesc: { margin: 0, color: "#6b7280", fontSize: 13 },
  listCard: { background: "#fff", borderRadius: 11, border: "1px solid #e5e7eb", overflow: "hidden", transition: "border-color 0.2s" },
  listTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", cursor: "pointer" },
  answerBox: { padding: "11px 15px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" },
  qNum: { background: "#1d3557", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0 },
};

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>자주 묻는 질문</h2>
        <p style={s.pageDesc}>가장 많이 궁금해하시는 내용을 정리했습니다.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAQS.map((f, i) => (
          <div key={i} style={{ ...s.listCard, cursor: "pointer", borderLeft: open === i ? "3px solid #e76f51" : "3px solid transparent" }}>
            <div style={s.listTop} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={s.qNum}>Q{i+1}</span>
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

export default FAQ;
