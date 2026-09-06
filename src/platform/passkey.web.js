// 웹 브라우저의 WebAuthn API를 감싸는 얇은 헬퍼. 백엔드(PasskeyService)가 만들어주는 옵션 JSON을
// 그대로 받아서 navigator.credentials.create()/get()에 필요한 ArrayBuffer로 변환해주고,
// 결과도 다시 서버가 바로 검증할 수 있는 JSON 문자열로 바꿔 돌려준다.

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
    attestation: "none",
    timeout: options.timeoutMillis,
  };

  const credential = await navigator.credentials.create({ publicKey });
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
    allowCredentials: (options.allowCredentials || []).map(c => ({ type: c.type, id: base64urlToBuffer(c.id) })),
    userVerification: "required",
    timeout: options.timeoutMillis,
  };

  const credential = await navigator.credentials.get({ publicKey });
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
