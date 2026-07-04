import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import jsQR from "jsqr";

export default function QrScanner({ visible, onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [hint, setHint] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setCameraError(null);
    setHint(null);
    startCamera();
    return () => stop();
  }, [visible]);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraError("카메라 접근 권한이 필요합니다.\n아래 버튼으로 앨범에서 선택해주세요.");
    }
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const { videoWidth: w, videoHeight: h } = video;
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(video, 0, 0, w, h);
      const img = canvas.getContext("2d").getImageData(0, 0, w, h);
      const code = jsQR(img.data, w, h);
      if (code?.data) { stop(); onScan(code.data); return; }
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHint(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        const imageData = canvas.getContext("2d").getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code?.data) { stop(); onScan(code.data); }
        else setHint("QR 코드를 인식할 수 없어요. 다시 시도해주세요.");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <View style={s.header}>
            <Text style={s.title}>QR 스캔</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          <View style={s.cameraBox}>
            {cameraError ? (
              <Text style={s.errorText}>{cameraError}</Text>
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 0 }}
              />
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!cameraError && (
              <View style={s.frameWrap} pointerEvents="none">
                <View style={s.frameTL} /><View style={s.frameTR} />
                <View style={s.frameBL} /><View style={s.frameBR} />
              </View>
            )}
          </View>

          {hint && <Text style={s.hint}>{hint}</Text>}

          <View style={s.footer}>
            <Text style={s.footerLabel}>앨범 또는 파일에서 QR 이미지 불러오기</Text>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            <TouchableOpacity style={s.fileBtn} onPress={() => fileInputRef.current?.click()}>
              <Text style={s.fileBtnText}>📁 파일 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  panel: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 17, fontWeight: "900", color: "#0f172a" },
  closeBtn: { fontSize: 18, color: "#94a3b8", padding: 4 },

  cameraBox: { width: "100%", height: 320, backgroundColor: "#0f172a", position: "relative", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 14, textAlign: "center", paddingHorizontal: 24, lineHeight: 22 },

  frameWrap: { position: "absolute", top: "50%", left: "50%", width: 200, height: 200, marginTop: -100, marginLeft: -100 },
  frameTL: { position: "absolute", top: 0, left: 0, width: 32, height: 32, borderTopWidth: 3, borderLeftWidth: 3, borderColor: "#16a34a" },
  frameTR: { position: "absolute", top: 0, right: 0, width: 32, height: 32, borderTopWidth: 3, borderRightWidth: 3, borderColor: "#16a34a" },
  frameBL: { position: "absolute", bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: "#16a34a" },
  frameBR: { position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 3, borderRightWidth: 3, borderColor: "#16a34a" },

  hint: { fontSize: 13, color: "#ef4444", textAlign: "center", paddingHorizontal: 20, paddingTop: 12 },

  footer: { padding: 20, alignItems: "center", gap: 10 },
  footerLabel: { fontSize: 12, color: "#94a3b8" },
  fileBtn: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  fileBtnText: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
});
