import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminAccounts.styles";
import GradientHeader from "../GradientHeader";
import api from "../../lib/api";
import { isPasskeyAvailable, createPasskeyCredential } from "../../platform/passkey";

const pad = (n) => String(n).padStart(2, "0");
const formatDt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

// 본인 계정에 등록된 패스키(지문) 기기 목록 조회/등록/삭제. 계정 관리 화면에서 본인 행에만 뜨는
// "지문 등록" 버튼으로 연다 (슈퍼관리자는 백엔드에서부터 등록을 막아서 이 버튼 자체를 안 보여준다).
export default function PasskeyManageModal({ visible, onClose }) {
  const [devices, setDevices] = useState(null);
  const [supported, setSupported] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    // GET 헬퍼(api.js의 get())는 {data,error} 래핑 없이 결과를 그대로 반환한다 — POST/PUT/DELETE와 다름.
    const list = await api.admin.passkeyDevices();
    setDevices(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    if (!visible) return;
    setError(""); setNewLabel("");
    load();
    isPasskeyAvailable().then(setSupported);
  }, [visible]);

  const register = async () => {
    setRegistering(true); setError("");
    try {
      const { data: options, error: optError } = await api.admin.passkeyRegisterOptions();
      if (optError || !options) throw new Error(optError?.message || "등록 옵션을 가져오지 못했습니다.");
      const credentialJson = await createPasskeyCredential(options);
      const { error: regError } = await api.admin.passkeyRegister({
        credentialJson, platform: "WEB", deviceLabel: newLabel.trim() || null,
      });
      if (regError) throw new Error(regError?.message || "패스키 등록에 실패했습니다.");
      setNewLabel("");
      await load();
    } catch (e) {
      if (e?.name !== "NotAllowedError") setError(e?.message || "패스키 등록 중 문제가 발생했습니다.");
    } finally {
      setRegistering(false);
    }
  };

  const removeDevice = async (credId) => {
    await api.admin.passkeyDeleteDevice(credId);
    await load();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.pwOverlay}>
        <View style={s.pwCard}>
          <GradientHeader style={s.pwHeader}>
            <Text style={s.pwHeaderTitle}>지문(패스키) 관리</Text>
          </GradientHeader>
          <View style={s.pwBody}>
          <Text style={s.pwFieldHint}>등록해두면 다음부터 비밀번호 대신 이 기기의 지문/Face ID로 로그인할 수 있어요.</Text>

          {devices === null ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#f97316" />
          ) : (
            <View style={{ marginTop: 10, marginBottom: 6 }}>
              {devices.length === 0 ? (
                <Text style={[s.pwFieldHint, { textAlign: "center" }]}>등록된 기기가 없습니다.</Text>
              ) : (
                devices.map(d => (
                  <View key={d.credId} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{d.deviceLabel || `${d.platform} 기기`}</Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                        등록 {formatDt(d.regDt)}{d.lastUsedDt ? ` · 마지막 사용 ${formatDt(d.lastUsedDt)}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeDevice(d.credId)}>
                      <Text style={{ fontSize: 13, color: "#dc2626", fontWeight: "700" }}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {supported === false ? (
            <Text style={[s.pwFieldHint, { textAlign: "center" }]}>이 브라우저/기기에서는 패스키를 지원하지 않아요.</Text>
          ) : (
            <>
              <View style={s.pwFieldWrap}>
                <TextInput
                  style={s.pwInput}
                  placeholder="기기 이름 (선택, 예: 사무실 노트북)"
                  placeholderTextColor="#94a3b8"
                  value={newLabel}
                  onChangeText={setNewLabel}
                />
              </View>
              {!!error && <Text style={s.pwFieldError}>{error}</Text>}
              <View style={s.pwBtnRow}>
                <TouchableOpacity style={s.pwCancelBtn} onPress={onClose} disabled={registering}>
                  <Text style={s.pwCancelBtnText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.pwConfirmBtn} onPress={register} disabled={registering}>
                  {registering
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.pwConfirmBtnText}>이 기기 등록하기</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
