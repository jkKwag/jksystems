const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// onnxruntime-web(브라우저 OCR용)의 실제 배포 번들은 어떤 형태(ESM/CJS)든 webpack/vite 전용
// 매직 커멘트가 붙은 동적 import()를 쓰고 있어서 Metro가 파싱 자체를 못 한다.
// web/index.html에서 <script> 태그로 미리 로드해 window.ort로 노출해두고, 앱 코드에서
// "onnxruntime-web"을 import하면 그 전역 객체를 감싼 셔임으로 대신 연결한다.
const onnxRuntimeWebShim = path.resolve(__dirname, "src/lib/onnxruntimeWebShim.js");

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "onnxruntime-web") {
    return {
      type: "sourceFile",
      filePath: onnxRuntimeWebShim,
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
