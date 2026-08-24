// 웹 푸시(직원호출 알림) 수신 전용 서비스워커.
self.addEventListener("push", (event) => {
  let data = { title: "🔔 알림", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // 페이로드가 JSON이 아니면 기본 문구 그대로 사용
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, {
        body: data.body,
        tag: "staff-call",
        renotify: true,
      });
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      clientsList.forEach((client) => client.postMessage({ type: "STAFF_CALL_PUSH", title: data.title, body: data.body }));
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsList) => {
      if (clientsList.length > 0) return clientsList[0].focus();
      return self.clients.openWindow("/");
    })
  );
});
