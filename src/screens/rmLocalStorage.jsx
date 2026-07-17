import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { s } from "../styles/rmLocalStorage.styles";

export default function RmLocalStorage() {
  const [items, setItems] = useState([]);

  const load = () => {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      result.push({ k, v: localStorage.getItem(k) });
    }
    setItems(result);
  };

  useEffect(() => { load(); }, []);

  const remove = (k) => {
    localStorage.removeItem(k);
    load();
  };

  const clearAll = () => {
    localStorage.clear();
    load();
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>LocalStorage ({items.length})</Text>
        {items.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={clearAll}>
            <Text style={s.clearBtnText}>전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>저장된 항목 없음</Text>
        </View>
      ) : (
        <ScrollView>
          {items.map((item) => (
            <View key={item.k} style={s.card}>
              <Text style={s.cardKey} numberOfLines={1}>{item.k}</Text>
              <Text style={s.cardValue} numberOfLines={1}>{item.v}</Text>
              <TouchableOpacity style={s.deleteBtn} onPress={() => remove(item.k)}>
                <Text style={s.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
