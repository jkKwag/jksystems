const SUPABASE_URL = "https://zhtqkjorhhqnnhgsddmn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodHFram9yaGhxbm5oZ3NkZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzIwNTksImV4cCI6MjA5MTgwODA1OX0.yGME2-cI6Rms8oXH612THOnXq_-eWW7wqIxAi3OCm1Y";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

function buildSelect(table, cols) {
  const filters = {};
  let isSingle = false;

  const run = async () => {
    const params = new URLSearchParams({ select: cols, ...filters });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: HEADERS });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    if (isSingle) return { data: Array.isArray(data) ? (data[0] ?? null) : data, error: null };
    return { data, error: null };
  };

  const builder = {
    eq(col, val) { filters[col] = `eq.${val}`; return builder; },
    in(col, vals) { filters[col] = `in.(${vals.join(",")})`; return builder; },
    order(col, { ascending = true } = {}) { filters["order"] = `${col}.${ascending ? "asc" : "desc"}`; return builder; },
    single() { isSingle = true; return run(); },
    then(resolve, reject) { return run().then(resolve, reject); },
  };

  return builder;
}

const supabase = {
  from: (table) => ({
    select: (cols = "*") => buildSelect(table, cols),
    insert: async (row) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    update: (row) => {
      const filters = {};
      const builder = {
        eq(col, val) { filters[col] = `eq.${val}`; return builder; },
        then(resolve, reject) {
          const params = new URLSearchParams(filters);
          return fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
            method: "PATCH",
            headers: HEADERS,
            body: JSON.stringify(row),
          }).then(async (res) => {
            const data = res.ok ? null : await res.json();
            return { error: data };
          }).then(resolve, reject);
        },
      };
      return builder;
    },
  }),
};

export default supabase;

const WS_URL = SUPABASE_URL.replace("https://", "wss://") + "/realtime/v1/websocket?apikey=" + SUPABASE_KEY + "&vsn=1.0.0";

export function subscribeInserts(table, filter, onInsert) {
  if (typeof WebSocket === "undefined") return () => {};
  const ws = new WebSocket(WS_URL);
  let heartbeat = null;
  let ref = 0;
  ws.onopen = () => {
    ws.send(JSON.stringify({
      topic: `realtime:public:${table}`,
      event: "phx_join",
      payload: {
        config: {
          broadcast: { self: false },
          postgres_changes: [{ event: "INSERT", schema: "public", table, filter }],
        },
      },
      ref: String(++ref),
    }));
    heartbeat = setInterval(() => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++ref) }));
    }, 29000);
  };
  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.event === "postgres_changes" && msg.payload?.data?.type === "INSERT") onInsert(msg.payload.data.record);
    } catch {}
  };
  return () => { clearInterval(heartbeat); ws.close(); };
}
