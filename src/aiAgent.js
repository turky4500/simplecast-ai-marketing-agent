import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a complete viral marketing campaign for a podcast episode using Gemini API with automatic rate limit retries.
 * @param {Object} episode Episode details
 * @returns {Promise<Object>} Generated marketing campaign package
 */
export async function generateMarketingCampaign(episode) {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  console.log(`[AI Agent] Generating marketing campaign for episode: "${episode.title}"...`);

  const prompt = `
أنت خبير تسويق إلكتروني محترف ومتخصص في زيادة استماعات وانتشار البودكاست عربياً (Podcast Growth Hacker).
قم بإنشاء خطة وحملة تسويقية متكاملة وجذابة للحلقة التالية من البودكاست المرفوع على Simplecast:

---
عنوان الحلقة: ${episode.title}
اسم البودكاست: ${episode.showTitle}
رابط استماع الحلقة: ${episode.link}
وصف الحلقة والتفاصيل:
${episode.description}
---

🛑 **قواعد ومحددات هامة جداً ويجب الالتزام بها بدقة**:
1. **بدون موسيقى ولا مؤثرات صوتية إطلاقاً (STRICT REQUIREMENT: NO MUSIC & NO SOUND EFFECTS)**: جميع نصوص وسيناريوهات المقاطع القصيرة (Reels/Shorts) يجب أن تعتمد فقط على الكلام المباشر، العناوين النصية المشوقة على الشاشة، والنبرة الصوتية المباشرة.
2. **المنصات المستهدفة**:
   - منصة X (تويتر).
   - مقال محسن لمحركات بحث جوجل (Google SEO Article).
   - نصوص سيناريو المقاطع القصيرة (YouTube Shorts / Instagram Reels / TikTok).
   - رسالة مجتمع التلجرام / النشرة البريدية.
3. **يُمنع منعاً باتاً** التلميح أو إنشاء أي محتوى لمنصة LinkedIn.
4. استخدم لغة عربية فصيحة ومعاصرة، مشوقة وتدفع القارئ للاستماع فوراً للحلقة.

---
يرجى كتابة النتيجة بتنسيق JSON واضح يحتوي على المفاتيح التالية باللغة العربية المحددة:

\`\`\`json
{
  "twitterThread": [
    "تغريدة 1 (الخطاف المشوق Hook + رابط الحلقة)",
    "تغريدة 2 (النقطة الجوهرية الأولى)",
    "تغريدة 3 (اقتباس قوي من الحلقة)",
    "تغريدة 4 (النقطة الجوهرية الثانية)",
    "تغريدة 5 (دعوة للاستماع والمشاركة CTA + رابط الحلقة)"
  ],
  "googleSeoArticle": {
    "title": "عنوان المقال المحسن لـ SEO وجوجل",
    "metaDescription": "الوصف المختصر الموجه لجوجل (Meta Description)",
    "contentMarkdown": "مقال كامل بتنسيق ماركداون (H1, H2, H3, فقرات مشوقة، أسئلة وأجوبة Q&A، ورابط الاستماع للمستمعين عبر جوجل)"
  },
  "shortVideoScripts": [
    {
      "clipTitle": "عنوان المقطع 1",
      "visualDescription": "وصف المشهد المرئي والنص المتحرك على الشاشة",
      "voiceoverScript": "النص الصوتي المباشر للتحدث (بدون أي خلفية موسيقية أو مؤثرات)",
      "onScreenText": "العبارة النصية الكبيرة المكتوبة على الشاشة"
    },
    {
      "clipTitle": "عنوان المقطع 2",
      "visualDescription": "وصف المشهد المرئي",
      "voiceoverScript": "النص الصوتي المباشر للتحدث (بدون أي خلفية موسيقية أو مؤثرات)",
      "onScreenText": "العبارة النصية على الشاشة"
    }
  ],
  "telegramPost": "رسالة تلجرام جذابة ومنسقة بالماركداون مع إيموجيز ودعوة للاستماع ورابط الحلقة",
  "highlightsSummary": "ملخص في 3 أسطر لأبرز فوائد الاستماع لهذه الحلقة"
}
\`\`\`
  `;

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  
  // List of standard Gemini models supported in Google AI Studio Free Tier
  const candidateModels = [
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ];

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[AI Agent] Attempting generation with model: "${modelName}"...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const campaign = JSON.parse(cleanJsonResponse(text));

      console.log(`[AI Agent] ✅ Campaign successfully generated using model "${modelName}"!`);
      return campaign;
    } catch (err) {
      console.warn(`[AI Agent] Model "${modelName}" error:`, err.message);
      lastError = err;
      
      if (err.message && (err.message.includes('429') || err.message.includes('Quota exceeded'))) {
        console.log(`[AI Agent] Short pause 5s due to rate limit on "${modelName}"...`);
        await sleep(5000);
      }
    }
  }

  throw new Error(`All Gemini candidate models failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
}

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}
