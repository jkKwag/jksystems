import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]); // 지금까지 눌러서 들어온 경로 [1단계코드, 2단계코드, ...]

  const load = async () => {
    setLoaded(false);
    const list = await api.industry.list();
    setItems(Array.isArray(list) ? list : []);
    setPath([]);
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

  // 검색 결과를 클릭하면 그 항목이 지금 보고 있는 목록(frontier)에 나타나도록 경로를 맞춰줌
  const goto = (d) => {
    setSearch("");
    setPath(childrenOf(d.indCd).length > 0 ? pathOf(d.indCd).map(n => n.indCd) : pathOf(d.indCd).slice(0, -1).map(n => n.indCd));
  };

  // 동그라미를 누르면(자식이 있을 때만) 그 하위로 들어감 - 지금 보이던 목록은 그 하위 목록으로 교체됨
  const drillInto = (code) => {
    if (childrenOf(code).length === 0) return; // 자식 없으면(리프) 아무 동작 없음 - 이미 자기 카드가 보이는 중
    setPath([...path, code]);
  };

  // 상단 배지에서 특정 단계까지만 남기고 그 이후는 다시 조회하도록 되돌림
  const truncateAt = (li) => setPath(path.slice(0, li));

  // 지금 보고 있는 목록 (frontier): 맨 처음엔 1단계 전체, 경로가 있으면 그 마지막 항목의 자식들
  const frontier = path.length === 0
    ? items.filter(d => d.clsLvl === 1)
    : childrenOf(path[path.length - 1]);

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

      {!searching && path.length > 0 && (
        <View style={s.crumbsRow}>
          <TouchableOpacity style={s.crumbPill} onPress={() => truncateAt(0)}>
            <Text style={s.crumbPillText}>대분류</Text>
          </TouchableOpacity>
          {path.map((code, i) => (
            <View key={code} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.crumbSep}>›</Text>
              <TouchableOpacity
                style={[s.crumbPill, i === path.length - 1 && s.crumbPillCurrent]}
                onPress={() => truncateAt(i + 1)}
              >
                <Text style={[s.crumbPillText, i === path.length - 1 && s.crumbPillTextCurrent]}>
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
            <View style={s.frontierCircleRow}>
              {frontier.map(d => {
                const hasKids = childrenOf(d.indCd).length > 0;
                return (
                  <TouchableOpacity
                    key={d.indCd}
                    style={[s.frontierCircle, d.useYn === "N" && s.frontierCircleDim]}
                    onPress={() => drillInto(d.indCd)}
                  >
                    <Text style={s.frontierCircleText}>{d.indNm}</Text>
                    {hasKids && <Text style={s.frontierCircleArrow}>›</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {frontier.map(d => (
              <View key={d.indCd} style={s.detailCard}>
                <View style={s.detailTopRow}>
                  <Text style={s.detailName}>{d.indNm}</Text>
                  <Text style={[s.badge, d.useYn === "Y" ? s.badgeOn : s.badgeOff]}>
                    {d.useYn === "Y" ? "사용중" : "미사용"}
                  </Text>
                </View>
                <View style={s.detailGrid}>
                  <View style={s.detailRow}><Text style={s.detailKey}>업종코드</Text><Text style={s.detailVal}>{d.indCd}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>상위코드</Text><Text style={s.detailVal}>{d.prntCd || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>분류단계</Text><Text style={s.detailVal}>{d.clsLvl}단계</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>정렬순서</Text><Text style={s.detailVal}>{d.sortOrd}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>전체경로</Text><Text style={[s.detailVal, { fontFamily: undefined }]}>{pathOf(d.indCd).map(n => n.indNm).join(" › ")}</Text></View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
