import { useState, useEffect } from "react";
import {
  Shield, Plus, LogOut, Send, Check, X, Eye, EyeOff, ChevronRight,
  Package, Bell, Trash2, Copy, ExternalLink, Search, Edit2, Save,
  Users, Calendar, Settings, Key, Bot, Clock, AlertTriangle, History,
  ChevronDown, UserCheck, RefreshCw, ToggleLeft, ToggleRight
} from "lucide-react";

const TELEGRAM_LINK = "https://t.me/alex_eren";

const PLATFORMS = [
  { id: "netflix",    name: "Netflix",           icon: "N",   color: "#E50914", desc: "Series, películas y documentales" },
  { id: "disney",     name: "Disney+",            icon: "D+",  color: "#006E99", desc: "Disney, Marvel, Star Wars, Pixar" },
  { id: "max",        name: "Max",                icon: "MAX", color: "#3B5BDB", desc: "HBO, series premium y más" },
  { id: "prime",      name: "Prime Video",        icon: "▶",   color: "#00A8E1", desc: "Amazon Prime Video originals" },
  { id: "spotify",    name: "Spotify",            icon: "♫",   color: "#1DB954", desc: "Música y podcasts sin anuncios" },
  { id: "appletv",    name: "Apple TV+",          icon: "tv",  color: "#888888", desc: "Originales exclusivos de Apple" },
  { id: "paramount",  name: "Paramount+",         icon: "P+",  color: "#0064FF", desc: "CBS, MTV, Nickelodeon y más" },
  { id: "crunchyroll",name: "Crunchyroll",        icon: "CR",  color: "#F47521", desc: "Anime en español e inglés" },
  { id: "youtube",    name: "YouTube Premium",    icon: "YT",  color: "#FF0000", desc: "Sin anuncios + YouTube Music" },
  { id: "star",       name: "Star+",              icon: "★+",  color: "#A52FAB", desc: "Fox, ESPN, National Geographic" },
  { id: "mubi",       name: "MUBI",               icon: "M",   color: "#37B6FF", desc: "Cine de autor y festivales" },
  { id: "hulu",       name: "Hulu",               icon: "H",   color: "#1CE783", desc: "Series, películas y TV en vivo" },
];

const DEMO_ACCOUNTS = {
  netflix: [{ id: 1, email: "demo@netflix.com", password: "demo123", profile: "Perfil 1", status: "disponible", expiresAt: "2025-08-01", assignedTo: null }],
  spotify: [{ id: 2, email: "demo@spotify.com", password: "music456", profile: "Familiar",  status: "disponible", expiresAt: "2025-07-15", assignedTo: null }],
};

// ── helpers ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

async function sendTelegramMsg(token, chatId, text) {
  if (!token || !chatId) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return r.ok;
  } catch { return false; }
}

// ── sub-components ────────────────────────────────────────────────────────────
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
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />}
      {children}
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: 0.3 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", background: "#080812", border: "1px solid #ffffff18",
        borderRadius: 10, padding: "10px 13px", color: "#f0f0f5",
        fontSize: 14, outline: "none", boxSizing: "border-box",
        transition: "border 0.15s",
        ...(props.style || {}),
      }} onFocus={e => e.target.style.border = "1px solid #6366f166"}
         onBlur={e => e.target.style.border = "1px solid #ffffff18"}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>}
      <select {...props} style={{
        width: "100%", background: "#080812", border: "1px solid #ffffff18",
        borderRadius: 10, padding: "10px 13px", color: "#f0f0f5",
        fontSize: 14, outline: "none", boxSizing: "border-box",
      }}>
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
  };
  const v = variants[variant] || variants.primary;
  return (
    <button {...props} style={{
      ...v, borderRadius: 10, padding: small ? "6px 12px" : "10px 18px",
      fontWeight: 600, fontSize: small ? 12 : 14, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "opacity 0.15s",
      ...(props.style || {}),
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Modal({ title, sub, onClose, children, width = 460 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#0f0f1a", border: "1px solid #ffffff15", borderRadius: 22,
        padding: 30, width: "100%", maxWidth: width, boxShadow: "0 32px 80px #000000aa",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{title}</h2>
            {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{sub}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 2 }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────
export default function StreamVault() {
  const [accounts,    setAccounts]    = useState(DEMO_ACCOUNTS);
  const [requests,    setRequests]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [settings,    setSettings]    = useState({ botToken: "", chatId: "", adminPass: "admin2024" });
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [view,        setView]        = useState("home");   // home | login | admin
  const [adminTab,    setAdminTab]    = useState("accounts"); // accounts | requests | clients | settings
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
  const [newAcc,      setNewAcc]      = useState({ email:"", password:"", profile:"", platform:"", expiresAt:"" });
  const [editingAcc,  setEditingAcc]  = useState(null); // { platform, id, field, value }
  const [newPass,     setNewPass]     = useState({ current:"", next:"", confirm:"" });
  const [showPasses,  setShowPasses]  = useState({});
  const [assignModal, setAssignModal] = useState(null); // { platform, accId }
  const [assignName,  setAssignName]  = useState("");

  // ── storage ──
  useEffect(() => {
    (async () => {
      try {
        const keys = ["accounts","requests","clients","settings"];
        const setters = [setAccounts, setRequests, setClients, setSettings];
        for (let i = 0; i < keys.length; i++) {
          const r = await window.storage.get(keys[i]);
          if (r) setters[i](JSON.parse(r.value));
        }
      } catch {}
    })();
  }, []);

  async function persist(key, data) {
    try { await window.storage.set(key, JSON.stringify(data)); } catch {}
  }
  function saveAccounts(d) { setAccounts(d); persist("accounts", d); }
  function saveRequests(d) { setRequests(d); persist("requests", d); }
  function saveClients(d)  { setClients(d);  persist("clients",  d); }
  function saveSettings(d) { setSettings(d); persist("settings", d); }

  // ── notify ──
  function toast(msg, type="success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  }

  // ── Telegram ──
  async function tgNotify(text) {
    const ok = await sendTelegramMsg(settings.botToken, settings.chatId, text);
    if (!ok && (settings.botToken || settings.chatId)) toast("Telegram: revisa el token/chatId en Configuración","warn");
  }

  // ── admin login ──
  function doLogin() {
    if (loginPass === settings.adminPass) {
      setIsAdmin(true); setView("admin"); setLoginPass(""); setPassErr(false);
    } else {
      setPassErr(true); setTimeout(() => setPassErr(false), 1400);
    }
  }

  // ── change admin pass ──
  function changePass() {
    if (newPass.current !== settings.adminPass) { toast("Contraseña actual incorrecta","error"); return; }
    if (newPass.next.length < 6) { toast("Mínimo 6 caracteres","error"); return; }
    if (newPass.next !== newPass.confirm) { toast("Las contraseñas no coinciden","error"); return; }
    const d = { ...settings, adminPass: newPass.next };
    saveSettings(d); setNewPass({ current:"", next:"", confirm:"" });
    toast("Contraseña actualizada");
  }

  // ── add account ──
  function addAccount() {
    if (!newAcc.email || !newAcc.password || !newAcc.platform) { toast("Completa los campos requeridos","error"); return; }
    const updated = { ...accounts };
    if (!updated[newAcc.platform]) updated[newAcc.platform] = [];
    updated[newAcc.platform] = [...updated[newAcc.platform], { ...newAcc, id: Date.now(), status: "disponible", assignedTo: null }];
    saveAccounts(updated); setNewAcc({ email:"", password:"", profile:"", platform:"", expiresAt:"" });
    setModal(null); toast("Cuenta agregada");
  }

  // ── inline edit ──
  function startEdit(platform, id, field, value) { setEditingAcc({ platform, id, field, value }); }
  function saveEdit() {
    if (!editingAcc) return;
    const { platform, id, field, value } = editingAcc;
    const updated = { ...accounts };
    updated[platform] = updated[platform].map(a => a.id === id ? { ...a, [field]: value } : a);
    saveAccounts(updated); setEditingAcc(null); toast("Campo actualizado");
  }

  // ── toggle status ──
  function toggleStatus(platform, id) {
    const updated = { ...accounts };
    updated[platform] = updated[platform].map(a =>
      a.id === id ? { ...a, status: a.status === "disponible" ? "ocupado" : "disponible" } : a
    );
    saveAccounts(updated);
  }

  // ── assign account to client ──
  function assignAccount() {
    if (!assignName.trim() || !assignModal) return;
    const { platform, accId } = assignModal;
    const updated = { ...accounts };
    const acc = updated[platform].find(a => a.id === accId);
    if (!acc) return;
    updated[platform] = updated[platform].map(a =>
      a.id === accId ? { ...a, status: "ocupado", assignedTo: assignName.trim() } : a
    );
    saveAccounts(updated);
    const entry = {
      id: Date.now(), clientName: assignName.trim(),
      platform, accountEmail: acc.email,
      date: new Date().toLocaleDateString("es-PE"),
      action: "asignada",
    };
    saveClients([entry, ...clients]);
    tgNotify(`✅ <b>Cuenta asignada</b>\nCliente: ${assignName}\nPlataforma: ${PLATFORMS.find(p=>p.id===platform)?.name}\nEmail: ${acc.email}`);
    setAssignModal(null); setAssignName(""); toast(`Cuenta asignada a ${assignName}`);
  }

  // ── delete account ──
  function deleteAccount(platform, id) {
    const updated = { ...accounts };
    updated[platform] = updated[platform].filter(a => a.id !== id);
    saveAccounts(updated); toast("Cuenta eliminada");
  }

  // ── request access ──
  async function requestAccess() {
    if (!reqName.trim() || !selPlatform) return;
    const req = {
      id: Date.now(), platform: selPlatform.id, name: reqName.trim(),
      date: new Date().toLocaleDateString("es-PE"), status: "pendiente",
    };
    saveRequests([req, ...requests]);
    await tgNotify(`📨 <b>Nueva solicitud de acceso</b>\nUsuario: ${reqName}\nPlataforma: ${selPlatform.name}\nFecha: ${req.date}\n\nResponde en: @alex_eren`);
    window.open(`https://t.me/Jagerchk_bot?start=solicitar_${selPlatform.id}`);
    setModal(null); setReqName(""); toast("Solicitud enviada. Redirigiendo a Telegram…");
  }

  function deleteRequest(id) { saveRequests(requests.filter(r => r.id !== id)); }
  function deleteClient(id)  { saveClients(clients.filter(c => c.id !== id)); }

  function copyText(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 2000);
    });
  }

  // ── derived ──
  const allAccounts  = Object.values(accounts).flat();
  const totalAcc     = allAccounts.length;
  const availableAcc = allAccounts.filter(a => a.status === "disponible").length;
  const expiringAcc  = allAccounts.filter(a => { const d = daysUntil(a.expiresAt); return d !== null && d <= 7 && d >= 0; }).length;
  const filteredPlatforms = PLATFORMS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // ── platform color map ──
  const pColor = Object.fromEntries(PLATFORMS.map(p => [p.id, p.color]));

  // ─────────────────────────────── RENDER ──────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#f0f0f5", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Toast */}
      {notif && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          background: notif.type==="error" ? "#450a0a" : notif.type==="warn" ? "#1a0f00" : "#052e16",
          border:`1px solid ${notif.type==="error"?"#7f1d1d":notif.type==="warn"?"#78350f":"#166534"}`,
          color: notif.type==="error" ? "#f87171" : notif.type==="warn" ? "#fbbf24" : "#4ade80",
          borderRadius:12, padding:"12px 20px", fontSize:14, fontWeight:500,
          display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 32px #00000066",
          animation:"slideIn 0.25s ease",
        }}>
          {notif.type==="error"?<X size={15}/>:notif.type==="warn"?<AlertTriangle size={15}/>:<Check size={15}/>}
          {notif.msg}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 28px", borderBottom:"1px solid #ffffff0e",
        background:"#09091488", backdropFilter:"blur(20px)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => { setView("home"); setAdminTab("accounts"); }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Package size={17} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:-0.5 }}>StreamVault</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {expiringAcc > 0 && isAdmin && (
            <div style={{ background:"#1a0f00", border:"1px solid #78350f", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#fbbf24", display:"flex", alignItems:"center", gap:5 }}>
              <AlertTriangle size={12}/> {expiringAcc} vencen pronto
            </div>
          )}
          {isAdmin ? (
            <>
              {["accounts","requests","clients","settings"].map(t => (
                <button key={t} onClick={() => { setView("admin"); setAdminTab(t); }} style={{
                  background: adminTab===t && view==="admin" ? "#1e1e2e" : "transparent",
                  border:"1px solid #ffffff18", borderRadius:9, color:"#c4b5fd",
                  padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:600,
                }}>
                  {t==="accounts"?"Cuentas":t==="requests"?"Solicitudes":t==="clients"?"Clientes":"Config"}
                </button>
              ))}
              <button onClick={() => { setIsAdmin(false); setView("home"); }} style={{
                background:"transparent", border:"1px solid #ffffff18", borderRadius:9,
                color:"#6b7280", padding:"7px 14px", cursor:"pointer", fontSize:12,
                display:"flex", alignItems:"center", gap:5,
              }}>
                <LogOut size={12}/> Salir
              </button>
            </>
          ) : (
            <Btn onClick={() => setView("login")}><Shield size={13}/> Admin</Btn>
          )}
        </div>
      </nav>

      {/* ═══════════ HOME ═══════════ */}
      {view==="home" && (
        <div style={{ maxWidth: "100%", margin:"0", padding:"40px 24px" }}>
          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ display:"inline-block", background:"#1e1e2e", border:"1px solid #6366f133", borderRadius:999, padding:"5px 14px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1.2, textTransform:"uppercase", marginBottom:18 }}>
              ✦ Streaming Accounts Vault
            </div>
            <h1 style={{ fontSize:50, fontWeight:800, margin:"0 0 14px", lineHeight:1.08, letterSpacing:-2 }}>
              Todas tus plataformas<br/>
              <span style={{ background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>en un solo lugar</span>
            </h1>
            <p style={{ color:"#9ca3af", fontSize:16, maxWidth:460, margin:"0 auto 30px" }}>
              Accede a cuentas premium de streaming. Solicita acceso al administrador directamente por Telegram.
            </p>
            {/* Stats */}
            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:36 }}>
              {[
                { label:"Plataformas",    value:PLATFORMS.length,  icon:"🎬" },
                { label:"Cuentas totales",value:totalAcc,          icon:"💳" },
                { label:"Disponibles",    value:availableAcc,      icon:"✅" },
                { label:"Solicitudes",    value:requests.length,   icon:"📨" },
              ].map(s => (
                <div key={s.label} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:14, padding:"14px 22px", minWidth:110 }}>
                  <div style={{ fontSize:20 }}>{s.icon}</div>
                  <div style={{ fontSize:26, fontWeight:800 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ position:"relative", maxWidth:380, margin:"0 auto 28px" }}>
            <Search size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#6b7280" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar plataforma…"
              style={{ width:"100%", background:"#0f0f1a", border:"1px solid #ffffff12", borderRadius:11, padding:"11px 11px 11px 38px", color:"#f0f0f5", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
          </div>

          {/* Platform grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
            {filteredPlatforms.map(platform => {
              const pAccounts = accounts[platform.id] || [];
              const avail     = pAccounts.filter(a => a.status==="disponible").length;
              const expiring  = pAccounts.filter(a => { const d=daysUntil(a.expiresAt); return d!==null&&d<=7&&d>=0; }).length;
              return (
                <div key={platform.id} onClick={() => { setSelPlatform(platform); setModal("view"); }}
                  style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:18, padding:18, cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.18s ease" }}
                  onMouseEnter={e=>{ e.currentTarget.style.border=`1px solid ${platform.color}55`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${platform.color}22`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.border="1px solid #ffffff0e"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{ position:"absolute", top:-18, right:-18, width:70, height:70, borderRadius:"50%", background:platform.color, opacity:0.08 }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:14 }}>
                    <PlatformIcon id={platform.id} size={42}/>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{platform.name}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>{platform.desc}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Badge color={avail>0?"green":"red"} dot>{avail>0?`${avail} disponible${avail!==1?"s":""}`:"Sin stock"}</Badge>
                      {expiring>0 && <Badge color="amber"><AlertTriangle size={10}/> {expiring} vence</Badge>}
                    </div>
                    <ChevronRight size={15} color="#6b7280"/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ LOGIN ═══════════ */}
      {view==="login" && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 70px)", padding:24 }}>
          <div style={{ background:"#0f0f1a", border:"1px solid #ffffff12", borderRadius:22, padding:38, width:"100%", maxWidth:370, boxShadow:"0 32px 80px #00000088" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ width:58, height:58, borderRadius:15, margin:"0 auto 14px", background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Shield size={26} color="#fff"/>
              </div>
              <h2 style={{ fontSize:21, fontWeight:800, margin:"0 0 5px" }}>Panel Administrativo</h2>
              <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Ingresa tu contraseña para continuar</p>
            </div>
            <Input label="Contraseña" type={showLP?"text":"password"} value={loginPass}
              onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}
              placeholder="••••••••"
              style={{ border:passErr?"1px solid #7f1d1d":"1px solid #ffffff18", background:passErr?"#2d0000":"#080812" }}
            />
            {passErr && <p style={{ color:"#f87171", fontSize:12, margin:"-8px 0 12px" }}>Contraseña incorrecta</p>}
            <button onClick={()=>setShowLP(!showLP)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:12, marginBottom:14, padding:0 }}>
              {showLP?"Ocultar":"Mostrar"} contraseña
            </button>
            <Btn onClick={doLogin} style={{ width:"100%", justifyContent:"center", padding:"12px 0", fontSize:15 }}>Ingresar</Btn>
            <button onClick={()=>setView("home")} style={{ width:"100%", background:"none", border:"none", color:"#6b7280", fontSize:13, marginTop:12, cursor:"pointer" }}>← Volver al inicio</button>
          </div>
        </div>
      )}

      {/* ═══════════ ADMIN ═══════════ */}
      {view==="admin" && isAdmin && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px" }}>

          {/* ── TAB: ACCOUNTS ── */}
          {adminTab==="accounts" && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
                <div>
                  <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 3px" }}>Cuentas de Streaming</h2>
                  <p style={{ color:"#6b7280", margin:0, fontSize:13 }}>Administra y edita cuentas en tiempo real</p>
                </div>
                <Btn onClick={()=>{ setNewAcc({email:"",password:"",profile:"",platform:"",expiresAt:""}); setModal("addAccount"); }}>
                  <Plus size={15}/> Agregar Cuenta
                </Btn>
              </div>

              {/* Stat pills */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:28 }}>
                {[
                  { label:"Total", value:totalAcc, color:"#6366f1" },
                  { label:"Disponibles", value:availableAcc, color:"#1DB954" },
                  { label:"Ocupadas", value:totalAcc-availableAcc, color:"#f59e0b" },
                  { label:"Vencen pronto", value:expiringAcc, color:"#f87171" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:13, padding:"14px 16px" }}>
                    <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {PLATFORMS.map(platform => {
                const pAccs = accounts[platform.id] || [];
                if (!pAccs.length) return null;
                return (
                  <div key={platform.id} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, padding:20, marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                      <PlatformIcon id={platform.id} size={34}/>
                      <span style={{ fontWeight:700, fontSize:15 }}>{platform.name}</span>
                      <Badge color={pAccs.filter(a=>a.status==="disponible").length>0?"green":"red"} dot>
                        {pAccs.filter(a=>a.status==="disponible").length} disponibles
                      </Badge>
                    </div>
                    {pAccs.map(acc => {
                      const days = daysUntil(acc.expiresAt);
                      const expWarn = days !== null && days <= 7;
                      const isEditing = editingAcc && editingAcc.platform===platform.id && editingAcc.id===acc.id;
                      return (
                        <div key={acc.id} style={{
                          background:"#08080f", border:`1px solid ${expWarn?"#78350f44":"#ffffff08"}`,
                          borderRadius:11, padding:"13px 15px", marginBottom:8,
                        }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                            {/* status dot */}
                            <div style={{ width:8, height:8, borderRadius:"50%", background:acc.status==="disponible"?"#1DB954":"#f59e0b", flexShrink:0 }}/>

                            {/* email editable */}
                            {isEditing && editingAcc.field==="email" ? (
                              <input autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))}
                                onBlur={saveEdit} onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                                style={{ flex:1, minWidth:160, background:"#1a1a2e", border:"1px solid #6366f1", borderRadius:7, padding:"4px 8px", color:"#f0f0f5", fontSize:13 }}/>
                            ) : (
                              <span onClick={()=>startEdit(platform.id,acc.id,"email",acc.email)}
                                style={{ flex:1, minWidth:140, fontSize:13, fontWeight:600, cursor:"text", color:"#f0f0f5" }}
                                title="Clic para editar">{acc.email}</span>
                            )}

                            {/* password */}
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              {isEditing && editingAcc.field==="password" ? (
                                <input autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))}
                                  onBlur={saveEdit} onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                                  style={{ width:130, background:"#1a1a2e", border:"1px solid #6366f1", borderRadius:7, padding:"4px 8px", color:"#f0f0f5", fontSize:13 }}/>
                              ) : (
                                <span onClick={()=>startEdit(platform.id,acc.id,"password",acc.password)}
                                  style={{ background:"#1a1a2e", border:"1px solid #ffffff0a", borderRadius:7, padding:"3px 10px", fontSize:12, color:"#9ca3af", fontFamily:"monospace", cursor:"text" }}
                                  title="Clic para editar">
                                  {showPasses[acc.id] ? acc.password : "••••••••"}
                                </span>
                              )}
                              <button onClick={()=>setShowPasses(p=>({...p,[acc.id]:!p[acc.id]}))} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", padding:3 }}>
                                {showPasses[acc.id]?<EyeOff size={13}/>:<Eye size={13}/>}
                              </button>
                              <button onClick={()=>copyText(`${acc.email} | ${acc.password}`, acc.id)} style={{ background:"none", border:"none", cursor:"pointer", color:copied===acc.id?"#1DB954":"#6b7280", padding:3 }}>
                                {copied===acc.id?<Check size={13}/>:<Copy size={13}/>}
                              </button>
                            </div>

                            {/* profile editable */}
                            {isEditing && editingAcc.field==="profile" ? (
                              <input autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))}
                                onBlur={saveEdit} onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                                style={{ width:100, background:"#1a1a2e", border:"1px solid #6366f1", borderRadius:7, padding:"4px 8px", color:"#f0f0f5", fontSize:12 }}/>
                            ) : (
                              <span onClick={()=>startEdit(platform.id,acc.id,"profile",acc.profile||"")}
                                style={{ fontSize:11, color:"#6b7280", cursor:"text" }} title="Clic para editar">
                                {acc.profile||"Sin perfil"}
                              </span>
                            )}

                            {/* expiry */}
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              {isEditing && editingAcc.field==="expiresAt" ? (
                                <input type="date" autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))}
                                  onBlur={saveEdit}
                                  style={{ background:"#1a1a2e", border:"1px solid #6366f1", borderRadius:7, padding:"4px 8px", color:"#f0f0f5", fontSize:12 }}/>
                              ) : (
                                <span onClick={()=>startEdit(platform.id,acc.id,"expiresAt",acc.expiresAt||"")}
                                  style={{ fontSize:11, color: expWarn?"#fbbf24":"#6b7280", cursor:"text", display:"flex", alignItems:"center", gap:3 }}
                                  title="Clic para editar">
                                  <Calendar size={11}/> {acc.expiresAt ? fmt(acc.expiresAt) : "Sin fecha"}
                                  {expWarn && <AlertTriangle size={11} color="#fbbf24"/>}
                                </span>
                              )}
                            </div>

                            {/* assigned to */}
                            {acc.assignedTo && <Badge color="blue"><UserCheck size={10}/> {acc.assignedTo}</Badge>}

                            {/* actions */}
                            <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
                              <Btn small variant="ghost" onClick={()=>{ setAssignModal({ platform:platform.id, accId:acc.id }); setAssignName(""); }}>
                                <UserCheck size={12}/> Asignar
                              </Btn>
                              <Btn small variant={acc.status==="disponible"?"ghost":"success"} onClick={()=>toggleStatus(platform.id,acc.id)}>
                                {acc.status==="disponible"?<ToggleRight size={12}/>:<ToggleLeft size={12}/>}
                                {acc.status==="disponible"?"Ocupar":"Liberar"}
                              </Btn>
                              <Btn small variant="danger" onClick={()=>deleteAccount(platform.id,acc.id)}><Trash2 size={12}/></Btn>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {!PLATFORMS.some(p => (accounts[p.id]||[]).length>0) && (
                <div style={{ textAlign:"center", color:"#4b5563", padding:"60px 0" }}>
                  Aún no hay cuentas. Usa el botón "Agregar Cuenta" para comenzar.
                </div>
              )}
            </>
          )}

          {/* ── TAB: REQUESTS ── */}
          {adminTab==="requests" && (
            <>
              <div style={{ marginBottom:26 }}>
                <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 3px" }}>Solicitudes de Acceso</h2>
                <p style={{ color:"#6b7280", margin:0, fontSize:13 }}>{requests.length} solicitudes registradas</p>
              </div>
              {requests.length===0 ? (
                <div style={{ textAlign:"center", color:"#4b5563", padding:"60px 0" }}>Sin solicitudes pendientes</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {requests.map(req => {
                    const plat = PLATFORMS.find(p=>p.id===req.platform);
                    return (
                      <div key={req.id} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        {plat && <PlatformIcon id={plat.id} size={34}/>}
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{req.name}</div>
                          <div style={{ fontSize:12, color:"#6b7280" }}>{plat?.name} · {req.date}</div>
                        </div>
                        <Badge color="blue" dot>pendiente</Badge>
                        <Btn variant="tg" small onClick={()=>window.open(TELEGRAM_LINK,"_blank")}>
                          <Send size={12}/> Responder en Telegram
                        </Btn>
                        <Btn variant="danger" small onClick={()=>deleteRequest(req.id)}><Trash2 size={12}/></Btn>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── TAB: CLIENTS ── */}
          {adminTab==="clients" && (
            <>
              <div style={{ marginBottom:26 }}>
                <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 3px" }}>Historial de Clientes</h2>
                <p style={{ color:"#6b7280", margin:0, fontSize:13 }}>{clients.length} registros de acceso</p>
              </div>
              {clients.length===0 ? (
                <div style={{ textAlign:"center", color:"#4b5563", padding:"60px 0" }}>
                  Sin historial aún. Asigna cuentas desde la pestaña Cuentas.
                </div>
              ) : (
                <div style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #ffffff0a" }}>
                        {["Cliente","Plataforma","Email de cuenta","Fecha","Acción",""].map(h=>(
                          <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:"#6b7280", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((c,i)=>{
                        const plat = PLATFORMS.find(p=>p.id===c.platform);
                        return (
                          <tr key={c.id} style={{ borderBottom:i<clients.length-1?"1px solid #ffffff06":"none" }}>
                            <td style={{ padding:"12px 16px", fontWeight:600 }}>{c.clientName}</td>
                            <td style={{ padding:"12px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                <PlatformIcon id={c.platform} size={22}/> {plat?.name}
                              </div>
                            </td>
                            <td style={{ padding:"12px 16px", color:"#9ca3af", fontFamily:"monospace", fontSize:12 }}>{c.accountEmail}</td>
                            <td style={{ padding:"12px 16px", color:"#6b7280" }}>{c.date}</td>
                            <td style={{ padding:"12px 16px" }}><Badge color="green" dot>{c.action}</Badge></td>
                            <td style={{ padding:"12px 16px" }}>
                              <button onClick={()=>deleteClient(c.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280" }}><Trash2 size={13}/></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── TAB: SETTINGS ── */}
          {adminTab==="settings" && (
            <>
              <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 3px" }}>Configuración</h2>
              <p style={{ color:"#6b7280", margin:"0 0 30px", fontSize:13 }}>Bot de Telegram y seguridad del panel</p>

              {/* Telegram Bot */}
              <div style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, padding:24, marginBottom:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#0c1a3a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Bot size={18} color="#60a5fa"/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>Notificaciones por Telegram Bot</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>Recibe alertas cuando llegue una solicitud nueva</div>
                  </div>
                </div>
                <div style={{ background:"#0c1a3a", border:"1px solid #1e3a8a", borderRadius:10, padding:"12px 14px", marginBottom:18, fontSize:13, color:"#93c5fd", lineHeight:1.7 }}>
                  <strong>¿Cómo configurar?</strong><br/>
                  1. Abre Telegram y busca <strong>@BotFather</strong><br/>
                  2. Escribe <code style={{background:"#1e3a8a",borderRadius:4,padding:"1px 5px"}}>/newbot</code> y sigue los pasos<br/>
                  3. Copia el <strong>Token</strong> que te da BotFather<br/>
                  4. Envía un mensaje al bot, luego abre <code style={{background:"#1e3a8a",borderRadius:4,padding:"1px 5px"}}>https://api.telegram.org/bot[TOKEN]/getUpdates</code> para obtener tu <strong>Chat ID</strong>
                </div>
                <Input label="Bot Token" placeholder="123456789:ABCdef..." value={settings.botToken}
                  onChange={e=>setSettings(s=>({...s,botToken:e.target.value}))}/>
                <Input label="Chat ID (tu ID de Telegram)" placeholder="123456789" value={settings.chatId}
                  onChange={e=>setSettings(s=>({...s,chatId:e.target.value}))}/>
                <div style={{ display:"flex", gap:10 }}>
                  <Btn onClick={()=>saveSettings(settings)}>
                    <Save size={14}/> Guardar configuración
                  </Btn>
                  <Btn variant="ghost" onClick={async()=>{
                    const ok = await sendTelegramMsg(settings.botToken, settings.chatId, "✅ <b>StreamVault</b>: Notificaciones configuradas correctamente!");
                    toast(ok?"Mensaje de prueba enviado":"Error al enviar. Revisa token y chatId", ok?"success":"error");
                  }}>
                    <Send size={14}/> Enviar prueba
                  </Btn>
                </div>
              </div>

              {/* Change password */}
              <div style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#1a0a2e", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Key size={18} color="#c4b5fd"/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>Cambiar contraseña del panel</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>Actualiza la clave de acceso al panel admin</div>
                  </div>
                </div>
                <Input label="Contraseña actual" type="password" placeholder="••••••••" value={newPass.current}
                  onChange={e=>setNewPass(p=>({...p,current:e.target.value}))}/>
                <Input label="Nueva contraseña" type="password" placeholder="Mínimo 6 caracteres" value={newPass.next}
                  onChange={e=>setNewPass(p=>({...p,next:e.target.value}))}/>
                <Input label="Confirmar nueva contraseña" type="password" placeholder="Repite la contraseña" value={newPass.confirm}
                  onChange={e=>setNewPass(p=>({...p,confirm:e.target.value}))}/>
                <Btn onClick={changePass}><Key size={14}/> Actualizar contraseña</Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      {/* View platform */}
      {modal==="view" && selPlatform && (
        <Modal title={selPlatform.name} sub={selPlatform.desc} onClose={()=>setModal(null)}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <PlatformIcon id={selPlatform.id} size={64}/>
          </div>
          {(() => {
            const avail = (accounts[selPlatform.id]||[]).filter(a=>a.status==="disponible");
            return avail.length>0 ? (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:10 }}>Disponibles</div>
                {avail.map(acc=>(
                  <div key={acc.id} style={{ background:"#08080f", border:"1px solid #1DB95433", borderRadius:10, padding:"12px 14px", marginBottom:7, display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#1DB954" }}/>
                    <span style={{ fontSize:13, color:"#d1fae5", flex:1 }}>Cuenta disponible</span>
                    {acc.profile && <Badge color="green">{acc.profile}</Badge>}
                    {acc.expiresAt && <span style={{ fontSize:11, color:"#6b7280" }}><Calendar size={10}/> {fmt(acc.expiresAt)}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:"#1a0000", border:"1px solid #7f1d1d33", borderRadius:10, padding:14, marginBottom:18, textAlign:"center" }}>
                <div style={{ fontSize:13, color:"#fca5a5" }}>Sin stock disponible actualmente</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>Solicita y te notificamos cuando haya</div>
              </div>
            );
          })()}
          <div style={{ background:"#0c1a3a", border:"1px solid #1e3a8a", borderRadius:12, padding:"12px 14px", marginBottom:18, fontSize:13, color:"#93c5fd", lineHeight:1.65 }}>
            Al solicitar acceso serás redirigido a Telegram para contactar con el admin <strong>@alex_eren</strong>.
          </div>
          <Btn onClick={()=>setModal("request")} style={{ width:"100%", justifyContent:"center", padding:"12px 0" }}>
            <Send size={15}/> Solicitar Acceso
          </Btn>
        </Modal>
      )}

      {/* Request */}
      {modal==="request" && selPlatform && (
        <Modal title={`Solicitar ${selPlatform.name}`} sub="Tu nombre para identificar la solicitud" onClose={()=>setModal(null)} width={400}>
          <Input label="Tu nombre o usuario" placeholder="Ej: Juan Pérez" value={reqName} onChange={e=>setReqName(e.target.value)}/>
          <div style={{ background:"#0c1a3a", borderRadius:10, padding:"11px 14px", marginBottom:18, fontSize:13, color:"#93c5fd" }}>
            📲 Serás redirigido a <strong>@alex_eren</strong> en Telegram.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="ghost" onClick={()=>setModal("view")} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={requestAccess} style={{ flex:2, justifyContent:"center" }}><ExternalLink size={14}/> Ir a Telegram</Btn>
          </div>
        </Modal>
      )}

      {/* Add account */}
      {modal==="addAccount" && isAdmin && (
        <Modal title="Agregar Cuenta" sub="Nueva cuenta de streaming al vault" onClose={()=>setModal(null)}>
          <Select label="Plataforma *" value={newAcc.platform} onChange={e=>setNewAcc(a=>({...a,platform:e.target.value}))}>
            <option value="">Seleccionar plataforma</option>
            {PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Email / Usuario *" type="text" placeholder="correo@ejemplo.com" value={newAcc.email} onChange={e=>setNewAcc(a=>({...a,email:e.target.value}))}/>
          <Input label="Contraseña *" type="text" placeholder="Contraseña de la cuenta" value={newAcc.password} onChange={e=>setNewAcc(a=>({...a,password:e.target.value}))}/>
          <Input label="Perfil (opcional)" placeholder="Perfil 1, Familiar…" value={newAcc.profile} onChange={e=>setNewAcc(a=>({...a,profile:e.target.value}))}/>
          <Input label="Fecha de vencimiento" type="date" value={newAcc.expiresAt} onChange={e=>setNewAcc(a=>({...a,expiresAt:e.target.value}))}/>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={addAccount} style={{ flex:2, justifyContent:"center" }}><Plus size={14}/> Guardar Cuenta</Btn>
          </div>
        </Modal>
      )}

      {/* Assign account */}
      {assignModal && (
        <Modal title="Asignar cuenta a cliente" sub="Registra quién recibe esta cuenta" onClose={()=>setAssignModal(null)} width={380}>
          <Input label="Nombre del cliente" placeholder="Ej: María García" value={assignName} onChange={e=>setAssignName(e.target.value)}/>
          <div style={{ background:"#052e16", border:"1px solid #166534", borderRadius:10, padding:"11px 14px", marginBottom:18, fontSize:13, color:"#4ade80" }}>
            ✅ La cuenta se marcará como "ocupada" y quedará registrada en el historial de clientes.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="ghost" onClick={()=>setAssignModal(null)} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={assignAccount} style={{ flex:2, justifyContent:"center" }}><UserCheck size={14}/> Asignar</Btn>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #ffffff08", padding:"22px 28px", textAlign:"center", color:"#374151", fontSize:12, marginTop:40 }}>
        StreamVault · Admin: <a href={TELEGRAM_LINK} target="_blank" style={{ color:"#60a5fa", textDecoration:"none" }}>@alex_eren</a>
      </footer>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        * { box-sizing:border-box }
        input::placeholder, textarea::placeholder { color:#4b5563 }
        select option { background:#0f0f1a }
        ::-webkit-scrollbar { width:5px }
        ::-webkit-scrollbar-track { background:#080810 }
        ::-webkit-scrollbar-thumb { background:#ffffff1a; border-radius:3px }
        code { font-family: monospace }
      `}</style>
    </div>
  );
}