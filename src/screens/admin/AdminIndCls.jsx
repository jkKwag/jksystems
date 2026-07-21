import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]); // 하위가 있어서 그 안으로 들어간(드릴다운) 경로
  const [pickedLeaf, setPickedLeaf] = useState(null); // 지금 보고 있는 목록에서 리프를 선택해 하나만 남긴 상태

  const load = async () => {
    setLoaded(false);
    const list = await api.industry.list();
    setItems(Array.isArray(list) ? list : []);
    setPath([]);
    setPickedLeaf(null);
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

  // 검색 결과를 클릭하면: 하위가 있으면 그 안으로 들어가고, 리프면 그 형제 목록에서 하나만 남김
  const goto = (d) => {
    setSearch("");
    if (childrenOf(d.indCd).length > 0) {
      setPath(pathOf(d.indCd).map(n => n.indCd));
      setPickedLeaf(null);
    } else {
      setPath(pathOf(d.indCd).slice(0, -1).map(n => n.indCd));
      setPickedLeaf(d.indCd);
    }
  };

  // 항목을 누름: 하위가 있으면 그 안으로 드릴다운(목록이 하위 전체로 교체됨), 리프면 그 목록에서 하나만 남김
  const select = (d) => {
    if (childrenOf(d.indCd).length > 0) {
      setPath([...path, d.indCd]);
      setPickedLeaf(null);
    } else {
      setPickedLeaf(d.indCd);
    }
  };

  // 상단 배지에서 특정 단계까지만 남기고 되돌림
  const truncateAt = (li) => {
    setPath(path.slice(0, li));
    setPickedLeaf(null);
  };

  const lastCode = path.length > 0 ? path[path.length - 1] : null;

  // 지금 보고 있는 목록: 맨 처음엔 1단계 전체, 경로가 있으면 마지막으로 들어간 항목의 하위 전체
  const currentList = lastCode === null
    ? items.filter(d => d.clsLvl === 1)
    : childrenOf(lastCode);

  // 리프를 하나 선택했으면 그 하나만, 아니면 전체 목록을 보여줌
  const displayList = pickedLeaf ? currentList.filter(d => d.indCd === pickedLeaf) : currentList;

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

      {!searching && (path.length > 0 || pickedLeaf) && (
        <View style={s.crumbsRow}>
          <TouchableOpacity style={s.crumbPill} onPress={() => truncateAt(0)}>
            <Text style={s.crumbPillText}>대분류</Text>
          </TouchableOpacity>
          {path.map((code, i) => {
            const isLast = !pickedLeaf && i === path.length - 1;
            return (
              <View key={code} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.crumbSep}>›</Text>
                <TouchableOpacity style={[s.crumbPill, isLast && s.crumbPillCurrent]} onPress={() => truncateAt(i + 1)}>
                  <Text style={[s.crumbPillText, isLast && s.crumbPillTextCurrent]}>{byCode[code]?.indNm}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {pickedLeaf && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.crumbSep}>›</Text>
              <View style={[s.crumbPill, s.crumbPillCurrent]}>
                <Text style={[s.crumbPillText, s.crumbPillTextCurrent]}>{byCode[pickedLeaf]?.indNm}</Text>
              </View>
            </View>
          )}
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
            <View style={s.frontierCircleBox}>
              <View style={s.frontierCircleRow}>
                {displayList.map(d => {
                  const hasKids = childrenOf(d.indCd).length > 0;
                  return (
                    <TouchableOpacity
                      key={d.indCd}
                      style={[s.frontierCircleNeutral, d.useYn === "N" && s.frontierCircleDim]}
                      onPress={() => select(d)}
                    >
                      <Text style={s.frontierCircleNeutralText}>{d.indNm}</Text>
                      {hasKids && <Text style={s.frontierCircleNeutralArrow}>›</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {displayList.map(d => (
              <View key={d.indCd} style={s.detailCard}>
                <View style={s.detailTopRow}>
                  <Text style={s.detailName}>{d.indNm}</Text>
                  <Text style={[s.badge, d.useYn === "Y" ? s.badgeOn : s.badgeOff]}>
                    {d.useYn === "Y" ? "사용중" : "미사용"}
                  </Text>
                </View>
                <View style={s.detailGrid}>
                  <View style={s.detailRow}><Text style={s.detailKey}>업종코드</Text><Text style={s.detailVal}>{d.indCd}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>상위업종코드</Text><Text style={s.detailVal}>{d.prntCd || "-"}</Text></View>
                  <View style={s.detailRow}><Text style={s.detailKey}>상위업종명</Text><Text style={[s.detailVal, { fontFamily: undefined }]}>{d.prntCd ? (byCode[d.prntCd]?.indNm || "-") : "-"}</Text></View>
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
