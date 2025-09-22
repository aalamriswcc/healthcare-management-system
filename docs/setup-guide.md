# دليل تشغيل التطبيق واختبار الاتصال
## Setup Guide for Healthcare Management System

## المتطلبات الأساسية | Prerequisites

قبل البدء، تأكد من توفر الأدوات التالية على جهازك:

- **Node.js** (الإصدار 18 أو أحدث)
- **npm** أو **pnpm** (مدير الحزم)
- **Git** (لاستنساخ المستودع)
- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)

### التحقق من تثبيت Node.js:
```bash
node --version
npm --version
```

إذا لم يكن Node.js مثبتًا، يمكنك تحميله من [nodejs.org](https://nodejs.org/)

---

## الخطوة 1: استنساخ المستودع | Clone Repository

```bash
# استنساخ المستودع من GitHub
git clone https://github.com/aalamriswcc/healthcare-management-system.git

# الانتقال إلى مجلد المشروع
cd healthcare-management-system
```

---

## الخطوة 2: إعداد الواجهة الأمامية | Frontend Setup

### 2.1 الانتقال إلى مجلد الواجهة الأمامية:
```bash
cd frontend
```

### 2.2 تثبيت التبعيات:
```bash
# باستخدام npm
npm install

# أو باستخدام pnpm (أسرع وأكثر كفاءة)
pnpm install
```

**ملاحظة:** إذا واجهت أخطاء مع `npm`، استخدم `pnpm` بدلاً منه.

### 2.3 التحقق من ملف متغيرات البيئة:
تأكد من وجود ملف `.env.local` في مجلد `frontend` ويحتوي على:
```
REACT_APP_SUPABASE_URL=https://owzdojjwuqmabenlmswg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emRvamp3dXFtYWJlbmxtc3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTY1MjcsImV4cCI6MjA3NDA5MjUyN30.XDsr9Ll9XOemTpAhPggbv0D77HNjBUFVHnHFKZb1mts
```

---

## الخطوة 3: تشغيل خادم التطوير | Start Development Server

```bash
# تشغيل خادم التطوير
npm run dev

# أو باستخدام pnpm
pnpm run dev
```

### ما تتوقعه بعد تشغيل الأمر:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

---

## الخطوة 4: فتح التطبيق في المتصفح | Open in Browser

1. **انسخ الرابط المحلي:** `http://localhost:5173/`
2. **افتح المتصفح** والصق الرابط في شريط العناوين
3. **اضغط Enter**

---

## الخطوة 5: فهم ما تراه على الشاشة | Understanding the Interface

### السيناريو الأول: الاتصال ناجح ✅
إذا كان كل شيء يعمل بشكل صحيح، ستشاهد:
```
Healthcare Management System
Supabase Connection Test
Loading hospitals...
```

ثم إما:
- **قائمة بالمستشفيات** (إذا كانت هناك بيانات في الجدول)
- **"No hospitals found"** (إذا كان الجدول فارغًا)

### السيناريو الثاني: خطأ في الاتصال ❌
إذا ظهرت رسالة خطأ حمراء، فهذا يعني:
- مشكلة في الاتصال بـ Supabase
- مشكلة في سياسات الأمان (RLS)
- خطأ في إعدادات قاعدة البيانات

---

## الخطوة 6: إضافة بيانات تجريبية (اختياري) | Add Test Data

إذا كنت تريد رؤية بيانات فعلية:

### 6.1 اذهب إلى Supabase:
1. افتح [supabase.com](https://supabase.com)
2. سجل دخولك إلى مشروعك
3. اذهب إلى **SQL Editor**

### 6.2 أضف مستشفيات تجريبية:
```sql
-- إضافة مستشفيات تجريبية
INSERT INTO core.hospitals (name, location, is_headquarters) VALUES
('مستشفى الملك فهد', 'الرياض', true),
('مستشفى الملك عبدالعزيز', 'جدة', false),
('مستشفى الملك خالد', 'الدمام', false),
('مستشفى الأمير سلطان', 'الطائف', false),
('مستشفى الملك فيصل', 'المدينة المنورة', false),
('مستشفى الأمير محمد', 'أبها', false);
```

### 6.3 اضغط **RUN** لتنفيذ الاستعلام

---

## الخطوة 7: حل مشاكل الأمان (RLS) | Fix Security Issues

إذا ظهرت رسالة خطأ تتعلق بالصلاحيات:

### 7.1 إنشاء سياسة قراءة عامة:
```sql
-- السماح بقراءة البيانات للجميع (للاختبار فقط)
CREATE POLICY "Enable read access for all users" 
ON core.hospitals FOR SELECT 
USING (true);
```

### 7.2 تمكين RLS على الجدول:
```sql
-- تمكين Row Level Security
ALTER TABLE core.hospitals ENABLE ROW LEVEL SECURITY;
```

---

## الخطوة 8: إعادة تحميل الصفحة | Refresh Page

بعد إضافة البيانات وضبط السياسات:
1. **ارجع إلى المتصفح**
2. **اضغط F5** أو **Ctrl+R** لإعادة تحميل الصفحة
3. **يجب أن تشاهد قائمة المستشفيات الآن**

---

## استكشاف الأخطاء | Troubleshooting

### مشكلة: "Cannot read properties of null"
**الحل:** استخدم `pnpm` بدلاً من `npm`:
```bash
npm install -g pnpm
pnpm install
pnpm run dev
```

### مشكلة: "Port 5173 is already in use"
**الحل:** أغلق العمليات الأخرى أو استخدم منفذ مختلف:
```bash
npm run dev -- --port 3000
```

### مشكلة: صفحة بيضاء فارغة
**الحل:** 
1. افتح **Developer Tools** (F12)
2. تحقق من وجود أخطاء في **Console**
3. تأكد من صحة متغيرات البيئة

### مشكلة: "Failed to fetch"
**الحل:**
1. تحقق من اتصال الإنترنت
2. تأكد من صحة URL و API Key في Supabase
3. تحقق من سياسات RLS

---

## الخطوة 9: إيقاف الخادم | Stop Server

لإيقاف خادم التطوير:
- **اضغط Ctrl+C** في نافذة الأوامر

---

## الخطوات التالية | Next Steps

بعد التأكد من عمل الاتصال:
1. **تطوير وحدات النظام** (إدارة الأجهزة الطبية، المخزون، الموظفين)
2. **تحسين واجهة المستخدم**
3. **إضافة المصادقة والتفويض**
4. **نشر التطبيق على Vercel**

---

## معلومات إضافية | Additional Information

### أوامر مفيدة:
```bash
# عرض معلومات المشروع
npm run dev --help

# بناء المشروع للإنتاج
npm run build

# معاينة النسخة المبنية
npm run preview

# فحص الأخطاء
npm run lint
```

### روابط مفيدة:
- [مستودع المشروع على GitHub](https://github.com/aalamriswcc/healthcare-management-system)
- [وثائق Supabase](https://supabase.com/docs)
- [وثائق React](https://react.dev)
- [وثائق Vite](https://vitejs.dev)

---

**ملاحظة:** إذا واجهت أي مشاكل، لا تتردد في طلب المساعدة مع تفاصيل الخطأ المحدد.
