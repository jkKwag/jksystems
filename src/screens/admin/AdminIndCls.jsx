import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [browseCode, setBrowseCode] = useState(null); // null = 대분류 목록
  const [expandedLeaf, setExpandedLeaf] = useState(null);

  const load = async () => {
    setLoaded(false);
    const list = await api.industry.list();
    setItems(Array.isArray(list) ? list : []);
    setBrowseCode(null);
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

  const goto = (d) => {
    setSearch("");
    if (childrenOf(d.indCd).length > 0) {
      setBrowseCode(d.indCd);
      setExpandedLeaf(null);
    } else {
      setBrowseCode(d.prntCd);
      setExpandedLeaf(d.indCd);
    }
  };

  const browseList = browseCode === null
    ? items.filter(d => d.clsLvl === 1)
    : childrenOf(browseCode);

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
            <View style={s.countRow}>
              <Text style={s.countText}>총 {browseList.length}개</Text>
            </View>

            <View style={s.crumbsRow}>
              <TouchableOpacity onPress={() => { setBrowseCode(null); setExpandedLeaf(null); }}>
                <Text style={[s.crumbBtnText, browseCode === null && s.crumbBtnTextCurrent]}>대분류</Text>
              </TouchableOpacity>
              {browseCode && pathOf(browseCode).map(node => (
                <View key={node.indCd} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={s.crumbSep}>›</Text>
                  <TouchableOpacity onPress={() => { setBrowseCode(node.indCd); setExpandedLeaf(null); }}>
                    <Text style={[s.crumbBtnText, node.indCd === browseCode && s.crumbBtnTextCurrent]}>{node.indNm}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={s.levelTitle}>
              {browseCode === null ? "대분류" : `'${byCode[browseCode]?.indNm}' 하위 업종`}
            </Text>

            <View style={s.chipGrid}>
              {browseList.map(d => {
                const kids = childrenOf(d.indCd);
                const isLeaf = kids.length === 0;
                const isExpanded = isLeaf && expandedLeaf === d.indCd;
                return (
                  <TouchableOpacity
                    key={d.indCd}
                    style={[s.chip, isExpanded && s.chipExpanded, d.useYn === "N" && s.chipDim]}
                    onPress={() => {
                      if (kids.length) { setBrowseCode(d.indCd); setExpandedLeaf(null); }
                      else { setExpandedLeaf(expandedLeaf === d.indCd ? null : d.indCd); }
                    }}
                  >
                    <Text style={[s.chipText, isExpanded && s.chipTextExpanded]}>{d.indNm}</Text>
                    {kids.length > 0 && <Text style={s.chipArrow}>›</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

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
