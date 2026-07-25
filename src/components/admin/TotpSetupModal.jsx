import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image } from "react-native";
import QRCode from "qrcode";
import { s } from "../../styles/admin/AdminAccounts.styles";
import api from "../../lib/api";

// SUPER 계정 전용 TOTP(구글 OTP 등) 2단계 인증 등록 모달 — 사이드바, 계정 관리 화면 등
// 여러 곳에서 재사용할 수 있도록 상태를 컴포넌트 내부에 캡슐화했다.
export default function TotpSetupModal({ visible, onClose, onSuccess }) {
  const [totpSecret, setTotpSecret] = useState(null);
  const [totpQrDataUrl, setTotpQrDataUrl] = useState(null);
  const [totpSetupCode, setTotpSetupCode] = useState("");
  const [totpBusy, setTotpBusy] = useState(false);
  const [totpError, setTotpError] = useState("");
  const [showManualKey, setShowManualKey] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setTotpSecret(null);
    setTotpQrDataUrl(null);
    setTotpSetupCode("");
    setTotpError("");
    setShowManualKey(false);
    api.admin.totpSetup().then(async ({ data, error }) => {
      if (cancelled) return;
      if (error || !data) { setTotpError(error?.message || "비밀키 발급에 실패했습니다."); return; }
      setTotpSecret(data.secret);
      try {
        const dataUrl = await QRCode.toDataURL(data.otpauthUri);
        if (!cancelled) setTotpQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setShowManualKey(true); // QR 생성에 실패해도 수동 입력으로는 등록할 수 있게
      }
    });
    return () => { cancelled = true; };
  }, [visible]);

  const confirmTotpSetup = async () => {
    if (totpSetupCode.length !== 6) { setTotpError("6자리 코드를 입력해주세요."); return; }
    setTotpBusy(true); setTotpError("");
    const { error } = await api.admin.totpConfirm({ secret: totpSecret, code: totpSetupCode });
    setTotpBusy(false);
    if (error) { setTotpError(error?.message || "인증 코드가 올바르지 않습니다."); return; }
    onSuccess?.();
  };

  if (!visible) return null;

  // 인증 앱에서 읽기 쉽게 4글자씩 띄어서 보여줌 (저장/전송 값 자체는 원본 그대로 사용)
  const formattedSecret = totpSecret ? totpSecret.match(/.{1,4}/g).join(" ") : "";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.pwOverlay}>
        <View style={s.pwCard}>
          <Text style={s.pwTitle}>2단계 인증(TOTP) 설정</Text>

          {totpSecret ? (
            <>
              <Text style={s.pwFieldHint}>
                구글 OTP(Google Authenticator) 등 인증 앱으로 아래 QR코드를 스캔한 뒤,
                앱에 뜬 6자리 코드를 입력해주세요.
              </Text>
              {totpQrDataUrl && (
                <View style={{ alignItems: "center", marginVertical: 12 }}>
                  <Image source={{ uri: totpQrDataUrl }} style={{ width: 200, height: 200 }} />
                </View>
              )}
              <TouchableOpacity onPress={() => setShowManualKey(v => !v)}>
                <Text style={[s.pwFieldHint, { textAlign: "center", textDecorationLine: "underline" }]}>
                  {showManualKey ? "키 숨기기" : "QR을 스캔할 수 없나요? 직접 입력하기"}
                </Text>
              </TouchableOpacity>
              {showManualKey && (
                <View style={s.pwFieldWrap}>
                  <Text style={[s.pwInput, { textAlign: "center", letterSpacing: 2 }]} selectable>
                    {formattedSecret}
                  </Text>
                </View>
              )}
              <View style={s.pwFieldWrap}>
                <TextInput
                  style={s.pwInput}
                  placeholder="인증 앱의 6자리 코드"
                  placeholderTextColor="#94a3b8"
                  value={totpSetupCode}
                  onChangeText={(v) => setTotpSetupCode(v.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              {!!totpError && <Text style={s.pwFieldError}>{totpError}</Text>}
              <View style={s.pwBtnRow}>
                <TouchableOpacity style={s.pwCancelBtn} onPress={onClose} disabled={totpBusy}>
                  <Text style={s.pwCancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.pwConfirmBtn} onPress={confirmTotpSetup} disabled={totpBusy}>
                  {totpBusy
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.pwConfirmBtnText}>등록하기</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : totpError ? (
            <>
              <Text style={s.pwFieldError}>{totpError}</Text>
              <View style={s.pwBtnRow}>
                <TouchableOpacity style={s.pwCancelBtn} onPress={onClose}>
                  <Text style={s.pwCancelBtnText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#f97316" />
          )}
        </View>
      </View>
    </Modal>
  );
}
