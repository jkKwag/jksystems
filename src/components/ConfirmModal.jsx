import { View, Text, TouchableOpacity, Modal } from "react-native";
import { s } from "../styles/ConfirmModal.styles";

// alert()/confirm() 대체용 공통 모달. cancelText를 안 주면 확인 버튼 하나만 보여줌(alert 대체),
// cancelText를 주면 확인/취소 버튼 두 개(confirm 대체)로 동작함.
export default function ConfirmModal({ visible, message, confirmText = "확인", cancelText, onConfirm, onCancel, danger }) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.message}>{message}</Text>
          <View style={s.btnRow}>
            {cancelText ? (
              <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
                <Text style={s.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[s.confirmBtn, danger && s.confirmBtnDanger]} onPress={onConfirm}>
              <Text style={s.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
