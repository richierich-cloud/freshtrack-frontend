import { useState, useEffect } from "react";

// ── Supabase config ──────────────────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = "https://litbxjxkvtaiymrqucdj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdGJ4anhrdnRhaXltcnF1Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODY4NzAsImV4cCI6MjA5MDM2Mjg3MH0.ZsXosGcx780EpnF0uACSTOlrt5OBeQjr1yt6OChEass";

const api = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${opts.token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...opts,
  });

const authApi = (path, body) =>
  fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysUntilExpiry = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  return Math.ceil((exp - today) / 86400000);
};

const CATEGORIES = ["Dairy", "Vegetables", "Fruits", "Meat", "Grains", "Snacks", "Beverages", "Other"];

const STATUS = {
  expired: { label: "Expired", color: "#ff4d4d", bg: "#2a0a0a", icon: "💀" },
  soon:    { label: "Expiring Soon", color: "#ffb347", bg: "#2a1a00", icon: "⚠️" },
  fresh:   { label: "Fresh", color: "#4cff91", bg: "#00200e", icon: "✅" },
};

const getStatus = (days) =>
  days < 0 ? "expired" : days <= 3 ? "soon" : "fresh";

// ── Styles ───────────────────────────────────────────────────────────────────
const G = {
  page: {
    minHeight: "100vh",
    background: "#0d0d0d",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: "#e8e8e0",
  },
  noise: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
  },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" },
  card: {
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: "2px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
  },
  logo: { fontSize: "11px", letterSpacing: "0.3em", color: "#4cff91", textTransform: "uppercase", marginBottom: "8px" },
  title: { fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "32px", lineHeight: 1.1 },
  label: { fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: "6px", display: "block" },
  input: {
    width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "2px",
    color: "#e8e8e0", padding: "10px 12px", fontSize: "14px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", marginBottom: "16px",
  },
  btn: {
    width: "100%", background: "#4cff91", color: "#0d0d0d", border: "none",
    borderRadius: "2px", padding: "12px", fontSize: "12px", letterSpacing: "0.15em",
    textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", fontWeight: "700",
  },
  btnGhost: {
    background: "transparent", color: "#888", border: "1px solid #2a2a2a",
    borderRadius: "2px", padding: "8px 16px", fontSize: "11px", letterSpacing: "0.1em",
    cursor: "pointer", fontFamily: "inherit",
  },
  err: { color: "#ff4d4d", fontSize: "12px", marginTop: "8px" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", borderBottom: "1px solid #1e1e1e", position: "sticky", top: 0,
    background: "#0d0d0dcc", backdropFilter: "blur(12px)", zIndex: 10,
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" },
  statCard: { borderRadius: "2px", padding: "20px 24px", border: "1px solid" },
  statNum: { fontSize: "36px", fontWeight: "700", letterSpacing: "-0.03em" },
  statLbl: { fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, marginTop: "4px" },
  addBar: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
    gap: "10px", alignItems: "end", marginBottom: "32px",
    background: "#161616", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "20px",
  },
  itemGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" },
  itemCard: { borderRadius: "2px", border: "1px solid", padding: "18px 20px", position: "relative" },
  badge: { fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "1px" },
  del: {
    position: "absolute", top: "12px", right: "12px", background: "none", border: "none",
    color: "#444", cursor: "pointer", fontSize: "16px", lineHeight: 1,
  },
  select: {
    width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "2px",
    color: "#e8e8e0", padding: "10px 12px", fontSize: "14px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  sectionHead: { fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#555", marginBottom: "12px", marginTop: "8px" },
  empty: { color: "#444", fontSize: "13px", padding: "20px 0" },
};

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/token?grant_type=password" : "/signup";
      const res = await authApi(endpoint, { email, password });
      const data = await res.json();
      if (data.error || data.error_description) throw new Error(data.error_description || data.error);
      if (mode === "signup") { setErr("✅ Check your email to confirm!"); setLoading(false); return; }
      onLogin(data);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={G.page}>
      <div style={G.noise} />
      <div style={G.center}>
        <div style={G.card}>
          <div style={G.logo}>FreshTrack</div>
          <div style={G.title}>{mode === "login" ? "Welcome\nback." : "Create\naccount."}</div>
          <label style={G.label}>Email</label>
          <input style={G.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <label style={G.label}>Password</label>
          <input style={G.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
          <button style={G.btn} onClick={submit} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In →" : "Sign Up →"}
          </button>
          {err && <div style={G.err}>{err}</div>}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button style={G.btnGhost} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>
              {mode === "login" ? "No account? Sign up" : "Have account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function Dashboard({ session, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", category: "Dairy", quantity: "", expiry_date: "" });
  const [adding, setAdding] = useState(false);

  const token = session.access_token;
  const userId = session.user.id;

  const load = async () => {
    setLoading(true);
    const res = await api(`/food_items?user_id=eq.${userId}&order=expiry_date.asc`, { token });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!form.name || !form.expiry_date) return;
    setAdding(true);
    await api("/food_items", {
      method: "POST",
      token,
      body: JSON.stringify({ ...form, quantity: Number(form.quantity) || 1, user_id: userId }),
    });
    setForm({ name: "", category: "Dairy", quantity: "", expiry_date: "" });
    await load();
    setAdding(false);
  };

  const deleteItem = async (id) => {
    await api(`/food_items?id=eq.${id}`, { method: "DELETE", token });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const grouped = { expired: [], soon: [], fresh: [] };
  items.forEach(item => grouped[getStatus(daysUntilExpiry(item.expiry_date))].push(item));

  const inpStyle = { ...G.input, marginBottom: 0 };

  return (
    <div style={G.page}>
      <div style={G.noise} />
      <nav style={G.nav}>
        <div>
          <span style={{ ...G.logo, marginBottom: 0 }}>🥫 FreshTrack</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "#555" }}>{session.user.email}</span>
          <button style={G.btnGhost} onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      <div style={G.main}>
        {/* Stats */}
        <div style={G.grid}>
          {Object.entries(STATUS).map(([key, s]) => (
            <div key={key} style={{ ...G.statCard, background: s.bg, borderColor: s.color + "44" }}>
              <div style={{ ...G.statNum, color: s.color }}>{grouped[key].length}</div>
              <div style={{ ...G.statLbl, color: s.color }}>{s.icon} {s.label}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div style={G.addBar}>
          <div>
            <label style={G.label}>Item Name</label>
            <input style={inpStyle} placeholder="e.g. Milk" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={G.label}>Category</label>
            <select style={G.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={G.label}>Quantity</label>
            <input style={inpStyle} type="number" min="1" placeholder="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div>
            <label style={G.label}>Expiry Date</label>
            <input style={inpStyle} type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
          </div>
          <button style={{ ...G.btn, width: "auto", padding: "10px 24px", whiteSpace: "nowrap" }} onClick={addItem} disabled={adding}>
            {adding ? "..." : "+ Add"}
          </button>
        </div>

        {/* Item sections */}
        {loading ? (
          <div style={{ color: "#444", fontSize: "13px" }}>Loading your pantry...</div>
        ) : (
          Object.entries(STATUS).map(([key, s]) => (
            <div key={key}>
              <div style={G.sectionHead}>{s.icon} {s.label} · {grouped[key].length} item{grouped[key].length !== 1 ? "s" : ""}</div>
              {grouped[key].length === 0 ? (
                <div style={G.empty}>No {s.label.toLowerCase()} items.</div>
              ) : (
                <div style={{ ...G.itemGrid, marginBottom: "32px" }}>
                  {grouped[key].map(item => {
                    const days = daysUntilExpiry(item.expiry_date);
                    return (
                      <div key={item.id} style={{ ...G.itemCard, background: s.bg, borderColor: s.color + "55" }}>
                        <button style={G.del} onClick={() => deleteItem(item.id)}>×</button>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ ...G.badge, background: s.color + "22", color: s.color }}>
                            {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "today" : `${days}d left`}
                          </span>
                          <span style={{ ...G.badge, background: "#ffffff11", color: "#888" }}>{item.category}</span>
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600", letterSpacing: "-0.01em" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                          Qty: {item.quantity} · Expires: {item.expiry_date}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);

  const handleLogout = async () => {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
    });
    setSession(null);
  };

  return session
    ? <Dashboard session={session} onLogout={handleLogout} />
    : <AuthScreen onLogin={setSession} />;
}