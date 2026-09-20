import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminBizList.styles";
import api from "../../lib/api";

const PLACEHOLDER_COLOR = "#94a3b8";

// 사업장별 PG(토스페이먼츠) 연동 관리. 시크릿키는 본인(업체 관리자)이 직접 여기서 입력해서
// 서버로 바로 보내고(HTTPS), 저장 이후엔 원본을 다시 화면에 노출하지 않는다 — 등록 여부만 보여준다.
// 슈퍼관리자는 상태 조회/활성·비활성만 가능하고 키 입력은 못 한다(업체 본인만 입력).
export default function BizPgSection({ bizRegNo, isSuper }) {
  const [connections, setConnections] = useState(null);
  const [secretKey, setSecretKey] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const list = await api.biz.pgConnections(bizRegNo);
    const arr = Array.isArray(list) ? list : [];
    setConnections(arr);
    // 클라이언트키는 민감정보가 아니라 저장된 값을 그대로 보여줘도 된다 — 시크릿키와 달리
    // 등록 여부를 빈 칸만 보고는 알 수 없다는 문제가 있어서, 텍스트박스에 현재값을 채워둔다.
    const toss = arr.find(c => c.pgProvider === "TOSS");
    setClientKey(toss?.clientKey || "");
  }, [bizRegNo]);

  useEffect(() => { load(); }, [load]);

  const toss = connections?.find(c => c.pgProvider === "TOSS") || null;

  const register = async () => {
    if (!secretKey.trim()) { setError("시크릿키를 입력해주세요."); return; }
    setSaving(true); setError(""); setMsg("");
    const { data, error: err } = await api.biz.registerPg(bizRegNo, {
      pgProvider: "TOSS",
      secretKey: secretKey.trim(),
      clientKey: clientKey.trim() || null,
    });
    setSaving(false);
    if (err || !data) { setError(err?.message || "등록에 실패했습니다. 시크릿키를 다시 확인해주세요."); return; }
    setSecretKey("");
    setMsg("PG 연동이 저장되었습니다.");
    await load();
  };

  const toggleStatus = async () => {
    setSaving(true); setError(""); setMsg("");
    const { data, error: err } = toss?.status === "ACTIVE"
      ? await api.biz.deactivatePg(bizRegNo, "TOSS")
      : await api.biz.activatePg(bizRegNo, "TOSS");
    setSaving(false);
    if (err || !data) { setError(err?.message || "처리에 실패했습니다."); return; }
    await load();
  };

  return (
    <>
      <View style={[s.sectionTitleRow, { marginTop: 24 }]}>
        <View style={s.sectionBar} />
        <Text style={s.sectionTitleText}>결제(PG) 연동</Text>
        <View style={s.sectionRule} />
      </View>

      {connections === null ? (
        <ActivityIndicator style={{ marginVertical: 12 }} color="#f97316" />
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>토스페이먼츠</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {toss ? `${toss.status === "ACTIVE" ? "연동 활성" : "연동 비활성"} · 등록일 ${(toss.regDt || "").slice(0, 10)}`
                  : "미등록 — 등록 전까지는 플랫폼 공용 키로 결제됩니다."}
              </Text>
            </View>
            {toss && (
              <TouchableOpacity onPress={toggleStatus} disabled={saving}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: toss.status === "ACTIVE" ? "#dc2626" : "#16a34a" }}>
                  {toss.status === "ACTIVE" ? "비활성화" : "활성화"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!isSuper && (
            <View style={s.fieldGrid}>
              <View style={s.fieldBoxFull}>
                <TextInput
                  style={s.fieldInput}
                  // 실제 값은 서버가 절대 돌려주지 않아 진짜 마스킹은 불가능하지만, "이미 등록되어
                  // 있다"는 걸 비밀번호 필드처럼 점(•)으로 표시해 빈 칸과 구분되게 한다.
                  placeholder={toss?.hasSecretKey ? "•••••••••••• (등록됨 — 교체하려면 새로 입력)" : "시크릿키 (test_sk_... / live_sk_...)"}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={secretKey}
                  onChangeText={setSecretKey}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={s.fieldBoxFull}>
                <TextInput
                  style={s.fieldInput}
                  placeholder="클라이언트키 (결제위젯용, test_ck_... / live_ck_...)"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={clientKey}
                  onChangeText={setClientKey}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {!!error && <Text style={s.error}>⚠️ {error}</Text>}
          {!!msg && <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600", marginTop: 10 }}>{msg}</Text>}

          {!isSuper && (
            <TouchableOpacity style={s.certUploadBtn} onPress={register} disabled={saving}>
              {saving ? <ActivityIndicator color="#1d3557" /> : <Text style={s.certUploadBtnText}>{toss ? "시크릿키 교체 저장" : "PG 연동 등록"}</Text>}
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
}
