import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://auxswitfevqgpgvnaodk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eHN3aXRmZXZxZ3Bndm5hb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODM0MjAsImV4cCI6MjA5NjM1OTQyMH0.YX29gtJ9JNUgnK_5pnTSGP63SXEFelX3O1QkxUQWF48";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── PALETTE & COULEURS ──────────────────────────────────────────────────────
const BG = "#f5f0e8";
const SIDEBAR_BG = "linear-gradient(180deg, #0F2C5C 0%, #1C49A6 100%)";

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

// ─── COULEURS PAR DÉFAUT POUR NOUVEAUX COMPTES ───────────────────────────────
const PRESET_COLORS = ["#e91e8c","#0d9488","#9c27b0","#b8860b","#1a237e","#2196f3","#ff5722","#4caf50"];

const ROLE_LABELS = {
  direction: null,
  adjoint:   "Adjoint(e) de direction",
  admin:     "Administratif",
  enseignant: null,
};

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
  ressources:  ["Cycle 1","Cycle 2","Cycle 3","Transversal"],
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
const fmtDate = iso => { if (!iso) return ""; const d = new Date(iso); if (isNaN(d.getTime())) return iso; const r = new Date(d.getTime() + 4*60*60*1000); const months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]; return `${r.getUTCDate()} ${months[r.getUTCMonth()]} ${r.getUTCFullYear()} à ${String(r.getUTCHours()).padStart(2,"0")}:${String(r.getUTCMinutes()).padStart(2,"0")}`; };

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
    users:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    inbox:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    key:         <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    shield:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    back:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
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
const btn = { background:"#0F2C5C", color:"#fff", border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'Calibri',sans-serif", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 };
const btnGhost = { background:"transparent", border:"1.5px solid #0F2C5C", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'Calibri',sans-serif", fontSize:14, color:"#0F2C5C", display:"inline-flex", alignItems:"center", gap:7 };
const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.7)", border:"1.5px solid #0F2C5C", borderRadius:10, fontFamily:"'Calibri',sans-serif", fontSize:14, outline:"none", color:"#0F2C5C", boxSizing:"border-box" };

// ─── MODAL ───────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, maxWidth=480 }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:BG, borderRadius:20, padding:28, width:"100%", maxWidth, maxHeight:"90vh", overflowY:"auto", border:"1px solid rgba(255,255,255,.3)", boxShadow:"0 24px 60px rgba(0,0,0,.3)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Calibri',sans-serif", fontSize:20, margin:0, color:"#0F2C5C" }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(0,96,100,.5)", fontSize:20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── DOC CARD ────────────────────────────────────────────────────────────────
const DocCard = ({ doc, espaceId, onOpen, onDelete, canDelete, isNew=false, showDots=true }) => {
  const [hov, setHov] = useState(false);
  const c = SPACE_COLORS[espaceId] || PALETTE[0];
  const tc = TYPE_COLORS[doc.type] || TYPE_COLORS.AUTRE;
  const sc = doc.status==="valide" ? {bg:"rgba(5,150,105,.15)",text:"#6ee7b7"} : doc.status==="attente" ? {bg:"rgba(217,119,6,.15)",text:"#fcd34d"} : {bg:"rgba(220,38,38,.15)",text:"#fca5a5"};
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onOpen}
      style={{ position:"relative", borderRadius:20, cursor:onOpen?"pointer":"default", overflow:"hidden", background:"rgba(255,255,255,0.82)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:hov?`1px solid ${c.accent}`:`1px solid rgba(0,96,100,.12)`, transition:"all .28s cubic-bezier(.34,1.56,.64,1)", transform:hov?"translateY(-6px) scale(1.012)":"translateY(0)", boxShadow:hov?`0 22px 44px ${c.tint},0 8px 20px rgba(0,0,0,.08)`:`0 4px 16px rgba(0,0,0,.06)` }}>
      {isNew && <div style={{ position:"absolute", top:10, right:10, zIndex:10, width:10, height:10, borderRadius:"50%", background:"#4CAF50", boxShadow:"0 0 0 2px rgba(76,175,80,.3)", animation:"pulse-dot 1.8s ease-in-out infinite" }} />}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c.grad, borderRadius:"20px 20px 0 0" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:60, background:"linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%)", pointerEvents:"none" }} />
      <div style={{ padding:"18px 16px 15px", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="file" size={16} color="#fff" />
          </div>
          {showDots && <span style={{ background:"rgba(107,114,128,.12)", color:"#6b7280", padding:"3px 9px", borderRadius:6, fontSize:13, fontWeight:700, letterSpacing:2, cursor:"pointer" }}>···</span>}
        </div>
        <div style={{ fontFamily:"'Calibri',sans-serif", fontSize:14, marginBottom:6, color:c.accent, lineHeight:1.4 }}>{doc.titre}</div>
        {doc.description && <div style={{ fontSize:12, color:"rgba(0,96,100,.6)", marginBottom:10, lineHeight:1.55, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{doc.description}</div>}
        <div style={{ display:"inline-block", background:"rgba(0,96,100,.08)", color:"#0F2C5C", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid rgba(0,96,100,.18)", marginBottom:10 }}>{doc.categorie}</div>
        <div style={{ fontSize:11, color:"rgba(0,96,100,.5)", display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Icon name="user" size={10} color="rgba(0,96,100,.4)" /> {doc.auteur}</span>
          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Icon name="calendar" size={10} color="rgba(0,96,100,.4)" /> {fmtDate(doc.created_at)}</span>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,rgba(0,96,100,.15),transparent)", marginBottom:11 }} />
        <div style={{ display:"flex", alignItems:"center", gap:7 }} onClick={e=>e.stopPropagation()}>
          <span style={{ background:sc.bg, color:sc.text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600, flex:1, textAlign:"center" }}>
            {doc.status==="valide"?"Publié":doc.status==="attente"?"En attente":"Refusé"}
          </span>
          {doc.file_url && doc.status === "valide" && (
            <a href={doc.file_url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
              style={{ background:"rgba(0,96,100,.12)", color:"#0F2C5C", border:"1px solid rgba(0,96,100,.25)", padding:"6px 9px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", textDecoration:"none" }}>
              <Icon name="download" size={13} color="#0F2C5C" />
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
const SpaceCard = ({ esp, count, newCount=0, onClick, onAdd }) => {
  const [hov, setHov] = useState(false);
  const c = SPACE_COLORS[esp.id] || PALETTE[0];
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ position:"relative", borderRadius:20, cursor:"pointer", overflow:"hidden", background:"rgba(255,255,255,0.82)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:hov?`1px solid ${c.accent}`:`1px solid rgba(0,96,100,.12)`, padding:20, transition:"all .28s cubic-bezier(.34,1.56,.64,1)", transform:hov?"translateY(-7px) scale(1.015)":"translateY(0)", boxShadow:hov?`0 24px 48px ${c.tint},0 8px 20px rgba(0,0,0,.08)`:`0 4px 16px rgba(0,0,0,.06)` }}>
      {onAdd && (
        <button onClick={e=>{ e.stopPropagation(); onAdd(); }}
          style={{ position:"absolute", top:8, right:newCount>0?32:8, zIndex:10, background:"none", border:"none", cursor:"pointer", fontSize:22, lineHeight:1, color:"#0F2C5C", fontWeight:300, padding:2 }}>
          +
        </button>
      )}
      {newCount > 0 && (
        <div style={{ position:"absolute", top:10, right:10, zIndex:10, background:"#ef4444", color:"#fff", borderRadius:"50%", minWidth:20, height:20, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px", boxShadow:"0 2px 6px rgba(239,68,68,.5)" }}>
          {newCount}
        </div>
      )}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:c.grad, borderRadius:"20px 20px 0 0" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:55, background:"linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%)", pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:2 }}>
        <div style={{ marginBottom:14 }}><SpaceIcon id={esp.id} size={42} /></div>
        <div style={{ fontFamily:"'Calibri',sans-serif", fontSize:16, marginBottom:14, color:c.accent }}>{esp.nom}</div>
        <div style={{ height:1, background:`linear-gradient(90deg,${c.border},transparent)`, marginBottom:10 }} />
        <div style={{ fontSize:12, color:"#0F2C5C", fontWeight:500 }}>{count} document(s) publié(s)</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
  const [docs, setDocs]         = useState([]);
  const [cats, setCats]         = useState(CATS_DEFAUT);
  const [deletedCats, setDeletedCats] = useState(() => { try { return JSON.parse(localStorage.getItem("sc_deleted_cats")||"{}"); } catch(e){ return {}; } });
  const [notifs, setNotifs]     = useState([]);
  const [notifMenu, setNotifMenu] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [view, setView]         = useState("accueil");
  const [espace, setEspace]     = useState(null);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch]     = useState("");
  const [sidebar, setSidebar]   = useState(()=>window.innerWidth>767);
  const [toast, setToast]       = useState(null);
  const [navHistory, setNavHistory] = useState([]);
  const [seenEspaces, setSeenEspaces] = useState({});
  const [seenDocs, setSeenDocs] = useState(new Set());

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
  const [loginScreen, setLoginScreen]       = useState("welcome");
  const [loginError, setLoginError]         = useState("");
  const [selectedUser, setSelectedUser]     = useState(null);
  const [legalView, setLegalView]           = useState(null);
  const [loginProfiles, setLoginProfiles]   = useState([]);
  const [authLoading, setAuthLoading]       = useState(true);
  const [loginLoading, setLoginLoading]     = useState(false);

  // Gestion des accès
  const [gestionProfiles, setGestionProfiles]   = useState([]);
  const [gestionLoading, setGestionLoading]     = useState(false);
  const [modalAddUser, setModalAddUser]         = useState(false);
  const [modalResetPwd, setModalResetPwd]       = useState(null);
  const [modalEditRole, setModalEditRole]       = useState(null);
  const [modalConfirmDel, setModalConfirmDel]   = useState(null);
  const [userMenuOpen, setUserMenuOpen]         = useState(null); // { profile, top, left, above }
  const [addUserForm, setAddUserForm]           = useState({ name:"", email:"", role:"enseignant", password:"", color:"#0d9488" });
  const [addUserErrors, setAddUserErrors]       = useState({});
  const [resetPwdValue, setResetPwdValue]       = useState("");
  const [editRoleValue, setEditRoleValue]       = useState("");

  const isSA         = ["direction","adjoint"].includes(user?.role);
  const isAdmin      = ["direction","adjoint","admin"].includes(user?.role);
  const canGererAcces = user?.peut_gerer_acces === true;
  const unread  = notifs.filter(n=>!n.lu).length;
  const pending = docs.filter(d=>d.status==="attente").length;

  useEffect(() => {
    if (user) {
      loadDocs();
      loadCats();
      loadNotifs(user);
    }
  }, [user]);

  // ── Auth Supabase ──
  useEffect(() => {
    // Charger la liste des profils pour l'écran de connexion
    loadLoginProfiles();

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) loadProfile(session.user.id);
      else if (event === "SIGNED_OUT") { setUser(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) setSidebar(false);
      else setSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (data) setDocs(data);
    setLoading(false);
  };

  const loadCats = async (overrideDeleted) => {
    const del = overrideDeleted || deletedCats;
    const { data } = await supabase.from("categories").select("*");
    const grouped = {};
    Object.entries(CATS_DEFAUT).forEach(([k,v]) => {
      grouped[k] = v.filter(c => !(del[k]||[]).includes(c));
    });
    if (data) {
      data.forEach(c => {
        if (!(del[c.espace_id]||[]).includes(c.nom)) {
          if (!grouped[c.espace_id]) grouped[c.espace_id] = [];
          if (!grouped[c.espace_id].includes(c.nom)) grouped[c.espace_id].push(c.nom);
        }
      });
    }
    setCats(grouped);
  };

  const loadNotifs = async (currentUser) => {
    const u = currentUser || user;
    if (!u) return;
    const adminRoles = ["superadmin","admin"];
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) { console.error("[loadNotifs]", error); return; }
    if (data) {
      // Si toutes les notifs ont destinataire=null, la colonne n'existe pas encore → afficher tout
      const colonneActive = data.some(n => n.destinataire !== null && n.destinataire !== undefined);
      const filtered = colonneActive
        ? data.filter(n => n.destinataire ? n.destinataire === u.name : adminRoles.includes(u.role))
        : data; // fallback : colonne absente → tout afficher
      setNotifs(filtered);
    }
  };

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(null),3000); };

  const sendNotif = async (texte, opts={}) => {
    const { error } = await supabase.from("notifications").insert({ texte, lu:false, ...opts });
    if (error) {
      console.error("[sendNotif] colonnes optionnelles absentes, insert basique :", error.message);
      const { error: err2 } = await supabase.from("notifications").insert({ texte, lu:false });
      if (err2) console.error("[sendNotif] échec insert basique :", err2.message);
    }
  };

  const markDocSeen = (docId) => {
    if (!user) return;
    setSeenDocs(prev => {
      const next = new Set(prev);
      next.add(docId);
      localStorage.setItem(`seen_docs_${user.id}`, JSON.stringify([...next]));
      return next;
    });
  };

  const markEspaceSeen = (espId, currentUser) => {
    const u = currentUser || user;
    if (!u || !espId) return;
    const key = `seen_${u.id}_${espId}`;
    const now = new Date().toISOString();
    localStorage.setItem(key, now);
    setSeenEspaces(prev => ({ ...prev, [`${u.id}_${espId}`]: now }));
  };

  const getLastSeen = (espId, currentUser) => {
    const u = currentUser || user;
    if (!u) return null;
    return seenEspaces[`${u.id}_${espId}`] || localStorage.getItem(`seen_${u.id}_${espId}`);
  };

  const goTo = (v, esp=null) => {
    if (view !== "accueil" && view !== "dashboard") setNavHistory(h=>[...h, {view, espace}]);
    setView(v);
    if (esp) { setEspace(esp); if (v === "espace") markEspaceSeen(esp.id); }
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

  const loadLoginProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id,name,role,color,email,actif").eq("actif",true).order("created_at");
    if (data) setLoginProfiles(data);
  };

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data && data.actif) {
      const seen = {};
      ESPACES.forEach(e => { const v = localStorage.getItem(`seen_${data.id}_${e.id}`); if (v) seen[`${data.id}_${e.id}`] = v; });
      setSeenEspaces(seen);
      const raw = localStorage.getItem(`seen_docs_${data.id}`);
      setSeenDocs(raw ? new Set(JSON.parse(raw)) : new Set());
      setUser(data);
      setView(["direction","adjoint","admin"].includes(data.role) ? "dashboard" : "accueil");
    } else {
      await supabase.auth.signOut();
      setLoginError("Votre compte a été désactivé. Contactez la direction.");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!selectedUser) { setLoginError("Veuillez sélectionner un profil"); return; }
    if (!loginPassword.trim()) { setLoginError("Veuillez saisir votre mot de passe"); return; }
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: selectedUser.email, password: loginPassword });
    setLoginLoading(false);
    if (error) setLoginError("Mot de passe incorrect");
    // Si succès, onAuthStateChange déclenche loadProfile automatiquement
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("accueil");
    setEspace(null);
    setNavHistory([]);
    setDocs([]);
    setLoginScreen("welcome");
    setSelectedUser(null);
    setLoginPassword("");
  };

  // ── Gestion des accès ──
  const callManageUsers = async (action, payload) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-users`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  };

  const loadGestionProfiles = async () => {
    setGestionLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    if (data) {
      const ROLE_ORDER = { direction:0, adjoint:1, admin:2, enseignant:3 };
      setGestionProfiles([...data].sort((a,b) => {
        if (b.peut_gerer_acces !== a.peut_gerer_acces) return b.peut_gerer_acces ? 1 : -1;
        return (ROLE_ORDER[a.role]??9) - (ROLE_ORDER[b.role]??9);
      }));
    }
    setGestionLoading(false);
  };

  const handleAddUser = async () => {
    const errs = {};
    if (!addUserForm.name.trim())  errs.name  = "Obligatoire";
    if (!addUserForm.email.trim()) errs.email = "Obligatoire";
    if (!addUserForm.password.trim() || addUserForm.password.length < 8) errs.password = "8 caractères minimum";
    if (Object.keys(errs).length) { setAddUserErrors(errs); return; }
    const res = await callManageUsers("createUser", addUserForm);
    if (res.error) { showToast(res.error, true); return; }
    setModalAddUser(false);
    setAddUserForm({ name:"", email:"", role:"enseignant", password:"", color:"#0d9488" });
    setAddUserErrors({});
    loadGestionProfiles();
    showToast("Compte créé ✓");
  };

  const handleResetPwd = async () => {
    if (!resetPwdValue.trim() || resetPwdValue.length < 8) { showToast("8 caractères minimum", true); return; }
    const res = await callManageUsers("resetPassword", { userId: modalResetPwd.id, newPassword: resetPwdValue });
    if (res.error) { showToast(res.error, true); return; }
    setModalResetPwd(null);
    setResetPwdValue("");
    showToast("Mot de passe réinitialisé ✓");
  };

  const handleEditRole = async () => {
    const res = await callManageUsers("updateUserRole", { userId: modalEditRole.id, role: editRoleValue });
    if (res.error) { showToast(res.error, true); return; }
    setModalEditRole(null);
    loadGestionProfiles();
    showToast("Rôle mis à jour ✓");
  };

  const handleToggleActive = async (profile) => {
    const res = await callManageUsers("toggleActive", { userId: profile.id, actif: !profile.actif });
    if (res.error) { showToast(res.error, true); return; }
    loadGestionProfiles();
    loadLoginProfiles();
    showToast(profile.actif ? "Compte désactivé" : "Compte réactivé ✓");
  };

  const handleDeleteUser = async (profile) => {
    const res = await callManageUsers("deleteUser", { userId: profile.id });
    if (res.error) { showToast(res.error, true); return; }
    setModalConfirmDel(null);
    loadGestionProfiles();
    loadLoginProfiles();
    showToast("Compte supprimé");
  };

  const handleValider = async (id) => {
    const doc = docs.find(d=>d.id===id);
    await supabase.from("documents").update({ status:"valide", commentaire:"", validated_by: user.id, validateur: user.name }).eq("id", id);
    await sendNotif(`Votre document "${doc?.titre}" a été validé ✓`, { destinataire:doc?.deposant||doc?.auteur, doc_id:id });
    loadDocs();
    loadNotifs(user);
    showToast("Document validé ✓");
  };

  const handleRefuser = async (id) => {
    const motif = refusComment[id]?.trim();
    if (!motif) { setRefusErrors(e=>({...e,[id]:true})); return; }
    const doc = docs.find(d=>d.id===id);
    setRefusErrors(e=>({...e,[id]:false}));
    await supabase.from("documents").update({ status:"refuse", commentaire:motif }).eq("id", id);
    await sendNotif(`Votre document "${doc?.titre}" a été refusé`, { destinataire:doc?.deposant||doc?.auteur, doc_id:id });
    setRefusMode(m=>({...m,[id]:false}));
    setRefusComment(c=>({...c,[id]:""}));
    loadDocs();
    loadNotifs(user);
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
    const newDeleted = { ...deletedCats, [espId]: [...(deletedCats[espId]||[]), cat] };
    setDeletedCats(newDeleted);
    localStorage.setItem("sc_deleted_cats", JSON.stringify(newDeleted));
    if (catFilter === cat) setCatFilter("all");
    setModalDeleteCat(null);
    loadDocs();
    loadCats(newDeleted);
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

    const status = isAdmin ? "valide" : "attente";
    const { error } = await supabase.from("documents").insert({
      espace_id: espace.id,
      categorie: uploadForm.categorie || cats[espace.id]?.[0] || "Général",
      titre: uploadForm.titre,
      description: uploadForm.desc,
      auteur: `${uploadForm.prenom} ${uploadForm.nom}`,
      deposant: user.name,
      uploaded_by: user.id,
      type: getType(uploadForm.file),
      file_url,
      status,
      commentaire: "",
    });

    if (!error) {
      if (status === "attente") {
        await sendNotif(`"${uploadForm.titre}" en attente de validation`);
      }
      setUploadForm({ prenom:"", nom:"", titre:"", desc:"", file:"", fileObj:null });
      setUploadErrors({});
      setModalUpload(false);
      loadDocs();
      loadNotifs(user);
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

  // Docs publiés visibles dans l'espace (pas refusés, pas en attente)
  const espDocs = (espId) => docs.filter(d => {
    if (d.espace_id !== espId) return false;
    if (d.status !== "valide") return false;
    if (catFilter !== "all" && d.categorie !== catFilter) return false;
    if (search && !d.titre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  // Docs en attente déposés par l'utilisateur courant (non-admin)
  const espDocsPending = (espId) => (!isSA && !isAdmin)
    ? docs.filter(d => d.espace_id === espId && d.status === "attente" && (d.deposant === user?.name || d.auteur === user?.name))
    : [];

  const fieldStyle = (err) => ({ ...inputStyle, borderColor: err ? "#dc2626" : "#0F2C5C" });

  const markNotifLue = async (id) => {
    await supabase.from("notifications").update({ lu:true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id===id ? {...n, lu:true} : n));
  };
  const deleteNotif = async (id) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  // ══ ÉCRAN CHARGEMENT AUTH ═════════════════════════════════════════════════
  if (authLoading) {
    const loginBg = "linear-gradient(165deg, #0F2C5C 20%, #1C49A6 55%, #e8eaf6 100%)";
    return (
      <div style={{ minHeight:"100vh", background:loginBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Calibri',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:70, height:70, borderRadius:"50%", overflow:"hidden", margin:"0 auto 16px", border:"2px solid rgba(255,255,255,.4)" }}>
            <img src="/IMG_6909.jpeg" alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:13 }}>Chargement…</div>
        </div>
      </div>
    );
  }

  // ══ PAGES LÉGALES ══════════════════════════════════════════════════════════
  const LEGAL_PAGES = {
    mentions: {
      title: "Mentions Légales",
      sections: [
        { h:"1. Éditeur de l'application", body: <><p>L'application Saint-Charles est éditée par la direction de l'établissement scolaire Saint-Charles.</p><ul><li>Établissement : École Saint-Charles</li><li>Adresse : 7A, avenue de la Palestine, ZAC Moulin Joli, 97419 La Possession</li></ul></> },
        { h:"2. Responsable de la publication", body: <p>La direction de l'établissement assure la responsabilité de la publication des contenus diffusés sur l'application.</p> },
        { h:"3. Hébergement", body: <><p>L'application est hébergée par :</p><ul><li>Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis (vercel.com)</li><li>Supabase Inc. — services de base de données, d'authentification et de stockage de fichiers (supabase.com)</li></ul></> },
        { h:"4. Propriété intellectuelle", body: <><p>L'ensemble des éléments composant l'application (textes, logo, charte graphique, structure des espaces documentaires) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable de la direction de l'établissement, est interdite.</p><p>Les documents déposés par les utilisateurs restent la propriété de leurs auteurs respectifs ou de l'établissement, selon leur nature.</p></> },
        { h:"5. Données personnelles", body: <><p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, les utilisateurs disposent d'un droit d'accès, de rectification, de suppression, de limitation et d'opposition concernant leurs données personnelles.</p><p>Ces droits peuvent être exercés en contactant la direction de l'établissement par courrier, à l'adresse mentionnée ci-dessus.</p><p>Les données collectées (identifiants de connexion, documents déposés, historique de validation) sont strictement réservées à l'usage interne de l'établissement et ne sont en aucun cas cédées à des tiers.</p></> },
        { h:"6. Cookies", body: <p>L'application peut utiliser des cookies techniques strictement nécessaires à son fonctionnement (maintien de la session de connexion). Aucun cookie de mesure d'audience ou publicitaire n'est utilisé.</p> },
        { h:"7. Limitation de responsabilité", body: <p>La direction de l'établissement s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur l'application, mais ne peut garantir l'absence d'erreur ou d'interruption de service.</p> },
        { h:"8. Contact", body: <p>Pour toute question relative à l'application, vous pouvez contacter la direction de l'établissement par courrier, à l'adresse mentionnée en début de document.</p> },
      ]
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      sections: [
        { h:"Article 1 — Objet", body: <><p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'accès et d'utilisation de l'application Saint-Charles, plateforme de partage et de gestion de documents scolaires destinée à la communauté de l'établissement.</p><p>Toute utilisation de l'application implique l'acceptation pleine et entière des présentes CGU.</p></> },
        { h:"Article 2 — Accès à l'application", body: <p>L'accès à l'application est réservé aux personnes disposant d'un compte créé par la direction de l'établissement. Aucune inscription libre n'est possible : la création des comptes relève exclusivement de la direction.</p> },
        { h:"Article 2 bis — Usage strictement interne", body: <><p>L'application Saint-Charles est un outil de gestion documentaire <strong>à usage exclusivement interne à l'établissement scolaire Saint-Charles</strong>.</p><p>Son utilisation est strictement réservée aux membres du personnel de l'établissement dans le cadre de leurs fonctions professionnelles. Il est formellement interdit :</p><ul><li>d'utiliser l'application en dehors du cadre professionnel lié à l'établissement ;</li><li>de partager les identifiants de connexion avec toute personne extérieure à l'établissement ;</li><li>de diffuser, reproduire ou transmettre à des tiers tout contenu accessible via l'application sans autorisation préalable de la direction ;</li><li>d'accéder à l'application depuis un poste ou un réseau non sécurisé lorsque cela est susceptible de compromettre la confidentialité des données.</li></ul><p>Tout manquement à ces obligations pourra entraîner la suspension ou la suppression de l'accès, sans préjudice des sanctions disciplinaires ou légales applicables.</p></> },
        { h:"Article 3 — Comptes utilisateurs et rôles", body: <><p>L'application distingue plusieurs niveaux d'accès : Super-administrateur, Administrateur, Personnel enseignant.</p><p>Chaque utilisateur s'engage à :</p><ul><li>conserver la confidentialité de ses identifiants de connexion ;</li><li>ne pas les communiquer à un tiers ;</li><li>signaler sans délai à la direction toute utilisation suspecte de son compte.</li></ul><p>La direction se réserve le droit de suspendre ou de supprimer un compte en cas de non-respect des présentes CGU.</p></> },
        { h:"Article 4 — Description des services", body: <><p>L'application propose notamment :</p><ul><li>des espaces documentaires thématiques organisés par catégorie ;</li><li>le téléversement et la consultation de documents ;</li><li>un système de validation des documents déposés ;</li><li>des notifications liées à l'activité des espaces documentaires.</li></ul></> },
        { h:"Article 5 — Obligations des utilisateurs", body: <><p>L'utilisateur s'engage à :</p><ul><li>utiliser l'application conformément à sa destination (gestion documentaire scolaire) ;</li><li>ne déposer que des documents dont il a le droit de diffusion ;</li><li>ne pas déposer de contenu illicite, diffamatoire, ou portant atteinte aux droits de tiers ;</li><li>respecter la confidentialité des informations auxquelles il a accès dans le cadre de ses fonctions.</li></ul></> },
        { h:"Article 6 — Propriété intellectuelle", body: <p>La structure de l'application, sa charte graphique et son contenu éditorial sont protégés par le droit de la propriété intellectuelle. Les documents déposés par les utilisateurs restent la propriété de leurs auteurs respectifs ou de l'établissement, selon leur nature, et ne peuvent être réutilisés hors du cadre de l'application sans autorisation.</p> },
        { h:"Article 7 — Responsabilité", body: <><p>La direction de l'établissement met tout en œuvre pour assurer la disponibilité et la sécurité de l'application, sans pouvoir garantir une disponibilité continue ni l'absence totale d'incident technique.</p><p>Chaque utilisateur est seul responsable des documents qu'il dépose et de l'usage qu'il fait de son compte.</p></> },
        { h:"Article 8 — Protection des données personnelles", body: <p>Les données à caractère personnel traitées dans le cadre de l'application (identifiants, documents associés à un compte) le sont conformément au RGPD. Pour plus de détails, l'utilisateur est invité à consulter la Politique de Confidentialité de l'application.</p> },
        { h:"Article 9 — Modification des CGU", body: <p>La direction de l'établissement se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p> },
        { h:"Article 10 — Droit applicable et juridiction", body: <p>Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Saint-Denis de La Réunion seront seuls compétents.</p> },
      ]
    },
    confidentialite: {
      title: "Politique de Confidentialité",
      sections: [
        { h:"1. Responsable du traitement", body: <><p>Le responsable du traitement des données à caractère personnel collectées via l'application Saint-Charles est la direction de l'établissement scolaire Saint-Charles.</p><ul><li>Adresse : École Saint-Charles, 7A avenue de la Palestine, ZAC Moulin Joli, 97419 La Possession</li></ul></> },
        { h:"2. Données collectées", body: <><p>Dans le cadre du fonctionnement de l'application, les données suivantes sont collectées :</p><ul><li>Données de compte : identifiant de connexion, adresse email, rôle (super-administrateur, administrateur, personnel enseignant)</li><li>Données d'usage : documents déposés, statut de validation des documents, historique d'activité dans les espaces documentaires</li><li>Données techniques : journaux de connexion nécessaires à la sécurité de l'application</li></ul><p>Aucune donnée bancaire ni donnée sensible (au sens de l'article 9 du RGPD) n'est collectée par l'application.</p></> },
        { h:"3. Finalités du traitement", body: <><p>Les données sont collectées et traitées pour les finalités suivantes :</p><ul><li>gestion des accès et des comptes utilisateurs ;</li><li>partage et validation des documents scolaires entre les membres autorisés de l'établissement ;</li><li>envoi de notifications liées à l'activité des espaces documentaires ;</li><li>sécurité et bon fonctionnement de l'application.</li></ul></> },
        { h:"4. Base légale du traitement", body: <><p>Le traitement repose sur :</p><ul><li>l'intérêt légitime de l'établissement à organiser la gestion documentaire interne ;</li><li>l'exécution des missions confiées aux utilisateurs dans le cadre de leurs fonctions au sein de l'établissement.</li></ul></> },
        { h:"5. Durée de conservation", body: <p>Les données sont conservées pendant toute la durée d'activité du compte utilisateur au sein de l'établissement. À la suppression d'un compte par la direction, les données associées sont supprimées ou archivées selon la politique interne de l'établissement.</p> },
        { h:"6. Destinataires des données", body: <><p>Les données sont accessibles uniquement :</p><ul><li>aux utilisateurs habilités selon leur rôle (super-administrateur, administrateur, personnel enseignant) ;</li><li>à la direction de l'établissement, en sa qualité de responsable du traitement.</li></ul><p>Aucune donnée n'est cédée, louée ou vendue à des tiers à des fins commerciales.</p></> },
        { h:"7. Sous-traitants et hébergement", body: <><p>L'application repose sur les prestataires techniques suivants, agissant en qualité de sous-traitants au sens du RGPD :</p><ul><li>Vercel Inc. (hébergement de l'application) — États-Unis</li><li>Supabase Inc. (base de données, authentification, stockage des documents) — États-Unis</li></ul><p>Ces prestataires étant situés hors de l'Union européenne, les transferts de données sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne), conformément aux dispositions du RGPD.</p></> },
        { h:"8. Sécurité des données", body: <><p>L'application met en œuvre les mesures de sécurité suivantes :</p><ul><li>authentification sécurisée des utilisateurs (Supabase Auth) ;</li><li>restriction des accès par rôle (Row Level Security) ;</li><li>stockage des documents sur un espace de stockage sécurisé à accès restreint ;</li><li>chiffrement des données en transit (HTTPS).</li></ul></> },
        { h:"9. Droits des personnes concernées", body: <><p>Conformément au RGPD, chaque utilisateur dispose des droits suivants sur ses données personnelles :</p><ul><li>droit d'accès : obtenir une copie des données le concernant ;</li><li>droit de rectification : corriger des données inexactes ;</li><li>droit à l'effacement : demander la suppression de ses données, sous réserve des obligations de conservation de l'établissement ;</li><li>droit à la limitation du traitement ;</li><li>droit d'opposition, pour motif légitime ;</li><li>droit à la portabilité, lorsqu'applicable.</li></ul><p>Ces droits peuvent être exercés en contactant la direction de l'établissement par courrier, à l'adresse mentionnée en début de document.</p><p>Une réponse sera apportée dans un délai maximal d'un mois conformément à la réglementation en vigueur.</p></> },
        { h:"10. Droit de réclamation", body: <p>En cas de désaccord sur le traitement de ses données, l'utilisateur peut introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) — www.cnil.fr.</p> },
        { h:"11. Modification de la politique de confidentialité", body: <p>La direction de l'établissement se réserve le droit de modifier la présente politique de confidentialité à tout moment, notamment pour se conformer à toute évolution réglementaire. Les utilisateurs seront informés de toute modification substantielle.</p> },
        { h:"12. Contact", body: <p>Pour toute question relative à la protection des données personnelles, contactez la direction de l'établissement par courrier, à l'adresse mentionnée en début de document.</p> },
      ]
    }
  };

  if (legalView && LEGAL_PAGES[legalView]) {
    const page = LEGAL_PAGES[legalView];
    return (
      <div style={{ minHeight:"100vh", background:"#f5f0e8", fontFamily:"'Calibri',sans-serif", padding:"32px 20px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <button onClick={()=>setLegalView(null)} style={{ background:"none", border:"1.5px solid #0F2C5C", color:"#0F2C5C", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontSize:13, fontFamily:"'Calibri',sans-serif", marginBottom:32, display:"inline-flex", alignItems:"center", gap:6 }}>← Retour</button>
          <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, color:"#0F2C5C", marginBottom:32 }}>{page.title}</h1>
          {page.sections.map((s,i)=>(
            <div key={i} style={{ marginBottom:28 }}>
              <h2 style={{ fontFamily:"'Calibri',sans-serif", fontSize:17, color:"#0F2C5C", marginBottom:10, textAlign:"left" }}>{s.h}</h2>
              <div style={{ fontSize:14, color:"#374151", lineHeight:1.75, textAlign:"left" }}>{s.body}</div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid rgba(15,44,92,.15)", paddingTop:20, marginTop:40, textAlign:"center", fontSize:12, color:"rgba(15,44,92,.45)" }}>
            <span onClick={()=>setLegalView("mentions")} style={{ cursor:"pointer", textDecoration:"underline" }}>Mentions légales</span>
            {" · "}
            <span onClick={()=>setLegalView("cgu")} style={{ cursor:"pointer", textDecoration:"underline" }}>CGU</span>
            {" · "}
            <span onClick={()=>setLegalView("confidentialite")} style={{ cursor:"pointer", textDecoration:"underline" }}>Confidentialité</span>
          </div>
        </div>
      </div>
    );
  }

  // ══ ÉCRAN LOGIN ════════════════════════════════════════════════════════════
  if (!user) {
    const loginBg = "linear-gradient(165deg, #0F2C5C 20%, #1C49A6 55%, #e8eaf6 100%)";

    // ── ÉCRAN 1 : Accueil ──
    if (loginScreen === "welcome") return (
      <div style={{ minHeight:"100vh", background:loginBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Calibri',sans-serif", position:"relative", overflow:"hidden" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>

        {/* Contenu centré */}
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center" }}>

          {/* Arbre + Logo combinés */}
          <div style={{ position:"relative", width:330, height:310, display:"flex", alignItems:"flex-start", justifyContent:"center", marginBottom:8 }}>
            <svg width="330" height="310" viewBox="0 0 330 310" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.35" stroke="#f5f0e8" fill="none" strokeLinecap="round">
                <path d="M165,310 Q160,250 168,185 Q170,178 165,172" strokeWidth="7" />
                <path d="M166,210 Q120,200 88,158 Q70,135 55,98" strokeWidth="4.5" />
                <path d="M88,158 Q66,150 42,162" strokeWidth="2.3" />
                <path d="M55,98 Q44,76 50,52" strokeWidth="2.6" />
                <path d="M55,98 Q70,88 84,92" strokeWidth="2" />
                <path d="M50,52 Q56,38 70,34" strokeWidth="1.8" />
                <path d="M166,224 Q132,222 104,202 Q88,190 80,172" strokeWidth="3.2" />
                <path d="M104,202 Q94,184 100,160" strokeWidth="2" />
                <path d="M168,196 Q140,180 126,150 Q120,138 124,120" strokeWidth="2.8" />
                <path d="M126,150 Q112,142 102,128" strokeWidth="1.8" />
                <path d="M166,205 Q214,192 244,138 Q258,112 252,74" strokeWidth="4.8" />
                <path d="M244,138 Q266,130 288,144" strokeWidth="2.4" />
                <path d="M252,74 Q262,52 256,32" strokeWidth="2.5" />
                <path d="M252,74 Q238,62 224,68" strokeWidth="2" />
                <path d="M256,32 Q250,18 236,18" strokeWidth="1.8" />
                <path d="M167,228 Q200,224 230,206 Q248,194 258,176" strokeWidth="3" />
                <path d="M230,206 Q242,188 238,164" strokeWidth="2" />
                <path d="M169,192 Q196,176 208,148 Q214,134 210,116" strokeWidth="2.6" />
                <path d="M208,148 Q222,138 234,124" strokeWidth="1.8" />
                <path d="M167,180 Q158,148 172,118 Q178,104 174,88" strokeWidth="3" />
                <path d="M172,118 Q188,108 196,90" strokeWidth="1.8" />
                <path d="M80,172 Q62,162 48,172" strokeWidth="1.8" />
                <path d="M258,176 Q274,164 290,170" strokeWidth="1.8" />
                <path d="M252,90 Q276,76 300,88 Q314,96 318,116" strokeWidth="1.8" />
                <path d="M318,116 Q330,104 326,92" strokeWidth="1.5" />
                <path d="M124,120 Q110,106 114,90" strokeWidth="1.8" />
                <path d="M210,116 Q224,104 220,88" strokeWidth="1.8" />
              </g>
              <g opacity="0.75">
                <path d="M50,52 Q38,34 47,26 Q57,38 50,52Z" fill="#66bb6a" />
                <path d="M70,34 Q80,18 71,12 Q62,24 70,34Z" fill="#43a047" />
                <path d="M42,162 Q30,148 38,140 Q48,152 42,162Z" fill="#66bb6a" />
                <path d="M100,160 Q88,146 96,138 Q106,150 100,160Z" fill="#43a047" />
                <path d="M102,128 Q92,114 100,107 Q110,119 102,128Z" fill="#66bb6a" />
                <path d="M256,32 Q268,14 259,8 Q249,20 256,32Z" fill="#66bb6a" />
                <path d="M236,18 Q226,2 235,-2 Q244,10 236,18Z" fill="#43a047" />
                <path d="M288,144 Q300,130 292,122 Q282,134 288,144Z" fill="#66bb6a" />
                <path d="M238,164 Q250,148 241,141 Q231,153 238,164Z" fill="#43a047" />
                <path d="M234,124 Q246,110 237,103 Q227,115 234,124Z" fill="#66bb6a" />
                <path d="M196,90 Q208,74 199,68 Q189,80 196,90Z" fill="#43a047" />
                <path d="M224,68 Q214,52 222,46 Q232,58 224,68Z" fill="#66bb6a" />
                <path d="M84,92 Q74,78 82,71 Q92,83 84,92Z" fill="#43a047" />
                <path d="M48,172 Q36,158 44,150 Q54,162 48,172Z" fill="#66bb6a" />
                <path d="M290,170 Q302,156 294,148 Q284,160 290,170Z" fill="#43a047" />
                <path d="M114,90 Q104,76 112,69 Q122,81 114,90Z" fill="#66bb6a" />
                <path d="M220,88 Q232,72 223,66 Q213,78 220,88Z" fill="#43a047" />
                <path d="M80,172 Q68,162 74,154 Q84,164 80,172Z" fill="#4caf50" />
                <path d="M258,176 Q270,164 264,156 Q254,166 258,176Z" fill="#4caf50" />
                <path d="M174,88 Q166,72 174,65 Q182,76 174,88Z" fill="#43a047" />
                <path d="M196,90 Q186,76 192,68 Q202,78 196,90Z" fill="#66bb6a" />
                <circle cx="44" cy="32" r="4.5" fill="#ce93d8" />
                <circle cx="262" cy="14" r="4" fill="#81d4fa" />
                <circle cx="76" cy="20" r="3" fill="#fff176" />
                <circle cx="296" cy="128" r="3.5" fill="#fff176" />
                <circle cx="34" cy="148" r="3" fill="#81d4fa" />
                <circle cx="206" cy="74" r="3.5" fill="#ce93d8" />
                <circle cx="120" cy="115" r="2.5" fill="#fff176" />
                <circle cx="248" cy="150" r="3" fill="#81d4fa" />
                <circle cx="218" cy="52" r="2.8" fill="#fff176" />
                <circle cx="92" cy="76" r="2.5" fill="#ce93d8" />
                <circle cx="186" cy="100" r="2.5" fill="#81d4fa" />
                <circle cx="40" cy="158" r="3" fill="#fff176" />
                <circle cx="286" cy="156" r="3" fill="#ce93d8" />
                <circle cx="108" cy="78" r="2.5" fill="#81d4fa" />
                <circle cx="226" cy="76" r="2.5" fill="#fff176" />
                {/* Feuilles supplémentaires */}
                <path d="M55,98 Q42,86 50,78 Q62,90 55,98Z" fill="#4caf50" />
                <path d="M166,224 Q154,212 160,204 Q172,216 166,224Z" fill="#66bb6a" />
                <path d="M167,228 Q178,214 170,207 Q160,219 167,228Z" fill="#43a047" />
                <path d="M126,150 Q114,140 120,132 Q132,142 126,150Z" fill="#4caf50" />
                <path d="M244,138 Q256,126 250,118 Q238,128 244,138Z" fill="#66bb6a" />
                <path d="M168,196 Q156,186 162,178 Q174,188 168,196Z" fill="#43a047" />
                <path d="M230,206 Q218,196 224,188 Q236,198 230,206Z" fill="#4caf50" />
                <path d="M104,202 Q92,192 98,184 Q110,194 104,202Z" fill="#66bb6a" />
                <path d="M326,92 Q338,76 329,70 Q318,82 326,92Z" fill="#66bb6a" />
                <path d="M326,92 Q340,86 338,76 Q326,80 326,92Z" fill="#43a047" />
              </g>
            </svg>
            {/* Logo centré en haut, positionné par-dessus l'arbre */}
            <div style={{ position:"absolute", top:52, left:"50%", marginLeft:-70, zIndex:6, width:140, height:140, borderRadius:"50%", overflow:"hidden", border:"3px solid rgba(255,255,255,.5)", boxShadow:"0 4px 24px rgba(0,0,0,.3)", background:"#fff" }}>
              <img src="/IMG_6909.jpeg" alt="Logo Saint-Charles" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
          </div>

          <h1 style={{ fontFamily:"'Calibri',sans-serif", color:"#f5f0e8", fontSize:22, margin:"0 0 8px", textAlign:"center", fontWeight:700 }}>École Privée Saint-Charles</h1>
          <p style={{ color:"rgba(245,240,232,.6)", fontSize:11, margin:"0 0 32px", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Calibri',sans-serif" }}>Espace numérique</p>

          <button onClick={()=>setLoginScreen("profiles")}
            style={{ background:"#1C49A6", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:20, padding:"8px 28px", fontSize:14, fontWeight:500, fontFamily:"'Calibri',sans-serif", cursor:"pointer", backdropFilter:"blur(12px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.2), 0 4px 14px rgba(0,0,0,.25)", letterSpacing:".3px" }}>
            Se connecter
          </button>
        </div>
      </div>
    );

    // ── ÉCRAN 2 : Profils ──
    return (
      <div style={{ minHeight:"100vh", background:loginBg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Calibri',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}input::placeholder{color:rgba(245,240,232,.55)!important;opacity:1}`}</style>
        <div style={{ width:"100%", maxWidth:420 }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ width:60, height:60, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(255,255,255,.45)", margin:"0 auto 12px", boxShadow:"0 2px 12px rgba(0,0,0,.25)" }}>
              <img src="/IMG_6909.jpeg" alt="Logo Saint-Charles" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
            <h1 style={{ fontFamily:"'Calibri',sans-serif", color:"#f5f0e8", fontSize:20, margin:"0 0 4px", fontWeight:700 }}>École Privée Saint-Charles</h1>
            <p style={{ color:"rgba(245,240,232,.6)", fontSize:12, margin:0 }}>Espace de partage de documents</p>
          </div>

          {/* Boîte profils */}
          <div style={{ background:"rgba(255,255,255,.08)", borderRadius:16, padding:16, marginBottom:12, border:"1px solid rgba(255,255,255,.15)", backdropFilter:"blur(12px)", boxShadow:"0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:10 }}>Sélectionner un profil</div>
            {loginProfiles.length === 0 && (
              <div style={{ color:"rgba(255,255,255,.4)", fontSize:13, textAlign:"center", padding:"12px 0" }}>Chargement des profils…</div>
            )}
            {loginProfiles.map(u=>{
              const isSelected = selectedUser?.id === u.id;
              const roleLabel = u.role==="direction"?"Direction":u.role==="adjoint"?"Adjoint(e) de direction":u.role==="admin"?"Administratif":"Enseignant";
              return (
              <div key={u.id}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, cursor:"pointer", marginBottom:6, border:`1px solid ${isSelected ? u.color : "rgba(255,255,255,.15)"}`, background: isSelected ? `${u.color}22` : "rgba(255,255,255,.08)", backdropFilter:"blur(12px)", transition:"all .2s", overflow:"hidden", position:"relative", boxShadow: isSelected ? `0 0 16px ${u.color}55, inset 0 0 20px ${u.color}18` : "none" }}
                onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="rgba(255,255,255,.14)" }}
                onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background="rgba(255,255,255,.08)" }}
                onClick={()=>{ setSelectedUser(u); setLoginError(""); setLoginPassword(""); }}>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:u.color, borderRadius:"10px 0 0 10px" }} />
                <div style={{ flex:1, paddingLeft:6 }}>
                  <div style={{ color:"#f5f0e8", fontSize:13, fontWeight:500 }}>{u.name}</div>
                  <div style={{ color:"rgba(245,240,232,.5)", fontSize:11 }}>{roleLabel}</div>
                </div>
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" style={{ flexShrink:0 }}>
                  <line x1="1" y1="8" x2="17" y2="8" stroke={u.color} strokeWidth="2.8" strokeLinecap="round"/>
                  <polyline points="11,2 19,8 11,14" fill="none" stroke={u.color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )})}
          </div>

          {/* Mot de passe */}
          <div style={{ background:"rgba(255,255,255,.08)", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(255,255,255,.15)", backdropFilter:"blur(12px)" }}>
            <label style={{ fontSize:12, color:"rgba(245,240,232,.7)", display:"block", marginBottom:8, fontWeight:500, letterSpacing:".3px" }}>Mot de passe</label>
            <input type="password" placeholder="Votre mot de passe..." value={loginPassword} onChange={e=>{ setLoginPassword(e.target.value); setLoginError(""); }}
              style={{ width:"100%", padding:"9px 13px", background:"rgba(255,255,255,.1)", border:`1px solid ${loginError?"#ef5350":"rgba(255,255,255,.2)"}`, borderRadius:10, fontFamily:"'Calibri',sans-serif", fontSize:14, outline:"none", color:"#f5f0e8", boxSizing:"border-box" }} />
            {loginError && <div style={{ color:"#ef9a9a", fontSize:12, marginTop:6, fontStyle:"italic" }}>{loginError}</div>}
            <div style={{ marginTop:12, display:"flex", gap:8 }}>
              <button onClick={()=>{ setLoginScreen("welcome"); setLoginPassword(""); setLoginError(""); }}
                style={{ flex:1, background:"rgba(255,255,255,.1)", color:"rgba(245,240,232,.7)", border:"1px solid rgba(255,255,255,.15)", borderRadius:10, padding:"8px 0", fontSize:13, cursor:"pointer", fontFamily:"'Calibri',sans-serif" }}>
                ← Retour
              </button>
              <button onClick={handleLogin} disabled={loginLoading}
                style={{ flex:2, background:"#1C49A6", color:"#fff", border:"1px solid rgba(255,255,255,.25)", borderRadius:10, padding:"8px 0", fontSize:13, fontWeight:500, cursor:loginLoading?"wait":"pointer", fontFamily:"'Calibri',sans-serif", backdropFilter:"blur(12px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.15)", opacity:loginLoading?.7:1 }}>
                {loginLoading ? "Connexion…" : "Connexion"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const c_esp = espace ? SPACE_COLORS[espace.id] : PALETTE[0];

  // ══ APP PRINCIPALE ═════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", fontFamily:"'Calibri',sans-serif" }} onClick={()=>setUserMenuOpen(null)}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        .nav-item:hover{background:rgba(255,255,255,.12)!important;color:#fff!important}
        input::placeholder,textarea::placeholder{color:rgba(0,96,100,.7)!important;opacity:1}
        @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
        @media(max-width:767px){.sc-hamburger{display:flex!important}}
        .legal-content ul{margin:8px 0 8px 18px;padding:0;text-align:left}.legal-content li{margin-bottom:4px;text-align:left}.legal-content p{margin:0 0 10px;text-align:left}

        /* ── SIDEBAR ── */
        .sc-sidebar{position:sticky;top:0;height:100vh;flex-shrink:0;transition:width .25s,min-width .25s,padding .25s}
        .sc-overlay{display:none}

        /* ── GRIDS ── */
        .sc-spaces-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
        .sc-docs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .sc-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
        .sc-upload-name{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
        .sc-main-pad{padding:28px 32px}
        .sc-topbar{display:flex;align-items:center;gap:12px;margin-bottom:28px}

        /* ── TABLETTE (≤ 1024px) ── */
        @media(max-width:1024px){
          .sc-spaces-grid{grid-template-columns:repeat(2,1fr)}
          .sc-docs-grid{grid-template-columns:repeat(2,1fr)}
          .sc-main-pad{padding:20px 20px}
        }

        /* ── MOBILE (≤ 767px) ── */
        @media(max-width:767px){
          .sc-sidebar{position:fixed!important;z-index:200;height:100vh;top:0;left:0}
          .sc-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:199;backdrop-filter:blur(2px);left:240px}
          .sc-spaces-grid{grid-template-columns:1fr}
          .sc-docs-grid{grid-template-columns:1fr}
          .sc-stat-grid{grid-template-columns:1fr}
          .sc-upload-name{grid-template-columns:1fr}
          .sc-main-pad{padding:16px 14px}
          .sc-topbar{margin-bottom:18px}
          button,a[role=button]{min-height:44px}
        }
      `}</style>

      {/* PORTAIL — menu actions gestion accès injecté dans document.body */}
      {userMenuOpen && createPortal(
        <>
          <div style={{ position:"fixed", inset:0, zIndex:9998 }} onClick={()=>setUserMenuOpen(null)} />
          <div style={{ position:"fixed", top:userMenuOpen.top, left:userMenuOpen.left, background:"#fff", borderRadius:10, boxShadow:"0 8px 30px rgba(0,0,0,.22)", border:"1px solid rgba(0,0,0,.09)", zIndex:9999, minWidth:210, overflow:"hidden" }}
            onClick={e=>e.stopPropagation()}>
            {(()=>{ const p=userMenuOpen.profile; return (<>
              <div onClick={()=>{ setModalEditRole(p); setEditRoleValue(p.role); setUserMenuOpen(null); }}
                style={{ padding:"11px 16px", fontSize:13, color:"#0F2C5C", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}
                onMouseEnter={e=>e.currentTarget.style.background="#f5f5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Icon name="user" size={13} color="#0F2C5C" /> Modifier le rôle
              </div>
              <div onClick={()=>{ setModalResetPwd(p); setUserMenuOpen(null); }}
                style={{ padding:"11px 16px", fontSize:13, color:"#0F2C5C", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}
                onMouseEnter={e=>e.currentTarget.style.background="#f5f5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Icon name="key" size={13} color="#0F2C5C" /> Réinitialiser le mot de passe
              </div>
              <div style={{ height:1, background:"rgba(0,0,0,.07)", margin:"3px 0" }} />
              <div onClick={()=>{ setModalConfirmDel(p); setUserMenuOpen(null); }}
                style={{ padding:"11px 16px", fontSize:13, color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}
                onMouseEnter={e=>e.currentTarget.style.background="#fff5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Icon name="trash" size={13} color="#dc2626" /> Supprimer le compte
              </div>
            </>); })()}
          </div>
        </>,
        document.body
      )}

      {toast && <div style={{ position:"fixed", bottom:28, right:28, zIndex:999, background:toast.err?"#c62828":"#1a237e", backdropFilter:"blur(12px)", color:"#fff", padding:"12px 22px", borderRadius:12, fontSize:14, fontWeight:500, boxShadow:"0 8px 30px rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.2)" }}>{toast.msg}</div>}

      {/* Overlay mobile pour fermer la sidebar */}
      {sidebar && <div className="sc-overlay" onClick={()=>setSidebar(false)} onTouchStart={e=>{ if(!e.target.closest('.sc-sidebar')) setSidebar(false); }} />}

      {/* MODALS */}
      {modalUpload && (
        <Modal title={`Déposer dans — ${espace?.nom}`} onClose={()=>{setModalUpload(false);setUploadErrors({});}}>
          <div className="sc-upload-name">
            <div>
              <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Prénom *</label>
              <input style={fieldStyle(uploadErrors.prenom)} placeholder="Votre prénom..." value={uploadForm.prenom} onChange={e=>setUploadForm(f=>({...f,prenom:e.target.value}))} />
              {uploadErrors.prenom && <div style={{ fontSize:12, color:"#dc2626", marginTop:4, fontStyle:"italic" }}>Obligatoire</div>}
            </div>
            <div>
              <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Nom *</label>
              <input style={fieldStyle(uploadErrors.nom)} placeholder="Votre nom..." value={uploadForm.nom} onChange={e=>setUploadForm(f=>({...f,nom:e.target.value}))} />
              {uploadErrors.nom && <div style={{ fontSize:12, color:"#dc2626", marginTop:4, fontStyle:"italic" }}>Obligatoire</div>}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Titre du document *</label>
            <input style={fieldStyle(uploadErrors.titre)} placeholder="Titre du document..." value={uploadForm.titre} onChange={e=>setUploadForm(f=>({...f,titre:e.target.value}))} />
            {uploadErrors.titre && <div style={{ fontSize:12, color:"#fca5a5", marginTop:4, fontStyle:"italic" }}>{uploadErrors.titre}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Catégorie</label>
            <select style={{...fieldStyle(false), appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230F2C5C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:36 }}
              value={uploadForm.categorie||""} onChange={e=>setUploadForm(f=>({...f,categorie:e.target.value}))}>
              <option value="">— Choisir une catégorie —</option>
              {(cats[espace?.id]||[]).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Description</label>
            <textarea style={{...fieldStyle(false),resize:"none"}} rows={3} placeholder="Description optionnelle..." value={uploadForm.desc} onChange={e=>setUploadForm(f=>({...f,desc:e.target.value}))} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Fichier <span style={{color:"#dc2626"}}>*</span> <span style={{fontWeight:400,fontSize:12,color:"rgba(0,96,100,.6)"}}>(PDF, Word, image)</span></label>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", background:uploadErrors.file?"rgba(220,38,38,.08)":"rgba(0,96,100,.06)", border:`1.5px dashed ${uploadErrors.file?"#dc2626":"rgba(0,96,100,.35)"}`, borderRadius:12, transition:"all .2s" }}>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp" style={{ display:"none" }}
                onChange={e=>{ const f=e.target.files?.[0]; if(f){ setUploadForm(p=>({...p,file:f.name,fileObj:f})); setUploadErrors(p=>({...p,file:undefined})); } }} />
              <span style={{ background:"#0F2C5C", color:"#fff", padding:"5px 14px", borderRadius:8, fontSize:12, fontWeight:600, flexShrink:0 }}>Choisir un fichier</span>
              <span style={{ fontSize:13, color: uploadForm.file ? "#0F2C5C" : "rgba(0,96,100,.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {uploadForm.file || "Aucun fichier sélectionné"}
              </span>
            </label>
            {uploadErrors.file && <div style={{ fontSize:12, color:"#dc2626", marginTop:4, fontStyle:"italic" }}>Veuillez sélectionner un fichier</div>}
          </div>
          {!isSA && <div style={{ fontSize:12, color:"#999", fontStyle:"italic", marginBottom:14 }}>* Votre document sera soumis à validation avant publication.</div>}
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
            <span style={{ background:modalDetail.status==="valide"?"rgba(5,150,105,.15)":modalDetail.status==="attente"?"rgba(217,119,6,.15)":"rgba(220,38,38,.15)", color:modalDetail.status==="valide"?"#6ee7b7":modalDetail.status==="attente"?"#fcd34d":"#fca5a5", padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600 }}>
              {modalDetail.status==="valide"?"Publié":modalDetail.status==="attente"?"En attente":"Refusé"}
            </span>
          </div>
          {modalDetail.description && <div style={{ background:"rgba(0,96,100,.06)", borderRadius:10, padding:"12px 16px", marginBottom:14, fontSize:14, color:"#0F2C5C", lineHeight:1.6 }}>{modalDetail.description}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {[["Catégorie",modalDetail.categorie],["Déposé par",modalDetail.auteur],["Date",fmtDate(modalDetail.created_at)],modalDetail.validateur?["Validé par",modalDetail.validateur]:null].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{ background:"rgba(0,96,100,.06)", borderRadius:10, border:"1px solid rgba(0,96,100,.12)", padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:"rgba(0,96,100,.5)", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:13, color:"#0F2C5C", fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          {modalDetail.commentaire && (
            <div style={{ background:modalDetail.status==="refuse"?"rgba(220,38,38,.1)":"rgba(251,191,36,.12)", border:`1px solid ${modalDetail.status==="refuse"?"rgba(220,38,38,.3)":"rgba(251,191,36,.25)"}`, borderRadius:10, padding:"12px 16px", marginBottom:14, fontSize:13, color:modalDetail.status==="refuse"?"#fca5a5":"#fef3c7" }}>
              <strong>{modalDetail.status==="refuse"?"Motif du refus :":"Commentaire admin :"}</strong> {modalDetail.commentaire}
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            {modalDetail.file_url && modalDetail.status === "valide" && (
              <a href={modalDetail.file_url} target="_blank" rel="noreferrer"
                style={{ flex:1, justifyContent:"center", background:"#0F2C5C", color:"#fff", border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'Calibri',sans-serif", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7, textDecoration:"none" }}>
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

      {/* MODAL AJOUTER COMPTE */}
      {modalAddUser && canGererAcces && (
        <Modal title="Ajouter un compte" onClose={()=>{setModalAddUser(false);setAddUserErrors({});}}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Nom affiché *</label>
            <input style={fieldStyle(addUserErrors.name)} placeholder="Ex : Marie Dupont" value={addUserForm.name} onChange={e=>setAddUserForm(f=>({...f,name:e.target.value}))} />
            {addUserErrors.name && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>{addUserErrors.name}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Email *</label>
            <input type="email" style={fieldStyle(addUserErrors.email)} placeholder="prenom.nom@saint-charles.re" value={addUserForm.email} onChange={e=>setAddUserForm(f=>({...f,email:e.target.value}))} />
            {addUserErrors.email && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>{addUserErrors.email}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Rôle</label>
            <select style={{...fieldStyle(false), appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230F2C5C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:36 }}
              value={addUserForm.role} onChange={e=>setAddUserForm(f=>({...f,role:e.target.value}))}>
              <option value="adjoint">Adjoint(e) de direction</option>
              <option value="admin">Administratif</option>
              <option value="enseignant">Enseignant</option>
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:6, fontWeight:500 }}>Mot de passe initial *</label>
            <input type="password" style={fieldStyle(addUserErrors.password)} placeholder="8 caractères minimum" value={addUserForm.password} onChange={e=>setAddUserForm(f=>({...f,password:e.target.value}))} />
            {addUserErrors.password && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>{addUserErrors.password}</div>}
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, color:"#0F2C5C", display:"block", marginBottom:8, fontWeight:500 }}>Couleur du profil</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {PRESET_COLORS.map(c=>(
                <div key={c} onClick={()=>setAddUserForm(f=>({...f,color:c}))}
                  style={{ width:28, height:28, borderRadius:"50%", background:c, cursor:"pointer", border:addUserForm.color===c?"3px solid #0F2C5C":"2px solid rgba(0,0,0,.1)", transition:"all .15s" }} />
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>{setModalAddUser(false);setAddUserErrors({});}}>Annuler</button>
            <button style={{...btn,flex:1,justifyContent:"center"}} onClick={handleAddUser}><Icon name="plus" size={14} color="#fff" /> Créer le compte</button>
          </div>
        </Modal>
      )}

      {/* MODAL RESET MDP */}
      {modalResetPwd && canGererAcces && (
        <Modal title={`Réinitialiser le mot de passe`} onClose={()=>{setModalResetPwd(null);setResetPwdValue("");}} maxWidth={400}>
          <div style={{ marginBottom:6, fontSize:14, color:"#0F2C5C" }}>Compte : <strong>{modalResetPwd.name}</strong></div>
          <div style={{ marginBottom:14 }}>
            <input type="password" style={{...inputStyle,marginTop:10}} placeholder="Nouveau mot de passe (8 car. min.)" value={resetPwdValue} onChange={e=>setResetPwdValue(e.target.value)} autoFocus />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>{setModalResetPwd(null);setResetPwdValue("");}}>Annuler</button>
            <button style={{...btn,flex:1,justifyContent:"center"}} onClick={handleResetPwd}><Icon name="key" size={14} color="#fff" /> Réinitialiser</button>
          </div>
        </Modal>
      )}

      {/* MODAL MODIFIER RÔLE */}
      {modalEditRole && canGererAcces && (
        <Modal title="Modifier le rôle" onClose={()=>setModalEditRole(null)} maxWidth={380}>
          <div style={{ marginBottom:14, fontSize:14, color:"#0F2C5C" }}>Compte : <strong>{modalEditRole.name}</strong></div>
          <select style={{...fieldStyle(false), appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230F2C5C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:36, marginBottom:16 }}
            value={editRoleValue} onChange={e=>setEditRoleValue(e.target.value)}>
            <option value="adjoint">Adjoint(e) de direction</option>
            <option value="admin">Administratif</option>
            <option value="enseignant">Enseignant</option>
          </select>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>setModalEditRole(null)}>Annuler</button>
            <button style={{...btn,flex:1,justifyContent:"center"}} onClick={handleEditRole}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {/* MODAL CONFIRMER SUPPRESSION */}
      {modalConfirmDel && canGererAcces && (
        <Modal title="Supprimer ce compte ?" onClose={()=>setModalConfirmDel(null)} maxWidth={400}>
          <div style={{ background:"rgba(220,38,38,.12)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10, padding:14, marginBottom:20, fontSize:14, color:"#fca5a5", display:"flex", gap:10, alignItems:"flex-start" }}>
            <Icon name="warning" size={18} color="#fca5a5" />
            <span>Le compte <strong>{modalConfirmDel.name}</strong> sera supprimé définitivement. Cette action est irréversible.</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{...btnGhost,flex:1,justifyContent:"center"}} onClick={()=>setModalConfirmDel(null)}>Annuler</button>
            <button style={{ flex:1, justifyContent:"center", background:"rgba(220,38,38,.85)", color:"#fff", border:"1px solid rgba(220,38,38,.3)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, display:"inline-flex", alignItems:"center", gap:7 }}
              onClick={()=>handleDeleteUser(modalConfirmDel)}>
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
      <div className="sc-sidebar" style={{ width:sidebar?240:0, minWidth:sidebar?240:0, background:SIDEBAR_BG, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRight:"1px solid rgba(255,255,255,.12)", padding:sidebar?"20px 16px 0":"0", display:"flex", flexDirection:"column", overflowX:"hidden", overflowY:"hidden" }}>
        {sidebar && <>
          <div style={{ textAlign:"center", marginBottom:12, flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", overflow:"hidden", margin:"0 auto 6px", border:"1px solid rgba(255,255,255,.25)", background:"rgba(255,255,255,.1)" }}>
                <img src="/IMG_6909.jpeg" alt="Logo Saint-Charles" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              </div>
            <div style={{ fontFamily:"'Calibri',sans-serif", fontSize:13, fontWeight:700, color:"rgba(255,255,255,.9)" }}>Saint-Charles</div>
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:1, flex:1, overflowY:"auto", overflowX:"hidden" }}>
            {[{id:"accueil",label:"Accueil",icon:"home"},{id:"dashboard",label:"Tableau de bord",icon:"dashboard",adminOnly:true}].filter(x=>!x.adminOnly||isAdmin).map(item=>(
              <div key={item.id} className="nav-item" onClick={()=>{setView(item.id);setEspace(null);}}
                style={{ padding:"9px 14px", borderRadius:10, cursor:"pointer", color:view===item.id?"#fff":"rgba(255,255,255,.6)", fontSize:14, display:"flex", alignItems:"center", gap:9, background:view===item.id?"rgba(255,255,255,.15)":"transparent", fontWeight:view===item.id?500:400, borderLeft:view===item.id?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name={item.icon} size={16} color={view===item.id?"#fff":"rgba(255,255,255,.5)"} /> {item.label}
              </div>
            ))}
            {isSA && (
              <div className="nav-item" onClick={()=>setView("validation")}
                style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", color:view==="validation"?"#fff":"rgba(255,255,255,.6)", fontSize:13, display:"flex", alignItems:"center", gap:9, background:view==="validation"?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="validation"?500:400, borderLeft:view==="validation"?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name="check" size={15} color={view==="validation"?"#fff":"rgba(255,255,255,.45)"} /> En attente de validation
                {pending>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:"50%", width:18, height:18, minWidth:18, fontSize:10, fontWeight:700, marginLeft:"auto", display:"flex", alignItems:"center", justifyContent:"center" }}>{pending}</span>}
              </div>
            )}
            {canGererAcces && (
              <div className="nav-item" onClick={()=>{ setView("gestion-acces"); loadGestionProfiles(); }}
                style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", color:view==="gestion-acces"?"#fff":"rgba(255,255,255,.6)", fontSize:13, display:"flex", alignItems:"center", gap:9, background:view==="gestion-acces"?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="gestion-acces"?500:400, borderLeft:view==="gestion-acces"?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name="users" size={15} color={view==="gestion-acces"?"#fff":"rgba(255,255,255,.45)"} /> Gestion des accès
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft:"auto", opacity:.7 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            {!isAdmin && <div className="nav-item" onClick={()=>{setView("notifs");loadNotifs(user);}}
              style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", color:view==="notifs"?"#fff":"rgba(255,255,255,.6)", fontSize:13, display:"flex", alignItems:"center", gap:9, background:view==="notifs"?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="notifs"?500:400, borderLeft:view==="notifs"?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
              <Icon name="bell" size={15} color={view==="notifs"?"#fff":"rgba(255,255,255,.45)"} /> Notifications
              {unread>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:"50%", width:18, height:18, minWidth:18, fontSize:10, fontWeight:700, marginLeft:"auto", display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>}
            </div>}
            <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", padding:"6px 14px 2px", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Espaces communs</div>
            {ESPACES.filter(e=>e.id==="ressources").map(e=>(
              <div key={e.id} className="nav-item" onClick={()=>goTo("espace",e)}
                style={{ padding:"8px 12px", borderRadius:10, cursor:"pointer", color:view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.6)", fontSize:12, display:"flex", alignItems:"center", gap:8, background:view==="espace"&&espace?.id===e.id?"rgba(255,255,255,.15)":"transparent", fontWeight:view==="espace"&&espace?.id===e.id?500:400, borderLeft:view==="espace"&&espace?.id===e.id?"3px solid #fff":"3px solid transparent", transition:"all .15s" }}>
                <Icon name={e.icon} size={14} color={view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.45)"} /> {e.nom}
              </div>
            ))}
            <div style={{ height:1, background:"rgba(255,255,255,.12)", margin:"4px 14px" }} />
            <div style={{ background:"rgba(255,255,255,.18)", borderRadius:12, padding:"4px 4px", display:"flex", flexDirection:"column", gap:1 }}>
              {ESPACES.filter(e=>e.id!=="ressources").map(e=>(
                <div key={e.id} className="nav-item" onClick={()=>goTo("espace",e)}
                  style={{ padding:"8px 12px", borderRadius:10, cursor:"pointer", color:view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.6)", fontSize:12, display:"flex", alignItems:"center", gap:8, background:view==="espace"&&espace?.id===e.id?"rgba(255,255,255,.18)":"transparent", fontWeight:view==="espace"&&espace?.id===e.id?500:400, borderLeft:view==="espace"&&espace?.id===e.id?"3px solid #fff":"3px solid transparent", transition:"all .15s", whiteSpace:"nowrap", overflow:"hidden" }}>
                  <Icon name={e.icon} size={14} color={view==="espace"&&espace?.id===e.id?"#fff":"rgba(255,255,255,.45)"} /> {e.nom}
                </div>
              ))}
            </div>
          </nav>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:8, marginTop:6, marginBottom:8, textAlign:"center", fontSize:10, color:"rgba(255,255,255,.65)", lineHeight:1.6, flexShrink:0 }}>
            <span onClick={()=>setLegalView("mentions")} style={{ cursor:"pointer", textDecoration:"underline" }}>Mentions légales</span>
            {" · "}
            <span onClick={()=>setLegalView("cgu")} style={{ cursor:"pointer", textDecoration:"underline" }}>CGU</span>
            {" · "}
            <span onClick={()=>setLegalView("confidentialite")} style={{ cursor:"pointer", textDecoration:"underline" }}>Confidentialité</span>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.12)", paddingTop:10, paddingBottom:"calc(12px + env(safe-area-inset-bottom))", flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.95)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textAlign:"center" }}>{user.name}</div>
          </div>
        </>}
      </div>

      {/* MAIN */}
      <div className="sc-main-pad" style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        {/* TOPBAR */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <button onClick={()=>setSidebar(v=>!v)} style={{ ...glassCard, padding:0, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, border:"1px solid rgba(0,96,100,.2)", zIndex:201 }}>
            <Icon name="menu" size={16} color="#0F2C5C" />
          </button>
          {navHistory.length>0 && (
            <button onClick={goBack} style={{ ...glassCard, padding:0, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, border:"1px solid rgba(0,96,100,.2)" }}>
              <Icon name="back" size={16} color="#0F2C5C" />
            </button>
          )}
          <div style={{ flex:1 }} />
          <button onClick={handleLogout} title="Se déconnecter" style={{ ...glassCard, padding:0, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, border:"1px solid rgba(0,96,100,.2)" }}>
            <Icon name="logout" size={16} color="#0F2C5C" />
          </button>
        </div>

        {/* ACCUEIL */}
        {view==="accueil" && (
          <div>
            <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, margin:"0 0 28px", color:"#0F2C5C" }}>Bienvenue dans votre espace</h1>
            <div className="sc-spaces-grid">
              {ESPACES.filter(e=>e.id==="ressources").map(e => {
                const count = docs.filter(d=>d.espace_id===e.id&&d.status==="valide").length;
                const lastSeen = getLastSeen(e.id);
                const newCount = user?.role==="enseignant" ? docs.filter(d=>d.espace_id===e.id&&d.status==="valide"&&(!lastSeen||d.created_at>lastSeen)).length : 0;
                return <SpaceCard key={e.id} esp={e} count={count} newCount={newCount} onClick={()=>goTo("espace",e)} onAdd={user?.role==="enseignant" ? ()=>{ setEspace(e); setModalUpload(true); } : undefined} />;
              })}
            </div>
            <div style={{ height:1, background:"rgba(0,96,100,0.15)", margin:"16px 0" }} />
            <div className="sc-spaces-grid">
              {ESPACES.filter(e=>e.id!=="ressources").map(e => {
                const count = docs.filter(d=>d.espace_id===e.id&&d.status==="valide").length;
                const lastSeen = getLastSeen(e.id);
                const newCount = user?.role==="enseignant" ? docs.filter(d=>d.espace_id===e.id&&d.status==="valide"&&(!lastSeen||d.created_at>lastSeen)).length : 0;
                return <SpaceCard key={e.id} esp={e} count={count} newCount={newCount} onClick={()=>goTo("espace",e)} />;
              })}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {view==="dashboard" && isAdmin && (
          <div>
            <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, margin:"0 0 28px", color:"#0F2C5C" }}>Tableau de bord</h1>
            <div className="sc-stat-grid">
              {[
                {label:"Publiés",val:docs.filter(d=>d.status==="valide").length,color:"#6ee7b7",icon:"check"},
                {label:"En attente",val:pending,color:"#fcd34d",icon:"inbox"},
                {label:"Refusés",val:docs.filter(d=>d.status==="refuse").length,color:"#fca5a5",icon:"close"},
              ].map(s=>(
                <div key={s.label} style={{...glassCard,textAlign:"center",padding:"12px 10px",cursor:s.label==="En attente"&&isSA?"pointer":"default"}}
                  onClick={()=>s.label==="En attente"&&isSA&&setView("validation")}>
                  <div style={{ fontFamily:"'Calibri',sans-serif", fontSize:24, fontWeight:700, color:"#0F2C5C" }}>{s.val}</div>
                  <div style={{ fontSize:11, color:"rgba(15,44,92,.55)", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={glassCard}>
              <h3 style={{ fontFamily:"'Calibri',sans-serif", fontSize:18, margin:"0 0 18px", color:"#0F2C5C" }}>Activité récente</h3>
              {loading && <div style={{ color:"rgba(0,96,100,.45)", fontSize:14 }}>Chargement...</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {docs.slice(0,5).map(doc => {
                  const tc=TYPE_COLORS[doc.type]||TYPE_COLORS.AUTRE;
                  const sc=doc.status==="valide"?{bg:"rgba(5,150,105,.15)",text:"#6ee7b7"}:doc.status==="attente"?{bg:"rgba(217,119,6,.15)",text:"#fcd34d"}:{bg:"rgba(220,38,38,.15)",text:"#fca5a5"};
                  return (
                    <div key={doc.id} onClick={()=>setModalDetail(doc)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, border:"1px solid rgba(0,96,100,.12)", cursor:"pointer", background:"rgba(255,255,255,.6)", transition:"all .15s" }}>
                      <span style={{ background:sc.bg, color:sc.text, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600 }}>{doc.status==="valide"?"Publié":doc.status==="attente"?"En attente":"Refusé"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, color:"#0F2C5C", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.titre}</div>
                        <div style={{ fontSize:12, color:"rgba(0,96,100,.5)" }}>{doc.auteur} · {fmtDate(doc.created_at)}</div>
                      </div>
                      <span style={{ background:"rgba(107,114,128,.12)", color:"#6b7280", padding:"3px 8px", borderRadius:5, fontSize:11, fontWeight:700, letterSpacing:2 }}>···</span>
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
                  <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:24, margin:0, color:c_esp.accent }}>{espace.nom}</h1>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {isAdmin && <button style={btnGhost} onClick={()=>setModalCat(true)}><Icon name="plus" size={13} color="#0F2C5C" /> Catégorie</button>}
                {(isAdmin || (user.role==="enseignant" && espace.id==="ressources")) && <button style={btn} onClick={()=>setModalUpload(true)}>+ Déposer</button>}
              </div>
            </div>
            <div style={{ position:"relative", marginBottom:14 }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={15} color="rgba(0,96,100,.4)" /></div>
              <input style={{...inputStyle, paddingLeft:40, background:"rgba(255,255,255,.7)", border:"1.5px solid rgba(0,96,100,.25)", color:"#0F2C5C"}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              <div onClick={()=>setCatFilter("all")} style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", flexShrink:0, transition:"all .2s", background:catFilter==="all"?c_esp.grad:"rgba(255,255,255,.95)", color:catFilter==="all"?"#fff":"#0F2C5C", border:catFilter==="all"?`1.5px solid ${c_esp.accent}`:"1.5px solid rgba(0,96,100,.2)", fontWeight:catFilter==="all"?600:400, boxShadow:catFilter==="all"?`0 4px 14px ${c_esp.tint}`:"none" }}>Tous</div>
              {(cats[espace.id]||[]).map(cat=>(
                <div key={cat} style={{ display:"inline-flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <div onClick={()=>setCatFilter(cat)} style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", transition:"all .2s", background:catFilter===cat?c_esp.grad:"rgba(255,255,255,.95)", color:catFilter===cat?"#fff":"#0F2C5C", border:catFilter===cat?`1.5px solid ${c_esp.accent}`:"1.5px solid rgba(0,96,100,.2)", fontWeight:catFilter===cat?600:400, boxShadow:catFilter===cat?`0 4px 14px ${c_esp.tint}`:"none" }}>{cat}</div>
                  {isAdmin && <button onClick={()=>setModalDeleteCat({espId:espace.id,cat})} style={{ background:"rgba(0,0,0,.06)", border:"none", color:"rgba(0,0,0,.35)", borderRadius:8, width:22, height:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, fontSize:14, letterSpacing:0, lineHeight:1 }} title="Supprimer la catégorie">⋮</button>}
                </div>
              ))}
              {espDocsPending(espace.id).length > 0 && (
                <div onClick={()=>setCatFilter("__attente__")} style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", flexShrink:0, transition:"all .2s", background:catFilter==="__attente__"?"rgba(220,38,38,.8)":"rgba(220,38,38,.1)", color:catFilter==="__attente__"?"#fff":"#dc2626", border:"1.5px solid rgba(220,38,38,.3)", fontWeight:600, display:"inline-flex", alignItems:"center", gap:6 }}>
                  En attente
                  <span style={{ background:catFilter==="__attente__"?"rgba(255,255,255,.3)":"rgba(220,38,38,.2)", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{espDocsPending(espace.id).length}</span>
                </div>
              )}
            </div>
            {loading && <div style={{ color:"rgba(0,96,100,.45)", fontSize:14, marginBottom:14 }}>Chargement...</div>}

            <div className="sc-docs-grid" style={{ ...(catFilter==="__attente__"?{opacity:0.7}:{}) }}>
              {(catFilter==="__attente__" ? espDocsPending(espace.id) : espDocs(espace.id)).map(doc=>{
                const lastSeen = getLastSeen(espace.id);
                const isNew = !isAdmin && user?.role==="enseignant" && doc.status==="valide" && !!lastSeen && doc.created_at > lastSeen && !seenDocs.has(doc.id);
                const canView = doc.status === "valide" || isAdmin || isSA;
                return <DocCard key={doc.id} doc={doc} espaceId={espace.id} isNew={isNew} onOpen={canView ? ()=>{ markDocSeen(doc.id); setModalDetail(doc); } : undefined} onDelete={d=>setModalDelete(d)} canDelete={isSA||(doc.status==="attente")} showDots={canView} />;
              })}
              {catFilter!=="__attente__" && espDocs(espace.id).length===0 && !loading && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:"rgba(0,96,100,.4)" }}>
                  <Icon name="inbox" size={40} color="rgba(0,96,100,.15)" />
                  <div style={{ marginTop:12, color:"#0F2C5C" }}>Aucun document trouvé</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VALIDATION */}
        {view==="validation" && isSA && (
          <div>
            <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, margin:"0 0 8px", color:"#0F2C5C" }}>Validation</h1>
            <p style={{ color:"rgba(0,96,100,.55)", margin:"0 0 24px", fontSize:14 }}>{pending} document(s) en attente</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {docs.filter(d=>d.status==="attente").map(doc => {
                const tc=TYPE_COLORS[doc.type]||TYPE_COLORS.AUTRE;
                const espNom=ESPACES.find(e=>e.id===doc.espace_id)?.nom;
                return (
                  <div key={doc.id} style={{...glassCard, border:"1px solid rgba(251,191,36,.35)"}}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
                      <span style={{ background:"rgba(107,114,128,.12)", color:"#6b7280", padding:"8px 12px", borderRadius:6, fontSize:12, fontWeight:700, flexShrink:0, letterSpacing:2 }}>···</span>
                      <div style={{ flex:1 }}>
                        <h3 style={{ fontFamily:"'Calibri',sans-serif", fontSize:16, margin:"0 0 4px", color:"#0F2C5C" }}>{doc.titre}</h3>
                        {doc.description && <p style={{ fontSize:13, color:"rgba(0,96,100,.6)", margin:"0 0 8px" }}>{doc.description}</p>}
                        <div style={{ fontSize:12, color:"rgba(0,96,100,.5)", display:"flex", gap:12, flexWrap:"wrap" }}>
                          <span>{doc.categorie}</span><span>{doc.auteur}</span><span>{espNom}</span>
                        </div>
                      </div>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer"
                          style={{ background:"rgba(0,96,100,.1)", color:"#0F2C5C", border:"1px solid rgba(0,96,100,.25)", padding:"7px 12px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:500, textDecoration:"none", flexShrink:0 }}>
                          <Icon name="eye" size={14} color="#0F2C5C" /> Voir
                        </a>
                      )}
                    </div>
                    {refusMode[doc.id] && (
                      <div style={{ marginTop:14, borderTop:"1px solid rgba(0,96,100,.1)", paddingTop:14 }}>
                        <label style={{ fontSize:12, color:refusErrors[doc.id]?"#dc2626":"rgba(0,96,100,.55)", display:"block", marginBottom:6 }}>
                          Motif du refus <span style={{color:"#dc2626"}}>*</span>
                          {refusErrors[doc.id] && <span style={{marginLeft:8,fontStyle:"italic"}}>— champ obligatoire</span>}
                        </label>
                        <textarea style={{...inputStyle,resize:"none",fontSize:13,borderColor:refusErrors[doc.id]?"#dc2626":"#0F2C5C"}} rows={2} placeholder="Saisir le motif du refus..." value={refusComment[doc.id]||""} onChange={e=>{ setRefusComment(f=>({...f,[doc.id]:e.target.value})); setRefusErrors(f=>({...f,[doc.id]:false})); }} />
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
                  <div style={{ marginTop:12, color:"#0F2C5C" }}>Aucun document en attente</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GESTION DES ACCÈS */}
        {view==="gestion-acces" && canGererAcces && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
              <div>
                <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, margin:"0 0 4px", color:"#0F2C5C" }}>Gestion des accès</h1>
                <p style={{ color:"rgba(0,96,100,.55)", margin:0, fontSize:14 }}>{gestionProfiles.length} compte(s) enregistré(s)</p>
              </div>
              <button style={btn} onClick={()=>setModalAddUser(true)}><Icon name="plus" size={14} color="#fff" /> Ajouter un compte</button>
            </div>
            {gestionLoading && <div style={{ color:"rgba(0,96,100,.45)", fontSize:14, marginBottom:14 }}>Chargement…</div>}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {gestionProfiles.map(p=>{
                const roleLabel = p.role==="direction"?"Direction":p.role==="adjoint"?"Adjoint(e) de direction":p.role==="admin"?"Administratif":"Enseignant";
                const isMe = p.id === user.id;
                return (
                  <div key={p.id} style={{...glassCard, display:"flex", alignItems:"center", gap:14, position:"relative", opacity:p.actif?1:.55 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:p.color, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{p.role==="adjoint"?"ADJ":p.name.substring(0,2).toUpperCase()}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"#0F2C5C" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize:12, color:"rgba(0,96,100,.55)", marginTop:2 }}>{roleLabel} · {p.email}</div>
                    </div>
                    {p.peut_gerer_acces ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginRight:65 }} title="Direction — compte validé">
                        <circle cx="12" cy="12" r="9" stroke="#b8860b" strokeWidth="1.7" fill="none"/>
                        <polyline points="7.5,12 10.5,15 16.5,9" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:p.actif?"rgba(5,150,105,.12)":"rgba(107,114,128,.12)", color:p.actif?"#059669":"#6b7280", fontWeight:600, flexShrink:0 }}>
                        {p.actif?"Actif":"Inactif"}
                      </span>
                    )}
                    {!p.peut_gerer_acces && (
                      <div style={{ flexShrink:0 }}>
                        <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(0,0,0,.5)", padding:"4px 8px", borderRadius:6 }}
                          onClick={e=>{ e.stopPropagation(); if(userMenuOpen?.profile?.id===p.id){ setUserMenuOpen(null); return; } const r=e.currentTarget.getBoundingClientRect(); const menuH=210; const spaceBelow=window.innerHeight-r.bottom; const top=spaceBelow>=menuH+8 ? r.bottom+4 : r.top-menuH-4; setUserMenuOpen({ profile:p, top:Math.max(8,top), left:r.left-220 }); }}>⋮</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {view==="notifs" && (
          <div>
            <h1 style={{ fontFamily:"'Calibri',sans-serif", fontSize:28, margin:"0 0 8px", color:"#0F2C5C" }}>Notifications</h1>
            <p style={{ color:"rgba(0,96,100,.55)", margin:"0 0 24px", fontSize:14 }}>{unread} non lue(s)</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {notifs.map(n=>(
                <div key={n.id} style={{ ...glassCard, display:"flex", alignItems:"center", gap:14, opacity:n.lu?0.55:1, borderLeft:n.lu?"1px solid rgba(0,96,100,.12)":`3px solid #0F2C5C`, background:n.lu?"rgba(255,255,255,.6)":"rgba(255,255,255,.88)", position:"relative" }}
                  onClick={()=>{ setNotifMenu(null); if(!n.lu) markNotifLue(n.id); if(n.doc_id){ const d=docs.find(x=>x.id===n.doc_id); if(d) setModalDetail(d); } }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:n.lu?"rgba(0,96,100,.06)":"rgba(0,96,100,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon name="bell" size={16} color="#0F2C5C" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:"#0F2C5C", fontWeight:n.lu?400:600 }}>{n.texte}</div>
                    <div style={{ fontSize:12, color:"rgba(0,96,100,.45)", marginTop:3 }}>{fmtDate(n.created_at)}</div>
                  </div>
                  <div style={{ position:"relative", flexShrink:0 }} onClick={e=>{ e.stopPropagation(); setNotifMenu(notifMenu===n.id?null:n.id); }}>
                    <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(0,0,0,.55)", padding:"4px 8px", borderRadius:6 }}>⋮</button>
                    {notifMenu===n.id && (
                      <div style={{ position:"absolute", right:0, top:"100%", background:"#fff", borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,.15)", border:"1px solid rgba(0,0,0,.08)", zIndex:50, minWidth:140, overflow:"hidden" }}>
                        <div onClick={e=>{ e.stopPropagation(); deleteNotif(n.id); setNotifMenu(null); }}
                          style={{ padding:"10px 16px", fontSize:13, color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                          <Icon name="trash" size={13} color="#dc2626" /> Supprimer
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {notifs.length===0 && (
                <div style={{ textAlign:"center", padding:80, color:"rgba(0,96,100,.4)" }}>
                  <Icon name="bell" size={40} color="rgba(0,96,100,.15)" />
                  <div style={{ marginTop:12, color:"#0F2C5C" }}>Aucune notification</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
