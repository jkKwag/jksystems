import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Image, Platform } from "react-native";
import { s } from "../../styles/admin/AccessQrModal.styles";
import api from "../../lib/api";

const MENU_BASE_URL = "https://www.jkscaneat.com/menu";

// 직원이 특정 손님에게만 보여주는 단기 QR — 손님이 이 화면(태블릿/직원폰)의 QR을
// 자기 폰 카메라로 직접 스캔해야 하므로, 저장된 링크를 재사용하는 방식으로는 발급받을 수 없다.
export default function AccessQrModal({ visible, bizRegNo, seat, onClose }) {
  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingSec, setRemainingSec] = useState(0);
  const tickRef = useRef(null);

  const issue = useCallback(async () => {
    if (!bizRegNo || !seat?.seatCd) return;
    setLoading(true);
    setError("");
    const { data, error: issueError } = await api.biz.issueAccessToken(bizRegNo, seat.seatCd);
    setLoading(false);
    if (issueError || !data) {
      setError("QR 발급에 실패했습니다. 다시 시도해주세요.");
      setToken(null);
      setExpiresAt(null);
      return;
    }
    setToken(data.token);
    setExpiresAt(data.expiresAt);
  }, [bizRegNo, seat?.seatCd]);

  useEffect(() => {
    if (!visible) return;
    setToken(null);
    setExpiresAt(null);
    setError("");
    issue();
  }, [visible, issue]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!expiresAt) { setRemainingSec(0); return; }
    const update = () => {
      const sec = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSec(sec);
    };
    update();
    tickRef.current = setInterval(update, 1000);
    return () => clearInterval(tickRef.current);
  }, [expiresAt]);

  if (!visible) return null;

  const expired = !!expiresAt && remainingSec <= 0;
  const qrTargetUrl = (token && seat?.seatCd)
    ? `${MENU_BASE_URL}/${bizRegNo}?table=${seat.seatCd}&grant=${token}`
    : null;
  const qrUri = (qrTargetUrl && !expired)
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrTargetUrl)}`
    : null;

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  const downloadQr = async () => {
    if (Platform.OS !== "web" || !qrUri) return;
    try {
      const res = await fetch(qrUri);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const safeSeatNm = (seat?.seatNm || "").trim().replace(/[\\/:*?"<>|]/g, "_") || seat?.seatCd || "seat";
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${bizRegNo}_${safeSeatNm}_손님QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUri, "_blank");
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>손님 주문허용 QR</Text>
          <Text style={s.subtitle}>{seat?.seatNm} · 이 화면을 손님에게 보여주고 카메라로 직접 스캔하게 해주세요.</Text>

          <View style={s.qrBox}>
            {loading ? (
              <ActivityIndicator color="#f97316" size="large" />
            ) : error ? (
              <Text style={s.errorText}>{error}</Text>
            ) : expired ? (
              <View style={s.expiredBox}>
                <Text style={s.expiredText}>QR이 만료되었습니다</Text>
              </View>
            ) : qrUri ? (
              <TouchableOpacity onPress={downloadQr} activeOpacity={0.8} style={s.qrTouchable}>
                <Image source={{ uri: qrUri }} style={s.qrImage} resizeMode="contain" />
              </TouchableOpacity>
            ) : null}
          </View>

          {!loading && !error && !expired && (
            <>
              <Text style={s.timerText}>남은 시간 {mm}:{ss}</Text>
              <Text style={s.downloadHint}>QR을 클릭하면 다운로드됩니다</Text>
            </>
          )}

          <View style={s.btnRow}>
            <TouchableOpacity style={s.reissueBtn} onPress={issue} disabled={loading}>
              <Text style={s.reissueBtnText}>{expired ? "다시 발급" : "재발급"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
