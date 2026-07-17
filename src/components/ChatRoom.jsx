import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Animated } from "react-native";
import { s } from "../styles/ChatRoom.styles";
import { subscribeInserts } from "../lib/supabase";
import api from "../lib/api";

export default function ChatRoom({ visible, bizno, onClose }) {
  const [step, setStep] = useState("enter"); // "enter" | "chat"
  const [rsvnNo, setRsvnNo] = useState("");
  const [nickname, setNickname] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const panelY = useRef(new Animated.Value(600)).current;
  const unsubRef = useRef(null);
  const lastIdRef = useRef(0);
  const rsvnNoRef = useRef("");
  const myUuid = useRef(null);

  const playNotification = () => {
    if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  };

  const startRealtime = (no) => {
    unsubRef.current?.();
    unsubRef.current = subscribeInserts("tb_usr_chat_msg", `rsvn_no=eq.${no}`, (record) => {
      if (record.uuid === myUuid.current) return; // 내가 보낸 메시지는 낙관적 추가로 이미 표시됨
      lastIdRef.current = record.id;
      setMessages(prev => [...prev, record]);
      playNotification();
    });
  };

  const fetchMissed = async () => {
    const no = rsvnNoRef.current;
    if (!no) return;
    const data = await api.chat.messages(no);
    const fresh = (data || []).filter(m => m.id > lastIdRef.current);
    if (fresh.length > 0) {
      lastIdRef.current = Math.max(...fresh.map(m => m.id));
      setMessages(prev => [...prev, ...fresh]);
      playNotification();
    }
  };

  useEffect(() => {
    Animated.spring(panelY, { toValue: visible ? 0 : 600, useNativeDriver: true, tension: 65, friction: 11 }).start();
    if (step !== "chat" || !rsvnNoRef.current) return;
    if (visible) {
      fetchMissed();       // 닫혀있는 동안 쌓인 메시지 즉시 조회
      startRealtime(rsvnNoRef.current);
    } else {
      unsubRef.current?.(); // 패널 닫으면 WebSocket 구독 해제
    }
  }, [visible]);

  useEffect(() => {
    return () => { unsubRef.current?.(); };
  }, []);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const joinRoom = async () => {
    const no = rsvnNo.trim();
    if (!no) { setError("예약번호를 입력해주세요."); return; }
    setJoining(true);
    setError("");
    myUuid.current = Platform.OS === "web" ? localStorage.getItem("scaneat_uuid") : null;
    const rsvn = await api.reservation.get(no);
    if (!rsvn) {
      setError("예약번호를 찾을 수 없어요.");
      setJoining(false);
      return;
    }
    const msgs = await api.chat.messages(no);
    const loaded = msgs || [];
    lastIdRef.current = loaded.length > 0 ? Math.max(...loaded.map(m => m.id)) : 0;
    rsvnNoRef.current = no;
    setMessages(loaded);
    setStep("chat");
    setJoining(false);
    startRealtime(no);
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text) return;
    const nick = nickname.trim() || "익명";
    const now = new Date().toISOString();
    const newMsg = {
      rsvnNo: rsvnNo.trim(),
      bizRegNo: bizno,
      uuid: myUuid.current,
      nickname: nick,
      message: text,
      regUsrId: "guest",
      regDt: now,
    };
    setMessages(prev => [...prev, newMsg]); // 낙관적 추가 (내 메시지 즉시 표시)
    setInput("");
    await api.chat.send(rsvnNo.trim(), newMsg);
  };

  const fixedBase = Platform.OS === "web" ? { position: "fixed" } : {};

  return (
    <>
      {visible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={[StyleSheet.absoluteFillObject, fixedBase, { zIndex: 299, backgroundColor: "rgba(0,0,0,0.4)" }]}
        />
      )}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[s.panel, fixedBase, { bottom: 0, left: 0, right: 0, zIndex: 300, transform: [{ translateY: panelY }] }]}
      >
        <View style={s.header}>
          <Text style={s.title}>💬 채팅방</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {step === "enter" ? (
          <View style={s.enterBox}>
            <Text style={s.enterDesc}>예약번호를 입력하면{"\n"}같은 예약 인원과 채팅할 수 있어요</Text>
            <TextInput
              style={s.enterInput}
              placeholder="예약번호 (예: 260701-48291)"
              placeholderTextColor="#aaa"
              value={rsvnNo}
              onChangeText={v => { setRsvnNo(v); setError(""); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={s.enterInput}
              placeholder="닉네임 (선택, 기본: 익명)"
              placeholderTextColor="#aaa"
              value={nickname}
              onChangeText={setNickname}
            />
            {!!error && <Text style={s.errorText}>{error}</Text>}
            <TouchableOpacity style={[s.joinBtn, joining && s.joinBtnOff]} onPress={joinRoom} disabled={joining}>
              <Text style={s.joinBtnText}>{joining ? "확인 중..." : "입장하기"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={s.roomBadge}>
              <Text style={s.roomBadgeText}>예약번호 {rsvnNo}  ·  {nickname.trim() || "익명"}</Text>
            </View>
            <ScrollView ref={scrollRef} style={s.msgList} contentContainerStyle={s.msgContent}>
              {messages.length === 0 && (
                <Text style={s.emptyText}>첫 메시지를 보내보세요 👋</Text>
              )}
              {messages.map((m, i) => {
                const isMe = m.uuid && m.uuid === myUuid.current;
                return (
                  <View key={i} style={[s.msgRow, isMe && s.msgRowMe]}>
                    {!isMe && <Text style={s.msgNick}>{m.nickname || "익명"}</Text>}
                    <View style={[s.bubble, isMe && s.bubbleMe]}>
                      <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{m.message}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor="#aaa"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMsg}
                returnKeyType="send"
              />
              <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendBtnOff]} onPress={sendMsg} disabled={!input.trim()}>
                <Text style={s.sendBtnText}>전송</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
}
