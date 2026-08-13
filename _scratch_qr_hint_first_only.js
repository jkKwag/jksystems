const { chromium } = require("playwright");
const SHOTDIR = "/tmp/claude-0/-home-user-scaneat-back/25536756-e415-5de2-a6b3-e4b99ed30923/scratchpad/shots";
const BIZNO = "1234567890";

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium",
    proxy: { server: "direct://" },
    args: ["--no-proxy-server"],
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));
  await page.addInitScript((bizno) => {
    window.ort = { env: { wasm: {}, logLevel: "error" }, InferenceSession: { create: async () => ({ run: async () => ({}) }) } };
    window.Kakao = { init: () => {}, isInitialized: () => true };
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminToken", "test-token");
    localStorage.setItem("adminInfo", JSON.stringify({ adminId: "tester", adminNm: "테스터", adminRole: "ADMIN", bizRegNo: bizno }));
  }, BIZNO);
  await page.route("**/*.js", (route) => {
    const u = route.request().url();
    if (u.includes("onnxruntime") || u.includes("kakao")) return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    return route.continue();
  });

  await page.route("https://api.jkscaneat.com/**", (route) => {
    const url = route.request().url();
    const ok = (data) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
    if (url.includes("/api/admin/menu")) return ok([{ menuCd: "M1", menuNm: "좌석 관리", menuUrl: "/admin/seat", children: [] }]);
    if (url.includes("/access-tokens")) return ok({ token: "TESTTOKN", expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString() });
    if (url.includes("/seats/admin")) {
      return ok([
        { seatCd: "T1", seatNm: "창가 4인석", capacity: 4, sortOrd: 0, useYn: "Y", imgUrl: null },
        { seatCd: "T2", seatNm: "룸 A", capacity: 6, sortOrd: 1, useYn: "Y", imgUrl: null },
        { seatCd: "T3", seatNm: "룸 B", capacity: 8, sortOrd: 2, useYn: "Y", imgUrl: null },
      ]);
    }
    if (url.endsWith(`/api/biz/${BIZNO}`)) return ok({ bizRegNo: BIZNO, bizNm: "테스트식당" });
    return ok(null);
  });

  await page.goto("http://localhost:8085/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${SHOTDIR}/qr_hint_first_only.png` });
  const hintCount = await page.getByText("주문만하기 활성화 QR 입니다").count();
  console.log("hint bubble count (should be 1):", hintCount);

  await browser.close();
})();
