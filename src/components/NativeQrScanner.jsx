import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { CameraView, useCameraPermissions, scanFromURLAsync } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { s } from "../styles/QrScanner.styles";

// QrScanner.jsx의 네이티브(안드로이드/iOS)용 대응 컴포넌트. 웹 버전은 <video>/getUserMedia,
// <canvas>+jsqr 같은 브라우저 전용 API를 쓰기 때문에 네이티브에서는 expo-camera로 따로
// 구현했다. 앨범 선택도 jsqr(픽셀 데이터 필요)로는 못 하니, expo-camera가 제공하는
// scanFromURLAsync(네이티브가 이미지 파일을 직접 디코딩)를 대신 쓴다.
export default function NativeQrScanner({ visible, onScan, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hint, setHint] = useState(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    scannedRef.current = false;
    setHint(null);
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScan(data);
  };

  const handlePickImage = async () => {
    setHint(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setHint("앨범 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      const [scanned] = await scanFromURLAsync(result.assets[0].uri, ["qr"]);
      if (scanned?.data) {
        scannedRef.current = true;
        onScan(scanned.data);
      } else {
        setHint("QR 코드를 인식할 수 없어요. 다시 시도해주세요.");
      }
    } catch {
      setHint("QR 코드를 인식할 수 없어요. 다시 시도해주세요.");
    }
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
            {!permission?.granted ? (
              <Text style={s.errorText}>
                {permission?.canAskAgain === false
                  ? "카메라 권한이 거부되었습니다.\n기기 설정에서 권한을 허용해주세요."
                  : "카메라 권한을 요청 중입니다..."}
              </Text>
            ) : (
              visible && (
                <CameraView
                  style={{ width: "100%", height: "100%" }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
              )
            )}
            {permission?.granted && (
              <View style={s.frameWrap} pointerEvents="none">
                <View style={s.frameTL} /><View style={s.frameTR} />
                <View style={s.frameBL} /><View style={s.frameBR} />
              </View>
            )}
          </View>

          {hint && <Text style={s.hint}>{hint}</Text>}

          <View style={s.footer}>
            <Text style={s.footerLabel}>앨범 또는 파일에서 QR 이미지 불러오기</Text>
            <TouchableOpacity style={s.fileBtn} onPress={handlePickImage}>
              <Text style={s.fileBtnText}>📁 파일 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
