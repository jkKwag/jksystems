import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { s } from "../styles/ConfirmModal.styles";

// "[라벨] 값" 또는 "라벨: 값" 형태의 줄이면 값 부분만 옅은 색으로 보여준다.
const BRACKET_LABEL_RE = /^\[([^\]]+)\]\s*(.*)$/;
const COLON_LABEL_RE = /^([^:\n]+):\s?(.*)$/;

function MessageLine({ line }) {
  // 빈 줄("\n\n")은 빈 Text로 렌더링하면 높이가 0으로 접혀서 실제로는 줄바꿈이 안 보인다 — 높이가 있는 스페이서로 대신 그린다.
  if (line === "") {
    return <View style={s.messageGap} />;
  }
  const bracketMatch = line.match(BRACKET_LABEL_RE);
  if (bracketMatch && bracketMatch[2]) {
    return <Text style={s.message}>{`[${bracketMatch[1]}] `}<Text style={s.messageValue}>{bracketMatch[2]}</Text></Text>;
  }
  const colonMatch = line.match(COLON_LABEL_RE);
  if (colonMatch && colonMatch[2]) {
    return <Text style={s.message}>{`${colonMatch[1]}: `}<Text style={s.messageValue}>{colonMatch[2]}</Text></Text>;
  }
  return <Text style={s.message}>{line}</Text>;
}

// alert()/confirm() 대체용 공통 모달. cancelText를 안 주면 확인 버튼 하나만 보여줌(alert 대체),
// cancelText를 주면 확인/취소 버튼 두 개(confirm 대체)로 동작함.
export default function ConfirmModal({ visible, message, confirmText = "확인", cancelText, onConfirm, onCancel, danger }) {
  if (!visible) return null;
  const lines = typeof message === "string" ? message.split("\n") : [String(message)];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={s.overlay}>
        <View style={s.card}>
          <ScrollView style={s.messageScroll}>
            {lines.map((line, idx) => <MessageLine key={idx} line={line} />)}
          </ScrollView>
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
