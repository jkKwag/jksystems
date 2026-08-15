import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://api.jkscaneat.com";

// 관리자 로그인 시 발급된 세션 토큰이 있으면 매 요청에 실어 보낸다.
// (서버는 아직 이 토큰을 검증하지 않지만, 검증 로직이 붙었을 때 그대로 동작하도록 미리 배관해둠)
async function authHeaders() {
  const token = await AsyncStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: await authHeaders() });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.success === "boolean" ? (json.success ? json.data : null) : json;
  } catch { return null; }
}

async function send(method, path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

async function postMultipart(path, formData) {
  try {
    const res = await fetch(`${BASE}${path}`, { method: "POST", headers: await authHeaders(), body: formData });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: json };
    const data = typeof json?.success === "boolean" ? (json.success ? json.data : null) : json;
    return { data, error: null };
  } catch (e) { return { data: null, error: e }; }
}

const api = {
  admin: {
    login: (body) => post(`/api/admin/login`, body),
    totpSetup: () => post(`/api/admin/totp/setup`, {}),
    totpConfirm: (body) => post(`/api/admin/totp/confirm`, body),
    menu: (role) => get(`/api/admin/menu?role=${role}`),
    users: (bizRegNo) => get(`/api/admin/users?bizRegNo=${bizRegNo}`),
    changePassword: (adminId, body) => put(`/api/admin/users/${adminId}/password`, body),
    changeEmployeePassword: (empId, body) => put(`/api/admin/employees/${empId}/password`, body),
    verifyPassword: (adminId, body) => post(`/api/admin/users/${adminId}/verify-password`, body),
    verifyEmployeePassword: (empId, body) => post(`/api/admin/employees/${empId}/verify-password`, body),
  },
  biz: {
    list: (page = 0, size = 10) => get(`/api/biz?page=${page}&size=${size}`),
    get: (bizno) => get(`/api/biz/${bizno}`),
    create: (body) => post(`/api/biz`, body),
    update: (bizno, body) => put(`/api/biz/${bizno}`, body),
    categories: (bizno) => get(`/api/biz/${bizno}/categories`),
    createCategory: (bizno, body) => post(`/api/biz/${bizno}/categories`, body),
    updateCategory: (bizno, bizCatCd, body) => put(`/api/biz/${bizno}/categories/${bizCatCd}`, body),
    deleteCategory: (bizno, bizCatCd) => del(`/api/biz/${bizno}/categories/${bizCatCd}`),
    menus: (bizno) => get(`/api/biz/${bizno}/menus`),
    createMenu: (bizno, body) => post(`/api/biz/${bizno}/menus`, body),
    updateMenu: (bizno, menuCd, body) => put(`/api/biz/${bizno}/menus/${menuCd}`, body),
    deleteMenu: (bizno, menuCd) => del(`/api/biz/${bizno}/menus/${menuCd}`),
    hours: (bizno) => get(`/api/biz/${bizno}/hours`),
    saveHours: (bizno, body) => put(`/api/biz/${bizno}/hours`, body),
    reservationStandard: (bizno) => get(`/api/biz/${bizno}/reservation-standard`),
    saveReservationStandard: (bizno, body) => put(`/api/biz/${bizno}/reservation-standard`, body),
    seats: (bizno) => get(`/api/biz/${bizno}/seats`),
    seatsAdmin: (bizno) => get(`/api/biz/${bizno}/seats/admin`),
    createSeat: (bizno, body) => post(`/api/biz/${bizno}/seats`, body),
    updateSeat: (bizno, seatCd, body) => put(`/api/biz/${bizno}/seats/${seatCd}`, body),
    deleteSeat: (bizno, seatCd) => del(`/api/biz/${bizno}/seats/${seatCd}`),
    issueAccessToken: (bizno, seatCd) => post(`/api/biz/${bizno}/seats/${seatCd}/access-tokens`, {}),
    redeemAccessGrant: (bizno, seatCd, body) => post(`/api/biz/${bizno}/seats/${seatCd}/access-grants`, body),
    accessGrantStatus: (bizno, seatCd, uuid) => get(`/api/biz/${bizno}/seats/${seatCd}/access-grants?uuid=${uuid}`),
    seatStatus: (bizno) => get(`/api/biz/${bizno}/seat-status`),
    updateSeatStatus: (bizno, seatCd, status) => put(`/api/biz/${bizno}/seats/${seatCd}/seat-status`, { status }),
    employees: (bizno) => get(`/api/biz/${bizno}/employees`),
    uploadMenuImage: (bizno, formData) => postMultipart(`/api/biz/${bizno}/menu-image`, formData),
    uploadSeatImage: (bizno, formData) => postMultipart(`/api/biz/${bizno}/seat-image`, formData),
    sendEmailCode: (body) => post(`/api/biz/signup/email-code`, body),
    verifyEmailCode: (body) => post(`/api/biz/signup/email-code/verify`, body),
    signup: (body) => post(`/api/biz/signup`, body),
    uploadRegistrationCert: (bizno, formData) => postMultipart(`/api/biz/${bizno}/registration-cert`, formData),
    extractCertInfo: (bizno, formData) => postMultipart(`/api/biz/${bizno}/registration-cert/extract`, formData),
    getRegistrationCertUrl: (bizno) => get(`/api/biz/${bizno}/registration-cert`),
    checkNtsStatus: (bizno) => post(`/api/biz/${bizno}/nts-status`, {}),
    subscriptionPlans: () => get(`/api/biz/sub-plans`),
    getSubscription: (bizno) => get(`/api/biz/${bizno}/subscription`),
    startSubscription: (bizno, body) => post(`/api/biz/${bizno}/subscription`, body),
    cancelSubscription: (bizno) => put(`/api/biz/${bizno}/subscription/cancel`, {}),
    changeSubscriptionPlan: (bizno, planCd) => put(`/api/biz/${bizno}/subscription/plan`, { planCd }),
    subscriptionPayments: (bizno) => get(`/api/biz/${bizno}/subscription/payments`),
    wipeAllData: (bizno) => del(`/api/biz/${bizno}/wipe-all-data`),
    pendingApprovals: () => get(`/api/biz/approvals`),
    approveBiz: (bizno) => put(`/api/biz/${bizno}/approve`, {}),
    rejectBiz: (bizno, body) => put(`/api/biz/${bizno}/reject`, body),
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
    listByBiz: (bizRegNo, date, from, to) => {
      if (from && to) return get(`/api/reservation/biz/${bizRegNo}?from=${from}&to=${to}`);
      return get(`/api/reservation/biz/${bizRegNo}${date ? `?date=${date}` : ""}`);
    },
    // 손님용 예약 가능시간 조회 — 이름/전화번호 없이 좌석/시간/상태만 내려주는 공개 API
    availability: (bizRegNo, date) => get(`/api/reservation/biz/${bizRegNo}/availability?date=${date}`),
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
    lastGuestPhone: (uuid) => get(`/api/order/last-phone?uuid=${uuid}`),
    listByBiz: (bizRegNo, from, to) => get(`/api/order/biz/${bizRegNo}${from && to ? `?from=${from}&to=${to}` : ""}`),
    get: (orderNo) => get(`/api/order/${orderNo}`),
    post: (body) => post(`/api/order`, body),
    updateStatus: (orderNo, body) => put(`/api/order/${orderNo}/status`, body),
    streamUrl: (uuid) => `${BASE}/api/order/stream?uuid=${uuid}`,
  },
  payment: {
    confirm: (body) => post(`/api/payment/confirm`, body),
    get: (paymentKey) => get(`/api/payment/${paymentKey}`),
    list: (uuid) => get(`/api/payment?uuid=${uuid}`),
    listByBiz: (bizRegNo, from, to) => get(`/api/payment/biz/${bizRegNo}${from && to ? `?from=${from}&to=${to}` : ""}`),
    cancel: (paymentKey, body) => post(`/api/payment/${paymentKey}/cancel`, body),
  },
  dashboard: {
    overview: () => get(`/api/dashboard/overview`),
    revenueRanking: (limit = 5) => get(`/api/dashboard/revenue-ranking?limit=${limit}`),
    security: () => get(`/api/dashboard/security`),
  },
};

export default api;
