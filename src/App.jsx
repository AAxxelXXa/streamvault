import { useState, useEffect } from "react";
import {
  Shield, Plus, LogOut, Send, Check, X, Eye, EyeOff, ChevronRight,
  Package, Bell, Trash2, Copy, ExternalLink, Search, Edit2, Save,
  Users, Calendar, Settings, Key, Bot, Clock, AlertTriangle, History,
  ChevronDown, UserCheck, RefreshCw, ToggleLeft, ToggleRight
} from "lucide-react";

const TELEGRAM_BOT = "https://t.me/Jagerchk_bot";
const NTFY_TOPIC = "streamvault-axel-2026";

async function pushNotify(title, message, priority = "high") {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        "Title": title,
        "Priority": priority,
        "Tags": "streaming,bell",
        "Content-Type": "text/plain",
      },
      body: message,
    });
  } catch {}
}

const PLATFORMS = [
  { id: "netflix",     name: "Netflix",        icon: "N",   color: "#E50914", desc: "Series, películas y documentales" },
  { id: "disney",      name: "Disney+",         icon: "D+",  color: "#006E99", desc: "Disney, Marvel, Star Wars, Pixar" },
  { id: "max",         name: "Max",             icon: "MAX", color: "#3B5BDB", desc: "HBO, series premium y más" },
  { id: "prime",       name: "Prime Video",     icon: "▶",   color: "#00A8E1", desc: "Amazon Prime Video originals" },
  { id: "spotify",     name: "Spotify",         icon: "♫",   color: "#1DB954", desc: "Música y podcasts sin anuncios" },
  { id: "appletv",     name: "Apple TV+",       icon: "tv",  color: "#888888", desc: "Originales exclusivos de Apple" },
  { id: "paramount",   name: "Paramount+",      icon: "P+",  color: "#0064FF", desc: "CBS, MTV, Nickelodeon y más" },
  { id: "crunchyroll", name: "Crunchyroll",     icon: "CR",  color: "#F47521", desc: "Anime en español e inglés" },
  { id: "youtube",     name: "YouTube Premium", icon: "YT",  color: "#FF0000", desc: "Sin anuncios + YouTube Music" },
  { id: "star",        name: "Star+",           icon: "★+",  color: "#A52FAB", desc: "Fox, ESPN, National Geographic" },
  { id: "mubi",        name: "MUBI",            icon: "M",   color: "#37B6FF", desc: "Cine de autor y festivales" },
  { id: "hulu",        name: "Hulu",            icon: "H",   color: "#1CE783", desc: "Series, películas y TV en vivo" },
];

const DEMO_ACCOUNTS = {
  netflix: [{ id: 1, email: "demo@netflix.com", password: "demo123", profile: "Perfil 1", status: "disponible", expiresAt: "2025-08-01", assignedTo: null }],
  spotify: [{ id: 2, email: "demo@spotify.com", password: "music456", profile: "Familiar", status: "disponible", expiresAt: "2025-07-15", assignedTo: null }],
};

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }); }
function genKey(plat) {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SV-${plat.toUpperCase().slice(0, 4)}-${rand}`;
}



// ── UI Components ─────────────────────────────────────────────────────────────

function PlatformIcon({ id, size = 44 }) {
  const p = PLATFORMS.find(x => x.id === id) || {};
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: p.color || "#333",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: size * 0.28, color: "#fff", letterSpacing: -1,
      boxShadow: `0 0 18px ${p.color || "#333"}44`,
    }}>{p.icon || "?"}</div>
  );
}

function Badge({ children, color = "gray", dot }) {
  const C = {
    green:  { bg: "#052e16", text: "#4ade80", border: "#166534" },
    red:    { bg: "#450a0a", text: "#f87171", border: "#7f1d1d" },
    blue:   { bg: "#0c1a3a", text: "#60a5fa", border: "#1e3a8a" },
    amber:  { bg: "#1a0f00", text: "#fbbf24", border: "#78350f" },
    purple: { bg: "#1a0a2e", text: "#c4b5fd", border: "#4c1d95" },
    gray:   { bg: "#1c1c1c", text: "#9ca3af", border: "#374151" },
  };
  const c = C[color] || C.gray;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />}
      {children}
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: 0.3 }}>{label}</label>}
      <input {...props} style={{ width: "100%", background: "#080812", border: "1px solid #ffffff18", borderRadius: 10, padding: "10px 13px", color: "#f0f0f5", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.15s", ...(props.style || {}) }}
        onFocus={e => e.target.style.border = "1px solid #6366f166"}
        onBlur={e => e.target.style.border = "1px solid #ffffff18"} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>}
      <select {...props} style={{ width: "100%", background: "#080812", border: "1px solid #ffffff18", borderRadius: 10, padding: "10px 13px", color: "#f0f0f5", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  const variants = {
    primary: { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", border: "none" },
    ghost:   { background: "transparent", color: "#9ca3af", border: "1px solid #ffffff18" },
    danger:  { background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d" },
    success: { background: "#052e16", color: "#4ade80", border: "1px solid #166534" },
    tg:      { background: "#0c1a3a", color: "#60a5fa", border: "1px solid #1e3a8a" },
    amber:   { background: "#1a0f00", color: "#fbbf24", border: "1px solid #78350f" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button {...props} style={{ ...v, borderRadius: 10, padding: small ? "6px 12px" : "10px 18px", fontWeight: 600, fontSize: small ? 12 : 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s", ...(props.style || {}) }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Modal({ title, sub, onClose, children, width = 460 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #ffffff15", borderRadius: 22, padding: 28, width: "100%", maxWidth: width, boxShadow: "0 32px 80px #000000aa", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{title}</h2>
            {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{sub}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 2 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function StreamVault() {
  const [accounts,    setAccounts]    = useState(DEMO_ACCOUNTS);
  const [requests,    setRequests]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [keys,        setKeys]        = useState([]);
  const [settings,    setSettings]    = useState({ botToken: "", chatId: "", adminPass: "admin2024" });
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [view,        setView]        = useState("home");
  const [adminTab,    setAdminTab]    = useState("accounts");
  const [modal,       setModal]       = useState(null);
  const [selPlatform, setSelPlatform] = useState(null);
  const [notif,       setNotif]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [copied,      setCopied]      = useState(null);
  // forms
  const [loginPass,   setLoginPass]   = useState("");
  const [showLP,      setShowLP]      = useState(false);
  const [passErr,     setPassErr]     = useState(false);
  const [reqName,     setReqName]     = useState("");
  const [newAcc,      setNewAcc]      = useState({ email: "", password: "", profile: "", platform: "", expiresAt: "" });
  const [editingAcc,  setEditingAcc]  = useState(null);
  const [newPass,     setNewPass]     = useState({ current: "", next: "", confirm: "" });
  const [showPasses,  setShowPasses]  = useState({});
  const [assignModal, setAssignModal] = useState(null);
  const [assignName,  setAssignName]  = useState("");
  // keys
  const [keyModal,    setKeyModal]    = useState(false);
  const [keyInput,    setKeyInput]    = useState("");
  const [keyResult,   setKeyResult]   = useState(null);
  const [keyLoading,  setKeyLoading]  = useState(false);
  const [genKeyPlat,  setGenKeyPlat]  = useState("netflix");
  const [genKeyDur,   setGenKeyDur]   = useState("7d");
  const [genKeyResult,setGenKeyResult]= useState(null);

  // ── storage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sv_data");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.accounts) setAccounts(d.accounts);
        if (d.requests) setRequests(d.requests);
        if (d.clients)  setClients(d.clients);
        if (d.keys)     setKeys(d.keys);
        if (d.settings) setSettings(d.settings);
      }
    } catch {}
  }, []);

  function persist(patch) {
    try {
      const saved = localStorage.getItem("sv_data");
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sv_data", JSON.stringify({ ...current, ...patch }));
    } catch {}
  }

  function saveAccounts(d) { setAccounts(d); persist({ accounts: d }); }
  function saveRequests(d) { setRequests(d); persist({ requests: d }); }
  function saveClients(d)  { setClients(d);  persist({ clients: d }); }
  function saveKeys(d)     { setKeys(d);     persist({ keys: d }); }
  function saveSettings(d) { setSettings(d); persist({ settings: d }); }

  function toast(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  }

  async function notify(title, message) {
    await pushNotify(title, message);
  }

  // ── auth ──
  function doLogin() {
    if (loginPass === settings.adminPass) {
      setIsAdmin(true); setView("admin"); setLoginPass(""); setPassErr(false);
    } else {
      setPassErr(true); setTimeout(() => setPassErr(false), 1400);
    }
  }

  function changePass() {
    if (newPass.current !== settings.adminPass) { toast("Contraseña actual incorrecta", "error"); return; }
    if (newPass.next.length < 6) { toast("Mínimo 6 caracteres", "error"); return; }
    if (newPass.next !== newPass.confirm) { toast("Las contraseñas no coinciden", "error"); return; }
    saveSettings({ ...settings, adminPass: newPass.next });
    setNewPass({ current: "", next: "", confirm: "" });
    toast("Contraseña actualizada");
  }

  // ── accounts ──
  function addAccount() {
    if (!newAcc.email || !newAcc.password || !newAcc.platform) { toast("Completa los campos requeridos", "error"); return; }
    const updated = { ...accounts };
    if (!updated[newAcc.platform]) updated[newAcc.platform] = [];
    updated[newAcc.platform] = [...updated[newAcc.platform], { ...newAcc, id: Date.now(), status: "disponible", assignedTo: null }];
    saveAccounts(updated); setNewAcc({ email: "", password: "", profile: "", platform: "", expiresAt: "" });
    setModal(null); toast("Cuenta agregada");
  }

  function deleteAccount(platform, id) {
    const updated = { ...accounts };
    updated[platform] = updated[platform].filter(a => a.id !== id);
    saveAccounts(updated); toast("Cuenta eliminada");
  }

  function startEdit(platform, id, field, value) { setEditingAcc({ platform, id, field, value }); }
  function saveEdit() {
    if (!editingAcc) return;
    const { platform, id, field, value } = editingAcc;
    const updated = { ...accounts };
    updated[platform] = updated[platform].map(a => a.id === id ? { ...a, [field]: value } : a);
    saveAccounts(updated); setEditingAcc(null); toast("Campo actualizado");
  }

  function toggleStatus(platform, id) {
    const updated = { ...accounts };
    updated[platform] = updated[platform].map(a => a.id === id ? { ...a, status: a.status === "disponible" ? "ocupado" : "disponible" } : a);
    saveAccounts(updated);
  }

  function assignAccount() {
    if (!assignName.trim() || !assignModal) return;
    const { platform, accId } = assignModal;
    const updated = { ...accounts };
    const acc = updated[platform].find(a => a.id === accId);
    if (!acc) return;
    updated[platform] = updated[platform].map(a => a.id === accId ? { ...a, status: "ocupado", assignedTo: assignName.trim() } : a);
    saveAccounts(updated);
    saveClients([{ id: Date.now(), clientName: assignName.trim(), platform, accountEmail: acc.email, date: new Date().toLocaleDateString("es-PE"), action: "asignada" }, ...clients]);
    notify(`✅ Cuenta asignada`, `Cliente: ${assignName}\nPlataforma: ${PLATFORMS.find(p => p.id === platform)?.name}\nEmail: ${acc.email}`);
    setAssignModal(null); setAssignName(""); toast(`Cuenta asignada a ${assignName}`);
  }

  // ── requests ──
  async function requestAccess() {
    if (!reqName.trim() || !selPlatform) return;
    const req = { id: Date.now(), platform: selPlatform.id, name: reqName.trim(), date: new Date().toLocaleDateString("es-PE"), status: "pendiente" };
    saveRequests([req, ...requests]);
    await notify(
      `📨 Nueva solicitud — ${selPlatform.name}`,
      `Cliente: ${reqName}\nPlataforma: ${selPlatform.name}\nFecha: ${req.date}\n\nIngresa al panel admin para generar su key.`
    );
    setModal(null); setReqName(""); toast("✅ Solicitud enviada. El admin te contactará pronto.");
  }

  function deleteRequest(id) { saveRequests(requests.filter(r => r.id !== id)); }
  function deleteClient(id)  { saveClients(clients.filter(c => c.id !== id)); }

  // ── keys ──
  function generateKey() {
    if (!genKeyPlat) { toast("Selecciona una plataforma", "error"); return; }
    const codigo = genKey(genKeyPlat);
    let expiraEn = null;
    let durTexto = "Ilimitada";

    if (genKeyDur !== "ilimitada") {
      const match = genKeyDur.match(/^(\d+)(d|h|m)$/);
      if (match) {
        const val = parseInt(match[1]);
        const u = match[2];
        const ms = u === "d" ? val * 86400000 : u === "h" ? val * 3600000 : val * 60000;
        expiraEn = new Date(Date.now() + ms).toISOString();
        durTexto = u === "d" ? `${val} día(s)` : u === "h" ? `${val} hora(s)` : `${val} minuto(s)`;
      }
    }

    const newKey = { id: Date.now(), codigo, plataforma: genKeyPlat, duracion: durTexto, expiraEn, usada: false, creadaEn: new Date().toISOString() };
    const updated = [newKey, ...keys];
    saveKeys(updated);
    setGenKeyResult(newKey);
    toast(`Key generada: ${codigo}`);
  }

  function deleteKey(id) { saveKeys(keys.filter(k => k.id !== id)); }

  function activarKey() {
    if (!keyInput.trim()) return;
    setKeyLoading(true);
    setKeyResult(null);
    setTimeout(() => {
      const found = keys.find(k => k.codigo === keyInput.trim().toUpperCase() && !k.usada);
      if (!found) {
        setKeyResult({ valida: false, error: "Key inválida o ya utilizada" });
        setKeyLoading(false);
        return;
      }
      if (found.expiraEn && new Date() > new Date(found.expiraEn)) {
        saveKeys(keys.map(k => k.id === found.id ? { ...k, usada: true } : k));
        setKeyResult({ valida: false, error: "Esta key ha expirado" });
        setKeyLoading(false);
        return;
      }
      saveKeys(keys.map(k => k.id === found.id ? { ...k, usada: true, usadaEn: new Date().toISOString() } : k));
      setKeyResult({ valida: true, plataforma: found.plataforma, duracion: found.duracion, expiraEn: found.expiraEn });
      setKeyLoading(false);
    }, 800);
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  }

  // ── derived ──
  const allAccounts  = Object.values(accounts).flat();
  const totalAcc     = allAccounts.length;
  const availableAcc = allAccounts.filter(a => a.status === "disponible").length;
  const expiringAcc  = allAccounts.filter(a => { const d = daysUntil(a.expiresAt); return d !== null && d <= 7 && d >= 0; }).length;
  const filteredPlatforms = PLATFORMS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const activeKeys   = keys.filter(k => !k.usada && (!k.expiraEn || new Date() < new Date(k.expiraEn)));

  // ─────────────────────────────── RENDER ──────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f0f0f5", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* Toast */}
      {notif && (
        <div style={{ position: "fixed", top: 16, right: 16, left: 16, zIndex: 9999, background: notif.type === "error" ? "#450a0a" : notif.type === "warn" ? "#1a0f00" : "#052e16", border: `1px solid ${notif.type === "error" ? "#7f1d1d" : notif.type === "warn" ? "#78350f" : "#166534"}`, color: notif.type === "error" ? "#f87171" : notif.type === "warn" ? "#fbbf24" : "#4ade80", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px #00000066", animation: "slideIn 0.25s ease", maxWidth: 420, margin: "0 auto" }}>
          {notif.type === "error" ? <X size={15} /> : notif.type === "warn" ? <AlertTriangle size={15} /> : <Check size={15} />}
          {notif.msg}
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #ffffff0e", background: "#09091488", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setView("home"); setAdminTab("accounts"); }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>StreamVault</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {/* Botón Activar Key siempre visible */}
          <Btn variant="success" small onClick={() => { setKeyModal(true); setKeyResult(null); setKeyInput(""); }}>
            <Key size={13} /> Activar Key
          </Btn>
          {expiringAcc > 0 && isAdmin && (
            <div style={{ background: "#1a0f00", border: "1px solid #78350f", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={11} /> {expiringAcc} vencen
            </div>
          )}
          {isAdmin ? (
            <>
              {["accounts", "requests", "clients", "keys", "settings"].map(t => (
                <button key={t} onClick={() => { setView("admin"); setAdminTab(t); }} style={{ background: adminTab === t && view === "admin" ? "#1e1e2e" : "transparent", border: "1px solid #ffffff18", borderRadius: 9, color: "#c4b5fd", padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {t === "accounts" ? "Cuentas" : t === "requests" ? "Solicitudes" : t === "clients" ? "Clientes" : t === "keys" ? "Keys" : "Config"}
                </button>
              ))}
              <button onClick={() => { setIsAdmin(false); setView("home"); }} style={{ background: "transparent", border: "1px solid #ffffff18", borderRadius: 9, color: "#6b7280", padding: "6px 12px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <LogOut size={12} /> Salir
              </button>
            </>
          ) : (
            <Btn small onClick={() => setView("login")}><Shield size={13} /> Admin</Btn>
          )}
        </div>
      </nav>

      {/* ═══════════ HOME ═══════════ */}
      {view === "home" && (
        <div style={{ maxWidth: "100%", padding: "32px 16px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: "#1e1e2e", border: "1px solid #6366f133", borderRadius: 999, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
              ✦ Streaming Accounts Vault
            </div>
            <h1 style={{ fontSize: "clamp(28px,6vw,52px)", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1, letterSpacing: -1.5 }}>
              Todas tus plataformas<br />
              <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>en un solo lugar</span>
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 15, maxWidth: 420, margin: "0 auto 24px" }}>
              Solicita acceso al administrador. Recibes tu key de activación y la usas directamente aquí.
            </p>
            {/* Stats */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { label: "Plataformas", value: PLATFORMS.length, icon: "🎬" },
                { label: "Cuentas totales", value: totalAcc, icon: "💳" },
                { label: "Disponibles", value: availableAcc, icon: "✅" },
                { label: "Solicitudes", value: requests.length, icon: "📨" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, padding: "12px 18px", minWidth: 90 }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Botón activar key destacado */}
            <Btn onClick={() => { setKeyModal(true); setKeyResult(null); setKeyInput(""); }} style={{ fontSize: 15, padding: "12px 28px" }}>
              <Key size={16} /> Tengo una key — Activar ahora
            </Btn>
          </div>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 360, margin: "0 auto 24px" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plataforma…"
              style={{ width: "100%", background: "#0f0f1a", border: "1px solid #ffffff12", borderRadius: 11, padding: "10px 10px 10px 36px", color: "#f0f0f5", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Platform grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
            {filteredPlatforms.map(platform => {
              const pAccounts = accounts[platform.id] || [];
              const avail = pAccounts.filter(a => a.status === "disponible").length;
              const expiring = pAccounts.filter(a => { const d = daysUntil(a.expiresAt); return d !== null && d <= 7 && d >= 0; }).length;
              return (
                <div key={platform.id} onClick={() => { setSelPlatform(platform); setModal("view"); }}
                  style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 18, padding: 16, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.18s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${platform.color}55`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${platform.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.border = "1px solid #ffffff0e"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "absolute", top: -18, right: -18, width: 70, height: 70, borderRadius: "50%", background: platform.color, opacity: 0.08 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <PlatformIcon id={platform.id} size={40} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{platform.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{platform.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Badge color={avail > 0 ? "green" : "red"} dot>{avail > 0 ? `${avail} disponible${avail !== 1 ? "s" : ""}` : "Sin stock"}</Badge>
                      {expiring > 0 && <Badge color="amber"><AlertTriangle size={10} /> {expiring} vence</Badge>}
                    </div>
                    <ChevronRight size={14} color="#6b7280" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ LOGIN ═══════════ */}
      {view === "login" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 70px)", padding: 16 }}>
          <div style={{ background: "#0f0f1a", border: "1px solid #ffffff12", borderRadius: 22, padding: 32, width: "100%", maxWidth: 360, boxShadow: "0 32px 80px #00000088" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, margin: "0 auto 12px", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={24} color="#fff" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Panel Admin</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Ingresa tu contraseña</p>
            </div>
            <Input label="Contraseña" type={showLP ? "text" : "password"} value={loginPass}
              onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
              placeholder="••••••••"
              style={{ border: passErr ? "1px solid #7f1d1d" : "1px solid #ffffff18", background: passErr ? "#2d0000" : "#080812" }} />
            {passErr && <p style={{ color: "#f87171", fontSize: 12, margin: "-8px 0 12px" }}>Contraseña incorrecta</p>}
            <button onClick={() => setShowLP(!showLP)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 12, marginBottom: 12, padding: 0 }}>
              {showLP ? "Ocultar" : "Mostrar"} contraseña
            </button>
            <Btn onClick={doLogin} style={{ width: "100%", justifyContent: "center", padding: "12px 0" }}>Ingresar</Btn>
            <button onClick={() => setView("home")} style={{ width: "100%", background: "none", border: "none", color: "#6b7280", fontSize: 13, marginTop: 10, cursor: "pointer" }}>← Volver</button>
          </div>
        </div>
      )}

      {/* ═══════════ ADMIN ═══════════ */}
      {view === "admin" && isAdmin && (
        <div style={{ maxWidth: "100%", padding: "24px 16px" }}>

          {/* ── CUENTAS ── */}
          {adminTab === "accounts" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Cuentas de Streaming</h2>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: 12 }}>Administra cuentas en tiempo real</p>
                </div>
                <Btn onClick={() => { setNewAcc({ email: "", password: "", profile: "", platform: "", expiresAt: "" }); setModal("addAccount"); }}>
                  <Plus size={14} /> Agregar Cuenta
                </Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 22 }}>
                {[
                  { label: "Total", value: totalAcc, color: "#6366f1" },
                  { label: "Disponibles", value: availableAcc, color: "#1DB954" },
                  { label: "Ocupadas", value: totalAcc - availableAcc, color: "#f59e0b" },
                  { label: "Vencen pronto", value: expiringAcc, color: "#f87171" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {PLATFORMS.map(platform => {
                const pAccs = accounts[platform.id] || [];
                if (!pAccs.length) return null;
                return (
                  <div key={platform.id} style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <PlatformIcon id={platform.id} size={32} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{platform.name}</span>
                      <Badge color={pAccs.filter(a => a.status === "disponible").length > 0 ? "green" : "red"} dot>
                        {pAccs.filter(a => a.status === "disponible").length} disponibles
                      </Badge>
                    </div>
                    {pAccs.map(acc => {
                      const days = daysUntil(acc.expiresAt);
                      const expWarn = days !== null && days <= 7;
                      const isEditing = editingAcc && editingAcc.platform === platform.id && editingAcc.id === acc.id;
                      return (
                        <div key={acc.id} style={{ background: "#08080f", border: `1px solid ${expWarn ? "#78350f44" : "#ffffff08"}`, borderRadius: 10, padding: "11px 13px", marginBottom: 7 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: acc.status === "disponible" ? "#1DB954" : "#f59e0b", flexShrink: 0 }} />
                            {isEditing && editingAcc.field === "email" ? (
                              <input autoFocus value={editingAcc.value} onChange={e => setEditingAcc(v => ({ ...v, value: e.target.value }))} onBlur={saveEdit} onKeyDown={e => e.key === "Enter" && saveEdit()} style={{ flex: 1, minWidth: 140, background: "#1a1a2e", border: "1px solid #6366f1", borderRadius: 7, padding: "4px 8px", color: "#f0f0f5", fontSize: 13 }} />
                            ) : (
                              <span onClick={() => startEdit(platform.id, acc.id, "email", acc.email)} style={{ flex: 1, minWidth: 120, fontSize: 13, fontWeight: 600, cursor: "text" }} title="Clic para editar">{acc.email}</span>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ background: "#1a1a2e", border: "1px solid #ffffff0a", borderRadius: 6, padding: "2px 8px", fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>
                                {showPasses[acc.id] ? acc.password : "••••••••"}
                              </span>
                              <button onClick={() => setShowPasses(p => ({ ...p, [acc.id]: !p[acc.id] }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 2 }}>
                                {showPasses[acc.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                              <button onClick={() => copyText(`${acc.email} | ${acc.password}`, acc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: copied === acc.id ? "#1DB954" : "#6b7280", padding: 2 }}>
                                {copied === acc.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                            <span style={{ fontSize: 11, color: expWarn ? "#fbbf24" : "#6b7280" }}><Calendar size={10} /> {acc.expiresAt ? fmt(acc.expiresAt) : "Sin fecha"}</span>
                            {acc.assignedTo && <Badge color="blue"><UserCheck size={10} /> {acc.assignedTo}</Badge>}
                            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                              <Btn small variant="ghost" onClick={() => { setAssignModal({ platform: platform.id, accId: acc.id }); setAssignName(""); }}><UserCheck size={11} /> Asignar</Btn>
                              <Btn small variant={acc.status === "disponible" ? "ghost" : "success"} onClick={() => toggleStatus(platform.id, acc.id)}>
                                {acc.status === "disponible" ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
                                {acc.status === "disponible" ? "Ocupar" : "Liberar"}
                              </Btn>
                              <Btn small variant="danger" onClick={() => deleteAccount(platform.id, acc.id)}><Trash2 size={11} /></Btn>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {!PLATFORMS.some(p => (accounts[p.id] || []).length > 0) && (
                <div style={{ textAlign: "center", color: "#4b5563", padding: "60px 0" }}>Aún no hay cuentas. Usa "Agregar Cuenta".</div>
              )}
            </>
          )}

          {/* ── SOLICITUDES ── */}
          {adminTab === "requests" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Solicitudes de Acceso</h2>
                <p style={{ color: "#6b7280", margin: 0, fontSize: 12 }}>{requests.length} solicitudes registradas</p>
              </div>
              {requests.length === 0 ? (
                <div style={{ textAlign: "center", color: "#4b5563", padding: "60px 0" }}>Sin solicitudes pendientes</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {requests.map(req => {
                    const plat = PLATFORMS.find(p => p.id === req.platform);
                    return (
                      <div key={req.id} style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {plat && <PlatformIcon id={plat.id} size={32} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{req.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{plat?.name} · {req.date}</div>
                        </div>
                        <Badge color="blue" dot>pendiente</Badge>
                        <Btn variant="success" small onClick={() => { setAdminTab("keys"); setGenKeyPlat(req.platform); }}>
                          <Key size={12} /> Generar Key
                        </Btn>
                        <Btn variant="tg" small onClick={() => window.open(TELEGRAM_BOT, "_blank")}>
                          <Send size={12} /> Telegram
                        </Btn>
                        <Btn variant="danger" small onClick={() => deleteRequest(req.id)}><Trash2 size={12} /></Btn>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── CLIENTES ── */}
          {adminTab === "clients" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Historial de Clientes</h2>
                <p style={{ color: "#6b7280", margin: 0, fontSize: 12 }}>{clients.length} registros</p>
              </div>
              {clients.length === 0 ? (
                <div style={{ textAlign: "center", color: "#4b5563", padding: "60px 0" }}>Sin historial aún.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {clients.map(c => {
                    const plat = PLATFORMS.find(p => p.id === c.platform);
                    return (
                      <div key={c.id} style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <PlatformIcon id={c.platform} size={28} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{c.clientName}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{plat?.name} · {c.accountEmail} · {c.date}</div>
                        </div>
                        <Badge color="green" dot>{c.action}</Badge>
                        <button onClick={() => deleteClient(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><Trash2 size={13} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── KEYS ── */}
          {adminTab === "keys" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Gestión de Keys</h2>
                <p style={{ color: "#6b7280", margin: 0, fontSize: 12 }}>{activeKeys.length} keys activas</p>
              </div>

              {/* Generador */}
              <div style={{ background: "#0f0f1a", border: "1px solid #6366f133", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Key size={15} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Generar nueva key</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Crea una key y compártela con tu cliente</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Select label="Plataforma" value={genKeyPlat} onChange={e => setGenKeyPlat(e.target.value)}>
                      {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <Select label="Duración" value={genKeyDur} onChange={e => setGenKeyDur(e.target.value)}>
                      <option value="1h">1 hora</option>
                      <option value="6h">6 horas</option>
                      <option value="12h">12 horas</option>
                      <option value="1d">1 día</option>
                      <option value="3d">3 días</option>
                      <option value="7d">7 días</option>
                      <option value="15d">15 días</option>
                      <option value="30d">30 días</option>
                      <option value="ilimitada">Ilimitada</option>
                    </Select>
                  </div>
                </div>
                <Btn onClick={generateKey} style={{ width: "100%", justifyContent: "center" }}>
                  <Key size={14} /> Generar Key
                </Btn>

                {genKeyResult && (
                  <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 12, padding: 16, marginTop: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Key generada — cópiala y envíala a tu cliente</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <code style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", letterSpacing: 2 }}>{genKeyResult.codigo}</code>
                      <button onClick={() => copyText(genKeyResult.codigo, "genkey")} style={{ background: "none", border: "none", cursor: "pointer", color: copied === "genkey" ? "#4ade80" : "#6b7280" }}>
                        {copied === "genkey" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "#86efac", marginTop: 6 }}>
                      📺 {PLATFORMS.find(p => p.id === genKeyResult.plataforma)?.name} · ⏱ {genKeyResult.duracion}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de keys */}
              <div style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, overflow: "hidden" }}>
                {keys.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#4b5563", padding: "40px 0" }}>No hay keys generadas aún</div>
                ) : (
                  keys.map((k, i) => {
                    const expired = k.expiraEn && new Date() > new Date(k.expiraEn);
                    const plat = PLATFORMS.find(p => p.id === k.plataforma);
                    return (
                      <div key={k.id} style={{ padding: "12px 16px", borderBottom: i < keys.length - 1 ? "1px solid #ffffff06" : "none", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <PlatformIcon id={k.plataforma} size={28} />
                        <div style={{ flex: 1 }}>
                          <code style={{ fontSize: 14, fontWeight: 700, color: k.usada || expired ? "#6b7280" : "#c4b5fd", letterSpacing: 1 }}>{k.codigo}</code>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{plat?.name} · {k.duracion} {k.expiraEn ? `· Expira: ${fmt(k.expiraEn.split("T")[0])}` : ""}</div>
                        </div>
                        <Badge color={k.usada ? "gray" : expired ? "red" : "green"} dot>
                          {k.usada ? "Usada" : expired ? "Expirada" : "Activa"}
                        </Badge>
                        <button onClick={() => copyText(k.codigo, k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: copied === k.id ? "#4ade80" : "#6b7280" }}>
                          {copied === k.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => deleteKey(k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><Trash2 size={13} /></button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ── CONFIG ── */}
          {adminTab === "settings" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Configuración</h2>
              <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: 12 }}>Telegram y seguridad del panel</p>

              <div style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Bell size={18} color="#4ade80" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Notificaciones Push (ntfy.sh)</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Recibes notificaciones en tu celular al instante</div>
                  </div>
                </div>
                <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 10, padding: "11px 13px", marginBottom: 14, fontSize: 12, color: "#4ade80", lineHeight: 1.7 }}>
                  ✅ <strong>Notificaciones activas</strong><br />
                  Topic: <code style={{ background: "#0a3a1a", borderRadius: 4, padding: "1px 6px" }}>{NTFY_TOPIC}</code><br />
                  App: <strong>ntfy</strong> instalada en tu celular<br />
                  Suscrito al topic: <strong>{NTFY_TOPIC}</strong>
                </div>
                <Btn variant="success" onClick={async () => {
                  await pushNotify("🧪 Prueba StreamVault", "Las notificaciones funcionan correctamente ✅");
                  toast("Notificación de prueba enviada");
                }}><Bell size={13} /> Enviar notificación de prueba</Btn>
              </div>

              <div style={{ background: "#0f0f1a", border: "1px solid #ffffff0e", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Key size={18} color="#c4b5fd" />
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Cambiar contraseña del panel</div>
                </div>
                <Input label="Contraseña actual" type="password" placeholder="••••••••" value={newPass.current} onChange={e => setNewPass(p => ({ ...p, current: e.target.value }))} />
                <Input label="Nueva contraseña" type="password" placeholder="Mínimo 6 caracteres" value={newPass.next} onChange={e => setNewPass(p => ({ ...p, next: e.target.value }))} />
                <Input label="Confirmar" type="password" placeholder="Repite la contraseña" value={newPass.confirm} onChange={e => setNewPass(p => ({ ...p, confirm: e.target.value }))} />
                <Btn onClick={changePass}><Key size={13} /> Actualizar contraseña</Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ MODAL: VER PLATAFORMA ═══════════ */}
      {modal === "view" && selPlatform && (
        <Modal title={selPlatform.name} sub={selPlatform.desc} onClose={() => setModal(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <PlatformIcon id={selPlatform.id} size={60} />
          </div>
          {(() => {
            const avail = (accounts[selPlatform.id] || []).filter(a => a.status === "disponible");
            return avail.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Disponibles</div>
                {avail.map(acc => (
                  <div key={acc.id} style={{ background: "#08080f", border: "1px solid #1DB95433", borderRadius: 10, padding: "10px 13px", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1DB954" }} />
                    <span style={{ fontSize: 13, color: "#d1fae5", flex: 1 }}>Cuenta disponible</span>
                    {acc.profile && <Badge color="green">{acc.profile}</Badge>}
                    {acc.expiresAt && <span style={{ fontSize: 11, color: "#6b7280" }}>{fmt(acc.expiresAt)}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#1a0000", border: "1px solid #7f1d1d33", borderRadius: 10, padding: 13, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#fca5a5" }}>Sin stock disponible</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Solicita y te notificamos cuando haya</div>
              </div>
            );
          })()}
          <div style={{ background: "#0c1a3a", border: "1px solid #1e3a8a", borderRadius: 11, padding: "11px 13px", marginBottom: 16, fontSize: 13, color: "#93c5fd", lineHeight: 1.65 }}>
            Al solicitar, el administrador recibirá una notificación y te enviará una <strong>key de activación</strong> que puedes usar directamente aquí en la web.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setModal("request")} style={{ flex: 1, justifyContent: "center" }}>
              <Send size={14} /> Solicitar Acceso
            </Btn>
            <Btn variant="success" onClick={() => { setModal(null); setKeyModal(true); setKeyResult(null); setKeyInput(""); }} style={{ flex: 1, justifyContent: "center" }}>
              <Key size={14} /> Tengo una key
            </Btn>
          </div>
        </Modal>
      )}

      {/* ═══════════ MODAL: SOLICITAR ═══════════ */}
      {modal === "request" && selPlatform && (
        <Modal title={`Solicitar ${selPlatform.name}`} sub="Tu nombre para identificar la solicitud" onClose={() => setModal(null)} width={400}>
          <Input label="Tu nombre o usuario" placeholder="Ej: Juan Pérez" value={reqName} onChange={e => setReqName(e.target.value)} />
          <div style={{ background: "#0c1a3a", borderRadius: 10, padding: "10px 13px", marginBottom: 16, fontSize: 13, color: "#93c5fd" }}>
            📲 El administrador recibirá tu solicitud y te enviará una key de acceso.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setModal("view")} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn onClick={requestAccess} style={{ flex: 2, justifyContent: "center" }}><Send size={13} /> Enviar Solicitud</Btn>
          </div>
        </Modal>
      )}

      {/* ═══════════ MODAL: AGREGAR CUENTA ═══════════ */}
      {modal === "addAccount" && isAdmin && (
        <Modal title="Agregar Cuenta" sub="Nueva cuenta de streaming" onClose={() => setModal(null)}>
          <Select label="Plataforma *" value={newAcc.platform} onChange={e => setNewAcc(a => ({ ...a, platform: e.target.value }))}>
            <option value="">Seleccionar plataforma</option>
            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Email / Usuario *" type="text" placeholder="correo@ejemplo.com" value={newAcc.email} onChange={e => setNewAcc(a => ({ ...a, email: e.target.value }))} />
          <Input label="Contraseña *" type="text" placeholder="Contraseña de la cuenta" value={newAcc.password} onChange={e => setNewAcc(a => ({ ...a, password: e.target.value }))} />
          <Input label="Perfil (opcional)" placeholder="Perfil 1, Familiar…" value={newAcc.profile} onChange={e => setNewAcc(a => ({ ...a, profile: e.target.value }))} />
          <Input label="Fecha de vencimiento" type="date" value={newAcc.expiresAt} onChange={e => setNewAcc(a => ({ ...a, expiresAt: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn onClick={addAccount} style={{ flex: 2, justifyContent: "center" }}><Plus size={13} /> Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* ═══════════ MODAL: ASIGNAR ═══════════ */}
      {assignModal && (
        <Modal title="Asignar cuenta a cliente" sub="Registra quién recibe esta cuenta" onClose={() => setAssignModal(null)} width={360}>
          <Input label="Nombre del cliente" placeholder="Ej: María García" value={assignName} onChange={e => setAssignName(e.target.value)} />
          <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 10, padding: "10px 13px", marginBottom: 16, fontSize: 12, color: "#4ade80" }}>
            ✅ La cuenta se marcará como "ocupada".
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setAssignModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn onClick={assignAccount} style={{ flex: 2, justifyContent: "center" }}><UserCheck size={13} /> Asignar</Btn>
          </div>
        </Modal>
      )}

      {/* ═══════════ MODAL: ACTIVAR KEY ═══════════ */}
      {keyModal && (
        <Modal title="Activar Key de Acceso" sub="Ingresa tu key para desbloquear tu plataforma" onClose={() => setKeyModal(false)} width={420}>
          <div style={{ marginBottom: 16 }}>
            <Input
              label="Tu Key de activación"
              placeholder="Ej: SV-NETF-A1B2C3"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value.toUpperCase())}
              style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: 2 }}
            />
            <Btn onClick={activarKey} style={{ width: "100%", justifyContent: "center" }} disabled={keyLoading}>
              {keyLoading ? "Verificando..." : <><Key size={14} /> Verificar Key</>}
            </Btn>
          </div>
          {keyResult && (
            keyResult.valida ? (
              <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#4ade80", marginBottom: 6 }}>¡Acceso activado!</div>
                <div style={{ fontSize: 13, color: "#86efac" }}>📺 Plataforma: <b>{PLATFORMS.find(p => p.id === keyResult.plataforma)?.name}</b></div>
                <div style={{ fontSize: 13, color: "#86efac", marginTop: 4 }}>⏱ Duración: <b>{keyResult.duracion}</b></div>
                {keyResult.expiraEn && (
                  <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4 }}>Expira: {new Date(keyResult.expiraEn).toLocaleString("es-PE")}</div>
                )}
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>
                  El admin te enviará las credenciales por Telegram en breve.
                </div>
              </div>
            ) : (
              <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f87171" }}>Key inválida</div>
                <div style={{ fontSize: 13, color: "#fca5a5", marginTop: 6 }}>{keyResult.error}</div>
              </div>
            )
          )}
        </Modal>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #ffffff08", padding: "20px 16px", textAlign: "center", color: "#374151", fontSize: 12, marginTop: 40 }}>
        StreamVault · Admin: <a href={TELEGRAM_BOT} target="_blank" style={{ color: "#60a5fa", textDecoration: "none" }}>@Jagerchk_bot</a>
      </footer>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing:border-box }
        input::placeholder, textarea::placeholder { color:#4b5563 }
        select option { background:#0f0f1a }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:#080810 }
        ::-webkit-scrollbar-thumb { background:#ffffff1a; border-radius:3px }
        @media (max-width: 480px) {
          nav { padding: 10px 12px !important; }
        }
      `}</style>
    </div>
  );
}