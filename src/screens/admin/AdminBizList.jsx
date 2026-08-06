import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, Platform } from "react-native";
import { PaddleOcrService, V5_KOREAN_MOBILE_MODEL } from "ppu-paddle-ocr/web";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";
import { formatBizRegNo } from "../../lib/formatBizRegNo";

const PAGE_SIZE = 10;
const IMAGE_MAX_DIMENSION = 1400;
const IMAGE_QUALITY = 0.85;
const emptyForm = { bizRegNo: "", bizNm: "", repNm: "", telNo: "", mobileTel: "", emailAddr: "", indCd: "", addr: "", addrDtl: "" };

// 가입 시 상호명을 안 받은 사업자는 백엔드가 이 값으로 채워둔다 — 실제 값이 아니므로
// 사업자등록증 인식 결과로 채울 때는 "비어있는 값"과 동일하게 취급해야 한다.
const PLACEHOLDER_BIZ_NM = "사업장명 미입력";

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

// 업로드/인식 두 번의 요청에 같은 이미지를 보내야 해서 매번 새 FormData로 감싼다.
function buildCertFormData(blob) {
  const formData = new FormData();
  formData.append("file", blob, "cert.jpg");
  return formData;
}

// PaddleOcrService 초기화는 모델을 네트워크에서 받아오는 무거운 작업이라, 세션 동안 한 번만 만들어서 재사용한다.
let paddleServicePromise = null;
function getPaddleService() {
  if (!paddleServicePromise) {
    paddleServicePromise = (async () => {
      const service = new PaddleOcrService({ model: V5_KOREAN_MOBILE_MODEL });
      await service.initialize();
      return service;
    })();
  }
  return paddleServicePromise;
}

const CERT_LABEL_FIELDS = [
  { key: "bizNm", labels: ["상호(법인명)", "성명(법인명)", "법인명(단체명)", "상호"] },
  { key: "repNm", labels: ["성명(대표자)", "대표자"] },
  { key: "addr", labels: ["사업장소재지", "본점소재지", "소재지"] },
];
// 여는 괄호는 라벨 잔여물("(법인명)"의 남은 "(")일 수 있어 앞쪽만 지운다 — 뒤쪽 ")"는
// 주소값 자체에 속한 경우가 많아("...코아루천년가)") 그대로 둔다.
const CERT_VALUE_LEADING_TRIM_RE = /^[\s:：(]+/;
const CERT_VALUE_TRAILING_TRIM_RE = /[\s:：]+$/;
// 대표자명이 영문일 수도 있어 "한글이 아니면 다 잘라내기"는 위험하다 — 서식의 동그라미(○)
// 표시가 알파벳 O/o 등으로 잘못 인식돼 한 글자만 붙는, 흔히 알려진 패턴만 좁게 잘라낸다.
const STRAY_MARK_TAIL_RE = /[○●◯OoVv]$/;

// 사업자등록증은 "상호 OOO   성명(대표자) 홍길동"처럼 한 줄에 라벨 여러 개가 같이 나오는 경우가 많다.
// 그래서 한 줄 안에서 라벨들의 위치를 다 찾은 뒤, 각 라벨 값은 "그 라벨 끝 ~ 다음 라벨 시작 전"까지로 잘라낸다
// (라벨 하나만 지우고 나머지를 통째로 값으로 삼으면 다른 라벨/값이 섞여 들어간다).
// 도로명주소는 보통 "기본주소, 상세주소" 순서라 첫 콤마를 기준으로 나눈다.
function splitAddr(value) {
  const commaIdx = value.indexOf(",");
  if (commaIdx === -1) return { addr: value, addrDtl: "" };
  return { addr: value.slice(0, commaIdx).trim(), addrDtl: value.slice(commaIdx + 1).trim() };
}

function extractCertFields(lineTexts) {
  const result = { bizNm: "", repNm: "", addr: "", addrDtl: "" };
  lineTexts.forEach((rawLine, lineIdx) => {
    // "사 업 장 소 재 지"처럼 라벨 글자 사이에 공백이 섞여 인식되는 경우가 있어 공백을 지우고 비교한다.
    const line = rawLine.replace(/\s/g, "");
    const matches = [];
    CERT_LABEL_FIELDS.forEach(({ key, labels }) => {
      labels.forEach(label => {
        let idx = line.indexOf(label);
        while (idx !== -1) {
          matches.push({ key, start: idx, end: idx + label.length, len: label.length });
          idx = line.indexOf(label, idx + 1);
        }
      });
    });
    if (matches.length === 0) return;
    // 같은 자리에서 짧은 라벨("상호")이 긴 라벨("상호(법인명)") 안에도 매칭되므로, 겹치면 긴 쪽만 남긴다.
    matches.sort((a, b) => a.start - b.start || b.len - a.len);
    const filtered = [];
    let lastEnd = -1;
    matches.forEach(m => {
      if (m.start < lastEnd) return;
      filtered.push(m);
      lastEnd = m.end;
    });

    filtered.forEach((m, i) => {
      if (result[m.key]) return; // 이미 다른 줄에서 먼저 찾았으면 유지
      const nextStart = filtered[i + 1] ? filtered[i + 1].start : line.length;
      let value = line.slice(m.end, nextStart)
        .replace(CERT_VALUE_LEADING_TRIM_RE, "")
        .replace(CERT_VALUE_TRAILING_TRIM_RE, "")
        .trim();
      if (!value && lineTexts[lineIdx + 1]) value = lineTexts[lineIdx + 1].trim();
      if (m.key === "repNm") value = value.replace(STRAY_MARK_TAIL_RE, "");
      if (m.key === "addr") {
        const split = splitAddr(value);
        result.addr = split.addr;
        result.addrDtl = split.addrDtl;
        return;
      }
      result[m.key] = value;
    });
  });
  return result;
}

// 1차 인식 결과(주민번호가 그대로 담긴 텍스트)는 위치를 찾아 마스킹하는 데만 쓰고 버린다.
// 상호/대표자/주소 추출과 화면 표시(알럿)는 마스킹이 끝난 뒤 캔버스를 다시 읽은 2차 결과만 사용한다 —
// 이러면 주민번호 부분은 이미 까맣게 가려진 뒤라 애초에 텍스트로 뽑힐 수가 없다.
async function maskAndExtractCertInfo(canvas) {
  const service = await getPaddleService();

  // ppu-paddle-ocr는 이미지 처음 1024바이트만으로 캐시 키를 만들어서, 마스킹으로 바뀐 부분이
  // 그 안에 없으면 두 번째 호출이 진짜로 다시 인식하지 않고 1차 결과를 그대로 돌려준다 —
  // noCache로 반드시 꺼야 마스킹 후 재인식이 의미가 있다.
  const { lines: rawLines } = await service.recognize(canvas, { noCache: true });
  if (!rawLines || rawLines.length === 0) {
    // 글자를 한 줄도 못 읽었다는 건 인식 자체가 실패했다는 뜻 — 마스킹을 확신할 수 없으니 에러로 처리.
    throw new Error("이미지에서 글자를 인식하지 못했습니다.");
  }
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  let maskedAny = false;
  rawLines.forEach(items => {
    const text = items.map(item => item.text).join("").replace(/\s/g, "");
    if (!text.includes("주민") || !text.includes("등록번호")) return;
    const y0 = Math.min(...items.map(item => item.box.y));
    const y1 = Math.max(...items.map(item => item.box.y + item.box.height));
    const lineHeight = y1 - y0;
    const pad = Math.max(2, Math.round(lineHeight * 0.2));
    ctx.fillRect(0, Math.max(0, y0 - pad), canvas.width, lineHeight + pad * 2);
    maskedAny = true;
  });

  const { lines: safeLines } = await service.recognize(canvas, { noCache: true });
  const lineTexts = (safeLines || []).map(items => items.map(item => item.text).join(""));
  const extracted = extractCertFields(lineTexts);

  // TODO: 원인 파악되면 lineTexts는 빼고 maskedAny/extracted만 반환하도록 되돌릴 것 (진단용).
  return { maskedAny, lineTexts, extracted };
}

// 글자가 작으면 Tesseract가 잘 못 읽어서, 원본을 이만큼 확대한 캔버스에서 인식/마스킹한다.
const OCR_UPSCALE_FACTOR = 2;
const OCR_UPSCALE_MAX_DIMENSION = 3500; // 너무 커지면 느려지니 상한을 둔다

// 원본을 확대한 캔버스에 그려서 인식/마스킹한 뒤, 그 결과만 리사이즈/압축해서 반환한다 —
// 마스킹 전 원본은 이 함수 밖으로 나가지 않음.
async function maskAndCompressCertImage(file, maxDim, quality) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    image.src = dataUrl;
  });

  const upscale = Math.min(
    OCR_UPSCALE_FACTOR,
    OCR_UPSCALE_MAX_DIMENSION / Math.max(img.width, img.height),
  );
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = Math.round(img.width * upscale);
  sourceCanvas.height = Math.round(img.height * upscale);
  sourceCanvas.getContext("2d").drawImage(img, 0, 0, sourceCanvas.width, sourceCanvas.height);
  const { maskedAny, lineTexts, extracted } = await maskAndExtractCertInfo(sourceCanvas);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
    else { width = Math.round((width * maxDim) / height); height = maxDim; }
  }
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  outputCanvas.getContext("2d").drawImage(sourceCanvas, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) => {
    outputCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지 변환에 실패했습니다."))), "image/jpeg", quality);
  });
  return { blob, maskedAny, lineTexts, extracted };
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
  const [certZoomVisible, setCertZoomVisible] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomTranslate, setZoomTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const [certMasking, setCertMasking] = useState(false);
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
      setCertError("");
      try {
        // 주민번호로 보이는 줄을 먼저 가리고, 상호/대표자/주소도 같은 인식 결과에서 뽑아낸다.
        // 여기서 실패하면(엔진 로딩 실패 등) 곧장 catch로 빠져서 업로드 자체를 진행하지 않음.
        setCertMasking(true);
        const { blob, extracted } = await maskAndCompressCertImage(file, IMAGE_MAX_DIMENSION, IMAGE_QUALITY);
        setCertMasking(false);

        setCertUploading(true);
        const { data, error: uploadError } = await api.biz.uploadRegistrationCert(bizRegNo, buildCertFormData(blob));
        if (uploadError) {
          setCertError(uploadError?.message || "사업자등록증 업로드에 실패했습니다.");
          setCertUploading(false);
          return;
        }
        setCertUrl(data?.certUrl || null);
        setCertUploading(false);

        // 업로드된 사업자번호로 국세청 상태조회(계속사업자/휴업자/폐업자)를 바로 재확인한다.
        const { data: ntsData } = await api.biz.checkNtsStatus(bizRegNo);
        const ntsMsg = `[국세청 상태] ${ntsData?.display || "확인 불가"}`;

        // 인식된 값 중 비어있던 항목만 채워준다 — 이미 입력된 값은 덮어쓰지 않음.
        // (가입 시 채워진 상호명 placeholder는 실값이 아니므로 비어있는 것으로 취급)
        setForm(f => ({
          ...f,
          bizNm: (f.bizNm && f.bizNm !== PLACEHOLDER_BIZ_NM) ? f.bizNm : (extracted.bizNm || f.bizNm),
          repNm: f.repNm || extracted.repNm || f.repNm,
          addr: f.addr || extracted.addr || f.addr,
          addrDtl: f.addrDtl || extracted.addrDtl || f.addrDtl,
        }));

        const fields = [
          extracted.bizNm && `상호: ${extracted.bizNm}`,
          extracted.repNm && `대표자: ${extracted.repNm}`,
          extracted.addr && `주소: ${extracted.addr}`,
          extracted.addrDtl && `상세주소: ${extracted.addrDtl}`,
        ].filter(Boolean);
        const extractMsg = fields.length ? `[인식된 정보]\n${fields.join("\n")}` : "[인식된 정보] 없음";
        setAlertMsg(`${ntsMsg}\n${extractMsg}\n마스킹했을경우에만 주민번호는 마스킹 처리 하였습니다`);
      } catch {
        setCertError("이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setCertMasking(false);
      setCertUploading(false);
    };
    input.click();
  };

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

    const subspt = await api.biz.getSubscription(data.bizRegNo);
    setAlertMsg(
      subspt?.status === "ACTIVE"
        ? "저장 되었습니다."
        : "사업장 정보는 저장 되었습니다.\n구독료를 결제하면 바로 사용 가능합니다."
    );
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
      {biz && (
        <>
          <SectionTitle label="사업자등록증 검증" first />
          {certUrl ? (
            <TouchableOpacity onPress={() => setCertZoomVisible(true)}>
              <Image source={{ uri: certUrl }} style={s.certImage} resizeMode="contain" />
            </TouchableOpacity>
          ) : (
            <View style={s.certMissingBox}>
              <Text style={s.certMissing}>사업자등록증을 업로드하면 사업장 기본정보가 자동으로 입력됩니다.</Text>
            </View>
          )}
          {!!certError && <Text style={s.error}>⚠️ {certError}</Text>}
          <TouchableOpacity style={s.certUploadBtn} onPress={() => pickAndUploadCert(biz.bizRegNo)} disabled={certMasking || certUploading}>
            {certMasking || certUploading
              ? <ActivityIndicator color="#1d3557" />
              : <Text style={s.certUploadBtnText}>{certUrl ? "다시 업로드" : "사업자등록증 사진 업로드"}</Text>}
          </TouchableOpacity>
          {certMasking && <Text style={s.certExtracting}>사업자등록증을 읽는 중이에요... (처음엔 조금 걸릴 수 있어요)</Text>}
        </>
      )}

      <SectionTitle label="기본 정보" />
      <View style={s.fieldGrid}>
        {expandedKey === "__new__" ? (
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
        ) : (
          <View style={[s.fieldBoxFull, s.fieldBoxReadOnly]}>
            <Text style={[s.fieldInput, s.fieldInputReadOnly]}>{formatBizRegNo(form.bizRegNo)}</Text>
          </View>
        )}
        <View style={boxStyle(s.fieldBoxFull, "bizNm")}>
          <TextInput style={s.fieldInput} placeholder="사업장명" placeholderTextColor={PLACEHOLDER_COLOR} value={form.bizNm} onChangeText={update("bizNm")} {...focusHandlers("bizNm")} />
        </View>
        <View style={boxStyle(s.fieldBox, "repNm")}>
          <TextInput style={s.fieldInput} placeholder="대표자명" placeholderTextColor={PLACEHOLDER_COLOR} value={form.repNm} onChangeText={update("repNm")} {...focusHandlers("repNm")} />
        </View>
      </View>

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

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;

  const resetZoom = () => {
    setZoomScale(1);
    setZoomTranslate({ x: 0, y: 0 });
  };

  const closeZoom = () => {
    setCertZoomVisible(false);
    resetZoom();
  };

  const touchDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  const handleZoomWheel = (e) => {
    e.preventDefault?.();
    const delta = -e.deltaY * 0.0015;
    setZoomScale(s => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s + delta)));
  };

  const handleZoomTouchStart = (e) => {
    const touches = e.nativeEvent.touches;
    if (touches.length === 2) {
      pinchRef.current = { startDistance: touchDistance(touches), startScale: zoomScale };
    } else if (touches.length === 1 && zoomScale > 1) {
      panRef.current = { startX: touches[0].pageX, startY: touches[0].pageY, startTranslate: zoomTranslate };
    }
  };

  const handleZoomTouchMove = (e) => {
    const touches = e.nativeEvent.touches;
    if (touches.length === 2 && pinchRef.current) {
      const scale = pinchRef.current.startScale * (touchDistance(touches) / pinchRef.current.startDistance);
      setZoomScale(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale)));
    } else if (touches.length === 1 && panRef.current) {
      const dx = touches[0].pageX - panRef.current.startX;
      const dy = touches[0].pageY - panRef.current.startY;
      setZoomTranslate({ x: panRef.current.startTranslate.x + dx, y: panRef.current.startTranslate.y + dy });
    }
  };

  const handleZoomTouchEnd = (e) => {
    const remaining = e.nativeEvent.touches.length;
    if (remaining < 2) pinchRef.current = null;
    if (remaining === 0) panRef.current = null;
  };

  const handleZoomDoubleClick = () => {
    if (zoomScale > 1) resetZoom();
    else setZoomScale(2);
  };

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

      <Modal visible={certZoomVisible} transparent animationType="fade" onRequestClose={closeZoom}>
        <View style={s.certZoomBackdrop}>
          <TouchableOpacity style={s.certZoomCloseBtn} onPress={closeZoom}>
            <Text style={s.certZoomCloseBtnText}>✕</Text>
          </TouchableOpacity>
          <View
            style={s.certZoomImageWrap}
            onWheel={handleZoomWheel}
            onTouchStart={handleZoomTouchStart}
            onTouchMove={handleZoomTouchMove}
            onTouchEnd={handleZoomTouchEnd}
            onDoubleClick={handleZoomDoubleClick}
          >
            <Image
              source={{ uri: certUrl }}
              style={[s.certZoomImage, {
                transform: [
                  { translateX: zoomTranslate.x },
                  { translateY: zoomTranslate.y },
                  { scale: zoomScale },
                ],
              }]}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
