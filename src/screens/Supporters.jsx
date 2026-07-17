import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../styles/Supporters.styles";
import api from "../lib/api";

export default function Supporters({ isAdmin }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", message: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.supporters.list().then((data) => {
      setList(data || []);
      setLoading(false);
    });
  }, []);

  const totalAmount = list.reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.amount.trim()) return;
    setSaving(true);
    const { error } = await api.supporters.post({ name: form.name.trim(), amount: parseInt(form.amount, 10), message: form.message.trim() || null });
    if (!error) {
      const data = await api.supporters.list();
      setList(data || []);
      setForm({ name: "", amount: "", message: "" });
      setShowForm(false);
    }
    setSaving(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 요약 카드 */}
      <View style={s.summaryCard}>
        <View style={s.summaryItem}>
          <Text style={s.summaryNum}>{list.length}</Text>
          <Text style={s.summaryLabel}>후원자 수</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={s.summaryNum}>₩{totalAmount.toLocaleString()}</Text>
          <Text style={s.summaryLabel}>총 후원금</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>💝 후원자 명단</Text>

      {/* 관리자 등록 버튼 */}
      {isAdmin && !showForm && (
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
          <Text style={s.addBtnText}>+ 후원자 등록</Text>
        </TouchableOpacity>
      )}

      {/* 등록 폼 */}
      {showForm && (
        <View style={s.formCard}>
          <TextInput style={s.inp} placeholder="이름" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />
          <TextInput style={s.inp} placeholder="금액 (숫자만)" keyboardType="numeric" value={form.amount} onChangeText={v => setForm(p => ({ ...p, amount: v }))} />
          <TextInput style={s.inp} placeholder="한마디 (선택)" value={form.message} onChangeText={v => setForm(p => ({ ...p, message: v }))} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: "#eee" }]} onPress={() => setShowForm(false)}>
              <Text style={{ color: "#555", fontWeight: "700" }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={handleAdd} disabled={saving}>
              <Text style={s.btnText}>{saving ? "저장중..." : "등록"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 목록 */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : list.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>아직 후원자가 없습니다</Text>
          <Text style={s.emptySubText}>첫 번째 후원자가 되어주세요 🙏</Text>
        </View>
      ) : (
        list.map((s2, i) => (
          <View key={s2.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.rank}>{i + 1}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.name}>{s2.name}</Text>
              {s2.message ? <Text style={s.message}>"{s2.message}"</Text> : null}
              <Text style={s.date}>{(s2.created_at || "").slice(0, 10)}</Text>
            </View>
            <Text style={s.amount}>₩{(s2.amount || 0).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
