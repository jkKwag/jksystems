// 웹 브라우저의 WebAuthn API를 감싸는 얇은 헬퍼. 백엔드(PasskeyService)가 만들어주는 옵션 JSON을
// 그대로 받아서 navigator.credentials.create()/get()에 필요한 ArrayBuffer로 변환해주고,
// 결과도 다시 서버가 바로 검증할 수 있는 JSON 문자열로 바꿔 돌려준다.

// 일부 안드로이드 Chrome 버전에서 Credential Manager가 응답 없이 무한 대기하는 알려진 플랫폼
// 버그(Chromium issue 476437881)가 있어, 지정된 시간이 지나면 AbortController로 강제 취소한다.
// 이렇게 취소해야 다음 시도가 "A request is already pending." 없이 깨끗하게 다시 시작될 수 있다.
function withAbortTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 기기 이름을 직접 입력받는 대신 자동으로 "web-OS" 라벨을 붙여준다 — 등록 화면에서 사용.
export function detectPlatformLabel() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let os = "unknown";
  if (/android/i.test(ua)) os = "android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "ios";
  else if (/mac/i.test(ua)) os = "mac";
  else if (/win/i.test(ua)) os = "windows";
  return `web-${os}`;
}

export async function isPasskeyAvailable() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// options: 백엔드 PasskeyRegisterOptionsResponse 그대로. 반환값은 /register에 그대로 보낼 문자열.
export async function createPasskeyCredential(options) {
  const publicKey = {
    challenge: base64urlToBuffer(options.challenge),
    rp: { id: options.rpId, name: options.rpName },
    user: {
      id: base64urlToBuffer(options.userId),
      name: options.userName,
      displayName: options.userDisplayName,
    },
    pubKeyCredParams: options.pubKeyCredParams.map(p => ({ type: p.type, alg: p.alg })),
    excludeCredentials: (options.excludeCredentials || []).map(c => ({ type: c.type, id: base64urlToBuffer(c.id) })),
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
    // 이 기기 자체의 생체인증만 쓴다고 명시 — 안드로이드 Credential Manager가 더 복잡한(버그 있는)
    // 경로 대신 플랫폼 인증기로 바로 가도록 유도한다.
    hints: ["client-device"],
    attestation: "none",
    timeout: options.timeoutMillis,
  };

  const { signal, clear } = withAbortTimeout(options.timeoutMillis);
  let credential;
  try {
    credential = await navigator.credentials.create({ publicKey, signal });
  } finally {
    clear();
  }
  const response = credential.response;
  return JSON.stringify({
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject),
      transports: response.getTransports ? response.getTransports() : [],
    },
    clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
  });
}

// options: 백엔드 PasskeyLoginOptionsResponse 그대로. 반환값은 /login에 그대로 보낼 문자열.
export async function getPasskeyAssertion(options) {
  const publicKey = {
    challenge: base64urlToBuffer(options.challenge),
    rpId: options.rpId,
    // allowCredentials로 특정 기기ID를 콕 집어서 요청하면 일부 안드로이드 Chrome에서 Credential
    // Manager가 응답 없이 멈추는 문제가 있어(등록은 되는데 로그인만 멈추는 걸로 확인됨), 의도적으로
    // 제한을 걸지 않고 이 사이트에 등록된 아무 패스키나 고르게 한다. 실제로 그 계정 것이 맞는지는
    // 백엔드 PasskeyService.login()이 flowId에 저장된 adminNo와 대조해서 사후 검증한다.
    userVerification: "required",
    hints: ["client-device"],
    timeout: options.timeoutMillis,
  };

  const { signal, clear } = withAbortTimeout(options.timeoutMillis);
  let credential;
  try {
    credential = await navigator.credentials.get({ publicKey, signal });
  } finally {
    clear();
  }
  const response = credential.response;
  return JSON.stringify({
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
    clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
  });
}
