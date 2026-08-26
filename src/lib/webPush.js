import api from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// 현재 브라우저의 알림 권한 상태. 아직 허용/차단을 결정하지 않았다면 "default".
export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// 페이지 하나당 메시지 리스너는 한 번만 등록한다 — setupStaffCallPush가 여러 번
// 호출돼도(예: 컴포넌트가 다시 마운트되는 경우) 리스너가 계속 쌓여 알림이 중복
// 처리되는 일이 없도록, 콜백은 아래 변수에 최신값으로만 갱신한다.
let staffCallPushCallback = null;
let messageListenerRegistered = false;

// 관리자 화면 진입 시 알림 권한을 요청하고, 서비스워커를 등록해 웹 푸시(직원호출)를
// 받을 수 있도록 구독 정보를 백엔드에 저장한다. onPush는 실제 알림이 도착했을 때
// (탭이 열려있는 동안) 호출되는 콜백 — 소리 재생 등에 사용한다.
export async function setupStaffCallPush(bizRegNo, onPush) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

  staffCallPushCallback = onPush;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    if (!messageListenerRegistered) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "STAFF_CALL_PUSH") staffCallPushCallback?.(event.data);
      });
      messageListenerRegistered = true;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const vapidPublicKey = await api.push.vapidPublicKey();
    if (!vapidPublicKey) return;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    await api.push.subscribe(bizRegNo, subscription.toJSON());
  } catch (e) {
    console.warn("웹 푸시 설정 실패:", e);
  }
}

// speak() 호출 후 지역변수 참조가 없으면 크롬이 실제 발화 전에 가비지 컬렉션으로
// utterance를 수거해버려 소리 없이 씹히는 경우가 있어, 끝날 때까지 참조를 붙잡아둔다.
let pendingUtterance = null;

// 관리자 탭이 열려있는 동안, 알림 문구(좌석명 등 포함)를 음성으로 읽어준다.
export function speakStaffCall(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.onend = utterance.onerror = () => { pendingUtterance = null; };
    pendingUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // 음성 재생 실패는 조용히 무시 (비프음은 이미 울렸음)
  }
}

// 별도 사운드 파일 없이 짧은 알림음을 즉석에서 생성해 재생한다.
export function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // 오디오 재생 실패는 조용히 무시 (알림 자체는 이미 떴음)
  }
}
