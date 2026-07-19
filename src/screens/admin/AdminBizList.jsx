import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const PAGE_SIZE = 10;
const emptyForm = { bizRegNo: "", bizNm: "", repNm: "", telNo: "", emailAddr: "", indCd: "", addr: "", addrDtl: "" };

const toForm = (biz) => ({
  bizRegNo: biz?.bizRegNo || "",
  bizNm: biz?.bizNm || "",
  repNm: biz?.repNm || "",
  telNo: biz?.telNo || "",
  emailAddr: biz?.emailAddr || "",
  indCd: biz?.indCd || "",
  addr: biz?.addr || "",
  addrDtl: biz?.addrDtl || "",
});

export default function AdminBizList({ adminInfo, onSelectBiz }) {
  const activeBizRegNo = adminInfo?.bizRegNo;
  const isSuper = adminInfo?.adminRole === "SUPER";

  const [loaded, setLoaded] = useState(false);
  const [bizList, setBizList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [oprSttCodes, setOprSttCodes] = useState([]);

  const [expandedKey, setExpandedKey] = useState(null); // null | bizRegNo | "__new__"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const load = async () => {
    setLoaded(false);
    // 상단에서 사업자번호로 조회 중이면 그 사업장 한 건만 보여줌
    if (activeBizRegNo) {
      const biz = await api.biz.get(activeBizRegNo);
      setBizList(biz ? [biz] : []);
      setHasMore(false);
      setLoaded(true);
      // 사업자관리자는 본인 사업장 하나뿐이라 바로 상세를 펼쳐서 보여줌
      if (!isSuper && biz) {
        setForm(toForm(biz));
        setExpandedKey(biz.bizRegNo);
      }
      return;
    }
    const result = await api.biz.list(0, PAGE_SIZE);
    setBizList(result?.items || []);
    setHasMore(!!result?.hasMore);
    setPage(0);
    setLoaded(true);
  };

  useEffect(() => { load(); setExpandedKey(null); }, [activeBizRegNo]);

  useEffect(() => {
    (async () => {
      const list = await api.industry.list();
      setIndustries(Array.isArray(list) ? list : []);
    })();
    (async () => {
      const list = await api.commonCode.list("OPR_STT_CD");
      setOprSttCodes(Array.isArray(list) ? list : []);
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

  const toggleExpand = (key, biz) => {
    if (expandedKey === key) { setExpandedKey(null); return; }
    setForm(biz ? toForm(biz) : emptyForm);
    setFormError("");
    setExpandedKey(key);
  };

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = async () => {
    const isEdit = expandedKey !== "__new__";
    if (!isEdit && !form.bizRegNo.trim()) { setFormError("사업자등록번호를 입력해주세요."); return; }
    if (!isEdit && !form.repNm.trim()) { setFormError("대표자명을 입력해주세요."); return; }
    if (!form.bizNm.trim()) { setFormError("사업장명을 입력해주세요."); return; }
    setFormError("");
    setSaving(true);
    const payload = {
      bizRegNo: form.bizRegNo.trim(),
      bizNm: form.bizNm.trim(),
      telNo: form.telNo.trim() || null,
      emailAddr: form.emailAddr.trim() || null,
      indCd: form.indCd || null,
      addr: form.addr.trim() || null,
      addrDtl: form.addrDtl.trim() || null,
    };
    if (!isEdit) payload.repNm = form.repNm.trim();
    const { data, error } = isEdit
      ? await api.biz.update(expandedKey, payload)
      : await api.biz.create(payload);
    setSaving(false);
    if (error || !data) {
      setFormError(error?.message || "저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setBizList(prev => (isEdit ? prev.map(b => b.bizRegNo === data.bizRegNo ? data : b) : [data, ...prev]));
    setExpandedKey(null);
  };

  const renderFields = (biz) => (
    <View style={s.editSection}>
      {expandedKey === "__new__" && (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>· 사업자등록번호</Text>
          <TextInput
            style={s.fieldInp}
            placeholder="숫자만 입력 (예: 2122544531)"
            value={form.bizRegNo}
            onChangeText={update("bizRegNo")}
            keyboardType="numeric"
          />
        </View>
      )}
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 사업장명</Text>
        <TextInput style={s.fieldInp} placeholder="사업장명 입력" value={form.bizNm} onChangeText={update("bizNm")} />
      </View>
      {expandedKey === "__new__" ? (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>· 대표자명</Text>
          <TextInput style={s.fieldInp} placeholder="대표자명 입력" value={form.repNm} onChangeText={update("repNm")} />
        </View>
      ) : (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>· 대표자명</Text>
          <View style={s.readonlyBox}>
            <Text style={s.readonlyText}>{biz?.repNm || "-"}</Text>
          </View>
        </View>
      )}
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 전화번호</Text>
        <TextInput style={s.fieldInp} placeholder="선택" value={form.telNo} onChangeText={update("telNo")} keyboardType="phone-pad" />
      </View>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 이메일</Text>
        <TextInput style={s.fieldInp} placeholder="선택" value={form.emailAddr} onChangeText={update("emailAddr")} keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 업종</Text>
        <View style={s.readonlyBox}>
          <Text style={s.readonlyText}>
            {industries.find(ind => ind.indCd === form.indCd)?.indNm || "미지정"}
          </Text>
        </View>
      </View>
      {biz && (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>· 영업상태</Text>
          <View style={s.readonlyBox}>
            <Text style={s.readonlyText}>
              {oprSttCodes.find(c => c.cd === biz.bizStatus)?.cdNm || biz.bizStatus || "-"}
            </Text>
          </View>
        </View>
      )}
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 주소</Text>
        <TextInput style={s.fieldInp} placeholder="선택" value={form.addr} onChangeText={update("addr")} />
      </View>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>· 상세주소</Text>
        <TextInput style={s.fieldInp} placeholder="선택" value={form.addrDtl} onChangeText={update("addrDtl")} />
      </View>

      {!!formError && <Text style={s.error}>⚠️ {formError}</Text>}

      <View style={s.editBtnRow}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => setExpandedKey(null)} disabled={saving}>
          <Text style={s.cancelBtnText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>저장</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>
          {activeBizRegNo ? "사업장 조회 결과" : "사업장 목록"}
        </Text>
        {isSuper && (
          <TouchableOpacity style={s.addBtn} onPress={() => toggleExpand("__new__", null)}>
            <Text style={s.addBtnText}>{expandedKey === "__new__" ? "닫기" : "+ 새 사업장"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {expandedKey === "__new__" && (
            <View style={s.cardColumn}>
              {renderFields(null)}
            </View>
          )}

          {bizList.length === 0 && expandedKey !== "__new__" ? (
            <View style={s.center}><Text style={s.emptyText}>등록된 사업장이 없습니다</Text></View>
          ) : (
            bizList.map(biz => {
              const expanded = expandedKey === biz.bizRegNo;
              return (
                <View key={biz.bizRegNo} style={s.cardColumn}>
                  <TouchableOpacity style={s.card} onPress={() => toggleExpand(biz.bizRegNo, biz)} activeOpacity={0.75}>
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
                  {expanded && renderFields(biz)}
                </View>
              );
            })
          )}

          {!activeBizRegNo && hasMore && (
            <TouchableOpacity style={s.moreBtn} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? <ActivityIndicator color="#334155" /> : <Text style={s.moreBtnText}>더보기</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}
