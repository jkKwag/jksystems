module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages = [], menuContext = [] } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });

  const menuList = menuContext
    .map(m => `[ID:${m.id}] ${m.name} (${m.category}) ₩${m.price.toLocaleString()} - ${m.desc}`)
    .join("\n");

  const system = `당신은 맛찬들 식당의 AI 메뉴 추천 도우미입니다. 고객이 원하는 메뉴를 찾도록 친절하게 도와주세요.

현재 메뉴 목록:
${menuList}

중요 규칙:
1. 메뉴를 추천할 때 반드시 아래 형식을 포함하세요:
   %%ITEM%%{"id":메뉴ID,"name":"메뉴이름","price":가격}%%END%%
2. 추천 후 "장바구니에 담을까요?"라고 물어보세요.
3. 간결하고 친근하게 대화하세요.
4. 한 번에 한 가지 메뉴만 추천하세요.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system,
        messages,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.error?.message || "AI 오류가 발생했습니다." });
    }

    const data = await resp.json();
    return res.status(200).json({ text: data.content?.[0]?.text || "" });
  } catch {
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
