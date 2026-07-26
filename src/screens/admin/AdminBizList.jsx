import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";
import { formatBizRegNo } from "../../lib/formatBizRegNo";

const PAGE_SIZE = 10;
const IMAGE_MAX_DIMENSION = 1400;
const IMAGE_QUALITY = 0.85;
const emptyForm = { bizRegNo: "", bizNm: "", repNm: "", telNo: "", mobileTel: "", emailAddr: "", indCd: "", addr: "", addrDtl: "" };

const digitsOnly = (v) => v.replace(/\D/g, "");
const PLACEHOLDER_COLOR = "#94a3b8";

const toForm = (biz) => ({
  bizRegNo: biz?.bizRegNo || "",
  bizNm: biz?.bizNm || "",
  repNm: biz?.repNm || "",
  telNo: biz?.telNo || "",
  mobileTel: biz?.mobileTel || "",
  emailAddr: biz?.emailAddr || "",
  indCd: biz?.indCd || "",
  addr: biz?.addr || "",
  addrDtl: biz?.addrDtl || "",
});

// 메뉴/좌석 이미지 업로드와 동일한 방식으로 리사이즈/압축 (사업자등록증은 글자를 읽어야 해서 조금 더 크게)
function resizeAndCompressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했습니다."))), "image/jpeg", quality);
      };
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

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
  const [certUrl, setCertUrl] = useState(null);
  const [certUploading, setCertUploading] = useState(false);
  const [certError, setCertError] = useState("");

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
        const url = await api.biz.getRegistrationCertUrl(biz.bizRegNo);
        setCertUrl(url || null);
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
    setCertUrl(null);
    setCertError("");
    setExpandedKey(key);
    if (biz) {
      (async () => {
        const url = await api.biz.getRegistrationCertUrl(biz.bizRegNo);
        setCertUrl(url || null);
      })();
    }
  };

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const pickAndUploadCert = (bizRegNo) => {
    if (Platform.OS !== "web" || !bizRegNo) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setCertUploading(true); setCertError("");
      try {
        const blob = await resizeAndCompressImage(file, IMAGE_MAX_DIMENSION, IMAGE_QUALITY);
        const formData = new FormData();
        formData.append("file", blob, "cert.jpg");
        const { data, error: uploadError } = await api.biz.uploadRegistrationCert(bizRegNo, formData);
        if (uploadError) {
          setCertError(uploadError?.message || "사업자등록증 업로드에 실패했습니다.");
        } else {
          setCertUrl(data?.certUrl || null);
          // 인식된 값 중 비어있던 항목만 채워준다 — 이미 입력된 값은 덮어쓰지 않음.
          const extracted = data?.extracted;
          if (extracted) {
            setForm(f => ({
              ...f,
              bizNm: f.bizNm || extracted.bizNm || f.bizNm,
              repNm: f.repNm || extracted.repNm || f.repNm,
              addr: f.addr || extracted.addr || f.addr,
            }));
          }
          const fields = [
            extracted?.bizNm && `상호: ${extracted.bizNm}`,
            extracted?.repNm && `대표자: ${extracted.repNm}`,
            extracted?.addr && `주소: ${extracted.addr}`,
            extracted?.bizRegNo && `사업자등록번호: ${extracted.bizRegNo}`,
          ].filter(Boolean);
          setAlertMsg(fields.length
            ? `업로드 완료! 사업자등록증에서 다음 정보를 인식했어요.\n\n${fields.join("\n")}`
            : "업로드는 완료됐지만, 사업자등록증에서 정보를 인식하지 못했습니다.");
        }
      } catch {
        setCertError("이미지 처리 중 오류가 발생했습니다.");
      }
      setCertUploading(false);
    };
    input.click();
  };

  const indNm = (indCd) => industries.find(ind => ind.indCd === indCd)?.indNm || "미지정";
  const byIndCd = Object.fromEntries(industries.map(d => [d.indCd, d]));
  const indPathOf = (indCd) => {
    const path = [];
    let cur = byIndCd[indCd];
    while (cur) { path.unshift(cur); cur = cur.prntCd ? byIndCd[cur.prntCd] : null; }
    return path;
  };
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
      repNm: form.repNm.trim(),
      telNo: form.telNo.trim() || null,
      mobileTel: form.mobileTel.trim(),
      emailAddr: form.emailAddr.trim() || null,
      indCd: form.indCd || null,
      addr: form.addr.trim() || null,
      addrDtl: form.addrDtl.trim() || null,
    };
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
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={form.bizRegNo}
              onChangeText={update("bizRegNo")}
              keyboardType="numeric"
              {...focusHandlers("bizRegNo")}
            />
          </View>
        )}
        <View style={boxStyle(s.fieldBoxFull, "bizNm")}>
          <TextInput style={s.fieldInput} placeholder="사업장명" placeholderTextColor={PLACEHOLDER_COLOR} value={form.bizNm} onChangeText={update("bizNm")} {...focusHandlers("bizNm")} />
        </View>
        <View style={boxStyle(s.fieldBox, "repNm")}>
          <TextInput style={s.fieldInput} placeholder="대표자명" placeholderTextColor={PLACEHOLDER_COLOR} value={form.repNm} onChangeText={update("repNm")} {...focusHandlers("repNm")} />
        </View>
        <View style={s.fieldBox}>
          <Text style={s.fieldStatic}>{indNm(form.indCd)}</Text>
        </View>
        {biz && (
          <View style={s.fieldBox}>
            <Text style={s.fieldStatic}>{statusNm(biz)}</Text>
          </View>
        )}
      </View>

      {biz && (
        <>
          <SectionTitle label="사업자등록증" />
          {certUrl ? (
            <Image source={{ uri: certUrl }} style={s.certImage} resizeMode="contain" />
          ) : (
            <View style={s.certMissingBox}>
              <Text style={s.certMissing}>사업자등록증을 업로드하면 사업장 기본정보가 자동으로 입력됩니다.</Text>
            </View>
          )}
          {!!certError && <Text style={s.error}>⚠️ {certError}</Text>}
          <TouchableOpacity style={s.certUploadBtn} onPress={() => pickAndUploadCert(biz.bizRegNo)} disabled={certUploading}>
            {certUploading
              ? <ActivityIndicator color="#1d3557" />
              : <Text style={s.certUploadBtnText}>{certUrl ? "다시 업로드" : "사업자등록증 사진 업로드"}</Text>}
          </TouchableOpacity>
        </>
      )}

      <SectionTitle label="연락처" />
      <View style={s.fieldGrid}>
        <View style={boxStyle(s.fieldBox, "telNo")}>
          <TextInput style={s.fieldInput} placeholder="전화번호" placeholderTextColor={PLACEHOLDER_COLOR} value={form.telNo} onChangeText={update("telNo")} keyboardType="phone-pad" {...focusHandlers("telNo")} />
        </View>
        <View style={boxStyle(s.fieldBox, "mobileTel")}>
          <TextInput style={s.fieldInput} placeholder="휴대폰번호 (숫자만)" placeholderTextColor={PLACEHOLDER_COLOR} value={form.mobileTel}
            onChangeText={(v) => update("mobileTel")(digitsOnly(v).slice(0, 11))} keyboardType="number-pad" maxLength={11} {...focusHandlers("mobileTel")} />
        </View>
        <View style={boxStyle(s.fieldBoxFull, "emailAddr")}>
          <TextInput style={s.fieldInput} placeholder="이메일" placeholderTextColor={PLACEHOLDER_COLOR} value={form.emailAddr} onChangeText={update("emailAddr")} keyboardType="email-address" autoCapitalize="none" {...focusHandlers("emailAddr")} />
        </View>
      </View>

      <SectionTitle label="주소" />
      <View style={s.fieldGrid}>
        <View style={boxStyle(s.fieldBoxFull, "addr")}>
          <TextInput style={s.fieldInput} placeholder="주소" placeholderTextColor={PLACEHOLDER_COLOR} value={form.addr} onChangeText={update("addr")} {...focusHandlers("addr")} />
        </View>
        <View style={boxStyle(s.fieldBoxFull, "addrDtl")}>
          <TextInput style={s.fieldInput} placeholder="상세주소" placeholderTextColor={PLACEHOLDER_COLOR} value={form.addrDtl} onChangeText={update("addrDtl")} {...focusHandlers("addrDtl")} />
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
                <View key={biz.bizRegNo} style={s.bizCard}>
                  <TouchableOpacity style={s.noOutline} onPress={() => toggleExpand(biz.bizRegNo, biz)} activeOpacity={0.85}>
                    <View style={s.bizBand}>
                      <View style={s.bizBandLeft}>
                        <Text style={s.bizNm} numberOfLines={1}>{biz.bizNm}</Text>
                        <Text style={s.bizRegNo}>{formatBizRegNo(biz.bizRegNo)}</Text>
                      </View>
                      <View style={s.statusPill}>
                        <View style={[s.statusDot, { backgroundColor: open ? "#4ade80" : "#94a3b8" }]} />
                        <Text style={s.statusPillText}>{statusNm(biz)}</Text>
                      </View>
                    </View>

                    <View style={s.bizStrip}>
                      <View style={s.stripTile}>
                        {indPathOf(biz.indCd).length === 0 ? (
                          <Text style={s.stripValue} numberOfLines={1}>미지정</Text>
                        ) : (
                          <View style={s.indPathRow}>
                            {indPathOf(biz.indCd).map((node, i, arr) => {
                              const isLast = i === arr.length - 1;
                              return (
                                <View key={node.indCd} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                  {i > 0 && <Text style={s.indPathSep}>›</Text>}
                                  <View style={[s.indPathPill, isLast && s.indPathPillCurrent]}>
                                    <Text style={[s.indPathPillText, isLast && s.indPathPillTextCurrent]}>{node.indNm}</Text>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
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
