# نظام إدارة الرعاية الصحية الشامل
## Comprehensive Healthcare Management System

### نظرة عامة | Overview

نظام إدارة شامل مصمم لشبكة من 6 مستشفيات مع مقر رئيسي، يهدف إلى تحسين كفاءة العمليات الطبية والإدارية من خلال أتمتة العمليات وتوفير لوحات معلومات تفاعلية.

A comprehensive management system designed for a network of 6 hospitals with a central headquarters, aimed at improving the efficiency of medical and administrative operations through process automation and interactive dashboards.

### الوحدات الرئيسية | Main Modules

1. **نظام إدارة الطلبات | Order Management System**
   - إدارة طلبات المستلزمات الطبية
   - تتبع حالة الطلبات
   - إدارة الموافقات

2. **نظام إدارة الأجهزة الطبية | Medical Device Management**
   - تسجيل وتتبع الأجهزة الطبية
   - جدولة الصيانة الدورية
   - إدارة الضمانات

3. **نظام إدارة تراخيص الموظفين | Employee License Management**
   - تتبع تراخيص الموظفين
   - تنبيهات انتهاء الصلاحية
   - إدارة التجديدات

4. **لوحة المعلومات التنفيذية | Executive Dashboard**
   - عرض مؤشرات الأداء الرئيسية
   - تقارير تفاعلية
   - تحليلات البيانات

### التقنيات المستخدمة | Technology Stack

- **المنصة الخلفية | Backend Platform:** Supabase (PostgreSQL + Auth + Auto-generated APIs)
- **الواجهة الأمامية | Frontend:** React.js
- **النشر | Deployment:** Vercel
- **إدارة الحالة | State Management:** Redux Toolkit
- **التصميم | UI Framework:** Material-UI

### متطلبات النظام | System Requirements

- Node.js 18+
- PostgreSQL 14+
- npm أو yarn

### التثبيت والتشغيل | Installation & Setup

1.  **استنساخ المستودع:**
    ```bash
    git clone https://github.com/aalamriswcc/healthcare-management-system.git
    cd healthcare-management-system
    ```

2.  **إعداد متغيرات البيئة (Supabase):**
    - قم بإنشاء ملف `.env.local` في مجلد `frontend`.
    - أضف متغيرات البيئة الخاصة بـ Supabase:
      ```
      REACT_APP_SUPABASE_URL=your-supabase-url
      REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
      ```

3.  **تثبيت التبعيات وتشغيل الواجهة الأمامية:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  **نشر على Vercel:**
    - قم بتثبيت Vercel CLI: `npm install -g vercel`
    - قم بتسجيل الدخول: `vercel login`
    - قم بالنشر: `vercel`

### هيكل المشروع | Project Structure

```
healthcare-management-system/
├── backend/                 # الواجهة الخلفية
│   ├── src/
│   │   ├── controllers/     # وحدات التحكم
│   │   ├── models/          # نماذج البيانات
│   │   ├── routes/          # مسارات API
│   │   └── middleware/      # البرمجيات الوسطية
├── frontend/                # الواجهة الأمامية
│   ├── src/
│   │   ├── components/      # المكونات
│   │   ├── pages/           # الصفحات
│   │   ├── services/        # خدمات API
│   │   └── utils/           # الأدوات المساعدة
├── database/                # قاعدة البيانات
│   ├── schema.sql           # مخطط قاعدة البيانات
│   ├── migrations/          # ملفات الترحيل
│   └── seeds/               # البيانات الأولية
├── docs/                    # التوثيق
└── tests/                   # الاختبارات
```

### المساهمة | Contributing

نرحب بالمساهمات! يرجى قراءة دليل المساهمة قبل تقديم طلبات السحب.

### الترخيص | License

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

### الدعم | Support

للحصول على الدعم، يرجى فتح issue في المستودع أو التواصل مع فريق التطوير.

---

**تم التطوير بواسطة | Developed by:** فريق تطوير نظم الرعاية الصحية
**آخر تحديث | Last Updated:** سبتمبر 2025
