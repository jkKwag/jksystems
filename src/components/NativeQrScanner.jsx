import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { s } from "../styles/QrScanner.styles";

// QrScanner.jsx의 네이티브(안드로이드/iOS)용 대응 컴포넌트. 웹 버전은 <video>/getUserMedia
// 같은 브라우저 전용 API를 쓰기 때문에 네이티브에서는 expo-camera로 따로 구현했다.
export default function NativeQrScanner({ visible, onScan, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    scannedRef.current = false;
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScan(data);
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
        </View>
      </View>
    </Modal>
  );
}
