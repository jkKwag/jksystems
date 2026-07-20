import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
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

const BAND_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #64748b 0%, #22c55e 100%)" }
  : {};

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
  const [focusedField, setFocusedField] = useState(null);

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

  const indNm = (indCd) => industries.find(ind => ind.indCd === indCd)?.indNm || "미지정";
  const statusNm = (biz) => oprSttCodes.find(c => c.cd === biz?.bizStatus)?.cdNm || biz?.bizStatus || "-";
  const isOpenStatus = (biz) => biz?.bizStatus === "O";

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

  const focusHandlers = (key) => ({
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(f => (f === key ? null : f)),
  });
  const boxStyle = (base, key) => [base, focusedField === key && s.fieldBoxFocused];

  const SectionTitle = ({ label, first }) => (
    <View style={[s.sectionTitleRow, first && s.sectionTitleRowFirst]}>
      <View style={s.sectionBar} />
      <Text style={s.sectionTitleText}>{label}</Text>
      <View style={s.sectionRule} />
    </View>
  );

  const renderFields = (biz) => (
    <View style={s.detailInner}>
      <SectionTitle label="기본 정보" first />
      <View style={s.fieldGrid}>
        {expandedKey === "__new__" && (
          <View style={boxStyle(s.fieldBoxFull, "bizRegNo")}>
            <TextInput
              style={s.fieldInput}
              placeholder="사업자등록번호 (숫자만)"
              value={form.bizRegNo}
              onChangeText={update("bizRegNo")}
              keyboardType="numeric"
              {...focusHandlers("bizRegNo")}
            />
          </View>
        )}
        <View style={boxStyle(s.fieldBoxFull, "bizNm")}>
          <TextInput style={s.fieldInput} placeholder="사업장명" value={form.bizNm} onChangeText={update("bizNm")} {...focusHandlers("bizNm")} />
        </View>
        {expandedKey === "__new__" ? (
          <View style={boxStyle(s.fieldBox, "repNm")}>
            <TextInput style={s.fieldInput} placeholder="대표자명" value={form.repNm} onChangeText={update("repNm")} {...focusHandlers("repNm")} />
          </View>
        ) : (
          <View style={s.fieldBox}>
            <Text style={s.fieldStatic}>{biz?.repNm || "-"}</Text>
          </View>
        )}
        <View style={s.fieldBox}>
          <Text style={s.fieldStatic}>{indNm(form.indCd)}</Text>
        </View>
        {biz && (
          <View style={s.fieldBox}>
            <Text style={s.fieldStatic}>{statusNm(biz)}</Text>
          </View>
        )}
      </View>

      <SectionTitle label="연락처" />
      <View style={s.fieldGrid}>
        <View style={boxStyle(s.fieldBoxFull, "telNo")}>
          <TextInput style={s.fieldInput} placeholder="전화번호" value={form.telNo} onChangeText={update("telNo")} keyboardType="phone-pad" {...focusHandlers("telNo")} />
        </View>
        <View style={boxStyle(s.fieldBoxFull, "emailAddr")}>
          <TextInput style={s.fieldInput} placeholder="이메일" value={form.emailAddr} onChangeText={update("emailAddr")} keyboardType="email-address" autoCapitalize="none" {...focusHandlers("emailAddr")} />
        </View>
      </View>

      <SectionTitle label="주소" />
      <View style={s.fieldGrid}>
        <View style={boxStyle(s.fieldBoxFull, "addr")}>
          <TextInput style={s.fieldInput} placeholder="주소" value={form.addr} onChangeText={update("addr")} {...focusHandlers("addr")} />
        </View>
        <View style={boxStyle(s.fieldBoxFull, "addrDtl")}>
          <TextInput style={s.fieldInput} placeholder="상세주소" value={form.addrDtl} onChangeText={update("addrDtl")} {...focusHandlers("addrDtl")} />
        </View>
      </View>

      {!!formError && <Text style={s.error}>⚠️ {formError}</Text>}

      <View style={s.btnRow}>
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
            <View style={s.newBizCard}>
              {renderFields(null)}
            </View>
          )}

          {bizList.length === 0 && expandedKey !== "__new__" ? (
            <View style={s.center}><Text style={s.emptyText}>등록된 사업장이 없습니다</Text></View>
          ) : (
            bizList.map(biz => {
              const expanded = expandedKey === biz.bizRegNo;
              const open = isOpenStatus(biz);
              return (
                <View key={biz.bizRegNo} style={[s.bizCard, expanded && s.bizCardOpen]}>
                  <TouchableOpacity style={s.noOutline} onPress={() => toggleExpand(biz.bizRegNo, biz)} activeOpacity={0.85}>
                    <View style={[s.bizBand, BAND_GRADIENT]}>
                      <View style={s.bizBandLeft}>
                        <Text style={s.bizNm} numberOfLines={1}>{biz.bizNm}</Text>
                        <Text style={s.bizRegNo}>{biz.bizRegNo}</Text>
                      </View>
                      <View style={s.statusPill}>
                        <View style={[s.statusDot, { backgroundColor: open ? "#4ade80" : "#94a3b8" }]} />
                        <Text style={s.statusPillText}>{statusNm(biz)}</Text>
                      </View>
                    </View>

                    <View style={s.bizStrip}>
                      <View style={s.stripTile}>
                        <Text style={s.stripValue} numberOfLines={1}>{biz.telNo || "연락처 없음"}</Text>
                      </View>
                      <View style={s.stripTile}>
                        <Text style={s.stripValue} numberOfLines={1}>{indNm(biz.indCd)}</Text>
                      </View>
                    </View>

                    <View style={s.bizFooter}>
                      <Text style={s.bizAddr} numberOfLines={1}>
                        {[biz.addr, biz.addrDtl].filter(Boolean).join(" ") || "주소 미등록"}
                      </Text>
                      {onSelectBiz && biz.bizRegNo !== activeBizRegNo && (
                        <TouchableOpacity style={s.selectBtn} onPress={(e) => { e?.stopPropagation?.(); onSelectBiz(biz.bizRegNo); }}>
                          <Text style={s.selectBtnText}>이 사업장 조회</Text>
                        </TouchableOpacity>
                      )}
                      <Text style={[s.chev, expanded && s.chevOpen]}>›</Text>
                    </View>
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
