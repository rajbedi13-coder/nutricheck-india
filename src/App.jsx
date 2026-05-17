import { useState, useRef, useEffect } from "react";

// ── DATA ──────────────────────────────────────────────────────
const GOALS = [
  { id:"weight_loss", icon:"↓", en:"Weight Loss", hi:"वजन घटाना", hin:"Weight Loss" },
  { id:"muscle_gain", icon:"↑", en:"Muscle Gain", hi:"मसल बनाना", hin:"Muscle Gain" },
  { id:"heart_health", icon:"♥", en:"Heart Health", hi:"दिल का ख्याल", hin:"Heart Health" },
  { id:"diabetes", icon:"◎", en:"Diabetes", hi:"मधुमेह", hin:"Diabetes" },
  { id:"kids", icon:"★", en:"Kids", hi:"बच्चों के लिए", hin:"Kids" },
  { id:"general", icon:"◆", en:"General", hi:"सामान्य स्वास्थ्य", hin:"General" },
];

const REGIONS = [
  { id:"north", en:"North India", hi:"उत्तर भारत", hin:"North India", note:"Punjab · UP · Delhi · Rajasthan", dietary:"High dairy tolerance, wheat-based, ghee & paneer" },
  { id:"south", en:"South India", hi:"दक्षिण भारत", hin:"South India", note:"Tamil Nadu · Kerala · Karnataka · Andhra", dietary:"Higher lactose sensitivity, rice-based, coconut oil" },
  { id:"west", en:"West India", hi:"पश्चिम भारत", hin:"West India", note:"Maharashtra · Gujarat · Goa", dietary:"Mixed diet, Gujaratis largely vegetarian" },
  { id:"east", en:"East India", hi:"पूर्व भारत", hin:"East India", note:"Bengal · Odisha · Bihar", dietary:"Fish-forward, mustard oil, rice staple" },
  { id:"central", en:"Central India", hi:"मध्य भारत", hin:"Central India", note:"MP · Chhattisgarh", dietary:"Wheat & rice mix, spicy preparations" },
  { id:"ne", en:"North East", hi:"पूर्वोत्तर", hin:"North East", note:"Assam · Meghalaya · Manipur", dietary:"Fermented foods, bamboo shoots, diverse proteins" },
];

const DIETS = [
  { id:"veg", en:"Vegetarian", hi:"शाकाहारी", hin:"Vegetarian" },
  { id:"vegan", en:"Vegan", hi:"वीगन", hin:"Vegan" },
  { id:"nonveg", en:"Non-Veg", hi:"मांसाहारी", hin:"Non-Veg" },
  { id:"jain", en:"Jain", hi:"जैन", hin:"Jain" },
];

const EXAMPLES = ["Parle-G","Maggi Noodles","Amul Butter","Lay's Chips","Haldiram's Bhujia","Bournvita","Britannia Marie Gold","Fortune Oil"];

const PRE_CACHED = {
  "parle-g_general": { product_name:"Parle-G", brand:"Parle", category:"Biscuit", health_score:38, nutriscore_grade:"D", health_star_rating:1.5, verdict:"High sugar and refined flour. Fine as an occasional snack — not a daily staple.", goal_compatibility:"Not ideal for most health goals. High simple carbs cause quick energy spikes followed by crashes.", diet_flag:null, region_note:"Pair with protein like peanuts or a boiled egg to slow sugar absorption.", nutrients:{ calories_per_100g:450, protein_g:6.7, carbs_g:76, sugar_g:22, fat_g:12, saturated_fat_g:5.5, sodium_mg:180, fibre_g:0.5 }, red_flags:["High refined sugar","Maida as main ingredient","Very low fibre"], green_flags:["Affordable energy","Some protein","Vitamin fortified"], healthier_alternatives:["Ragi biscuits","Digestive Marie","Roasted chana"], tip:"Limit to 2-3 biscuits. Pair with chai without sugar — not sweet tea." },
  "maggi noodles_general": { product_name:"Maggi 2-Minute Noodles", brand:"Nestlé", category:"Instant Noodles", health_score:32, nutriscore_grade:"D", health_star_rating:1.5, verdict:"Highly processed and very high in sodium. An occasional comfort food — not a regular meal.", goal_compatibility:"Nearly 50% of daily sodium limit in one serving. Counterproductive for almost every health goal.", diet_flag:null, region_note:"Add vegetables and an egg to significantly improve nutritional value.", nutrients:{ calories_per_100g:430, protein_g:9.5, carbs_g:68, sugar_g:2, fat_g:12, saturated_fat_g:5, sodium_mg:950, fibre_g:2 }, red_flags:["Very high sodium","Ultra-processed","Artificial flavours"], green_flags:["Quick energy","Some iron fortification"], healthier_alternatives:["Bambino vermicelli","Oats upma","Poha"], tip:"Add 1 egg and mixed vegetables — nearly doubles protein and adds fibre." },
  "amul butter_general": { product_name:"Amul Butter", brand:"Amul", category:"Dairy", health_score:52, nutriscore_grade:"C", health_star_rating:2.5, verdict:"Natural dairy fat with no trans fats. Fine in small amounts — easy to overconsume.", goal_compatibility:"Use as a flavour enhancer (5g max) rather than a cooking medium.", diet_flag:null, region_note:"Especially loved in North India — watch portion size carefully.", nutrients:{ calories_per_100g:720, protein_g:0.5, carbs_g:0, sugar_g:0, fat_g:80, saturated_fat_g:50, sodium_mg:600, fibre_g:0 }, red_flags:["Very high saturated fat","High sodium","Calorie dense"], green_flags:["No trans fats","Vitamins A & D","No artificial additives"], healthier_alternatives:["Cold-pressed ghee (tiny amounts)","Olive oil","Avocado"], tip:"5g is enough as a flavour enhancer. Switch to ghee or cold-pressed oil for cooking." },
};

function getCacheKey(product, goal) {
  return `${product.toLowerCase().trim()}_${goal}`;
}
function getLocalCache(key) { try { const v = localStorage.getItem(`nc2_${key}`); return v ? JSON.parse(v) : null; } catch { return null; } }
function setLocalCache(key, data) { try { localStorage.setItem(`nc2_${key}`, JSON.stringify(data)); } catch {} }
function getScanCount() { return parseInt(localStorage.getItem(`scans_${new Date().toISOString().split("T")[0]}`) || "0"); }
function incrementScan() { const k = `scans_${new Date().toISOString().split("T")[0]}`; localStorage.setItem(k, getScanCount() + 1); }

// ── SCORE COLOR ───────────────────────────────────────────────
function scoreColor(s) { return s >= 70 ? "#16a34a" : s >= 45 ? "#d97706" : "#dc2626"; }
function scoreLabel(s) { return s >= 70 ? "Healthy" : s >= 45 ? "Moderate" : "Poor"; }
const NSColor = { A:"#16a34a", B:"#65a30d", C:"#d97706", D:"#ea580c", E:"#dc2626" };

// ── LANGUAGE HELPER ───────────────────────────────────────────
function L(obj, lang, key) {
  if (lang === "hi") return obj[`${key}_hi`] || obj[key];
  if (lang === "hin") return obj[`${key}_hin`] || obj[key];
  return obj[key];
}

const UI = {
  en: {
    tagline: "Know what you eat.",
    sub: "Free nutrition intelligence for every Indian product.",
    langPrompt: "Choose your language to begin",
    goalLabel: "Your health goal",
    regionLabel: "Your region",
    dietLabel: "Your diet",
    nameLabel: "Your name",
    namePlaceholder: "First name...",
    next: "Continue",
    back: "Back",
    start: "Start checking",
    searchPlaceholder: "Search any Indian product...",
    check: "Check",
    compare: "Compare",
    ask: "Ask Posha",
    tabs: ["Scan", "Compare", "Ask Posha"],
    goalFor: "For your goal",
    regionNote: "Regional note",
    nutrients: "Nutrition per 100g",
    watchOut: "Watch out for",
    goodPoints: "Good points",
    alternatives: "Healthier alternatives",
    tip: "Tip",
    disclaimer: "Based on typical nutritional data. Not medical advice. References: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",
    free: "Always free",
    beta: "Beta · Mobile app coming soon",
    editProfile: "Edit",
    scansLeft: (n) => `${n} scans left today`,
    chatWelcome: (name, region) => `Hi ${name}! I'm Posha — your free nutrition guide. I know you're from ${region}, so I'll tailor my advice to your lifestyle. What would you like to know?`,
    chatPlaceholder: "Ask me anything about food or nutrition...",
    send: "Send",
    whatsapp: "Share result",
    noResult: "Search any Indian product above to see its health score.",
    rateLimit: "You've reached today's limit. Come back tomorrow.",
    error: "Couldn't find that product. Try another name.",
    vsLabel: "vs",
    winner: "Better choice",
    chatSuggestions: ["Is Parle-G okay daily?", "Best food for diabetes?", "High protein Indian snacks?"],
  },
  hi: {
    tagline: "जानें क्या खा रहे हैं।",
    sub: "हर Indian product का free nutrition score।",
    langPrompt: "शुरू करने के लिए भाषा चुनें",
    goalLabel: "आपका स्वास्थ्य लक्ष्य",
    regionLabel: "आपका क्षेत्र",
    dietLabel: "आपका खानपान",
    nameLabel: "आपका नाम",
    namePlaceholder: "पहला नाम...",
    next: "आगे",
    back: "वापस",
    start: "शुरू करें",
    searchPlaceholder: "कोई भी Indian product खोजें...",
    check: "जाँचें",
    compare: "तुलना करें",
    ask: "Posha से पूछें",
    tabs: ["जाँचें", "Compare", "Posha"],
    goalFor: "आपके goal के लिए",
    regionNote: "Regional note",
    nutrients: "पोषण तत्व (प्रति 100g)",
    watchOut: "ध्यान दें",
    goodPoints: "अच्छी बात",
    alternatives: "बेहतर विकल्प",
    tip: "सुझाव",
    disclaimer: "सामान्य nutritional data पर आधारित। Medical advice नहीं। संदर्भ: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",
    free: "हमेशा मुफ़्त",
    beta: "Beta · Mobile app जल्द आ रहा है",
    editProfile: "बदलें",
    scansLeft: (n) => `आज ${n} scans बाकी`,
    chatWelcome: (name, region) => `नमस्ते ${name}! मैं Posha हूँ — आपकी free nutrition guide। आप ${region} से हैं, तो मैं आपके लिए सही सलाह दूँगी। क्या जानना है?`,
    chatPlaceholder: "खाने या पोषण के बारे में कुछ भी पूछें...",
    send: "भेजें",
    whatsapp: "Share करें",
    noResult: "ऊपर कोई भी Indian product search करें।",
    rateLimit: "आज की limit हो गई। कल फिर आएं।",
    error: "यह product नहीं मिला। दूसरा नाम try करें।",
    vsLabel: "बनाम",
    winner: "बेहतर विकल्प",
    chatSuggestions: ["Parle-G रोज़ ठीक है?", "Diabetes में क्या खाएं?", "High protein Indian snacks?"],
  },
  hin: {
    tagline: "Jaano kya kha rahe ho.",
    sub: "Har Indian product ka free nutrition score.",
    langPrompt: "Shuru karne ke liye bhasha chuno",
    goalLabel: "Tumhara health goal",
    regionLabel: "Tumhara region",
    dietLabel: "Tumhara khana-pina",
    nameLabel: "Tumhara naam",
    namePlaceholder: "Pehla naam...",
    next: "Aage",
    back: "Wapas",
    start: "Shuru karo",
    searchPlaceholder: "Koi bhi Indian product search karo...",
    check: "Check karo",
    compare: "Compare karo",
    ask: "Posha se pucho",
    tabs: ["Scan", "Compare", "Posha"],
    goalFor: "Tumhare goal ke liye",
    regionNote: "Regional note",
    nutrients: "Nutrition (per 100g)",
    watchOut: "Dhyan do",
    goodPoints: "Achhi baat",
    alternatives: "Better options",
    tip: "Tip",
    disclaimer: "Typical nutritional data pe based. Medical advice nahi. Ref: FSSAI · WHO · Nutri-Score · Health Star Rating (AU)",
    free: "Hamesha free",
    beta: "Beta · Mobile app aa raha hai",
    editProfile: "Edit",
    scansLeft: (n) => `Aaj ${n} scans baaki`,
    chatWelcome: (name, region) => `Namaste ${name}! Main Posha hoon — tumhari free nutrition guide. Tum ${region} se ho, toh main tumhare liye sahi advice dunga. Kya jaanna hai?`,
    chatPlaceholder: "Khane ya nutrition ke baare mein kuch bhi pucho...",
    send: "Bhejo",
    whatsapp: "Share karo",
    noResult: "Upar koi bhi Indian product search karo.",
    rateLimit: "Aaj ki limit ho gayi. Kal wapas aao.",
    error: "Yeh product nahi mila. Doosra naam try karo.",
    vsLabel: "vs",
    winner: "Better choice",
    chatSuggestions: ["Parle-G roz theek hai?", "Diabetes mein kya avoid karein?", "High protein Indian food?"],
  }
};

// ── ONBOARDING ────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [lang, setLang] = useState(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [region, setRegion] = useState(null);
  const [goal, setGoal] = useState(null);
  const [diet, setDiet] = useState(null);

  const t = lang ? UI[lang] : UI.en;
  const canNext = [lang !== null, name.trim().length > 0, region !== null, goal !== null, diet !== null];

  if (!lang) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <div style={{ marginBottom: 48 }}>
            <div style={styles.logo}>NutriCheck <span style={{ color: "#16a34a" }}>India</span></div>
            <div style={styles.logoSub}>Know what you eat.</div>
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24, letterSpacing: 0.3 }}>Choose your language to begin</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: "en", label: "English", sub: "Continue in English" },
              { id: "hi", label: "हिन्दी", sub: "हिन्दी में जारी रखें" },
              { id: "hin", label: "Hinglish", sub: "Hindi + English mix" },
            ].map(l => (
              <button key={l.id} onClick={() => { setLang(l.id); setStep(1); }}
                style={styles.langBtn}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{l.label}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{l.sub}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 32, textAlign: "center" }}>Free forever · No subscription · No login required</p>
        </div>
      </div>
    );
  }

  const steps = [
    // Step 1 — Name
    <div key="name">
      <div style={styles.stepLabel}>{t.nameLabel}</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder}
        style={styles.input} autoFocus />
    </div>,
    // Step 2 — Region
    <div key="region">
      <div style={styles.stepLabel}>{t.regionLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {REGIONS.map(r => (
          <button key={r.id} onClick={() => setRegion(r.id)}
            style={{ ...styles.selectBtn, ...(region === r.id ? styles.selectBtnActive : {}) }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: region === r.id ? "#16a34a" : "#111827" }}>
              {lang === "hi" ? r.hi : lang === "hin" ? r.hin : r.en}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, lineHeight: 1.4 }}>{r.note}</div>
          </button>
        ))}
      </div>
    </div>,
    // Step 3 — Goal
    <div key="goal">
      <div style={styles.stepLabel}>{t.goalLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {GOALS.map(g => (
          <button key={g.id} onClick={() => setGoal(g.id)}
            style={{ ...styles.selectBtn, ...(goal === g.id ? styles.selectBtnActive : {}), textAlign: "center", padding: "14px 8px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{g.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: goal === g.id ? "#16a34a" : "#374151", lineHeight: 1.3 }}>
              {lang === "hi" ? g.hi : lang === "hin" ? g.hin : g.en}
            </div>
          </button>
        ))}
      </div>
    </div>,
    // Step 4 — Diet
    <div key="diet">
      <div style={styles.stepLabel}>{t.dietLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {DIETS.map(d => (
          <button key={d.id} onClick={() => setDiet(d.id)}
            style={{ ...styles.selectBtn, ...(diet === d.id ? styles.selectBtnActive : {}), textAlign: "center", padding: "18px 12px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: diet === d.id ? "#16a34a" : "#111827" }}>
              {lang === "hi" ? d.hi : lang === "hin" ? d.hin : d.en}
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={styles.page}>
      <div style={styles.centerBox}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 36 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i <= step ? "#16a34a" : "#e5e7eb", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ minHeight: 280, animation: "fadeUp 0.3s ease" }}>
          {steps[step - 1]}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={styles.backBtn}>{t.back}</button>
          )}
          {step < 4 ? (
            <button onClick={() => canNext[step - 1] && setStep(s => s + 1)}
              disabled={!canNext[step - 1]}
              style={{ ...styles.primaryBtn, opacity: canNext[step - 1] ? 1 : 0.3 }}>
              {t.next}
            </button>
          ) : (
            <button onClick={() => onComplete({ name: name.trim() || "Friend", region, goal, diet, lang })}
              style={styles.primaryBtn}>
              {t.start} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SCORE CARD ──────────────────────────────────────────────────
function ScoreCircle({ score }) {
  const color = scoreColor(score);
  const r = 44, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: "#9ca3af", letterSpacing: 1, marginTop: 2 }}>{scoreLabel(score).toUpperCase()}</span>
      </div>
    </div>
  );
}

function NutrientRow({ label, value, max, unit, good }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = good ? (pct > 50 ? "#16a34a" : pct > 25 ? "#d97706" : "#dc2626") : (pct < 40 ? "#16a34a" : pct < 70 ? "#d97706" : "#dc2626");
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#111827", fontWeight: 600, fontFamily: "monospace" }}>{value}{unit}</span>
      </div>
      <div style={{ height: 4, background: "#f3f4f6", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState(0);
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resultSource, setResultSource] = useState(null);
  const [prodA, setProdA] = useState(""); const [prodB, setProdB] = useState("");
  const [cmpLoading, setCmpLoading] = useState(false); const [cmpResult, setCmpResult] = useState(null);
  const [messages, setMessages] = useState([]); const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  if (!profile) return <Onboarding onComplete={p => setProfile(p)} />;

  const t = UI[profile.lang];
  const regionObj = REGIONS.find(r => r.id === profile.region);
  const goalObj = GOALS.find(g => g.id === profile.goal);

  const callAI = async (prompt) => {
    const res = await fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (!data.text) throw new Error("No response");
    return data.text.trim();
  };

  const buildPrompt = (productName) => {
    const lang = profile.lang === "hi" ? "Hindi" : profile.lang === "hin" ? "Hinglish (warm natural mix of Hindi and English)" : "English";
    const regionName = profile.lang === "hi" ? regionObj?.hi : regionObj?.en;
    const goalName = profile.lang === "hi" ? goalObj?.hi : goalObj?.en;
    return `You are a senior nutrition expert specialising in Indian packaged food products. 
User: ${profile.name}, from ${regionObj?.en} (${regionObj?.dietary}), Goal: ${goalName}, Diet: ${profile.diet}.
Analyse: "${productName}". Be region-specific and goal-specific. Flag diet conflicts if any.
Language for all text fields: ${lang}.
Respond ONLY valid JSON no markdown no backticks:
{"product_name":"...","brand":"...","category":"...","health_score":<0-100>,"nutriscore_grade":"<A|B|C|D|E>","health_star_rating":<0.5-5>,"verdict":"<1 clear sentence>","goal_compatibility":"<2 sentences specific to their goal and region>","diet_flag":"<null or short warning>","region_note":"<1 practical regional insight>","nutrients":{"calories_per_100g":<n>,"protein_g":<n>,"carbs_g":<n>,"sugar_g":<n>,"fat_g":<n>,"saturated_fat_g":<n>,"sodium_mg":<n>,"fibre_g":<n>},"red_flags":["...","..."],"green_flags":["...","..."],"healthier_alternatives":["...","...","..."],"tip":"<1 practical tip>"}
Base on FSSAI, WHO, Nutri-Score EU, Health Star Rating AU. Be honest.`;
  };

  const analyse = async () => {
    if (!product.trim()) return;
    if (getScanCount() >= 10) { setError(t.rateLimit); return; }
    const ck = getCacheKey(product, profile.goal);
    if (PRE_CACHED[ck]) { setResult(PRE_CACHED[ck]); setResultSource("instant"); setError(null); return; }
    const cached = getLocalCache(ck);
    if (cached) { setResult(cached); setResultSource("cached"); setError(null); return; }
    setLoading(true); setError(null); setResult(null); setResultSource(null);
    try {
      incrementScan();
      const raw = await callAI(buildPrompt(product));
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setLocalCache(ck, parsed);
      setResult(parsed); setResultSource("live");
    } catch { setError(t.error); }
    setLoading(false);
  };

  const compare = async () => {
    if (!prodA.trim() || !prodB.trim()) return;
    setCmpLoading(true); setCmpResult(null);
    const fetchOne = async (p) => {
      const ck = getCacheKey(p, profile.goal);
      if (PRE_CACHED[ck]) return PRE_CACHED[ck];
      const lc = getLocalCache(ck); if (lc) return lc;
      incrementScan();
      const raw = await callAI(buildPrompt(p));
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setLocalCache(ck, parsed); return parsed;
    };
    try { const [a, b] = await Promise.all([fetchOne(prodA), fetchOne(prodB)]); setCmpResult({ a, b }); } catch {}
    setCmpLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim(); setChatInput("");
    const newMsgs = [...messages, { role: "user", text: userMsg }];
    setMessages(newMsgs); setChatLoading(true);
    try {
      const langStr = profile.lang === "hi" ? "Hindi" : profile.lang === "hin" ? "Hinglish (warm natural Hindi-English mix)" : "English";
      const history = newMsgs.map(m => `${m.role === "user" ? profile.name : "Posha"}: ${m.text}`).join("\n");
      const prompt = `You are Posha, a warm friendly Indian nutrition expert. User: ${profile.name}, from ${regionObj?.en} (${regionObj?.dietary}), Goal: ${profile.lang === "hi" ? goalObj?.hi : goalObj?.en}, Diet: ${profile.diet}. Respond in ${langStr}. Keep answers concise (3-4 sentences), practical, encouraging. Be region-aware.\n\nConversation:\n${history}\n\nPosha:`;
      const reply = await callAI(prompt);
      setMessages([...newMsgs, { role: "posha", text: reply }]);
    } catch { setMessages(m => [...m, { role: "posha", text: profile.lang === "hin" ? "Sorry yaar, thoda issue aa gaya. Dobara try karo!" : profile.lang === "hi" ? "माफ़ करें, कुछ गड़बड़ हो गई। फिर से try करें!" : "Sorry, something went wrong. Please try again!" }]); }
    setChatLoading(false);
  };

  const whatsappText = result ? encodeURIComponent(`🇮🇳 NutriCheck India\n\n${result.product_name} — ${result.health_score}/100\nNutri-Score: ${result.nutriscore_grade} · ${result.health_star_rating}/5 ⭐\n\n${result.verdict}\n\nFree check: nutricheckindia.vercel.app`) : "";
  const scansLeft = 10 - getScanCount();

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::placeholder{color:#d1d5db;}
        input:focus,textarea:focus{outline:none;border-color:#16a34a!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .hovbtn:hover{opacity:0.8;}
        button{transition:all 0.15s;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
      `}</style>

      {/* Beta banner */}
      <div style={{ background: "#f0fdf4", borderBottom: "1px solid #dcfce7", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{t.beta}</span>
        <span style={{ fontSize: 11, color: "#86efac" }}>{t.free}</span>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 20, color: "#111827", letterSpacing: -0.5 }}>
              NutriCheck <span style={{ color: "#16a34a" }}>India</span>
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {regionObj?.en || "India"} · {profile.lang === "hi" ? goalObj?.hi : goalObj?.en} · {t.scansLeft(scansLeft)}
            </div>
          </div>
          <button onClick={() => setProfile(null)} style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
            {t.editProfile}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6", marginBottom: 24 }}>
          {t.tabs.map((label, i) => (
            <button key={i} onClick={() => setTab(i)}
              style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", fontSize: 13, fontWeight: tab === i ? 700 : 400, color: tab === i ? "#16a34a" : "#9ca3af", cursor: "pointer", borderBottom: tab === i ? "2px solid #16a34a" : "2px solid transparent", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 0: SCAN ── */}
        {tab === 0 && <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={product} onChange={e => setProduct(e.target.value)} onKeyDown={e => e.key === "Enter" && analyse()}
              placeholder={t.searchPlaceholder}
              style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "13px 16px", fontSize: 14, color: "#111827", background: "#fafafa" }} />
            <button onClick={analyse} disabled={loading} className="hovbtn"
              style={{ background: "#16a34a", color: "white", border: "none", borderRadius: 10, padding: "13px 20px", fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", minWidth: 80, fontFamily: "inherit" }}>
              {loading ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : t.check}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {EXAMPLES.map(p => (
              <button key={p} onClick={() => setProduct(p)}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {p}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

          {result && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Source badge */}
              {resultSource && (
                <div style={{ fontSize: 10, color: resultSource === "live" ? "#16a34a" : "#d97706", marginBottom: 10, fontWeight: 600, letterSpacing: 0.5 }}>
                  {resultSource === "instant" ? "⚡ INSTANT RESULT" : resultSource === "cached" ? "⚡ CACHED" : "● LIVE ANALYSIS"}
                </div>
              )}

              {/* Main card */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, marginBottom: 4 }}>{result.category?.toUpperCase()}</div>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#111827", marginBottom: 3, lineHeight: 1.2 }}>{result.product_name}</h2>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{result.brand}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: NSColor[result.nutriscore_grade], color: "white", padding: "3px 10px", borderRadius: 99 }}>Nutri-Score {result.nutriscore_grade}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, background: "#fefce8", color: "#854d0e", padding: "3px 10px", borderRadius: 99, border: "1px solid #fef08a" }}>{"★".repeat(Math.round(result.health_star_rating))}{"☆".repeat(5 - Math.round(result.health_star_rating))} {result.health_star_rating}/5</span>
                    </div>
                  </div>
                  <ScoreCircle score={result.health_score} />
                </div>
                <div style={{ marginTop: 16, padding: "12px 14px", background: "#f9fafb", borderRadius: 10, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                  {result.verdict}
                </div>
                {result.diet_flag && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 12, color: "#dc2626" }}>
                    ⚠ {result.diet_flag}
                  </div>
                )}
                <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, background: "#25D366", color: "white", textDecoration: "none", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.5l5.797-1.519A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.5-5.197-1.377l-.373-.22-3.44.902.917-3.353-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  {t.whatsapp}
                </a>
              </div>

              {/* Goal card */}
              <div style={{ border: "1px solid #dcfce7", borderRadius: 14, padding: 16, marginBottom: 12, background: "#f0fdf4" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", letterSpacing: 1, marginBottom: 8 }}>{goalObj?.icon} {t.goalFor?.toUpperCase()}</div>
                <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.7 }}>{result.goal_compatibility}</p>
                {result.region_note && (
                  <p style={{ fontSize: 12, color: "#4ade80", marginTop: 10, paddingTop: 10, borderTop: "1px solid #dcfce7", color: "#15803d" }}>
                    📍 {result.region_note}
                  </p>
                )}
              </div>

              {/* Nutrients */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, marginBottom: 14 }}>{t.nutrients?.toUpperCase()}</div>
                <NutrientRow label="Calories" value={result.nutrients.calories_per_100g} max={500} unit=" kcal" good={false} />
                <NutrientRow label="Protein" value={result.nutrients.protein_g} max={30} unit="g" good={true} />
                <NutrientRow label="Carbohydrates" value={result.nutrients.carbs_g} max={80} unit="g" good={false} />
                <NutrientRow label="Sugar" value={result.nutrients.sugar_g} max={50} unit="g" good={false} />
                <NutrientRow label="Fat" value={result.nutrients.fat_g} max={40} unit="g" good={false} />
                <NutrientRow label="Saturated Fat" value={result.nutrients.saturated_fat_g} max={20} unit="g" good={false} />
                <NutrientRow label="Sodium" value={result.nutrients.sodium_mg} max={2000} unit="mg" good={false} />
                <NutrientRow label="Fibre" value={result.nutrients.fibre_g} max={25} unit="g" good={true} />
              </div>

              {/* Flags */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ border: "1px solid #fecaca", borderRadius: 12, padding: 14, background: "#fef2f2" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", letterSpacing: 1, marginBottom: 8 }}>{t.watchOut?.toUpperCase()}</div>
                  {(result.red_flags || []).map((f, i) => <p key={i} style={{ fontSize: 12, color: "#b91c1c", marginBottom: 5, lineHeight: 1.5 }}>— {f}</p>)}
                </div>
                <div style={{ border: "1px solid #bbf7d0", borderRadius: 12, padding: 14, background: "#f0fdf4" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", letterSpacing: 1, marginBottom: 8 }}>{t.goodPoints?.toUpperCase()}</div>
                  {(result.green_flags || []).map((f, i) => <p key={i} style={{ fontSize: 12, color: "#15803d", marginBottom: 5, lineHeight: 1.5 }}>+ {f}</p>)}
                </div>
              </div>

              {/* Tip */}
              <div style={{ border: "1px solid #e0e7ff", borderRadius: 12, padding: 14, marginBottom: 12, background: "#eef2ff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", letterSpacing: 1, marginBottom: 6 }}>{t.tip?.toUpperCase()}</div>
                <p style={{ fontSize: 13, color: "#3730a3", lineHeight: 1.7 }}>{result.tip}</p>
              </div>

              {/* Alternatives */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, marginBottom: 10 }}>{t.alternatives?.toUpperCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(result.healthier_alternatives || []).map((alt, i) => (
                    <button key={i} onClick={() => { setProduct(alt); setResult(null); }}
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
                      {alt} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🍱</div>
              <p style={{ fontSize: 14, color: "#9ca3af" }}>{t.noResult}</p>
            </div>
          )}
        </>}

        {/* ── TAB 1: COMPARE ── */}
        {tab === 1 && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input value={prodA} onChange={e => setProdA(e.target.value)} placeholder={t.searchPlaceholder}
              style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#111827", background: "#fafafa", fontFamily: "inherit" }} />
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textAlign: "center" }}>{t.vsLabel}</span>
            <input value={prodB} onChange={e => setProdB(e.target.value)} placeholder={t.searchPlaceholder}
              style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#111827", background: "#fafafa", fontFamily: "inherit" }} />
          </div>
          <button onClick={compare} disabled={cmpLoading} className="hovbtn"
            style={{ width: "100%", background: "#16a34a", color: "white", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 14, cursor: cmpLoading ? "default" : "pointer", marginBottom: 20, fontFamily: "inherit" }}>
            {cmpLoading ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : t.compare}
          </button>
          {cmpResult && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <ScoreCircle score={cmpResult.a.health_score} />
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, maxWidth: 110 }}>{cmpResult.a.product_name}</p>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#e5e7eb" }}>{t.vsLabel?.toUpperCase()}</div>
                <div style={{ textAlign: "center" }}>
                  <ScoreCircle score={cmpResult.b.health_score} />
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, maxWidth: 110 }}>{cmpResult.b.product_name}</p>
                </div>
              </div>
              {(() => {
                const w = cmpResult.a.health_score >= cmpResult.b.health_score ? cmpResult.a : cmpResult.b;
                return <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, textAlign: "center", fontSize: 13, color: "#16a34a", fontWeight: 700, marginBottom: 12 }}>✓ {t.winner}: {w.product_name} ({w.health_score}/100)</div>;
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[cmpResult.a, cmpResult.b].map((d, i) => (
                  <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>{d.product_name}</p>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Score: <strong style={{ color: scoreColor(d.health_score) }}>{d.health_score}</strong></p>
                    <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>{d.verdict}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!cmpResult && !cmpLoading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚖️</div>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Enter two products to compare</p>
            </div>
          )}
        </>}

        {/* ── TAB 2: POSHA CHAT ── */}
        {tab === 2 && <>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, minHeight: 360, maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, padding: 14 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 13, color: "#166534", lineHeight: 1.7, maxWidth: "90%" }}>
              <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, display: "block", marginBottom: 4 }}>Posha</span>
              {t.chatWelcome(profile.name, profile.lang === "hi" ? regionObj?.hi : regionObj?.en)}
            </div>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user"
                ? { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px 12px 4px 12px", padding: "10px 14px", fontSize: 13, color: "#111827", lineHeight: 1.6, maxWidth: "82%", marginLeft: "auto" }
                : { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 13, color: "#166534", lineHeight: 1.7, maxWidth: "90%" }}>
                {m.role === "posha" && <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, display: "block", marginBottom: 4 }}>Posha</span>}
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 13, color: "#16a34a", maxWidth: "60%" }}>
                <span style={{ fontSize: 10, fontWeight: 700, display: "block", marginBottom: 4 }}>Posha</span>
                <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {t.chatSuggestions.map((q, i) => (
              <button key={i} onClick={() => setChatInput(q)}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder={t.chatPlaceholder}
              style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 15px", fontSize: 13, color: "#111827", background: "#fafafa", fontFamily: "inherit" }} />
            <button onClick={sendChat} disabled={chatLoading} className="hovbtn"
              style={{ background: "#16a34a", color: "white", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {t.send}
            </button>
          </div>
        </>}

        <p style={{ fontSize: 10, color: "#d1d5db", textAlign: "center", marginTop: 28, lineHeight: 1.7, paddingBottom: 40 }}>{t.disclaimer}</p>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────
const styles = {
  page: { minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'DM Sans',system-ui,sans-serif" },
  centerBox: { width: "100%", maxWidth: 420 },
  logo: { fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 28, color: "#111827", letterSpacing: -1, marginBottom: 8 },
  logoSub: { fontSize: 14, color: "#9ca3af", fontWeight: 400 },
  langBtn: { width: "100%", background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, textAlign: "left", fontFamily: "inherit" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "13px 16px", fontSize: 15, color: "#111827", background: "#fafafa", fontFamily: "inherit" },
  selectBtn: { background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 12, padding: "13px 12px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" },
  selectBtnActive: { background: "#f0fdf4", border: "1px solid #16a34a" },
  primaryBtn: { flex: 2, background: "#111827", border: "none", borderRadius: 12, padding: "14px", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: 0.3 },
  backBtn: { flex: 1, background: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};
