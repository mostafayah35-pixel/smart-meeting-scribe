import React, { useState, useEffect, useRef } from "react";

// ============================================================
// مساعد الاجتماعات الذكي — Smart Meeting Scribe
// نموذج واجهة تفاعلي (Prototype) بأربع شاشات، تخطيط RTL
// البيانات وهمية وتعكس عقد الربط (api-contract) تماماً
// ⚠️ ملاحظة: هذا نموذج تصميم للعرض، وليس متصلاً بخادم حقيقي
// ============================================================

// ---------- نظام التصميم (Design Tokens) ----------
const T = {
  ink: "#0E2A33",        // حبر بترولي عميق
  deep: "#123C47",       // بترولي أساسي
  teal: "#1C5A66",       // بترولي متوسط
  mist: "#5B8A93",       // بترولي باهت (نص ثانوي)
  amber: "#E0913A",      // كهرماني (الاستماع النشط)
  amberSoft: "#F6D9A8",
  sand: "#F4EFE6",       // خلفية رملية
  sandDeep: "#EAE2D2",
  card: "#FFFFFF",
  line: "#DED5C4",
  green: "#3B8C6E",
  greenSoft: "#DCEFE6",
  red: "#C0553F",
  redSoft: "#F5DED6",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
@keyframes wave { 0%,100%{ transform: scaleY(0.35);} 50%{ transform: scaleY(1);} }
@keyframes fadeUp { from{ opacity:0; transform: translateY(8px);} to{ opacity:1; transform:none;} }
@keyframes pulse { 0%,100%{ opacity:1;} 50%{ opacity:0.5;} }
@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
`;

// ---------- بيانات وهمية تعكس عقد الربط ----------
const MEETINGS = [
  {
    meeting_id: "mtg_00123",
    title: "اجتماع التخطيط للربع الثالث",
    status: "done",
    created_at: "2026-07-09T10:30:00",
    duration: "42 دقيقة",
    language: "ar",
    participants: [
      { name: "أحمد", email: "ahmed@example.com" },
      { name: "سارة", email: "sara@example.com" },
      { name: "خالد", email: "khaled@example.com" },
    ],
    summary:
      "ناقش الفريق خطة الربع الثالث واعتماد الميزانية الجديدة. تم الاتفاق على تأجيل إطلاق الحملة التسويقية أسبوعين لإتاحة وقت أكبر لإعداد المواد، مع توزيع مهام التنفيذ على الأعضاء.",
    decisions: [
      "اعتماد الميزانية الجديدة للربع الثالث",
      "تأجيل إطلاق الحملة التسويقية أسبوعين",
      "عقد اجتماع متابعة أسبوعي كل يوم أحد",
    ],
    action_items: [
      { task: "إعداد تقرير الميزانية التفصيلي", assignee: "أحمد", due_date: "2026-07-20", priority: "high" },
      { task: "تصميم مواد الحملة التسويقية", assignee: "سارة", due_date: "2026-07-25", priority: "medium" },
      { task: "تجهيز قائمة الموردين المحتملين", assignee: "خالد", due_date: null, priority: "low" },
    ],
  },
  {
    meeting_id: "mtg_00124",
    title: "مراجعة أداء المنتج الأسبوعية",
    status: "processing",
    created_at: "2026-07-09T14:00:00",
    duration: "—",
    participants: [{ name: "أحمد" }, { name: "ليان" }],
  },
  {
    meeting_id: "mtg_00122",
    title: "جلسة العصف الذهني للمشروع الجديد",
    status: "done",
    created_at: "2026-07-07T09:00:00",
    duration: "58 دقيقة",
    participants: [{ name: "سارة" }, { name: "خالد" }, { name: "ليان" }, { name: "عمر" }],
    summary: "توليد أفكار أولية للمنتج الجديد وتحديد الفئة المستهدفة، مع اختيار ثلاث أفكار للدراسة المعمّقة.",
    decisions: ["اختيار 3 أفكار للدراسة", "تكليف فريق بحث السوق"],
    action_items: [
      { task: "دراسة جدوى للأفكار الثلاث", assignee: "عمر", due_date: "2026-07-15", priority: "high" },
    ],
  },
];

const PRIORITY = {
  high: { label: "عالية", c: T.red, bg: T.redSoft },
  medium: { label: "متوسطة", c: T.amber, bg: T.amberSoft },
  low: { label: "منخفضة", c: T.green, bg: T.greenSoft },
};

// ================= مكوّنات مساعدة =================

function WaveBars({ active, color = T.amber, count = 7, h = 26 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: h }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 3,
            background: color,
            transformOrigin: "center",
            animation: active ? `wave 1s ease-in-out ${i * 0.11}s infinite` : "none",
            opacity: active ? 1 : 0.3,
            transform: active ? undefined : "scaleY(0.4)",
          }}
        />
      ))}
    </div>
  );
}

function Logo({ size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size, height: size, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.teal}, ${T.deep})`,
          display: "grid", placeItems: "center", flexShrink: 0,
          boxShadow: `0 4px 14px ${T.deep}44`,
        }}
      >
        <WaveBars active color={T.amberSoft} count={4} h={size * 0.5} />
      </div>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 16, color: T.ink }}>
          مُحرِّر الاجتماعات
        </div>
        <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 10.5, color: T.mist, letterSpacing: 0.3 }}>
          Smart Meeting Scribe
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const done = status === "done";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "IBM Plex Sans Arabic", fontSize: 12, fontWeight: 600,
      color: done ? T.green : T.amber,
      background: done ? T.greenSoft : T.amberSoft,
      padding: "4px 10px", borderRadius: 20,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: done ? T.green : T.amber,
        animation: done ? "none" : "pulse 1.2s infinite",
      }} />
      {done ? "جاهز" : "قيد المعالجة"}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", full, type, style }) {
  const base = {
    fontFamily: "Tajawal", fontWeight: 700, fontSize: 15,
    padding: "12px 22px", borderRadius: 12, border: "none", cursor: "pointer",
    width: full ? "100%" : "auto", transition: "transform .15s, box-shadow .15s, background .15s",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.teal}, ${T.deep})`, color: "#fff", boxShadow: `0 6px 18px ${T.deep}33` },
    amber: { background: `linear-gradient(135deg, ${T.amber}, #C9781F)`, color: "#fff", boxShadow: `0 6px 18px ${T.amber}44` },
    ghost: { background: "transparent", color: T.teal, border: `1.5px solid ${T.line}` },
  };
  return (
    <button
      type={type} onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

// ================= الشاشة 1: تسجيل الدخول =================

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <div style={{
      minHeight: "100%", display: "grid", gridTemplateColumns: "1fr 1fr",
      background: T.sand,
    }} className="login-grid">
      {/* اللوحة التعبيرية */}
      <div style={{
        background: `linear-gradient(150deg, ${T.deep}, ${T.ink})`,
        padding: "56px 48px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden",
      }} className="login-hero">
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#ffffff18", display: "grid", placeItems: "center" }}>
              <WaveBars active color={T.amberSoft} count={4} h={18} />
            </div>
            <span style={{ fontFamily: "IBM Plex Sans Arabic", color: "#ffffffcc", fontSize: 12, letterSpacing: 1 }}>
              Smart Meeting Scribe
            </span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 34, color: "#fff", lineHeight: 1.4, marginBottom: 16 }}>
            من ضجيج الاجتماع<br />
            إلى <span style={{ color: T.amber }}>محضرٍ منظّم</span>.
          </h1>
          <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 15, color: "#ffffffaa", lineHeight: 2, maxWidth: 380 }}>
            نُنصت إلى تسجيل اجتماعك، ونحوّله تلقائياً إلى نصٍّ وملخّصٍ وبنودِ عملٍ موزّعةٍ على المشاركين — بالعربية.
          </p>

          {/* استعارة: الموجة تتحول إلى أسطر */}
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}>
            <WaveBars active count={9} h={34} color={T.amber} />
            <span style={{ color: "#ffffff55", fontSize: 20 }}>←</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[70, 100, 48].map((w, i) => (
                <span key={i} style={{ height: 5, width: w, borderRadius: 4, background: "#ffffff40" }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, fontFamily: "IBM Plex Sans Arabic", fontSize: 12, color: "#ffffff66" }}>
          مشروع تخرّج — قسم تقنية المعلومات
        </div>

        {/* دوائر زخرفية خافتة */}
        <div style={{ position: "absolute", top: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: `${T.teal}55`, filter: "blur(10px)" }} />
        <div style={{ position: "absolute", bottom: -60, left: 40, width: 160, height: 160, borderRadius: "50%", background: `${T.amber}22` }} />
      </div>

      {/* نموذج الدخول */}
      <div style={{ display: "grid", placeItems: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: 360, animation: "fadeUp .5s ease" }}>
          <h2 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 26, color: T.ink, marginBottom: 6 }}>
            أهلاً بعودتك
          </h2>
          <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.mist, marginBottom: 30 }}>
            سجّل الدخول لإدارة محاضر اجتماعاتك.
          </p>

          <Field label="البريد الإلكتروني" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="كلمة المرور" value={pw} onChange={setPw} placeholder="••••••••" type="password" />

          <div style={{ textAlign: "left", margin: "6px 0 22px" }}>
            <a style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, color: T.teal, textDecoration: "none", cursor: "pointer" }}>
              نسيت كلمة المرور؟
            </a>
          </div>

          <Btn full onClick={onLogin}>تسجيل الدخول</Btn>

          <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, color: T.mist, textAlign: "center", marginTop: 22 }}>
            ليس لديك حساب؟ <a style={{ color: T.teal, fontWeight: 600, cursor: "pointer" }}>أنشئ حساباً</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 7 }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: "100%", fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.ink,
          padding: "12px 14px", borderRadius: 11, outline: "none",
          border: `1.5px solid ${focus ? T.teal : T.line}`,
          background: focus ? "#fff" : T.sand,
          transition: "border .15s, background .15s", direction: "rtl", textAlign: "right",
        }}
      />
    </div>
  );
}

// ================= الشاشة 2: رفع / تسجيل اجتماع =================

function UploadScreen({ onDone }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [title, setTitle] = useState("");
  const [parts, setParts] = useState([{ name: "", email: "" }]);
  const timer = useRef(null);

  useEffect(() => {
    if (recording) timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [recording]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 24, color: T.ink, marginBottom: 6 }}>
        اجتماع جديد
      </h2>
      <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.mist, marginBottom: 26 }}>
        سجّل الصوت مباشرة أو ارفع ملفاً، وسنتكفّل بالباقي.
      </p>

      {/* منطقة التسجيل — العنصر المميّز */}
      <div style={{
        background: recording ? `linear-gradient(135deg, ${T.deep}, ${T.ink})` : T.card,
        border: `1.5px solid ${recording ? "transparent" : T.line}`,
        borderRadius: 20, padding: "38px 30px", textAlign: "center",
        transition: "background .4s", marginBottom: 20,
      }}>
        <div style={{ marginBottom: 22, display: "flex", justifyContent: "center" }}>
          <WaveBars active={recording} count={13} h={46} color={recording ? T.amber : T.mist} />
        </div>
        <div style={{
          fontFamily: "Tajawal", fontWeight: 800, fontSize: 30,
          color: recording ? "#fff" : T.ink, marginBottom: 4, letterSpacing: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {fmt(seconds)}
        </div>
        <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, color: recording ? "#ffffff99" : T.mist, marginBottom: 24 }}>
          {recording ? "جارٍ الاستماع للاجتماع…" : "اضغط لبدء التسجيل"}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {!recording ? (
            <>
              <Btn variant="amber" onClick={() => setRecording(true)}>● بدء التسجيل</Btn>
              <Btn variant="ghost" style={recording ? {} : { borderColor: T.line }}>⭱ رفع ملف صوتي</Btn>
            </>
          ) : (
            <Btn variant="amber" onClick={() => setRecording(false)} style={{ background: "#fff", color: T.deep }}>
              ■ إيقاف
            </Btn>
          )}
        </div>
      </div>

      {/* تفاصيل الاجتماع */}
      <div style={{ background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 26 }}>
        <Field label="عنوان الاجتماع" value={title} onChange={setTitle} placeholder="مثال: اجتماع التخطيط للربع الثالث" />

        <label style={{ display: "block", fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 7 }}>
          المشاركون
        </label>
        {parts.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              placeholder="الاسم" value={p.name}
              onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              style={inputMini}
            />
            <input
              placeholder="البريد الإلكتروني" value={p.email}
              onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
              style={inputMini}
            />
            {parts.length > 1 && (
              <button onClick={() => setParts(parts.filter((_, j) => j !== i))}
                style={{ border: "none", background: T.redSoft, color: T.red, borderRadius: 10, width: 42, cursor: "pointer", fontSize: 18, flexShrink: 0 }}>
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setParts([...parts, { name: "", email: "" }])}
          style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 600, color: T.teal, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
          + إضافة مشارك
        </button>

        <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
          <Btn onClick={onDone}>معالجة الاجتماع ←</Btn>
          <Btn variant="ghost" onClick={onDone}>حفظ كمسودّة</Btn>
        </div>
      </div>
    </div>
  );
}
const inputMini = {
  flex: 1, fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.ink,
  padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${T.line}`,
  background: T.sand, outline: "none", direction: "rtl", textAlign: "right", minWidth: 0,
};

// ================= الشاشة 3: لوحة المحاضر =================

function DashboardScreen({ onOpen, onNew }) {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 24, color: T.ink, marginBottom: 4 }}>
            محاضر اجتماعاتك
          </h2>
          <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.mist }}>
            {MEETINGS.length} اجتماعات · آخر تحديث اليوم
          </p>
        </div>
        <Btn variant="amber" onClick={onNew}>+ اجتماع جديد</Btn>
      </div>

      {/* شريط إحصائي */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 26 }} className="stat-row">
        {[
          { n: "3", l: "اجتماعات موثّقة", c: T.teal },
          { n: "4", l: "بنود عمل نشطة", c: T.amber },
          { n: "2", l: "قرارات هذا الأسبوع", c: T.green },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 30, color: s.c }}>{s.n}</div>
            <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, color: T.mist }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* قائمة المحاضر */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MEETINGS.map((m) => {
          const clickable = m.status === "done";
          return (
            <div
              key={m.meeting_id}
              onClick={() => clickable && onOpen(m)}
              style={{
                background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 16,
                padding: "18px 20px", display: "flex", alignItems: "center", gap: 18,
                cursor: clickable ? "pointer" : "default", transition: "border .15s, transform .15s",
                opacity: clickable ? 1 : 0.75,
              }}
              onMouseEnter={(e) => clickable && (e.currentTarget.style.borderColor = T.teal, e.currentTarget.style.transform = "translateX(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line, e.currentTarget.style.transform = "none")}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: clickable ? T.greenSoft : T.amberSoft, display: "grid", placeItems: "center",
              }}>
                <WaveBars active={!clickable} count={4} h={18} color={clickable ? T.green : T.amber} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Tajawal", fontWeight: 700, fontSize: 16, color: T.ink, marginBottom: 3 }}>
                  {m.title}
                </div>
                <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 12.5, color: T.mist, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>{new Date(m.created_at).toLocaleDateString("ar", { day: "numeric", month: "long" })}</span>
                  <span>· {m.duration}</span>
                  <span>· {m.participants.length} مشاركين</span>
                </div>
              </div>
              <StatusPill status={m.status} />
              {clickable && <span style={{ color: T.mist, fontSize: 20 }}>‹</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= الشاشة 4: عرض المحضر والمهام =================

function MinutesScreen({ meeting, onBack }) {
  const m = meeting;
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <button onClick={onBack}
        style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14, color: T.teal, background: "none", border: "none", cursor: "pointer", marginBottom: 18, fontWeight: 600 }}>
        › العودة للمحاضر
      </button>

      {/* ترويسة المحضر */}
      <div style={{
        background: `linear-gradient(135deg, ${T.deep}, ${T.ink})`, borderRadius: 20,
        padding: "28px 30px", marginBottom: 20, color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 23, marginBottom: 8 }}>{m.title}</h2>
            <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, color: "#ffffffaa", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span>{new Date(m.created_at).toLocaleDateString("ar", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>· {m.duration}</span>
              <span>· اللغة: العربية</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <MiniAction label="PDF" />
            <MiniAction label="إرسال بريد" amber />
          </div>
        </div>
        {/* المشاركون */}
        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
          {m.participants.map((p, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: "#ffffff18",
              padding: "5px 12px 5px 6px", borderRadius: 20, fontFamily: "IBM Plex Sans Arabic", fontSize: 13,
            }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.amber, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
                {p.name[0]}
              </span>
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* الملخص */}
      <Section title="الملخّص" icon="◈">
        <p style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 15, lineHeight: 2.1, color: T.ink }}>
          {m.summary}
        </p>
      </Section>

      {/* القرارات */}
      <Section title="القرارات المتّخذة" icon="✓" count={m.decisions.length}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {m.decisions.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: T.greenSoft, color: T.green, display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✓</span>
              <span style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14.5, lineHeight: 1.9, color: T.ink }}>{d}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* بنود العمل — الجدول */}
      <Section title="بنود العمل" icon="◎" count={m.action_items.length}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {m.action_items.map((a, i) => {
            const p = PRIORITY[a.priority];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: T.sand, borderRadius: 13, border: `1px solid ${T.line}`,
              }} className="task-row">
                <span style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: T.deep, color: "#fff", display: "grid", placeItems: "center",
                  fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 700,
                }}>
                  {a.assignee[0]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 14.5, fontWeight: 500, color: T.ink, marginBottom: 3 }}>
                    {a.task}
                  </div>
                  <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 12.5, color: T.mist }}>
                    المسؤول: {a.assignee}
                    {a.due_date ? ` · الموعد: ${new Date(a.due_date).toLocaleDateString("ar", { day: "numeric", month: "long" })}` : " · بلا موعد محدّد"}
                  </div>
                </div>
                <span style={{
                  fontFamily: "IBM Plex Sans Arabic", fontSize: 12, fontWeight: 700,
                  color: p.c, background: p.bg, padding: "5px 12px", borderRadius: 20, flexShrink: 0,
                }}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function MiniAction({ label, amber }) {
  return (
    <button style={{
      fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 600, cursor: "pointer",
      color: amber ? "#fff" : T.deep, background: amber ? T.amber : "#fff",
      border: "none", padding: "9px 15px", borderRadius: 10,
    }}>
      {label}
    </button>
  );
}

function Section({ title, icon, count, children }) {
  return (
    <div style={{ background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 18, padding: "22px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: T.sandDeep, color: T.teal, display: "grid", placeItems: "center", fontSize: 15 }}>{icon}</span>
        <h3 style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 17, color: T.ink }}>{title}</h3>
        {count != null && (
          <span style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 12, fontWeight: 700, color: T.mist, background: T.sand, padding: "2px 9px", borderRadius: 20 }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ================= الهيكل الرئيسي والتنقّل =================

const NAV = [
  { id: "dashboard", label: "المحاضر", icon: "▤" },
  { id: "upload", label: "اجتماع جديد", icon: "+" },
];

export default function App() {
  const [screen, setScreen] = useState("login"); // login | dashboard | upload | minutes
  const [active, setActive] = useState(null);

  const openMinutes = (m) => { setActive(m); setScreen("minutes"); };

  // شاشة الدخول بملء الإطار
  if (screen === "login") {
    return (
      <Frame>
        <LoginScreen onLogin={() => setScreen("dashboard")} />
      </Frame>
    );
  }

  return (
    <Frame>
      <div style={{ display: "flex", minHeight: "100%", background: T.sand }}>
        {/* الشريط الجانبي (يمين في RTL) */}
        <aside style={{
          width: 230, background: T.card, borderLeft: `1.5px solid ${T.line}`,
          padding: "24px 18px", display: "flex", flexDirection: "column", flexShrink: 0,
        }} className="sidebar">
          <div style={{ marginBottom: 30 }}><Logo /></div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV.map((n) => {
              const on = screen === n.id;
              return (
                <button key={n.id} onClick={() => setScreen(n.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "right",
                    fontFamily: "Tajawal", fontWeight: 700, fontSize: 15, cursor: "pointer",
                    padding: "11px 14px", borderRadius: 11, border: "none",
                    color: on ? "#fff" : T.ink,
                    background: on ? `linear-gradient(135deg, ${T.teal}, ${T.deep})` : "transparent",
                    transition: "background .15s",
                  }}>
                  <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>{n.icon}</span>
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 10px", background: T.sand, borderRadius: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.deep, color: "#fff", display: "grid", placeItems: "center", fontFamily: "Tajawal", fontWeight: 700 }}>م</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13, fontWeight: 600, color: T.ink }}>مصطفى</div>
                <button onClick={() => setScreen("login")}
                  style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 11.5, color: T.mist, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* المحتوى */}
        <main style={{ flex: 1, padding: "34px 36px", overflowY: "auto" }} className="main-area">
          {screen === "dashboard" && <DashboardScreen onOpen={openMinutes} onNew={() => setScreen("upload")} />}
          {screen === "upload" && <UploadScreen onDone={() => setScreen("dashboard")} />}
          {screen === "minutes" && active && <MinutesScreen meeting={active} onBack={() => setScreen("dashboard")} />}
        </main>
      </div>
    </Frame>
  );
}

function Frame({ children }) {
  return (
    <>
      <style>{FONT_CSS}</style>
      <div dir="rtl" style={{
        fontFamily: "IBM Plex Sans Arabic, Tajawal, sans-serif",
        width: "100%", height: "100vh", overflow: "auto", background: T.sand,
        color: T.ink,
      }}>
        {children}
      </div>
      <style>{`
        @media (max-width: 720px){
          .login-grid{ grid-template-columns: 1fr !important; }
          .login-hero{ display:none !important; }
          .sidebar{ width: 68px !important; padding: 20px 8px !important; }
          .sidebar nav button span:last-child, .sidebar .logotext{ display:none; }
          .stat-row{ grid-template-columns: 1fr !important; }
          .main-area{ padding: 20px 16px !important; }
        }
      `}</style>
    </>
  );
}
