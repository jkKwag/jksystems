import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from "react-native";
import supabase from "../lib/supabase";

export default function BookingModal({ car, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", startDate: "", endDate: "", people: "1", request: "" });
  const [done, setDone] = useState(false);

  const nights = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const d = (new Date(form.endDate) - new Date(form.startDate)) / 86400000;
    return d > 0 ? d : 0;
  })();
  const total = nights * car.price;

  const submit = async () => {
    if (!form.name || !form.phone || !form.startDate || !form.endDate) return Alert.alert("알림", "필수 항목을 입력해주세요.");
    if (nights <= 0) return Alert.alert("알림", "올바른 날짜를 선택해주세요.");
    const { error } = await supabase.from("reservations").insert({
      car_id: car.id, car_name: car.name, name: form.name, phone: form.phone,
      start_date: form.startDate, end_date: form.endDate,
      people: Number(form.people), total_price: total, request: form.request,
      status: "pending",
    });
    if (error) { Alert.alert("오류", "예약 저장 중 오류가 발생했습니다."); return; }
    setDone(true);
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={[s.header, { backgroundColor: car.color || "#2d6a4f" }]}>
            <View style={s.headerLeft}>
              <Text style={s.carIcon}>{car.image}</Text>
              <View>
                <Text style={s.carName}>{car.name}</Text>
                <Text style={s.carInfo}>{car.type} · 최대 {car.seats}인 · 1박 ₩{car.price.toLocaleString()}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.body} contentContainerStyle={{ padding: 20 }}>
            {done ? (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>📋</Text>
                <Text style={s.doneTitle}>예약 접수 완료!</Text>
                <Text style={s.doneDesc}>{form.name}님의 예약이 접수되었습니다.</Text>
                <View style={s.pendingBadge}><Text style={s.pendingText}>🕐 예약 대기 중 · 확정 후 연락드리겠습니다</Text></View>
                <View style={s.receipt}>
                  {[["차량", car.name], ["기간", `${form.startDate} ~ ${form.endDate}`], ["박수", `${nights}박 ${nights+1}일`], ["인원", `${form.people}명`], ["상태", "대기 중"]].map(([k, v]) => (
                    <View key={k} style={s.receiptRow}>
                      <Text style={s.receiptKey}>{k}</Text>
                      <Text style={s.receiptVal}>{v}</Text>
                    </View>
                  ))}
                  <View style={[s.receiptRow, { borderTopWidth: 1, borderTopColor: "#d1fae5", marginTop: 8, paddingTop: 10 }]}>
                    <Text style={{ fontWeight: "700" }}>총 금액</Text>
                    <Text style={s.totalPrice}>₩{total.toLocaleString()}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[s.submitBtn, { backgroundColor: car.color || "#2d6a4f" }]} onPress={onClose}>
                  <Text style={s.submitBtnText}>닫기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {[
                  { key: "name", label: "이름", placeholder: "홍길동", required: true },
                  { key: "phone", label: "연락처", placeholder: "010-0000-0000", required: true },
                  { key: "startDate", label: "출발일 (YYYY-MM-DD)", placeholder: "2026-01-01", required: true },
                  { key: "endDate", label: "반납일 (YYYY-MM-DD)", placeholder: "2026-01-03", required: true },
                  { key: "people", label: "인원", placeholder: "1" },
                  { key: "request", label: "요청사항", placeholder: "선택 입력" },
                ].map(({ key, label, placeholder, required }) => (
                  <View key={key} style={s.field}>
                    <Text style={s.lbl}>{label}{required && <Text style={{ color: "#ef4444" }}> *</Text>}</Text>
                    <TextInput style={s.inp} placeholder={placeholder} value={form[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))} keyboardType={key === "people" ? "numeric" : "default"} />
                  </View>
                ))}
                <View style={s.costBar}>
                  <Text style={s.costText}>{nights > 0 ? `₩${car.price.toLocaleString()} × ${nights}박` : "날짜를 입력하면 요금이 계산됩니다"}</Text>
                  <Text style={[s.costTotal, { color: car.color }]}>{nights > 0 ? `₩${total.toLocaleString()}` : "—"}</Text>
                </View>
                <TouchableOpacity style={[s.submitBtn, { backgroundColor: car.color || "#2d6a4f" }]} onPress={submit}>
                  <Text style={s.submitBtnText}>예약 확정하기 →</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.65)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%", overflow: "hidden" },
  header: { padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  carIcon: { fontSize: 36 },
  carName: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 2 },
  carInfo: { fontSize: 11, color: "rgba(255,255,255,0.82)" },
  closeBtn: { backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 15, width: 30, height: 30, justifyContent: "center", alignItems: "center" },
  closeBtnText: { color: "#fff", fontWeight: "700" },
  body: { flex: 1 },
  field: { marginBottom: 12 },
  lbl: { fontSize: 11, fontWeight: "600", color: "#6b7280", marginBottom: 4 },
  inp: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 9, padding: 10, fontSize: 13, backgroundColor: "#f9fafb" },
  costBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12 },
  costText: { color: "#6b7280", fontSize: 13 },
  costTotal: { fontWeight: "800", fontSize: 20 },
  submitBtn: { borderRadius: 11, padding: 14, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  doneTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  doneDesc: { color: "#6b7280", fontSize: 13, marginBottom: 8 },
  pendingBadge: { backgroundColor: "#fef9c3", borderWidth: 1, borderColor: "#fde047", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  pendingText: { fontSize: 12, color: "#854d0e" },
  receipt: { width: "100%", backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#6ee7b7", borderRadius: 12, padding: 14, marginBottom: 16 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  receiptKey: { color: "#6b7280", fontSize: 13 },
  receiptVal: { fontWeight: "600", fontSize: 13 },
  totalPrice: { fontWeight: "800", fontSize: 18, color: "#059669" },
});
