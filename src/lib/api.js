const BASE = "https://api.jkscaneat.com";

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.success === "boolean" ? (json.success ? json.data : null) : json;
  } catch { return null; }
}

async function send(method, path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: json };
    const data = typeof json?.success === "boolean" ? (json.success ? json.data : null) : json;
    return { data, error: null };
  } catch (e) { return { data: null, error: e }; }
}

async function post(path, body) {
  return send("POST", path, body);
}

async function put(path, body) {
  return send("PUT", path, body);
}

async function del(path) {
  return send("DELETE", path);
}

const api = {
  admin: {
    login: (body) => post(`/api/admin/login`, body),
    menu: (role) => get(`/api/admin/menu?role=${role}`),
  },
  biz: {
    list: (page = 0, size = 10) => get(`/api/biz?page=${page}&size=${size}`),
    get: (bizno) => get(`/api/biz/${bizno}`),
    categories: (bizno) => get(`/api/biz/${bizno}/categories`),
    menus: (bizno) => get(`/api/biz/${bizno}/menus`),
    createMenu: (bizno, body) => post(`/api/biz/${bizno}/menus`, body),
    updateMenu: (bizno, menuCd, body) => put(`/api/biz/${bizno}/menus/${menuCd}`, body),
    deleteMenu: (bizno, menuCd) => del(`/api/biz/${bizno}/menus/${menuCd}`),
    hours: (bizno) => get(`/api/biz/${bizno}/hours`),
    reservationStandard: (bizno) => get(`/api/biz/${bizno}/reservation-standard`),
    seats: (bizno) => get(`/api/biz/${bizno}/seats`),
  },
  industry: {
    get: (indCd) => get(`/api/industry/${indCd}`),
    list: () => get(`/api/industry`),
  },
  commonCode: {
    groups: () => get(`/api/common-code/group`),
    list: (grpCd) => get(`/api/common-code/${grpCd}`),
  },
  menu: {
    options: (menuCd) => get(`/api/menu/${menuCd}/options`),
    createOptionGroup: (menuCd, body) => post(`/api/menu/${menuCd}/option-groups`, body),
    addOption: (menuCd, optGrpCd, body) => post(`/api/menu/${menuCd}/option-groups/${optGrpCd}/options`, body),
    deleteOptionGroup: (menuCd, optGrpCd) => del(`/api/menu/${menuCd}/option-groups/${optGrpCd}`),
    deleteOption: (menuCd, optGrpCd, optCd) => del(`/api/menu/${menuCd}/option-groups/${optGrpCd}/options/${optCd}`),
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
    list: (uuid) => get(`/api/reservation?uuid=${uuid}`),
    listByBiz: (bizRegNo, date) => get(`/api/reservation/biz/${bizRegNo}${date ? `?date=${date}` : ""}`),
    get: (rsvnNo) => get(`/api/reservation/${rsvnNo}`),
    post: (body) => post(`/api/reservation`, body),
    put: (rsvnNo, body) => put(`/api/reservation/${rsvnNo}`, body),
    updateStatus: (rsvnNo, body) => put(`/api/reservation/${rsvnNo}/status`, body),
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
  order: {
    list: (uuid) => get(`/api/order?uuid=${uuid}`),
    listByBiz: (bizRegNo) => get(`/api/order/biz/${bizRegNo}`),
    get: (orderNo) => get(`/api/order/${orderNo}`),
    post: (body) => post(`/api/order`, body),
  },
  payment: {
    confirm: (body) => post(`/api/payment/confirm`, body),
    get: (paymentKey) => get(`/api/payment/${paymentKey}`),
    list: (uuid) => get(`/api/payment?uuid=${uuid}`),
    listByBiz: (bizRegNo) => get(`/api/payment/biz/${bizRegNo}`),
  },
};

export default api;
