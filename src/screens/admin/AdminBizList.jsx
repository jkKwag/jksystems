import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";

export default function AdminBizList({ onSelectBiz }) {
  const [loaded, setLoaded] = useState(false);
  const [bizList, setBizList] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await api.biz.list();
      setBizList(Array.isArray(list) ? list : []);
      setLoaded(true);
    })();
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>사업장 목록{loaded ? ` (${bizList.length})` : ""}</Text>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : bizList.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>등록된 사업장이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {bizList.map(biz => (
            <View key={biz.bizRegNo} style={s.card}>
              <View style={s.cardInfo}>
                <Text style={s.bizNm}>{biz.bizNm}</Text>
                <Text style={s.meta}>{biz.bizRegNo}{biz.telNo ? ` · ${biz.telNo}` : ""}</Text>
                {(biz.addr || biz.addrDtl) && (
                  <Text style={s.addr} numberOfLines={1}>{[biz.addr, biz.addrDtl].filter(Boolean).join(" ")}</Text>
                )}
              </View>
              {onSelectBiz && (
                <TouchableOpacity style={s.selectBtn} onPress={() => onSelectBiz(biz.bizRegNo)}>
                  <Text style={s.selectBtnText}>이 사업장 조회</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
