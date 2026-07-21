import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]); // 단계별 선택 경로 [1단계코드, 2단계코드, ...]

  const load = async () => {
    setLoaded(false);
    const list = await api.industry.list();
    setItems(Array.isArray(list) ? list : []);
    setSelected([]);
    setSearch("");
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const byCode = Object.fromEntries(items.map(d => [d.indCd, d]));
  const childrenOf = (code) => items.filter(d => d.prntCd === code);
  const pathOf = (code) => {
    const path = [];
    let cur = byCode[code];
    while (cur) { path.unshift(cur); cur = cur.prntCd ? byCode[cur.prntCd] : null; }
    return path;
  };

  const query = search.trim();
  const searching = query.length > 0;
  const matches = searching
    ? items.filter(d => d.indNm.includes(query) || d.indCd.toUpperCase().includes(query.toUpperCase())).slice(0, 10)
    : [];

  // 검색 결과를 클릭하면 그 항목까지의 전체 경로를 선택 상태로 만듦
  const goto = (d) => {
    setSearch("");
    setSelected(pathOf(d.indCd).map(n => n.indCd));
  };

  // 특정 단계(depth)에서 code를 선택 - 그보다 하위 단계 선택은 초기화됨(하위는 새로 골라야 하니까)
  const selectAt = (depth, code) => setSelected([...selected.slice(0, depth), code]);

  // 상단 배지에서 특정 단계까지만 남기고 그보다 하위는 비움 (다시 선택 가능)
  const truncateAt = (li) => setSelected(selected.slice(0, li));

  // 1단계부터 시작해서 "그 단계 선택 카드 -> 선택된 항목 상세 카드"를 반복해서 쌓는다.
  // 한 단계를 선택해도 그 단계의 선택 카드는 사라지지 않고 그대로 남아, 언제든 다시 눌러 바꿀 수 있다.
  const sections = [];
  {
    let parentCode = null;
    let depth = 0;
    while (true) {
      const levelItems = parentCode === null ? items.filter(x => x.clsLvl === 1) : childrenOf(parentCode);
      if (levelItems.length === 0) break;
      const selCode = selected[depth] || null;
      sections.push({ kind: "picker", parentNode: parentCode ? byCode[parentCode] : null, items: levelItems, selectedCode: selCode, depth });
      if (!selCode) break;
      const node = byCode[selCode];
      sections.push({ kind: "detail", node });
      const kids = childrenOf(selCode);
      if (kids.length === 0) break;
      parentCode = selCode;
      depth++;
    }
  }

  if (!loaded) {
    return (
      <View style={s.container}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>업종분류 조회</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>등록된 업종 코드를 검색하거나 단계별로 살펴보세요</Text>

      <View style={s.searchWrap}>
        <View style={s.searchIcon}><Text style={s.searchIconText}>⌕</Text></View>
        <TextInput
          style={s.searchInput}
          placeholder="업종명 또는 코드로 검색 (예: 삼겹살, IC013)"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {!searching && selected.length > 0 && (
        <View style={s.crumbsRow}>
          <TouchableOpacity style={s.crumbPill} onPress={() => truncateAt(0)}>
            <Text style={s.crumbPillText}>대분류</Text>
          </TouchableOpacity>
          {selected.map((code, i) => (
            <View key={code} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.crumbSep}>›</Text>
              <TouchableOpacity
                style={[s.crumbPill, i === selected.length - 1 && s.crumbPillCurrent]}
                onPress={() => truncateAt(i + 1)}
              >
                <Text style={[s.crumbPillText, i === selected.length - 1 && s.crumbPillTextCurrent]}>
                  {byCode[code]?.indNm}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <ScrollView>
        {items.length === 0 ? (
          <View style={s.center}><Text style={s.emptyText}>등록된 업종분류가 없습니다</Text></View>
        ) : searching ? (
          matches.length === 0 ? (
            <View style={s.center}><Text style={s.emptyText}>'{query}'와 일치하는 업종이 없어요</Text></View>
          ) : (
            matches.map(d => {
              const crumb = pathOf(d.indCd).slice(0, -1).map(n => n.indNm).join(" › ");
              return (
                <TouchableOpacity key={d.indCd} style={s.resultRow} onPress={() => goto(d)}>
                  <View style={s.resultMain}>
                    <Text style={s.resultName}>{d.indNm}</Text>
                    {!!crumb && <Text style={s.resultCrumb}>{crumb}</Text>}
                  </View>
                  <Text style={s.resultCode}>{d.indCd}</Text>
                </TouchableOpacity>
              );
            })
          )
        ) : (
          sections.map((sec, idx) => {
            if (sec.kind === "picker") {
              return (
                <View key={`picker-${sec.depth}`} style={s.levelCard}>
                  <Text style={s.levelTitle}>
                    {sec.parentNode ? `'${sec.parentNode.indNm}' 하위 업종` : "대분류"}
                  </Text>
                  <View style={s.chipGrid}>
                    {sec.items.map(d => {
                      const isSelected = sec.selectedCode === d.indCd;
                      return (
                        <TouchableOpacity
                          key={d.indCd}
                          style={[s.chip, isSelected && s.chipExpanded, d.useYn === "N" && s.chipDim]}
                          onPress={() => selectAt(sec.depth, d.indCd)}
                        >
                          <Text style={[s.chipText, isSelected && s.chipTextExpanded]}>{d.indNm}</Text>
                          {childrenOf(d.indCd).length > 0 && (
                            <Text style={[s.chipArrow, isSelected && s.chipTextExpanded]}>›</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            }
            const detail = sec.node;
            return (
              <View key={`detail-${detail.indCd}`} style={s.detailCard}>
                <View style={s.detailTopRow}>
                  <Text style={s.detailName}>{detail.indNm}</Text>
                  <Text style={[s.badge, detail.useYn === "Y" ? s.badgeOn : s.badgeOff]}>
                    {detail.useYn === "Y" ? "사용중" : "미사용"}
                  </Text>
                </View>
                <View style={s.detailGrid}>
                  <View style={s.detailRow}><Text style={s.detailKey}>업종코드</Text><Text style={s.detailVal}>{detail.indCd}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>상위코드</Text><Text style={s.detailVal}>{detail.prntCd || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>분류단계</Text><Text style={s.detailVal}>{detail.clsLvl}단계</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>정렬순서</Text><Text style={s.detailVal}>{detail.sortOrd}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>전체경로</Text><Text style={[s.detailVal, { fontFamily: undefined }]}>{pathOf(detail.indCd).map(n => n.indNm).join(" › ")}</Text></View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
