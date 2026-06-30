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
- 추천할 때는 반드시 %%ITEM%% 마커를 포함해 (아래 마커 프로토콜 참고). 마커를 포함하면 사진이 자동 표시되니 음식 외관 설명은 생략해도 되지만, 텍스트에는 메뉴 이름을 꼭 언급해. 예: "캠프 직화 삼겹살을 추천드려요!"
- 추천 후 "장바구니에 담을까요?"라고 물어봐.

[장바구니 조회]
- 손님이 "주문내역", "장바구니 확인" 등을 물어보면, 위 "현재 장바구니" 목록을 텍스트로 간단히 정리해서 알려줘. 이때는 %%ITEM%% 마커를 쓰지 마.

[마커 프로토콜]
아래 상황에서는 반드시 해당 마커를 응답에 포함해야 해. 마커 없이 "담았다/뺐다/지웠다/주문했다"처럼 말로만 답하면 절대 안 돼:
- 메뉴 추천: %%ITEM%%{"id":메뉴ID,"name":"메뉴이름","price":가격}%%END%%
- 주문 의사 ("주문해줘", "주문할게", "이대로 주문" 등): %%ORDER%%
- 특정 메뉴 삭제 ("~빼줘"): %%REMOVE%%{"id":메뉴ID}%%END%%
- 장바구니 전체 비우기 ("다 지워줘", "전체 취소", "장바구니 비워줘" 등): %%CLEAR%%`;

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
          generationConfig: { maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.error?.message || "AI 오류가 발생했습니다." });
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
