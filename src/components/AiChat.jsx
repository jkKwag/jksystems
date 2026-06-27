import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, Platform, ActivityIndicator } from "react-native";

const WELCOME = "안녕하세요! 맛찬들 AI 메뉴 추천 도우미예요 😊\n어떤 음식이 드시고 싶으세요?";

export default function AiChat({ menuItems = [], onAddToCart }) {
  const [open, setOpen] = useState(false);
  const [displayMsgs, setDisplayMsgs] = useState([{ role: "assistant", text: WELCOME }]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const panelY = useRef(new Animated.Value(500)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.spring(panelY, {
      toValue: open ? 0 : 500,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [displayMsgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextHistory = [...apiHistory, { role: "user", content: text }];
    setDisplayMsgs(prev => [...prev, { role: "user", text }]);
    setApiHistory(nextHistory);
    setInput("");
    setLoading(true);
    setPendingItem(null);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory, menuContext: menuItems }),
      });
      const data = await resp.json();
      const raw = data.text || "죄송합니다, 오류가 발생했습니다.";

      const itemMatch = raw.match(/%%ITEM%%(\{.*?\})%%END%%/s);
      let found = null;
      if (itemMatch) {
        try {
          const parsed = JSON.parse(itemMatch[1]);
          found = menuItems.find(m => m.id === parsed.id) || { id: parsed.id, name: parsed.name, price: parsed.price };
        } catch {}
      }

      const cleanText = raw.replace(/%%ITEM%%.*?%%END%%/gs, "").trim();
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: cleanText }]);
      setApiHistory(prev => [...prev, { role: "assistant", content: cleanText }]);
      if (found) setPendingItem(found);
    } catch {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "죄송합니다, 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmCart = () => {
    if (!pendingItem) return;
    onAddToCart?.(pendingItem);
    const confirmText = `${pendingItem.name}을(를) 장바구니에 담았어요! 🛒\n다른 메뉴도 추천해드릴까요?`;
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: confirmText }]);
    setApiHistory(prev => [...prev, { role: "assistant", content: confirmText }]);
    setPendingItem(null);
  };

  const fixedBase = Platform.OS === "web" ? { position: "fixed" } : {};

  return (
    <>
      {open && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          style={[
            StyleSheet.absoluteFillObject,
            fixedBase,
            { zIndex: 299, backgroundColor: "rgba(0,0,0,0.4)" },
          ]}
        />
      )}

      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          s.panel,
          fixedBase,
          { bottom: 0, left: 0, right: 0, zIndex: 300, transform: [{ translateY: panelY }] },
        ]}
      >
        <View style={s.panelHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={s.panelTitle}>AI 메뉴 추천</Text>
            <View style={s.betaBadge}><Text style={s.betaBadgeText}>BETA</Text></View>
          </View>
          <TouchableOpacity style={s.xBtn} onPress={() => setOpen(false)}>
            <Text style={s.xBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} style={s.msgList} contentContainerStyle={s.msgContent}>
          {displayMsgs.map((msg, i) => (
            <View key={i} style={[s.bubble, msg.role === "user" ? s.bubbleUser : s.bubbleAi]}>
              <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>{msg.text}</Text>
            </View>
          ))}
          {loading && (
            <View style={[s.bubble, s.bubbleAi]}>
              <ActivityIndicator size="small" color="#16a34a" />
            </View>
          )}
          {pendingItem && (
            <View style={s.cartCard}>
              <Text style={s.cartCardLabel}>장바구니에 담을까요?</Text>
              <Text style={s.cartCardName}>{pendingItem.name}</Text>
              <Text style={s.cartCardPrice}>₩{(pendingItem.price || 0).toLocaleString()}</Text>
              <View style={s.cartCardBtns}>
                <TouchableOpacity style={s.noBtn} onPress={() => setPendingItem(null)}>
                  <Text style={s.noBtnText}>아니요</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.yesBtn} onPress={confirmCart}>
                  <Text style={s.yesBtnText}>🛒 담기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnOff]}
            onPress={send}
            disabled={!input.trim() || loading}
          >
            <Text style={s.sendBtnText}>전송</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={[s.fab, fixedBase, { bottom: 76, right: 20, zIndex: 200 }]}
        onPress={() => setOpen(true)}
      >
        <Text style={s.fabText}>✦ AI 추천</Text>
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  panel: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },

  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#2a2a2a", backgroundColor: "#111" },
  panelTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  betaBadge: { backgroundColor: "#f97316", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  betaBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  xBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#2a2a2a", justifyContent: "center", alignItems: "center" },
  xBtnText: { fontSize: 13, color: "#aaa", fontWeight: "700" },

  msgList: { flex: 1, backgroundColor: "#1a1a1a" },
  msgContent: { padding: 14, paddingBottom: 8, gap: 8 },

  bubble: { maxWidth: "80%", borderRadius: 16, padding: 12 },
  bubbleAi: { backgroundColor: "#2a2a2a", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: "#f97316", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: "#eee", lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },

  cartCard: { backgroundColor: "#2a2a2a", borderWidth: 1.5, borderColor: "#f97316", borderRadius: 14, padding: 14, alignSelf: "flex-start", maxWidth: "80%" },
  cartCardLabel: { fontSize: 10, fontWeight: "800", color: "#f97316", marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" },
  cartCardName: { fontSize: 15, fontWeight: "800", color: "#fff", marginBottom: 2 },
  cartCardPrice: { fontSize: 13, fontWeight: "700", color: "#f97316", marginBottom: 10 },
  cartCardBtns: { flexDirection: "row", gap: 8 },
  noBtn: { flex: 1, borderWidth: 1, borderColor: "#444", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  noBtnText: { fontSize: 13, fontWeight: "700", color: "#aaa" },
  yesBtn: { flex: 1, backgroundColor: "#f97316", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  yesBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  inputRow: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#2a2a2a", backgroundColor: "#111" },
  input: { flex: 1, backgroundColor: "#2a2a2a", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#eee" },
  sendBtn: { backgroundColor: "#f97316", borderRadius: 22, paddingHorizontal: 16, justifyContent: "center" },
  sendBtnOff: { backgroundColor: "#333" },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  fab: { height: 48, borderRadius: 24, backgroundColor: "#f97316", justifyContent: "center", alignItems: "center", paddingHorizontal: 20, shadowColor: "#f97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  fabText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
