import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform, StyleSheet } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";
import ConfirmModal from "../../components/ConfirmModal";

const IMAGE_MAX_DIMENSION = 1400;
const IMAGE_QUALITY = 0.85;

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

const digitsOnly = (v) => v.replace(/\D/g, "");

// indCd는 이 화면에서 편집하지 않지만, 저장 시 그대로 다시 보내야 기존 값이 안 지워진다.
const toForm = (biz) => ({
  bizNm: biz?.bizNm || "",
  repNm: biz?.repNm || "",
  telNo: biz?.telNo || "",
  mobileTel: biz?.mobileTel || "",
  emailAddr: biz?.emailAddr || "",
  addr: biz?.addr || "",
  addrDtl: biz?.addrDtl || "",
  indCd: biz?.indCd || "",
});

function SectionTitle({ label }) {
  return (
    <View style={[s.sectionTitleRow, s.sectionTitleRowFirst]}>
      <View style={s.sectionBar} />
      <Text style={s.sectionTitleText}>{label}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

export default function AdminBizProfile({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(toForm(null));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const [certUrl, setCertUrl] = useState(null);
  const [certUploading, setCertUploading] = useState(false);
  const [certError, setCertError] = useState("");

  const load = async () => {
    if (!bizRegNo) { setLoaded(true); return; }
    setLoaded(false);
    const biz = await api.biz.get(bizRegNo);
    setForm(toForm(biz));
    const url = await api.biz.getRegistrationCertUrl(bizRegNo);
    setCertUrl(url || null);
    setLoaded(true);
  };

  useEffect(() => { load(); }, [bizRegNo]);

  const update = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const submit = async () => {
    if (!form.bizNm.trim()) { setFormError("사업장명을 입력해주세요."); return; }
    setFormError("");
    setSaving(true);
    const payload = {
      bizNm: form.bizNm.trim(),
      repNm: form.repNm.trim() || null,
      telNo: form.telNo.trim() || null,
      mobileTel: form.mobileTel.trim() || null,
      emailAddr: form.emailAddr.trim() || null,
      indCd: form.indCd || null,
      addr: form.addr.trim() || null,
      addrDtl: form.addrDtl.trim() || null,
    };
    const { data, error } = await api.biz.update(bizRegNo, payload);
    setSaving(false);
    if (error || !data) {
      setFormError(error?.message || "저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setForm(toForm(data));
    setAlertMsg("기본정보가 저장되었습니다.");
  };

  const pickAndUploadCert = () => {
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
        const { error: uploadError } = await api.biz.uploadRegistrationCert(bizRegNo, formData);
        if (uploadError) {
          setCertError(uploadError?.message || "사업자등록증 업로드에 실패했습니다.");
        } else {
          const url = await api.biz.getRegistrationCertUrl(bizRegNo);
          setCertUrl(url || null);
        }
      } catch {
        setCertError("이미지 처리 중 오류가 발생했습니다.");
      }
      setCertUploading(false);
    };
    input.click();
  };

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>사업장 정보</Text>
      </View>

      {!loaded ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />
      ) : (
        <ScrollView contentContainerStyle={local.scroll}>
          <View style={s.newBizCard}>
            <SectionTitle label="기본 정보" />
            <View style={s.fieldGrid}>
              <View style={s.fieldBoxFull}>
                <TextInput style={s.fieldInput} placeholder="사업장명" value={form.bizNm} onChangeText={update("bizNm")} />
              </View>
              <View style={s.fieldBox}>
                <TextInput style={s.fieldInput} placeholder="대표자명" value={form.repNm} onChangeText={update("repNm")} />
              </View>
            </View>

            <SectionTitle label="연락처" />
            <View style={s.fieldGrid}>
              <View style={s.fieldBox}>
                <TextInput style={s.fieldInput} placeholder="전화번호 (숫자만)" value={form.telNo}
                  onChangeText={(v) => update("telNo")(digitsOnly(v).slice(0, 11))} keyboardType="number-pad" maxLength={11} />
              </View>
              <View style={s.fieldBox}>
                <TextInput style={s.fieldInput} placeholder="휴대폰번호 (숫자만)" value={form.mobileTel}
                  onChangeText={(v) => update("mobileTel")(digitsOnly(v).slice(0, 11))} keyboardType="number-pad" maxLength={11} />
              </View>
              <View style={s.fieldBoxFull}>
                <TextInput style={s.fieldInput} placeholder="이메일" value={form.emailAddr} onChangeText={update("emailAddr")}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <SectionTitle label="주소" />
            <View style={s.fieldGrid}>
              <View style={s.fieldBoxFull}>
                <TextInput style={s.fieldInput} placeholder="주소" value={form.addr} onChangeText={update("addr")} />
              </View>
              <View style={s.fieldBoxFull}>
                <TextInput style={s.fieldInput} placeholder="상세주소" value={form.addrDtl} onChangeText={update("addrDtl")} />
              </View>
            </View>

            {!!formError && <Text style={s.error}>⚠️ {formError}</Text>}

            <View style={s.btnRow}>
              <TouchableOpacity style={s.saveBtn} onPress={submit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>저장</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={[s.newBizCard, local.certCard]}>
            <SectionTitle label="사업자등록증" />
            {certUrl ? (
              <Image source={{ uri: certUrl }} style={local.certImage} resizeMode="contain" />
            ) : (
              <Text style={local.certMissing}>아직 업로드된 사업자등록증이 없습니다.</Text>
            )}
            {!!certError && <Text style={s.error}>⚠️ {certError}</Text>}
            <TouchableOpacity style={local.certUploadBtn} onPress={pickAndUploadCert} disabled={certUploading}>
              {certUploading
                ? <ActivityIndicator color="#1d3557" />
                : <Text style={local.certUploadBtnText}>{certUrl ? "다시 업로드" : "사업자등록증 사진 업로드"}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ConfirmModal visible={!!alertMsg} message={alertMsg} onConfirm={() => setAlertMsg(null)} />
    </View>
  );
}

const local = StyleSheet.create({
  scroll: { gap: 16, paddingBottom: 40 },
  certCard: { gap: 12 },
  certImage: { width: "100%", height: 260, borderRadius: 12, backgroundColor: "#f1f5f9", marginBottom: 4 },
  certMissing: { fontSize: 14, color: "#94a3b8", marginBottom: 4 },
  certUploadBtn: { borderWidth: 1.5, borderColor: "#1d3557", borderStyle: "dashed", borderRadius: 12, padding: 14, alignItems: "center" },
  certUploadBtnText: { fontSize: 15, fontWeight: "700", color: "#1d3557" },
});
