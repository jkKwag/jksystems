import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { s } from "../styles/rmLocalStorage.styles";

export default function RmLocalStorage() {
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result.push({ key, value: localStorage.getItem(key) });
    }
    setItems(result);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = (key) => {
    localStorage.removeItem(key);
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
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.cardKey} numberOfLines={1}>{item.key}</Text>
              <Text style={s.cardValue} numberOfLines={1}>{item.value}</Text>
              <TouchableOpacity style={s.deleteBtn} onPress={() => remove(item.key)}>
                <Text style={s.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
