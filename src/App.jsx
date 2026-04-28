import { useState, useEffect, useRef } from "react";
import {
  Shield, Plus, LogOut, Send, Check, X, Eye, EyeOff, ChevronRight,
  Package, Bell, Trash2, Copy, Search, Calendar, Key, AlertTriangle,
  UserCheck, ToggleLeft, ToggleRight, Lock, Unlock, Clock, Users, RefreshCw,
  Star, Gift, FileText, Zap
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfJ3l3Yni7gBIZyE1B28OhEr08DHoQ0LI",
  authDomain: "streamvault-40c77.firebaseapp.com",
  projectId: "streamvault-40c77",
  storageBucket: "streamvault-40c77.firebasestorage.app",
  messagingSenderId: "766509929931",
  appId: "1:766509929931:web:56480d0987babb2ef6d24e"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const NTFY_TOPIC = "streamvault-axel-2026";
const ADMIN_TELEGRAM = "https://t.me/alex_eren";

async function pushNotify(title, message) {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: { "Title": title, "Priority": "high", "Tags": "bell", "Content-Type": "text/plain" },
      body: message,
    });
  } catch {}
}

const PLATFORMS = [
  { id: "netflix",     name: "Netflix",        icon: "N",   color: "#E50914", desc: "Series, películas y documentales", url: "https://www.netflix.com/login",          steps: ["Abre Netflix", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Selecciona tu perfil asignado"] },
  { id: "disney",      name: "Disney+",         icon: "D+",  color: "#006E99", desc: "Disney, Marvel, Star Wars, Pixar",  url: "https://www.disneyplus.com/login",       steps: ["Abre Disney+", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Selecciona tu perfil"] },
  { id: "max",         name: "Max",             icon: "MAX", color: "#3B5BDB", desc: "HBO, series premium y más",          url: "https://play.max.com/",                  steps: ["Abre Max", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Selecciona tu perfil asignado"] },
  { id: "prime",       name: "Prime Video",     icon: "▶",   color: "#00A8E1", desc: "Amazon Prime Video originals",       url: "https://www.primevideo.com/",            steps: ["Abre Prime Video", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Disfruta el contenido"] },
  { id: "spotify",     name: "Spotify",         icon: "♫",   color: "#1DB954", desc: "Música y podcasts sin anuncios",    url: "https://open.spotify.com/",             steps: ["Abre Spotify", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "No cambies la contraseña"] },
  { id: "appletv",     name: "Apple TV+",       icon: "tv",  color: "#888888", desc: "Originales exclusivos de Apple",    url: "https://tv.apple.com/",                 steps: ["Abre Apple TV+", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Disfruta el contenido"] },
  { id: "paramount",   name: "Paramount+",      icon: "P+",  color: "#0064FF", desc: "CBS, MTV, Nickelodeon y más",       url: "https://www.paramountplus.com/",         steps: ["Abre Paramount+", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Selecciona tu perfil"] },
  { id: "crunchyroll", name: "Crunchyroll",     icon: "CR",  color: "#F47521", desc: "Anime en español e inglés",         url: "https://www.crunchyroll.com/login",      steps: ["Abre Crunchyroll", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Disfruta el anime"] },
  { id: "youtube",     name: "YouTube Premium", icon: "YT",  color: "#FF0000", desc: "Sin anuncios + YouTube Music",      url: "https://www.youtube.com/",              steps: ["Abre YouTube", "Inicia sesión con el email", "Verifica que aparezca Premium", "No cambies ningún dato"] },
  { id: "star",        name: "Star+",           icon: "★+",  color: "#A52FAB", desc: "Fox, ESPN, National Geographic",    url: "https://www.starplus.com/",             steps: ["Abre Star+", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Selecciona tu perfil"] },
  { id: "mubi",        name: "MUBI",            icon: "M",   color: "#37B6FF", desc: "Cine de autor y festivales",        url: "https://mubi.com/",                     steps: ["Abre MUBI", "Clic en 'Iniciar sesión'", "Ingresa el email y contraseña", "Disfruta el cine de autor"] },
  { id: "hulu",        name: "Hulu",            icon: "H",   color: "#1CE783", desc: "Series, películas y TV en vivo",    url: "https://www.hulu.com/welcome",          steps: ["Abre Hulu", "Clic en 'Log In'", "Ingresa el email y contraseña", "Selecciona tu perfil"] },
];

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" }); }
function genKeyCode(plat) { return `SV-${plat.toUpperCase().slice(0,4)}-${Math.random().toString(36).substring(2,8).toUpperCase()}`; }
function timeLeft(exp) {
  if (!exp) return "Ilimitada";
  const diff = new Date(exp) - new Date();
  if (diff <= 0) return "Expirada";
  const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── UI ────────────────────────────────────────────────────

function PlatformIcon({ id, size=44 }) {
  const p = PLATFORMS.find(x=>x.id===id)||{};
  return <div style={{ width:size,height:size,borderRadius:12,flexShrink:0,background:p.color||"#333",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:size*0.28,color:"#fff",letterSpacing:-1,boxShadow:`0 0 18px ${p.color||"#333"}44` }}>{p.icon||"?"}</div>;
}

function Badge({ children, color="gray", dot }) {
  const C = { green:{bg:"#052e16",text:"#4ade80",border:"#166534"}, red:{bg:"#450a0a",text:"#f87171",border:"#7f1d1d"}, blue:{bg:"#0c1a3a",text:"#60a5fa",border:"#1e3a8a"}, amber:{bg:"#1a0f00",text:"#fbbf24",border:"#78350f"}, gray:{bg:"#1c1c1c",text:"#9ca3af",border:"#374151"}, purple:{bg:"#1a0a2e",text:"#c4b5fd",border:"#4c1d95"} };
  const c = C[color]||C.gray;
  return <span style={{ background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5 }}>{dot&&<span style={{ width:6,height:6,borderRadius:"50%",background:c.text }}/>}{children}</span>;
}

function Input({ label, ...props }) {
  return <div style={{ marginBottom:14 }}>{label&&<label style={{ fontSize:12,color:"#9ca3af",display:"block",marginBottom:6,fontWeight:600 }}>{label}</label>}<input {...props} style={{ width:"100%",background:"#080812",border:"1px solid #ffffff18",borderRadius:10,padding:"10px 13px",color:"#f0f0f5",fontSize:14,outline:"none",boxSizing:"border-box",...(props.style||{}) }} onFocus={e=>e.target.style.border="1px solid #6366f166"} onBlur={e=>e.target.style.border="1px solid #ffffff18"}/></div>;
}

function Select({ label, children, ...props }) {
  return <div style={{ marginBottom:14 }}>{label&&<label style={{ fontSize:12,color:"#9ca3af",display:"block",marginBottom:6,fontWeight:600 }}>{label}</label>}<select {...props} style={{ width:"100%",background:"#080812",border:"1px solid #ffffff18",borderRadius:10,padding:"10px 13px",color:"#f0f0f5",fontSize:14,outline:"none",boxSizing:"border-box" }}>{children}</select></div>;
}

function Btn({ children, variant="primary", small, ...props }) {
  const V = { primary:{background:"linear-gradient(135deg,#6366f1,#a855f7)",color:"#fff",border:"none"}, ghost:{background:"transparent",color:"#9ca3af",border:"1px solid #ffffff18"}, danger:{background:"#450a0a",color:"#f87171",border:"1px solid #7f1d1d"}, success:{background:"#052e16",color:"#4ade80",border:"1px solid #166534"}, amber:{background:"#1a0f00",color:"#fbbf24",border:"1px solid #78350f"} };
  const v = V[variant]||V.primary;
  return <button {...props} style={{ ...v,borderRadius:10,padding:small?"6px 12px":"10px 18px",fontWeight:600,fontSize:small?12:14,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,transition:"opacity 0.15s",...(props.style||{}) }} onMouseEnter={e=>e.currentTarget.style.opacity="0.82"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}

function Modal({ title, sub, onClose, children, width=460 }) {
  return <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}><div style={{ background:"#0f0f1a",border:"1px solid #ffffff15",borderRadius:22,padding:28,width:"100%",maxWidth:width,boxShadow:"0 32px 80px #000000aa",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}><div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22 }}><div><h2 style={{ margin:0,fontSize:19,fontWeight:800 }}>{title}</h2>{sub&&<p style={{ margin:"4px 0 0",fontSize:13,color:"#6b7280" }}>{sub}</p>}</div><button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:2 }}><X size={18}/></button></div>{children}</div></div>;
}

// ── MAIN ─────────────────────────────────────────────────

export default function StreamVault() {
  // Data
  const [accounts,    setAccounts]    = useState({});
  const [requests,    setRequests]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [keys,        setKeys]        = useState([]);
  const [granted,     setGranted]     = useState([]);
  const [users,       setUsers]       = useState([]); // clientes registrados
  const [settings,    setSettings]    = useState({ adminPass:"admin2024" });
  const [loading,     setLoading]     = useState(true);
  // Auth
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [clientUser,  setClientUser]  = useState(null); // cliente logueado
  const [view,        setView]        = useState("clientLogin"); // clientLogin | home | platform | adminLogin | admin
  const [adminTab,    setAdminTab]    = useState("accounts");
  // Session (key activa por plataforma)
  const [sessions,    setSessions]    = useState({}); // { plataforma: { cuenta, expiraEn, ... } }
  const [timers,      setTimers]      = useState({});
  const [activePlat,  setActivePlat]  = useState(null);
  // UI
  const [modal,       setModal]       = useState(null);
  const [selPlatform, setSelPlatform] = useState(null);
  const [notif,       setNotif]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [copied,      setCopied]      = useState(null);
  const [showPasses,  setShowPasses]  = useState({});
  // Forms - client login
  const [cEmail,      setCEmail]      = useState("");
  const [cPass,       setCPass]       = useState("");
  const [cShowPass,   setCShowPass]   = useState(false);
  const [cErr,        setCErr]        = useState("");
  // Forms - admin login
  const [aPass,       setAPass]       = useState("");
  const [aErr,        setAErr]        = useState(false);
  const [aShow,       setAShow]       = useState(false);
  // Forms - new user
  const [newUser,     setNewUser]     = useState({ email:"", password:"", nombre:"", plataformas:[] });
  const [newUserKeyPlat, setNewUserKeyPlat] = useState("netflix");
  const [newUserKeyDur,  setNewUserKeyDur]  = useState("30d");
  // Forms - accounts
  const [newAcc,      setNewAcc]      = useState({ email:"", password:"", profile:"", platform:"", expiresAt:"" });
  const [editingAcc,  setEditingAcc]  = useState(null);
  const [newPass,     setNewPass]     = useState({ current:"", next:"", confirm:"" });
  const [assignModal, setAssignModal] = useState(null);
  const [assignName,  setAssignName]  = useState("");
  // Forms - keys
  const [genKeyPlat,  setGenKeyPlat]  = useState("netflix");
  const [genKeyDur,   setGenKeyDur]   = useState("7d");
  const [genKeyResult,setGenKeyResult]= useState(null);
  // Key activation
  const [keyInput,    setKeyInput]    = useState("");
  const [keyError,    setKeyError]    = useState("");
  const [keyLoading,  setKeyLoading]  = useState(false);

  // ── Firebase ──
  useEffect(() => {
    const u = [];
    u.push(onSnapshot(collection(db,"accounts"), s=>{ const a={}; s.forEach(d=>{ a[d.id]=d.data().list||[]; }); setAccounts(a); }));
    u.push(onSnapshot(collection(db,"requests"), s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setRequests(r); }));
    u.push(onSnapshot(collection(db,"clients"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setClients(r); }));
    u.push(onSnapshot(collection(db,"keys"),     s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.creadaEn||0)-(a.creadaEn||0)); setKeys(r); }));
    u.push(onSnapshot(collection(db,"granted"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.otorgadaEn||0)-(a.otorgadaEn||0)); setGranted(r); }));
    u.push(onSnapshot(collection(db,"users"),    s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); setUsers(r); }));
    u.push(onSnapshot(doc(db,"config","settings"), s=>{ if(s.exists()) setSettings(s.data()); }));
    setLoading(false);
    return () => u.forEach(x=>x());
  }, []);

  // ── Restore client session ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sv_client");
      if (saved) { const u=JSON.parse(saved); setClientUser(u); setView("home"); }
      const savedSessions = localStorage.getItem("sv_sessions");
      if (savedSessions) setSessions(JSON.parse(savedSessions));
    } catch {}
  }, []);

  // ── Timer tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = {};
      let changed = false;
      Object.entries(sessions).forEach(([plat, sess]) => {
        if (sess.expiraEn && new Date(sess.expiraEn) < now) {
          changed = true; // expired, remove
        } else {
          updated[plat] = sess;
        }
      });
      if (changed) {
        setSessions(updated);
        localStorage.setItem("sv_sessions", JSON.stringify(updated));
        toast("⏰ Una sesión expiró","warn");
      }
      // Update timers display
      const t = {};
      Object.entries(updated).forEach(([plat, sess]) => { t[plat] = timeLeft(sess.expiraEn); });
      setTimers(t);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessions]);

  // ── Helpers ──
  async function fbSaveAccounts(u) { setAccounts(u); for (const [p,l] of Object.entries(u)) await setDoc(doc(db,"accounts",p),{list:l}); }
  async function fbSaveSettings(s) { setSettings(s); await setDoc(doc(db,"config","settings"),s); }
  function toast(msg, type="success") { setNotif({msg,type}); setTimeout(()=>setNotif(null),3200); }
  function copyText(text,k) { navigator.clipboard.writeText(text).then(()=>{ setCopied(k); setTimeout(()=>setCopied(null),2500); }); }

  // ── Client Login ──
  async function clientLogin() {
    setCErr("");
    if (!cEmail.trim()||!cPass.trim()) { setCErr("Completa todos los campos"); return; }
    const found = users.find(u => u.email.toLowerCase()===cEmail.toLowerCase().trim() && u.password===cPass.trim());
    if (!found) { setCErr("Email o contraseña incorrectos"); return; }
    if (found.activo===false) { setCErr("Tu cuenta está desactivada. Contacta al admin."); return; }
    setClientUser(found);
    localStorage.setItem("sv_client", JSON.stringify(found));
    // Update last login
    await updateDoc(doc(db,"users",found.id),{ ultimoLogin: new Date().toISOString() });
    setView("home"); setCEmail(""); setCPass("");
    toast(`¡Bienvenido, ${found.nombre}! 👋`);
  }

  function clientLogout() {
    setClientUser(null); setSessions({}); setTimers({});
    localStorage.removeItem("sv_client"); localStorage.removeItem("sv_sessions");
    setView("clientLogin"); toast("Sesión cerrada");
  }

  // ── Admin Login ──
  function adminLogin() {
    if (aPass===settings.adminPass) { setIsAdmin(true); setView("admin"); setAPass(""); setAErr(false); }
    else { setAErr(true); setTimeout(()=>setAErr(false),1400); }
  }
  function adminLogout() { setIsAdmin(false); setView("home"); }

  function changePass() {
    if (newPass.current!==settings.adminPass) { toast("Contraseña actual incorrecta","error"); return; }
    if (newPass.next.length<6) { toast("Mínimo 6 caracteres","error"); return; }
    if (newPass.next!==newPass.confirm) { toast("Las contraseñas no coinciden","error"); return; }
    fbSaveSettings({...settings,adminPass:newPass.next});
    setNewPass({current:"",next:"",confirm:""}); toast("Contraseña actualizada");
  }

  // ── Users (clientes) ──
  async function createUser() {
    if (!newUser.email||!newUser.password||!newUser.nombre) { toast("Completa todos los campos","error"); return; }
    if (users.find(u=>u.email.toLowerCase()===newUser.email.toLowerCase())) { toast("Ese email ya existe","error"); return; }
    const u = { id: `user_${Date.now()}`, email:newUser.email.trim(), password:newUser.password.trim(), nombre:newUser.nombre.trim(), activo:true, creadoEn:new Date().toISOString(), ultimoLogin:null, keys:[] };
    await setDoc(doc(db,"users",u.id), u);
    setNewUser({email:"",password:"",nombre:"",plataformas:[]});
    setModal(null); toast(`Usuario ${u.nombre} creado`);
  }

  async function toggleUserActive(uid, current) {
    await updateDoc(doc(db,"users",uid),{ activo:!current });
    toast(!current?"Usuario activado":"Usuario desactivado");
  }

  async function deleteUser(uid) {
    await deleteDoc(doc(db,"users",uid)); toast("Usuario eliminado");
  }

  // Generar key y asignarla al usuario
  async function generateKeyForUser(uid, plat, dur) {
    const codigo = genKeyCode(plat);
    let expiraEn=null, durTexto="Ilimitada";
    if (dur!=="ilimitada") {
      const match=dur.match(/^(\d+)(d|h|m)$/);
      if (match) { const val=parseInt(match[1]),u2=match[2],ms=u2==="d"?val*86400000:u2==="h"?val*3600000:val*60000; expiraEn=new Date(Date.now()+ms).toISOString(); durTexto=u2==="d"?`${val} día(s)`:u2==="h"?`${val} hora(s)`:`${val} minuto(s)`; }
    }
    const nk={id:Date.now(),codigo,plataforma:plat,duracion:durTexto,expiraEn,usada:false,creadaEn:Date.now(),asignadaA:uid};
    await setDoc(doc(db,"keys",String(nk.id)),nk);
    // Add key to user
    const user = users.find(u=>u.id===uid);
    if (user) {
      const userKeys = user.keys||[];
      await updateDoc(doc(db,"users",uid),{ keys:[...userKeys,{codigo,plataforma:plat,duracion:durTexto,expiraEn,asignadaEn:new Date().toISOString()}] });
    }
    toast(`Key ${codigo} generada para ${plat}`);
    return codigo;
  }

  // ── Accounts ──
  async function addAccount() {
    if (!newAcc.email||!newAcc.password||!newAcc.platform) { toast("Completa los campos requeridos","error"); return; }
    const updated={...accounts};
    if (!updated[newAcc.platform]) updated[newAcc.platform]=[];
    updated[newAcc.platform]=[...updated[newAcc.platform],{...newAcc,id:Date.now(),status:"disponible",assignedTo:null}];
    await fbSaveAccounts(updated); setNewAcc({email:"",password:"",profile:"",platform:"",expiresAt:""}); setModal(null); toast("Cuenta agregada");
  }
  async function deleteAccount(platform,id) { const u={...accounts}; u[platform]=u[platform].filter(a=>a.id!==id); await fbSaveAccounts(u); toast("Cuenta eliminada"); }
  function startEdit(platform,id,field,value) { setEditingAcc({platform,id,field,value}); }
  async function saveEdit() {
    if (!editingAcc) return;
    const {platform,id,field,value}=editingAcc;
    const u={...accounts}; u[platform]=u[platform].map(a=>a.id===id?{...a,[field]:value}:a);
    await fbSaveAccounts(u); setEditingAcc(null); toast("Campo actualizado");
  }
  async function toggleStatus(platform,id) { const u={...accounts}; u[platform]=u[platform].map(a=>a.id===id?{...a,status:a.status==="disponible"?"ocupado":"disponible"}:a); await fbSaveAccounts(u); }
  async function assignAccount() {
    if (!assignName.trim()||!assignModal) return;
    const {platform,accId}=assignModal;
    const u={...accounts}; const acc=u[platform].find(a=>a.id===accId); if (!acc) return;
    u[platform]=u[platform].map(a=>a.id===accId?{...a,status:"ocupado",assignedTo:assignName.trim()}:a);
    await fbSaveAccounts(u);
    await setDoc(doc(db,"clients",String(Date.now())),{id:Date.now(),clientName:assignName.trim(),platform,accountEmail:acc.email,date:new Date().toLocaleDateString("es-PE"),action:"asignada",timestamp:Date.now()});
    setAssignModal(null); setAssignName(""); toast(`Cuenta asignada a ${assignName}`);
  }

  // ── Keys admin ──
  async function generateKey() {
    if (!genKeyPlat) { toast("Selecciona una plataforma","error"); return; }
    const codigo=genKeyCode(genKeyPlat);
    let expiraEn=null, durTexto="Ilimitada";
    if (genKeyDur!=="ilimitada") {
      const match=genKeyDur.match(/^(\d+)(d|h|m)$/);
      if (match) { const val=parseInt(match[1]),u=match[2],ms=u==="d"?val*86400000:u==="h"?val*3600000:val*60000; expiraEn=new Date(Date.now()+ms).toISOString(); durTexto=u==="d"?`${val} día(s)`:u==="h"?`${val} hora(s)`:`${val} minuto(s)`; }
    }
    const nk={id:Date.now(),codigo,plataforma:genKeyPlat,duracion:durTexto,expiraEn,usada:false,creadaEn:Date.now()};
    await setDoc(doc(db,"keys",String(nk.id)),nk); setGenKeyResult(nk); toast(`Key generada: ${codigo}`);
  }

  // ── Activar key (cliente) ──
  async function activarKey() {
    if (!keyInput.trim()) return;
    setKeyLoading(true); setKeyError("");
    const found = keys.find(k=>k.codigo===keyInput.trim().toUpperCase()&&!k.usada);
    if (!found) { setKeyError("Key inválida o ya utilizada."); setKeyLoading(false); return; }
    if (found.expiraEn&&new Date()>new Date(found.expiraEn)) {
      await updateDoc(doc(db,"keys",String(found.id)),{usada:true});
      setKeyError("Esta key ha expirado."); setKeyLoading(false); return;
    }
    // Asignar cuenta aleatoria
    const disponibles=(accounts[found.plataforma]||[]).filter(a=>a.status==="disponible");
    let cuentaAsignada=null;
    if (disponibles.length>0) {
      const randomAcc=disponibles[Math.floor(Math.random()*disponibles.length)];
      const grantedEntry={id:Date.now(),plataforma:found.plataforma,email:randomAcc.email,password:randomAcc.password,profile:randomAcc.profile||"",keyCodigo:found.codigo,keyDuracion:found.duracion,otorgadaEn:Date.now(),otorgadaEnFmt:new Date().toLocaleString("es-PE"),clienteEmail:clientUser?.email||"anon"};
      await setDoc(doc(db,"granted",String(grantedEntry.id)),grantedEntry);
      const updated={...accounts};
      updated[found.plataforma]=updated[found.plataforma].filter(a=>a.id!==randomAcc.id);
      await fbSaveAccounts(updated);
      cuentaAsignada=randomAcc;
    }
    await updateDoc(doc(db,"keys",String(found.id)),{usada:true,usadaEn:new Date().toISOString(),usadaPor:clientUser?.email||"anon"});

    const newSessions={...sessions,[found.plataforma]:{plataforma:found.plataforma,keyCodigo:found.codigo,duracion:found.duracion,expiraEn:found.expiraEn,cuenta:cuentaAsignada,iniciadaEn:new Date().toISOString()}};
    setSessions(newSessions);
    localStorage.setItem("sv_sessions",JSON.stringify(newSessions));

    const plat=PLATFORMS.find(p=>p.id===found.plataforma);
    setModal(null); setKeyInput(""); setKeyLoading(false);
    setActivePlat(found.plataforma); setView("platform");
    toast(`✅ Acceso a ${plat?.name} desbloqueado`);
  }

  function cerrarSesionPlat(platId) {
    const updated={...sessions};
    delete updated[platId];
    setSessions(updated);
    localStorage.setItem("sv_sessions",JSON.stringify(updated));
    setView("home"); toast("Sesión de plataforma cerrada");
  }

  // ── Derived ──
  const allAccounts=Object.values(accounts).flat();
  const totalAcc=allAccounts.length;
  const availableAcc=allAccounts.filter(a=>a.status==="disponible").length;
  const expiringAcc=allAccounts.filter(a=>{ const d=daysUntil(a.expiresAt); return d!==null&&d<=7&&d>=0; }).length;
  const filteredPlats=PLATFORMS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
  const activeKeys=keys.filter(k=>!k.usada&&(!k.expiraEn||new Date()<new Date(k.expiraEn)));
  const activePlatObj=activePlat?PLATFORMS.find(p=>p.id===activePlat):null;
  const activeSession=activePlat?sessions[activePlat]:null;

  if (loading) return <div style={{ minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center",color:"#6366f1",fontSize:18,fontWeight:700,fontFamily:"system-ui" }}>Cargando StreamVault...</div>;

  return (
    <div style={{ minHeight:"100vh",background:"#080810",color:"#f0f0f5",fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative" }}>
      {/* Fondo animado */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,#6366f118,transparent 70%)",top:"-200px",left:"-200px",animation:"float1 8s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,#a855f718,transparent 70%)",top:"30%",right:"-150px",animation:"float2 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,#ec489918,transparent 70%)",bottom:"-100px",left:"30%",animation:"float3 12s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,#3b5bdb18,transparent 70%)",top:"60%",left:"-100px",animation:"float1 9s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(#ffffff03 1px,transparent 1px),linear-gradient(90deg,#ffffff03 1px,transparent 1px)",backgroundSize:"60px 60px" }}/>
      </div>
      <div style={{ position:"relative",zIndex:1 }}>

      {/* BANNER OFERTA */}
      {(view==="home"||view==="platform")&&clientUser&&(
        <div style={{ background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)",backgroundSize:"300% 100%",animation:"bannerPulse 4s ease infinite",padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap" }}>
          <Zap size={14}/> 🎉 OFERTA ESPECIAL: Plan 3 meses por solo S/. 25 esta semana · Recomienda y ambos ganan 1 semana GRATIS
          <button onClick={()=>window.open("https://wa.me/51901815489?text=Hola! Vi la oferta especial y quiero el plan 3 meses por S/. 25","_blank")} style={{ background:"#ffffff22",border:"1px solid #ffffff44",borderRadius:6,padding:"3px 10px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700 }}>¡Aprovechar!</button>
        </div>
      )}

      {/* Toast */}
      {notif&&<div style={{ position:"fixed",top:16,right:16,left:16,zIndex:9999,background:notif.type==="error"?"#450a0a":notif.type==="warn"?"#1a0f00":"#052e16",border:`1px solid ${notif.type==="error"?"#7f1d1d":notif.type==="warn"?"#78350f":"#166534"}`,color:notif.type==="error"?"#f87171":notif.type==="warn"?"#fbbf24":"#4ade80",borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8,maxWidth:420,margin:"0 auto",boxShadow:"0 8px 32px #00000066" }}>{notif.type==="error"?<X size={15}/>:notif.type==="warn"?<AlertTriangle size={15}/>:<Check size={15}/>}{notif.msg}</div>}

      {/* ═══ CLIENT LOGIN ═══ */}
      {view==="clientLogin"&&(
        <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"radial-gradient(ellipse at top,#1a0a2e,#080810)" }}>
          <div style={{ width:"100%",maxWidth:400 }}>
            <div style={{ textAlign:"center",marginBottom:32 }}>
              <div style={{ width:60,height:60,borderRadius:16,margin:"0 auto 14px",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}><Package size={28} color="#fff"/></div>
              <h1 style={{ fontSize:28,fontWeight:900,margin:"0 0 6px",letterSpacing:-1 }}>StreamVault</h1>
              <p style={{ color:"#6b7280",fontSize:14,margin:0 }}>Inicia sesión para acceder a tus plataformas</p>
            </div>
            <div style={{ background:"#0f0f1a",border:"1px solid #ffffff12",borderRadius:20,padding:28,boxShadow:"0 32px 80px #00000088" }}>
              <Input label="Email" type="email" placeholder="tu@email.com" value={cEmail} onChange={e=>{ setCEmail(e.target.value); setCErr(""); }}/>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12,color:"#9ca3af",display:"block",marginBottom:6,fontWeight:600 }}>Contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={cShowPass?"text":"password"} placeholder="••••••••" value={cPass} onChange={e=>{ setCPass(e.target.value); setCErr(""); }} onKeyDown={e=>e.key==="Enter"&&clientLogin()} style={{ width:"100%",background:"#080812",border:"1px solid #ffffff18",borderRadius:10,padding:"10px 40px 10px 13px",color:"#f0f0f5",fontSize:14,outline:"none",boxSizing:"border-box" }} onFocus={e=>e.target.style.border="1px solid #6366f166"} onBlur={e=>e.target.style.border="1px solid #ffffff18"}/>
                  <button onClick={()=>setCShowPass(!cShowPass)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280" }}>{cShowPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
                </div>
              </div>
              {cErr&&<div style={{ background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#f87171",marginBottom:12 }}>❌ {cErr}</div>}
              <Btn onClick={clientLogin} style={{ width:"100%",justifyContent:"center",padding:"12px 0",fontSize:15,marginBottom:14 }}>
                <Unlock size={15}/> Iniciar sesión
              </Btn>
              <div style={{ textAlign:"center",fontSize:12,color:"#4b5563" }}>
                ¿No tienes cuenta? <button onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} style={{ background:"none",border:"none",cursor:"pointer",color:"#6366f1",fontWeight:600,fontSize:12 }}>Contáctanos en Telegram</button>
              </div>
              <div style={{ borderTop:"1px solid #ffffff08",marginTop:16,paddingTop:12,textAlign:"center" }}>
                <button onClick={()=>setView("adminLogin")} style={{ background:"none",border:"none",cursor:"pointer",color:"#4b5563",fontSize:11,display:"flex",alignItems:"center",gap:4,margin:"0 auto" }}><Shield size={11}/> Acceso administrador</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADMIN LOGIN ═══ */}
      {view==="adminLogin"&&(
        <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"#0f0f1a",border:"1px solid #ffffff12",borderRadius:22,padding:32,width:"100%",maxWidth:360,boxShadow:"0 32px 80px #00000088" }}>
            <div style={{ textAlign:"center",marginBottom:24 }}>
              <div style={{ width:54,height:54,borderRadius:14,margin:"0 auto 12px",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}><Shield size={24} color="#fff"/></div>
              <h2 style={{ fontSize:20,fontWeight:800,margin:"0 0 4px" }}>Panel Admin</h2>
              <p style={{ color:"#6b7280",fontSize:13,margin:0 }}>Solo para administradores</p>
            </div>
            <Input label="Contraseña" type={aShow?"text":"password"} value={aPass} onChange={e=>setAPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()} placeholder="••••••••" style={{ border:aErr?"1px solid #7f1d1d":"1px solid #ffffff18" }}/>
            {aErr&&<p style={{ color:"#f87171",fontSize:12,margin:"-8px 0 12px" }}>Contraseña incorrecta</p>}
            <button onClick={()=>setAShow(!aShow)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:12,marginBottom:12,padding:0 }}>{aShow?"Ocultar":"Mostrar"} contraseña</button>
            <Btn onClick={adminLogin} style={{ width:"100%",justifyContent:"center",padding:"12px 0" }}>Ingresar</Btn>
            <button onClick={()=>setView("clientLogin")} style={{ width:"100%",background:"none",border:"none",color:"#6b7280",fontSize:13,marginTop:10,cursor:"pointer" }}>← Volver</button>
          </div>
        </div>
      )}

      {/* ═══ NAVBAR (home/platform) ═══ */}
      {(view==="home"||view==="platform")&&clientUser&&(
        <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #ffffff0e",background:"#09091488",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }} onClick={()=>setView("home")}>
            <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}><Package size={16} color="#fff"/></div>
            <span style={{ fontWeight:800,fontSize:16,letterSpacing:-0.5 }}>StreamVault</span>
          </div>
          <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
            {/* Sesiones activas */}
            {Object.entries(sessions).map(([platId,sess])=>{
              const p=PLATFORMS.find(x=>x.id===platId);
              return <div key={platId} onClick={()=>{ setActivePlat(platId); setView("platform"); }} style={{ display:"flex",alignItems:"center",gap:6,background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"5px 10px",cursor:"pointer" }}>
                <PlatformIcon id={platId} size={18}/>
                <div><div style={{ fontSize:10,fontWeight:700,color:"#4ade80" }}>{p?.name}</div><div style={{ fontSize:9,color:"#6b7280" }}>{timers[platId]||"activo"}</div></div>
              </div>;
            })}
            <div style={{ fontSize:12,color:"#9ca3af",background:"#0f0f1a",border:"1px solid #ffffff12",borderRadius:8,padding:"5px 10px" }}>👤 {clientUser.nombre}</div>
            <button onClick={clientLogout} style={{ background:"transparent",border:"1px solid #ffffff18",borderRadius:9,color:"#6b7280",padding:"6px 12px",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:4 }}><LogOut size={12}/> Salir</button>
          </div>
        </nav>
      )}

      {/* ═══ HOME ═══ */}
      {view==="home"&&clientUser&&(
        <div style={{ maxWidth:"100%",padding:"32px 16px" }}>
          {/* Bienvenida */}
          <div style={{ textAlign:"center",marginBottom:32 }}>
            <h1 style={{ fontSize:"clamp(24px,5vw,44px)",fontWeight:800,margin:"0 0 8px",letterSpacing:-1 }}>
              Hola, <span style={{ background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{clientUser.nombre}</span> 👋
            </h1>
            <p style={{ color:"#9ca3af",fontSize:14,margin:"0 0 20px" }}>Selecciona una plataforma para ver tus accesos</p>
            <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
              {[{label:"Plataformas",value:PLATFORMS.length,icon:"🎬"},{label:"Disponibles",value:availableAcc,icon:"✅"},{label:"Sesiones activas",value:Object.keys(sessions).length,icon:"🔑"}].map(s=>(
                <div key={s.label} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:12,padding:"10px 16px",minWidth:90,textAlign:"center" }}>
                  <div style={{ fontSize:16 }}>{s.icon}</div>
                  <div style={{ fontSize:20,fontWeight:800 }}>{s.value}</div>
                  <div style={{ fontSize:10,color:"#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ position:"relative",maxWidth:360,margin:"0 auto 20px" }}>
            <Search size={14} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#6b7280" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar plataforma…" style={{ width:"100%",background:"#0f0f1a",border:"1px solid #ffffff12",borderRadius:11,padding:"10px 10px 10px 36px",color:"#f0f0f5",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
          </div>

          {/* Plataformas */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12 }}>
            {filteredPlats.map(platform=>{
              const pAccs=accounts[platform.id]||[];
              const avail=pAccs.filter(a=>a.status==="disponible").length;
              const sess=sessions[platform.id];
              const isActive=!!sess&&(!sess.expiraEn||new Date()<new Date(sess.expiraEn));
              return (
                <div key={platform.id} onClick={()=>{ if(isActive){setActivePlat(platform.id);setView("platform");}else{setSelPlatform(platform);setModal("view");} }}
                  style={{ background:"#0f0f1a",border:`1px solid ${isActive?platform.color+"99":"#ffffff0e"}`,borderRadius:18,padding:16,cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.18s ease",boxShadow:isActive?`0 0 24px ${platform.color}33`:"none" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${platform.color}22`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isActive?`0 0 24px ${platform.color}33`:"none"; }}>
                  <div style={{ position:"absolute",top:-18,right:-18,width:70,height:70,borderRadius:"50%",background:platform.color,opacity:0.08 }}/>
                  {isActive&&<div style={{ position:"absolute",top:10,right:10 }}><Badge color="green" dot>Activo · {timers[platform.id]||"∞"}</Badge></div>}
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                    <PlatformIcon id={platform.id} size={40}/>
                    <div><div style={{ fontWeight:700,fontSize:14 }}>{platform.name}</div><div style={{ fontSize:11,color:"#6b7280" }}>{platform.desc}</div></div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    {isActive?<Badge color="green" dot>Tienes acceso</Badge>:<Badge color={avail>0?"blue":"red"} dot>{avail>0?`${avail} disponible${avail!==1?"s":""}`:"Sin stock"}</Badge>}
                    <ChevronRight size={14} color="#6b7280"/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PLATFORM VIEW ═══ */}
      {view==="platform"&&clientUser&&activePlat&&(
        <div style={{ maxWidth:700,margin:"0 auto",padding:"32px 16px" }}>
          {activeSession ? (
            <>
              {/* Header */}
              <div style={{ background:`linear-gradient(135deg,${activePlatObj?.color||"#333"}22,#0f0f1a)`,border:`1px solid ${activePlatObj?.color||"#333"}44`,borderRadius:20,padding:22,marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
                  <PlatformIcon id={activePlat} size={52}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                      <h2 style={{ margin:0,fontSize:20,fontWeight:800 }}>{activePlatObj?.name}</h2>
                      <Badge color="green" dot>Acceso activo</Badge>
                    </div>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      <Badge color="purple"><Clock size={10}/> {timers[activePlat]||"∞"}</Badge>
                      <Badge color="blue">Key: {activeSession.keyCodigo}</Badge>
                    </div>
                  </div>
                  <Btn variant="danger" small onClick={()=>cerrarSesionPlat(activePlat)}><LogOut size={12}/> Cerrar sesión</Btn>
                </div>
              </div>

              {/* Cuenta */}
              {activeSession.cuenta?(
                <div style={{ background:"#0f0f1a",border:`1px solid ${activePlatObj?.color||"#333"}44`,borderRadius:16,padding:20,marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap" }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:"#4ade80" }}/>
                    <span style={{ fontWeight:700,fontSize:15,color:"#4ade80" }}>Tu cuenta asignada</span>
                    {activeSession.cuenta.profile&&<Badge color="green">👤 {activeSession.cuenta.profile}</Badge>}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12 }}>
                    <div style={{ background:"#080812",border:"1px solid #ffffff0a",borderRadius:10,padding:"12px 14px" }}>
                      <div style={{ fontSize:10,color:"#6b7280",marginBottom:4,fontWeight:600,textTransform:"uppercase" }}>📧 Email</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:13,fontWeight:600,flex:1,wordBreak:"break-all" }}>{activeSession.cuenta.email}</span>
                        <button onClick={()=>copyText(activeSession.cuenta.email,"email")} style={{ background:"none",border:"none",cursor:"pointer",color:copied==="email"?"#4ade80":"#6b7280" }}>{copied==="email"?<Check size={14}/>:<Copy size={14}/>}</button>
                      </div>
                    </div>
                    <div style={{ background:"#080812",border:"1px solid #ffffff0a",borderRadius:10,padding:"12px 14px" }}>
                      <div style={{ fontSize:10,color:"#6b7280",marginBottom:4,fontWeight:600,textTransform:"uppercase" }}>🔑 Contraseña</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:13,fontWeight:600,flex:1,fontFamily:"monospace" }}>{showPasses["acc"]?activeSession.cuenta.password:"••••••••"}</span>
                        <button onClick={()=>setShowPasses(p=>({...p,acc:!p.acc}))} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280" }}>{showPasses["acc"]?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                        <button onClick={()=>copyText(activeSession.cuenta.password,"pass")} style={{ background:"none",border:"none",cursor:"pointer",color:copied==="pass"?"#4ade80":"#6b7280" }}>{copied==="pass"?<Check size={14}/>:<Copy size={14}/>}</button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <Btn onClick={()=>copyText(`Email: ${activeSession.cuenta.email}\nContraseña: ${activeSession.cuenta.password}${activeSession.cuenta.profile?`\nPerfil: ${activeSession.cuenta.profile}`:""}`, "all")} variant="ghost" style={{ flex:1,justifyContent:"center" }}>
                      {copied==="all"?<><Check size={13}/> ¡Copiado!</>:<><Copy size={13}/> Copiar todo</>}
                    </Btn>
                    <Btn onClick={()=>window.open(activePlatObj?.url,"_blank")} style={{ flex:1,justifyContent:"center",background:`linear-gradient(135deg,${activePlatObj?.color||"#6366f1"},${activePlatObj?.color||"#a855f7"}99)`,border:"none" }}>
                      <Unlock size={13}/> Abrir {activePlatObj?.name}
                    </Btn>
                  </div>
                </div>
              ):(
                <div style={{ background:"#1a0000",border:"1px solid #7f1d1d44",borderRadius:16,padding:28,textAlign:"center",marginBottom:14 }}>
                  <Lock size={28} color="#f87171" style={{ marginBottom:8 }}/>
                  <div style={{ fontSize:14,fontWeight:700,color:"#f87171",marginBottom:6 }}>Sin cuentas disponibles</div>
                  <div style={{ fontSize:12,color:"#6b7280",marginBottom:12 }}>El admin está actualizando el stock.</div>
                  <Btn onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} variant="ghost" small><Send size={12}/> Contactar admin</Btn>
                </div>
              )}

              {/* Instrucciones */}
              {activePlatObj?.steps&&(
                <div style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:16,marginBottom:14 }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:10 }}>📋 Cómo usar {activePlatObj.name}</div>
                  {activePlatObj.steps.map((step,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                      <div style={{ width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0 }}>{i+1}</div>
                      <span style={{ fontSize:12,color:"#d1d5db" }}>{step}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10,background:"#1a0000",border:"1px solid #7f1d1d33",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#f87171" }}>⚠️ No cambies la contraseña ni el email. No compartas las credenciales.</div>
                </div>
              )}

              {/* Contacto */}
              <div style={{ background:"#0c1a3a",border:"1px solid #1e3a8a",borderRadius:12,padding:14,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                <div><div style={{ fontSize:13,fontWeight:700,color:"#60a5fa" }}>¿Tienes algún problema?</div><div style={{ fontSize:11,color:"#6b7280" }}>Contacta al administrador</div></div>
                <Btn variant="ghost" onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} style={{ border:"1px solid #1e3a8a",color:"#60a5fa" }} small><Send size={12}/> @alex_eren</Btn>
              </div>

              <button onClick={()=>setView("home")} style={{ background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:4 }}>← Volver al inicio</button>
            </>
          ):(
            // No hay sesión para esta plataforma
            <div style={{ textAlign:"center",padding:"60px 16px" }}>
              <Lock size={40} color="#6b7280" style={{ marginBottom:16 }}/>
              <h2 style={{ fontSize:18,fontWeight:700,marginBottom:8 }}>Acceso bloqueado</h2>
              <p style={{ color:"#6b7280",marginBottom:20 }}>Necesitas una key activa para acceder a {activePlatObj?.name}.</p>
              <Btn onClick={()=>{ setModal("activarKey"); setKeyInput(""); setKeyError(""); }}><Key size={14}/> Activar key</Btn>
              <button onClick={()=>setView("home")} style={{ display:"block",margin:"12px auto 0",background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13 }}>← Volver</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ ADMIN PANEL ═══ */}
      {view==="admin"&&isAdmin&&(
        <>
          <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #ffffff0e",background:"#09091488",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}><Package size={16} color="#fff"/></div>
              <span style={{ fontWeight:800,fontSize:16 }}>StreamVault</span>
              <Badge color="purple">Admin</Badge>
            </div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {["accounts","users","requests","clients","keys","granted","settings"].map(t=>(
                <button key={t} onClick={()=>setAdminTab(t)} style={{ background:adminTab===t?"#1e1e2e":"transparent",border:"1px solid #ffffff18",borderRadius:9,color:"#c4b5fd",padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                  {t==="accounts"?"Cuentas":t==="users"?"Usuarios":t==="requests"?"Solicitudes":t==="clients"?"Clientes":t==="keys"?"Keys":t==="granted"?"Otorgadas":"Config"}
                </button>
              ))}
              <button onClick={adminLogout} style={{ background:"transparent",border:"1px solid #ffffff18",borderRadius:9,color:"#6b7280",padding:"6px 12px",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:4 }}><LogOut size={12}/> Salir</button>
            </div>
          </nav>

          <div style={{ maxWidth:"100%",padding:"24px 16px" }}>

            {/* USUARIOS */}
            {adminTab==="users"&&(
              <>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10 }}>
                  <div><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Usuarios / Clientes</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>{users.length} usuarios registrados</p></div>
                  <Btn onClick={()=>{ setNewUser({email:"",password:"",nombre:""}); setModal("newUser"); }}><Plus size={14}/> Crear Usuario</Btn>
                </div>
                {users.length===0?<div style={{ textAlign:"center",color:"#4b5563",padding:"60px 0" }}>Sin usuarios. Crea el primero.</div>:(
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {users.map(u=>(
                      <div key={u.id} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:16 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10 }}>
                          <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14 }}>{u.nombre?.[0]?.toUpperCase()||"U"}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700,fontSize:14 }}>{u.nombre}</div>
                            <div style={{ fontSize:12,color:"#6b7280" }}>{u.email} · {u.ultimoLogin?`Último login: ${new Date(u.ultimoLogin).toLocaleDateString("es-PE")}`:"Nunca ha entrado"}</div>
                          </div>
                          <Badge color={u.activo!==false?"green":"red"} dot>{u.activo!==false?"Activo":"Inactivo"}</Badge>
                          <div style={{ display:"flex",gap:6 }}>
                            <Btn small variant="success" onClick={()=>{ setModal("userKey"); setNewUserKeyPlat("netflix"); setNewUserKeyDur("30d"); setNewUser({...newUser,_uid:u.id,_nombre:u.nombre}); }}><Key size={11}/> Dar Key</Btn>
                            <Btn small variant={u.activo!==false?"amber":"success"} onClick={()=>toggleUserActive(u.id,u.activo!==false)}>{u.activo!==false?"Desactivar":"Activar"}</Btn>
                            <Btn small variant="danger" onClick={()=>deleteUser(u.id)}><Trash2 size={11}/></Btn>
                          </div>
                        </div>
                        {/* Keys del usuario */}
                        {(u.keys||[]).length>0&&(
                          <div style={{ background:"#08080f",borderRadius:10,padding:"10px 12px" }}>
                            <div style={{ fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600 }}>KEYS ASIGNADAS</div>
                            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                              {(u.keys||[]).map((k,i)=>{
                                const expired=k.expiraEn&&new Date()>new Date(k.expiraEn);
                                return <div key={i} style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                                  <code style={{ fontSize:12,fontWeight:700,color:expired?"#6b7280":"#c4b5fd",letterSpacing:1 }}>{k.codigo}</code>
                                  <span style={{ fontSize:11,color:"#6b7280" }}>{PLATFORMS.find(p=>p.id===k.plataforma)?.name} · {k.duracion}</span>
                                  <Badge color={expired?"red":"green"} dot>{expired?"Expirada":"Activa"}</Badge>
                                  <button onClick={()=>copyText(k.codigo,`uk-${i}`)} style={{ background:"none",border:"none",cursor:"pointer",color:copied===`uk-${i}`?"#4ade80":"#6b7280" }}>{copied===`uk-${i}`?<Check size={12}/>:<Copy size={12}/>}</button>
                                </div>;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CUENTAS */}
            {adminTab==="accounts"&&(
              <>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10 }}>
                  <div><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Cuentas de Streaming</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>☁️ Firebase — tiempo real</p></div>
                  <Btn onClick={()=>{ setNewAcc({email:"",password:"",profile:"",platform:"",expiresAt:""}); setModal("addAccount"); }}><Plus size={14}/> Agregar Cuenta</Btn>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:22 }}>
                  {[{label:"Total",value:totalAcc,color:"#6366f1"},{label:"Disponibles",value:availableAcc,color:"#1DB954"},{label:"Ocupadas",value:totalAcc-availableAcc,color:"#f59e0b"},{label:"Otorgadas",value:granted.length,color:"#a855f7"}].map(s=>(
                    <div key={s.label} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:12,padding:"12px 14px" }}>
                      <div style={{ fontSize:22,fontWeight:800,color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {PLATFORMS.map(platform=>{
                  const pAccs=accounts[platform.id]||[];
                  if (!pAccs.length) return null;
                  return (
                    <div key={platform.id} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:16,marginBottom:12 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                        <PlatformIcon id={platform.id} size={32}/>
                        <span style={{ fontWeight:700,fontSize:14 }}>{platform.name}</span>
                        <Badge color={pAccs.filter(a=>a.status==="disponible").length>0?"green":"red"} dot>{pAccs.filter(a=>a.status==="disponible").length} disponibles</Badge>
                      </div>
                      {pAccs.map(acc=>{
                        const days=daysUntil(acc.expiresAt); const expWarn=days!==null&&days<=7;
                        const isEditing=editingAcc&&editingAcc.platform===platform.id&&editingAcc.id===acc.id;
                        return (
                          <div key={acc.id} style={{ background:"#08080f",border:`1px solid ${expWarn?"#78350f44":"#ffffff08"}`,borderRadius:10,padding:"11px 13px",marginBottom:7 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                              <div style={{ width:7,height:7,borderRadius:"50%",background:acc.status==="disponible"?"#1DB954":"#f59e0b",flexShrink:0 }}/>
                              {isEditing&&editingAcc.field==="email"?<input autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))} onBlur={saveEdit} onKeyDown={e=>e.key==="Enter"&&saveEdit()} style={{ flex:1,minWidth:140,background:"#1a1a2e",border:"1px solid #6366f1",borderRadius:7,padding:"4px 8px",color:"#f0f0f5",fontSize:13 }}/>:<span onClick={()=>startEdit(platform.id,acc.id,"email",acc.email)} style={{ flex:1,minWidth:120,fontSize:13,fontWeight:600,cursor:"text" }}>{acc.email}</span>}
                              <div style={{ display:"flex",alignItems:"center",gap:3 }}>
                                <span style={{ background:"#1a1a2e",border:"1px solid #ffffff0a",borderRadius:6,padding:"2px 8px",fontSize:12,color:"#9ca3af",fontFamily:"monospace" }}>{showPasses[acc.id]?acc.password:"••••••••"}</span>
                                <button onClick={()=>setShowPasses(p=>({...p,[acc.id]:!p[acc.id]}))} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:2 }}>{showPasses[acc.id]?<EyeOff size={12}/>:<Eye size={12}/>}</button>
                                <button onClick={()=>copyText(`${acc.email} | ${acc.password}`,acc.id)} style={{ background:"none",border:"none",cursor:"pointer",color:copied===acc.id?"#1DB954":"#6b7280",padding:2 }}>{copied===acc.id?<Check size={12}/>:<Copy size={12}/>}</button>
                              </div>
                              <span style={{ fontSize:11,color:expWarn?"#fbbf24":"#6b7280" }}>{acc.expiresAt?fmt(acc.expiresAt):"Sin fecha"}</span>
                              {acc.assignedTo&&<Badge color="blue"><UserCheck size={10}/> {acc.assignedTo}</Badge>}
                              <div style={{ display:"flex",gap:4,marginLeft:"auto" }}>
                                <Btn small variant="ghost" onClick={()=>{ setAssignModal({platform:platform.id,accId:acc.id}); setAssignName(""); }}><UserCheck size={11}/></Btn>
                                <Btn small variant={acc.status==="disponible"?"ghost":"success"} onClick={()=>toggleStatus(platform.id,acc.id)}>{acc.status==="disponible"?<ToggleRight size={11}/>:<ToggleLeft size={11}/>}</Btn>
                                <Btn small variant="danger" onClick={()=>deleteAccount(platform.id,acc.id)}><Trash2 size={11}/></Btn>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {!PLATFORMS.some(p=>(accounts[p.id]||[]).length>0)&&<div style={{ textAlign:"center",color:"#4b5563",padding:"60px 0" }}>Aún no hay cuentas.</div>}
              </>
            )}

            {/* SOLICITUDES */}
            {adminTab==="requests"&&(
              <>
                <div style={{ marginBottom:20 }}><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Solicitudes</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>{requests.length} recibidas</p></div>
                {requests.length===0?<div style={{ textAlign:"center",color:"#4b5563",padding:"60px 0" }}>Sin solicitudes</div>:(
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {requests.map(req=>{ const plat=PLATFORMS.find(p=>p.id===req.platform); return (
                      <div key={req.id} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
                        {plat&&<PlatformIcon id={plat.id} size={32}/>}
                        <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:14 }}>{req.name}</div><div style={{ fontSize:12,color:"#6b7280" }}>{plat?.name} · {req.date}</div></div>
                        <Badge color="blue" dot>pendiente</Badge>
                        <Btn variant="success" small onClick={()=>{ setAdminTab("keys"); setGenKeyPlat(req.platform); }}><Key size={12}/> Generar Key</Btn>
                        <Btn variant="danger" small onClick={()=>deleteDoc(doc(db,"requests",String(req.id)))}><Trash2 size={12}/></Btn>
                      </div>
                    ); })}
                  </div>
                )}
              </>
            )}

            {/* CLIENTES */}
            {adminTab==="clients"&&(
              <>
                <div style={{ marginBottom:20 }}><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Historial</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>{clients.length} registros</p></div>
                {clients.length===0?<div style={{ textAlign:"center",color:"#4b5563",padding:"60px 0" }}>Sin historial.</div>:(
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {clients.map(c=>{ const plat=PLATFORMS.find(p=>p.id===c.platform); return (
                      <div key={c.id} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                        <PlatformIcon id={c.platform} size={28}/>
                        <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{c.clientName}</div><div style={{ fontSize:11,color:"#6b7280" }}>{plat?.name} · {c.accountEmail} · {c.date}</div></div>
                        <Badge color="green" dot>{c.action}</Badge>
                        <button onClick={()=>deleteDoc(doc(db,"clients",String(c.id)))} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280" }}><Trash2 size={13}/></button>
                      </div>
                    ); })}
                  </div>
                )}
              </>
            )}

            {/* KEYS */}
            {adminTab==="keys"&&(
              <>
                <div style={{ marginBottom:20 }}><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Keys</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>{activeKeys.length} activas</p></div>
                <div style={{ background:"#0f0f1a",border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:20 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                    <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}><Key size={15} color="#fff"/></div>
                    <div><div style={{ fontWeight:700,fontSize:14 }}>Generar key libre</div><div style={{ fontSize:11,color:"#6b7280" }}>Para compartir con cualquier cliente</div></div>
                  </div>
                  <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:14 }}>
                    <div style={{ flex:1,minWidth:160 }}><Select label="Plataforma" value={genKeyPlat} onChange={e=>setGenKeyPlat(e.target.value)}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                    <div style={{ flex:1,minWidth:140 }}><Select label="Duración" value={genKeyDur} onChange={e=>setGenKeyDur(e.target.value)}><option value="1h">1 hora</option><option value="6h">6 horas</option><option value="12h">12 horas</option><option value="1d">1 día</option><option value="3d">3 días</option><option value="7d">7 días</option><option value="15d">15 días</option><option value="30d">30 días</option><option value="ilimitada">Ilimitada</option></Select></div>
                  </div>
                  <Btn onClick={generateKey} style={{ width:"100%",justifyContent:"center" }}><Key size={14}/> Generar Key</Btn>
                  {genKeyResult&&(
                    <div style={{ background:"#052e16",border:"1px solid #166534",borderRadius:12,padding:16,marginTop:14,textAlign:"center" }}>
                      <div style={{ fontSize:11,color:"#6b7280",marginBottom:4 }}>Envíala a tu cliente</div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                        <code style={{ fontSize:20,fontWeight:800,color:"#4ade80",letterSpacing:2 }}>{genKeyResult.codigo}</code>
                        <button onClick={()=>copyText(genKeyResult.codigo,"genkey")} style={{ background:"none",border:"none",cursor:"pointer",color:copied==="genkey"?"#4ade80":"#6b7280" }}>{copied==="genkey"?<Check size={16}/>:<Copy size={16}/>}</button>
                      </div>
                      <div style={{ fontSize:12,color:"#86efac",marginTop:6 }}>📺 {PLATFORMS.find(p=>p.id===genKeyResult.plataforma)?.name} · ⏱ {genKeyResult.duracion}</div>
                    </div>
                  )}
                </div>
                <div style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,overflow:"hidden" }}>
                  {keys.length===0?<div style={{ textAlign:"center",color:"#4b5563",padding:"40px 0" }}>No hay keys</div>:keys.map((k,i)=>{
                    const expired=k.expiraEn&&new Date()>new Date(k.expiraEn); const plat=PLATFORMS.find(p=>p.id===k.plataforma);
                    return (
                      <div key={k.id} style={{ padding:"12px 16px",borderBottom:i<keys.length-1?"1px solid #ffffff06":"none",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                        <PlatformIcon id={k.plataforma} size={28}/>
                        <div style={{ flex:1 }}><code style={{ fontSize:14,fontWeight:700,color:k.usada||expired?"#6b7280":"#c4b5fd",letterSpacing:1 }}>{k.codigo}</code><div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{plat?.name} · {k.duracion}{k.asignadaA?" · 👤 "+k.asignadaA:""}</div></div>
                        <Badge color={k.usada?"gray":expired?"red":"green"} dot>{k.usada?"Usada":expired?"Expirada":"Activa"}</Badge>
                        <button onClick={()=>copyText(k.codigo,k.id)} style={{ background:"none",border:"none",cursor:"pointer",color:copied===k.id?"#4ade80":"#6b7280" }}>{copied===k.id?<Check size={13}/>:<Copy size={13}/>}</button>
                        <button onClick={()=>deleteDoc(doc(db,"keys",String(k.id)))} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280" }}><Trash2 size={13}/></button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* OTORGADAS */}
            {adminTab==="granted"&&(
              <>
                <div style={{ marginBottom:20 }}><h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Cuentas Otorgadas</h2><p style={{ color:"#6b7280",margin:0,fontSize:12 }}>{granted.length} registros</p></div>
                {granted.length===0?<div style={{ textAlign:"center",color:"#4b5563",padding:"60px 0" }}>Sin cuentas otorgadas.</div>:(
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {granted.map(g=>{ const plat=PLATFORMS.find(p=>p.id===g.plataforma); return (
                      <div key={g.id} style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:12,padding:14 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8 }}>
                          <PlatformIcon id={g.plataforma} size={28}/>
                          <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{plat?.name}</div><div style={{ fontSize:11,color:"#6b7280" }}>Key: {g.keyCodigo} · {g.otorgadaEnFmt}{g.clienteEmail?` · ${g.clienteEmail}`:""}</div></div>
                          <Badge color="purple" dot>otorgada</Badge>
                          <button onClick={()=>deleteDoc(doc(db,"granted",String(g.id)))} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280" }}><Trash2 size={13}/></button>
                        </div>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                          <div style={{ background:"#08080f",border:"1px solid #ffffff08",borderRadius:8,padding:"8px 12px",fontSize:12 }}>
                            <div style={{ color:"#6b7280",marginBottom:2 }}>📧 Email</div>
                            <div style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ flex:1,wordBreak:"break-all" }}>{g.email}</span><button onClick={()=>copyText(g.email,`ge-${g.id}`)} style={{ background:"none",border:"none",cursor:"pointer",color:copied===`ge-${g.id}`?"#4ade80":"#6b7280" }}>{copied===`ge-${g.id}`?<Check size={12}/>:<Copy size={12}/>}</button></div>
                          </div>
                          <div style={{ background:"#08080f",border:"1px solid #ffffff08",borderRadius:8,padding:"8px 12px",fontSize:12 }}>
                            <div style={{ color:"#6b7280",marginBottom:2 }}>🔑 Contraseña</div>
                            <div style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ flex:1,fontFamily:"monospace" }}>{g.password}</span><button onClick={()=>copyText(g.password,`gp-${g.id}`)} style={{ background:"none",border:"none",cursor:"pointer",color:copied===`gp-${g.id}`?"#4ade80":"#6b7280" }}>{copied===`gp-${g.id}`?<Check size={12}/>:<Copy size={12}/>}</button></div>
                          </div>
                        </div>
                      </div>
                    ); })}
                  </div>
                )}
              </>
            )}

            {/* CONFIG */}
            {adminTab==="settings"&&(
              <>
                <h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 2px" }}>Configuración</h2>
                <p style={{ color:"#6b7280",margin:"0 0 24px",fontSize:12 }}>Notificaciones y seguridad</p>
                <div style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:20,marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}><Bell size={18} color="#4ade80"/><div><div style={{ fontWeight:700,fontSize:14 }}>Notificaciones Push</div><div style={{ fontSize:11,color:"#6b7280" }}>ntfy.sh · Topic: {NTFY_TOPIC}</div></div></div>
                  <Btn variant="success" onClick={async()=>{ await pushNotify("🧪 Prueba","Notificaciones activas ✅"); toast("Enviado"); }}><Bell size={13}/> Probar</Btn>
                </div>
                <div style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:14,padding:20 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}><Key size={18} color="#c4b5fd"/><div style={{ fontWeight:700,fontSize:14 }}>Cambiar contraseña admin</div></div>
                  <Input label="Contraseña actual" type="password" placeholder="••••••••" value={newPass.current} onChange={e=>setNewPass(p=>({...p,current:e.target.value}))}/>
                  <Input label="Nueva contraseña" type="password" placeholder="Mínimo 6 caracteres" value={newPass.next} onChange={e=>setNewPass(p=>({...p,next:e.target.value}))}/>
                  <Input label="Confirmar" type="password" placeholder="Repite" value={newPass.confirm} onChange={e=>setNewPass(p=>({...p,confirm:e.target.value}))}/>
                  <Btn onClick={changePass}><Key size={13}/> Actualizar</Btn>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ═══ MODALES ═══ */}

      {/* Ver plataforma */}
      {modal==="view"&&selPlatform&&clientUser&&(
        <Modal title={selPlatform.name} sub={selPlatform.desc} onClose={()=>setModal(null)}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:16 }}><PlatformIcon id={selPlatform.id} size={56}/></div>
          {(()=>{ const avail=(accounts[selPlatform.id]||[]).filter(a=>a.status==="disponible").length; return avail>0?<div style={{ background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:10,marginBottom:14,textAlign:"center" }}><div style={{ fontSize:13,color:"#4ade80",fontWeight:700 }}>✅ {avail} cuenta{avail!==1?"s":""} disponible{avail!==1?"s":""}</div></div>:<div style={{ background:"#1a0000",border:"1px solid #7f1d1d33",borderRadius:10,padding:12,marginBottom:14,textAlign:"center" }}><div style={{ fontSize:13,color:"#fca5a5" }}>Sin stock actualmente</div></div>; })()}
          <div style={{ background:"#0c1a3a",border:"1px solid #1e3a8a",borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:13,color:"#93c5fd",lineHeight:1.7 }}>
            🔑 Necesitas una key exclusiva para {selPlatform.name}.<br/>
            Al activarla, se te asigna una cuenta automáticamente.
          </div>
          <Btn onClick={()=>{ setModal("activarKey"); setKeyInput(""); setKeyError(""); }} style={{ width:"100%",justifyContent:"center" }}><Key size={14}/> Activar key para {selPlatform.name}</Btn>
        </Modal>
      )}

      {/* Activar key */}
      {modal==="activarKey"&&(
        <Modal title="Activar Key" sub="Ingresa tu key para acceder a la plataforma" onClose={()=>setModal(null)} width={400}>
          <div style={{ background:"#0c1a3a",border:"1px solid #1e3a8a",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#93c5fd" }}>
            🔑 La key abre solo la plataforma para la que fue generada.
          </div>
          <Input label="Tu Key" placeholder="Ej: SV-NETF-A1B2C3" value={keyInput} onChange={e=>{ setKeyInput(e.target.value.toUpperCase()); setKeyError(""); }} style={{ fontFamily:"monospace",fontSize:18,letterSpacing:3,textAlign:"center" }}/>
          {keyError&&<p style={{ color:"#f87171",fontSize:13,margin:"-8px 0 12px",textAlign:"center" }}>❌ {keyError}</p>}
          <Btn onClick={activarKey} style={{ width:"100%",justifyContent:"center",padding:"13px 0" }} disabled={keyLoading}>
            {keyLoading?"Verificando...":<><Unlock size={15}/> Activar y ver mi cuenta</>}
          </Btn>
        </Modal>
      )}

      {/* Agregar cuenta */}
      {modal==="addAccount"&&isAdmin&&(
        <Modal title="Agregar Cuenta" onClose={()=>setModal(null)}>
          <Select label="Plataforma *" value={newAcc.platform} onChange={e=>setNewAcc(a=>({...a,platform:e.target.value}))}><option value="">Seleccionar</option>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Input label="Email *" type="text" placeholder="correo@ejemplo.com" value={newAcc.email} onChange={e=>setNewAcc(a=>({...a,email:e.target.value}))}/>
          <Input label="Contraseña *" type="text" placeholder="Contraseña" value={newAcc.password} onChange={e=>setNewAcc(a=>({...a,password:e.target.value}))}/>
          <Input label="Perfil (opcional)" placeholder="Perfil 1" value={newAcc.profile} onChange={e=>setNewAcc(a=>({...a,profile:e.target.value}))}/>
          <Input label="Vencimiento" type="date" value={newAcc.expiresAt} onChange={e=>setNewAcc(a=>({...a,expiresAt:e.target.value}))}/>
          <div style={{ display:"flex",gap:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{ flex:1,justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={addAccount} style={{ flex:2,justifyContent:"center" }}><Plus size={13}/> Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Asignar cuenta */}
      {assignModal&&(
        <Modal title="Asignar cuenta" onClose={()=>setAssignModal(null)} width={340}>
          <Input label="Nombre del cliente" placeholder="Ej: María García" value={assignName} onChange={e=>setAssignName(e.target.value)}/>
          <div style={{ display:"flex",gap:8 }}>
            <Btn variant="ghost" onClick={()=>setAssignModal(null)} style={{ flex:1,justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={assignAccount} style={{ flex:2,justifyContent:"center" }}><UserCheck size={13}/> Asignar</Btn>
          </div>
        </Modal>
      )}

      {/* Crear usuario */}
      {modal==="newUser"&&isAdmin&&(
        <Modal title="Crear Usuario" sub="El cliente usará estas credenciales para entrar a la web" onClose={()=>setModal(null)} width={420}>
          <Input label="Nombre completo *" placeholder="Ej: Juan Pérez" value={newUser.nombre} onChange={e=>setNewUser(u=>({...u,nombre:e.target.value}))}/>

          {/* Botón generar automático */}
          <Btn variant="amber" small onClick={()=>{
            const adj=["fast","cool","dark","neo","pro","sky","vip","top","max","ultra"];
            const noun=["stream","vault","user","play","flex","wave","hub","link","net","plus"];
            const num=Math.floor(Math.random()*9000)+1000;
            const pass=Math.random().toString(36).slice(2,6).toUpperCase()+Math.random().toString(36).slice(2,6)+num;
            const email=`${adj[Math.floor(Math.random()*adj.length)]}${noun[Math.floor(Math.random()*noun.length)]}${num}@streamvault.app`;
            setNewUser(u=>({...u,email,password:pass}));
          }} style={{ width:"100%",justifyContent:"center",marginBottom:12 }}>
            <RefreshCw size={13}/> Generar email y contraseña automáticos
          </Btn>

          <Input label="Email *" type="text" placeholder="juan@email.com" value={newUser.email} onChange={e=>setNewUser(u=>({...u,email:e.target.value}))}/>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12,color:"#9ca3af",display:"block",marginBottom:6,fontWeight:600 }}>Contraseña *</label>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <input type="text" placeholder="Contraseña para el cliente" value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))} style={{ flex:1,background:"#080812",border:"1px solid #ffffff18",borderRadius:10,padding:"10px 13px",color:"#f0f0f5",fontSize:14,outline:"none",fontFamily:"monospace" }}/>
              <button onClick={()=>copyText(`Email: ${newUser.email}\nContraseña: ${newUser.password}`,"newUserCreds")} style={{ background:"none",border:"1px solid #ffffff18",borderRadius:10,padding:"10px",cursor:"pointer",color:copied==="newUserCreds"?"#4ade80":"#6b7280",display:"flex",alignItems:"center" }}>
                {copied==="newUserCreds"?<Check size={14}/>:<Copy size={14}/>}
              </button>
            </div>
          </div>

          {newUser.email&&newUser.password&&(
            <div style={{ background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#4ade80",lineHeight:1.8 }}>
              ✅ <strong>Credenciales listas para enviar:</strong><br/>
              📧 Email: <code style={{ background:"#0a3a1a",borderRadius:4,padding:"1px 6px" }}>{newUser.email}</code><br/>
              🔑 Contraseña: <code style={{ background:"#0a3a1a",borderRadius:4,padding:"1px 6px" }}>{newUser.password}</code>
              <button onClick={()=>copyText(`Email: ${newUser.email}\nContraseña: ${newUser.password}`,"newUserCreds")} style={{ background:"none",border:"none",cursor:"pointer",color:copied==="newUserCreds"?"#4ade80":"#86efac",marginLeft:8,fontSize:11 }}>
                {copied==="newUserCreds"?"¡Copiado!":"Copiar todo"}
              </button>
            </div>
          )}

          <div style={{ display:"flex",gap:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{ flex:1,justifyContent:"center" }}>Cancelar</Btn>
            <Btn onClick={createUser} style={{ flex:2,justifyContent:"center" }}><Plus size={13}/> Crear usuario</Btn>
          </div>
        </Modal>
      )}

      {/* Dar key a usuario */}
      {modal==="userKey"&&isAdmin&&(
        <Modal title={`Dar Key a ${newUser._nombre}`} sub="Genera y asigna una key directamente al usuario" onClose={()=>setModal(null)} width={380}>
          <Select label="Plataforma" value={newUserKeyPlat} onChange={e=>setNewUserKeyPlat(e.target.value)}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select label="Duración" value={newUserKeyDur} onChange={e=>setNewUserKeyDur(e.target.value)}><option value="1h">1 hora</option><option value="6h">6 horas</option><option value="12h">12 horas</option><option value="1d">1 día</option><option value="3d">3 días</option><option value="7d">7 días</option><option value="15d">15 días</option><option value="30d">30 días</option><option value="ilimitada">Ilimitada</option></Select>
          <Btn onClick={async()=>{ const codigo=await generateKeyForUser(newUser._uid,newUserKeyPlat,newUserKeyDur); setModal(null); toast(`Key ${codigo} asignada a ${newUser._nombre}`); }} style={{ width:"100%",justifyContent:"center" }}><Key size={14}/> Generar y asignar key</Btn>
        </Modal>
      )}

      {/* ═══ SECCIONES HOME (solo para clientes logueados) ═══ */}
      {(view==="home")&&clientUser&&(
        <div style={{ maxWidth:"100%", padding:"0 16px 40px" }}>

          {/* CÓMO FUNCIONA */}
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"inline-block", background:"#1e1e2e", border:"1px solid #6366f133", borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>¿Cómo funciona?</div>
              <h2 style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:800, margin:0, letterSpacing:-0.5 }}>Simple y rápido</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
              {[
                { n:"1", icon:"💬", title:"Contáctanos", desc:"Escríbenos por Telegram o WhatsApp y elige tu plan." },
                { n:"2", icon:"💳", title:"Realiza tu pago", desc:"Paga de forma segura y recibe tus credenciales al instante." },
                { n:"3", icon:"🔑", title:"Activa tu key", desc:"Ingresa tu key en la web y accede a tu cuenta asignada." },
                { n:"4", icon:"🎬", title:"Disfruta", desc:"Mira tu contenido favorito sin interrupciones ni anuncios." },
              ].map(s=>(
                <div key={s.n} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, padding:20, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-10, right:-10, fontSize:60, opacity:0.04, fontWeight:900 }}>{s.n}</div>
                  <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRECIOS */}
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"inline-block", background:"#1e1e2e", border:"1px solid #6366f133", borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>Precios</div>
              <h2 style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:800, margin:"0 0 6px", letterSpacing:-0.5 }}>Planes accesibles</h2>
              <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Acceso a todas las plataformas disponibles</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, maxWidth:800, margin:"0 auto" }}>
              {[
                { plan:"1 Mes", precio:"S/. 10", tag:null, color:"#6366f1", desc:"Perfecto para probar el servicio", features:["Acceso completo", "1 cuenta asignada", "Soporte por Telegram"] },
                { plan:"3 Meses", precio:"S/. 30", tag:"Más popular", color:"#a855f7", desc:"El plan favorito de nuestros clientes", features:["Acceso completo", "1 cuenta asignada", "Soporte prioritario", "Renovación garantizada"] },
                { plan:"6 Meses", precio:"S/. 60", tag:"Mejor precio", color:"#ec4899", desc:"Ahorra más con el plan completo", features:["Acceso completo", "1 cuenta asignada", "Soporte VIP 24/7", "Renovación garantizada", "Precio por mes más bajo"] },
              ].map(p=>(
                <div key={p.plan} style={{ background:"#0f0f1a", border:`1px solid ${p.color}44`, borderRadius:18, padding:22, position:"relative", overflow:"hidden" }}>
                  {p.tag&&<div style={{ position:"absolute", top:14, right:14, background:`linear-gradient(135deg,${p.color},${p.color}88)`, borderRadius:999, padding:"2px 10px", fontSize:10, fontWeight:700, color:"#fff" }}>{p.tag}</div>}
                  <div style={{ position:"absolute", top:-20, left:-20, width:80, height:80, borderRadius:"50%", background:p.color, opacity:0.08 }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:p.color, marginBottom:4 }}>{p.plan}</div>
                  <div style={{ fontSize:32, fontWeight:900, marginBottom:4, letterSpacing:-1 }}>{p.precio}</div>
                  <div style={{ fontSize:11, color:"#6b7280", marginBottom:14 }}>{p.desc}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
                    {p.features.map(f=><div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#d1d5db" }}><Check size={12} color={p.color}/>{f}</div>)}
                  </div>
                  <Btn onClick={()=>window.open(`https://wa.me/51901815489?text=Hola! Quiero el plan de ${p.plan} por ${p.precio}`, "_blank")} style={{ width:"100%", justifyContent:"center", background:`linear-gradient(135deg,${p.color},${p.color}88)`, border:"none", fontSize:13 }}>
                    Contratar ahora
                  </Btn>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIOS */}
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"inline-block", background:"#1e1e2e", border:"1px solid #6366f133", borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>Testimonios</div>
              <h2 style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:800, margin:0, letterSpacing:-0.5 }}>Lo que dicen nuestros clientes</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
              {[
                { nombre:"Carlos M.", plat:"Netflix", texto:"Increíble servicio, recibí mi cuenta en minutos. Ya llevo 3 meses y todo perfecto.", stars:5 },
                { nombre:"Ana R.", plat:"Spotify", texto:"Muy fácil de usar la web. La clave llegó rápido y funciona sin problemas.", stars:5 },
                { nombre:"Luis P.", plat:"Disney+", texto:"Excelente precio y atención. El admin responde al instante por Telegram.", stars:5 },
                { nombre:"María G.", plat:"Max", texto:"Ya voy por mi segundo mes. Recomendado 100% para quien quiere streaming barato.", stars:5 },
              ].map((t,i)=>(
                <div key={i} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", gap:2, marginBottom:10 }}>{[...Array(t.stars)].map((_,j)=><span key={j} style={{ color:"#fbbf24", fontSize:14 }}>★</span>)}</div>
                  <p style={{ fontSize:13, color:"#d1d5db", lineHeight:1.65, margin:"0 0 14px", fontStyle:"italic" }}>"{t.texto}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>{t.nombre[0]}</div>
                    <div><div style={{ fontSize:13, fontWeight:700 }}>{t.nombre}</div><div style={{ fontSize:11, color:"#6b7280" }}>Usuario de {t.plat}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom:48, maxWidth:700, margin:"0 auto 48px" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"inline-block", background:"#1e1e2e", border:"1px solid #6366f133", borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>FAQ</div>
              <h2 style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:800, margin:0, letterSpacing:-0.5 }}>Preguntas frecuentes</h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { q:"¿Cómo recibo mi cuenta?", a:"Una vez que realizas el pago, te enviamos tus credenciales de acceso por Telegram o WhatsApp. Luego entras a la web, activas tu key y se te asigna una cuenta automáticamente." },
                { q:"¿Las cuentas son compartidas?", a:"Las cuentas pueden ser compartidas con otros usuarios. Cada cliente recibe un perfil exclusivo dentro de la cuenta para evitar interferencias." },
                { q:"¿Qué pasa si la cuenta deja de funcionar?", a:"Garantizamos el servicio durante todo tu plan. Si hay algún problema, te reemplazamos la cuenta sin costo adicional." },
                { q:"¿Puedo usarlo en mi celular y TV?", a:"Sí, puedes usar las credenciales en cualquier dispositivo: celular, tablet, computadora o smart TV." },
                { q:"¿Cómo renuevo mi plan?", a:"Simplemente contáctanos por Telegram o WhatsApp antes de que venza tu plan y te generamos una nueva key de acceso." },
                { q:"¿Cuáles son los métodos de pago?", a:"Aceptamos transferencias bancarias, Yape, Plin y otros métodos de pago disponibles en Perú. Contáctanos para más detalles." },
              ].map((f,i)=>(
                <details key={i} style={{ background:"#0f0f1a", border:"1px solid #ffffff0e", borderRadius:12, overflow:"hidden" }}>
                  <summary style={{ padding:"14px 16px", fontWeight:600, fontSize:14, cursor:"pointer", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    {f.q} <span style={{ color:"#6366f1", fontSize:18 }}>+</span>
                  </summary>
                  <div style={{ padding:"0 16px 14px", fontSize:13, color:"#9ca3af", lineHeight:1.7 }}>{f.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* CONTADOR ANIMADO */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:48 }}>
            {[
              {label:"Clientes satisfechos",value:users.length+48,icon:"😊",color:"#6366f1"},
              {label:"Cuentas disponibles",value:availableAcc,icon:"✅",color:"#1DB954"},
              {label:"Plataformas",value:12,icon:"🎬",color:"#a855f7"},
              {label:"Años de servicio",value:2,icon:"⭐",color:"#fbbf24"},
            ].map(s=>(
              <div key={s.label} style={{ background:"#0f0f1a",border:,borderRadius:16,padding:"20px 16px",textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:36,fontWeight:900,color:s.color,letterSpacing:-1,animation:"fadeIn 0.5s ease" }}>{s.value}+</div>
                <div style={{ fontSize:12,color:"#6b7280",marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* LOGOS ANIMADOS */}
          <div style={{ marginBottom:48,overflow:"hidden" }}>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <p style={{ color:"#6b7280",fontSize:13,margin:0 }}>Plataformas disponibles en StreamVault</p>
            </div>
            <div style={{ display:"flex",animation:"marquee 20s linear infinite",width:"max-content" }}>
              {[...PLATFORMS,...PLATFORMS].map((p,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8,margin:"0 16px",background:"#0f0f1a",border:,borderRadius:12,padding:"8px 14px",flexShrink:0 }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#fff" }}>{p.icon}</div>
                  <span style={{ fontSize:13,fontWeight:600,whiteSpace:"nowrap" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GARANTÍA */}
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center",marginBottom:24 }}>
              <div style={{ display:"inline-block",background:"#1e1e2e",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10 }}>Garantía</div>
              <h2 style={{ fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:0 }}>Tu satisfacción es nuestra prioridad</h2>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14 }}>
              {[
                {icon:"🔄",title:"Reemplazo garantizado",desc:"Si tu cuenta deja de funcionar, la reemplazamos sin costo adicional en menos de 24 horas."},
                {icon:"💰",title:"Reembolso disponible",desc:"Si no puedes acceder a tu cuenta en los primeros 3 días, te devolvemos tu dinero."},
                {icon:"🔒",title:"Datos seguros",desc:"Tus credenciales están protegidas. Nunca compartimos tu información con terceros."},
                {icon:"⚡",title:"Soporte inmediato",desc:"Respondemos en menos de 1 hora por Telegram y WhatsApp, todos los días."},
              ].map((g,i)=>(
                <div key={i} style={{ background:"#0f0f1a",border:"1px solid #052e1688",borderRadius:16,padding:20,display:"flex",gap:12,alignItems:"flex-start" }}>
                  <div style={{ fontSize:28,flexShrink:0 }}>{g.icon}</div>
                  <div><div style={{ fontWeight:700,fontSize:14,marginBottom:5,color:"#4ade80" }}>{g.title}</div><div style={{ fontSize:12,color:"#6b7280",lineHeight:1.6 }}>{g.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* SISTEMA DE REFERIDOS */}
          <div style={{ background:"linear-gradient(135deg,#1a0a2e,#0c1a3a)",border:"1px solid #6366f133",borderRadius:20,padding:28,marginBottom:48,textAlign:"center" }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🎁</div>
            <h2 style={{ fontSize:22,fontWeight:800,margin:"0 0 8px" }}>Sistema de Referidos</h2>
            <p style={{ color:"#9ca3af",fontSize:14,margin:"0 0 16px" }}>¡Recomienda StreamVault y gana recompensas!</p>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20 }}>
              {[
                {icon:"👥",title:"Comparte tu link",desc:"Comparte nuestro sitio con tus amigos y familiares."},
                {icon:"✅",title:"Tu amigo se suscribe",desc:"Cuando tu amigo compra cualquier plan."},
                {icon:"🎉",title:"Ambos ganan",desc:"Tú y tu amigo reciben 1 semana GRATIS."},
              ].map((r,i)=>(
                <div key={i} style={{ background:"#ffffff08",borderRadius:12,padding:14 }}>
                  <div style={{ fontSize:24,marginBottom:8 }}>{r.icon}</div>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:4 }}>{r.title}</div>
                  <div style={{ fontSize:11,color:"#6b7280",lineHeight:1.5 }}>{r.desc}</div>
                </div>
              ))}
            </div>
            <Btn onClick={()=>window.open("https://wa.me/51901815489?text=Hola! Quiero información sobre el sistema de referidos de StreamVault","_blank")} style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)",border:"none" }}>
              <Gift size={14}/> Unirme al programa de referidos
            </Btn>
          </div>

          {/* TÉRMINOS Y CONDICIONES */}
          <div style={{ marginBottom:48,maxWidth:700,margin:"0 auto 48px" }}>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <div style={{ display:"inline-block",background:"#1e1e2e",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10 }}>Legal</div>
              <h2 style={{ fontSize:"clamp(18px,3vw,28px)",fontWeight:800,margin:0 }}>Términos y Condiciones</h2>
            </div>
            <div style={{ background:"#0f0f1a",border:"1px solid #ffffff0e",borderRadius:16,padding:20,fontSize:12,color:"#9ca3af",lineHeight:1.8 }}>
              {[
                "1. El servicio de StreamVault proporciona acceso a cuentas de streaming de terceros. No somos afiliados oficiales de ninguna plataforma.",
                "2. Al contratar el servicio, el usuario acepta no cambiar contraseñas, emails ni datos de las cuentas asignadas.",
                "3. No está permitido compartir las credenciales recibidas con personas fuera del plan contratado.",
                "4. StreamVault garantiza el reemplazo de cuentas que dejen de funcionar por causas ajenas al usuario.",
                "5. El reembolso aplica únicamente si el servicio no puede ser prestado en los primeros 3 días.",
                "6. StreamVault se reserva el derecho de suspender el servicio a usuarios que incumplan estos términos.",
                "7. Los precios pueden cambiar con previo aviso de 48 horas por los canales de comunicación oficiales.",
                "8. Para dudas o reclamos, contactar al administrador por Telegram @alex_eren o WhatsApp +51 901 815 489.",
              ].map((t,i)=>(
                <p key={i} style={{ margin:"0 0 8px",paddingLeft:8,borderLeft:"2px solid #6366f133" }}>{t}</p>
              ))}
              <p style={{ margin:"12px 0 0",fontSize:11,color:"#4b5563" }}>Última actualización: Enero 2025 · Al usar el servicio, aceptas estos términos.</p>
            </div>
          </div>

          {/* CONTACTO */}
          <div style={{ background:"linear-gradient(135deg,#1a0a2e,#0c1a3a)", border:"1px solid #6366f133", borderRadius:20, padding:28, textAlign:"center", maxWidth:600, margin:"0 auto" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>💬</div>
            <h2 style={{ fontSize:22, fontWeight:800, margin:"0 0 8px" }}>¿Tienes alguna duda?</h2>
            <p style={{ color:"#9ca3af", fontSize:14, margin:"0 0 20px" }}>Estamos disponibles para ayudarte por Telegram y WhatsApp</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <Btn onClick={()=>window.open("https://t.me/alex_eren","_blank")} style={{ background:"linear-gradient(135deg,#0088cc,#006699)", border:"none" }}>
                <Send size={14}/> Telegram @alex_eren
              </Btn>
              <Btn onClick={()=>window.open("https://wa.me/51901815489","_blank")} style={{ background:"linear-gradient(135deg,#25D366,#128C7E)", border:"none" }}>
                <Send size={14}/> WhatsApp
              </Btn>
            </div>
          </div>
        </div>
      )}

      </div>{/* end zIndex wrapper */}

      <style>{`
        *{box-sizing:border-box}
        input::placeholder{color:#4b5563}
        select option{background:#0f0f1a}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#080810}
        ::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:3px}
        details summary::-webkit-details-marker{display:none}
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.05)}}
        @keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,30px) scale(1.08)}}
        @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,40px) scale(0.95)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes slideDown{from{transform:translateY(-40px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes bannerPulse{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
      `}</style>
    </div>
  );
}
/ /   u p d a t e  
 