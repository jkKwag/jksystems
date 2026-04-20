import { useState } from "react";
import supabase from "../lib/supabase";

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
      car_id: car.id, car_name: car.name, name: form.name, phone: form.phone,
      start_date: form.startDate, end_date: form.endDate,
      people: Number(form.people), total_price: total, request: form.request,
    });
    if (error) { alert("예약 저장 중 오류가 발생했습니다."); return; }
    setDone(true);
  };

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...ms.modalHeader, background: car.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>{car.image}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{car.name}</h2>
                <span style={ms.badge}>{car.tag}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.82)" }}>{car.type} · 최대 {car.seats}인 · <b>1박 ₩{car.price.toLocaleString()}</b></p>
            </div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={ms.body}>
          {done ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>예약 완료!</h3>
              <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 13 }}><b>{form.name}</b>님의 예약이 접수되었습니다.</p>
              <div style={ms.receipt}>
                {[["차량", car.name], ["기간", `${form.startDate} ~ ${form.endDate}`], ["박수", `${nights}박 ${nights+1}일`], ["인원", `${form.people}명`]].map(([k, v]) => (
                  <div key={k} style={ms.receiptRow}><span style={{ color: "#6b7280", fontSize: 13 }}>{k}</span><span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span></div>
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
                {[{key:"name",label:"이름",placeholder:"홍길동",required:true},{key:"phone",label:"연락처",placeholder:"010-0000-0000",required:true},{key:"startDate",label:"출발일",type:"date",required:true},{key:"endDate",label:"반납일",type:"date",required:true}].map(({ key, label, placeholder, type, required }) => (
                  <div key={key} style={ms.field}>
                    <label style={ms.lbl}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>
                    <input style={ms.inp} type={type || "text"} placeholder={placeholder} value={form[key]} onChange={setField(key)}/>
                  </div>
                ))}
                <div style={ms.field}>
                  <label style={ms.lbl}>인원</label>
                  <select style={ms.inp} value={form.people} onChange={setField("people")}>{Array.from({ length: car.seats }, (_, i) => i+1).map(n => <option key={n} value={n}>{n}명</option>)}</select>
                </div>
                <div style={ms.field}>
                  <label style={ms.lbl}>요청사항</label>
                  <input style={ms.inp} placeholder="선택 입력" value={form.request} onChange={setField("request")}/>
                </div>
              </div>
              <div style={{ ...ms.costBar, borderColor: car.color + "44" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{nights > 0 ? `₩${car.price.toLocaleString()} × ${nights}박` : "날짜를 선택하면 요금이 계산됩니다"}</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: car.color }}>{nights > 0 ? `₩${total.toLocaleString()}` : "—"}</span>
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

export default BookingModal;
