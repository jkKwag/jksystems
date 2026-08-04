import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { s } from "../../styles/admin/AdminContract.styles";

const CONTRACT_FILE_URL = "/documents/scaneat_service_agreement.docx";

const COMPANY = {
  name: "JK시스템즈",
  bizRegNo: "212-25-44531",
  addr: "전남광주시 목포시 남악1로16번길 43-14",
  repNm: "곽종근",
};

// scaneat_service_agreement.docx 원문 그대로 옮긴 것 — 실제 서류가 바뀌면 이 데이터도 같이 갱신할 것.
const CHAPTERS = [
  {
    title: "제1장 총칙",
    articles: [
      {
        no: "제1조",
        title: "(목적)",
        body: "본 계약은 회사가 제공하는 QR/NFC 기반 매장 주문 서비스인 JK Scaneat(이하 '서비스')의 이용과 관련하여 회사와 구독자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 한다.",
      },
      {
        no: "제2조",
        title: "(정의)",
        items: [
          "'서비스'라 함은 회사가 제공하는 QR/NFC 테이블 주문, 메뉴 관리, 주문 접수, 사업장 관리자 페이지 등 일체의 기능을 말한다.",
          "'구독자'라 함은 본 계약에 따라 서비스 이용계약을 체결하고 서비스를 이용하는 사업자를 말한다.",
          "'이용자(손님)'라 함은 구독자의 매장을 방문하거나 이용하여 QR/NFC를 통해 주문하는 최종 소비자를 말한다.",
        ],
      },
      {
        no: "제3조",
        title: "(계약의 효력 및 변경)",
        body: "본 계약은 구독자가 회사 소정의 가입 절차를 완료하고 회사가 이를 승낙한 시점부터 효력이 발생한다. 회사는 관련 법령을 위반하지 않는 범위에서 본 계약을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 적용일자 7일 전(구독자에게 불리한 변경의 경우 30일 전)까지 서비스 내 공지 또는 이메일로 고지한다.",
      },
    ],
  },
  {
    title: "제2장 서비스 이용",
    articles: [
      {
        no: "제4조",
        title: "(서비스의 제공)",
        items: [
          { text: "회사는 구독자에게 다음 각 호의 서비스를 제공한다.", sub: [
            "테이블/사업장 QR 및 NFC 기반 주문 접수 기능",
            "메뉴 등록·수정·이미지 관리 기능",
            "사업장 관리자 및 직원 계정 관리 기능",
            "기타 회사가 정하여 제공하는 부가 기능",
          ] },
          "회사는 서비스의 안정적 제공을 위해 노력하나, 서버 점검, 천재지변, 제3자(클라우드·통신) 서비스 장애 등 불가항력적 사유로 인한 서비스 중단에 대해서는 책임을 지지 않는다.",
        ],
      },
      {
        no: "제5조",
        title: "(구독료 및 결제)",
        items: [
          "서비스 이용에 따른 구독료는 별도로 정하는 요금제(이하 '요금표')에 따른다.",
          "요금은 매월 정기 결제되며, 결제일 및 결제수단은 구독자가 가입 시 지정한 방식에 따른다.",
          "회사는 요금제를 변경할 경우 최소 30일 전 사전 고지하며, 고지 후 구독자가 이의를 제기하지 않고 서비스를 계속 이용하는 경우 변경된 요금제에 동의한 것으로 본다.",
        ],
      },
      {
        no: "제6조",
        title: "(계약기간 및 해지)",
        items: [
          "계약기간은 가입일로부터 1개월 단위로 자동 갱신되는 것을 원칙으로 한다.",
          "구독자는 언제든지 서비스 내 해지 신청을 통해 계약을 해지할 수 있으며, 해지 시점까지의 이용요금은 일할 계산하여 정산한다.",
          "회사는 구독자가 본 계약을 중대하게 위반하거나 요금을 [ ]개월 이상 미납하는 경우, 사전 통지 후 계약을 해지할 수 있다.",
        ],
      },
    ],
  },
  {
    title: "제3장 권리와 의무",
    articles: [
      {
        no: "제7조",
        title: "(회사의 의무)",
        items: [
          "회사는 관련 법령 및 본 계약이 정하는 바에 따라 지속적이고 안정적인 서비스 제공을 위해 노력한다.",
          "회사는 구독자 및 이용자(손님)의 개인정보를 관련 법령 및 회사의 개인정보처리방침에 따라 안전하게 처리한다.",
          "회사는 서비스 장애 발생 시 이를 신속히 복구하기 위해 노력하며, 중대한 장애 발생 시 구독자에게 그 사실을 고지한다.",
        ],
      },
      {
        no: "제8조",
        title: "(구독자의 의무)",
        items: [
          "구독자는 사업장 정보(사업자등록번호, 상호, 대표자 등)를 사실에 근거하여 정확히 제공하여야 한다.",
          "구독자는 계정 정보(아이디, 비밀번호 등)를 선량한 관리자의 주의로 관리하여야 하며, 제3자에게 대여, 양도할 수 없다.",
          "구독자는 서비스를 통해 등록하는 메뉴 정보, 이미지 등에 대한 저작권 및 사용 권한을 적법하게 보유하여야 하며, 이와 관련한 분쟁 발생 시 구독자가 책임을 부담한다.",
          "구독자는 서비스를 이용하여 관계 법령 및 본 계약이 금지하거나 공서양속에 반하는 행위를 하여서는 아니 된다.",
        ],
      },
    ],
  },
  {
    title: "제4장 개인정보 및 데이터",
    articles: [
      {
        no: "제9조",
        title: "(개인정보의 처리)",
        body: "회사는 구독자 및 이용자(손님)의 개인정보를 회사의 개인정보처리방침에 따라 처리하며, 구독자는 자신의 사업장 이용자(손님)에게 관련 사항을 안내할 책임을 진다.",
      },
      {
        no: "제10조",
        title: "(데이터의 소유 및 이용)",
        body: "구독자가 서비스에 등록한 메뉴, 이미지 등 데이터의 소유권은 구독자에게 있으며, 회사는 서비스 제공 및 개선 목적 범위 내에서 이를 이용할 수 있다. 계약 종료 시 회사는 구독자의 요청에 따라 합리적인 기간 내에 데이터를 반환하거나 파기한다.",
      },
    ],
  },
  {
    title: "제5장 책임의 제한 및 기타",
    articles: [
      {
        no: "제11조",
        title: "(면책)",
        intro: "회사는 다음 각 호의 경우에 대해서는 책임을 지지 아니한다.",
        items: [
          "천재지변, 불가항력, 통신사·클라우드 인프라 사업자의 장애 등 회사의 귀책사유가 없는 경우",
          "구독자의 귀책사유로 인한 서비스 이용 장애",
          "구독자가 등록한 정보(메뉴, 가격, 이미지 등)의 정확성에 관한 사항",
        ],
      },
      {
        no: "제12조",
        title: "(손해배상)",
        body: "회사 또는 구독자가 본 계약을 위반하여 상대방에게 손해를 끼친 경우, 그 위반에 책임이 있는 당사자는 상대방에게 발생한 손해를 배상할 책임이 있다. 다만 회사의 배상 범위는 구독자가 직전 [3]개월간 회사에 지급한 서비스 이용료 총액을 한도로 한다.",
      },
      {
        no: "제13조",
        title: "(분쟁해결 및 관할법원)",
        body: "본 계약과 관련하여 분쟁이 발생할 경우 양 당사자는 상호 협의하여 해결하도록 노력하며, 협의가 이루어지지 않을 경우 민사소송법상의 관할법원에 소를 제기할 수 있다.",
      },
      {
        no: "제14조",
        title: "(계약의 해석)",
        body: "본 계약에서 정하지 아니한 사항 및 해석에 관하여 다툼이 있는 경우 관계 법령 및 상관습에 따른다.",
      },
    ],
  },
];

export default function AdminContract() {
  return (
    <View style={s.container}>
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
          <Text style={s.partyLine}>주소: <Text style={s.partyValue}>{COMPANY.addr}</Text>　　대표자: <Text style={s.partyValue}>{COMPANY.repNm}</Text></Text>
        </View>
        <View style={s.partyBox}>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>구독자</Text>
          </View>
          <Text style={s.partyLine}>상호: ______________</Text>
          <Text style={s.partyLine}>사업자등록번호: ______________</Text>
          <Text style={s.partyLine}>주소: ______________　　대표자: ______________</Text>
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
          <View style={s.signBox}>
            <Text style={s.partyLabel}>회사</Text>
            <Text style={s.partyLine}>상호: {COMPANY.name}</Text>
            <Text style={s.partyLine}>대표자: {COMPANY.repNm}　　　(인)</Text>
          </View>
          <View style={s.signBox}>
            <Text style={s.partyLabel}>구독자</Text>
            <Text style={s.partyLine}>상호: ______________</Text>
            <Text style={s.partyLine}>대표자:　　　　　　　　　(인)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
