import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Modal, Platform } from "react-native";
import { s } from "../styles/IndClsPickerModal.styles";
import api from "../lib/api";

// 메뉴관리 상세(MenuFormModal)와 동일한 남색→녹색 그라데이션 헤더 (웹 전용, RN 네이티브는 primary 단색)
const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

// 업종분류(대분류→소분류) 트리를 검색하거나 단계별로 눌러 들어가며 하나를 고르는 팝업.
// 하위가 있는 항목은 그 안으로 드릴다운, 리프(최하위)면 바로 선택되고 팝업이 닫힌다.
export default function IndClsPickerModal({ visible, onSelect, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]); // 드릴다운 경로 (indCd 배열)

  useEffect(() => {
    if (!visible) return;
    setLoaded(false);
    setSearch("");
    setPath([]);
    api.industry.list().then(list => {
      setItems(Array.isArray(list) ? list : []);
      setLoaded(true);
    });
  }, [visible]);

  const byCode = Object.fromEntries(items.map(d => [d.indCd, d]));
  const childrenOf = (code) => items.filter(d => d.prntCd === code);
  const pathOf = (code) => {
    const p = [];
    let cur = byCode[code];
    while (cur) { p.unshift(cur); cur = cur.prntCd ? byCode[cur.prntCd] : null; }
    return p;
  };

  const query = search.trim();
  const searching = query.length > 0;
  const matches = searching
    ? items.filter(d => d.indNm.includes(query) || d.indCd.toUpperCase().includes(query.toUpperCase())).slice(0, 10)
    : [];

  const choose = (d) => {
    onSelect(d.indCd, d.indNm);
  };

  // 하위가 있으면 그 안으로 드릴다운, 리프면 바로 선택
  const handlePress = (d) => {
    if (childrenOf(d.indCd).length > 0) {
      setSearch("");
      setPath(pathOf(d.indCd).map(n => n.indCd));
    } else {
      choose(d);
    }
  };

  const truncateAt = (li) => setPath(path.slice(0, li));

  const lastCode = path.length > 0 ? path[path.length - 1] : null;
  const currentList = lastCode === null
    ? items.filter(d => d.clsLvl === 1)
    : childrenOf(lastCode);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.title}>업종 선택</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.body}>
            <View style={s.searchWrap}>
              <TextInput
                style={s.searchInput}
                placeholder="업종명 또는 코드로 검색"
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {!searching && path.length > 0 && (
              <View style={s.crumbsRow}>
                <TouchableOpacity style={s.crumbPill} onPress={() => truncateAt(0)}>
                  <Text style={s.crumbPillText}>전체</Text>
                </TouchableOpacity>
                {path.map((code, i) => {
                  const isLast = i === path.length - 1;
                  return (
                    <View key={code} style={s.crumbGroup}>
                      <Text style={s.crumbSep}>›</Text>
                      <TouchableOpacity style={[s.crumbPill, isLast && s.crumbPillCurrent]} onPress={() => truncateAt(i + 1)}>
                        <Text style={[s.crumbPillText, isLast && s.crumbPillTextCurrent]}>{byCode[code]?.indNm}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <ScrollView style={s.list}>
              {!loaded ? (
                <ActivityIndicator style={{ marginTop: 24 }} color="#f97316" />
              ) : items.length === 0 ? (
                <View style={s.center}><Text style={s.emptyText}>등록된 업종분류가 없습니다</Text></View>
              ) : searching ? (
                matches.length === 0 ? (
                  <View style={s.center}><Text style={s.emptyText}>'{query}'와 일치하는 업종이 없어요</Text></View>
                ) : (
                  matches.map(d => {
                    const crumb = pathOf(d.indCd).slice(0, -1).map(n => n.indNm).join(" › ");
                    const hasKids = childrenOf(d.indCd).length > 0;
                    return (
                      <TouchableOpacity key={d.indCd} style={s.row} onPress={() => handlePress(d)}>
                        <View style={s.rowMain}>
                          <Text style={s.rowName}>{d.indNm}</Text>
                          {!!crumb && <Text style={s.rowCrumb}>{crumb}</Text>}
                        </View>
                        <Text style={s.rowArrow}>{hasKids ? "›" : "선택"}</Text>
                      </TouchableOpacity>
                    );
                  })
                )
              ) : (
                currentList.map(d => {
                  const hasKids = childrenOf(d.indCd).length > 0;
                  return (
                    <TouchableOpacity key={d.indCd} style={s.row} onPress={() => handlePress(d)}>
                      <Text style={s.rowName}>{d.indNm}</Text>
                      <Text style={s.rowArrow}>{hasKids ? "›" : "선택"}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
