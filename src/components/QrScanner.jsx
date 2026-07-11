import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { s } from "../styles/QrScanner.styles";
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
