const BASE = "https://api.jkscaneat.com";

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function post(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return res.ok ? { data, error: null } : { data: null, error: data };
  } catch (e) { return { data: null, error: e }; }
}

async function put(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return res.ok ? { data, error: null } : { data: null, error: data };
  } catch (e) { return { data: null, error: e }; }
}

const api = {
  biz: {
    get: (bizno) => get(`/api/biz/${bizno}`),
    categories: (bizno) => get(`/api/biz/${bizno}/categories`),
    menus: (bizno) => get(`/api/biz/${bizno}/menus`),
  },
  industry: {
    get: (indCd) => get(`/api/industry/${indCd}`),
    list: () => get(`/api/industry`),
  },
  menu: {
    options: (menuCd) => get(`/api/menu/${menuCd}/options`),
  },
  scanLog: {
    list: (uuid) => get(`/api/scan-log?uuid=${uuid}`),
    post: (body) => post(`/api/scan-log`, body),
  },
  consent: {
    post: (body) => post(`/api/consent`, body),
    postReservation: (body) => post(`/api/consent/reservation`, body),
  },
  reservation: {
    get: (rsvnNo) => get(`/api/reservation/${rsvnNo}`),
    post: (body) => post(`/api/reservation`, body),
    put: (rsvnNo, body) => put(`/api/reservation/${rsvnNo}`, body),
  },
  chat: {
    messages: (rsvnNo) => get(`/api/chat/${rsvnNo}/messages`),
    send: (rsvnNo, body) => post(`/api/chat/${rsvnNo}/messages`, body),
    ai: (body) => post(`/api/ai/chat`, body),
  },
  qna: {
    list: () => get(`/api/qna`),
    post: (body) => post(`/api/qna`, body),
    answer: (id, body) => put(`/api/qna/${id}/answer`, body),
  },
  supporters: {
    list: () => get(`/api/supporters`),
    post: (body) => post(`/api/supporters`, body),
  },
  payment: {
    confirm: (body) => post(`/api/payment/confirm`, body),
  },
};

export default api;
