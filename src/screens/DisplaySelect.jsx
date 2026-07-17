import { View, Text, TouchableOpacity, Platform } from "react-native";
import { s } from "../styles/DisplaySelect.styles";

const GRAD_SENIOR = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" }
  : {};
const GRAD_JUNIOR = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

export default function ElderlyTest({ onSelect, onSelectElderly }) {
  return (
    <View style={s.container}>
      <Text style={s.title}>글씨 크기를 선택해주세요</Text>
      <Text style={s.sub}>맞춤 메뉴를 제공해 드립니다</Text>

      <TouchableOpacity style={[s.btn, s.btnSenior, GRAD_SENIOR]} onPress={onSelectElderly} activeOpacity={0.85}>
        <View style={s.sampleBox}>
          <Text style={s.sampleBig}>{"가나\n다라"}</Text>
        </View>
        <View style={s.btnText}>
          <Text style={s.btnLabel}>아주크게</Text>
          <Text style={s.btnDesc}>큰 글씨 · 간편 주문</Text>
        </View>
        <Text style={s.btnArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.btnJunior, GRAD_JUNIOR]} onPress={onSelect} activeOpacity={0.85}>
        <View style={s.sampleBox}>
          <Text style={s.sampleSmall}>{"가나\n다라"}</Text>
        </View>
        <View style={s.btnText}>
          <Text style={s.btnLabel}>보통</Text>
          <Text style={s.btnDesc}>일반 메뉴</Text>
        </View>
        <Text style={s.btnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}
