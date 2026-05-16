import { useState, useRef, useEffect } from "react";
import { PRE_CACHED, getCacheKey } from "./mockData";

const THEMES = {
  dark: { bg:"linear-gradient(160deg,#080e1a 0%,#0d1625 60%,#080e1a 100%)",surface:"rgba(255,255,255,0.04)",surfaceBorder:"rgba(255,255,255,0.08)",text:"#f1f5f9",subtext:"#64748b",muted:"#334155",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.1)",tabBg:"rgba(255,255,255,0.04)",chip:"rgba(255,255,255,0.04)" },
  light: { bg:"linear-gradient(160deg,#f0f4ff 0%,#ffffff 60%,#f0f4ff 100%)",surface:"rgba(0,0,0,0.03)",surfaceBorder:"rgba(0,0,0,0.08)",text:"#0f172a",subtext:"#64748b",muted:"#94a3b8",input:"rgba(0,0,0,0.04)",inputBorder:"rgba(0,0,0,0.12)",tabBg:"rgba(0,0,0,0.04)",chip:"rgba(0,0,0,0.04)" },
  saffron: { bg:"linear-gradient(160deg,#1a0a00 0%,#2d1200 60%,#1a0800 100%)",surface:"rgba(249,115,22,0.07)",surfaceBorder:"rgba(249,115,22,0.15)",text:"#fef3e2",subtext:"#c2773a",muted:"#7c3a0a",input:"rgba(249,115,22,0.08)",inputBorder:"rgba(249,115,22,0.2)",tabBg:"rgba(249,115,22,0.08)",chip:"rgba(249,115,22,0.07)" },
};

const REGIONS = [
  { id:"north",emoji:"🌾",en:"North India",hi:"उत्तर भारत",note:"Punjab, UP, Haryana, Delhi, Rajasthan",dietary:"High dairy tolerance, wheat-heavy, loves ghee & paneer" },
  { id:"south",emoji:"🥥",en:"South India",hi:"दक्षिण भारत",note:"Tamil Nadu, Kerala, Karnataka, Andhra",dietary:"Higher lactose sensitivity, rice-based, coconut oil" },
  { id:"west",emoji:"🌊",en:"West India",hi:"पश्चिम भारत",note:"Maharashtra, Gujarat, Goa",dietary:"Mixed — Gujaratis largely vegetarian, coastal seafood" },
  { id:"east",emoji:"🐟",en:"East India",hi:"पूर्व भारत",note:"Bengal, Odisha, Bihar, Assam",dietary:"Fish-forward, mustard oil, rice staple" },
  { id:"central",emoji:"🌶️",en:"Central India",hi:"मध्य भारत",note:"MP, Chhattisgarh",dietary:"Wheat & rice mix, spicy preparations" },
  { id:"ne",emoji:"🍃",en:"North East",hi:"पूर्वोत्तर",note:"Assam, Meghalaya, Manipur...",dietary:"Fermented foods, bamboo shoots, pork common" },
];

const GOALS = [
  { id:"weight_loss",icon:"🔥",en:"Weight Loss",hi:"वजन घटाना" },
  { id:"muscle_gain",icon:"💪",en:"Muscle Gain",hi:"मसल बनाना" },
  { id:"heart_health",icon:"❤️",en:"Heart Health",hi:"दिल का ख्याल" },
  { id:"diabetes",icon:"🩺",en:"Diabetes",hi:"मधुमेह" },
  { id:"kids",icon:"👶",en:"Kids Nutrition",hi:"बच्चों का पोषण" },
  { id:"general",icon:"🌿",en:"General Wellness",hi:"सामान्य स्वास्थ्य" },
];

const DIETS = [
  { id:"veg",icon:"🥗",en:"Vegetarian",hi:"शाकाहारी" },
  { id:"vegan",icon:"🌱",en:"Vegan",hi:"वीगन" },
  { id:"nonveg",icon:"🍗",en:"Non-Vegetarian",hi:"मांसाहारी" },
  { id:"jain",icon:"🙏",en:"Jain",hi:"जैन" },
];

const LANGS = [
  { id:"en",label:"English",desc:"Full English" },
  { id:"hi",label:"हिन्दी",desc:"पूरी हिन्दी" },
  { id:"hinglish",label:"Hinglish",desc:"Hindi + English mix — most natural for Indians" },
];

const T = {
  en: { betaBanner:"🚧 Beta — Mobile App launching in ~3 months. Share your feedback!", step1Title:"Namaste! 🙏",step1Sub:"Let's personalise NutriCheck for you — takes 60 seconds.",step2Title:"Your Region",step2Sub:"Helps us give region-specific advice.",step3Title:"Your Goals",step3Sub:"What are you working towards?",step4Title:"Your Diet",step4Sub:"We'll flag incompatible ingredients.",step5Title:"Your Language",step5Sub:"How should Posha talk to you?",next:"Next →",back:"← Back",start:"Start Checking! 🚀",nameLabel:"What should we call you?",namePlaceholder:"Your name...",ageLabel:"Age (optional)",agePlaceholder:"e.g. 28",tabs:["Scan","Compare","Ask Posha"],searchPlaceholder:"Type any Indian product...",analyseBtn:"Check",compareBtn:"Compare",vsLabel:"VS",chatPlaceholder:"Ask Posha anything...",chatSend:"Send",chatWelcome:(n,r)=>`Namaste ${n}! 🙏 I'm Posha, your free nutrition guide. I know you're from ${r} — so my advice will fit your lifestyle. Ask me anything!`,shareWhatsapp:"Share on WhatsApp 📲",redFlags:"⚠️ Watch Out",greenFlags:"✅ Good Points",alternatives:"🔄 Healthier Options",tip:"💡 Tip",goalCompat:"For Your Goal",nutriBreakdown:"Nutrition (per 100g)",disclaimer:"Based on typical nutritional data. Not medical advice. Ref: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",free:"FREE FOREVER",changeProfile:"Edit Profile",rateLimit:"Daily limit reached (8 scans). Come back tomorrow! 🙏",preseed:"⚡ Instant result",cached:"⚡ Cached result" },
  hi: { betaBanner:"🚧 बीटा वर्शन — मोबाइल ऐप ~3 महीने में। राय दें!",step1Title:"नमस्ते! 🙏",step1Sub:"NutriCheck को आपके लिए personalise करते हैं — 60 seconds लगेंगे।",step2Title:"आपका क्षेत्र",step2Sub:"Region के हिसाब से सही सलाह मिलेगी।",step3Title:"आपका लक्ष्य",step3Sub:"आप क्या हासिल करना चाहते हैं?",step4Title:"आपका खानपान",step4Sub:"हम incompatible ingredients flag करेंगे।",step5Title:"भाषा चुनें",step5Sub:"Posha आपसे कैसे बात करे?",next:"आगे →",back:"← वापस",start:"शुरू करें! 🚀",nameLabel:"आपका नाम?",namePlaceholder:"नाम लिखें...",ageLabel:"उम्र (optional)",agePlaceholder:"जैसे 28",tabs:["जाँचें","Compare","Posha से पूछें"],searchPlaceholder:"कोई भी Indian product लिखें...",analyseBtn:"जाँचें",compareBtn:"तुलना करें",vsLabel:"बनाम",chatPlaceholder:"Posha से कुछ भी पूछें...",chatSend:"भेजें",chatWelcome:(n,r)=>`नमस्ते ${n}! 🙏 मैं Posha हूँ। आप ${r} से हैं — तो मैं वैसी सलाह दूँगी जो आपके लिए सही हो। कुछ भी पूछिए!`,shareWhatsapp:"WhatsApp पर Share करें 📲",redFlags:"⚠️ ध्यान दें",greenFlags:"✅ अच्छी बात",alternatives:"🔄 बेहतर विकल्प",tip:"💡 सुझाव",goalCompat:"आपके Goal के लिए",nutriBreakdown:"पोषण तत्व (प्रति 100g)",disclaimer:"सामान्य nutritional data पर आधारित। Medical advice नहीं। संदर्भ: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",free:"हमेशा मुफ़्त",changeProfile:"Profile बदलें",rateLimit:"आज की limit हो गई (8 scans)। कल फिर आएं! 🙏",preseed:"⚡ Instant result",cached:"⚡ Cached result" },
  hinglish: { betaBanner:"🚧 Beta Version — Mobile App ~3 mahine mein aa raha hai. Feedback do!",step1Title:"Namaste! 🙏",step1Sub:"NutriCheck ko tumhare liye personalise karte hain — 60 seconds lagenge.",step2Title:"Tumhara Region",step2Sub:"Region ke hisaab se sahi advice milegi.",step3Title:"Tumhara Goal",step3Sub:"Kya achieve karna chahte ho?",step4Title:"Khana-Pina",step4Sub:"Hum incompatible ingredients flag karenge.",step5Title:"Bhasha Chuno",step5Sub:"Posha tumse kaise baat kare?",next:"Aage →",back:"← Wapas",start:"Shuru Karo! 🚀",nameLabel:"Tumhara naam?",namePlaceholder:"Naam likho...",ageLabel:"Umar (optional)",agePlaceholder:"jaise 28",tabs:["Scan Karo","Compare Karo","Posha Se Pucho"],searchPlaceholder:"Koi bhi Indian product likho...",analyseBtn:"Check Karo",compareBtn:"Compare Karo",vsLabel:"VS",chatPlaceholder:"Posha se kuch bhi pucho...",chatSend:"Bhejo",chatWelcome:(n,r)=>`Namaste ${n}! 🙏 Main Posha hoon. Tum ${r} se ho — toh wahi advice dunga jo tumhari life mein fit ho. Kuch bhi pucho!`,shareWhatsapp:"WhatsApp pe Share Karo 📲",redFlags:"⚠️ Dhyan Do",greenFlags:"✅ Achhi Baat",alternatives:"🔄 Better Options",tip:"💡 Tip",goalCompat:"Tumhare Goal Ke Liye",nutriBreakdown:"Nutrition (per 100g)",disclaimer:"Typical nutritional data pe based. Medical advice nahi. Ref: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",free:"Hamesha FREE",changeProfile:"Profile Badlo",rateLimit:"Aaj ki limit ho gayi (8 scans). Kal wapas aao! 🙏",preseed:"⚡ Instant result",cached:"⚡ Cached result" },
};

const EXAMPLES = ["Parle-G","Maggi Noodles","Amul Butter","Lay's Chips","Haldiram's Bhujia","Britannia Marie Gold","Bournvita","Fortune Refined Oil"];
const NSColor = { A:"#038141",B:"#85BB2F",C:"#FECB02",D:"#EE8100",E:"#E63312" };

function getTodayKey() { return `scans_${new Date().toISOString().split("T")[0]}`; }
function getScanCount() { return parseInt(localStorage.getItem(getTodayKey()) || "0"); }
function incrementScan() { localStorage.setItem(getTodayKey(), getScanCount() + 1); }
function isRateLimited() { return getScanCount() >= 8; }
function getLocalCache(key) { try { const v = localStorage.getItem(`nc_${key}`); return v ? JSON.parse(v) : null; } catch { return null; } }
function setLocalCache(key, data) { try { localStorage.setItem(`nc_${key}`, JSON.stringify(data)); } catch {} }

function Spinner() {
  return <span style={{ display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />;
}

function ScoreRing({ score, size=110, th }) {
  const r=size*0.38, circ=2*Math.PI*r, fill=(score/100)*circ;
  const color=score>=70?"#22c55e":score>=45?"#f59e0b":"#ef4444";
  const label=score>=70?"Healthy":score>=45?"OK":"Poor";
  return (
    <div style={{ position:"relative",width:size,height:size,flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={th.surfaceBorder} strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:size*0.22,fontWeight:900,color,fontFamily:"'Syne',sans-serif",lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:size*0.1,color:th.subtext,letterSpacing:1,marginTop:2 }}>{label}</span>
      </div>
    </div>
  );
}

function NBar({ label, value, max, unit, good, th }) {
  const pct=Math.min((value/max)*100,100);
  const color=good?(pct>50?"#22c55e":pct>25?"#f59e0b":"#ef4444"):(pct<40?"#22c55e":pct<70?"#f59e0b":"#ef4444");
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
        <span style={{ fontSize:11,color:th.subtext }}>{label}</span>
        <span style={{ fontSize:11,color:th.text,fontFamily:"monospace" }}>{value}{unit}</span>
      </div>
      <div style={{ height:5,background:th.surfaceBorder,borderRadius:99 }}>
        <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:99,transition:"width 1.1s ease" }} />
      </div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [age,setAge]=useState("");
  const [region,setRegion]=useState(null);
  const [goal,setGoal]=useState(null);
  const [diet,setDiet]=useState(null);
  const [lang,setLang]=useState("hinglish");
  const t=T[lang]; const accent="#f97316";
  const canNext=[name.trim().length>0,region!==null,goal!==null,diet!==null,true];
  const titles=[t.step1Title,t.step2Title,t.step3Title,t.step4Title,t.step5Title];
  const subs=[t.step1Sub,t.step2Sub,t.step3Sub,t.step4Sub,t.step5Sub];
  return (
    <div style={{ minHeight:"100vh",background:"linear-gradient(160deg,#080e1a,#0d1625,#080e1a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus{outline:none;border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,0.1)!important;}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex",gap:6,marginBottom:28 }}>
        {[0,1,2,3,4].map(i=><div key={i} style={{ width:i===step?22:7,height:7,borderRadius:99,background:i===step?accent:i<step?"#22c55e":"rgba(255,255,255,0.1)",transition:"all 0.3s" }} />)}
      </div>
      <div style={{ width:"100%",maxWidth:460,animation:"fadeUp 0.4s ease" }}>
        <div style={{ textAlign:"center",marginBottom:24 }}>
          <span style={{ fontSize:26 }}>🇮🇳</span>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,background:"linear-gradient(90deg,#f97316,#fb923c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:3 }}>NutriCheck India</h1>
        </div>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f1f5f9",marginBottom:5,textAlign:"center" }}>{titles[step]}</h2>
        <p style={{ fontSize:13,color:"#64748b",textAlign:"center",marginBottom:22 }}>{subs[step]}</p>
        {step===0&&<div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div><label style={{ fontSize:11,color:"#64748b",display:"block",marginBottom:5 }}>{t.nameLabel}</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.namePlaceholder} style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 15px",fontSize:15,color:"#f1f5f9" }} /></div>
          <div><label style={{ fontSize:11,color:"#64748b",display:"block",marginBottom:5 }}>{t.ageLabel}</label>
            <input value={age} onChange={e=>setAge(e.target.value)} placeholder={t.agePlaceholder} type="number" style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 15px",fontSize:15,color:"#f1f5f9" }} /></div>
        </div>}
        {step===1&&<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          {REGIONS.map(r=><button key={r.id} onClick={()=>setRegion(r.id)} style={{ background:region===r.id?"rgba(249,115,22,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${region===r.id?accent:"rgba(255,255,255,0.1)"}`,borderRadius:13,padding:"13px 10px",cursor:"pointer",textAlign:"left",fontFamily:"inherit" }}>
            <div style={{ fontSize:20,marginBottom:5 }}>{r.emoji}</div>
            <div style={{ fontSize:12,fontWeight:700,color:region===r.id?accent:"#e2e8f0" }}>{lang==="hi"?r.hi:r.en}</div>
            <div style={{ fontSize:10,color:"#475569",marginTop:2,lineHeight:1.4 }}>{r.note}</div>
          </button>)}
        </div>}
        {step===2&&<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
          {GOALS.map(g=><button key={g.id} onClick={()=>setGoal(g.id)} style={{ background:goal===g.id?"rgba(249,115,22,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${goal===g.id?accent:"rgba(255,255,255,0.1)"}`,borderRadius:12,padding:"13px 6px",cursor:"pointer",textAlign:"center",fontFamily:"inherit" }}>
            <div style={{ fontSize:22,marginBottom:5 }}>{g.icon}</div>
            <div style={{ fontSize:10,fontWeight:600,color:goal===g.id?accent:"#94a3b8",lineHeight:1.3 }}>{lang==="hi"?g.hi:g.en}</div>
          </button>)}
        </div>}
        {step===3&&<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {DIETS.map(d=><button key={d.id} onClick={()=>setDiet(d.id)} style={{ background:diet===d.id?"rgba(249,115,22,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${diet===d.id?accent:"rgba(255,255,255,0.1)"}`,borderRadius:13,padding:"16px 10px",cursor:"pointer",textAlign:"center",fontFamily:"inherit" }}>
            <div style={{ fontSize:26,marginBottom:7 }}>{d.icon}</div>
            <div style={{ fontSize:12,fontWeight:700,color:diet===d.id?accent:"#e2e8f0" }}>{lang==="hi"?d.hi:d.en}</div>
          </button>)}
        </div>}
        {step===4&&<div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {LANGS.map(l=><button key={l.id} onClick={()=>setLang(l.id)} style={{ background:lang===l.id?"rgba(249,115,22,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${lang===l.id?accent:"rgba(255,255,255,0.1)"}`,borderRadius:13,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"inherit" }}>
            <span style={{ fontSize:20 }}>{l.id==="en"?"🇬🇧":l.id==="hi"?"🇮🇳":"🤝"}</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14,fontWeight:700,color:lang===l.id?accent:"#e2e8f0" }}>{l.label}</div>
              <div style={{ fontSize:10,color:"#475569",marginTop:1 }}>{l.desc}</div>
            </div>
            {lang===l.id&&<span style={{ marginLeft:"auto",color:accent,fontSize:16 }}>✓</span>}
          </button>)}
        </div>}
        <div style={{ display:"flex",gap:10,marginTop:26 }}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>{t.back}</button>}
          {step<4
            ?<button onClick={()=>canNext[step]&&setStep(s=>s+1)} disabled={!canNext[step]} style={{ flex:2,background:canNext[step]?`linear-gradient(135deg,${accent},#ea580c)`:"rgba(255,255,255,0.06)",border:"none",borderRadius:12,padding:"12px",color:canNext[step]?"white":"#334155",fontSize:13,fontWeight:700,cursor:canNext[step]?"pointer":"default",fontFamily:"inherit" }}>{t.next}</button>
            :<button onClick={()=>onComplete({name:name.trim()||"Friend",age,region,goal,diet,lang})} style={{ flex:2,background:`linear-gradient(135deg,${accent},#ea580c)`,border:"none",borderRadius:12,padding:"12px",color:"white",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>{t.start}</button>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [profile,setProfile]=useState(null);
  const [themeName,setThemeName]=useState("dark");
  const [tab,setTab]=useState(0);
  const [product,setProduct]=useState(""); const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null); const [error,setError]=useState(null);
  const [resultSource,setResultSource]=useState(null);
  const [prodA,setProdA]=useState(""); const [prodB,setProdB]=useState("");
  const [cmpLoading,setCmpLoading]=useState(false); const [cmpResult,setCmpResult]=useState(null);
  const [messages,setMessages]=useState([]); const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const chatEndRef=useRef(null);
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  if(!profile) return <Onboarding onComplete={p=>setProfile(p)} />;

  const t=T[profile.lang]; const th=THEMES[themeName]; const accent="#f97316";
  const regionObj=REGIONS.find(r=>r.id===profile.region);
  const goalObj=GOALS.find(g=>g.id===profile.goal);
  const dietObj=DIETS.find(d=>d.id===profile.diet);
  const card={ background:th.surface,border:`1px solid ${th.surfaceBorder}`,borderRadius:16,padding:16 };
  const inputStyle={ background:th.input,border:`1px solid ${th.inputBorder}`,borderRadius:12,padding:"12px 15px",fontSize:14,color:th.text,width:"100%",transition:"border-color 0.2s",fontFamily:"inherit" };

  const callAI=async(prompt)=>{
    const res=await fetch("/api/analyse",{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt}) });
    const data=await res.json();
    if(!data.text) throw new Error("No response");
    return data.text.trim();
  };

  const buildPrompt=(productName)=>`You are a nutrition expert for Indian food products. User: ${profile.name}, from ${regionObj?.en} (${regionObj?.dietary}), Goal: ${goalObj?.en}, Diet: ${dietObj?.en}${profile.age?`, Age: ${profile.age}`:""}.
Analyse "${productName}". Give REGION-SPECIFIC and GOAL-SPECIFIC advice. Flag diet conflicts for ${dietObj?.en}. Language: ${profile.lang==="hi"?"Hindi":profile.lang==="hinglish"?"Hinglish (warm, natural mix)":"English"}.
Respond ONLY valid JSON (no markdown, no backticks):
{"product_name":"...","brand":"...","category":"...","health_score":<0-100>,"nutriscore_grade":"<A-E>","health_star_rating":<0.5-5>,"verdict":"<1 sentence>","goal_compatibility":"<2 sentences>","diet_flag":"<null or warning>","region_note":"<1 regional insight>","nutrients":{"calories_per_100g":<n>,"protein_g":<n>,"carbs_g":<n>,"sugar_g":<n>,"fat_g":<n>,"saturated_fat_g":<n>,"sodium_mg":<n>,"fibre_g":<n>},"red_flags":["..."],"green_flags":["..."],"healthier_alternatives":["...","...","..."],"tip":"<1 practical tip>"}`;

  const analyse=async()=>{
    if(!product.trim()) return;
    if(isRateLimited()){ setError(t.rateLimit); return; }
    const ck=getCacheKey(product,profile.goal);
    if(PRE_CACHED[ck]){ setResult(PRE_CACHED[ck]); setResultSource("preseed"); setError(null); return; }
    const cached=getLocalCache(ck);
    if(cached){ setResult(cached); setResultSource("cached"); setError(null); return; }
    setLoading(true); setError(null); setResult(null); setResultSource(null);
    try {
      incrementScan();
      const raw=await callAI(buildPrompt(product));
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setLocalCache(ck,parsed);
      setResult(parsed); setResultSource("api");
    } catch { setError("Product not found or AI unavailable. Please try again."); }
    setLoading(false);
  };

  const compare=async()=>{
    if(!prodA.trim()||!prodB.trim()) return;
    setCmpLoading(true); setCmpResult(null);
    const fetchOne=async(p)=>{ const ck=getCacheKey(p,profile.goal); if(PRE_CACHED[ck]) return PRE_CACHED[ck]; const lc=getLocalCache(ck); if(lc) return lc; incrementScan(); const raw=await callAI(buildPrompt(p)); const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim()); setLocalCache(ck,parsed); return parsed; };
    try { const [a,b]=await Promise.all([fetchOne(prodA),fetchOne(prodB)]); setCmpResult({a,b}); } catch {}
    setCmpLoading(false);
  };

  const sendChat=async()=>{
    if(!chatInput.trim()||chatLoading) return;
    const userMsg=chatInput.trim(); setChatInput("");
    const newMsgs=[...messages,{role:"user",text:userMsg}];
    setMessages(newMsgs); setChatLoading(true);
    try {
      const history=newMsgs.map(m=>`${m.role==="user"?profile.name:"Posha"}: ${m.text}`).join("\n");
      const prompt=`You are Posha, a warm Indian nutrition AI. User: ${profile.name}${profile.age?`, ${profile.age} yrs`:""}, from ${regionObj?.en} (${regionObj?.dietary}), Goal: ${goalObj?.en}, Diet: ${dietObj?.en}. Reply in ${profile.lang==="hi"?"Hindi":profile.lang==="hinglish"?"Hinglish (warm, like a desi friend)":"English"}. 3-4 sentences, practical, encouraging.\nConversation:\n${history}\nPosha:`;
      const reply=await callAI(prompt);
      setMessages([...newMsgs,{role:"posha",text:reply}]);
    } catch { setMessages(m=>[...m,{role:"posha",text:"Sorry yaar, thoda issue aa gaya! Dobara try karo 🙏"}]); }
    setChatLoading(false);
  };

  const whatsappText=result?encodeURIComponent(`🇮🇳 *NutriCheck India*\n\n*${result.product_name}* — ${result.health_score}/100\nNutri-Score: ${result.nutriscore_grade} | ⭐ ${result.health_star_rating}/5\n\n${result.verdict}\n\n✅ Free check: nutricheckindia.vercel.app`):"";
  const scansLeft=8-getScanCount();

  return (
    <div style={{ minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::placeholder{color:${th.muted};}input:focus,textarea:focus{outline:none;border-color:${accent}!important;box-shadow:0 0 0 3px rgba(249,115,22,0.1)!important;}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}.hovbtn:hover{opacity:0.88;transform:translateY(-1px);}.hovbtn:active{transform:translateY(0);}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${th.surfaceBorder};border-radius:99px;}`}</style>

      <div style={{ background:"linear-gradient(90deg,rgba(249,115,22,0.15),rgba(249,115,22,0.08))",borderBottom:"1px solid rgba(249,115,22,0.2)",padding:"7px 16px",textAlign:"center",fontSize:11,color:"#fb923c" }}>{t.betaBanner}</div>

      <div style={{ padding:"14px 18px 0",maxWidth:680,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:20 }}>🇮🇳</span>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,background:"linear-gradient(90deg,#f97316,#fb923c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>NutriCheck India</span>
                <span style={{ fontSize:8,background:"rgba(249,115,22,0.15)",color:accent,padding:"2px 6px",borderRadius:99,border:"1px solid rgba(249,115,22,0.3)",fontWeight:700 }}>{t.free}</span>
              </div>
              <div style={{ fontSize:10,color:th.subtext,marginTop:1 }}>{regionObj?.emoji} {profile.name} · {goalObj?.icon} {profile.lang==="hi"?goalObj?.hi:goalObj?.en} · {dietObj?.icon}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:5,alignItems:"center" }}>
            {Object.keys(THEMES).map(k=><button key={k} onClick={()=>setThemeName(k)} style={{ width:18,height:18,borderRadius:"50%",border:themeName===k?`2px solid ${accent}`:"2px solid transparent",cursor:"pointer",background:k==="dark"?"#0d1625":k==="light"?"#f0f4ff":"#2d1200",padding:0 }} />)}
            <button onClick={()=>setProfile(null)} style={{ background:th.surface,border:`1px solid ${th.surfaceBorder}`,borderRadius:8,padding:"4px 9px",color:th.subtext,fontSize:10,cursor:"pointer",fontFamily:"inherit" }}>{t.changeProfile}</button>
          </div>
        </div>
        <div style={{ fontSize:10,color:th.muted,marginTop:5,textAlign:"right" }}>{profile.lang==="hinglish"?`${scansLeft} free scans aaj baaki`:profile.lang==="hi"?`आज ${scansLeft} free scans बाकी`:`${scansLeft} free scans left today`}</div>
        <div style={{ display:"flex",gap:3,marginTop:10,background:th.tabBg,borderRadius:12,padding:3 }}>
          {t.tabs.map((label,i)=><button key={i} onClick={()=>setTab(i)} style={{ flex:1,padding:"8px 4px",borderRadius:9,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",background:tab===i?accent:"transparent",color:tab===i?"white":th.subtext,fontFamily:"inherit",transition:"all 0.2s" }}>{label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth:680,margin:"0 auto",padding:"16px 18px 60px" }}>

        {tab===0&&<>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <input value={product} onChange={e=>setProduct(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyse()} placeholder={t.searchPlaceholder} style={inputStyle} />
            <button onClick={analyse} disabled={loading} className="hovbtn" style={{ background:`linear-gradient(135deg,${accent},#ea580c)`,color:"white",border:"none",borderRadius:12,padding:"12px 18px",fontWeight:700,fontSize:13,cursor:loading?"default":"pointer",minWidth:80,fontFamily:"inherit" }}>{loading?<Spinner/>:t.analyseBtn}</button>
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:18 }}>
            {EXAMPLES.map(p=><button key={p} onClick={()=>setProduct(p)} style={{ background:th.chip,border:`1px solid ${th.surfaceBorder}`,color:th.subtext,padding:"4px 10px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>{p}</button>)}
          </div>
          {error&&<div style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:12,padding:12,color:"#fca5a5",fontSize:13,marginBottom:14 }}>⚠️ {error}</div>}
          {result&&<div style={{ animation:"fadeUp 0.5s ease" }}>
            {resultSource&&<div style={{ fontSize:10,color:resultSource==="api"?"#22c55e":"#f59e0b",marginBottom:8 }}>{resultSource==="preseed"?t.preseed:resultSource==="cached"?t.cached:"🌐 Live result"}</div>}
            <div style={card}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:9,color:accent,fontWeight:700,letterSpacing:1 }}>{result.category?.toUpperCase()}</span>
                  <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,margin:"4px 0 2px",color:th.text }}>{result.product_name}</h2>
                  <p style={{ fontSize:12,color:th.subtext }}>{result.brand}</p>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:7 }}>
                    {["FSSAI","WHO","Nutri-Score","Health Star (AU)"].map(b=><span key={b} style={{ fontSize:8,background:th.chip,border:`1px solid ${th.surfaceBorder}`,color:th.subtext,padding:"2px 6px",borderRadius:5 }}>✓ {b}</span>)}
                  </div>
                </div>
                <ScoreRing score={result.health_score} th={th} />
              </div>
              <div style={{ display:"flex",gap:7,marginTop:12,flexWrap:"wrap" }}>
                <span style={{ background:NSColor[result.nutriscore_grade]||"#444",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:800,color:"white" }}>Nutri-Score {result.nutriscore_grade}</span>
                <span style={{ background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#f59e0b" }}>{"★".repeat(Math.round(result.health_star_rating))}{"☆".repeat(5-Math.round(result.health_star_rating))} {result.health_star_rating}/5</span>
              </div>
              <p style={{ marginTop:11,fontSize:13,color:th.text,lineHeight:1.7,background:th.chip,borderRadius:10,padding:11 }}>{result.verdict}</p>
              {result.diet_flag&&<div style={{ marginTop:9,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:9,fontSize:11,color:"#fca5a5" }}>⚠️ {result.diet_flag}</div>}
              <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:11,background:"#25D366",color:"white",textDecoration:"none",borderRadius:10,padding:"9px",fontWeight:700,fontSize:12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.5l5.797-1.519A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.5-5.197-1.377l-.373-.22-3.44.902.917-3.353-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                {t.shareWhatsapp}
              </a>
            </div>
            <div style={{ ...card,background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.18)",marginTop:10 }}>
              <p style={{ fontSize:9,fontWeight:700,color:accent,letterSpacing:1,marginBottom:6 }}>{goalObj?.icon} {t.goalCompat}</p>
              <p style={{ fontSize:13,color:th.text,lineHeight:1.7 }}>{result.goal_compatibility}</p>
              {result.region_note&&<p style={{ fontSize:11,color:th.subtext,marginTop:8,borderTop:`1px solid ${th.surfaceBorder}`,paddingTop:8 }}>{regionObj?.emoji} {result.region_note}</p>}
            </div>
            <div style={{ ...card,marginTop:10 }}>
              <p style={{ fontSize:9,fontWeight:700,color:th.subtext,letterSpacing:1,marginBottom:12 }}>{t.nutriBreakdown}</p>
              <NBar label="Calories" value={result.nutrients.calories_per_100g} max={500} unit=" kcal" good={false} th={th} />
              <NBar label="Protein" value={result.nutrients.protein_g} max={30} unit="g" good={true} th={th} />
              <NBar label="Carbs" value={result.nutrients.carbs_g} max={80} unit="g" good={false} th={th} />
              <NBar label="Sugar" value={result.nutrients.sugar_g} max={50} unit="g" good={false} th={th} />
              <NBar label="Fat" value={result.nutrients.fat_g} max={40} unit="g" good={false} th={th} />
              <NBar label="Sat. Fat" value={result.nutrients.saturated_fat_g} max={20} unit="g" good={false} th={th} />
              <NBar label="Sodium" value={result.nutrients.sodium_mg} max={2000} unit="mg" good={false} th={th} />
              <NBar label="Fibre" value={result.nutrients.fibre_g} max={25} unit="g" good={true} th={th} />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginTop:10 }}>
              <div style={{ background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:12 }}>
                <p style={{ fontSize:9,fontWeight:700,color:"#f87171",letterSpacing:1,marginBottom:7 }}>{t.redFlags}</p>
                {(result.red_flags||[]).map((f,i)=><p key={i} style={{ fontSize:11,color:"#fca5a5",marginBottom:4,lineHeight:1.5 }}>• {f}</p>)}
              </div>
              <div style={{ background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:12 }}>
                <p style={{ fontSize:9,fontWeight:700,color:"#4ade80",letterSpacing:1,marginBottom:7 }}>{t.greenFlags}</p>
                {(result.green_flags||[]).map((f,i)=><p key={i} style={{ fontSize:11,color:"#86efac",marginBottom:4,lineHeight:1.5 }}>• {f}</p>)}
              </div>
            </div>
            <div style={{ ...card,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",marginTop:9 }}>
              <p style={{ fontSize:9,fontWeight:700,color:"#a5b4fc",letterSpacing:1,marginBottom:5 }}>{t.tip}</p>
              <p style={{ fontSize:13,color:"#c7d2fe",lineHeight:1.7 }}>{result.tip}</p>
            </div>
            <div style={{ ...card,marginTop:9 }}>
              <p style={{ fontSize:9,fontWeight:700,color:th.subtext,letterSpacing:1,marginBottom:8 }}>{t.alternatives}</p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                {(result.healthier_alternatives||[]).map((alt,i)=><button key={i} onClick={()=>{setProduct(alt);setResult(null);}} style={{ background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.25)",color:"#fb923c",padding:"6px 12px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>{alt} →</button>)}
              </div>
            </div>
          </div>}
          {!result&&!loading&&!error&&<div style={{ textAlign:"center",padding:"40px 0" }}>
            <div style={{ fontSize:46,marginBottom:10 }}>🍱</div>
            <p style={{ fontSize:13,color:th.muted }}>{profile.lang==="hinglish"?`${profile.name}, koi bhi product likho upar`:profile.lang==="hi"?`${profile.name}, कोई product ऊपर लिखें`:`Type any Indian product above, ${profile.name}`}</p>
          </div>}
        </>}

        {tab===1&&<>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 26px 1fr",gap:8,alignItems:"center",marginBottom:10 }}>
            <input value={prodA} onChange={e=>setProdA(e.target.value)} placeholder={t.searchPlaceholder} style={inputStyle} />
            <span style={{ fontSize:10,fontWeight:800,color:th.subtext,textAlign:"center" }}>{t.vsLabel}</span>
            <input value={prodB} onChange={e=>setProdB(e.target.value)} placeholder={t.searchPlaceholder} style={inputStyle} />
          </div>
          <button onClick={compare} disabled={cmpLoading} className="hovbtn" style={{ width:"100%",background:`linear-gradient(135deg,${accent},#ea580c)`,color:"white",border:"none",borderRadius:12,padding:"12px",fontWeight:700,fontSize:13,cursor:cmpLoading?"default":"pointer",marginBottom:16,fontFamily:"inherit" }}>{cmpLoading?<Spinner/>:t.compareBtn}</button>
          {cmpResult&&<div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ ...card,display:"flex",justifyContent:"space-around",alignItems:"center",marginBottom:10 }}>
              <div style={{ textAlign:"center" }}><ScoreRing score={cmpResult.a.health_score} size={90} th={th} /><p style={{ fontSize:10,color:th.subtext,marginTop:5,maxWidth:100 }}>{cmpResult.a.product_name}</p></div>
              <span style={{ fontSize:14,fontWeight:900,color:th.muted }}>{t.vsLabel}</span>
              <div style={{ textAlign:"center" }}><ScoreRing score={cmpResult.b.health_score} size={90} th={th} /><p style={{ fontSize:10,color:th.subtext,marginTop:5,maxWidth:100 }}>{cmpResult.b.product_name}</p></div>
            </div>
            {(()=>{ const w=cmpResult.a.health_score>=cmpResult.b.health_score?cmpResult.a:cmpResult.b; return <div style={{ background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:10,padding:11,textAlign:"center",fontSize:12,color:"#86efac",marginBottom:9 }}>🏆 {w.product_name} — {w.health_score}/100</div>; })()}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[cmpResult.a,cmpResult.b].map((d,i)=><div key={i} style={card}>
                <p style={{ fontSize:10,fontWeight:800,color:accent,marginBottom:7 }}>{d.product_name}</p>
                <p style={{ fontSize:9,color:th.subtext,marginBottom:4 }}>Nutri: <strong style={{ color:th.text }}>{d.nutriscore_grade}</strong> · <span style={{ color:"#f59e0b" }}>{"★".repeat(Math.round(d.health_star_rating))}</span></p>
                <p style={{ fontSize:11,color:th.subtext,lineHeight:1.5 }}>{d.verdict}</p>
              </div>)}
            </div>
          </div>}
          {!cmpResult&&!cmpLoading&&<div style={{ textAlign:"center",padding:"40px 0",color:th.muted }}><div style={{ fontSize:42,marginBottom:9 }}>⚖️</div><p style={{ fontSize:12 }}>{profile.lang==="hinglish"?"Do products enter karo":"Enter two products to compare"}</p></div>}
        </>}

        {tab===2&&<>
          <div style={{ ...card,minHeight:340,maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:10,padding:13 }}>
            <div style={{ background:"rgba(249,115,22,0.12)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:"13px 13px 13px 4px",padding:"9px 13px",fontSize:12,color:"#fed7aa",lineHeight:1.7,maxWidth:"90%" }}>
              <span style={{ fontSize:9,color:accent,fontWeight:700,display:"block",marginBottom:3 }}>🤖 Posha</span>
              {t.chatWelcome(profile.name,profile.lang==="hi"?regionObj?.hi:regionObj?.en)}
            </div>
            {messages.map((m,i)=><div key={i} style={m.role==="user"
              ?{background:th.chip,border:`1px solid ${th.surfaceBorder}`,borderRadius:"13px 13px 4px 13px",padding:"9px 13px",fontSize:12,color:th.text,lineHeight:1.6,maxWidth:"82%",marginLeft:"auto"}
              :{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.18)",borderRadius:"13px 13px 13px 4px",padding:"9px 13px",fontSize:12,color:"#fed7aa",lineHeight:1.7,maxWidth:"90%"}}>
              {m.role==="posha"&&<span style={{ fontSize:9,color:accent,fontWeight:700,display:"block",marginBottom:3 }}>🤖 Posha</span>}
              {m.text}
            </div>)}
            {chatLoading&&<div style={{ background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.18)",borderRadius:"13px 13px 13px 4px",padding:"9px 13px",fontSize:12,color:"#fed7aa",maxWidth:"65%" }}>
              <span style={{ fontSize:9,color:accent,fontWeight:700,display:"block",marginBottom:3 }}>🤖 Posha</span>
              <span style={{ animation:"pulse 1s infinite",display:"inline-block" }}>Soch rahi hoon... 🤔</span>
            </div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:9 }}>
            {(profile.lang==="hi"?["Parle-G रोज़ खाना ठीक है?","Diabetes में क्या avoid करें?","Best protein food?"]
              :profile.lang==="hinglish"?["Parle-G roz theek hai?","Diabetes mein kya avoid karein?","Best protein Indian food?"]
              :["Is Parle-G okay daily?","Best food for diabetes?","Healthy Indian snacks?"]
            ).map((q,i)=><button key={i} onClick={()=>setChatInput(q)} style={{ background:th.chip,border:`1px solid ${th.surfaceBorder}`,color:th.subtext,padding:"4px 10px",borderRadius:8,fontSize:10,cursor:"pointer",fontFamily:"inherit" }}>{q}</button>)}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder={t.chatPlaceholder} style={{ ...inputStyle,flex:1 }} />
            <button onClick={sendChat} disabled={chatLoading} className="hovbtn" style={{ background:`linear-gradient(135deg,${accent},#ea580c)`,color:"white",border:"none",borderRadius:12,padding:"12px 15px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>{t.chatSend}</button>
          </div>
        </>}

        <p style={{ fontSize:9,color:th.muted,textAlign:"center",marginTop:22,lineHeight:1.7 }}>{t.disclaimer}</p>
      </div>
    </div>
  );
}
