const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "recommend_item",
        description: "손님에게 메뉴 하나를 추천하거나, 손님이 요청한 메뉴(이미 장바구니에 있는 메뉴를 추가로 더 담는 경우 포함)를 장바구니에 담기 전 단계로 제시한다. 실제로 장바구니에 담기는 것은 손님이 다음 메시지로 확인해야 처리된다.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING", description: "메뉴 ID (예: M00001)" },
            name: { type: "STRING", description: "메뉴 이름" },
            price: { type: "NUMBER", description: "메뉴 가격" },
          },
          required: ["id", "name", "price"],
        },
      },
      {
        name: "remove_item",
        description: "손님이 특정 메뉴를 장바구니에서 빼달라고 요청했을 때 호출한다. 손님이 '하나만 빼줘', '두 개 빼줘'처럼 일부 수량만 줄이려는 경우 quantity를 그 수만큼 채우고, 메뉴 자체를 통째로 빼달라는 경우(수량 언급 없음)에는 quantity를 생략한다.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING", description: "장바구니에서 제거할 메뉴 ID" },
            quantity: { type: "NUMBER", description: "줄일 수량. 생략하면 해당 메뉴를 장바구니에서 전부 제거한다." },
          },
          required: ["id"],
        },
      },
      {
        name: "clear_cart",
        description: "손님이 장바구니를 전체 비워달라고 요청했을 때 호출한다.",
        parameters: { type: "OBJECT", properties: {} },
      },
      {
        name: "request_checkout",
        description: "손님이 주문/결제/계산을 하고 싶다는 의사를 밝혔을 때 호출한다. 이 함수는 실제 결제를 처리하지 않는다 — 결제는 항상 손님이 장바구니 화면에서 직접 버튼을 눌러야만 진행되며, AI는 그 화면으로 안내만 한다.",
        parameters: { type: "OBJECT", properties: {} },
      },
      {
        name: "request_reservation",
        description: "손님이 테이블 예약을 원할 때 이름·전화번호·인원·희망 일시를 모두 수집한 뒤 호출한다. 정보가 하나라도 빠지면 호출하지 않고 먼저 물어봐야 한다.",
        parameters: {
          type: "OBJECT",
          properties: {
            guest_name: { type: "STRING", description: "손님 이름" },
            guest_phone: { type: "STRING", description: "손님 전화번호" },
            party_size: { type: "NUMBER", description: "예약 인원 수" },
            datetime: { type: "STRING", description: "희망 예약 일시 (예: 2025-08-15 19:00)" },
          },
          required: ["guest_name", "guest_phone", "party_size", "datetime"],
        },
      },
    ],
  },
];

const FALLBACK_TEXT_BY_ACTION = {
  recommend_item: a => `${a.args?.name || "메뉴"}을(를) 추천드려요! 장바구니에 담을까요?`,
  remove_item: a => (a.args?.quantity > 0 ? `네, ${a.args.quantity}개 빼드렸어요!` : "네, 장바구니에서 빼드렸어요!"),
  clear_cart: () => "장바구니를 비웠어요!",
  request_checkout: () => "장바구니를 확인하신 후 결제를 진행해 주세요!",
  request_reservation: () => "예약 정보를 확인해 주세요.",
};

function fallbackText(actions) {
  return actions.map(a => FALLBACK_TEXT_BY_ACTION[a.name]?.(a) || "").filter(Boolean).join(" ");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages = [], menuContext = [], cartContext = [] } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });

  const menuList = menuContext
    .map(m => `[ID:${m.id}] ${m.name} (${m.category}) ₩${m.price.toLocaleString()} - ${m.desc}`)
    .join("\n");

  const cartList = cartContext.length > 0
    ? cartContext.map(c => `- ${c.item.name} x${c.quantity} (₩${(c.item.price * c.quantity).toLocaleString()})`).join("\n")
    : "비어있음";

  const systemPrompt = `너는 이 식당의 AI 직원이야. 메뉴를 보고 손님 취향에 맞게 추천하고 주문까지 도와줘. 한국어와 영어 모두 응대 가능해.

현재 메뉴 목록:
${menuList}

현재 장바구니:
${cartList}

[대화 스타일]
- 손님이 말하는 언어로 자연스럽게 응대해 (한국어→한국어, 영어→영어, 일본어→일본어 등).
- 친근하고 간결하게 대화해. 한 번에 메뉴 하나만 추천해.
- 메뉴에 없는 음식을 물어보면 솔직하게 없다고 말하고 비슷한 메뉴를 제안해.

[메뉴 추천]
- 손님이 원하는 맵기, 종류, 분위기 등을 파악해서 딱 맞는 메뉴 하나를 추천해.
- 추천할 때는 반드시 recommend_item 함수를 호출해. 함수를 호출하면 사진이 자동 표시되니 음식 외관 설명은 생략해도 되지만, 텍스트에는 메뉴 이름을 꼭 언급해. 예: "캠프 직화 삼겹살을 추천드려요!"
- 함수 호출 후 텍스트로는 "장바구니에 담을까요?"라고 물어봐. 이 단계는 아직 담기 전 상태야. 손님이 "추천해주고 바로 담아줘"처럼 한 번에 요청해도 이 단계에서는 절대 "담았어요"라고 말하면 안 되고 항상 "담을까요?"라고 질문으로 끝내야 해 (실제로 담기는 건 손님이 다음 메시지로 확인해야 처리돼).
- 손님이 "OOO 추가해줘", "OOO 하나 더" 처럼 이미 위 "현재 장바구니"에 있는 메뉴를 더 담아달라고 요청해도 신규 추천과 똑같이 recommend_item 함수를 호출해야 해 (같은 메뉴 ID로 또 호출하면 수량이 자동으로 올라가). 함수 호출 없이 "추가해드릴까요?"/"추가했어요"처럼 말로만 답하면 실제로는 아무 것도 추가되지 않아.

[장바구니 조회]
- 손님이 "주문내역", "장바구니 확인" 등을 물어보면, 위 "현재 장바구니" 목록을 텍스트로 간단히 정리해서 알려줘. 이때는 어떤 함수도 호출하지 마.

[메뉴 제거 / 비우기]
- 손님이 특정 메뉴를 빼달라고 하면 remove_item 함수를 호출해.
- "하나만 빼줘", "한 개 삭제", "두 개만 빼줘"처럼 일부 수량만 줄이려는 의도면 quantity 인자에 그 숫자를 채워서 호출해 (예: 장바구니에 2개 있는데 "하나만 빼줘"라고 하면 quantity:1로 호출 → 1개만 남음). 수량 언급 없이 그냥 "빼줘", "취소해줘"처럼 메뉴 자체를 통째로 빼달라는 의도면 quantity 없이 호출해 (장바구니에 몇 개가 있든 전부 제거됨).
- 손님이 장바구니를 전체 비워달라고 하면 clear_cart 함수를 호출해.

[주문 / 결제]
- 손님이 "주문해줘", "주문할게", "이대로 주문", "계산해줘", "결제할게" 등 주문·결제·계산 의사를 밝히면 request_checkout 함수를 호출해. 너는 실제로 결제를 처리할 수 없으니, 텍스트로는 "장바구니를 확인하신 후 결제를 진행해 주세요!"처럼 장바구니 화면에서 직접 결제를 진행하도록 안내만 해. 절대 "주문이 완료됐어요"처럼 결제가 끝난 것처럼 말하면 안 돼.

[테이블 예약]
- 손님이 예약을 원하면 이름, 전화번호, 인원, 희망 일시를 순서대로 하나씩 물어봐.
- 전화번호를 받으면 형식을 반드시 검증해. 하이픈(-)은 있어도 없어도 되고, 숫자만 봤을 때 010/011/016/017/018/019로 시작하는 10~11자리 휴대폰 번호 또는 지역번호로 시작하는 일반 전화번호면 유효해. 숫자·하이픈 외 문자가 섞이거나 자릿수가 맞지 않으면 "잘못된 전화번호입니다. 다시 입력해 주세요."라고 말하고 재입력을 요청해.
- 네 가지 정보가 모두 모이면 request_reservation 함수를 호출해. 호출 후 텍스트로는 "예약 정보를 확인해 주세요."라고만 말해 (개인정보 동의 화면이 자동으로 뜸).
- 정보가 하나라도 빠진 상태에서 함수를 호출하면 안 돼.
- 함수 호출 없이 "예약됐어요"처럼 말로만 답하면 절대 안 돼.

[공통 규칙]
- 위 함수 호출이 필요한 상황에서 함수를 호출하지 않고 "담았다/추가했다/뺐다/지웠다/주문했다/결제했다"처럼 말로만 답하면 절대 안 돼. 실제로는 아무 것도 처리되지 않기 때문이야.`;

  // Anthropic role "assistant" → Gemini role "model"
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          tools: TOOLS,
          generationConfig: { maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.error?.message || "AI 오류가 발생했습니다." });
    }

    const data = await resp.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const actions = parts
      .filter(p => p.functionCall)
      .map(p => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));

    // Gemini가 함수 호출만 반환하고 동반 텍스트는 비워서 보내는 경우가 있음.
    // 이때 그대로 두면 프론트엔드가 "오류가 발생했습니다"로 오인 표시하므로
    // 실제로는 정상 처리된 액션에 맞는 안내 문구를 서버에서 채워줌
    const text = parts.filter(p => p.text).map(p => p.text).join("")
      || fallbackText(actions);

    return res.status(200).json({ text, actions });
  } catch {
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
