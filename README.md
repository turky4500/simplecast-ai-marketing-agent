# 🤖 Multi-Podcast Simplecast AI Marketing Agent (100% Free - GitHub Actions)

وكيل ذكاء اصطناعي آلي بالكامل (Set & Forget) مخصص لتسويق **عدة برامج بودكاست (4 برامج فأكثر)** وأرشيف الحلقات السابقة (أكثر من 400+ حلقة) لزيادة استماعاتك عبر منصات **X (تويتر)** و **Google SEO** و **YouTube Shorts / Reels (بدون موسيقى ولا مؤثرات)**.

يعمل هذا النظام مجاناً 100% بدون حاجة لسيرفرات مدفوعة عبر **GitHub Actions** و **Google Gemini API Free Tier**.

---

## 🌟 المميزات المتقدمة لـ 4 برامج وأرشيف 400+ حلقة

1. **دعم برامج متعددة (Multi-Podcast Support)**:
   يمكنك وضع روابط الـ RSS لـ 4 برامج بودكاست (أو أكثر) مفصولة بفواصل، وسيقوم الوكيل بإدارتها جميعاً في وقت واحد وتكشيف حلقاتها في مجلدات مخصصة لكل برنامج داخل `campaigns/`.

2. **معالجة الأرشيف والحلقات السابقة (Archive Backlog Batching)**:
   لأن لديك مئات الحلقات السابقة، يقوم الوكيل بمعالجة الحلقات على دفعات (مثلاً 5 حلقات في كل مرة تشغيل كل 4 ساعات) لتجنب تجاوز حدود Gemini المجانية. مع الوقت، سيغطي الوكيل جميع الـ 400+ حلقة تلقائياً ومجاناً!

3. **الالتزام الكامل بالشروط**:
   - 🚫 **بدون موسيقى ولا مؤثرات صوتية إطلاقاً**: نصوص وسيناريوهات المقاطع الموجهة لـ Shorts/Reels تعتمد 100% على التحدث الصوتي والنصوص المكتوبة على الشاشة.
   - 🚫 **بدون LinkedIn**.
   - 🧵 **سلاسل تغريدات X** + 🔍 **مقالات Google SEO** متكاملة + 💬 **رسائل مجتمعات التلجرام**.

---

## 🚀 كيفية التفعيل والرفع على GitHub

### الخطوة 1: رفع المشروع إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit: Multi-Podcast AI Marketing Agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/simplecast-ai-marketing-agent.git
git push -u origin main
```

---

### الخطوة 2: إضافة المفاتيح في GitHub Secrets
في مستودعك على GitHub، اذهب إلى:  
**Settings** ⚙️ ➔ **Secrets and variables** ➔ **Actions** ➔ اضغط على **New repository secret**

أضف الأسرار التالية:

1. `SIMPLECAST_RSS_URLS`:  
   ضع روابط الـ RSS لجميع برامج البودكاست الـ 4 مفصولة بفواصل `,` مثل:  
   `https://feeds.simplecast.com/SHOW1_ID, https://feeds.simplecast.com/SHOW2_ID, https://feeds.simplecast.com/SHOW3_ID, https://feeds.simplecast.com/SHOW4_ID`

2. `GEMINI_API_KEY`:  
   مفتاح Gemini API المجاني الخاص بك من [Google AI Studio](https://aistudio.google.com/).

---

### الخطوة 3: تفعيل صلاحيات الكتابة في GitHub Actions
1. اذهب إلى **Settings** ⚙️ ➔ **Actions** ➔ **General**.
2. تحت قسم **Workflow permissions**، اختر: **Read and write permissions**.
3. اضغط **Save**.

---

## 🎯 كيف يعمل في الخلفية؟

* يعمل الـ Actions تلقائياً كل 4 ساعات.
* في كل مرة، يأخذ **5 حلقات** جديدة من الأرشيف (أو من الحلقات الحديثة) لكل البرامج الـ 4، ويولّد الحملات التسويقية ويحفظها في مجلد `campaigns/اسم_البودكاست/`.
* يحفظ الحلقات التي تمت معالجتها في `processed_episodes.json` وينشر التحديث تلقائياً للمستودع لضمان عدم التكرار.
