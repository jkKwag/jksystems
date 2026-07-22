import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator, Image, Platform } from "react-native";
import { s } from "../../styles/admin/MenuFormModal.styles";
import api from "../../lib/api";

const emptyForm = { bizCatCd: "", menuNm: "", menuDesc: "", price: "", imgUrl: "", badge: "", sortOrd: "", useYn: "Y" };

const IMAGE_MAX_DIMENSION = 1000;
const IMAGE_QUALITY = 0.8;

// 사이트 상단 헤더와 동일한 남색→녹색 그라데이션 (웹 전용, RN 네이티브는 primary 단색으로 대체)
const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

// 긴 변 기준으로 축소하고 JPEG로 압축해 업로드 용량을 줄인다 (사용자 화면 메뉴상세 이미지와 동일한 처리)
function resizeAndCompressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했습니다."))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

const emptyFieldErrors = { bizCatCd: "", menuNm: "", price: "" };

export default function MenuFormModal({ visible, initial, categories, saving, bizRegNo, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [uploading, setUploading] = useState(false);
  const [imgStatus, setImgStatus] = useState(null); // null | "success" | "error"
  const [imgError, setImgError] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setForm({
        bizCatCd: initial.bizCatCd || "",
        menuNm: initial.menuNm || "",
        menuDesc: initial.menuDesc || "",
        price: initial.price != null ? String(initial.price) : "",
        imgUrl: initial.imgUrl || "",
        badge: initial.badge || "",
        sortOrd: initial.sortOrd != null ? String(initial.sortOrd) : "",
        useYn: initial.useYn || "Y",
      });
    } else {
      setForm({ ...emptyForm, bizCatCd: categories?.[0]?.bizCatCd || "" });
    }
    setFieldErrors(emptyFieldErrors);
    setImgStatus(null);
    setImgError("");
  }, [visible, initial]);

  if (!visible) return null;

  const update = (key) => (v) => {
    setForm(f => ({ ...f, [key]: v }));
    setFieldErrors(fe => (fe[key] ? { ...fe, [key]: "" } : fe));
  };

  const pickAndUploadImage = () => {
    if (Platform.OS !== "web" || !bizRegNo) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      setImgStatus(null);
      setImgError("");
      try {
        const blob = await resizeAndCompressImage(file, IMAGE_MAX_DIMENSION, IMAGE_QUALITY);
        const formData = new FormData();
        formData.append("file", blob, "image.jpg");
        const { data, error: uploadError } = await api.biz.uploadMenuImage(bizRegNo, formData);
        if (uploadError || !data?.url) {
          setImgStatus("error");
          const detail = uploadError?.message || uploadError?.error;
          setImgError(detail ? `이미지 업로드에 실패했습니다: ${detail}` : "이미지 업로드에 실패했습니다.");
        } else {
          update("imgUrl")(data.url);
          setImgStatus("success");
        }
      } catch {
        setImgStatus("error");
        setImgError("이미지 처리 중 오류가 발생했습니다.");
      }
      setUploading(false);
    };
    input.click();
  };

  const submit = () => {
    const price = Number(form.price);
    const errors = {
      bizCatCd: form.bizCatCd ? "" : "카테고리를 선택해주세요.",
      menuNm: form.menuNm.trim() ? "" : "메뉴명을 입력해주세요.",
      price: (!form.price || Number.isNaN(price) || price < 0) ? "가격을 올바르게 입력해주세요." : "",
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    onSave({
      bizCatCd: form.bizCatCd,
      menuNm: form.menuNm.trim(),
      menuDesc: form.menuDesc.trim() || null,
      price,
      imgUrl: form.imgUrl.trim() || null,
      badge: form.badge.trim() || null,
      sortOrd: form.sortOrd ? Number(form.sortOrd) : null,
      useYn: form.useYn,
    });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.title}>{initial ? "메뉴 수정" : "새 메뉴 등록"}</Text>
          </View>

          <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={s.label}>카테고리</Text>
              <View style={s.chipBox}>
                <View style={s.chipRow}>
                  {(categories || []).map(c => (
                    <TouchableOpacity
                      key={c.bizCatCd}
                      style={[s.chip, form.bizCatCd === c.bizCatCd && s.chipActive]}
                      onPress={() => update("bizCatCd")(c.bizCatCd)}
                    >
                      <Text style={[s.chipText, form.bizCatCd === c.bizCatCd && s.chipTextActive]}>{c.bizCatNm}</Text>
                    </TouchableOpacity>
                  ))}
                  {(!categories || categories.length === 0) && <Text style={s.noCatText}>등록된 카테고리가 없습니다</Text>}
                </View>
              </View>
              {!!fieldErrors.bizCatCd && <Text style={s.fieldError}>{fieldErrors.bizCatCd}</Text>}
            </View>

            <View>
              <Text style={s.label}>메뉴명</Text>
              <TextInput style={s.inp} placeholder="메뉴명 입력" value={form.menuNm} onChangeText={update("menuNm")} />
              {!!fieldErrors.menuNm && <Text style={s.fieldError}>{fieldErrors.menuNm}</Text>}
            </View>

            <View>
              <Text style={s.label}>설명</Text>
              <TextInput style={[s.inp, s.inpMultiline]} placeholder="메뉴 설명 (선택)" value={form.menuDesc} onChangeText={update("menuDesc")} multiline />
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>가격</Text>
                <TextInput style={s.inp} placeholder="0" value={form.price} onChangeText={update("price")} keyboardType="numeric" />
                {!!fieldErrors.price && <Text style={s.fieldError}>{fieldErrors.price}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>뱃지</Text>
                <TextInput style={s.inp} placeholder="인기 등 (선택)" value={form.badge} onChangeText={update("badge")} />
              </View>
            </View>

            <View>
              <View style={s.imgLabelRow}>
                <Text style={s.label}>이미지 URL</Text>
                <View style={s.imgActionRow}>
                  {imgStatus === "success" && <Text style={s.imgCheck}>✓</Text>}
                  <TouchableOpacity style={s.uploadBtn} onPress={pickAndUploadImage} disabled={uploading}>
                    {uploading
                      ? <ActivityIndicator size="small" color="#f97316" />
                      : <Text style={s.uploadBtnText}>이미지 업로드</Text>}
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={s.inp}
                placeholder="https:// (선택)"
                value={form.imgUrl}
                onChangeText={(v) => { update("imgUrl")(v); setImgStatus(null); setImgError(""); }}
                autoCapitalize="none"
              />
              {imgStatus === "error" && !!imgError && <Text style={s.imgErrorText}>{imgError}</Text>}
              {!!form.imgUrl && (
                <View style={s.imgPreviewBox}>
                  <Image source={{ uri: form.imgUrl }} style={s.imgPreview} resizeMode="cover" />
                </View>
              )}
            </View>

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>정렬순서</Text>
                <TextInput style={s.inp} placeholder="자동" value={form.sortOrd} onChangeText={update("sortOrd")} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20 }}>
                <Text style={s.label}>노출여부</Text>
                <Switch
                  value={form.useYn === "Y"}
                  onValueChange={(v) => update("useYn")(v ? "Y" : "N")}
                />
              </View>
            </View>
          </ScrollView>

          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={submit} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>저장</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
