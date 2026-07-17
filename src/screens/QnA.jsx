import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { s } from "../styles/QnA.styles";
import api from "../lib/api";

export default function QnA({ isAdmin }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", author: "" });
  const [open, setOpen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [answerText, setAnswerText] = useState({});

  useEffect(() => {
    api.qna.list().then((data) => {
      setPosts(data || []);
      setLoading(false);
    });
  }, []);

  const submitAnswer = async (id) => {
    const text = answerText[id];
    if (!text) return Alert.alert("알림", "답변 내용을 입력해주세요.");
    const { error } = await api.qna.answer(id, { answer: text });
    if (error) { Alert.alert("오류", "답변 등록 중 오류가 발생했습니다."); return; }
    setPosts(posts.map(p => p.id === id ? { ...p, answer: text } : p));
    setAnswerText(prev => ({ ...prev, [id]: "" }));
  };

  const submit = async () => {
    if (!form.title || !form.content || !form.author) return Alert.alert("알림", "모든 항목을 입력해주세요.");
    const { error } = await api.qna.post({ title: form.title, content: form.content, author: form.author });
    if (error) { Alert.alert("오류", "등록 중 오류가 발생했습니다."); return; }
    setPosts([{ id: Date.now(), title: form.title, author: form.author, answer: null, created_at: new Date().toISOString() }, ...posts]);
    setForm({ title: "", content: "", author: "" });
    setShowForm(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Q&A</Text>
      <Text style={s.desc}>궁금한 점을 남겨주세요. 빠르게 답변 드리겠습니다.</Text>
      <TouchableOpacity style={s.outlineBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={s.outlineBtnText}>{showForm ? "✕ 닫기" : "✏️ 문의 작성"}</Text>
      </TouchableOpacity>
      {showForm && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>새 문의 작성</Text>
          <TextInput style={s.inp} placeholder="작성자 이름" value={form.author} onChangeText={v => setForm(f => ({ ...f, author: v }))} />
          <TextInput style={s.inp} placeholder="제목" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
          <TextInput style={[s.inp, s.textarea]} placeholder="문의 내용" value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} multiline numberOfLines={4} />
          <TouchableOpacity style={s.solidBtn} onPress={submit}>
            <Text style={s.solidBtnText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#1d3557" style={{ marginTop: 40 }} />
      ) : posts.map((p) => (
        <View key={p.id} style={[s.card, { borderLeftColor: open === p.id ? "#1d3557" : "transparent" }]}>
          <TouchableOpacity style={s.cardTop} onPress={() => setOpen(open === p.id ? null : p.id)}>
            <View style={s.cardLeft}>
              <View style={[s.tag, { backgroundColor: p.answer ? "#dcfce7" : "#fef9c3" }]}>
                <Text style={[s.tagText, { color: p.answer ? "#166534" : "#854d0e" }]}>{p.answer ? "답변완료" : "대기중"}</Text>
              </View>
              <Text style={s.cardTitle} numberOfLines={1}>{p.title}</Text>
            </View>
            <View style={s.cardRight}>
              <Text style={s.meta}>{p.author}</Text>
              <Text style={s.meta}>{(p.created_at || "").slice(0, 10)}</Text>
              <Text style={s.meta}>{open === p.id ? "▲" : "▼"}</Text>
            </View>
          </TouchableOpacity>
          {open === p.id && (
            <View style={s.answerBox}>
              {p.answer ? (
                <Text style={s.answerText}><Text style={s.answerLabel}>A. </Text>{p.answer}</Text>
              ) : (
                <Text style={s.noAnswer}>답변 준비 중입니다. 빠른 시일 내에 답변 드리겠습니다.</Text>
              )}
              {isAdmin && !p.answer && (
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    style={[s.inp, s.textarea, { marginBottom: 8 }]}
                    placeholder="답변 내용 입력"
                    value={answerText[p.id] || ""}
                    onChangeText={v => setAnswerText(prev => ({ ...prev, [p.id]: v }))}
                    multiline numberOfLines={3}
                  />
                  <TouchableOpacity style={s.solidBtn} onPress={() => submitAnswer(p.id)}>
                    <Text style={s.solidBtnText}>답변 등록</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
