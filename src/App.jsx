import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://auxswitfevqgpgvnaodk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eHN3aXRmZXZxZ3Bndm5hb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODM0MjAsImV4cCI6MjA5NjM1OTQyMH0.YX29gtJ9JNUgnK_5pnTSGP63SXEFelX3O1QkxUQWF48";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── PALETTE & COULEURS ──────────────────────────────────────────────────────
const BG = "#f5f0e8";
const SIDEBAR_BG = "#006064";

const PALETTE = [
  { accent:"#e91e8c", grad:"linear-gradient(135deg,#f06,#e91e8c)",   tint:"rgba(233,30,140,.08)", border:"rgba(233,30,140,.22)", icon:"rgba(233,30,140,.12)" },
  { accent:"#0d9488", grad:"linear-gradient(135deg,#2dd4bf,#0d9488)", tint:"rgba(13,148,136,.08)", border:"rgba(13,148,136,.22)", icon:"rgba(13,148,136,.12)" },
  { accent:"#9c27b0", grad:"linear-gradient(135deg,#ab47bc,#7b1fa2)", tint:"rgba(156,39,176,.08)", border:"rgba(156,39,176,.22)", icon:"rgba(156,39,176,.12)" },
  { accent:"#1a237e", grad:"linear-gradient(135deg,#3949ab,#1a237e)", tint:"rgba(26,35,126,.08)",  border:"rgba(26,35,126,.22)",  icon:"rgba(26,35,126,.12)"  },
];
const GOLD = { accent:"#b8860b", grad:"linear-gradient(135deg,#f5c842,#d4a017)", tint:"rgba(212,160,23,.08)", border:"rgba(212,160,23,.22)", icon:"rgba(212,160,23,.12)" };

const SPACE_COLORS = {
  inclusif:    PALETTE[0],
  annee:       PALETTE[1],
  circulaires: PALETTE[2],
  projets:     PALETTE[3],
  climat:      GOLD,
  pastorale:   PALETTE[1],
  ressources:  PALETTE[2],
};

// ─── UTILISATEURS (locaux — pas en base) ─────────────────────────────────────
const USERS = [
  { id:1, name:"Mme Directrice",     role:"superadmin", avatar:"MD", color:"#e91e8c",  password:"directrice2024" },
  { id:2, name:"M. Adjoint",         role:"superadmin", avatar:"MA", color:"#0d9488",  password:"adjoint2024"    },
  { id:3, name:"Mme Admin 1",        role:"admin",      avatar:"A1", color:"#9c27b0",  password:"admin12024"     },
  { id:4, name:"M. Admin 2",         role:"admin",      avatar:"A2", color:"#b8860b",  password:"admin22024"     },
  { id:5, name:"Personnel Enseignant",role:"enseignant", avatar:"PE", color:"#1a237e",  password:"personnel2024"  },
];

// ─── ESPACES (fixes) ─────────────────────────────────────────────────────────
const ESPACES = [
  { id:"inclusif",    nom:"École Inclusive",          icon:"inclusif",    desc:"Ressources inclusion scolaire" },
  { id:"annee",       nom:"Documents de l'Année",     icon:"annee",       desc:"Calendrier, plannings annuels" },
  { id:"circulaires", nom:"Circulaires & Programmes", icon:"circulaires", desc:"Circulaires officielles" },
  { id:"projets",     nom:"Projets",                  icon:"projets",     desc:"Projets pédagogiques" },
  { id:"climat",      nom:"Climat Scolaire",          icon:"climat",      desc:"Vie scolaire, bien-être" },
  { id:"pastorale",   nom:"Pastorale",                icon:"pastorale",   desc:"Vie spirituelle" },
  { id:"ressources",  nom:"Ressources Partagées",     icon:"ressources",  desc:"Enseignants — dépôt & téléchargement" },
];

const CATS_DEFAUT = {
  inclusif:    ["Généralités","Adaptations pédagogiques","Partenaires"],
  annee:       ["Calendrier","Plannings","Règlements"],
  circulaires: ["Ministère","Direction","Mairie"],
  projets:     ["En cours","Validés","Archivés"],
  climat:      ["Vie scolaire","Bien-être","Conflits"],
  pastorale:   ["Prières","Événements","Retraites"],
  ressources:  ["Maternelle","CP-CE1","CE2-CM2","Transversal"],
};

const TYPE_COLORS = {
  PDF:  { bg:"rgba(220,38,38,.12)",   text:"#dc2626" },
  DOCX: { bg:"rgba(37,99,235,.12)",   text:"#2563eb" },
  XLSX: { bg:"rgba(5,150,105,.12)",   text:"#059669" },
  PPTX: { bg:"rgba(217,119,6,.12)",   text:"#d97706" },
  IMG:  { bg:"rgba(124,58,237,.12)",  text:"#7c3aed" },
  AUTRE:{ bg:"rgba(107,114,128,.12)", text:"#6b7280" },
};
const getType = n => { if (!n) return "AUTRE"; const e = n.split(".").pop().toUpperCase(); return ["PDF","DOCX","XLSX","PPTX","IMG"].includes(e) ? e : "AUTRE"; };
const fmtDate = iso => { if (!iso) return ""; const d = new Date(iso); return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) + " à " + d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}); };

// ─── ICONES SVG ──────────────────────────────────────────────────────────────
const Icon = ({ name, size=18, color="currentColor" }) => {
  const s = { width:size, height:size, display:"inline-block", flexShrink:0, verticalAlign:"middle" };
  const p = {
    inclusif:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="5" r="2"/><path d="M9 12h6M12 7v10M7 17c1.5-1 3-1.5 5-1.5s3.5.5 5 1.5"/></svg>,
    annee:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="4" height="4" rx="0.5"/></svg>,
    circulaires: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
    projets:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    climat:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M17 21H7a5 5 0 0 1 0-10h.09A7 7 0 1 1 17 21z"/></svg>,
    pastorale:   <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="7" x2="19" y2="7"/></svg>,
    ressources:  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    home:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    dashboard:   <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    check:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="20 6 9 17 4 12"/></svg>,
    bell:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    download:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    eye:         <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    close:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    download:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
    trash:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    plus:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    file:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    user:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    calendar:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    warning:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    back:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="15 18 9 12 15 6"/></svg>,
    inbox:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  };
  return p[name] || p.file;
};

const SpaceIcon = ({ id, size=42 }) => {
  const c = SPACE_COLORS[id] || PALETTE[0];
  return (
    <div style={{ width:size, height:size, borderRadius:12, flexShrink:0, background:`linear-gradient(145deg,#fff,${c.icon})`, border:`1px solid ${c.border}`, boxShadow:`0 3px 10px ${c.tint},inset 0 1px 0 rgba(255,255,255,.9)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Icon name={id} size={size*0.5} color={c.accent} />
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const glassCard = { background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(0,96,100,0.15)", borderRadius:16, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.06)" };
const btn = { background:"#006064", color:"#fff", border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 };
const btnGhost = { background:"transparent", border:"1.5px solid #006064", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#006064", display:"inline-flex", alignItems:"center", gap:7 };
const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.7)", border:"1.5px solid #006064", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", color:"#006064", boxSizing:"border-box" };

// ─── MODAL ───────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, maxWidth=480 }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:BG, borderRadius:20, padding:28, width:"100%", maxWidth, maxHeight:"90vh", overflowY:"auto", border:"1px solid rgba(255,255,255,.3)", boxShadow:"0 24px 60px rgba(0,0,0,.3)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, margin:0, color:"#006064" }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(0,96,100,.5)", fontSize:20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── DOC CARD ────────────────────────────────────────────────────────────────
const DocCard = ({ doc, espaceId, onOpen, onDelete, canDelete }) => {
  const [hov, setHov] = useState(false);
  const c = SPACE_COLORS[espaceId] || PALETTE[0];
  const tc = TYPE_COLORS[doc.type] || TYPE_COLORS.AUTRE;
  const sc = doc.status==="valide" ? {bg:"rgba(5,150,105,.15)",text:"#6ee7b7"} : doc.status==="attente" ? {bg:"rgba(217,119,6,.15)",text:"#fcd34d"} : {bg:"rgba(220,38,38,.15)",text:"#fca5a5"};
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onOpen}
      style={{ position:"relative", borderRadius:20, cursor:"pointer", overflow:"hidden", background:"rgba(255,255,255,0.82)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:hov?`1px solid ${c.accent}`:`1px solid rgba(0,96,100,.12)`, transition:"all .28s cubic-bezier(.34,1.56,.64,1)", transform:hov?"translateY(-6px) scale(1.012)":"translateY(0)", boxShadow:hov?`0 22px 44px ${c.tint},0 8px 20px rgba(0,0,0,.08)`:`0 4px 16px rgba(0,0,0,.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c.grad, borderRadius:"20px 20px 0 0" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:60, background:"linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%)", pointerEvents:"none" }} />
      <div style={{ padding:"18px 16px 15px", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="file" size={16} color="#fff" />
          </div>
          <span style={{ background:tc.bg, color:tc.text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:700 }}>{doc.type}</span>
        </div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, marginBottom:6, color:c.accent, lineHeight:1.4 }}>{doc.titre}</div>
        {doc.description && <div style={{ fontSize:12, color:"rgba(0,96,100,.6)", marginBottom:10, lineHeight:1.55, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{doc.description}</div>}
        <div style={{ display:"inline-block", background:"rgba(0,96,100,.08)", color:"#006064", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid rgba(0,96,100,.18)", marginBottom:10 }}>{doc.categorie}</div>
        <div style={{ fontSize:11, color:"rgba(0,96,100,.5)", display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Icon name="user" size={10} color="rgba(0,96,100,.4)" /> {doc.auteur}</span>
          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Icon name="calendar" size={10} color="rgba(0,96,100,.4)" /> {fmtDate(doc.created_at)}</span>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,rgba(0,96,100,.15),transparent)", marginBottom:11 }} />
        <div style={{ display:"flex", alignItems:"center", gap:7 }} onClick={e=>e.stopPropagation()}>
          <span style={{ background:sc.bg, color:sc.text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600, flex:1, textAlign:"center" }}>
            {doc.status==="valide"?"Publié":doc.status==="attente"?"En attente":"Refusé"}
          </span>
          {doc.file_url && (
            <a href={doc.file_url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
              style={{ background:"rgba(0,96,100,.12)", color:"#006064", border:"1px solid rgba(0,96,100,.25)", padding:"6px 9px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", textDecoration:"none" }}>
              <Icon name="download" size={13} color="#006064" />
            </a>
          )}
          {canDelete && (
            <button onClick={()=>onDelete(doc)} style={{ background:"rgba(220,38,38,.15)", color:"#fca5a5", border:"1px solid rgba(220,38,38,.25)", padding:"6px 9px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center" }}>
              <Icon name="trash" size={13} color="#fca5a5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── SPACE CARD ──────────────────────────────────────────────────────────────
const SpaceCard = ({ esp, count, onClick }) => {
  const [hov, setHov] = useState(false);
  const c = SPACE_COLORS[esp.id] || PALETTE[0];
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ position:"relative", borderRadius:20, cursor:"pointer", overflow:"hidden", background:"rgba(255,255,255,0.82)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:hov?`1px solid ${c.accent}`:`1px solid rgba(0,96,100,.12)`, padding:20, transition:"all .28s cubic-bezier(.34,1.56,.64,1)", transform:hov?"translateY(-7px) scale(1.015)":"translateY(0)", boxShadow:hov?`0 24px 48px ${c.tint},0 8px 20px rgba(0,0,0,.08)`:`0 4px 16px rgba(0,0,0,.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:c.grad, borderRadius:"20px 20px 0 0" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:55, background:"linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%)", pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:2 }}>
        <div style={{ marginBottom:14 }}><SpaceIcon id={esp.id} size={42} /></div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, marginBottom:14, color:c.accent }}>{esp.nom}</div>
        <div style={{ height:1, background:`linear-gradient(90deg,${c.border},transparent)`, marginBottom:10 }} />
        <div style={{ fontSize:12, color:"#006064", fontWeight:500 }}>{count} document(s) publié(s)</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
  const [docs, setDocs]         = useState([]);
  const [cats, setCats]         = useState(CATS_DEFAUT);
  const [notifs, setNotifs]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [view, setView]         = useState("accueil");
  const [espace, setEspace]     = useState(null);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch]     = useState("");
  const [sidebar, setSidebar]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [navHistory, setNavHistory] = useState([]);

  // Modals
  const [modalUpload, setModalUpload]       = useState(false);
  const [modalCat, setModalCat]             = useState(false);
  const [modalDetail, setModalDetail]       = useState(null);
  const [modalDelete, setModalDelete]       = useState(null);
  const [modalDeleteCat, setModalDeleteCat] = useState(null);
  const [catInput, setCatInput]             = useState("");
  const [uploadForm, setUploadForm]         = useState({ prenom:"", nom:"", titre:"", desc:"", file:"", fileObj:null });
  const [uploadErrors, setUploadErrors]     = useState({});
  const [refusComment, setRefusComment]     = useState({});
  const [refusErrors, setRefusErrors]       = useState({});
  const [refusMode, setRefusMode]           = useState({});
  const [loginPassword, setLoginPassword]   = useState("");
  const [loginError, setLoginError]         = useState("");

  const isSA    = user?.role === "superadmin";
  const isAdmin = ["superadmin","admin"].includes(user?.role);
  const unread  = notifs.filter(n=>!n.lu).length;
  const pending = docs.filter(d=>d.status==="attente").length;

  useEffect(() => {
    if (user) {
      loadDocs();
      loadCats();
      loadNotifs(user);
    }
  }, [user]);

  const loadDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (data) setDocs(data);
    setLoading(false);
  };

  const loadCats = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data && data.length > 0) {
      const grouped = { ...CATS_DEFAUT };
      data.forEach(c => {
        if (!grouped[c.espace_id]) grouped[c.espace_id] = [];
        if (!grouped[c.espace_id].includes(c.nom)) grouped[c.espace_id].push(c.nom);
      });
      setCats(grouped);
    }
  };

  const loadNotifs = async (currentUser) => {
    const u = currentUser || user;
    if (!u) return;
    const adminRoles = ["superadmin","admin"];
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) {
      const filtered = data.filter(n =>
        !n.destinataire
          ? adminRoles.includes(u.role)
          : n.destinataire === u.name
      );
      setNotifs(filtered);
    }
  };

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(null),3000); };

  const goTo = (v, esp=null) => {
    if (view !== "accueil" && view !== "dashboard") setNavHistory(h=>[...h, {view, espace}]);
    setView(v);
    if (esp) setEspace(esp);
    setCatFilter("all");
    setSearch("");
  };

  const goBack = () => {
    const prev = [...navHistory];
    const last = prev.pop();
    setNavHistory(prev);
    if (last) { setView(last.view); setEspace(last.espace); }
    else setView(isAdmin ? "dashboard" : "accueil");
  };

  const handleLogin = (u) => {
    if (u.password !== loginPassword) {
      setLoginError("Mot de passe incorrect");
      return;
    }
    setLoginError("");
    setLoginPassword("");
    setUser(u);
    setView(isAdmin || u.role === "superadmin" || u.role === "admin" ? "dashboard" : "accueil");
  };

  const handleValider = async (id) => {
    const doc = docs.find(d=>d.id===id);
    await supabase.from("documents").update({ status:"valide", commentaire:"" }).eq("id", id);
    await supabase.from("notifications").insert({ texte:`Votre document "${doc?.titre}" a été validé ✓`, lu:false, destinataire:doc?.auteur });
    loadDocs();
    loadNotifs();
    showToast("Document validé ✓");
  };

  const handleRefuser = async (id) => {
    const motif = refusComment[id]?.trim();
    if (!motif) { setRefusErrors(e=>({...e,[id]:true})); return; }
    const doc = docs.find(d=>d.id===id);
    setRefusErrors(e=>({...e,[id]:false}));
    await supabase.from("documents").update({ status:"refuse", commentaire:motif }).eq("id", id);
    await supabase.from("notifications").insert({ texte:`Votre document "${doc?.titre}" a été refusé — ${motif}`, lu:false, destinataire:doc?.auteur });
    setRefusMode(m=>({...m,[id]:false}));
    setRefusComment(c=>({...c,[id]:""}));
    loadDocs();
    loadNotifs();
    showToast("Document refusé");
  };

  const handleDelete = async (doc) => {
    await supabase.from("documents").delete().eq("id", doc.id);
    setModalDelete(null);
    setModalDetail(null);
    loadDocs();
    showToast("Document supprimé");
  };

  const handleDeleteCat = async () => {
    const { espId, cat } = modalDeleteCat;
    await supabase.from("documents").delete().eq("espace_id", espId).eq("categorie", cat);
    await supabase.from("categories").delete().eq("espace_id", espId).eq("nom", cat);
    if (catFilter === cat) setCatFilter("all");
    setModalDeleteCat(null);
    loadDocs();
    loadCats();
    showToast(`Catégorie "${cat}" supprimée`);
  };

  const handleUpload = async () => {
    const errs = {};
    if (!uploadForm.prenom.trim()) errs.prenom = "Obligatoire";
    if (!uploadForm.nom.trim())    errs.nom    = "Obligatoire";
    if (!uploadForm.titre.trim())  errs.titre  = "Obligatoire";
    if (!uploadForm.fileObj)       errs.file   = "Obligatoire";
    if (Object.keys(errs).length) { setUploadErrors(errs); return; }

    // Upload fichier dans Supabase Storage
    const cleanName = uploadForm.file.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-zA-Z0-9.\-_]/g,"_");
    const path = `${espace.id}/${Date.now()}-${cleanName}`;
    const { error: storErr } = await supabase.storage.from("documents").upload(path, uploadForm.fileObj, { contentType: uploadForm.fileObj.type, upsert: false });
    if (storErr) { showToast(`Erreur upload : ${storErr.message}`, true); return; }
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    const file_url = urlData?.publicUrl || "";

    const status = isSA ? "valide" : "attente";
    const { error } = await supabase.from("documents").insert({
      espace_id: espace.id,
      categorie: cats[espace.id]?.[0] || "Général",
      titre: uploadForm.titre,
      description: uploadForm.desc,
      auteur: `${uploadForm.prenom} ${uploadForm.nom}`,
      type: getType(uploadForm.file),
      file_url,
      status,
      commentaire: "",
    });

    if (!error) {
      if (status === "attente") {
        await supabase.from("notifications").insert({ texte:`"${uploadForm.titre}" en attente de validation`, lu:false });
      }
      setUploadForm({ prenom:"", nom:"", titre:"", desc:"", file:"", fileObj:null });
      setUploadErrors({});
      setModalUpload(false);
      loadDocs();
      loadNotifs();
      showToast(status === "valide" ? "Document publié ✓" : "Soumis — en attente de validation");
    } else {
      showToast("Erreur lors du dépôt", true);
    }
  };

  const handleAddCat = async () => {
    if (!catInput.trim()) return;
    await supabase.from("categories").insert({ espace_id: espace.id, nom: catInput.trim() });
    setCatInput("");
    setModalCat(false);
    loadCats();
    showToast("Catégorie créée");
  };

  const espDocs = (espId) => docs.filter(d => {
    if (d.espace_id !== espId) return false;
    if (d.status === "attente" && !isSA && d.auteur !== user?.name) return false;
    if (catFilter !== "all" && d.categorie !== catFilter) return false;
    if (search && !d.titre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fieldStyle = (err) => ({ ...inputStyle, borderColor: err ? "#dc2626" : "#006064" });

  const markNotifLue = async (id) => {
    await supabase.from("notifications").update({ lu:true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id===id ? {...n, lu:true} : n));
  };

  // ══ ÉCRAN LOGIN ════════════════════════════════════════════════════════════
  if (!user) return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ width:"100%", maxWidth:460 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.5)", border:"2px solid rgba(255,255,255,.7)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:"0 8px 28px rgba(26,26,94,.15)", fontSize:28, fontWeight:700, color:"#1a237e" }}>SC</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#006064", fontSize:22, margin:"0 0 4px" }}>École Privée Saint-Charles</h1>
          <p style={{ color:"#006064", fontSize:13, margin:0 }}>Espace de partage de documents</p>
        </div>

        <div style={{ background:"#006064", borderRadius:20, padding:20, marginBottom:14, boxShadow:"0 8px 32px rgba(0,0,0,.18)", borderTop:"3px solid rgba(255,255,255,.25)" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Profils</div>
          {USERS.map(u=>(
            <div key={u.id} style={{ background:"rgba(255,255,255,.12)", border:`1px solid rgba(255,255,255,.18)`, borderLeft:`3px solid ${u.color}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, marginBottom:8, transition:"all .2s" }}
              onClick={()=>{ setLoginError(""); handleLogin(u); }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:`${u.color}30`, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{u.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{u.name}</div>
                <div style={{ color:"rgba(255,255,255,.6)", fontSize:12 }}>{u.post || (u.role==="superadmin"?"Super Admin":u.role==="admin"?"Admin":"Personnel Enseignant")}</div>
              </div>
              <div style={{ width:7, height:7, borderRadius:"50%", background:u.color }} />
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(255,255,255,.55)", backdropFilter:"blur(20px)", borderRadius:20, padding:20, marginBottom:14, border:"1px solid #006064", boxShadow:"0 4px 16px rgba(0,96,100,.1)" }}>
          <label style={{ fontSize:13, color:"#6b7280", display:"block", marginBottom:8, fontWeight:500 }}>Mot de passe</label>
          <input type="password" placeholder="Votre mot de passe..." value={loginPassword} onChange={e=>{ setLoginPassword(e.target.value); setLoginError(""); }}
            style={{ width:"100%", padding:"10px 14px", background:"rgba(0,96,100,.15)", backdropFilter:"blur(8px)", border:`1px solid ${loginError?"#dc2626":"rgba(0,96,100,.4)"}`, borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", color:"#006064", boxSizing:"border-box" }} />
          {loginError && <div style={{ color:"#dc2626", fontSize:12, marginTop:6, fontStyle:"italic" }}>{loginError}</div>}
        </div>
      </div>
    </div>
  );

  const c_esp = espace ? SPACE_COLORS[espace.id] : PALETTE[0];

  // ══ APP PRINCIPALE ═════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}.nav-item:hover{background:rgba(255,255,255,.12)!important;color:#fff!important}input::placeholder,textarea::placeholder{color:rgba(0,96,100,.7)!important;opacity:1}`}</style>

      {toast && <div style={{ position:"fixed", bottom:28, right:28, zIndex:999, background:toast.err?"#c62828":"#1a237e", backdropFilter:"blur(12px)", color:"#fff", padding:"12px 22px", borderRadius:12, fontSize:14, fontWeight:500, boxShadow:"0 8px 30px rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.2)" }}>{toast.msg}</div>}

      {/* MODALS */}
      {modalUpload && (
        <Modal title={`Déposer dans — ${espace?.nom}`} onClose={()=>{setModalUpload(false);setUploadErrors({});}}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:13, color:"#006064", display:"block", marginBottom:6, fontWeight:500 }}>Prénom *</label>
              <input style={fieldStyle(uploadErrors.prenom)} placeholder="Votre prénom..." value={uploadForm.prenom} onChange={e=>setUploadForm(f=>({...f,prenom:e.target.value}))} />
              {uploadErrors.prenom && <div style={{ fontSize:12, color:"#fca5a5", marginTop:4, fontStyle:"italic" }}>{uploadErrors.prenom}</div>}
            </div>
            <div>
              <label style={{ fontSize:13, color:"#006064", display:"block", marginBottom:6, fontWeight:500 }}>Nom *</label>
              <input style={fieldStyle(uploadErrors.nom)} placeholder="Votre nom..." value={uploadForm.nom} onChange={e=>setUploadForm(f=>({...f,nom:e.target.value}))} />
              {uploadErrors.nom && <div style={{ fontSize:12, color:"#fca5a5", marginTop:4, fontStyle:"italic" }}>{uploadErrors.nom}</div>}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#006064", display:"block", marginBottom:6, fontWeight:500 }}>Titre du document *</label>
            <input style={fieldStyle(uploadErrors.titre)} placeholder="Titre du document..." value={uploadForm.titre} onChange={e=>setUploadForm(f=>({...f,titre:e.target.value}))} />
            {uploadErrors.titre && <div style={{ fontSize:12, color:"#fca5a5", marginTop:4, fontStyle:"italic" }}>{uploadErrors.titre}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#006064", display:"block", marginBottom:6, fontWeight:500 }}>Description</label>
            <textarea style={{...fieldStyle(false),resize:"none"}} rows={3} placeholder="Description optionnelle..." value={uploadForm.desc} onChange={e=>setUploadForm(f=>({...f,desc:e.target.value}))} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#006064", display:"block", marginBottom:6, fontWeight:500 }}>Fichier <span style={{color:"#dc2626"}}>*</span> <span style={{fontWeight:400,fontSize:12,color:"rgba(0,96,100,.6)"}}>(PDF, Word, image)</span></label>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", background:uploadErrors.file?"rgba(220,38,38,.08)":"rgba(0,96,100,.06)", border:`1.5px dashed ${uploadErrors.file?"#dc2626":"rgba(0,96,100,.35)"}`, borderRadius:12, transition:"all .2s" }}>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp" style={{ display:"none" }}
                onChange={e=>{ const f=e.target.files?.[0]; if(f){ setUploadForm(p=>({...p,file:f.name,fileObj:f})); setUploadErrors(p=>({...p,file:undefined})); } }} />
              <span style={{ background:"#006064", color:"#fff", padding:"5px 14px", borderRadius:8, fontSize:12, fontWeight:600, flexShrink:0 }}>Choisir un fichier</span>
              <span style={{ fontSize:13, color: uploadForm.file ? "#006064" : "rgba(0,96,100,.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {uploadForm.file || "Aucun fichier sélectionné"}
              </span>
            </label>
            {uploadErrors.file && <div style={{ fontSize:12, color:"#dc2626", marginTop:4, fontStyle:"italic" }}>Veuillez sélectionner un fichier</div>}
          </div>
          {!isSA && <div style={{ background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.25)", borderRadius:10, padding:12, fontSize:13, color:"#fef3c7", marginBottom:14 }}>Votre document sera soumis à validation avant publication.</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>{setModalUpload(false);setUploadErrors({});}}>Annuler</button>
            <button style={{...btn,flex:1,justifyContent:"center"}} onClick={handleUpload}><Icon name="upload" size={14} color="#fff" /> Déposer</button>
          </div>
        </Modal>
      )}

      {modalCat && (
        <Modal title="Nouvelle catégorie" onClose={()=>setModalCat(false)} maxWidth={400}>
          <input style={{...inputStyle,marginBottom:14}} placeholder="Nom de la catégorie..." value={catInput} onChange={e=>setCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddCat()} autoFocus />
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>setModalCat(false)}>Annuler</button>
            <button style={{...btn,flex:1,justifyContent:"center"}} onClick={handleAddCat}><Icon name="plus" size={14} color="#fff" /> Créer</button>
          </div>
        </Modal>
      )}

      {modalDetail && (
        <Modal title={modalDetail.titre} onClose={()=>setModalDetail(null)} maxWidth={520}>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <span style={{ background:(TYPE_COLORS[modalDetail.type]||TYPE_COLORS.AUTRE).bg, color:(TYPE_COLORS[modalDetail.type]||TYPE_COLORS.AUTRE).text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:700 }}>{modalDetail.type}</span>
            <span style={{ background:modalDetail.status==="valide"?"rgba(5,150,105,.15)":modalDetail.status==="attente"?"rgba(217,119,6,.15)":"rgba(220,38,38,.15)", color:modalDetail.status==="valide"?"#6ee7b7":modalDetail.status==="attente"?"#fcd34d":"#fca5a5", padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600 }}>
              {modalDetail.status==="valide"?"Publié":modalDetail.status==="attente"?"En attente":"Refusé"}
            </span>
          </div>
          {modalDetail.description && <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"12px 16px", marginBottom:14, fontSize:14, color:"#fff", lineHeight:1.6 }}>{modalDetail.description}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {[["Catégorie",modalDetail.categorie],["Déposé par",modalDetail.auteur],["Date",fmtDate(modalDetail.created_at)],["Type",modalDetail.type]].map(([l,v])=>(
              <div key={l} style={{ background:"rgba(255,255,255,.1)", borderRadius:10, border:"1px solid rgba(255,255,255,.15)", padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:13, color:"#fff", fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          {modalDetail.commentaire && (
            <div style={{ background:modalDetail.status==="refuse"?"rgba(220,38,38,.1)":"rgba(251,191,36,.12)", border:`1px solid ${modalDetail.status==="refuse"?"rgba(220,38,38,.3)":"rgba(251,191,36,.25)"}`, borderRadius:10, padding:"12px 16px", marginBottom:14, fontSize:13, color:modalDetail.status==="refuse"?"#fca5a5":"#fef3c7" }}>
              <strong>{modalDetail.status==="refuse"?"Motif du refus :":"Commentaire admin :"}</strong> {modalDetail.commentaire}
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            {modalDetail.file_url && (
              <a href={modalDetail.file_url} target="_blank" rel="noreferrer"
                style={{ flex:1, justifyContent:"center", background:"#006064", color:"#fff", border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7, textDecoration:"none" }}>
                <Icon name="download" size={14} color="#fff" /> Télécharger
              </a>
            )}
            {(isSA || modalDetail.status==="attente") && (
              <button style={{ flex:1, justifyContent:"center", background:"rgba(220,38,38,.15)", color:"#fca5a5", border:"1px solid rgba(220,38,38,.25)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 }}
                onClick={()=>{setModalDelete(modalDetail);setModalDetail(null);}}>
                <Icon name="trash" size={14} color="#fca5a5" /> Supprimer
              </button>
            )}
          </div>
        </Modal>
      )}

      {modalDelete && (
        <Modal title="Supprimer ce document ?" onClose={()=>setModalDelete(null)} maxWidth={400}>
          <div style={{ background:"rgba(220,38,38,.12)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10, padding:14, marginBottom:20, fontSize:14, color:"#fca5a5", display:"flex", gap:10, alignItems:"flex-start" }}>
            <Icon name="warning" size={18} color="#fca5a5" />
            <span>Action irréversible. Le document <strong>"{modalDelete.titre}"</strong> sera définitivement supprimé.</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>setModalDelete(null)}>Annuler</button>
            <button style={{ flex:1, justifyContent:"center", background:"rgba(220,38,38,.85)", color:"#fff", border:"1px solid rgba(220,38,38,.3)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 }}
              onClick={()=>handleDelete(modalDelete)}>
              <Icon name="trash" size={14} color="#fff" /> Supprimer
            </button>
          </div>
        </Modal>
      )}

      {modalDeleteCat && (
        <Modal title="Supprimer cette catégorie ?" onClose={()=>setModalDeleteCat(null)} maxWidth={400}>
          <div style={{ background:"rgba(220,38,38,.12)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10, padding:14, marginBottom:20, fontSize:14, color:"#fca5a5", display:"flex", gap:10, alignItems:"flex-start" }}>
            <Icon name="warning" size={18} color="#fca5a5" />
            <span>La catégorie <strong>"{modalDeleteCat.cat}"</strong> et tous ses documents seront supprimés définitivement.</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>setModalDeleteCat(null)}>Annuler</button>
            <button style={{ flex:1, justifyContent:"center", background:"rgba(220,38,38,.85)", color:"#fff", border:"1px solid rgba(220,38,38,.3)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 }}
              onClick={handleDeleteCat}>
              <Icon name="trash" size={14} color="#fff" /> Supprimer tout
            </button>
          </div>
        </Modal>
      )}

      {/* SIDEBAR */}
      <div style={{ width:sidebar?240:0, minWidth:sidebar?240:0, background:SIDEBAR_BG, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRight:"1px solid rgba(255,255,255,.12)", padding:sidebar?"20px 16px":"0", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflow:"hidden", transition:"all .25s", overflowY:sidebar?"auto":"hidden", flexShrink:0 }}>
        {sidebar && <>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:18, fontWeight:700, color:"#fff" }}>SC</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:700, color:"rgba(255,255,255,.9)" }}>Saint-Charles</div>
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:3, flex:1 }}>
            {[{id:"accueil",label:"Accueil",icon:"home"},{id:"dashboard",label:"Tableau de bord",icon:"dashboard",adminOnly:true}].filter(x=>!x.adminOnly||isAdmin).map(item=>(
              <div key={item.id} className="nav-item" onClick={()=>{setView(item.id);setEspace(null);}}
                style={{ padding:"9px 14px", borderRadius:10, cursor:"pointer", color:view===item.id?"#fff":"rgba(255,255,255,.6)", fontSize:14, display:"flex", alignItems:"center", gap:9, background:view===item.id?"rgba(255,255,255,.15)":"transparent", fontWeight:view===item.id?500:400, borderLeft:view===item.id?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name={item.icon} size={16} color={view===item.id?"#fff":"rgba(255,255,255,.5)"} /> {item.label}
              </div>
            ))}
            {isSA && (
              <div className="nav-item" onClick={()=>setView("validation")}
                style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", color:view==="validation"?"#fff":"rgba(255,255,255,.6)", fontSize:13, display:"flex", alignItems:"center", gap:9, background:view==="validation"?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="validation"?500:400, borderLeft:view==="validation"?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name="check" size={15} color={view==="validation"?"#fff":"rgba(255,255,255,.45)"} /> Validation
                {pending>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:20, padding:"1px 7px", fontSize:11, marginLeft:"auto" }}>{pending}</span>}
              </div>
            )}
            <div className="nav-item" onClick={()=>{setView("notifs");}}
              style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", color:view==="notifs"?"#fff":"rgba(255,255,255,.6)", fontSize:13, display:"flex", alignItems:"center", gap:9, background:view==="notifs"?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="notifs"?500:400, borderLeft:view==="notifs"?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
              <Icon name="bell" size={15} color={view==="notifs"?"#fff":"rgba(255,255,255,.45)"} /> Notifications
              {unread>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:20, padding:"1px 7px", fontSize:11, marginLeft:"auto" }}>{unread}</span>}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", padding:"10px 14px 4px", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Espaces communs</div>
            {ESPACES.filter(e=>e.id!=="ressources").map(e=>(
              <div key={e.id} className="nav-item" onClick={()=>goTo("espace",e)}
                style={{ padding:"8px 12px", borderRadius:10, cursor:"pointer", color:view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.6)", fontSize:12, display:"flex", alignItems:"center", gap:8, background:view==="espace"&&espace?.id===e.id?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="espace"&&espace?.id===e.id?500:400, borderLeft:view==="espace"&&espace?.id===e.id?"3px solid #fff":"3px solid transparent", transition:"all .15s", whiteSpace:"nowrap", overflow:"hidden" }}>
                <Icon name={e.icon} size={14} color={view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.45)"} /> {e.nom}
              </div>
            ))}
            <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", padding:"10px 14px 4px", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ressources</div>
            {ESPACES.filter(e=>e.id==="ressources").map(e=>(
              <div key={e.id} className="nav-item" onClick={()=>goTo("espace",e)}
                style={{ padding:"8px 12px", borderRadius:10, cursor:"pointer", color:view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.6)", fontSize:12, display:"flex", alignItems:"center", gap:8, background:view==="espace"&&espace?.id===e.id?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="espace"&&espace?.id===e.id?500:400, borderLeft:view==="espace"&&espace?.id===e.id?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name={e.icon} size={14} color={view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.45)"} /> {e.nom}
              </div>
            ))}
          </nav>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.12)", paddingTop:14, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`${user.color}25`, color:user.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, border:`1px solid ${user.color}35` }}>{user.avatar}</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,.9)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.45)" }}>{user.role==="superadmin"?"Super Admin":user.role==="admin"?"Administratif":"Personnel Enseignant"}</div>
            </div>
            <button onClick={()=>{setUser(null);setView("accueil");setEspace(null);setNavHistory([]);setDocs([]);}} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}>
              <Icon name="logout" size={16} color="rgba(255,255,255,.45)" />
            </button>
          </div>
        </>}
      </div>

      {/* MAIN */}
      <div style={{ flex:1, padding:"28px 32px", overflowY:"auto", minWidth:0 }}>
        {/* TOPBAR */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <button onClick={()=>setSidebar(v=>!v)} style={{ ...glassCard, padding:0, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, border:"1px solid rgba(0,96,100,.2)" }}>
            <Icon name="menu" size={16} color="#006064" />
          </button>
          {navHistory.length>0 && (
            <button onClick={goBack} style={{ ...glassCard, padding:0, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, border:"1px solid rgba(0,96,100,.2)" }}>
              <Icon name="back" size={16} color="#006064" />
            </button>
          )}
          <div style={{ fontSize:13, color:"rgba(0,96,100,.6)", flex:1 }}>
            {view==="accueil"&&"Accueil"}{view==="dashboard"&&"Tableau de bord"}{view==="espace"&&espace?.nom}{view==="validation"&&"Validation"}{view==="notifs"&&"Notifications"}
          </div>
        </div>

        {/* ACCUEIL */}
        {view==="accueil" && (
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, margin:"0 0 28px", color:"#006064" }}>Bienvenue dans votre espace</h1>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
              {ESPACES.map(e => {
                const count = docs.filter(d=>d.espace_id===e.id&&d.status==="valide").length;
                return <SpaceCard key={e.id} esp={e} count={count} onClick={()=>goTo("espace",e)} />;
              })}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {view==="dashboard" && isAdmin && (
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, margin:"0 0 28px", color:"#006064" }}>Tableau de bord</h1>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14, marginBottom:28 }}>
              {[
                {label:"Total",val:docs.length,color:"#006064",icon:"file"},
                {label:"Publiés",val:docs.filter(d=>d.status==="valide").length,color:"#6ee7b7",icon:"check"},
                {label:"En attente",val:pending,color:"#fcd34d",icon:"inbox"},
                {label:"Refusés",val:docs.filter(d=>d.status==="refuse").length,color:"#fca5a5",icon:"close"},
              ].map(s=>(
                <div key={s.label} style={{...glassCard,textAlign:"center",cursor:s.label==="En attente"&&isSA?"pointer":"default"}}
                  onClick={()=>s.label==="En attente"&&isSA&&setView("validation")}>
                  <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                    <Icon name={s.icon} size={20} color={s.color} />
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:12, color:"rgba(0,96,100,.55)", marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={glassCard}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, margin:"0 0 18px", color:"#006064" }}>Activité récente</h3>
              {loading && <div style={{ color:"rgba(0,96,100,.45)", fontSize:14 }}>Chargement...</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {docs.slice(0,5).map(doc => {
                  const tc=TYPE_COLORS[doc.type]||TYPE_COLORS.AUTRE;
                  const sc=doc.status==="valide"?{bg:"rgba(5,150,105,.15)",text:"#6ee7b7"}:doc.status==="attente"?{bg:"rgba(217,119,6,.15)",text:"#fcd34d"}:{bg:"rgba(220,38,38,.15)",text:"#fca5a5"};
                  return (
                    <div key={doc.id} onClick={()=>setModalDetail(doc)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, border:"1px solid rgba(0,96,100,.12)", cursor:"pointer", background:"rgba(255,255,255,.6)", transition:"all .15s" }}>
                      <span style={{ background:tc.bg, color:tc.text, padding:"3px 8px", borderRadius:5, fontSize:11, fontWeight:700 }}>{doc.type}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, color:"#006064", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.titre}</div>
                        <div style={{ fontSize:12, color:"rgba(0,96,100,.5)" }}>{doc.auteur} · {fmtDate(doc.created_at)}</div>
                      </div>
                      <span style={{ background:sc.bg, color:sc.text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600 }}>{doc.status==="valide"?"Publié":doc.status==="attente"?"En attente":"Refusé"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ESPACE */}
        {view==="espace" && espace && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <SpaceIcon id={espace.id} size={46} />
                <div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, margin:0, color:c_esp.accent }}>{espace.nom}</h1>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {isAdmin && <button style={btnGhost} onClick={()=>setModalCat(true)}><Icon name="plus" size={13} color="#006064" /> Catégorie</button>}
                {(isAdmin||user.role==="enseignant") && <button style={btn} onClick={()=>setModalUpload(true)}><Icon name="upload" size={14} color="#fff" /> Déposer</button>}
              </div>
            </div>
            <div style={{ position:"relative", marginBottom:14 }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={15} color="rgba(0,96,100,.4)" /></div>
              <input style={{...inputStyle, paddingLeft:40, background:"rgba(255,255,255,.7)", border:"1.5px solid rgba(0,96,100,.25)", color:"#006064"}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              <div onClick={()=>setCatFilter("all")} style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", flexShrink:0, transition:"all .2s", background:catFilter==="all"?c_esp.grad:"rgba(255,255,255,.6)", color:catFilter==="all"?"#fff":"#006064", border:catFilter==="all"?`1.5px solid ${c_esp.accent}`:"1.5px solid rgba(0,96,100,.2)", fontWeight:catFilter==="all"?600:400, boxShadow:catFilter==="all"?`0 4px 14px ${c_esp.tint}`:"none" }}>Tous</div>
              {(cats[espace.id]||[]).map(cat=>(
                <div key={cat} style={{ display:"inline-flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <div onClick={()=>setCatFilter(cat)} style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", transition:"all .2s", background:catFilter===cat?c_esp.grad:"rgba(255,255,255,.6)", color:catFilter===cat?"#fff":"#006064", border:catFilter===cat?`1.5px solid ${c_esp.accent}`:"1.5px solid rgba(0,96,100,.2)", fontWeight:catFilter===cat?600:400, boxShadow:catFilter===cat?`0 4px 14px ${c_esp.tint}`:"none" }}>{cat}</div>
                  {isAdmin && <button onClick={()=>setModalDeleteCat({espId:espace.id,cat})} style={{ background:"rgba(220,38,38,.15)", border:"1px solid rgba(220,38,38,.25)", color:"#fca5a5", borderRadius:8, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}><Icon name="trash" size={12} color="#fca5a5" /></button>}
                </div>
              ))}
            </div>
            {loading && <div style={{ color:"rgba(0,96,100,.45)", fontSize:14, marginBottom:14 }}>Chargement...</div>}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
              {espDocs(espace.id).map(doc=>(
                <DocCard key={doc.id} doc={doc} espaceId={espace.id} onOpen={()=>setModalDetail(doc)} onDelete={d=>setModalDelete(d)} canDelete={isSA||(doc.status==="attente")} />
              ))}
              {espDocs(espace.id).length===0 && !loading && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:"rgba(0,96,100,.4)" }}>
                  <Icon name="inbox" size={40} color="rgba(0,96,100,.15)" />
                  <div style={{ marginTop:12, color:"#006064" }}>Aucun document trouvé</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VALIDATION */}
        {view==="validation" && isSA && (
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, margin:"0 0 8px", color:"#006064" }}>Validation</h1>
            <p style={{ color:"rgba(0,96,100,.55)", margin:"0 0 24px", fontSize:14 }}>{pending} document(s) en attente</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {docs.filter(d=>d.status==="attente").map(doc => {
                const tc=TYPE_COLORS[doc.type]||TYPE_COLORS.AUTRE;
                const espNom=ESPACES.find(e=>e.id===doc.espace_id)?.nom;
                return (
                  <div key={doc.id} style={{...glassCard, border:"1px solid rgba(251,191,36,.35)"}}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
                      <span style={{ background:tc.bg, color:tc.text, padding:"8px 12px", borderRadius:6, fontSize:12, fontWeight:700, flexShrink:0 }}>{doc.type}</span>
                      <div style={{ flex:1 }}>
                        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, margin:"0 0 4px", color:"#006064" }}>{doc.titre}</h3>
                        {doc.description && <p style={{ fontSize:13, color:"rgba(0,96,100,.6)", margin:"0 0 8px" }}>{doc.description}</p>}
                        <div style={{ fontSize:12, color:"rgba(0,96,100,.5)", display:"flex", gap:12, flexWrap:"wrap" }}>
                          <span>{doc.categorie}</span><span>{doc.auteur}</span><span>{espNom}</span>
                        </div>
                      </div>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer"
                          style={{ background:"rgba(0,96,100,.1)", color:"#006064", border:"1px solid rgba(0,96,100,.25)", padding:"7px 12px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:500, textDecoration:"none", flexShrink:0 }}>
                          <Icon name="eye" size={14} color="#006064" /> Voir
                        </a>
                      )}
                    </div>
                    {refusMode[doc.id] && (
                      <div style={{ marginTop:14, borderTop:"1px solid rgba(0,96,100,.1)", paddingTop:14 }}>
                        <label style={{ fontSize:12, color:refusErrors[doc.id]?"#dc2626":"rgba(0,96,100,.55)", display:"block", marginBottom:6 }}>
                          Motif du refus <span style={{color:"#dc2626"}}>*</span>
                          {refusErrors[doc.id] && <span style={{marginLeft:8,fontStyle:"italic"}}>— champ obligatoire</span>}
                        </label>
                        <textarea style={{...inputStyle,resize:"none",fontSize:13,borderColor:refusErrors[doc.id]?"#dc2626":"#006064"}} rows={2} placeholder="Saisir le motif du refus..." value={refusComment[doc.id]||""} onChange={e=>{ setRefusComment(f=>({...f,[doc.id]:e.target.value})); setRefusErrors(f=>({...f,[doc.id]:false})); }} />
                      </div>
                    )}
                    <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
                      {refusMode[doc.id] ? (<>
                        <button onClick={()=>setRefusMode(m=>({...m,[doc.id]:false}))} style={{ background:"transparent", color:"rgba(0,96,100,.6)", border:"1px solid rgba(0,96,100,.2)", padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                          Annuler
                        </button>
                        <button onClick={()=>handleRefuser(doc.id)} style={{ background:"rgba(220,38,38,.15)", color:"#fca5a5", border:"1px solid rgba(220,38,38,.25)", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
                          <Icon name="close" size={13} color="#fca5a5" /> Confirmer le refus
                        </button>
                      </>) : (<>
                        <button onClick={()=>setRefusMode(m=>({...m,[doc.id]:true}))} style={{ background:"rgba(220,38,38,.15)", color:"#fca5a5", border:"1px solid rgba(220,38,38,.25)", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
                          <Icon name="close" size={13} color="#fca5a5" /> Refuser
                        </button>
                        <button onClick={()=>handleValider(doc.id)} style={{ background:"rgba(5,150,105,.2)", color:"#6ee7b7", border:"1px solid rgba(5,150,105,.3)", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
                          <Icon name="check" size={13} color="#6ee7b7" /> Valider
                        </button>
                      </>)}
                    </div>
                  </div>
                );
              })}
              {pending===0 && (
                <div style={{ textAlign:"center", padding:80, color:"rgba(0,96,100,.4)" }}>
                  <Icon name="check" size={40} color="rgba(0,96,100,.15)" />
                  <div style={{ marginTop:12, color:"#006064" }}>Aucun document en attente</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {view==="notifs" && (
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, margin:"0 0 8px", color:"#006064" }}>Notifications</h1>
            <p style={{ color:"rgba(0,96,100,.55)", margin:"0 0 24px", fontSize:14 }}>{unread} non lue(s)</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {notifs.map(n=>(
                <div key={n.id} onClick={()=>{ if(!n.lu) markNotifLue(n.id); }}
                  style={{ ...glassCard, display:"flex", alignItems:"center", gap:14, cursor:n.lu?"default":"pointer", opacity:n.lu?0.55:1, borderLeft:n.lu?"1px solid rgba(0,96,100,.12)":`3px solid #006064`, background:n.lu?"rgba(255,255,255,.6)":"rgba(255,255,255,.88)" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:n.lu?"rgba(0,96,100,.06)":"rgba(0,96,100,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon name="bell" size={16} color="#006064" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:"#006064", fontWeight:n.lu?400:600 }}>{n.texte}</div>
                    <div style={{ fontSize:12, color:"rgba(0,96,100,.45)", marginTop:3 }}>{fmtDate(n.created_at)}</div>
                  </div>
                  {!n.lu && <div style={{ width:8, height:8, borderRadius:"50%", background:"#006064", flexShrink:0 }} />}
                </div>
              ))}
              {notifs.length===0 && (
                <div style={{ textAlign:"center", padding:80, color:"rgba(0,96,100,.4)" }}>
                  <Icon name="bell" size={40} color="rgba(0,96,100,.15)" />
                  <div style={{ marginTop:12, color:"#006064" }}>Aucune notification</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
