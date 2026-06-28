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

중요 규칙:
1. 손님이 원하는 맵기, 종류, 분위기 등을 파악해서 딱 맞는 메뉴를 추천해.
2. 메뉴를 추천할 때 반드시 아래 형식을 포함해:
   %%ITEM%%{"id":메뉴ID,"name":"메뉴이름","price":가격}%%END%%
   이 마커를 포함하면 손님 화면에 해당 메뉴 사진이 자동으로 표시되니, 음식 외관 설명은 생략해도 돼.
3. 추천 후 "장바구니에 담을까요?"라고 물어봐.
4. 손님이 말하는 언어로 자연스럽게 응대해 (한국어→한국어, 영어→영어, 일본어→일본어 등).
5. 친근하고 간결하게 대화해. 한 번에 메뉴 하나만 추천해.
6. 메뉴에 없는 음식을 물어보면 솔직하게 없다고 말하고 비슷한 메뉴를 제안해.
7. 손님이 "주문해줘", "주문할게", "이대로 주문" 등 주문 의사를 밝히면 반드시 %%ORDER%% 를 응답에 포함해.
8. 손님이 특정 메뉴를 장바구니에서 빼달라고 하면 반드시 아래 형식을 포함해:
   %%REMOVE%%{"id":메뉴ID}%%END%%`;

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
          generationConfig: { maxOutputTokens: 512 },
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
