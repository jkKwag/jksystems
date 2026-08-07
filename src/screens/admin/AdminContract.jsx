import { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Linking, Platform, Modal, ActivityIndicator } from "react-native";
import { s } from "../../styles/admin/AdminContract.styles";
import api from "../../lib/api";
import { formatBizRegNo } from "../../lib/formatBizRegNo";
import NotInUseBanner from "../../components/NotInUseBanner";
import ConfirmModal from "../../components/ConfirmModal";
import { COMPANY, CHAPTERS } from "../../lib/contractContent";

const CONTRACT_FILE_URL = "/documents/scaneat_service_agreement.docx";

export default function AdminContract({ adminInfo }) {
  const [biz, setBiz] = useState(null);

  useEffect(() => {
    if (!adminInfo?.bizRegNo) { setBiz(null); return; }
    api.biz.get(adminInfo.bizRegNo).then(setBiz);
  }, [adminInfo?.bizRegNo]);

  const subscriberAddr = [biz?.addr, biz?.addrDtl].filter(Boolean).join(" ") || "______________";

  // 회원가입~구독료 결제 흐름을 같은 사업자번호로 반복 테스트하기 위한 전체 데이터 삭제 —
  // 되돌릴 수 없어서 사업자등록번호를 그대로 입력해야만 실행되게 한다.
  const [wipeModalVisible, setWipeModalVisible] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState("");
  const [wiping, setWiping] = useState(false);
  const [wipeAlertMsg, setWipeAlertMsg] = useState(null);

  const openWipeModal = () => { setWipeConfirmInput(""); setWipeModalVisible(true); };
  const closeWipeModal = () => { setWipeModalVisible(false); setWipeConfirmInput(""); };

  const runWipe = async () => {
    if (!adminInfo?.bizRegNo || wipeConfirmInput.trim() !== adminInfo.bizRegNo) return;
    setWiping(true);
    const { data, error } = await api.biz.wipeAllData(adminInfo.bizRegNo);
    setWiping(false);
    closeWipeModal();
    if (error || !data) {
      setWipeAlertMsg(error?.message || "삭제에 실패했습니다.");
      return;
    }
    setBiz(null);
    setWipeAlertMsg(
      `사업장 데이터가 모두 삭제되었습니다.\n계정 ${data.adminUsrCount}건, 메뉴 ${data.menuCount}건, 주문 ${data.orderCount}건, 결제 ${data.paymentCount}건, 예약 ${data.reservationCount}건\n\n로그인 계정도 함께 삭제되었으니 로그아웃 후 새로 가입해주세요.`
    );
  };

  const [companySignUri, setCompanySignUri] = useState(null);
  const [subscriberSignUri, setSubscriberSignUri] = useState(null);

  // 서명란을 누르면 이미지를 고르는 게 아니라, 화면에 직접 손가락/마우스로 서명을 그릴 수 있는
  // 캔버스 레이어가 뜬다. 완료를 누르면 그린 내용을 PNG로 캡처해서 (인) 자리에 대신 보여준다 —
  // 지금은 화면에서만 보이는 미리보기이고 서버에 저장하지는 않는다.
  const [signModalTarget, setSignModalTarget] = useState(null); // null | "company" | "subscriber"
  const signCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  const getCanvasPoint = (e) => {
    const canvas = signCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleSignStart = (e) => {
    e.preventDefault?.();
    isDrawingRef.current = true;
    const { x, y } = getCanvasPoint(e);
    const ctx = signCanvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSignMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault?.();
    const { x, y } = getCanvasPoint(e);
    const ctx = signCanvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    hasDrawnRef.current = true;
  };

  const handleSignEnd = () => { isDrawingRef.current = false; };

  const clearSignCanvas = () => {
    const canvas = signCanvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  };

  const openSignModal = (target) => {
    setSignModalTarget(target);
    hasDrawnRef.current = false;
    // 캔버스가 실제로 마운트된 다음 지워야 해서 한 틱 미룸
    setTimeout(clearSignCanvas, 0);
  };

  const confirmSign = () => {
    if (!hasDrawnRef.current) { setSignModalTarget(null); return; }
    const dataUrl = signCanvasRef.current.toDataURL("image/png");
    (signModalTarget === "company" ? setCompanySignUri : setSubscriberSignUri)(dataUrl);
    setSignModalTarget(null);
  };

  return (
    <View style={s.container}>
      <NotInUseBanner />
      <TouchableOpacity style={s.wipeBtn} onPress={openWipeModal} disabled={!adminInfo?.bizRegNo}>
        <Text style={s.wipeBtnText}>사업자 전체 데이터 삭제 (테스트용)</Text>
      </TouchableOpacity>
      <View style={s.headerRow}>
        <Text style={s.title}>계약서관리</Text>
        <TouchableOpacity style={s.downloadBtn} onPress={() => Linking.openURL(CONTRACT_FILE_URL)}>
          <Text style={s.downloadBtnText}>원본 파일 다운로드</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>가입 시 안내되는 JK Scaneat 서비스 이용계약서 원문입니다.</Text>

      <ScrollView contentContainerStyle={s.paper}>
        <Text style={s.docTitle}>JK Scaneat 서비스 이용계약서</Text>
        <Text style={s.docSubtitle}>(사업장 구독자용)</Text>

        <Text style={s.introText}>
          본 계약은 JK Scaneat 서비스(이하 '서비스')를 제공하는 {COMPANY.name}(이하 '회사')과 서비스를 이용하고자 하는 사업자(이하 '구독자') 간의
          서비스 이용 조건 및 권리·의무 관계를 정함을 목적으로 한다.
        </Text>

        <View style={s.partyBox}>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>회사</Text>
          </View>
          <Text style={s.partyLine}>상호: <Text style={s.partyValue}>{COMPANY.name}</Text></Text>
          <Text style={s.partyLine}>사업자등록번호: <Text style={s.partyValue}>{COMPANY.bizRegNo}</Text></Text>
          <Text style={s.partyLine}>주소: <Text style={s.partyValue}>{COMPANY.addr}</Text></Text>
          <Text style={s.partyLine}>대표자: <Text style={s.partyValue}>{COMPANY.repNm}</Text></Text>
        </View>
        <View style={s.partyBox}>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>구독자</Text>
          </View>
          <Text style={s.partyLine}>상호: <Text style={s.partyValue}>{biz?.bizNm || "______________"}</Text></Text>
          <Text style={s.partyLine}>사업자등록번호: <Text style={s.partyValue}>{biz?.bizRegNo ? formatBizRegNo(biz.bizRegNo) : "______________"}</Text></Text>
          <Text style={s.partyLine}>주소: <Text style={s.partyValue}>{subscriberAddr}</Text></Text>
          <Text style={s.partyLine}>대표자: <Text style={s.partyValue}>{biz?.repNm || "______________"}</Text></Text>
        </View>

        {CHAPTERS.map((chapter, ci) => (
          <View key={ci} style={s.chapter}>
            <Text style={s.chapterTitle}>{chapter.title}</Text>
            {chapter.articles.map((article, ai) => (
              <View key={ai} style={s.article}>
                <Text style={s.articleTitle}>{article.no} {article.title}</Text>
                {!!article.intro && <Text style={s.bodyText}>{article.intro}</Text>}
                {!!article.body && <Text style={s.bodyText}>{article.body}</Text>}
                {article.items?.map((item, ii) => (
                  <View key={ii} style={s.itemRow}>
                    <Text style={s.itemNo}>{ii + 1}.</Text>
                    <View style={s.itemBody}>
                      {typeof item === "string" ? (
                        <Text style={s.itemText}>{item}</Text>
                      ) : (
                        <>
                          <Text style={s.itemText}>{item.text}</Text>
                          {item.sub?.map((line, si) => (
                            <View key={si} style={s.subItemRow}>
                              <Text style={s.subItemNo}>{"가나다라마바사"[si] || "-"}.</Text>
                              <Text style={s.subItemText}>{line}</Text>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        <Text style={s.closingText}>
          본 계약의 성립을 증명하기 위해 계약서 2부를 작성하여 회사와 구독자가 각각 서명 또는 날인한 후 각 1부씩 보관한다.
        </Text>
        <Text style={s.closingText}>계약일자: 20__년 __월 __일</Text>

        <View style={s.signRow}>
          <TouchableOpacity style={s.signBox} onPress={() => openSignModal("company")} activeOpacity={0.8}>
            <Text style={s.partyLabel}>회사</Text>
            <Text style={s.partyLine}>상호: {COMPANY.name}</Text>
            <View style={s.signLineRow}>
              <Text style={[s.partyLine, s.noWrap]}>대표자: {COMPANY.repNm}</Text>
              <View style={s.signStampSlot}>
                <Text style={s.signStamp}>(인)</Text>
                {!!companySignUri && <Image source={{ uri: companySignUri }} style={s.signImageOverlay} resizeMode="contain" />}
              </View>
            </View>
            <Text style={s.signHint}>{companySignUri ? "탭하면 다시 서명" : "탭해서 서명하기"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.signBox} onPress={() => openSignModal("subscriber")} activeOpacity={0.8}>
            <Text style={s.partyLabel}>구독자</Text>
            <Text style={s.partyLine}>상호: {biz?.bizNm || "______________"}</Text>
            <View style={s.signLineRow}>
              <Text style={[s.partyLine, s.noWrap]}>대표자: {biz?.repNm || ""}</Text>
              <View style={s.signStampSlot}>
                <Text style={s.signStamp}>(인)</Text>
                {!!subscriberSignUri && <Image source={{ uri: subscriberSignUri }} style={s.signImageOverlay} resizeMode="contain" />}
              </View>
            </View>
            <Text style={s.signHint}>{subscriberSignUri ? "탭하면 다시 서명" : "탭해서 서명하기"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!signModalTarget} transparent animationType="fade" onRequestClose={() => setSignModalTarget(null)}>
        <View style={s.signModalBackdrop}>
          <View style={s.signModalCard}>
            <Text style={s.signModalTitle}>{signModalTarget === "company" ? "회사" : "구독자"} 서명</Text>
            <Text style={s.signModalDesc}>아래 칸에 손가락(또는 마우스)으로 서명해주세요.</Text>
            {Platform.OS === "web" && (
              <canvas
                ref={signCanvasRef}
                width={320}
                height={160}
                style={{ width: "100%", height: 160, borderRadius: 12, border: "2px dashed #93c5fd", background: "#fff", touchAction: "none", cursor: "crosshair" }}
                onMouseDown={handleSignStart}
                onMouseMove={handleSignMove}
                onMouseUp={handleSignEnd}
                onMouseLeave={handleSignEnd}
                onTouchStart={handleSignStart}
                onTouchMove={handleSignMove}
                onTouchEnd={handleSignEnd}
              />
            )}
            <View style={s.signModalBtnRow}>
              <TouchableOpacity style={s.signModalClearBtn} onPress={clearSignCanvas}>
                <Text style={s.signModalClearBtnText}>지우기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.signModalCancelBtn} onPress={() => setSignModalTarget(null)}>
                <Text style={s.signModalCancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.signModalConfirmBtn} onPress={confirmSign}>
                <Text style={s.signModalConfirmBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={wipeModalVisible} transparent animationType="fade" onRequestClose={closeWipeModal}>
        <View style={s.signModalBackdrop}>
          <View style={s.signModalCard}>
            <Text style={s.signModalTitle}>사업자 전체 데이터 삭제</Text>
            <Text style={s.signModalDesc}>
              계정, 메뉴, 좌석, 주문, 결제, 구독 등 이 사업자({adminInfo?.bizRegNo ? formatBizRegNo(adminInfo.bizRegNo) : "-"})의
              모든 데이터가 영구히 삭제됩니다. 되돌릴 수 없습니다.{"\n\n"}
              계속하려면 사업자등록번호를 그대로 입력해주세요.
            </Text>
            <TextInput
              style={s.wipeConfirmInput}
              placeholder={adminInfo?.bizRegNo || ""}
              placeholderTextColor="#94a3b8"
              value={wipeConfirmInput}
              onChangeText={setWipeConfirmInput}
              autoCapitalize="none"
              keyboardType="numeric"
            />
            <View style={s.signModalBtnRow}>
              <TouchableOpacity style={s.signModalCancelBtn} onPress={closeWipeModal} disabled={wiping}>
                <Text style={s.signModalCancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.wipeConfirmBtn, (wipeConfirmInput.trim() !== adminInfo?.bizRegNo || wiping) && s.wipeConfirmBtnDisabled]}
                onPress={runWipe}
                disabled={wipeConfirmInput.trim() !== adminInfo?.bizRegNo || wiping}
              >
                {wiping ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.wipeConfirmBtnText}>삭제</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal visible={!!wipeAlertMsg} message={wipeAlertMsg} onConfirm={() => setWipeAlertMsg(null)} />
    </View>
  );
}
