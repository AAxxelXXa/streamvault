import { useState, useEffect, useRef } from "react";
import {
  Shield, Plus, LogOut, Send, Check, X, Eye, EyeOff, ChevronRight,
  Package, Bell, Trash2, Copy, Search, Calendar, Key, AlertTriangle,
  UserCheck, ToggleLeft, ToggleRight, Lock, Unlock, Clock, Users,
  RefreshCw, Star, Gift, FileText, Zap, MessageCircle, Tag,
  Activity, User, Moon, Sun, Ticket, Camera, ChevronDown
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, setDoc, deleteDoc,
  onSnapshot, updateDoc, serverTimestamp
} from "firebase/firestore";

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
const ADMIN_TELEGRAM = "https://t.me/Jagerchk_bot";
const ADMIN_WA = "https://wa.me/51901815489";

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
  { id:"netflix",     name:"Netflix",        icon:"N",   color:"#E50914", desc:"Series, películas y documentales",  url:"https://www.netflix.com/login",         steps:["Abre Netflix","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Selecciona tu perfil asignado"] },
  { id:"disney",      name:"Disney+",         icon:"D+",  color:"#006E99", desc:"Disney, Marvel, Star Wars, Pixar",  url:"https://www.disneyplus.com/login",      steps:["Abre Disney+","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Selecciona tu perfil"] },
  { id:"max",         name:"Max",             icon:"MAX", color:"#3B5BDB", desc:"HBO, series premium y más",          url:"https://play.max.com/",                 steps:["Abre Max","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Selecciona tu perfil asignado"] },
  { id:"prime",       name:"Prime Video",     icon:"▶",   color:"#00A8E1", desc:"Amazon Prime Video originals",       url:"https://www.primevideo.com/",           steps:["Abre Prime Video","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Disfruta el contenido"] },
  { id:"spotify",     name:"Spotify",         icon:"♫",   color:"#1DB954", desc:"Música y podcasts sin anuncios",    url:"https://open.spotify.com/",            steps:["Abre Spotify","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","No cambies la contraseña"] },
  { id:"appletv",     name:"Apple TV+",       icon:"tv",  color:"#888888", desc:"Originales exclusivos de Apple",    url:"https://tv.apple.com/",                steps:["Abre Apple TV+","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Disfruta el contenido"] },
  { id:"paramount",   name:"Paramount+",      icon:"P+",  color:"#0064FF", desc:"CBS, MTV, Nickelodeon y más",       url:"https://www.paramountplus.com/",        steps:["Abre Paramount+","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Selecciona tu perfil"] },
  { id:"crunchyroll", name:"Crunchyroll",     icon:"CR",  color:"#F47521", desc:"Anime en español e inglés",         url:"https://www.crunchyroll.com/login",     steps:["Abre Crunchyroll","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Disfruta el anime"] },
  { id:"youtube",     name:"YouTube Premium", icon:"YT",  color:"#FF0000", desc:"Sin anuncios + YouTube Music",      url:"https://www.youtube.com/",             steps:["Abre YouTube","Inicia sesión con el email","Verifica que aparezca Premium","No cambies ningún dato"] },
  { id:"star",        name:"Star+",           icon:"★+",  color:"#A52FAB", desc:"Fox, ESPN, National Geographic",    url:"https://www.starplus.com/",            steps:["Abre Star+","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Selecciona tu perfil"] },
  { id:"mubi",        name:"MUBI",            icon:"M",   color:"#37B6FF", desc:"Cine de autor y festivales",        url:"https://mubi.com/",                    steps:["Abre MUBI","Clic en 'Iniciar sesión'","Ingresa el email y contraseña","Disfruta el cine de autor"] },
  { id:"hulu",        name:"Hulu",            icon:"H",   color:"#1CE783", desc:"Series, películas y TV en vivo",    url:"https://www.hulu.com/welcome",         steps:["Abre Hulu","Clic en 'Log In'","Ingresa el email y contraseña","Selecciona tu perfil"] },
];

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("es-PE",{day:"2-digit",month:"short",year:"numeric"}); }
function genKeyCode(plat) { return `SV-${plat.toUpperCase().slice(0,4)}-${Math.random().toString(36).substring(2,8).toUpperCase()}`; }
function timeLeft(exp) {
  if (!exp) return "Ilimitada";
  const diff = new Date(exp) - new Date();
  if (diff <= 0) return "Expirada";
  const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
  if (h>0) return `${h}h ${m}m`; if (m>0) return `${m}m ${s}s`; return `${s}s`;
}
function countdownStr(end) {
  if (!end) return null;
  const diff = new Date(end) - new Date();
  if (diff <= 0) return "Oferta expirada";
  const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
  if (d>0) return `${d}d ${h}h ${m}m`;
  if (h>0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// ── UI ────────────────────────────────────────────────────
function PlatformIcon({id,size=44}) {
  const p=PLATFORMS.find(x=>x.id===id)||{};
  return <div style={{width:size,height:size,borderRadius:12,flexShrink:0,background:p.color||"#333",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:size*0.28,color:"#fff",letterSpacing:-1,boxShadow:`0 0 18px ${p.color||"#333"}44`}}>{p.icon||"?"}</div>;
}

function Badge({children,color="gray",dot}) {
  const C={green:{bg:"#052e16",text:"#4ade80",border:"#166534"},red:{bg:"#450a0a",text:"#f87171",border:"#7f1d1d"},blue:{bg:"#0c1a3a",text:"#60a5fa",border:"#1e3a8a"},amber:{bg:"#1a0f00",text:"#fbbf24",border:"#78350f"},gray:{bg:"#1c1c1c",text:"#9ca3af",border:"#374151"},purple:{bg:"#1a0a2e",text:"#c4b5fd",border:"#4c1d95"}};
  const c=C[color]||C.gray;
  return <span style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>{dot&&<span style={{width:6,height:6,borderRadius:"50%",background:c.text}}/>}{children}</span>;
}

function Input({label,dark=true,...props}) {
  const bg = dark ? "#080812" : "#f8f9fa";
  const color = dark ? "#f0f0f5" : "#111";
  const border = dark ? "1px solid #ffffff18" : "1px solid #e5e7eb";
  return <div style={{marginBottom:14}}>{label&&<label style={{fontSize:12,color:dark?"#9ca3af":"#6b7280",display:"block",marginBottom:6,fontWeight:600}}>{label}</label>}<input {...props} style={{width:"100%",background:bg,border,borderRadius:10,padding:"10px 13px",color,fontSize:14,outline:"none",boxSizing:"border-box",...(props.style||{})}} onFocus={e=>e.target.style.border="1px solid #6366f166"} onBlur={e=>e.target.style.border=border}/></div>;
}

function Select({label,children,dark=true,...props}) {
  const bg=dark?"#080812":"#f8f9fa"; const color=dark?"#f0f0f5":"#111"; const border=dark?"1px solid #ffffff18":"1px solid #e5e7eb";
  return <div style={{marginBottom:14}}>{label&&<label style={{fontSize:12,color:dark?"#9ca3af":"#6b7280",display:"block",marginBottom:6,fontWeight:600}}>{label}</label>}<select {...props} style={{width:"100%",background:bg,border,borderRadius:10,padding:"10px 13px",color,fontSize:14,outline:"none",boxSizing:"border-box"}}>{children}</select></div>;
}

function Btn({children,variant="primary",small,...props}) {
  const V={primary:{background:"linear-gradient(135deg,#6366f1,#a855f7)",color:"#fff",border:"none"},ghost:{background:"transparent",color:"#9ca3af",border:"1px solid #ffffff18"},danger:{background:"#450a0a",color:"#f87171",border:"1px solid #7f1d1d"},success:{background:"#052e16",color:"#4ade80",border:"1px solid #166534"},amber:{background:"#1a0f00",color:"#fbbf24",border:"1px solid #78350f"}};
  const v=V[variant]||V.primary;
  return <button {...props} style={{...v,borderRadius:10,padding:small?"6px 12px":"10px 18px",fontWeight:600,fontSize:small?12:14,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,transition:"opacity 0.15s",...(props.style||{})}} onMouseEnter={e=>e.currentTarget.style.opacity="0.82"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}

function Modal({title,sub,onClose,children,width=460,dark=true}) {
  const bg=dark?"#0f0f1a":"#fff"; const border=dark?"1px solid #ffffff15":"1px solid #e5e7eb"; const titleColor=dark?"#f0f0f5":"#111"; const subColor=dark?"#6b7280":"#9ca3af";
  return <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}><div style={{background:bg,border,borderRadius:22,padding:28,width:"100%",maxWidth:width,boxShadow:"0 32px 80px #000000aa",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}><div><h2 style={{margin:0,fontSize:19,fontWeight:800,color:titleColor}}>{title}</h2>{sub&&<p style={{margin:"4px 0 0",fontSize:13,color:subColor}}>{sub}</p>}</div><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:2}}><X size={18}/></button></div>{children}</div></div>;
}

// Avatar component
function Avatar({user, size=36}) {
  if (user?.avatar) return <img src={user.avatar} alt="" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid #6366f1"}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:size*0.38,color:"#fff",flexShrink:0}}>{(user?.nombre||"U")[0].toUpperCase()}</div>;
}

// ── MAIN ─────────────────────────────────────────────────
export default function StreamVault() {
  // Theme
  const [darkMode, setDarkMode] = useState(true);
  const bg = darkMode ? "#080810" : "#f0f2f8";
  const cardBg = darkMode ? "#0f0f1a" : "#ffffff";
  const textColor = darkMode ? "#f0f0f5" : "#111827";
  const subText = darkMode ? "#6b7280" : "#9ca3af";
  const borderColor = darkMode ? "#ffffff0e" : "#e5e7eb";

  // Data
  const [accounts,    setAccounts]    = useState({});
  const [requests,    setRequests]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [keys,        setKeys]        = useState([]);
  const [granted,     setGranted]     = useState([]);
  const [users,       setUsers]       = useState([]);
  const [tickets,     setTickets]     = useState([]);
  const [chats,       setChats]       = useState([]);
  const [ofertas,     setOfertas]     = useState([]);
  const [discounts,   setDiscounts]   = useState([]);
  const [serviceStatus, setServiceStatus] = useState({ status:"online", msg:"Todos los servicios operativos" });
  const [settings,    setSettings]    = useState({ adminPass:"admin2024" });
  const [loading,     setLoading]     = useState(true);

  // Auth
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [clientUser,  setClientUser]  = useState(null);
  const [view,        setView]        = useState("clientLogin");
  const [adminTab,    setAdminTab]    = useState("accounts");

  // Sessions
  const [sessions,    setSessions]    = useState({});
  const [timers,      setTimers]      = useState({});
  const [activePlat,  setActivePlat]  = useState(null);
  const [countdown,   setCountdown]   = useState({});

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

  // Forms - user
  const [newUser,     setNewUser]     = useState({email:"",password:"",nombre:""});
  const [newUserKeyPlat, setNewUserKeyPlat] = useState("netflix");
  const [newUserKeyDur,  setNewUserKeyDur]  = useState("30d");
  const [editUser,    setEditUser]    = useState(null);

  // Forms - accounts
  const [newAcc,      setNewAcc]      = useState({email:"",password:"",profile:"",platform:"",expiresAt:""});
  const [editingAcc,  setEditingAcc]  = useState(null);
  const [newPass,     setNewPass]     = useState({current:"",next:"",confirm:""});
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

  // Discount
  const [discountInput, setDiscountInput] = useState("");
  const [discountResult,setDiscountResult]= useState(null);

  // Profile
  const [profilePass, setProfilePass] = useState({current:"",next:"",confirm:""});

  // Ticket
  const [newTicket,   setNewTicket]   = useState({asunto:"",mensaje:""});

  // ── Estados faltantes (payments, ratings, notifications, pay modal, rating modal) ──
  const [notifications,  setNotifications]  = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [ratings,        setRatings]        = useState([]);
  const [payModal,       setPayModal]       = useState(null);
  const [payCaptura,     setPayCaptura]     = useState(null);
  const [payStep,        setPayStep]        = useState(1);
  const [payUploading,   setPayUploading]   = useState(false);
  const [ratingModal,    setRatingModal]    = useState(null);
  const [ratingComment,  setRatingComment]  = useState("");
  const [ratingVal,      setRatingVal]      = useState(5);

  // Chat
  const [chatMsg,     setChatMsg]     = useState("");
  const [chatOpen,    setChatOpen]    = useState(false);
  const chatRef = useRef(null);

  // Oferta admin
  const [newOferta,   setNewOferta]   = useState({titulo:"",descripcion:"",badge:"",endsAt:"",activa:true});

  // Discount admin
  const [newDiscount, setNewDiscount] = useState({codigo:"",tipo:"porcentaje",valor:10,descripcion:""});

  // Status admin
  const [newStatus,   setNewStatus]   = useState({status:"online",msg:""});

  // ── Firebase ──
  useEffect(() => {
    const u=[];
    u.push(onSnapshot(collection(db,"accounts"), s=>{ const a={}; s.forEach(d=>{ a[d.id]=d.data().list||[]; }); setAccounts(a); }));
    u.push(onSnapshot(collection(db,"requests"), s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setRequests(r); }));
    u.push(onSnapshot(collection(db,"clients"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setClients(r); }));
    u.push(onSnapshot(collection(db,"keys"),     s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.creadaEn||0)-(a.creadaEn||0)); setKeys(r); }));
    u.push(onSnapshot(collection(db,"granted"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.otorgadaEn||0)-(a.otorgadaEn||0)); setGranted(r); }));
    u.push(onSnapshot(collection(db,"users"),    s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); setUsers(r); }));
    u.push(onSnapshot(collection(db,"tickets"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setTickets(r); }));
    u.push(onSnapshot(collection(db,"chats"),    s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0)); setChats(r); }));
    u.push(onSnapshot(collection(db,"ofertas"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.creadaEn||0)-(a.creadaEn||0)); setOfertas(r); }));
    u.push(onSnapshot(collection(db,"discounts"),s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); setDiscounts(r); }));
    u.push(onSnapshot(collection(db,"payments"), s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setPayments(r); }));
    u.push(onSnapshot(collection(db,"ratings"),  s=>{ const r=[]; s.forEach(d=>r.push({id:d.id,...d.data()})); r.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)); setRatings(r); }));
    u.push(onSnapshot(doc(db,"config","settings"),s=>{ if(s.exists()) setSettings(s.data()); }));
    u.push(onSnapshot(doc(db,"config","status"),  s=>{ if(s.exists()) setServiceStatus(s.data()); }));
    setLoading(false);
    return ()=>u.forEach(x=>x());
  },[]);

  // Restore session
  useEffect(() => {
    try {
      const saved=localStorage.getItem("sv_client");
      if (saved) { const u=JSON.parse(saved); setClientUser(u); setView("home"); }
      const savedS=localStorage.getItem("sv_sessions");
      if (savedS) setSessions(JSON.parse(savedS));
    } catch {}
  },[]);

  // Sync clientUser with latest Firebase data
  useEffect(() => {
    if (clientUser && users.length > 0) {
      const updated = users.find(u => u.id === clientUser.id);
      if (updated) {
        setClientUser(updated);
        localStorage.setItem("sv_client", JSON.stringify(updated));
      }
    }
  }, [users]);

  // Timers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = {};
      let changed = false;
      Object.entries(sessions).forEach(([plat,sess]) => {
        if (sess.expiraEn && new Date(sess.expiraEn) < now) { changed=true; }
        else { updated[plat]=sess; }
      });
      if (changed) { setSessions(updated); localStorage.setItem("sv_sessions",JSON.stringify(updated)); toast("⏰ Una sesión expiró","warn"); }
      const t={};
      Object.entries(updated).forEach(([plat,sess])=>{ t[plat]=timeLeft(sess.expiraEn); });
      setTimers(t);
      // Countdown for offers
      const cd={};
      ofertas.forEach(o=>{ if(o.activa&&o.endsAt) cd[o.id]=countdownStr(o.endsAt); });
      setCountdown(cd);
    },1000);
    return ()=>clearInterval(interval);
  },[sessions,ofertas]);

  // Chat scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  },[chats,chatOpen]);

  // ── Helpers ──
  async function fbSaveAccounts(u) { setAccounts(u); for (const [p,l] of Object.entries(u)) await setDoc(doc(db,"accounts",p),{list:l}); }
  async function fbSaveSettings(s) { setSettings(s); await setDoc(doc(db,"config","settings"),s); }
  function toast(msg,type="success") { setNotif({msg,type}); setTimeout(()=>setNotif(null),3200); }
  function copyText(text,k) { navigator.clipboard.writeText(text).then(()=>{ setCopied(k); setTimeout(()=>setCopied(null),2500); }); }

  // ── Client Auth ──
  async function clientLogin() {
    setCErr("");
    if (!cEmail.trim()||!cPass.trim()) { setCErr("Completa todos los campos"); return; }
    const found=users.find(u=>u.email.toLowerCase()===cEmail.toLowerCase().trim()&&u.password===cPass.trim());
    if (!found) { setCErr("Email o contraseña incorrectos"); return; }
    if (found.activo===false) { setCErr("Tu cuenta está desactivada. Contacta al admin."); return; }
    setClientUser(found);
    localStorage.setItem("sv_client",JSON.stringify(found));
    await updateDoc(doc(db,"users",found.id),{ultimoLogin:new Date().toISOString()});
    setView("home"); setCEmail(""); setCPass("");
    toast(`¡Bienvenido, ${found.nombre}! 👋`);
  }

  function clientLogout() {
    setClientUser(null); setSessions({}); setTimers({});
    localStorage.removeItem("sv_client"); localStorage.removeItem("sv_sessions");
    setView("clientLogin"); toast("Sesión cerrada");
  }

  // ── Admin Auth ──
  function adminLogin() {
    if (aPass===settings.adminPass) { setIsAdmin(true); setView("admin"); setAPass(""); setAErr(false); }
    else { setAErr(true); setTimeout(()=>setAErr(false),1400); }
  }
  function adminLogout() { setIsAdmin(false); setView(clientUser?"home":"clientLogin"); }

  function changeAdminPass() {
    if (newPass.current!==settings.adminPass) { toast("Contraseña actual incorrecta","error"); return; }
    if (newPass.next.length<6) { toast("Mínimo 6 caracteres","error"); return; }
    if (newPass.next!==newPass.confirm) { toast("Las contraseñas no coinciden","error"); return; }
    fbSaveSettings({...settings,adminPass:newPass.next});
    setNewPass({current:"",next:"",confirm:""}); toast("Contraseña actualizada");
  }

  // ── Client Profile ──
  async function changeClientPass() {
    if (!clientUser) return;
    if (profilePass.current!==clientUser.password) { toast("Contraseña actual incorrecta","error"); return; }
    if (profilePass.next.length<6) { toast("Mínimo 6 caracteres","error"); return; }
    if (profilePass.next!==profilePass.confirm) { toast("Las contraseñas no coinciden","error"); return; }
    await updateDoc(doc(db,"users",clientUser.id),{password:profilePass.next});
    setProfilePass({current:"",next:"",confirm:""}); toast("Contraseña actualizada");
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { toast("La imagen debe ser menor a 500KB","error"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      await updateDoc(doc(db,"users",clientUser.id),{avatar:base64});
      toast("Foto de perfil actualizada ✅");
    };
    reader.readAsDataURL(file);
  }

  // ── Users ──
  async function createUser() {
    if (!newUser.email||!newUser.password||!newUser.nombre) { toast("Completa todos los campos","error"); return; }
    if (users.find(u=>u.email.toLowerCase()===newUser.email.toLowerCase())) { toast("Ese email ya existe","error"); return; }
    const u={id:`user_${Date.now()}`,email:newUser.email.trim(),password:newUser.password.trim(),nombre:newUser.nombre.trim(),activo:true,creadoEn:new Date().toISOString(),ultimoLogin:null,keys:[],avatar:null};
    await setDoc(doc(db,"users",u.id),u);
    setNewUser({email:"",password:"",nombre:""}); setModal(null); toast(`Usuario ${u.nombre} creado`);
  }
  async function toggleUserActive(uid,current) { await updateDoc(doc(db,"users",uid),{activo:!current}); }
  async function deleteUser(uid) { await deleteDoc(doc(db,"users",uid)); toast("Usuario eliminado"); }
  async function generateKeyForUser(uid,plat,dur) {
    const codigo=genKeyCode(plat); let expiraEn=null,durTexto="Ilimitada";
    if (dur!=="ilimitada") { const match=dur.match(/^(\d+)(d|h|m)$/); if(match){const val=parseInt(match[1]),u2=match[2],ms=u2==="d"?val*86400000:u2==="h"?val*3600000:val*60000;expiraEn=new Date(Date.now()+ms).toISOString();durTexto=u2==="d"?`${val} día(s)`:u2==="h"?`${val} hora(s)`:`${val} minuto(s)`;} }
    const nk={id:Date.now(),codigo,plataforma:plat,duracion:durTexto,expiraEn,usada:false,creadaEn:Date.now(),asignadaA:uid};
    await setDoc(doc(db,"keys",String(nk.id)),nk);
    const user=users.find(u=>u.id===uid);
    if (user) { const userKeys=user.keys||[]; await updateDoc(doc(db,"users",uid),{keys:[...userKeys,{codigo,plataforma:plat,duracion:durTexto,expiraEn,asignadaEn:new Date().toISOString()}]}); }
    toast(`Key ${codigo} generada`); return codigo;
  }

  // ── Accounts ──
  async function addAccount() {
    if (!newAcc.email||!newAcc.password||!newAcc.platform) { toast("Completa los campos requeridos","error"); return; }
    const updated={...accounts};
    if (!updated[newAcc.platform]) updated[newAcc.platform]=[];
    updated[newAcc.platform]=[...updated[newAcc.platform],{...newAcc,id:Date.now(),status:"disponible",assignedTo:null}];
    await fbSaveAccounts(updated); setNewAcc({email:"",password:"",profile:"",platform:"",expiresAt:""}); setModal(null); toast("Cuenta agregada");
  }
  async function deleteAccount(platform,id) { const u={...accounts}; u[platform]=u[platform].filter(a=>a.id!==id); await fbSaveAccounts(u); }
  function startEdit(platform,id,field,value) { setEditingAcc({platform,id,field,value}); }
  async function saveEdit() {
    if (!editingAcc) return;
    const {platform,id,field,value}=editingAcc;
    const u={...accounts}; u[platform]=u[platform].map(a=>a.id===id?{...a,[field]:value}:a);
    await fbSaveAccounts(u); setEditingAcc(null); toast("Actualizado");
  }
  async function toggleStatus(platform,id) { const u={...accounts}; u[platform]=u[platform].map(a=>a.id===id?{...a,status:a.status==="disponible"?"ocupado":"disponible"}:a); await fbSaveAccounts(u); }
  async function assignAccount() {
    if (!assignName.trim()||!assignModal) return;
    const {platform,accId}=assignModal;
    const u={...accounts}; const acc=u[platform].find(a=>a.id===accId); if(!acc) return;
    u[platform]=u[platform].map(a=>a.id===accId?{...a,status:"ocupado",assignedTo:assignName.trim()}:a);
    await fbSaveAccounts(u);
    await setDoc(doc(db,"clients",String(Date.now())),{id:Date.now(),clientName:assignName.trim(),platform,accountEmail:acc.email,date:new Date().toLocaleDateString("es-PE"),action:"asignada",timestamp:Date.now()});
    setAssignModal(null); setAssignName(""); toast(`Asignada a ${assignName}`);
  }

  // ── Keys ──
  async function generateKey() {
    if (!genKeyPlat) { toast("Selecciona plataforma","error"); return; }
    const codigo=genKeyCode(genKeyPlat); let expiraEn=null,durTexto="Ilimitada";
    if (genKeyDur!=="ilimitada") { const match=genKeyDur.match(/^(\d+)(d|h|m)$/); if(match){const val=parseInt(match[1]),u=match[2],ms=u==="d"?val*86400000:u==="h"?val*3600000:val*60000;expiraEn=new Date(Date.now()+ms).toISOString();durTexto=u==="d"?`${val} día(s)`:u==="h"?`${val} hora(s)`:`${val} minuto(s)`;} }
    const nk={id:Date.now(),codigo,plataforma:genKeyPlat,duracion:durTexto,expiraEn,usada:false,creadaEn:Date.now()};
    await setDoc(doc(db,"keys",String(nk.id)),nk); setGenKeyResult(nk); toast(`Key: ${codigo}`);
  }

  // ── Activar Key ──
  async function activarKey() {
    if (!keyInput.trim()) return;
    setKeyLoading(true); setKeyError("");
    const found=keys.find(k=>k.codigo===keyInput.trim().toUpperCase()&&!k.usada);
    if (!found) { setKeyError("Key inválida o ya utilizada."); setKeyLoading(false); return; }
    if (found.expiraEn&&new Date()>new Date(found.expiraEn)) { await updateDoc(doc(db,"keys",String(found.id)),{usada:true}); setKeyError("Esta key ha expirado."); setKeyLoading(false); return; }
    const disponibles=(accounts[found.plataforma]||[]).filter(a=>a.status==="disponible");
    let cuentaAsignada=null;
    if (disponibles.length>0) {
      const randomAcc=disponibles[Math.floor(Math.random()*disponibles.length)];
      const g={id:Date.now(),plataforma:found.plataforma,email:randomAcc.email,password:randomAcc.password,profile:randomAcc.profile||"",keyCodigo:found.codigo,keyDuracion:found.duracion,otorgadaEn:Date.now(),otorgadaEnFmt:new Date().toLocaleString("es-PE"),clienteEmail:clientUser?.email||"anon"};
      await setDoc(doc(db,"granted",String(g.id)),g);
      const updated={...accounts}; updated[found.plataforma]=updated[found.plataforma].filter(a=>a.id!==randomAcc.id);
      await fbSaveAccounts(updated); cuentaAsignada=randomAcc;
    }
    await updateDoc(doc(db,"keys",String(found.id)),{usada:true,usadaEn:new Date().toISOString(),usadaPor:clientUser?.email||"anon"});
    const newSessions={...sessions,[found.plataforma]:{plataforma:found.plataforma,keyCodigo:found.codigo,duracion:found.duracion,expiraEn:found.expiraEn,cuenta:cuentaAsignada,iniciadaEn:new Date().toISOString()}};
    setSessions(newSessions); localStorage.setItem("sv_sessions",JSON.stringify(newSessions));
    const plat=PLATFORMS.find(p=>p.id===found.plataforma);
    setModal(null); setKeyInput(""); setKeyLoading(false); setActivePlat(found.plataforma); setView("platform");
    toast(`✅ Acceso a ${plat?.name} desbloqueado`);
  }

  function cerrarSesionPlat(platId) {
    const updated={...sessions}; delete updated[platId];
    setSessions(updated); localStorage.setItem("sv_sessions",JSON.stringify(updated));
    setView("home"); toast("Sesión cerrada");
  }

  // ── Discount codes ──
  async function checkDiscount() {
    if (!discountInput.trim()) return;
    const found=discounts.find(d=>d.codigo.toUpperCase()===discountInput.trim().toUpperCase()&&d.activo!==false);
    if (!found) { setDiscountResult({valido:false,msg:"Código inválido o expirado"}); return; }
    setDiscountResult({valido:true,tipo:found.tipo,valor:found.valor,descripcion:found.descripcion});
  }

  // ── Tickets ──
  async function submitTicket() {
    if (!newTicket.asunto||!newTicket.mensaje) { toast("Completa los campos","error"); return; }
    const t={id:Date.now(),asunto:newTicket.asunto,mensaje:newTicket.mensaje,clienteEmail:clientUser?.email,clienteNombre:clientUser?.nombre,estado:"abierto",timestamp:Date.now(),fecha:new Date().toLocaleString("es-PE")};
    await setDoc(doc(db,"tickets",String(t.id)),t);
    await pushNotify(`🎫 Nuevo ticket — ${clientUser?.nombre}`,`Asunto: ${t.asunto}\nMensaje: ${t.mensaje}`);
    setNewTicket({asunto:"",mensaje:""}); setModal(null); toast("Ticket enviado ✅");
  }
  async function closeTicket(id) { await updateDoc(doc(db,"tickets",String(id)),{estado:"cerrado"}); toast("Ticket cerrado"); }

  // ── Chat ──
  async function sendChat(e) {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const msg={id:Date.now(),texto:chatMsg.trim(),de:isAdmin?"admin":clientUser?.nombre||"cliente",deId:isAdmin?"admin":clientUser?.id,timestamp:Date.now(),hora:new Date().toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})};
    await setDoc(doc(db,"chats",String(msg.id)),msg);
    if (!isAdmin) await pushNotify(`💬 Mensaje de ${clientUser?.nombre}`,chatMsg.trim());
    setChatMsg("");
  }

  // ── Ofertas ──
  async function createOferta() {
    if (!newOferta.titulo) { toast("Agrega un título","error"); return; }
    const o={id:Date.now(),titulo:newOferta.titulo,descripcion:newOferta.descripcion,badge:newOferta.badge,endsAt:newOferta.endsAt||null,activa:true,creadaEn:Date.now()};
    await setDoc(doc(db,"ofertas",String(o.id)),o);
    setNewOferta({titulo:"",descripcion:"",badge:"",endsAt:"",activa:true}); toast("Oferta publicada ✅");
  }
  async function toggleOferta(id,current) { await updateDoc(doc(db,"ofertas",String(id)),{activa:!current}); }
  async function deleteOferta(id) { await deleteDoc(doc(db,"ofertas",String(id))); }

  // ── Discounts admin ──
  async function createDiscount() {
    if (!newDiscount.codigo) { toast("Agrega un código","error"); return; }
    const d={id:Date.now(),...newDiscount,codigo:newDiscount.codigo.toUpperCase(),activo:true,creadoEn:Date.now()};
    await setDoc(doc(db,"discounts",String(d.id)),d);
    setNewDiscount({codigo:"",tipo:"porcentaje",valor:10,descripcion:""}); toast("Código creado ✅");
  }

  // ── Check expiring keys (3 days) ──
  useEffect(() => {
    if (!clientUser) return;
    const userKeys = clientUser.keys || [];
    const notifs = [];
    userKeys.forEach(k => {
      if (!k.expiraEn) return;
      const diff = new Date(k.expiraEn) - new Date();
      const days = Math.ceil(diff / 86400000);
      if (days <= 3 && days > 0) {
        const platName = PLATFORMS.find(p=>p.id===k.plataforma)?.name || k.plataforma;
        notifs.push({ id: k.codigo, msg: `Tu acceso a ${platName} vence en ${days} día${days!==1?"s":""}`, type: "warn", plat: k.plataforma });
      }
    });
    setNotifications(notifs);
  }, [clientUser]);

  // ── Payments ──
  async function submitPayment() {
    if (!payCaptura || !payModal || !clientUser) return;
    setPayUploading(true);
    const payment = {
      id: Date.now(),
      clienteEmail: clientUser.email,
      clienteNombre: clientUser.nombre,
      clienteId: clientUser.id,
      plan: payModal.plan,
      meses: payModal.meses,
      precio: payModal.precio,
      captura: payCaptura,
      estado: "pendiente",
      timestamp: Date.now(),
      fecha: new Date().toLocaleString("es-PE"),
    };
    await setDoc(doc(db, "payments", String(payment.id)), payment);
    await pushNotify(
      "Nuevo pago de " + clientUser.nombre,
      "Plan: " + payModal.plan + " (" + payModal.precio + ") - Revisa el panel admin para aprobar."
    );
    setPayStep(3);
    setPayUploading(false);
  }

  async function approvePayment(payment) {
    await updateDoc(doc(db, "payments", String(payment.id)), { estado: "aprobado", aprobadoEn: new Date().toISOString() });
    const user = users.find(u => u.id === payment.clienteId);
    if (user) {
      const hist = user.pagos || [];
      await updateDoc(doc(db, "users", payment.clienteId), {
        pagos: [...hist, { plan: payment.plan, precio: payment.precio, fecha: payment.fecha, estado: "aprobado" }]
      });
    }
    toast("Pago de " + payment.clienteNombre + " aprobado ✅");
  }

  async function rejectPayment(id) {
    await updateDoc(doc(db, "payments", String(id)), { estado: "rechazado" });
    toast("Pago rechazado");
  }

  // ── Ratings ──
  async function submitRating() {
    if (!ratingModal || !clientUser) return;
    const r = {
      id: Date.now(),
      plataforma: ratingModal,
      clienteNombre: clientUser.nombre,
      clienteId: clientUser.id,
      estrellas: ratingVal,
      comentario: ratingComment,
      fecha: new Date().toLocaleDateString("es-PE"),
      timestamp: Date.now(),
    };
    await setDoc(doc(db, "ratings", String(r.id)), r);
    setRatingModal(null); setRatingComment(""); setRatingVal(5);
    toast("Gracias por tu calificacion! Estrellas: " + ratingVal);
  }

  // ── Service status ──
  async function updateStatus() {
    await setDoc(doc(db,"config","status"),newStatus);
    toast("Estado actualizado ✅");
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
  const activeOfertas=ofertas.filter(o=>o.activa);
  const myTickets=tickets.filter(t=>t.clienteEmail===clientUser?.email);
  const openTickets=tickets.filter(t=>t.estado==="abierto");
  const unreadChats=chats.filter(c=>c.de!=="admin"&&!isAdmin).length;

  const statusColors={online:"#1DB954",degraded:"#fbbf24",maintenance:"#f87171",offline:"#f87171"};
  const statusLabels={online:"✅ Todos los servicios operativos",degraded:"⚠️ Servicio degradado",maintenance:"🔧 En mantenimiento",offline:"❌ Servicio no disponible"};

  if (loading) return <div style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center",color:"#6366f1",fontSize:18,fontWeight:700,fontFamily:"system-ui"}}>Cargando StreamVault...</div>;

  return (
    <div style={{minHeight:"100vh",background:bg,color:textColor,fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative",transition:"background 0.3s,color 0.3s"}}>

      {/* Fondo animado */}
      {darkMode&&(
        <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
          <div style={{position:"absolute",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,#6366f118,transparent 70%)",top:"-200px",left:"-200px",animation:"float1 8s ease-in-out infinite"}}/>
          <div style={{position:"absolute",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,#a855f718,transparent 70%)",top:"30%",right:"-150px",animation:"float2 10s ease-in-out infinite"}}/>
          <div style={{position:"absolute",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,#ec489918,transparent 70%)",bottom:"-100px",left:"30%",animation:"float3 12s ease-in-out infinite"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#ffffff03 1px,transparent 1px),linear-gradient(90deg,#ffffff03 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
        </div>
      )}

      <div style={{position:"relative",zIndex:1}}>

      {/* Toast */}
      {notif&&<div style={{position:"fixed",top:16,right:16,left:16,zIndex:9999,background:notif.type==="error"?"#450a0a":notif.type==="warn"?"#1a0f00":"#052e16",border:`1px solid ${notif.type==="error"?"#7f1d1d":notif.type==="warn"?"#78350f":"#166534"}`,color:notif.type==="error"?"#f87171":notif.type==="warn"?"#fbbf24":"#4ade80",borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8,maxWidth:420,margin:"0 auto",boxShadow:"0 8px 32px #00000066"}}>{notif.type==="error"?<X size={15}/>:notif.type==="warn"?<AlertTriangle size={15}/>:<Check size={15}/>}{notif.msg}</div>}

      {/* Ofertas banner */}
      {(view==="home"||view==="platform")&&clientUser&&activeOfertas.length>0&&(
        <div style={{background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)",backgroundSize:"300% 100%",animation:"bannerPulse 4s ease infinite",padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:700,color:"#fff"}}>
          {activeOfertas.map((o,i)=>(
            <span key={o.id} style={{marginRight:i<activeOfertas.length-1?24:0}}>
              {o.badge&&<span style={{background:"#ffffff22",borderRadius:6,padding:"1px 8px",marginRight:6}}>{o.badge}</span>}
              {o.titulo}
              {o.descripcion&&<span style={{fontWeight:400,opacity:0.9}}> — {o.descripcion}</span>}
              {o.endsAt&&countdown[o.id]&&<span style={{background:"#ffffff22",borderRadius:6,padding:"1px 8px",marginLeft:8}}><Clock size={10}/> {countdown[o.id]}</span>}
            </span>
          ))}
        </div>
      )}

      {/* Notificaciones de vencimiento */}
      {(view==="home"||view==="platform")&&clientUser&&notifications.length>0&&(
        <div style={{background:"#1a0f00",borderBottom:"1px solid #78350f",padding:"8px 16px",display:"flex",flexDirection:"column",gap:4}}>
          {notifications.map(n=>(
            <div key={n.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#fbbf24"}}>
              <AlertTriangle size={12}/>
              <span>{n.msg}</span>
              <button onClick={()=>{ setPayModal({plan:"Renovacion",meses:1,precio:"S/. 10"}); setPayStep(1); setPayCaptura(null); }} style={{background:"#78350f",border:"none",borderRadius:6,padding:"2px 8px",color:"#fbbf24",cursor:"pointer",fontSize:11,marginLeft:"auto"}}>Renovar ahora</button>
            </div>
          ))}
        </div>
      )}

      {/* Estado del servicio */}
      {(view==="home"||view==="platform")&&clientUser&&serviceStatus.status!=="online"&&(
        <div style={{background:serviceStatus.status==="maintenance"?"#1a0f00":"#450a0a",borderBottom:`1px solid ${serviceStatus.status==="maintenance"?"#78350f":"#7f1d1d"}`,padding:"8px 16px",textAlign:"center",fontSize:12,color:serviceStatus.status==="maintenance"?"#fbbf24":"#f87171",fontWeight:600}}>
          {statusLabels[serviceStatus.status]} {serviceStatus.msg&&`— ${serviceStatus.msg}`}
        </div>
      )}

      {/* ═══ CLIENT LOGIN ═══ */}
      {view==="clientLogin"&&(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:darkMode?"radial-gradient(ellipse at top,#1a0a2e,#080810)":"radial-gradient(ellipse at top,#e0e7ff,#f0f2f8)"}}>
          <div style={{width:"100%",maxWidth:420}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:64,height:64,borderRadius:18,margin:"0 auto 14px",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px #6366f144"}}><Package size={30} color="#fff"/></div>
              <h1 style={{fontSize:30,fontWeight:900,margin:"0 0 6px",letterSpacing:-1,color:textColor}}>StreamVault</h1>
              <p style={{color:subText,fontSize:14,margin:"0 0 4px"}}>Accede a tus plataformas de streaming</p>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:darkMode?"#052e1666":"#dcfce7",border:`1px solid ${statusColors[serviceStatus.status]}44`,borderRadius:999,padding:"3px 10px",fontSize:11,color:statusColors[serviceStatus.status]}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:statusColors[serviceStatus.status]}}/>
                {serviceStatus.status==="online"?"Servicio activo":"Ver estado"}
              </div>
            </div>
            <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:22,padding:28,boxShadow:"0 32px 80px #00000044"}}>
              <Input dark={darkMode} label="Email" type="email" placeholder="tu@email.com" value={cEmail} onChange={e=>{ setCEmail(e.target.value); setCErr(""); }}/>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:subText,display:"block",marginBottom:6,fontWeight:600}}>Contraseña</label>
                <div style={{position:"relative"}}>
                  <input type={cShowPass?"text":"password"} placeholder="••••••••" value={cPass} onChange={e=>{ setCPass(e.target.value); setCErr(""); }} onKeyDown={e=>e.key==="Enter"&&clientLogin()} style={{width:"100%",background:darkMode?"#080812":"#f8f9fa",border:darkMode?"1px solid #ffffff18":"1px solid #e5e7eb",borderRadius:10,padding:"10px 40px 10px 13px",color:textColor,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={()=>setCShowPass(!cShowPass)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280"}}>{cShowPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
                </div>
              </div>
              {cErr&&<div style={{background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#f87171",marginBottom:12}}>❌ {cErr}</div>}
              <Btn onClick={clientLogin} style={{width:"100%",justifyContent:"center",padding:"12px 0",fontSize:15,marginBottom:14}}><Unlock size={15}/> Iniciar sesión</Btn>
              <div style={{textAlign:"center",fontSize:12,color:subText,marginBottom:12}}>
                ¿No tienes cuenta? <button onClick={()=>window.open(ADMIN_WA,"_blank")} style={{background:"none",border:"none",cursor:"pointer",color:"#6366f1",fontWeight:600,fontSize:12}}>Contáctanos</button>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${borderColor}`,paddingTop:12}}>
                <button onClick={()=>setView("adminLogin")} style={{background:"none",border:"none",cursor:"pointer",color:subText,fontSize:11,display:"flex",alignItems:"center",gap:4}}><Shield size={11}/> Admin</button>
                <button onClick={()=>setDarkMode(!darkMode)} style={{background:"none",border:"none",cursor:"pointer",color:subText,fontSize:11,display:"flex",alignItems:"center",gap:4}}>{darkMode?<Sun size={11}/>:<Moon size={11}/>} {darkMode?"Modo claro":"Modo oscuro"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADMIN LOGIN ═══ */}
      {view==="adminLogin"&&(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:22,padding:32,width:"100%",maxWidth:360}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{width:54,height:54,borderRadius:14,margin:"0 auto 12px",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><Shield size={24} color="#fff"/></div>
              <h2 style={{fontSize:20,fontWeight:800,margin:"0 0 4px",color:textColor}}>Panel Admin</h2>
              <p style={{color:subText,fontSize:13,margin:0}}>Solo para administradores</p>
            </div>
            <Input dark={darkMode} label="Contraseña" type={aShow?"text":"password"} value={aPass} onChange={e=>setAPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()} placeholder="••••••••" style={{border:aErr?"1px solid #7f1d1d":undefined}}/>
            {aErr&&<p style={{color:"#f87171",fontSize:12,margin:"-8px 0 12px"}}>Contraseña incorrecta</p>}
            <button onClick={()=>setAShow(!aShow)} style={{background:"none",border:"none",cursor:"pointer",color:subText,fontSize:12,marginBottom:12,padding:0}}>{aShow?"Ocultar":"Mostrar"} contraseña</button>
            <Btn onClick={adminLogin} style={{width:"100%",justifyContent:"center",padding:"12px 0"}}>Ingresar</Btn>
            <button onClick={()=>setView("clientLogin")} style={{width:"100%",background:"none",border:"none",color:subText,fontSize:13,marginTop:10,cursor:"pointer"}}>← Volver</button>
          </div>
        </div>
      )}

      {/* ═══ NAVBAR (home/platform) ═══ */}
      {(view==="home"||view==="platform"||view==="profile")&&clientUser&&(
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:`1px solid ${borderColor}`,background:darkMode?"#09091488":"#ffffffcc",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setView("home")}>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><Package size={16} color="#fff"/></div>
            <span style={{fontWeight:800,fontSize:16,letterSpacing:-0.5,color:textColor}}>StreamVault</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {Object.entries(sessions).map(([platId,sess])=>{
              const p=PLATFORMS.find(x=>x.id===platId);
              return <div key={platId} onClick={()=>{ setActivePlat(platId); setView("platform"); }} style={{display:"flex",alignItems:"center",gap:5,background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"4px 9px",cursor:"pointer"}}>
                <PlatformIcon id={platId} size={16}/>
                <div><div style={{fontSize:10,fontWeight:700,color:"#4ade80"}}>{p?.name}</div><div style={{fontSize:9,color:"#6b7280"}}>{timers[platId]||"∞"}</div></div>
              </div>;
            })}
            {/* Chat button */}
            <button onClick={()=>setChatOpen(!chatOpen)} style={{position:"relative",background:"none",border:`1px solid ${borderColor}`,borderRadius:9,padding:"6px 10px",cursor:"pointer",color:subText,display:"flex",alignItems:"center",gap:4}}>
              <MessageCircle size={14}/> <span style={{fontSize:12}}>Chat</span>
              {chats.filter(c=>c.de==="admin").length>0&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#6366f1"}}/>}
            </button>
            <button onClick={()=>setDarkMode(!darkMode)} style={{background:"none",border:`1px solid ${borderColor}`,borderRadius:9,padding:"6px 10px",cursor:"pointer",color:subText}}>{darkMode?<Sun size={14}/>:<Moon size={14}/>}</button>
            <div onClick={()=>setView("profile")} style={{display:"flex",alignItems:"center",gap:6,background:darkMode?"#0f0f1a":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:9,padding:"4px 10px",cursor:"pointer"}}>
              <Avatar user={clientUser} size={22}/>
              <span style={{fontSize:12,color:textColor}}>{clientUser.nombre}</span>
            </div>
            <button onClick={clientLogout} style={{background:"transparent",border:`1px solid ${borderColor}`,borderRadius:9,color:subText,padding:"6px 10px",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:4}}><LogOut size={12}/></button>
          </div>
        </nav>
      )}

      {/* ═══ CHAT FLOTANTE ═══ */}
      {chatOpen&&clientUser&&(
        <div style={{position:"fixed",bottom:20,right:20,zIndex:500,width:320,background:cardBg,border:`1px solid ${borderColor}`,borderRadius:18,boxShadow:"0 16px 48px #00000088",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <MessageCircle size={16} color="#fff"/>
              <span style={{fontWeight:700,fontSize:14,color:"#fff"}}>Chat con Admin</span>
            </div>
            <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#fff"}}><X size={14}/></button>
          </div>
          <div ref={chatRef} style={{flex:1,maxHeight:260,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
            {chats.length===0&&<div style={{textAlign:"center",color:subText,fontSize:12,padding:"20px 0"}}>Envía un mensaje al admin</div>}
            {chats.map(msg=>(
              <div key={msg.id} style={{display:"flex",flexDirection:"column",alignItems:msg.de==="admin"?"flex-start":"flex-end"}}>
                <div style={{background:msg.de==="admin"?"linear-gradient(135deg,#6366f1,#a855f7)":darkMode?"#1e1e2e":"#e5e7eb",color:msg.de==="admin"?"#fff":textColor,borderRadius:12,padding:"8px 12px",maxWidth:"80%",fontSize:13}}>
                  {msg.texto}
                </div>
                <span style={{fontSize:10,color:subText,marginTop:2}}>{msg.de==="admin"?"Admin":msg.de} · {msg.hora}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} style={{display:"flex",gap:6,padding:"8px 12px",borderTop:`1px solid ${borderColor}`}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Escribe un mensaje..." style={{flex:1,background:darkMode?"#080812":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:8,padding:"7px 10px",color:textColor,fontSize:13,outline:"none"}}/>
            <button type="submit" style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",color:"#fff"}}><Send size={13}/></button>
          </form>
        </div>
      )}

      {/* ═══ PERFIL CLIENTE ═══ */}
      {view==="profile"&&clientUser&&(
        <div style={{maxWidth:600,margin:"0 auto",padding:"32px 16px"}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:subText,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:4,marginBottom:20}}>← Volver</button>
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:20,padding:24,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{position:"relative"}}>
                <Avatar user={clientUser} size={72}/>
                <label style={{position:"absolute",bottom:0,right:0,background:"linear-gradient(135deg,#6366f1,#a855f7)",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  <Camera size={12} color="#fff"/>
                  <input type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}}/>
                </label>
              </div>
              <div>
                <h2 style={{fontSize:20,fontWeight:800,margin:"0 0 4px",color:textColor}}>{clientUser.nombre}</h2>
                <p style={{color:subText,fontSize:13,margin:0}}>{clientUser.email}</p>
                <div style={{marginTop:6}}><Badge color="green" dot>Cuenta activa</Badge></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:16}}>
              {[{label:"Keys usadas",value:(clientUser.keys||[]).length},{label:"Tickets",value:myTickets.length},{label:"Sesiones activas",value:Object.keys(sessions).length}].map(s=>(
                <div key={s.label} style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:"#6366f1"}}>{s.value}</div>
                  <div style={{fontSize:11,color:subText,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20,marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>🔑 Cambiar contraseña</h3>
            <Input dark={darkMode} label="Contraseña actual" type="password" placeholder="••••••••" value={profilePass.current} onChange={e=>setProfilePass(p=>({...p,current:e.target.value}))}/>
            <Input dark={darkMode} label="Nueva contraseña" type="password" placeholder="Mínimo 6 caracteres" value={profilePass.next} onChange={e=>setProfilePass(p=>({...p,next:e.target.value}))}/>
            <Input dark={darkMode} label="Confirmar" type="password" placeholder="Repite" value={profilePass.confirm} onChange={e=>setProfilePass(p=>({...p,confirm:e.target.value}))}/>
            <Btn onClick={changeClientPass}><Key size={13}/> Actualizar contraseña</Btn>
          </div>

          {/* Mis tickets */}
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <h3 style={{fontSize:15,fontWeight:700,margin:0,color:textColor}}>🎫 Mis tickets de soporte</h3>
              <Btn small onClick={()=>setModal("ticket")}><Plus size={12}/> Nuevo</Btn>
            </div>
            {myTickets.length===0?<div style={{textAlign:"center",color:subText,fontSize:13,padding:"16px 0"}}>No has enviado tickets aún</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {myTickets.map(t=>(
                  <div key={t.id} style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:textColor}}>{t.asunto}</div><div style={{fontSize:11,color:subText}}>{t.fecha}</div></div>
                    <Badge color={t.estado==="abierto"?"blue":"gray"} dot>{t.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial de pagos */}
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20,marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>💰 Historial de pagos</h3>
            {(clientUser?.pagos||[]).length===0?(
              <div style={{textAlign:"center",color:subText,fontSize:13,padding:"16px 0"}}>
                Sin pagos registrados
                <div style={{marginTop:12}}>
                  <Btn small onClick={()=>{ setPayModal({plan:"1 Mes",meses:1,precio:"S/. 10"}); setPayStep(1); setPayCaptura(null); setModal(null); setView("home"); }}>
                    💳 Realizar pago
                  </Btn>
                </div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(clientUser.pagos||[]).map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${borderColor}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:textColor}}>{p.plan}</div>
                      <div style={{fontSize:11,color:subText}}>{p.fecha}</div>
                    </div>
                    <span style={{fontSize:14,fontWeight:700,color:"#4ade80"}}>{p.precio}</span>
                    <Badge color={p.estado==="aprobado"?"green":"amber"} dot>{p.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial de pagos */}
          {(clientUser?.pagos||[]).length>0&&(
            <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20,marginBottom:16}}>
              <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>💰 Historial de pagos</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(clientUser?.pagos||[]).map((p,i)=>(
                  <div key={i} style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:textColor}}>{p.plan}</div>
                      <div style={{fontSize:11,color:subText}}>{p.fecha}</div>
                    </div>
                    <div style={{fontWeight:700,fontSize:14,color:"#4ade80"}}>{p.precio}</div>
                    <Badge color={p.estado==="aprobado"?"green":"amber"} dot>{p.estado}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Renovar plan */}
          <div style={{background:darkMode?"linear-gradient(135deg,#1a0a2e,#0c1a3a)":"linear-gradient(135deg,#e0e7ff,#f0f4ff)",border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>🔄</div>
            <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 6px",color:textColor}}>Renovar mi plan</h3>
            <p style={{color:subText,fontSize:12,margin:"0 0 12px"}}>Elige tu plan y paga con Yape directamente aquí</p>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {[{plan:"1 Mes",meses:1,precio:"S/. 10"},{plan:"3 Meses",meses:3,precio:"S/. 30"},{plan:"6 Meses",meses:6,precio:"S/. 60"}].map(p=>(
                <Btn key={p.plan} small onClick={()=>{ setPayModal(p); setPayStep(1); setPayCaptura(null); }} style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",border:"none"}}>
                  {p.plan} — {p.precio}
                </Btn>
              ))}
            </div>
          </div>

          {/* Código de descuento */}
          <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20}}>
            <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>🏷️ Código de descuento</h3>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={discountInput} onChange={e=>setDiscountInput(e.target.value.toUpperCase())} placeholder="Ej: BIENVENIDO10" style={{flex:1,background:darkMode?"#080812":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px 13px",color:textColor,fontSize:13,outline:"none",fontFamily:"monospace"}}/>
              <Btn onClick={checkDiscount}><Tag size={13}/> Aplicar</Btn>
            </div>
            {discountResult&&(discountResult.valido?(
              <div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"10px 13px",fontSize:13,color:"#4ade80"}}>
                ✅ ¡Código válido! {discountResult.tipo==="porcentaje"?`${discountResult.valor}% de descuento`:`S/. ${discountResult.valor} de descuento`} — {discountResult.descripcion}
              </div>
            ):(
              <div style={{background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 13px",fontSize:13,color:"#f87171"}}>❌ {discountResult.msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ HOME ═══ */}
      {view==="home"&&clientUser&&(
        <div style={{maxWidth:"100%",padding:"28px 16px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <h1 style={{fontSize:"clamp(22px,5vw,42px)",fontWeight:800,margin:"0 0 8px",letterSpacing:-1,color:textColor}}>
              Hola, <span style={{background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{clientUser.nombre}</span> 👋
            </h1>
            <p style={{color:subText,fontSize:14,margin:"0 0 16px"}}>Selecciona una plataforma para ver tus accesos</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
              {[{label:"Plataformas",value:PLATFORMS.length,icon:"🎬"},{label:"Disponibles",value:availableAcc,icon:"✅"},{label:"Sesiones activas",value:Object.keys(sessions).length,icon:"🔑"}].map(s=>(
                <div key={s.label} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,padding:"10px 16px",minWidth:90,textAlign:"center"}}>
                  <div style={{fontSize:16}}>{s.icon}</div>
                  <div style={{fontSize:20,fontWeight:800,color:textColor}}>{s.value}</div>
                  <div style={{fontSize:10,color:subText}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{position:"relative",maxWidth:360,margin:"0 auto 20px"}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:subText}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar plataforma…" style={{width:"100%",background:cardBg,border:`1px solid ${borderColor}`,borderRadius:11,padding:"10px 10px 10px 36px",color:textColor,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>

          {/* Plataformas */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:40}}>
            {filteredPlats.map(platform=>{
              const pAccs=accounts[platform.id]||[];
              const avail=pAccs.filter(a=>a.status==="disponible").length;
              const sess=sessions[platform.id];
              const isActive=!!sess&&(!sess.expiraEn||new Date()<new Date(sess.expiraEn));
              return (
                <div key={platform.id} onClick={()=>{ if(isActive){setActivePlat(platform.id);setView("platform");}else{setSelPlatform(platform);setModal("view");} }}
                  style={{background:cardBg,border:`1px solid ${isActive?platform.color+"99":borderColor}`,borderRadius:18,padding:16,cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.18s ease",boxShadow:isActive?`0 0 24px ${platform.color}33`:"none"}}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${platform.color}22`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isActive?`0 0 24px ${platform.color}33`:"none"; }}>
                  <div style={{position:"absolute",top:-18,right:-18,width:70,height:70,borderRadius:"50%",background:platform.color,opacity:0.08}}/>
                  {isActive&&<div style={{position:"absolute",top:10,right:10}}><Badge color="green" dot>Activo · {timers[platform.id]||"∞"}</Badge></div>}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <PlatformIcon id={platform.id} size={40}/>
                    <div><div style={{fontWeight:700,fontSize:14,color:textColor}}>{platform.name}</div><div style={{fontSize:11,color:subText}}>{platform.desc}</div></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    {isActive?<Badge color="green" dot>Tienes acceso</Badge>:<Badge color={avail>0?"blue":"red"} dot>{avail>0?`${avail} disponible${avail!==1?"s":""}`:"Sin stock"}</Badge>}
                    <ChevronRight size={14} color={subText}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secciones home */}
          {/* Cómo funciona */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>¿Cómo funciona?</div>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:0,color:textColor}}>Simple y rápido</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
              {[{n:"1",icon:"💬",title:"Contáctanos",desc:"Escríbenos por Telegram o WhatsApp y elige tu plan."},{n:"2",icon:"💳",title:"Realiza tu pago",desc:"Paga de forma segura y recibe tus credenciales al instante."},{n:"3",icon:"🔑",title:"Activa tu key",desc:"Ingresa tu key en la web y accede a tu cuenta asignada."},{n:"4",icon:"🎬",title:"Disfruta",desc:"Mira tu contenido favorito sin interrupciones."}].map(s=>(
                <div key={s.n} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:20,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:0.04,fontWeight:900,color:textColor}}>{s.n}</div>
                  <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:textColor}}>{s.title}</div>
                  <div style={{fontSize:12,color:subText,lineHeight:1.6}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Precios</div>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:"0 0 6px",color:textColor}}>Planes accesibles</h2>
              <p style={{color:subText,fontSize:14,margin:0}}>Acceso a todas las plataformas disponibles</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,maxWidth:800,margin:"0 auto"}}>
              {[{plan:"1 Mes",meses:1,precio:"S/. 10",tag:null,color:"#6366f1",desc:"Perfecto para probar",features:["Acceso completo","1 cuenta asignada","Soporte por Telegram"]},{plan:"3 Meses",meses:3,precio:"S/. 30",tag:"Más popular",color:"#a855f7",desc:"El favorito de nuestros clientes",features:["Acceso completo","1 cuenta asignada","Soporte prioritario","Renovación garantizada"]},{plan:"6 Meses",meses:6,precio:"S/. 60",tag:"Mejor precio",color:"#ec4899",desc:"Ahorra más con este plan",features:["Acceso completo","1 cuenta asignada","Soporte VIP 24/7","Renovación garantizada","Menor precio por mes"]}].map(p=>(
                <div key={p.plan} style={{background:cardBg,border:`1px solid ${p.color}44`,borderRadius:18,padding:22,position:"relative",overflow:"hidden"}}>
                  {p.tag&&<div style={{position:"absolute",top:14,right:14,background:`linear-gradient(135deg,${p.color},${p.color}88)`,borderRadius:999,padding:"2px 10px",fontSize:10,fontWeight:700,color:"#fff"}}>{p.tag}</div>}
                  <div style={{position:"absolute",top:-20,left:-20,width:80,height:80,borderRadius:"50%",background:p.color,opacity:0.08}}/>
                  <div style={{fontSize:13,fontWeight:600,color:p.color,marginBottom:4}}>{p.plan}</div>
                  <div style={{fontSize:32,fontWeight:900,marginBottom:4,letterSpacing:-1,color:textColor}}>{p.precio}</div>
                  <div style={{fontSize:11,color:subText,marginBottom:14}}>{p.desc}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:18}}>
                    {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:textColor}}><Check size={12} color={p.color}/>{f}</div>)}
                  </div>
                  <Btn onClick={()=>{ setPayModal({plan:p.plan,meses:p.meses,precio:p.precio}); setPayStep(1); setPayCaptura(null); }} style={{width:"100%",justifyContent:"center",background:`linear-gradient(135deg,${p.color},${p.color}88)`,border:"none",fontSize:13}}>💳 Pagar con Yape</Btn>
                </div>
              ))}
            </div>
          </div>

          {/* Contador */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:48}}>
            {[{label:"Clientes satisfechos",value:users.length+48,icon:"😊",color:"#6366f1"},{label:"Cuentas disponibles",value:availableAcc,icon:"✅",color:"#1DB954"},{label:"Plataformas",value:12,icon:"🎬",color:"#a855f7"},{label:"Años de servicio",value:2,icon:"⭐",color:"#fbbf24"}].map(s=>(
              <div key={s.label} style={{background:cardBg,border:`1px solid ${s.color}33`,borderRadius:16,padding:"20px 16px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:36,fontWeight:900,color:s.color,letterSpacing:-1}}>{s.value}+</div>
                <div style={{fontSize:12,color:subText,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Logos animados */}
          <div style={{marginBottom:48,overflow:"hidden"}}>
            <p style={{color:subText,fontSize:13,textAlign:"center",margin:"0 0 16px"}}>Plataformas disponibles</p>
            <div style={{display:"flex",animation:"marquee 20s linear infinite",width:"max-content"}}>
              {[...PLATFORMS,...PLATFORMS].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,margin:"0 12px",background:cardBg,border:`1px solid ${p.color}44`,borderRadius:12,padding:"7px 13px",flexShrink:0}}>
                  <div style={{width:26,height:26,borderRadius:7,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:"#fff"}}>{p.icon}</div>
                  <span style={{fontSize:12,fontWeight:600,whiteSpace:"nowrap",color:textColor}}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estado del servicio */}
          <div style={{marginBottom:48,maxWidth:600,margin:"0 auto 48px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Estado del servicio</div>
              <h2 style={{fontSize:"clamp(18px,3vw,28px)",fontWeight:800,margin:0,color:textColor}}>¿Todo funciona bien?</h2>
            </div>
            <div style={{background:cardBg,border:`1px solid ${statusColors[serviceStatus.status]}44`,borderRadius:16,padding:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:statusColors[serviceStatus.status],boxShadow:`0 0 8px ${statusColors[serviceStatus.status]}`}}/>
                <span style={{fontWeight:700,fontSize:15,color:textColor}}>{statusLabels[serviceStatus.status]}</span>
              </div>
              {serviceStatus.msg&&<p style={{color:subText,fontSize:13,margin:"0 0 14px"}}>{serviceStatus.msg}</p>}
              {PLATFORMS.slice(0,6).map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${borderColor}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><PlatformIcon id={p.id} size={20}/><span style={{fontSize:13,color:textColor}}>{p.name}</span></div>
                  <Badge color="green" dot>Operativo</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Garantía */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Garantía</div>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:0,color:textColor}}>Tu satisfacción primero</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
              {[{icon:"🔄",title:"Reemplazo garantizado",desc:"Si tu cuenta falla, la reemplazamos en menos de 24 horas sin costo."},{icon:"💰",title:"Reembolso disponible",desc:"Si no puedes acceder en los primeros 3 días, te devolvemos tu dinero."},{icon:"🔒",title:"Datos seguros",desc:"Tus credenciales están protegidas. No compartimos tu información."},{icon:"⚡",title:"Soporte inmediato",desc:"Respondemos en menos de 1 hora por Telegram y WhatsApp, todos los días."}].map((g,i)=>(
                <div key={i} style={{background:cardBg,border:"1px solid #052e1688",borderRadius:16,padding:20,display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{fontSize:28,flexShrink:0}}>{g.icon}</div>
                  <div><div style={{fontWeight:700,fontSize:14,marginBottom:5,color:"#4ade80"}}>{g.title}</div><div style={{fontSize:12,color:subText,lineHeight:1.6}}>{g.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonios */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Testimonios</div>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:0,color:textColor}}>Lo que dicen nuestros clientes</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
              {[{nombre:"Carlos M.",plat:"Netflix",texto:"Increíble servicio, recibí mi cuenta en minutos. Ya llevo 3 meses y todo perfecto.",stars:5},{nombre:"Ana R.",plat:"Spotify",texto:"Muy fácil de usar la web. La clave llegó rápido y funciona sin problemas.",stars:5},{nombre:"Luis P.",plat:"Disney+",texto:"Excelente precio y atención. El admin responde al instante por Telegram.",stars:5},{nombre:"María G.",plat:"Max",texto:"Ya voy por mi segundo mes. Recomendado 100% para quien quiere streaming barato.",stars:5}].map((t,i)=>(
                <div key={i} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,padding:18}}>
                  <div style={{display:"flex",gap:2,marginBottom:10}}>{[...Array(t.stars)].map((_,j)=><span key={j} style={{color:"#fbbf24",fontSize:14}}>★</span>)}</div>
                  <p style={{fontSize:13,color:subText,lineHeight:1.65,margin:"0 0 14px",fontStyle:"italic"}}>"{t.texto}"</p>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff"}}>{t.nombre[0]}</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:textColor}}>{t.nombre}</div><div style={{fontSize:11,color:subText}}>Usuario de {t.plat}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referidos */}
          <div style={{background:darkMode?"linear-gradient(135deg,#1a0a2e,#0c1a3a)":"linear-gradient(135deg,#e0e7ff,#f0f4ff)",border:"1px solid #6366f133",borderRadius:20,padding:28,marginBottom:48,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>🎁</div>
            <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 8px",color:textColor}}>Sistema de Referidos</h2>
            <p style={{color:subText,fontSize:14,margin:"0 0 16px"}}>¡Recomienda y gana 1 semana GRATIS para ti y tu amigo!</p>
            <Btn onClick={()=>window.open(`https://wa.me/51901815489?text=Hola! Quiero información sobre el sistema de referidos`,"_blank")} style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",border:"none"}}><Gift size={14}/> Unirme al programa</Btn>
          </div>

          {/* FAQ */}
          <div style={{marginBottom:48,maxWidth:700,margin:"0 auto 48px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{display:"inline-block",background:darkMode?"#1e1e2e":"#e0e7ff",border:"1px solid #6366f133",borderRadius:999,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>FAQ</div>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,margin:0,color:textColor}}>Preguntas frecuentes</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[{q:"¿Cómo recibo mi cuenta?",a:"Una vez que realizas el pago, te enviamos tus credenciales. Entras a la web, activas tu key y se te asigna una cuenta automáticamente."},{q:"¿Las cuentas son compartidas?",a:"Las cuentas pueden ser compartidas. Cada cliente recibe un perfil exclusivo para evitar interferencias."},{q:"¿Qué pasa si la cuenta deja de funcionar?",a:"Garantizamos el servicio. Si hay algún problema, te reemplazamos la cuenta sin costo adicional."},{q:"¿Puedo usarlo en mi celular y TV?",a:"Sí, en cualquier dispositivo: celular, tablet, computadora o smart TV."},{q:"¿Cómo renuevo mi plan?",a:"Contáctanos antes de que venza tu plan y te generamos una nueva key."},{q:"¿Cuáles son los métodos de pago?",a:"Aceptamos Yape, Plin, transferencias bancarias y más. Contáctanos para detalles."}].map((f,i)=>(
                <details key={i} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,overflow:"hidden"}}>
                  <summary style={{padding:"14px 16px",fontWeight:600,fontSize:14,cursor:"pointer",listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center",color:textColor}}>
                    {f.q} <span style={{color:"#6366f1",fontSize:18}}>+</span>
                  </summary>
                  <div style={{padding:"0 16px 14px",fontSize:13,color:subText,lineHeight:1.7}}>{f.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div style={{background:darkMode?"linear-gradient(135deg,#1a0a2e,#0c1a3a)":"linear-gradient(135deg,#e0e7ff,#f0f4ff)",border:"1px solid #6366f133",borderRadius:20,padding:28,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
            <div style={{fontSize:32,marginBottom:10}}>💬</div>
            <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 8px",color:textColor}}>¿Tienes alguna duda?</h2>
            <p style={{color:subText,fontSize:14,margin:"0 0 20px"}}>Disponibles por Telegram y WhatsApp</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} style={{background:"linear-gradient(135deg,#0088cc,#006699)",border:"none"}}><Send size={14}/> @alex_eren</Btn>
              <Btn onClick={()=>window.open(ADMIN_WA,"_blank")} style={{background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none"}}><Send size={14}/> WhatsApp</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PLATFORM VIEW ═══ */}
      {view==="platform"&&clientUser&&activePlat&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"28px 16px"}}>
          {activeSession?(
            <>
              <div style={{background:`linear-gradient(135deg,${activePlatObj?.color||"#333"}22,${cardBg})`,border:`1px solid ${activePlatObj?.color||"#333"}44`,borderRadius:20,padding:22,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <PlatformIcon id={activePlat} size={52}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <h2 style={{margin:0,fontSize:20,fontWeight:800,color:textColor}}>{activePlatObj?.name}</h2>
                      <Badge color="green" dot>Acceso activo</Badge>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <Badge color="purple"><Clock size={10}/> {timers[activePlat]||"∞"}</Badge>
                      <Badge color="blue">Key: {activeSession.keyCodigo}</Badge>
                    </div>
                  </div>
                  <Btn variant="danger" small onClick={()=>cerrarSesionPlat(activePlat)}><LogOut size={12}/> Cerrar sesión</Btn>
                  <Btn variant="amber" small onClick={()=>setRatingModal(activePlat)}><Star size={12}/> Calificar</Btn>
                </div>
              </div>
              {activeSession.cuenta?(
                <div style={{background:cardBg,border:`1px solid ${activePlatObj?.color||"#333"}44`,borderRadius:16,padding:20,marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80"}}/>
                    <span style={{fontWeight:700,fontSize:15,color:"#4ade80"}}>Tu cuenta asignada</span>
                    {activeSession.cuenta.profile&&<Badge color="green">👤 {activeSession.cuenta.profile}</Badge>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    <div style={{background:darkMode?"#080812":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:10,color:subText,marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>📧 Email</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:600,flex:1,wordBreak:"break-all",color:textColor}}>{activeSession.cuenta.email}</span>
                        <button onClick={()=>copyText(activeSession.cuenta.email,"email")} style={{background:"none",border:"none",cursor:"pointer",color:copied==="email"?"#4ade80":subText}}>{copied==="email"?<Check size={14}/>:<Copy size={14}/>}</button>
                      </div>
                    </div>
                    <div style={{background:darkMode?"#080812":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:10,color:subText,marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>🔑 Contraseña</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:600,flex:1,fontFamily:"monospace",color:textColor}}>{showPasses["acc"]?activeSession.cuenta.password:"••••••••"}</span>
                        <button onClick={()=>setShowPasses(p=>({...p,acc:!p.acc}))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}>{showPasses["acc"]?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                        <button onClick={()=>copyText(activeSession.cuenta.password,"pass")} style={{background:"none",border:"none",cursor:"pointer",color:copied==="pass"?"#4ade80":subText}}>{copied==="pass"?<Check size={14}/>:<Copy size={14}/>}</button>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <Btn onClick={()=>copyText(`Email: ${activeSession.cuenta.email}\nContraseña: ${activeSession.cuenta.password}${activeSession.cuenta.profile?`\nPerfil: ${activeSession.cuenta.profile}`:""}`, "all")} variant="ghost" style={{flex:1,justifyContent:"center"}}>
                      {copied==="all"?<><Check size={13}/> ¡Copiado!</>:<><Copy size={13}/> Copiar todo</>}
                    </Btn>
                    <Btn onClick={()=>window.open(activePlatObj?.url,"_blank")} style={{flex:1,justifyContent:"center",background:`linear-gradient(135deg,${activePlatObj?.color||"#6366f1"},${activePlatObj?.color||"#a855f7"}99)`,border:"none"}}>
                      <Unlock size={13}/> Abrir {activePlatObj?.name}
                    </Btn>
                  </div>
                </div>
              ):(
                <div style={{background:"#1a0000",border:"1px solid #7f1d1d44",borderRadius:16,padding:28,textAlign:"center",marginBottom:12}}>
                  <Lock size={28} color="#f87171" style={{marginBottom:8}}/>
                  <div style={{fontSize:14,fontWeight:700,color:"#f87171",marginBottom:6}}>Sin cuentas disponibles</div>
                  <div style={{fontSize:12,color:subText,marginBottom:12}}>El admin está actualizando el stock.</div>
                  <Btn onClick={()=>window.open(ADMIN_WA,"_blank")} variant="ghost" small><Send size={12}/> Contactar admin</Btn>
                </div>
              )}
              {activePlatObj?.steps&&(
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:textColor}}>📋 Cómo usar {activePlatObj.name}</div>
                  {activePlatObj.steps.map((step,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,color:"#fff"}}>{i+1}</div>
                      <span style={{fontSize:12,color:subText}}>{step}</span>
                    </div>
                  ))}
                  <div style={{marginTop:10,background:"#1a0000",border:"1px solid #7f1d1d33",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#f87171"}}>⚠️ No cambies la contraseña ni el email. No compartas las credenciales.</div>
                </div>
              )}
              <div style={{background:darkMode?"#0c1a3a":"#e0e7ff",border:"1px solid #1e3a8a",borderRadius:12,padding:14,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div><div style={{fontSize:13,fontWeight:700,color:"#60a5fa"}}>¿Tienes algún problema?</div><div style={{fontSize:11,color:subText}}>Contacta al administrador</div></div>
                <Btn variant="ghost" onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} style={{border:"1px solid #1e3a8a",color:"#60a5fa"}} small><Send size={12}/> @alex_eren</Btn>
              </div>
              <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:subText,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:4}}>← Volver al inicio</button>
                  <Btn small variant="amber" onClick={()=>setRatingModal(activePlat)}><Star size={12}/> Calificar</Btn>
                </div>
                <Btn small variant="amber" onClick={()=>setRatingModal(activePlat)} style={{marginLeft:"auto"}}><Star size={12}/> Calificar servicio</Btn>
              </div>
            </>
          ):(
            <div style={{textAlign:"center",padding:"60px 16px"}}>
              <Lock size={40} color="#6b7280" style={{marginBottom:16}}/>
              <h2 style={{fontSize:18,fontWeight:700,marginBottom:8,color:textColor}}>Acceso bloqueado</h2>
              <p style={{color:subText,marginBottom:20}}>Necesitas una key para {activePlatObj?.name}.</p>
              <Btn onClick={()=>{ setModal("activarKey"); setKeyInput(""); setKeyError(""); }}><Key size={14}/> Activar key</Btn>
              <button onClick={()=>setView("home")} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:subText,cursor:"pointer",fontSize:13}}>← Volver</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ ADMIN PANEL ═══ */}
      {view==="admin"&&isAdmin&&(
        <>
          <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:`1px solid ${borderColor}`,background:darkMode?"#09091488":"#ffffffcc",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><Package size={16} color="#fff"/></div>
              <span style={{fontWeight:800,fontSize:16,color:textColor}}>StreamVault</span>
              <Badge color="purple">Admin</Badge>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
              {["accounts","users","keys","payments","tickets","chat","ofertas","discounts","status","granted","analytics","settings"].map(t=>(
                <button key={t} onClick={()=>setAdminTab(t)} style={{background:adminTab===t?"#1e1e2e":"transparent",border:`1px solid ${borderColor}`,borderRadius:9,color:"#c4b5fd",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,position:"relative"}}>
                  {t==="accounts"?"Cuentas":t==="users"?"Usuarios":t==="keys"?"Keys":t==="payments"?"Pagos":t==="tickets"?"Tickets":t==="chat"?"Chat":t==="ofertas"?"Ofertas":t==="discounts"?"Descuentos":t==="status"?"Estado":t==="granted"?"Otorgadas":t==="analytics"?"Analytics":"Config"}
                  {t==="tickets"&&openTickets.length>0&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#f87171"}}/>}
                  {t==="chat"&&chats.filter(c=>c.de!=="admin").length>0&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#6366f1"}}/>}
                </button>
              ))}
              <button onClick={()=>setDarkMode(!darkMode)} style={{background:"none",border:`1px solid ${borderColor}`,borderRadius:9,padding:"5px 8px",cursor:"pointer",color:subText}}>{darkMode?<Sun size={13}/>:<Moon size={13}/>}</button>
              <button onClick={adminLogout} style={{background:"transparent",border:`1px solid ${borderColor}`,borderRadius:9,color:subText,padding:"5px 10px",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4}}><LogOut size={11}/> Salir</button>
            </div>
          </nav>

          <div style={{maxWidth:"100%",padding:"20px 16px"}}>

            {/* OFERTAS */}
            {adminTab==="ofertas"&&(
              <>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
                  <div><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Ofertas y Promociones</h2><p style={{color:subText,margin:0,fontSize:12}}>Las activas aparecen en el banner superior para tus clientes</p></div>
                </div>
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:20}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>➕ Nueva oferta</h3>
                  <Input dark={darkMode} label="Título *" placeholder="Ej: 50% en tu primer mes" value={newOferta.titulo} onChange={e=>setNewOferta(o=>({...o,titulo:e.target.value}))}/>
                  <Input dark={darkMode} label="Descripción" placeholder="Ej: Solo esta semana" value={newOferta.descripcion} onChange={e=>setNewOferta(o=>({...o,descripcion:e.target.value}))}/>
                  <Input dark={darkMode} label="Badge (emoji o texto)" placeholder="🔥 OFERTA o ¡NUEVO!" value={newOferta.badge} onChange={e=>setNewOferta(o=>({...o,badge:e.target.value}))}/>
                  <Input dark={darkMode} label="Fecha de fin (opcional)" type="datetime-local" value={newOferta.endsAt} onChange={e=>setNewOferta(o=>({...o,endsAt:e.target.value}))}/>
                  <Btn onClick={createOferta} style={{width:"100%",justifyContent:"center"}}><Zap size={14}/> Publicar oferta</Btn>
                </div>
                {ofertas.length===0?<div style={{textAlign:"center",color:subText,padding:"40px 0"}}>No hay ofertas</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {ofertas.map(o=>(
                      <div key={o.id} style={{background:cardBg,border:`1px solid ${o.activa?"#6366f144":borderColor}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14,color:textColor}}>{o.badge&&<span style={{marginRight:6}}>{o.badge}</span>}{o.titulo}</div>
                          {o.descripcion&&<div style={{fontSize:12,color:subText}}>{o.descripcion}</div>}
                          {o.endsAt&&<div style={{fontSize:11,color:"#fbbf24",marginTop:2}}><Clock size={10}/> {countdown[o.id]||"Calculando..."}</div>}
                        </div>
                        <Badge color={o.activa?"green":"gray"} dot>{o.activa?"Activa":"Inactiva"}</Badge>
                        <Btn small variant={o.activa?"amber":"success"} onClick={()=>toggleOferta(o.id,o.activa)}>{o.activa?"Desactivar":"Activar"}</Btn>
                        <button onClick={()=>deleteOferta(o.id)} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* DESCUENTOS */}
            {adminTab==="discounts"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Códigos de Descuento</h2><p style={{color:subText,margin:0,fontSize:12}}>Los clientes los ingresan en su perfil</p></div>
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:20}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>➕ Nuevo código</h3>
                  <Input dark={darkMode} label="Código *" placeholder="Ej: BIENVENIDO10" value={newDiscount.codigo} onChange={e=>setNewDiscount(d=>({...d,codigo:e.target.value.toUpperCase()}))}/>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:140}}>
                      <Select dark={darkMode} label="Tipo" value={newDiscount.tipo} onChange={e=>setNewDiscount(d=>({...d,tipo:e.target.value}))}>
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="monto">Monto (S/.)</option>
                      </Select>
                    </div>
                    <div style={{flex:1,minWidth:100}}>
                      <Input dark={darkMode} label="Valor" type="number" value={newDiscount.valor} onChange={e=>setNewDiscount(d=>({...d,valor:e.target.value}))}/>
                    </div>
                  </div>
                  <Input dark={darkMode} label="Descripción" placeholder="Ej: Descuento de bienvenida" value={newDiscount.descripcion} onChange={e=>setNewDiscount(d=>({...d,descripcion:e.target.value}))}/>
                  <Btn onClick={createDiscount} style={{width:"100%",justifyContent:"center"}}><Tag size={14}/> Crear código</Btn>
                </div>
                {discounts.length===0?<div style={{textAlign:"center",color:subText,padding:"40px 0"}}>No hay códigos</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {discounts.map(d=>(
                      <div key={d.id} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <code style={{fontSize:15,fontWeight:800,color:"#c4b5fd",letterSpacing:1}}>{d.codigo}</code>
                        <div style={{flex:1,fontSize:12,color:subText}}>{d.tipo==="porcentaje"?`${d.valor}%`:`S/. ${d.valor}`} · {d.descripcion}</div>
                        <Badge color={d.activo!==false?"green":"gray"} dot>{d.activo!==false?"Activo":"Inactivo"}</Badge>
                        <button onClick={()=>updateDoc(doc(db,"discounts",String(d.id)),{activo:!d.activo})} style={{background:"none",border:"none",cursor:"pointer",color:subText,fontSize:11}}>{d.activo!==false?"Desactivar":"Activar"}</button>
                        <button onClick={()=>deleteDoc(doc(db,"discounts",String(d.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ESTADO DEL SERVICIO */}
            {adminTab==="status"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Estado del Servicio</h2><p style={{color:subText,margin:0,fontSize:12}}>Tus clientes ven este estado en tiempo real</p></div>
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:16}}>
                  <Select dark={darkMode} label="Estado actual" value={newStatus.status} onChange={e=>setNewStatus(s=>({...s,status:e.target.value}))}>
                    <option value="online">✅ Online — Todo operativo</option>
                    <option value="degraded">⚠️ Degradado — Servicio lento</option>
                    <option value="maintenance">🔧 Mantenimiento</option>
                    <option value="offline">❌ Offline</option>
                  </Select>
                  <Input dark={darkMode} label="Mensaje adicional (opcional)" placeholder="Ej: Estamos trabajando en una mejora..." value={newStatus.msg} onChange={e=>setNewStatus(s=>({...s,msg:e.target.value}))}/>
                  <Btn onClick={updateStatus} style={{width:"100%",justifyContent:"center"}}><Activity size={14}/> Actualizar estado</Btn>
                </div>
                <div style={{background:cardBg,border:`1px solid ${statusColors[serviceStatus.status]}44`,borderRadius:14,padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:subText,marginBottom:8}}>Estado actual para los clientes:</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:statusColors[serviceStatus.status]}}/>
                    <span style={{fontWeight:700,color:textColor}}>{statusLabels[serviceStatus.status]}</span>
                  </div>
                  {serviceStatus.msg&&<p style={{color:subText,fontSize:13,margin:"8px 0 0"}}>{serviceStatus.msg}</p>}
                </div>
              </>
            )}

            {/* TICKETS */}
            {adminTab==="tickets"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Tickets de Soporte</h2><p style={{color:subText,margin:0,fontSize:12}}>{openTickets.length} abiertos · {tickets.length} total</p></div>
                {tickets.length===0?<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin tickets</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {tickets.map(t=>(
                      <div key={t.id} style={{background:cardBg,border:`1px solid ${t.estado==="abierto"?"#1e3a8a":borderColor}`,borderRadius:14,padding:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:textColor}}>{t.asunto}</div><div style={{fontSize:11,color:subText}}>{t.clienteNombre} · {t.clienteEmail} · {t.fecha}</div></div>
                          <Badge color={t.estado==="abierto"?"blue":"gray"} dot>{t.estado}</Badge>
                          {t.estado==="abierto"&&<Btn small variant="success" onClick={()=>closeTicket(t.id)}><Check size={11}/> Cerrar</Btn>}
                          <button onClick={()=>deleteDoc(doc(db,"tickets",String(t.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={13}/></button>
                        </div>
                        <div style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:10,padding:"10px 13px",fontSize:13,color:subText,lineHeight:1.6}}>{t.mensaje}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CHAT ADMIN */}
            {adminTab==="chat"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Chat con Clientes</h2><p style={{color:subText,margin:0,fontSize:12}}>{chats.length} mensajes</p></div>
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:16,overflow:"hidden"}}>
                  <div ref={chatRef} style={{maxHeight:400,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
                    {chats.length===0&&<div style={{textAlign:"center",color:subText,padding:"20px 0"}}>Sin mensajes aún</div>}
                    {chats.map(msg=>(
                      <div key={msg.id} style={{display:"flex",flexDirection:"column",alignItems:msg.de==="admin"?"flex-end":"flex-start"}}>
                        <div style={{background:msg.de==="admin"?"linear-gradient(135deg,#6366f1,#a855f7)":darkMode?"#1e1e2e":"#e5e7eb",color:msg.de==="admin"?"#fff":textColor,borderRadius:12,padding:"8px 12px",maxWidth:"70%",fontSize:13}}>
                          {msg.texto}
                        </div>
                        <span style={{fontSize:10,color:subText,marginTop:2}}>{msg.de==="admin"?"Tú (Admin)":msg.de} · {msg.hora}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendChat} style={{display:"flex",gap:8,padding:"12px 16px",borderTop:`1px solid ${borderColor}`}}>
                    <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Escribe tu respuesta..." style={{flex:1,background:darkMode?"#080812":"#f0f2f8",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px 13px",color:textColor,fontSize:13,outline:"none"}}/>
                    <Btn type="submit"><Send size={13}/> Enviar</Btn>
                  </form>
                </div>
              </>
            )}

            {/* PAGOS */}
            {adminTab==="payments"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Pagos con Yape</h2><p style={{color:subText,margin:0,fontSize:12}}>{payments.filter(p=>p.estado==="pendiente").length} pendientes · {payments.length} total</p></div>
                {payments.length===0?<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin pagos registrados</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {payments.map(p=>(
                      <div key={p.id} style={{background:cardBg,border:`1px solid ${p.estado==="pendiente"?"#1e3a8a":p.estado==="aprobado"?"#166534":"#7f1d1d"}`,borderRadius:14,padding:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:14,color:textColor}}>{p.clienteNombre}</div>
                            <div style={{fontSize:12,color:subText}}>{p.clienteEmail} · {p.plan} · {p.precio} · {p.fecha}</div>
                          </div>
                          <Badge color={p.estado==="pendiente"?"blue":p.estado==="aprobado"?"green":"red"} dot>{p.estado}</Badge>
                          {p.estado==="pendiente"&&(
                            <div style={{display:"flex",gap:6}}>
                              <Btn small variant="success" onClick={()=>approvePayment(p)}><Check size={11}/> Aprobar</Btn>
                              <Btn small variant="danger" onClick={()=>rejectPayment(p.id)}><X size={11}/> Rechazar</Btn>
                            </div>
                          )}
                          <button onClick={()=>deleteDoc(doc(db,"payments",String(p.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={13}/></button>
                        </div>
                        {p.captura&&(
                          <div style={{marginTop:8}}>
                            <div style={{fontSize:11,color:subText,marginBottom:6}}>Comprobante de pago:</div>
                            <img src={p.captura} alt="comprobante" style={{maxWidth:"100%",maxHeight:200,borderRadius:10,objectFit:"contain",border:"1px solid " + borderColor}}/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ANALYTICS */}
            {adminTab==="analytics"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Analytics</h2><p style={{color:subText,margin:0,fontSize:12}}>Resumen del negocio</p></div>
                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24}}>
                  {[
                    {label:"Usuarios totales",value:users.length,color:"#6366f1",icon:"👥"},
                    {label:"Usuarios activos",value:users.filter(u=>u.activo!==false).length,color:"#1DB954",icon:"✅"},
                    {label:"Cuentas disponibles",value:availableAcc,color:"#3b5bdb",icon:"💳"},
                    {label:"Keys activas",value:activeKeys.length,color:"#a855f7",icon:"🔑"},
                    {label:"Pagos aprobados",value:payments.filter(p=>p.estado==="aprobado").length,color:"#4ade80",icon:"💰"},
                    {label:"Pagos pendientes",value:payments.filter(p=>p.estado==="pendiente").length,color:"#fbbf24",icon:"⏳"},
                    {label:"Tickets abiertos",value:openTickets.length,color:"#f87171",icon:"🎫"},
                    {label:"Calificacion prom",value:(ratings.length>0?(ratings.reduce((a,r)=>a+r.estrellas,0)/ratings.length).toFixed(1):"N/A"),color:"#fbbf24",icon:"⭐"},
                  ].map(s=>(
                    <div key={s.label} style={{background:cardBg,border:`1px solid ${s.color}33`,borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
                      <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
                      <div style={{fontSize:26,fontWeight:900,color:s.color,letterSpacing:-1}}>{s.value}</div>
                      <div style={{fontSize:10,color:subText,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Ingresos estimados */}
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:16}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>💰 Ingresos estimados</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
                    {[
                      {label:"Pagos aprobados",value:"S/. " + payments.filter(p=>p.estado==="aprobado").reduce((a,p)=>a+parseInt(p.precio.replace("S/. ","")||0),0)},
                      {label:"Pendientes",value:"S/. " + payments.filter(p=>p.estado==="pendiente").reduce((a,p)=>a+parseInt(p.precio.replace("S/. ","")||0),0)},
                      {label:"Total generado",value:"S/. " + payments.reduce((a,p)=>a+parseInt(p.precio.replace("S/. ","")||0),0)},
                    ].map(s=>(
                      <div key={s.label} style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
                        <div style={{fontSize:20,fontWeight:800,color:"#4ade80"}}>{s.value}</div>
                        <div style={{fontSize:11,color:subText,marginTop:2}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Plataformas más populares */}
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:16}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>📺 Plataformas más solicitadas</h3>
                  {PLATFORMS.map(p=>{
                    const count = granted.filter(g=>g.plataforma===p.id).length;
                    const max = Math.max(...PLATFORMS.map(pl=>granted.filter(g=>g.plataforma===pl.id).length),1);
                    return count>0?(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <PlatformIcon id={p.id} size={24}/>
                        <span style={{fontSize:13,color:textColor,minWidth:100}}>{p.name}</span>
                        <div style={{flex:1,background:darkMode?"#1e1e2e":"#e5e7eb",borderRadius:999,height:8,overflow:"hidden"}}>
                          <div style={{width:(count/max*100)+"%",background:`linear-gradient(90deg,${p.color},${p.color}88)`,height:"100%",borderRadius:999,transition:"width 0.5s"}}/>
                        </div>
                        <span style={{fontSize:12,color:subText,minWidth:30}}>{count}</span>
                      </div>
                    ):null;
                  })}
                  {granted.length===0&&<div style={{textAlign:"center",color:subText,fontSize:13}}>Sin datos aún</div>}
                </div>
                {/* Calificaciones */}
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>⭐ Calificaciones de clientes</h3>
                  {ratings.length===0?<div style={{textAlign:"center",color:subText,fontSize:13}}>Sin calificaciones aún</div>:(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {ratings.slice(0,10).map(r=>{
                        const plat=PLATFORMS.find(p=>p.id===r.plataforma);
                        return (
                          <div key={r.id} style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:10,padding:"10px 13px",display:"flex",gap:10,alignItems:"flex-start"}}>
                            <PlatformIcon id={r.plataforma} size={24}/>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                                <span style={{fontWeight:600,fontSize:13,color:textColor}}>{r.clienteNombre}</span>
                                <span style={{fontSize:12,color:"#fbbf24"}}>{"⭐".repeat(r.estrellas)}</span>
                                <span style={{fontSize:11,color:subText}}>{r.fecha}</span>
                              </div>
                              {r.comentario&&<div style={{fontSize:12,color:subText,fontStyle:"italic"}}>"{r.comentario}"</div>}
                            </div>
                            <button onClick={()=>deleteDoc(doc(db,"ratings",String(r.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={12}/></button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* USUARIOS */}
            {adminTab==="users"&&(
              <>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
                  <div><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Usuarios</h2><p style={{color:subText,margin:0,fontSize:12}}>{users.length} registrados</p></div>
                  <Btn onClick={()=>{ setNewUser({email:"",password:"",nombre:""}); setModal("newUser"); }}><Plus size={14}/> Crear Usuario</Btn>
                </div>
                {users.length===0?<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin usuarios.</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {users.map(u=>(
                      <div key={u.id} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:(u.keys||[]).length>0?10:0}}>
                          <Avatar user={u} size={36}/>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:14,color:textColor}}>{u.nombre}</div>
                            <div style={{fontSize:12,color:subText}}>{u.email} · {u.ultimoLogin?`Login: ${new Date(u.ultimoLogin).toLocaleDateString("es-PE")}`:"Nunca"}</div>
                          </div>
                          <Badge color={u.activo!==false?"green":"red"} dot>{u.activo!==false?"Activo":"Inactivo"}</Badge>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            <Btn small variant="success" onClick={()=>{ setModal("userKey"); setNewUserKeyPlat("netflix"); setNewUserKeyDur("30d"); setNewUser({...newUser,_uid:u.id,_nombre:u.nombre}); }}><Key size={11}/> Key</Btn>
                            <Btn small variant={u.activo!==false?"amber":"success"} onClick={()=>toggleUserActive(u.id,u.activo!==false)}>{u.activo!==false?"Desactivar":"Activar"}</Btn>
                            <Btn small variant="danger" onClick={()=>deleteUser(u.id)}><Trash2 size={11}/></Btn>
                          </div>
                        </div>
                        {(u.keys||[]).length>0&&(
                          <div style={{background:darkMode?"#080812":"#f0f2f8",borderRadius:10,padding:"8px 12px"}}>
                            <div style={{fontSize:10,color:subText,marginBottom:5,fontWeight:600}}>KEYS ASIGNADAS</div>
                            {(u.keys||[]).map((k,i)=>{
                              const expired=k.expiraEn&&new Date()>new Date(k.expiraEn);
                              return <div key={i} style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                                <code style={{fontSize:12,fontWeight:700,color:expired?"#6b7280":"#c4b5fd",letterSpacing:1}}>{k.codigo}</code>
                                <span style={{fontSize:11,color:subText}}>{PLATFORMS.find(p=>p.id===k.plataforma)?.name} · {k.duracion}</span>
                                <Badge color={expired?"red":"green"} dot>{expired?"Expirada":"Activa"}</Badge>
                                <button onClick={()=>copyText(k.codigo,`uk-${i}`)} style={{background:"none",border:"none",cursor:"pointer",color:copied===`uk-${i}`?"#4ade80":subText}}>{copied===`uk-${i}`?<Check size={11}/>:<Copy size={11}/>}</button>
                              </div>;
                            })}
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
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
                  <div><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Cuentas</h2><p style={{color:subText,margin:0,fontSize:12}}>☁️ Firebase</p></div>
                  <Btn onClick={()=>{ setNewAcc({email:"",password:"",profile:"",platform:"",expiresAt:""}); setModal("addAccount"); }}><Plus size={14}/> Agregar</Btn>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:18}}>
                  {[{label:"Total",value:totalAcc,color:"#6366f1"},{label:"Disponibles",value:availableAcc,color:"#1DB954"},{label:"Ocupadas",value:totalAcc-availableAcc,color:"#f59e0b"},{label:"Otorgadas",value:granted.length,color:"#a855f7"}].map(s=>(
                    <div key={s.label} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
                      <div style={{fontSize:11,color:subText,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {PLATFORMS.map(platform=>{
                  const pAccs=accounts[platform.id]||[];
                  if (!pAccs.length) return null;
                  return (
                    <div key={platform.id} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:16,marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <PlatformIcon id={platform.id} size={32}/>
                        <span style={{fontWeight:700,fontSize:14,color:textColor}}>{platform.name}</span>
                        <Badge color={pAccs.filter(a=>a.status==="disponible").length>0?"green":"red"} dot>{pAccs.filter(a=>a.status==="disponible").length} disponibles</Badge>
                      </div>
                      {pAccs.map(acc=>{
                        const days=daysUntil(acc.expiresAt); const expWarn=days!==null&&days<=7;
                        const isEditing=editingAcc&&editingAcc.platform===platform.id&&editingAcc.id===acc.id;
                        return (
                          <div key={acc.id} style={{background:darkMode?"#08080f":"#f8f9fa",border:`1px solid ${expWarn?"#78350f44":borderColor}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:acc.status==="disponible"?"#1DB954":"#f59e0b",flexShrink:0}}/>
                              {isEditing&&editingAcc.field==="email"?<input autoFocus value={editingAcc.value} onChange={e=>setEditingAcc(v=>({...v,value:e.target.value}))} onBlur={saveEdit} onKeyDown={e=>e.key==="Enter"&&saveEdit()} style={{flex:1,background:darkMode?"#1a1a2e":"#e0e7ff",border:"1px solid #6366f1",borderRadius:7,padding:"4px 8px",color:textColor,fontSize:13,outline:"none"}}/>:<span onClick={()=>startEdit(platform.id,acc.id,"email",acc.email)} style={{flex:1,fontSize:13,fontWeight:600,cursor:"text",color:textColor}}>{acc.email}</span>}
                              <div style={{display:"flex",alignItems:"center",gap:3}}>
                                <span style={{background:darkMode?"#1a1a2e":"#e5e7eb",borderRadius:6,padding:"2px 8px",fontSize:12,color:subText,fontFamily:"monospace"}}>{showPasses[acc.id]?acc.password:"••••••••"}</span>
                                <button onClick={()=>setShowPasses(p=>({...p,[acc.id]:!p[acc.id]}))} style={{background:"none",border:"none",cursor:"pointer",color:subText,padding:2}}>{showPasses[acc.id]?<EyeOff size={12}/>:<Eye size={12}/>}</button>
                                <button onClick={()=>copyText(`${acc.email} | ${acc.password}`,acc.id)} style={{background:"none",border:"none",cursor:"pointer",color:copied===acc.id?"#1DB954":subText,padding:2}}>{copied===acc.id?<Check size={12}/>:<Copy size={12}/>}</button>
                              </div>
                              <span style={{fontSize:11,color:expWarn?"#fbbf24":subText}}>{acc.expiresAt?fmt(acc.expiresAt):"Sin fecha"}</span>
                              {acc.assignedTo&&<Badge color="blue"><UserCheck size={10}/> {acc.assignedTo}</Badge>}
                              <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
                                <Btn small variant="ghost" onClick={()=>{ setAssignModal({platform:platform.id,accId:acc.id}); setAssignName(""); }}><UserCheck size={10}/></Btn>
                                <Btn small variant={acc.status==="disponible"?"ghost":"success"} onClick={()=>toggleStatus(platform.id,acc.id)}>{acc.status==="disponible"?<ToggleRight size={10}/>:<ToggleLeft size={10}/>}</Btn>
                                <Btn small variant="danger" onClick={()=>deleteAccount(platform.id,acc.id)}><Trash2 size={10}/></Btn>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {!PLATFORMS.some(p=>(accounts[p.id]||[]).length>0)&&<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin cuentas aún.</div>}
              </>
            )}

            {/* KEYS */}
            {adminTab==="keys"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Keys</h2><p style={{color:subText,margin:0,fontSize:12}}>{activeKeys.length} activas</p></div>
                <div style={{background:cardBg,border:"1px solid #6366f133",borderRadius:16,padding:20,marginBottom:20}}>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                    <div style={{flex:1,minWidth:160}}><Select dark={darkMode} label="Plataforma" value={genKeyPlat} onChange={e=>setGenKeyPlat(e.target.value)}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
                    <div style={{flex:1,minWidth:140}}><Select dark={darkMode} label="Duración" value={genKeyDur} onChange={e=>setGenKeyDur(e.target.value)}><option value="1h">1 hora</option><option value="6h">6 horas</option><option value="12h">12 horas</option><option value="1d">1 día</option><option value="3d">3 días</option><option value="7d">7 días</option><option value="15d">15 días</option><option value="30d">30 días</option><option value="ilimitada">Ilimitada</option></Select></div>
                  </div>
                  <Btn onClick={generateKey} style={{width:"100%",justifyContent:"center"}}><Key size={14}/> Generar Key</Btn>
                  {genKeyResult&&(
                    <div style={{background:"#052e16",border:"1px solid #166534",borderRadius:12,padding:14,marginTop:14,textAlign:"center"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                        <code style={{fontSize:20,fontWeight:800,color:"#4ade80",letterSpacing:2}}>{genKeyResult.codigo}</code>
                        <button onClick={()=>copyText(genKeyResult.codigo,"genkey")} style={{background:"none",border:"none",cursor:"pointer",color:copied==="genkey"?"#4ade80":"#6b7280"}}>{copied==="genkey"?<Check size={16}/>:<Copy size={16}/>}</button>
                      </div>
                      <div style={{fontSize:12,color:"#86efac",marginTop:6}}>📺 {PLATFORMS.find(p=>p.id===genKeyResult.plataforma)?.name} · ⏱ {genKeyResult.duracion}</div>
                    </div>
                  )}
                </div>
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,overflow:"hidden"}}>
                  {keys.length===0?<div style={{textAlign:"center",color:subText,padding:"40px 0"}}>No hay keys</div>:keys.map((k,i)=>{
                    const expired=k.expiraEn&&new Date()>new Date(k.expiraEn);
                    return (
                      <div key={k.id} style={{padding:"11px 16px",borderBottom:i<keys.length-1?`1px solid ${borderColor}`:"none",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <PlatformIcon id={k.plataforma} size={26}/>
                        <div style={{flex:1}}><code style={{fontSize:13,fontWeight:700,color:k.usada||expired?"#6b7280":"#c4b5fd",letterSpacing:1}}>{k.codigo}</code><div style={{fontSize:11,color:subText}}>{PLATFORMS.find(p=>p.id===k.plataforma)?.name} · {k.duracion}</div></div>
                        <Badge color={k.usada?"gray":expired?"red":"green"} dot>{k.usada?"Usada":expired?"Expirada":"Activa"}</Badge>
                        <button onClick={()=>copyText(k.codigo,k.id)} style={{background:"none",border:"none",cursor:"pointer",color:copied===k.id?"#4ade80":subText}}>{copied===k.id?<Check size={12}/>:<Copy size={12}/>}</button>
                        <button onClick={()=>deleteDoc(doc(db,"keys",String(k.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={12}/></button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* OTORGADAS */}
            {adminTab==="granted"&&(
              <>
                <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Cuentas Otorgadas</h2><p style={{color:subText,margin:0,fontSize:12}}>{granted.length} registros</p></div>
                {granted.length===0?<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin cuentas otorgadas.</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {granted.map(g=>{ const plat=PLATFORMS.find(p=>p.id===g.plataforma); return (
                      <div key={g.id} style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,padding:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                          <PlatformIcon id={g.plataforma} size={26}/>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:textColor}}>{plat?.name}</div><div style={{fontSize:11,color:subText}}>{g.otorgadaEnFmt}{g.clienteEmail?` · ${g.clienteEmail}`:""}</div></div>
                          <Badge color="purple" dot>otorgada</Badge>
                          <button onClick={()=>deleteDoc(doc(db,"granted",String(g.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={12}/></button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <div style={{background:darkMode?"#08080f":"#f0f2f8",borderRadius:8,padding:"7px 11px",fontSize:12}}>
                            <div style={{color:subText,marginBottom:2}}>📧 Email</div>
                            <div style={{display:"flex",gap:4}}><span style={{flex:1,wordBreak:"break-all",color:textColor}}>{g.email}</span><button onClick={()=>copyText(g.email,`ge-${g.id}`)} style={{background:"none",border:"none",cursor:"pointer",color:copied===`ge-${g.id}`?"#4ade80":subText}}>{copied===`ge-${g.id}`?<Check size={11}/>:<Copy size={11}/>}</button></div>
                          </div>
                          <div style={{background:darkMode?"#08080f":"#f0f2f8",borderRadius:8,padding:"7px 11px",fontSize:12}}>
                            <div style={{color:subText,marginBottom:2}}>🔑 Contraseña</div>
                            <div style={{display:"flex",gap:4}}><span style={{flex:1,fontFamily:"monospace",color:textColor}}>{g.password}</span><button onClick={()=>copyText(g.password,`gp-${g.id}`)} style={{background:"none",border:"none",cursor:"pointer",color:copied===`gp-${g.id}`?"#4ade80":subText}}>{copied===`gp-${g.id}`?<Check size={11}/>:<Copy size={11}/>}</button></div>
                          </div>
                        </div>
                      </div>
                    ); })}
                  </div>
                )}
              </>
            )}

            {/* PAGOS */}
            {adminTab==="payments"&&(
              <>
                <div style={{marginBottom:20}}>
                  <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Pagos con Yape</h2>
                  <p style={{color:subText,margin:0,fontSize:12}}>{payments.filter(p=>p.estado==="pendiente").length} pendientes · {payments.length} total</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:18}}>
                  {[
                    {label:"Pendientes",value:payments.filter(p=>p.estado==="pendiente").length,color:"#fbbf24"},
                    {label:"Aprobados",value:payments.filter(p=>p.estado==="aprobado").length,color:"#1DB954"},
                    {label:"Rechazados",value:payments.filter(p=>p.estado==="rechazado").length,color:"#f87171"},
                    {label:"Total S/.",value:payments.filter(p=>p.estado==="aprobado").reduce((sum,p)=>sum+parseInt(p.precio.replace("S/. ","")||0),0),color:"#6366f1"},
                  ].map(s=>(
                    <div key={s.label} style={{background:cardBg,border:`1px solid ${s.color}33`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.label==="Total S/."?"S/. "+s.value:s.value}</div>
                      <div style={{fontSize:11,color:subText,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {payments.length===0?<div style={{textAlign:"center",color:subText,padding:"60px 0"}}>Sin pagos aún</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {payments.map(pay=>(
                      <div key={pay.id} style={{background:cardBg,border:`1px solid ${pay.estado==="pendiente"?"#78350f":pay.estado==="aprobado"?"#166534":"#7f1d1d"}`,borderRadius:14,padding:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:pay.captura?12:0}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:14,color:textColor}}>{pay.clienteNombre}</div>
                            <div style={{fontSize:12,color:subText}}>{pay.clienteEmail} · {pay.plan} · {pay.precio} · {pay.fecha}</div>
                          </div>
                          <Badge color={pay.estado==="pendiente"?"amber":pay.estado==="aprobado"?"green":"red"} dot>{pay.estado}</Badge>
                          {pay.estado==="pendiente"&&(
                            <div style={{display:"flex",gap:6}}>
                              <Btn small variant="success" onClick={()=>approvePayment(pay)}><Check size={11}/> Aprobar</Btn>
                              <Btn small variant="danger" onClick={()=>rejectPayment(pay.id)}><X size={11}/> Rechazar</Btn>
                            </div>
                          )}
                          <button onClick={()=>deleteDoc(doc(db,"payments",String(pay.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={12}/></button>
                        </div>
                        {pay.captura&&(
                          <div style={{marginTop:8}}>
                            <div style={{fontSize:11,color:subText,marginBottom:6}}>Comprobante:</div>
                            <img src={pay.captura} alt="comprobante" style={{maxWidth:200,maxHeight:150,borderRadius:8,objectFit:"contain",border:"1px solid "+borderColor,cursor:"pointer"}} onClick={()=>window.open(pay.captura,"_blank")}/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ANALYTICS */}
            {adminTab==="analytics"&&(
              <>
                <div style={{marginBottom:20}}>
                  <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 2px",color:textColor}}>Analytics</h2>
                  <p style={{color:subText,margin:0,fontSize:12}}>Resumen de tu negocio en tiempo real</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24}}>
                  {[
                    {label:"Clientes activos",value:users.filter(u=>u.activo!==false).length,icon:"👥",color:"#6366f1"},
                    {label:"Ingresos aprobados",value:"S/. "+payments.filter(p=>p.estado==="aprobado").reduce((s,p)=>s+parseInt(p.precio.replace("S/. ","")||0),0),icon:"💰",color:"#1DB954"},
                    {label:"Keys activas",value:keys.filter(k=>!k.usada&&(!k.expiraEn||new Date()<new Date(k.expiraEn))).length,icon:"🔑",color:"#a855f7"},
                    {label:"Cuentas disponibles",value:availableAcc,icon:"✅",color:"#00A8E1"},
                    {label:"Tickets abiertos",value:tickets.filter(t=>t.estado==="abierto").length,icon:"🎫",color:"#f59e0b"},
                    {label:"Calificación prom.",value:ratings.length>0?(ratings.reduce((s,r)=>s+r.estrellas,0)/ratings.length).toFixed(1)+"⭐":"—",icon:"⭐",color:"#fbbf24"},
                  ].map(s=>(
                    <div key={s.label} style={{background:cardBg,border:`1px solid ${s.color}33`,borderRadius:14,padding:"16px 14px",textAlign:"center"}}>
                      <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                      <div style={{fontSize:24,fontWeight:900,color:s.color,letterSpacing:-1}}>{s.value}</div>
                      <div style={{fontSize:11,color:subText,marginTop:4}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Plataformas más populares */}
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:18,marginBottom:16}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>📊 Plataformas más solicitadas</h3>
                  {PLATFORMS.map(p=>{
                    const count=(accounts[p.id]||[]).length;
                    const avail=(accounts[p.id]||[]).filter(a=>a.status==="disponible").length;
                    const total=Object.values(accounts).flat().length||1;
                    const pct=Math.round((count/total)*100);
                    return (
                      <div key={p.id} style={{marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <PlatformIcon id={p.id} size={20}/>
                          <span style={{fontSize:12,fontWeight:600,flex:1,color:textColor}}>{p.name}</span>
                          <span style={{fontSize:11,color:subText}}>{avail}/{count} disp.</span>
                        </div>
                        <div style={{background:darkMode?"#1e1e2e":"#e5e7eb",borderRadius:999,height:6,overflow:"hidden"}}>
                          <div style={{width:pct+"%",height:"100%",background:`linear-gradient(90deg,${p.color},${p.color}88)`,borderRadius:999,transition:"width 0.5s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calificaciones recientes */}
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:18}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 14px",color:textColor}}>⭐ Calificaciones recientes</h3>
                  {ratings.length===0?<div style={{textAlign:"center",color:subText,padding:"20px 0"}}>Sin calificaciones aún</div>:(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {ratings.slice(0,10).map(r=>(
                        <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${borderColor}`}}>
                          <PlatformIcon id={r.plataforma} size={24}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:600,color:textColor}}>{r.clienteNombre}</div>
                            {r.comentario&&<div style={{fontSize:11,color:subText}}>{r.comentario}</div>}
                          </div>
                          <div style={{fontSize:14}}>{Array(r.estrellas).fill("⭐").join("")}</div>
                          <button onClick={()=>deleteDoc(doc(db,"ratings",String(r.id)))} style={{background:"none",border:"none",cursor:"pointer",color:subText}}><Trash2 size={11}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* CONFIG */}
            {adminTab==="settings"&&(
              <>
                <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 24px",color:textColor}}>Configuración</h2>
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:20,marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Bell size={18} color="#4ade80"/><div><div style={{fontWeight:700,fontSize:14,color:textColor}}>Notificaciones Push</div><div style={{fontSize:11,color:subText}}>ntfy.sh · {NTFY_TOPIC}</div></div></div>
                  <Btn variant="success" onClick={async()=>{ await pushNotify("🧪 Prueba","Notificaciones activas ✅"); toast("Enviado"); }}><Bell size={13}/> Probar</Btn>
                </div>
                <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:14,padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Key size={18} color="#c4b5fd"/><div style={{fontWeight:700,fontSize:14,color:textColor}}>Cambiar contraseña admin</div></div>
                  <Input dark={darkMode} label="Contraseña actual" type="password" placeholder="••••••••" value={newPass.current} onChange={e=>setNewPass(p=>({...p,current:e.target.value}))}/>
                  <Input dark={darkMode} label="Nueva contraseña" type="password" placeholder="Mínimo 6 caracteres" value={newPass.next} onChange={e=>setNewPass(p=>({...p,next:e.target.value}))}/>
                  <Input dark={darkMode} label="Confirmar" type="password" placeholder="Repite" value={newPass.confirm} onChange={e=>setNewPass(p=>({...p,confirm:e.target.value}))}/>
                  <Btn onClick={changeAdminPass}><Key size={13}/> Actualizar</Btn>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ═══ MODAL PAGO YAPE ═══ */}
      {payModal&&clientUser&&(
        <Modal title="Pagar con Yape" sub={payModal.plan + " — " + payModal.precio} onClose={()=>{ setPayModal(null); setPayStep(1); setPayCaptura(null); }} width={420} dark={darkMode}>
          {payStep===1&&(
            <>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:13,color:subText,marginBottom:12}}>Escanea el QR con tu app de Yape</div>
                <div style={{background:"#fff",borderRadius:16,padding:12,display:"inline-block",marginBottom:12}}>
                  <img src={"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=yape://pay?phone=901815489%26amount=" + payModal.precio.replace("S/. ","")} alt="QR Yape" style={{width:180,height:180,display:"block"}}/>
                </div>
                <div style={{background:darkMode?"#0f0f1a":"#f0f2f8",border:"1px solid #6366f133",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                  <div style={{fontSize:11,color:subText,marginBottom:4}}>Número Yape</div>
                  <div style={{fontSize:20,fontWeight:800,color:"#6366f1",letterSpacing:1}}>901 815 489</div>
                  <div style={{fontSize:12,color:subText,marginTop:2}}>Alex Eren</div>
                </div>
                <div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#4ade80",marginBottom:16}}>
                  Monto exacto: <strong>{payModal.precio}</strong> — {payModal.plan}
                </div>
              </div>
              <Btn onClick={()=>setPayStep(2)} style={{width:"100%",justifyContent:"center"}}>Ya pagué — Subir captura</Btn>
            </>
          )}
          {payStep===2&&(
            <>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:13,color:subText,marginBottom:12}}>Sube una captura de pantalla del comprobante de Yape</div>
                <label style={{display:"block",cursor:"pointer"}}>
                  <div style={{background:darkMode?"#0f0f1a":"#f0f2f8",border:"2px dashed #6366f1",borderRadius:14,padding:"28px 20px",textAlign:"center",transition:"all 0.2s"}}>
                    {payCaptura?(
                      <img src={payCaptura} alt="captura" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,objectFit:"contain"}}/>
                    ):(
                      <>
                        <Camera size={32} color="#6366f1" style={{marginBottom:8}}/>
                        <div style={{fontSize:13,color:"#6366f1",fontWeight:600}}>Toca para subir captura</div>
                        <div style={{fontSize:11,color:subText,marginTop:4}}>JPG, PNG — máx 1MB</div>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                    const file=e.target.files[0];
                    if (!file) return;
                    if (file.size>1000000) { toast("La imagen debe ser menor a 1MB","error"); return; }
                    const reader=new FileReader();
                    reader.onload=ev=>setPayCaptura(ev.target.result);
                    reader.readAsDataURL(file);
                  }}/>
                </label>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <Btn variant="ghost" onClick={()=>setPayStep(1)} style={{flex:1,justifyContent:"center"}}>Atrás</Btn>
                <Btn onClick={submitPayment} style={{flex:2,justifyContent:"center"}} disabled={!payCaptura||payUploading}>
                  {payUploading?"Enviando...":"Enviar comprobante"}
                </Btn>
              </div>
            </>
          )}
          {payStep===3&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <h3 style={{fontSize:18,fontWeight:800,margin:"0 0 8px",color:textColor}}>¡Pago enviado!</h3>
              <p style={{color:subText,fontSize:13,margin:"0 0 16px"}}>El admin revisará tu comprobante y aprobará tu plan en breve. Recibirás tu key de acceso.</p>
              <Btn onClick={()=>{ setPayModal(null); setPayStep(1); setPayCaptura(null); }} style={{width:"100%",justifyContent:"center"}}>Entendido</Btn>
            </div>
          )}
        </Modal>
      )}

      {/* ═══ MODAL CALIFICACION ═══ */}
      {ratingModal&&clientUser&&(
        <Modal title="Califica el servicio" sub="Tu opinión nos ayuda a mejorar" onClose={()=>setRatingModal(null)} width={400} dark={darkMode}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <PlatformIcon id={ratingModal} size={48}/>
            <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:14,marginBottom:8}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setRatingVal(s)} style={{background:"none",border:"none",cursor:"pointer",fontSize:32,transition:"transform 0.15s",transform:ratingVal>=s?"scale(1.2)":"scale(1)"}}>
                  {ratingVal>=s?"⭐":"☆"}
                </button>
              ))}
            </div>
            <div style={{fontSize:13,color:subText}}>{ratingVal===5?"¡Excelente!":ratingVal===4?"Muy bueno":ratingVal===3?"Regular":ratingVal===2?"Malo":"Muy malo"}</div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:subText,display:"block",marginBottom:6,fontWeight:600}}>Comentario (opcional)</label>
            <textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value)} placeholder="Cuéntanos tu experiencia..." rows={3} style={{width:"100%",background:darkMode?"#080812":"#f8f9fa",border:"1px solid " + borderColor,borderRadius:10,padding:"10px 13px",color:textColor,fontSize:13,outline:"none",boxSizing:"border-box",resize:"none",fontFamily:"inherit"}}/>
          </div>
          <Btn onClick={submitRating} style={{width:"100%",justifyContent:"center"}}><Star size={14}/> Enviar calificación</Btn>
        </Modal>
      )}

      {/* ═══ MODALES ═══ */}
      {modal==="view"&&selPlatform&&clientUser&&(
        <Modal title={selPlatform.name} sub={selPlatform.desc} onClose={()=>setModal(null)} dark={darkMode}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><PlatformIcon id={selPlatform.id} size={56}/></div>
          {(()=>{ const avail=(accounts[selPlatform.id]||[]).filter(a=>a.status==="disponible").length; return avail>0?<div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:10,marginBottom:14,textAlign:"center"}}><div style={{fontSize:13,color:"#4ade80",fontWeight:700}}>✅ {avail} disponible{avail!==1?"s":""}</div></div>:<div style={{background:"#1a0000",border:"1px solid #7f1d1d33",borderRadius:10,padding:12,marginBottom:14,textAlign:"center"}}><div style={{fontSize:13,color:"#fca5a5"}}>Sin stock actualmente</div></div>; })()}
          <Btn onClick={()=>{ setModal("activarKey"); setKeyInput(""); setKeyError(""); }} style={{width:"100%",justifyContent:"center"}}><Key size={14}/> Activar key para {selPlatform.name}</Btn>
        </Modal>
      )}

      {modal==="activarKey"&&(
        <Modal title="Activar Key" sub="Ingresa tu key para acceder" onClose={()=>setModal(null)} width={400} dark={darkMode}>
          <Input dark={darkMode} label="Tu Key" placeholder="Ej: SV-NETF-A1B2C3" value={keyInput} onChange={e=>{ setKeyInput(e.target.value.toUpperCase()); setKeyError(""); }} style={{fontFamily:"monospace",fontSize:18,letterSpacing:3,textAlign:"center"}}/>
          {keyError&&<p style={{color:"#f87171",fontSize:13,margin:"-8px 0 12px",textAlign:"center"}}>❌ {keyError}</p>}
          <Btn onClick={activarKey} style={{width:"100%",justifyContent:"center",padding:"13px 0"}} disabled={keyLoading}>
            {keyLoading?"Verificando...":<><Unlock size={15}/> Activar y ver mi cuenta</>}
          </Btn>
        </Modal>
      )}

      {modal==="addAccount"&&isAdmin&&(
        <Modal title="Agregar Cuenta" onClose={()=>setModal(null)} dark={darkMode}>
          <Select dark={darkMode} label="Plataforma *" value={newAcc.platform} onChange={e=>setNewAcc(a=>({...a,platform:e.target.value}))}><option value="">Seleccionar</option>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Input dark={darkMode} label="Email *" type="text" placeholder="correo@ejemplo.com" value={newAcc.email} onChange={e=>setNewAcc(a=>({...a,email:e.target.value}))}/>
          <Input dark={darkMode} label="Contraseña *" type="text" placeholder="Contraseña" value={newAcc.password} onChange={e=>setNewAcc(a=>({...a,password:e.target.value}))}/>
          <Input dark={darkMode} label="Perfil (opcional)" placeholder="Perfil 1" value={newAcc.profile} onChange={e=>setNewAcc(a=>({...a,profile:e.target.value}))}/>
          <Input dark={darkMode} label="Vencimiento" type="date" value={newAcc.expiresAt} onChange={e=>setNewAcc(a=>({...a,expiresAt:e.target.value}))}/>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{flex:1,justifyContent:"center"}}>Cancelar</Btn>
            <Btn onClick={addAccount} style={{flex:2,justifyContent:"center"}}><Plus size={13}/> Guardar</Btn>
          </div>
        </Modal>
      )}

      {assignModal&&(
        <Modal title="Asignar cuenta" onClose={()=>setAssignModal(null)} width={340} dark={darkMode}>
          <Input dark={darkMode} label="Nombre del cliente" placeholder="Ej: María García" value={assignName} onChange={e=>setAssignName(e.target.value)}/>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setAssignModal(null)} style={{flex:1,justifyContent:"center"}}>Cancelar</Btn>
            <Btn onClick={assignAccount} style={{flex:2,justifyContent:"center"}}><UserCheck size={13}/> Asignar</Btn>
          </div>
        </Modal>
      )}

      {modal==="newUser"&&isAdmin&&(
        <Modal title="Crear Usuario" sub="El cliente usará estas credenciales" onClose={()=>setModal(null)} width={420} dark={darkMode}>
          <Input dark={darkMode} label="Nombre *" placeholder="Ej: Juan Pérez" value={newUser.nombre} onChange={e=>setNewUser(u=>({...u,nombre:e.target.value}))}/>
          <Btn variant="amber" small onClick={()=>{
            const adj=["fast","cool","dark","neo","pro","sky","vip","top","max","ultra"];
            const noun=["stream","vault","user","play","flex","wave","hub","link","net","plus"];
            const num=Math.floor(Math.random()*9000)+1000;
            const pass=Math.random().toString(36).slice(2,6).toUpperCase()+Math.random().toString(36).slice(2,6)+num;
            const email=`${adj[Math.floor(Math.random()*adj.length)]}${noun[Math.floor(Math.random()*noun.length)]}${num}@streamvault.app`;
            setNewUser(u=>({...u,email,password:pass}));
          }} style={{width:"100%",justifyContent:"center",marginBottom:12}}><RefreshCw size={13}/> Generar automático</Btn>
          <Input dark={darkMode} label="Email *" type="text" placeholder="juan@email.com" value={newUser.email} onChange={e=>setNewUser(u=>({...u,email:e.target.value}))}/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:subText,display:"block",marginBottom:6,fontWeight:600}}>Contraseña *</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="text" placeholder="Contraseña para el cliente" value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))} style={{flex:1,background:darkMode?"#080812":"#f8f9fa",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px 13px",color:textColor,fontSize:14,outline:"none",fontFamily:"monospace"}}/>
              <button onClick={()=>copyText(`Email: ${newUser.email}\nContraseña: ${newUser.password}`,"newUserCreds")} style={{background:"none",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px",cursor:"pointer",color:copied==="newUserCreds"?"#4ade80":subText,display:"flex"}}>{copied==="newUserCreds"?<Check size={14}/>:<Copy size={14}/>}</button>
            </div>
          </div>
          {newUser.email&&newUser.password&&(
            <div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#4ade80",lineHeight:1.8}}>
              ✅ <strong>Credenciales:</strong><br/>
              📧 <code style={{background:"#0a3a1a",borderRadius:4,padding:"1px 6px"}}>{newUser.email}</code><br/>
              🔑 <code style={{background:"#0a3a1a",borderRadius:4,padding:"1px 6px"}}>{newUser.password}</code>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{flex:1,justifyContent:"center"}}>Cancelar</Btn>
            <Btn onClick={createUser} style={{flex:2,justifyContent:"center"}}><Plus size={13}/> Crear</Btn>
          </div>
        </Modal>
      )}

      {modal==="userKey"&&isAdmin&&(
        <Modal title={`Key para ${newUser._nombre}`} onClose={()=>setModal(null)} width={380} dark={darkMode}>
          <Select dark={darkMode} label="Plataforma" value={newUserKeyPlat} onChange={e=>setNewUserKeyPlat(e.target.value)}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select dark={darkMode} label="Duración" value={newUserKeyDur} onChange={e=>setNewUserKeyDur(e.target.value)}><option value="1h">1 hora</option><option value="6h">6 horas</option><option value="12h">12 horas</option><option value="1d">1 día</option><option value="3d">3 días</option><option value="7d">7 días</option><option value="15d">15 días</option><option value="30d">30 días</option><option value="ilimitada">Ilimitada</option></Select>
          <Btn onClick={async()=>{ const c=await generateKeyForUser(newUser._uid,newUserKeyPlat,newUserKeyDur); setModal(null); toast(`Key ${c} asignada`); }} style={{width:"100%",justifyContent:"center"}}><Key size={14}/> Generar y asignar</Btn>
        </Modal>
      )}

      {modal==="ticket"&&clientUser&&(
        <Modal title="Nuevo Ticket de Soporte" sub="Cuéntanos tu problema" onClose={()=>setModal(null)} width={420} dark={darkMode}>
          <Input dark={darkMode} label="Asunto *" placeholder="Ej: Mi cuenta no funciona" value={newTicket.asunto} onChange={e=>setNewTicket(t=>({...t,asunto:e.target.value}))}/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:subText,display:"block",marginBottom:6,fontWeight:600}}>Mensaje *</label>
            <textarea value={newTicket.mensaje} onChange={e=>setNewTicket(t=>({...t,mensaje:e.target.value}))} placeholder="Describe tu problema con detalle..." rows={4} style={{width:"100%",background:darkMode?"#080812":"#f8f9fa",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px 13px",color:textColor,fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          <Btn onClick={submitTicket} style={{width:"100%",justifyContent:"center"}}><Ticket size={14}/> Enviar ticket</Btn>
        </Modal>
      )}

      <footer style={{borderTop:`1px solid ${borderColor}`,padding:"20px 16px",textAlign:"center",color:subText,fontSize:12,marginTop:40}}>
        StreamVault © 2026 · <button onClick={()=>window.open(ADMIN_TELEGRAM,"_blank")} style={{background:"none",border:"none",cursor:"pointer",color:"#6366f1",fontSize:12}}>@alex_eren</button>
      </footer>

      </div>
      <style>{`
        *{box-sizing:border-box}
        input::placeholder,textarea::placeholder{color:#4b5563}
        select option{background:#0f0f1a}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:3px}
        details summary::-webkit-details-marker{display:none}
        @keyframes float1{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,30px)}}
        @keyframes float3{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,40px)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes bannerPulse{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px #6366f133}50%{box-shadow:0 0 20px #6366f166}}
        button:active{transform:scale(0.97)!important}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .card-hover{transition:all 0.2s ease}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(99,102,241,0.2)}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px #6366f144}50%{box-shadow:0 0 20px #6366f188}}
        .card-hover:hover{transform:translateY(-4px)!important;transition:all 0.2s ease!important}
        .btn-glow{animation:glow 2s ease-in-out infinite}
      `}</style>
    </div>
  );
}
