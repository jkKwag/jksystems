// 네이티브 앱은 아직 패스키를 지원하지 않는다 (추후 iOS/Android 플랫폼 패스키 API 연동 예정).
// 웹과 동일한 함수 시그니처만 맞춰두고, 호출하는 쪽은 항상 isPasskeyAvailable()을 먼저 확인해서
// false면 버튼 자체를 안 보여주므로 나머지 함수는 실제로 호출될 일이 없다.

export function detectPlatformLabel() {
  return "app-unknown";
}

export async function isPasskeyAvailable() {
  return false;
}

export async function createPasskeyCredential() {
  throw new Error("이 기기에서는 아직 패스키를 지원하지 않습니다.");
}

export async function getPasskeyAssertion() {
  throw new Error("이 기기에서는 아직 패스키를 지원하지 않습니다.");
}
