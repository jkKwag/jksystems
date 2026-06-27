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
