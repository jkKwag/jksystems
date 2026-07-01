import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, Platform, ActivityIndicator, Image } from "react-native";
import supabase from "../lib/supabase";

const WELCOME = "안녕하세요! 맛찬들 AI 메뉴 추천 도우미예요 😊\n어떤 음식이 드시고 싶으세요?";
const CONFIRM_ADD_RE = /담아|찜|넣어|네|넵|예|응|그래|좋아|콜|오케이|ok/i;
const DECLINE_RE = /아니|싫어|빼|괜찮|말고|취소/;
// 장바구니 조회는 AI(대화 기록에 영향받아 실제 장바구니와 다르게 답할 수 있음)를
// 거치지 않고 실제 cartItems를 그대로 보여줘서 불일치 가능성을 원천 차단.
// "지워/비워/빼/취소/담아" 등 실제 변경 의도가 섞인 메시지는 AI(마커 처리)로 보내야 하므로 제외
const CART_INQUIRY_RE = /내역|장바구니.*(확인|보여|목록)|뭐.*담|담은.*거|주문.*내역/;
const CART_ACTION_RE = /지워|비워|빼|취소|담아|찜|넣어/;
const RSVN_INQUIRY_RE = /예약.*(확인|조회|내역)|내.*예약|예약.*됐|예약.*어떻/;
const RSVN_CANCEL_RE = /예약.*(취소|철회|삭제)|취소.*예약/;

const generateRsvnNo = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${yy}${mm}${dd}-${rand}`;
};

export default function AiChat({ bizno, tableNo, menuItems = [], cartItems = [], onAddToCart, onRemoveFromCart, onDecrementCart, onClearCart, onRequestCheckout }) {
  const [open, setOpen] = useState(false);
  const [displayMsgs, setDisplayMsgs] = useState([{ role: "assistant", text: WELCOME }]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [pendingReservation, setPendingReservation] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [rsvnStep, setRsvnStep] = useState(null); // null | 'askRsvnNo' | 'askCancelRsvnNo'
  const [showTooltip, setShowTooltip] = useState(false);
  const [listening, setListening] = useState(false);
  const panelY = useRef(new Animated.Value(500)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  const startVoice = () => {
    if (Platform.OS !== "web") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("이 브라우저는 음성인식을 지원하지 않습니다."); return; }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = navigator.language || "ko-KR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => {
      setListening(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    };
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    rec.onend = () => {
      setListening(false);
      micPulse.stopAnimation();
      Animated.timing(micPulse, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    };
    rec.onerror = () => {
      setListening(false);
      micPulse.stopAnimation();
      Animated.timing(micPulse, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    };
    rec.start();
  };

  useEffect(() => {
    setShowTooltip(true);
    Animated.timing(tooltipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(tooltipOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setShowTooltip(false));
    }, 3000);
    return () => clearTimeout(t);
  }, []);

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

    if (pendingItem && CONFIRM_ADD_RE.test(text) && !DECLINE_RE.test(text)) {
      setDisplayMsgs(prev => [...prev, { role: "user", text }]);
      setApiHistory(prev => [...prev, { role: "user", content: text }]);
      setInput("");
      confirmCart();
      return;
    }

    if (CART_INQUIRY_RE.test(text) && !CART_ACTION_RE.test(text)) {
      setDisplayMsgs(prev => [...prev, { role: "user", text }]);
      setApiHistory(prev => [...prev, { role: "user", content: text }]);
      setInput("");
      showCartSummary();
      return;
    }

    if (RSVN_CANCEL_RE.test(text) && rsvnStep === null) {
      setDisplayMsgs(prev => [...prev, { role: "user", text }, { role: "assistant", text: "취소할 예약번호를 입력해 주세요. (예: 260701-48291)" }]);
      setInput("");
      setRsvnStep("askCancelRsvnNo");
      return;
    }

    if (rsvnStep === "askCancelRsvnNo") {
      setDisplayMsgs(prev => [...prev, { role: "user", text }]);
      setInput("");
      setRsvnStep(null);
      await lookupForCancel(text.trim());
      return;
    }

    if (RSVN_INQUIRY_RE.test(text) && rsvnStep === null) {
      setDisplayMsgs(prev => [...prev, { role: "user", text }, { role: "assistant", text: "예약번호를 입력해 주세요. (예: 260701-48291)" }]);
      setInput("");
      setRsvnStep("askRsvnNo");
      return;
    }

    if (rsvnStep === "askRsvnNo") {
      setDisplayMsgs(prev => [...prev, { role: "user", text }]);
      setInput("");
      setRsvnStep(null);
      await lookupReservations(text.trim());
      return;
    }

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
        body: JSON.stringify({ messages: nextHistory, menuContext: menuItems, cartContext: cartItems }),
      });
      const data = await resp.json();
      const cleanText = data.text || "죄송합니다, 오류가 발생했습니다.";
      const actions = data.actions || [];

      let found = null;
      let hasCheckout = false;
      for (const action of actions) {
        if (action.name === "recommend_item") {
          const { id, name, price } = action.args || {};
          found = menuItems.find(m => m.id === id) || { id, name, price };
        } else if (action.name === "remove_item") {
          const { id, quantity } = action.args || {};
          if (id) {
            if (quantity > 0) onDecrementCart?.(id, quantity);
            else onRemoveFromCart?.(id);
          }
        } else if (action.name === "clear_cart") {
          onClearCart?.();
        } else if (action.name === "request_checkout") {
          hasCheckout = true;
        } else if (action.name === "request_reservation") {
          const { guest_name, guest_phone, party_size, datetime, req_cont } = action.args || {};
          if (guest_name && guest_phone && party_size && datetime) {
            const alreadyConsented = Platform.OS === "web"
              ? !!localStorage.getItem(`rsvn_cns_${guest_phone}`)
              : false;
            setPendingReservation({ guestName: guest_name, guestPhone: guest_phone, partySize: party_size, datetime, reqCont: req_cont || "", skipConsent: alreadyConsented });
          }
        }
      }

      const imageUrl = found?.image || null;

      setDisplayMsgs(prev => [...prev, { role: "assistant", text: cleanText, imageUrl, itemName: found?.name || null }]);
      setApiHistory(prev => [...prev, { role: "assistant", content: cleanText }]);
      if (found) setPendingItem(found);
      if (hasCheckout && cartItems.length > 0) {
        setOpen(false);
        onRequestCheckout?.();
      }
    } catch {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "죄송합니다, 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  };

  const lookupReservations = async (rsvnNo) => {
    const { data, error } = await supabase
      .from("tb_usr_rsvn")
      .select("*")
      .eq("biz_reg_no", bizno)
      .eq("rsvn_no", rsvnNo)
      .order("reg_dt", { ascending: false });

    if (error || !data) {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "조회 중 오류가 발생했어요. 다시 시도해 주세요." }]);
      return;
    }
    if (data.length === 0) {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "해당 예약번호로 등록된 예약이 없어요." }]);
      return;
    }
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: "예약 내역이에요.", reservations: data }]);
  };

  const lookupForCancel = async (rsvnNo) => {
    const { data, error } = await supabase
      .from("tb_usr_rsvn")
      .select("*")
      .eq("biz_reg_no", bizno)
      .eq("rsvn_no", rsvnNo)
      .order("reg_dt", { ascending: false });

    if (error || !data) {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "조회 중 오류가 발생했어요. 다시 시도해 주세요." }]);
      return;
    }
    if (data.length === 0) {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "해당 예약번호로 등록된 예약이 없어요." }]);
      return;
    }
    const rsvn = data[0];
    if (rsvn.status === "cancelled") {
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: "이미 취소된 예약이에요." }]);
      return;
    }
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: "아래 예약을 취소할까요?" }]);
    setPendingCancel(rsvn);
  };

  const cancelReservation = async () => {
    if (!pendingCancel) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tb_usr_rsvn")
      .update({ status: "cancelled", mdf_usr_id: "guest", mdf_dt: now })
      .eq("rsvn_no", pendingCancel.rsvn_no)
      .eq("biz_reg_no", bizno);

    const resultText = error
      ? "취소 처리 중 오류가 발생했어요. 다시 시도해 주세요."
      : `예약(${pendingCancel.rsvn_no})이 취소됐어요.`;
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: resultText }]);
    setApiHistory(prev => [...prev, { role: "assistant", content: resultText }]);
    setPendingCancel(null);
  };

  const showCartSummary = () => {
    const summaryText = cartItems.length === 0
      ? "장바구니가 비어있어요."
      : cartItems.map(c => `- ${c.item.name} x${c.quantity} (₩${(c.item.price * c.quantity).toLocaleString()})`).join("\n")
        + `\n\n총 ₩${cartItems.reduce((sum, c) => sum + c.item.price * c.quantity, 0).toLocaleString()}`;
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: summaryText }]);
    setApiHistory(prev => [...prev, { role: "assistant", content: summaryText }]);
  };

  const confirmCart = () => {
    if (!pendingItem) return;
    onAddToCart?.(pendingItem);
    const confirmText = `${pendingItem.name}을(를) 장바구니에 담았어요! 🛒\n다른 메뉴도 추천해드릴까요?`;
    setDisplayMsgs(prev => [...prev, { role: "assistant", text: confirmText }]);
    setApiHistory(prev => [...prev, { role: "assistant", content: confirmText }]);
    setPendingItem(null);
  };

  const confirmReservation = async () => {
    if (!pendingReservation) return;
    const now = new Date().toISOString();
    const rsvnNo = generateRsvnNo();
    if (!pendingReservation.skipConsent) {
      await supabase.from("tb_usr_prv_cns").insert({
        guest_name: pendingReservation.guestName,
        guest_phone: pendingReservation.guestPhone,
        consent_at: now,
        reg_usr_id: "guest",
        reg_dt: now,
      });
      if (Platform.OS === "web") {
        localStorage.setItem(`rsvn_cns_${pendingReservation.guestPhone}`, now);
      }
    }
    const { error } = await supabase.from("tb_usr_rsvn").insert({
      biz_reg_no: bizno,
      table_no: tableNo,
      rsvn_no: rsvnNo,
      guest_name: pendingReservation.guestName,
      guest_phone: pendingReservation.guestPhone,
      party_size: pendingReservation.partySize,
      reserved_at: pendingReservation.datetime,
      req_cont: pendingReservation.reqCont || null,
      status: "pending",
      reg_usr_id: "guest",
      reg_dt: now,
    });
    if (error) {
      console.error("[예약 insert 실패]", JSON.stringify(error));
      const errDetail = error?.message || error?.details || error?.hint || JSON.stringify(error);
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: `예약 신청 중 오류가 발생했어요.\n(${errDetail})` }]);
      setApiHistory(prev => [...prev, { role: "assistant", content: "예약 신청 중 오류가 발생했어요." }]);
    } else {
      const successText = "예약 신청이 완료됐어요! 사장님 승인 후 확정 안내 드릴게요 😊";
      setDisplayMsgs(prev => [...prev, { role: "assistant", text: successText, rsvnNo }]);
      setApiHistory(prev => [...prev, { role: "assistant", content: `${successText}\n예약번호: ${rsvnNo}` }]);
    }
    setPendingReservation(null);
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
        <View style={[s.panelHeader, Platform.OS === "web" && { background: "linear-gradient(135deg, #f97316 0%, #0f172a 100%)" }]}>
          <View>
            <Text style={s.panelTitle}>✦ AI 메뉴 추천</Text>
            <Text style={s.panelSub}>맛찬들 도우미</Text>
          </View>
          <TouchableOpacity style={s.xBtn} onPress={() => setOpen(false)}>
            <Text style={s.xBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} style={s.msgList} contentContainerStyle={s.msgContent}>
          {displayMsgs.map((msg, i) => (
            <View key={i}>
              <View style={[s.bubble, msg.role === "user" ? s.bubbleUser : s.bubbleAi]}>
                {msg.imageUrl && (
                  <Image source={{ uri: msg.imageUrl }} style={s.msgImage} resizeMode="cover" />
                )}
                {msg.itemName && (
                  <Text style={s.msgItemName}>{msg.itemName}</Text>
                )}
                <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>{msg.text}</Text>
              </View>
              {msg.rsvnNo && (
                <View style={s.rsvnNoCard}>
                  <Text style={s.rsvnNoLabel}>예약번호</Text>
                  <Text style={s.rsvnNoValue}>{msg.rsvnNo}</Text>
                  <Text style={s.rsvnNoHint}>예약 조회 시 필요하니 메모해 두세요!</Text>
                </View>
              )}
              {msg.reservations && msg.reservations.map((r, j) => (
                <View key={j} style={s.rsvnCard}>
                  <View style={s.rsvnCardHeader}>
                    <Text style={[
                      s.rsvnCardStatus,
                      r.status === "approved" && s.rsvnStatusApproved,
                      r.status === "rejected" && s.rsvnStatusRejected,
                      r.status === "cancelled" && s.rsvnStatusCancelled,
                    ]}>
                      {r.status === "pending" ? "대기중 ⏳" : r.status === "approved" ? "승인 ✅" : r.status === "cancelled" ? "취소됨 🚫" : "거절 ❌"}
                    </Text>
                  </View>
                  <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>예약번호</Text><Text style={[s.rsvnCardValue, { fontFamily: Platform.OS === "web" ? "monospace" : undefined }]}>{r.rsvn_no}</Text></View>
                  <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>예약일시</Text><Text style={s.rsvnCardValue}>{r.reserved_at}</Text></View>
                  <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>예약자</Text><Text style={s.rsvnCardValue}>{r.guest_name}</Text></View>
                  <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>예약인원</Text><Text style={s.rsvnCardValue}>{r.party_size}명</Text></View>
                  {!!r.req_cont && (
                    <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>요청사항</Text><Text style={s.rsvnCardValue}>{r.req_cont}</Text></View>
                  )}
                  {r.status === "rejected" && !!r.reject_rsn && (
                    <View style={s.rsvnCardRow}><Text style={s.rsvnCardLabel}>거절사유</Text><Text style={[s.rsvnCardValue, s.rsvnCardValueRed]}>{r.reject_rsn}</Text></View>
                  )}
                </View>
              ))}
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
          {pendingReservation && (
            <View style={s.consentCard}>
              {pendingReservation.skipConsent ? (
                <>
                  <Text style={s.consentTitle}>📅 예약 신청 확인</Text>
                  <Text style={s.consentNote}>✓ 개인정보 수집·이용에 이미 동의하셨습니다.</Text>
                </>
              ) : (
                <>
                  <Text style={s.consentTitle}>📋 개인정보 수집·이용 동의</Text>
                  <View style={s.consentBody}>
                    <Text style={s.consentRow}>· 수집항목: 이름, 전화번호</Text>
                    <Text style={s.consentRow}>· 수집목적: 예약 확인 및 승인 안내</Text>
                    <Text style={s.consentRow}>· 보유기간: 예약일로부터 7일 후 삭제</Text>
                    <Text style={s.consentNote}>※ 동의 거부 시 예약 서비스 이용이 제한됩니다.</Text>
                  </View>
                </>
              )}
              <View style={s.consentSummary}>
                <Text style={s.consentSummaryText}>{pendingReservation.guestName} · {pendingReservation.guestPhone}</Text>
                <Text style={s.consentSummaryText}>{pendingReservation.partySize}명 · {pendingReservation.datetime}</Text>
                {!!pendingReservation.reqCont && (
                  <Text style={s.consentSummaryText}>요청: {pendingReservation.reqCont}</Text>
                )}
              </View>
              <View style={s.cartCardBtns}>
                <TouchableOpacity style={s.noBtn} onPress={() => setPendingReservation(null)}>
                  <Text style={s.noBtnText}>{pendingReservation.skipConsent ? "취소" : "동의 안함"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.yesBtn} onPress={confirmReservation}>
                  <Text style={s.yesBtnText}>{pendingReservation.skipConsent ? "✓ 예약 신청" : "✓ 동의하고 예약"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {pendingCancel && (
            <View style={s.cancelCard}>
              <Text style={s.cancelCardTitle}>🚫 예약 취소 확인</Text>
              <View style={s.consentSummary}>
                <Text style={s.consentSummaryText}>예약번호: {pendingCancel.rsvn_no}</Text>
                <Text style={s.consentSummaryText}>{pendingCancel.guest_name} · {pendingCancel.party_size}명</Text>
                <Text style={s.consentSummaryText}>{pendingCancel.reserved_at}</Text>
                {!!pendingCancel.req_cont && <Text style={s.consentSummaryText}>요청: {pendingCancel.req_cont}</Text>}
              </View>
              <Text style={s.cancelCardWarning}>취소 후에는 되돌릴 수 없습니다.</Text>
              <View style={s.cartCardBtns}>
                <TouchableOpacity style={s.noBtn} onPress={() => setPendingCancel(null)}>
                  <Text style={s.noBtnText}>돌아가기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={cancelReservation}>
                  <Text style={s.yesBtnText}>예약 취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={s.inputRow}>
          <Animated.View style={{ transform: [{ scale: micPulse }] }}>
            <TouchableOpacity style={[s.micBtn, listening && s.micBtnOn]} onPress={startVoice}>
              <Text style={s.micBtnText}>{listening ? "🔴" : "🎤"}</Text>
            </TouchableOpacity>
          </Animated.View>
          <TextInput
            style={s.input}
            placeholder={listening ? "듣고 있어요..." : "메시지를 입력하세요..."}
            placeholderTextColor={listening ? "#f97316" : "#aaa"}
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

      {showTooltip && (
        <Animated.View style={[
          s.tooltip,
          fixedBase,
          { bottom: 216, right: 20, zIndex: 201, opacity: tooltipOpacity },
        ]}>
          <Text style={s.tooltipText}>AI에게 메뉴 추천받아보세요! 👆</Text>
          <View style={s.tooltipArrow} />
        </Animated.View>
      )}

      <TouchableOpacity
        style={[s.fab, fixedBase, { bottom: 160, right: 20, zIndex: 200 }]}
        onPress={() => setOpen(true)}
      >
        <Text style={s.fabText}>✦ AI 주문</Text>
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  panel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },

  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#f97316" },
  panelTitle: { fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: -0.3 },
  panelSub: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  xBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
  xBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },

  msgList: { flex: 1, backgroundColor: "#fff" },
  msgContent: { padding: 14, paddingBottom: 8, gap: 8 },

  msgImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 6 },
  msgItemName: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 4 },
  bubble: { maxWidth: "80%", borderRadius: 16, padding: 12 },
  bubbleAi: { backgroundColor: "#f3f4f6", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: "#f97316", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: "#222", lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },

  cartCard: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#f97316", borderRadius: 14, padding: 14, alignSelf: "stretch" },
  cartCardLabel: { fontSize: 10, fontWeight: "800", color: "#f97316", marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" },
  cartCardName: { fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 2 },
  cartCardPrice: { fontSize: 13, fontWeight: "700", color: "#f97316", marginBottom: 10 },
  cartCardBtns: { flexDirection: "row", gap: 8 },
  noBtn: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  noBtnText: { fontSize: 13, fontWeight: "700", color: "#888" },
  yesBtn: { flex: 1, backgroundColor: "#f97316", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  yesBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  rsvnCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginTop: 6, alignSelf: "stretch" },
  rsvnCardHeader: { marginBottom: 8 },
  rsvnCardStatus: { fontSize: 12, fontWeight: "800", color: "#f97316" },
  rsvnStatusApproved: { color: "#16a34a" },
  rsvnStatusRejected: { color: "#dc2626" },
  rsvnStatusCancelled: { color: "#6b7280" },
  rsvnCardRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rsvnCardLabel: { fontSize: 12, color: "#888", width: 60 },
  rsvnCardValue: { fontSize: 12, fontWeight: "600", color: "#111", flex: 1 },
  rsvnCardValueRed: { color: "#dc2626" },

  cancelCard: { backgroundColor: "#fff5f5", borderWidth: 1.5, borderColor: "#dc2626", borderRadius: 14, padding: 14, alignSelf: "stretch" },
  cancelCardTitle: { fontSize: 13, fontWeight: "800", color: "#dc2626", marginBottom: 8 },
  cancelCardWarning: { fontSize: 11, color: "#dc2626", marginBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: "#dc2626", borderRadius: 8, paddingVertical: 8, alignItems: "center" },

  rsvnNoCard: { backgroundColor: "#0f172a", borderRadius: 12, padding: 14, marginTop: 6, alignSelf: "stretch", alignItems: "center" },
  rsvnNoLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  rsvnNoValue: { fontSize: 22, fontWeight: "900", color: "#f97316", letterSpacing: 2, fontFamily: Platform.OS === "web" ? "monospace" : undefined },
  rsvnNoHint: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 6 },

  consentCard: { backgroundColor: "#f8faff", borderWidth: 1.5, borderColor: "#3b82f6", borderRadius: 14, padding: 14, alignSelf: "stretch" },
  consentTitle: { fontSize: 13, fontWeight: "800", color: "#1d4ed8", marginBottom: 8 },
  consentBody: { gap: 3, marginBottom: 10 },
  consentRow: { fontSize: 12, color: "#374151", lineHeight: 18 },
  consentNote: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  consentSummary: { backgroundColor: "#eff6ff", borderRadius: 8, padding: 8, marginBottom: 10, gap: 2 },
  consentSummaryText: { fontSize: 12, fontWeight: "700", color: "#1e40af" },

  inputRow: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#f0f0f0", backgroundColor: "#fff", alignItems: "center" },
  micBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  micBtnOn: { backgroundColor: "#fff0f0" },
  micBtnText: { fontSize: 16 },
  input: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#111" },
  sendBtn: { backgroundColor: "#f97316", borderRadius: 22, paddingHorizontal: 16, justifyContent: "center" },
  sendBtnOff: { backgroundColor: "#e5e7eb" },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  tooltip: { backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  tooltipText: { color: "#fff", fontSize: 13, fontWeight: "700", whiteSpace: "nowrap" },
  tooltipArrow: { position: "absolute", bottom: -6, right: 22, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#0f172a" },

  fab: { height: 48, borderRadius: 24, backgroundColor: "#f97316", justifyContent: "center", alignItems: "center", paddingHorizontal: 20, shadowColor: "#f97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  fabText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
