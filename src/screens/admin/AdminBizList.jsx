import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";

const PAGE_SIZE = 10;

export default function AdminBizList({ adminInfo, onSelectBiz }) {
  const activeBizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [bizList, setBizList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoaded(false);
    (async () => {
      // 상단에서 사업자번호로 조회 중이면 그 사업장 한 건만 보여줌
      if (activeBizRegNo) {
        const biz = await api.biz.get(activeBizRegNo);
        setBizList(biz ? [biz] : []);
        setHasMore(false);
        setLoaded(true);
        return;
      }
      const result = await api.biz.list(0, PAGE_SIZE);
      setBizList(result?.items || []);
      setHasMore(!!result?.hasMore);
      setPage(0);
      setLoaded(true);
    })();
  }, [activeBizRegNo]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await api.biz.list(nextPage, PAGE_SIZE);
    setBizList(prev => [...prev, ...(result?.items || [])]);
    setHasMore(!!result?.hasMore);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>
        {activeBizRegNo ? "사업장 조회 결과" : "사업장 목록"}
      </Text>

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
              {onSelectBiz && biz.bizRegNo !== activeBizRegNo && (
                <TouchableOpacity style={s.selectBtn} onPress={() => onSelectBiz(biz.bizRegNo)}>
                  <Text style={s.selectBtnText}>이 사업장 조회</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {!activeBizRegNo && hasMore && (
            <TouchableOpacity style={s.moreBtn} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? <ActivityIndicator color="#334155" /> : <Text style={s.moreBtnText}>더보기</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
