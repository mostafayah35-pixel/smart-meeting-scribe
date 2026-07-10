# Scribe UI v3 — عربي/إنجليزي + هوية الشعار + استجابة كاملة

**استبدال مباشر:** انسخ `src/` و`public/` فوق `frontend/src/` و`frontend/public/`.
كل ما في هذه الحزمة ملفات **متغيرة أو جديدة فقط** — الباقي (Btn، Card، Chip، Avatar، PageHead، useTimer، useHover، index.html…) لم يتغير ويعمل تلقائياً مع النظام الجديد.

## ما الجديد في v3

### 1) دعم لغتين كامل (عربي/إنجليزي) ✨
| الملف | الدور |
|---|---|
| `src/i18n/translations.js` | جديد — كل نصوص الواجهة (~125 مفتاحاً × لغتين) |
| `src/i18n/LanguageContext.jsx` | جديد — `useLang()` يوفر `t(key, vars)` وisRTL وlocale وtoggleLang؛ يحفظ الاختيار في localStorage ويضبط dir/lang/data-lang على `<html>` |
| زر التبديل | في هيدر التطبيق وأعلى نموذج الدخول (أيقونة Languages) |
| رسائل Zod والأخطاء | تُخزَّن **كمفاتيح** وتُترجم لحظة العرض — تبديل اللغة يترجم حتى الأخطاء الظاهرة |
| التواريخ | عبر `locale` الحالية (ar-EG / en-GB) |

### 2) الخطوط: GE SS TV Bold + LBC 🔤
| الملف | الدور |
|---|---|
| `src/config/fonts.css` | جديد — `@font-face` للخطين + متغيرات `--font-head/--font-body/--font-mono` تتبدل مع اللغة تلقائياً |
| `public/fonts/README.txt` | جديد — **الخطان تجاريان**: ضع ملفاتك المرخصة بأسماء `GE-SS-TV-Bold.woff2` و`LBC.woff2` و`LBC-Bold.woff2`؛ حتى ذلك الحين يعمل البديل IBM Plex Sans Arabic |
| `src/config/colors.js` | `F_HEAD/F_BODY` أصبحا متغيري CSS — **كل المكوّنات القديمة تعمل دون تعديل** |

### 3) هوية الشعار 🎨
| الملف | الدور |
|---|---|
| `public/brand/logo.png` | جديد — الشعار الرسمي (مساعد الاجتماعات الذكي) |
| `src/config/colors.js` | اللوحة موائمة للشعار: كحلي عميق `#060A16`، سماوي `#2ED7FF`، أزرق `#3D7BFF`، بنفسجي `#7C5CFF` — كل التدرجات في التطبيق أصبحت بتدرج الهوية |
| `src/screens/Login.jsx` | الشعار معروض في لوحة العلامة (مع بديل دفاعي إن غاب الملف) |

### 4) استجابة كاملة لكل الشاشات 📱
`src/config/globalStyles.css` جديد: حشوات `clamp()`، إحصائيات بـ`auto-fit`، صف المشارك يلتف ≤560px، الشريط الجانبي أيقونات فقط ≤960px، شبكة الدخول عمود واحد ≤860px، `:focus-visible` لإتاحة لوحة المفاتيح.

### 5) كل إصلاحات v2.1 مدمجة 🔧
انهيار Wave، MediaRecorder حقيقي + رفع ملف (حد 200MB)، زر كلمة المرور، Rules of Hooks، بريد Zod الفارغ، إزالة sanitize/dangerouslySetInnerHTML، بحث فعلي بتطبيع عربي/لاتيني، طبقة `services/api.js` (بوضع Mock — `USE_MOCK=true`)، معالجة دفاعية شاملة (`?? []`، PRIO احتياطي، تواريخ غير صالحة).

## ملاحظات تشغيل
1. التسجيل الصوتي يتطلب localhost أو https.
2. عند جاهزية الخادم: `USE_MOCK=false` في `services/api.js` + `VITE_API_URL` في `.env`.
3. يُنصح بحذف `docs/scribe-ui.jsx` القديم منعاً لانحراف المصادر.
