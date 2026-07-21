import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]); // 단계별 선택 코드 [1단계코드, 2단계코드, ...]
  const [expandedLeaf, setExpandedLeaf] = useState(null);

  const load = async () => {
    setLoaded(false);
    const list = await api.industry.list();
    setItems(Array.isArray(list) ? list : []);
    setSelected([]);
    setExpandedLeaf(null);
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

  // 검색 결과를 클릭하면 그 항목까지의 전체 경로를 단계별로 펼쳐서 보여줌
  const goto = (d) => {
    setSearch("");
    setSelected(pathOf(d.indCd).map(n => n.indCd));
    setExpandedLeaf(childrenOf(d.indCd).length === 0 ? d.indCd : null);
  };

  // 특정 단계(li)에서 code를 선택 - 그보다 하위 단계 선택은 초기화됨
  const selectAt = (li, code) => {
    const next = selected.slice(0, li);
    next.push(code);
    setSelected(next);
    setExpandedLeaf(childrenOf(code).length === 0 ? code : null);
  };

  // 상단 배지에서 특정 단계까지만 남기고 그보다 하위는 다시 고를 수 있게 비움
  const truncateAt = (li) => {
    setSelected(selected.slice(0, li));
    setExpandedLeaf(null);
  };

  // 1단계부터 시작해서, 선택된 항목이 있으면 그 하위 단계를 계속 이어서 쌓음.
  // 위/아래 어떤 단계 카드를 눌러도 바로 그 자리에서 다시 선택(수정)할 수 있다.
  const levels = [];
  {
    let parentCode = null;
    let depth = 0;
    while (true) {
      const levelItems = parentCode === null ? items.filter(x => x.clsLvl === 1) : childrenOf(parentCode);
      if (levelItems.length === 0) break;
      levels.push({ parentCode, items: levelItems, selectedCode: selected[depth] || null });
      const chosen = selected[depth];
      if (!chosen) break;
      const kids = childrenOf(chosen);
      if (kids.length === 0) break;
      parentCode = chosen;
      depth++;
    }
  }

  const detail = expandedLeaf ? byCode[expandedLeaf] : null;

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
          <>
            {levels.map((lvl, li) => (
              <View key={lvl.parentCode || "root"} style={s.levelCard}>
                <Text style={s.levelTitle}>
                  {lvl.parentCode === null ? "대분류" : `'${byCode[lvl.parentCode]?.indNm}' 하위 업종`}
                </Text>
                <View style={s.chipGrid}>
                  {lvl.items.map(d => {
                    const kids = childrenOf(d.indCd);
                    const isSelected = lvl.selectedCode === d.indCd;
                    return (
                      <TouchableOpacity
                        key={d.indCd}
                        style={[s.chip, isSelected && s.chipExpanded, d.useYn === "N" && s.chipDim]}
                        onPress={() => selectAt(li, d.indCd)}
                      >
                        <Text style={[s.chipText, isSelected && s.chipTextExpanded]}>{d.indNm}</Text>
                        {kids.length > 0 && <Text style={[s.chipArrow, isSelected && s.chipTextExpanded]}>›</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {detail && (
              <View style={s.detailCard}>
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
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
