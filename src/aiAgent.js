import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

let aiInstance = null;

function getAiClient() {
  if (!aiInstance) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    aiInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiInstance;
}

/**
 * Generates a complete viral marketing campaign for a podcast episode using Gemini API.
 * @param {Object} episode Episode details (title, description, audioUrl, pubDate, etc.)
 * @returns {Promise<Object>} Generated marketing campaign package
 */
export async function generateMarketingCampaign(episode) {
  const ai = getAiClient();
  
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

  try {
    // Try gemini-2.0-flash, fallback to gemini-1.5-flash if needed
    let responseText = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      responseText = response.text;
    } catch (e) {
      console.warn('[AI Agent] gemini-2.0-flash error, trying gemini-1.5-flash fallback:', e.message);
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      responseText = response.text;
    }

    console.log(`[AI Agent] Successfully received marketing campaign from Gemini.`);
    
    // Parse JSON response safely
    const campaign = JSON.parse(responseText);
    return campaign;
  } catch (error) {
    console.error('[AI Agent] Error generating campaign via Gemini:', error.message);
    throw error;
  }
}
