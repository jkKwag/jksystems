import { View, Text, TouchableOpacity } from "react-native";
import { s } from "../styles/ElderlyTest.styles";

export default function ElderlyTest({ onSelect, onSelectElderly }) {
  return (
    <View style={s.container}>
      <Text style={s.title}>화면크기를 선택해주세요</Text>
      <Text style={s.sub}>맞춤 메뉴를 제공해 드립니다</Text>

      <TouchableOpacity style={[s.btn, s.btnSenior]} onPress={onSelectElderly} activeOpacity={0.85}>
        <Text style={s.btnIcon}>👴</Text>
        <View style={s.btnText}>
          <Text style={s.btnLabel}>아주크게</Text>
          <Text style={s.btnDesc}>큰 글씨 · 간편 주문</Text>
        </View>
        <Text style={s.btnArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.btnJunior]} onPress={onSelect} activeOpacity={0.85}>
        <Text style={s.btnIcon}>🧑</Text>
        <View style={s.btnText}>
          <Text style={s.btnLabel}>보통</Text>
          <Text style={s.btnDesc}>일반 메뉴</Text>
        </View>
        <Text style={s.btnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}
