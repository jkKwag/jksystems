import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { s } from "../../styles/admin/AdminIndCls.styles";
import api from "../../lib/api";

export default function AdminIndCls() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]); // 확정된(선택된) 경로 [1단계코드, 2단계코드, ...]

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

  // 검색 결과를 클릭하면 그 항목까지를 확정된 경로로 만듦
  const goto = (d) => {
    setSearch("");
    setPath(pathOf(d.indCd).map(n => n.indCd));
  };

  // 아직 선택 안 된(중립) 원을 누르면 그 항목 하나만 확정되고, 형제 항목들은 사라짐
  const pick = (code) => setPath([...path, code]);

  // 상단 배지에서 특정 단계까지만 남기고 그 이후는 다시 선택하도록 되돌림
  const truncateAt = (li) => setPath(path.slice(0, li));

  // 확정된 항목들 - 각각 선택된 원 + 자기 상세카드
  const confirmedNodes = path.map(code => byCode[code]).filter(Boolean);
  const lastCode = path.length > 0 ? path[path.length - 1] : null;

  // 아직 선택하지 않은, 지금 고를 수 있는 목록 (중립 상태 원, 카드 없음)
  const openList = lastCode === null
    ? items.filter(d => d.clsLvl === 1)
    : childrenOf(lastCode);

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
            {/* 확정된 단계들 - 각 단계마다 선택된 원 하나 + 그 상세카드 */}
            {confirmedNodes.map(node => (
              <View key={node.indCd}>
                <View style={s.frontierCircleRow}>
                  <View style={[s.frontierCircle, node.useYn === "N" && s.frontierCircleDim]}>
                    <Text style={s.frontierCircleText}>{node.indNm}</Text>
                  </View>
                </View>
                <View style={s.detailCard}>
                  <View style={s.detailTopRow}>
                    <Text style={s.detailName}>{node.indNm}</Text>
                    <Text style={[s.badge, node.useYn === "Y" ? s.badgeOn : s.badgeOff]}>
                      {node.useYn === "Y" ? "사용중" : "미사용"}
                    </Text>
                  </View>
                  <View style={s.detailGrid}>
                    <View style={s.detailRow}><Text style={s.detailKey}>업종코드</Text><Text style={s.detailVal}>{node.indCd}</Text></View>
                    <View style={s.detailRow}><Text style={s.detailKey}>상위코드</Text><Text style={s.detailVal}>{node.prntCd || "-"}</Text></View>
                    <View style={s.detailRow}><Text style={s.detailKey}>분류단계</Text><Text style={s.detailVal}>{node.clsLvl}단계</Text></View>
                    <View style={s.detailRow}><Text style={s.detailKey}>정렬순서</Text><Text style={s.detailVal}>{node.sortOrd}</Text></View>
                    <View style={s.detailRow}><Text style={s.detailKey}>전체경로</Text><Text style={[s.detailVal, { fontFamily: undefined }]}>{pathOf(node.indCd).map(n => n.indNm).join(" › ")}</Text></View>
                  </View>
                </View>
              </View>
            ))}

            {/* 아직 선택 안 된 다음 단계 후보들 - 중립 상태, 카드 없음 */}
            {openList.length > 0 && (
              <View style={s.frontierCircleRow}>
                {openList.map(d => (
                  <TouchableOpacity
                    key={d.indCd}
                    style={[s.frontierCircleNeutral, d.useYn === "N" && s.frontierCircleDim]}
                    onPress={() => pick(d.indCd)}
                  >
                    <Text style={s.frontierCircleNeutralText}>{d.indNm}</Text>
                    {childrenOf(d.indCd).length > 0 && <Text style={s.frontierCircleNeutralArrow}>›</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
