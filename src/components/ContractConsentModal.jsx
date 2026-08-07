import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { s } from "../styles/ContractConsentModal.styles";
import { CHAPTERS } from "../lib/contractContent";

// 구독료 결제 전, 계약서관리 화면과 동일한 이용계약서 내용을 팝업으로 보여주고
// 체크박스로 동의해야만 다음 단계(결제)로 넘어갈 수 있게 한다.
export default function ContractConsentModal({ visible, onAgree, onCancel }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => { if (visible) setAgreed(false); }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>서비스 이용계약 동의</Text>
            <Text style={s.sub}>구독료 결제 전, 아래 이용계약 내용을 확인하고 동의해주세요.</Text>
          </View>

          <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
            {CHAPTERS.map((chapter, ci) => (
              <View key={ci} style={[s.chapter, ci === 0 && s.chapterFirst]}>
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
          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity style={s.agreeRow} onPress={() => setAgreed(v => !v)} activeOpacity={0.7}>
              <View style={[s.checkbox, agreed && s.checkboxChecked]}>
                {agreed && <Text style={s.checkboxMark}>✓</Text>}
              </View>
              <Text style={s.agreeText}>위 서비스 이용계약 내용에 동의합니다.</Text>
            </TouchableOpacity>
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
                <Text style={s.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.agreeBtn, !agreed && s.agreeBtnDisabled]}
                onPress={onAgree}
                disabled={!agreed}
              >
                <Text style={s.agreeBtnText}>동의하고 계속</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
