// onnxruntime-web의 실제 배포 번들은 webpack/vite 전용 매직 커멘트가 붙은 동적 import()를 써서
// Metro가 파싱을 못한다. 그래서 web/index.html에서 <script> 태그로 미리 로드해 window.ort로
// 노출해두고, "onnxruntime-web"을 import하는 코드는 (metro.config.js의 리다이렉트를 통해) 이
// 셔임을 대신 받아서 그 전역 객체를 쓰게 한다.
if (typeof window === "undefined" || !window.ort) {
  throw new Error("onnxruntime-web(window.ort)이 로드되지 않았습니다 — web/index.html의 script 태그를 확인하세요.");
}

module.exports = window.ort;
