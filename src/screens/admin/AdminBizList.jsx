import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";
import BizFormModal from "../../components/admin/BizFormModal";
import ConfirmModal from "../../components/ConfirmModal";

const PAGE_SIZE = 10;

export default function AdminBizList({ adminInfo, onSelectBiz }) {
  const activeBizRegNo = adminInfo?.bizRegNo;
  const isSuper = adminInfo?.adminRole === "SUPER";

  const [loaded, setLoaded] = useState(false);
  const [bizList, setBizList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined); // undefined=닫힘, null=신규, object=수정
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    setLoaded(false);
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
  };

  useEffect(() => { load(); }, [activeBizRegNo]);

  useEffect(() => {
    (async () => {
      const list = await api.industry.list();
      setIndustries(Array.isArray(list) ? list : []);
    })();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await api.biz.list(nextPage, PAGE_SIZE);
    setBizList(prev => [...prev, ...(result?.items || [])]);
    setHasMore(!!result?.hasMore);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleSaveBiz = async (form) => {
    setSaving(true);
    const isEdit = !!formTarget?.bizRegNo;
    const { data, error } = isEdit
      ? await api.biz.update(formTarget.bizRegNo, form)
      : await api.biz.create(form);
    setSaving(false);
    if (error || !data) {
      setAlertMsg(error?.message || "저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setFormTarget(undefined);
    setBizList(prev => (isEdit ? prev.map(b => b.bizRegNo === data.bizRegNo ? data : b) : [...prev, data]));
  };

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>
          {activeBizRegNo ? "사업장 조회 결과" : "사업장 목록"}
        </Text>
        {isSuper && (
          <TouchableOpacity style={s.addBtn} onPress={() => setFormTarget(null)}>
            <Text style={s.addBtnText}>+ 새 사업장</Text>
          </TouchableOpacity>
        )}
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : bizList.length === 0 ? (
        <View style={s.center}><Text style={s.emptyText}>등록된 사업장이 없습니다</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {bizList.map(biz => (
            <TouchableOpacity key={biz.bizRegNo} style={s.card} onPress={() => setFormTarget(biz)} activeOpacity={0.75}>
              <View style={s.cardInfo}>
                <Text style={s.bizNm}>{biz.bizNm}</Text>
                <Text style={s.meta}>{biz.bizRegNo}{biz.telNo ? ` · ${biz.telNo}` : ""}</Text>
                {(biz.addr || biz.addrDtl) && (
                  <Text style={s.addr} numberOfLines={1}>{[biz.addr, biz.addrDtl].filter(Boolean).join(" ")}</Text>
                )}
              </View>
              {onSelectBiz && biz.bizRegNo !== activeBizRegNo && (
                <TouchableOpacity style={s.selectBtn} onPress={(e) => { e?.stopPropagation?.(); onSelectBiz(biz.bizRegNo); }}>
                  <Text style={s.selectBtnText}>이 사업장 조회</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
          {!activeBizRegNo && hasMore && (
            <TouchableOpacity style={s.moreBtn} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? <ActivityIndicator color="#334155" /> : <Text style={s.moreBtnText}>더보기</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <BizFormModal
        visible={formTarget !== undefined}
        initial={formTarget}
        industries={industries}
        saving={saving}
        onSave={handleSaveBiz}
        onClose={() => setFormTarget(undefined)}
      />
      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
