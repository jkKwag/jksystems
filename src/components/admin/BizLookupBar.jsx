import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { s } from "../../styles/admin/BizLookupBar.styles";

// 최종관리자(SUPER)가 사업자등록번호로 사업장을 조회해서, 그 사업장 기준으로 관리자 화면들을 이용할 수 있게 하는 공통 컴포넌트.
export default function BizLookupBar({ onLookup, resultText, errorText }) {
  const [input, setInput] = useState("");

  const submit = () => {
    const regNo = input.trim();
    if (!regNo) return;
    onLookup(regNo);
  };

  return (
    <View style={s.bar}>
      <TextInput
        style={s.input}
        placeholder="사업자등록번호로 사업장 조회"
        placeholderTextColor="#94a3b8"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={submit}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={s.btnText}>조회</Text>
      </TouchableOpacity>
      {!!errorText && <Text style={s.error}>{errorText}</Text>}
      {!!resultText && !errorText && <Text style={s.result}>{resultText}</Text>}
    </View>
  );
}
