import { buildSeoWebsite } from './src/siteGenerator.js';

const initialData = [
  {
    episode: {
      title: "قواعد اللعبه",
      showTitle: "بريد الجمعة للدكتور عبد الوهاب مطاوع",
      link: "https://feeds.simplecast.com/YJUwyG8a",
      audioUrl: "https://cdn.simplecast.com/audio/YJUwyG8a/YJUwyG8a.mp3",
      duration: "25:40",
      pubDate: "2026-07-29",
      description: "حلقة مميزة من بريد الجمعة للدكتور عبد الوهاب مطاوع تناقش قواعد اللعبه والحياة والأبعاد النفسية والاجتماعية."
    },
    campaign: {
      googleSeoArticle: {
        title: "تحليل شامل لحلقة قواعد اللعبه - بريد الجمعة للدكتور عبد الوهاب مطاوع",
        metaDescription: "اقرأ التلخيص الشامل والتحليل النفسي والاجتماعي لحلقة قواعد اللعبه من بريد الجمعة للدكتور عبد الوهاب مطاوع.",
        contentMarkdown: `### مقدمة الحلقة
تناقش هذه الحلقة من **بريد الجمعة** للكاتب الصحفي والدكتور عبد الوهاب مطاوع إحدى الرسائل الإنسانية الخالدة حول فهم قواعد الحياة والتعامل مع التحديات الإنسانية بحكمة وصبر.

### أهم الأفكار والنقاط الجوهرية:
1. فهم السلوك الإنساني والتعامل مع الضغوط.
2. أهمية الصبر والحكمة في اتخاذ القرارات المصيرية.
3. التغلب على عقبات الحياة اليومية بروح إيجابية.`
      },
      highlightsSummary: "حلقة عميقة تناقش السلوك الإنساني وقواعد التعامل في الحياة اليومية مع نصوص إرشادية قيمة."
    }
  },
  {
    episode: {
      title: "الحلقة الأولى - صوت مختلف",
      showTitle: "صوت مختلف",
      link: "https://feeds.simplecast.com/4KjPMcnN",
      audioUrl: "https://cdn.simplecast.com/audio/4KjPMcnN/4KjPMcnN.mp3",
      duration: "18:15",
      pubDate: "2026-07-29",
      description: "حلقة استكشافية من بودكاست صوت مختلف تقدم أفكاراً ورؤى متميزة ومختلفة في الفكر والثقافة."
    },
    campaign: {
      googleSeoArticle: {
        title: "بودكاست صوت مختلف - أفكار ورؤى متميزة",
        metaDescription: "استمع واقرأ ملخص بودكاست صوت مختلف الذي يقدم زوايا جديدة في الفكر والمعرفة.",
        contentMarkdown: "يقدم بودكاست **صوت مختلف** تجربة صوتية وفكرية تهدف لإثراء المعرفة وطرح أسئلة غير تقليدية."
      },
      highlightsSummary: "طرح فكري وثقافي متميز يفتح آفاقاً جديدة في المعرفة."
    }
  },
  {
    episode: {
      title: "في ظلال السيرة - الحلقة الأولى",
      showTitle: "في ظلال السيرة",
      link: "https://feeds.simplecast.com/9raNjZr5",
      audioUrl: "https://cdn.simplecast.com/audio/9raNjZr5/9raNjZr5.mp3",
      duration: "32:10",
      pubDate: "2026-07-29",
      description: "سلسلة قيمة تعيش في ظلال السيرة النبوية الشريفة واستخراج الدروس والعبر منها."
    },
    campaign: {
      googleSeoArticle: {
        title: "في ظلال السيرة النبوية - دروس وعبر قيمة",
        metaDescription: "استكشف دروس السيرة النبوية العطرة مع بودكاست في ظلال السيرة.",
        contentMarkdown: "برنامج **في ظلال السيرة** يأخذنا في رحلة إيمانية وفكرية لاستخراج الدروس والعبر من السيرة النبوية الشريفة."
      },
      highlightsSummary: "دروس وعبر قيمة من السيرة النبوية الشريفة."
    }
  },
  {
    episode: {
      title: "مقدمة كتب صوتية",
      showTitle: "كتب صوتية",
      link: "https://feeds.simplecast.com/jUB1229h",
      audioUrl: "https://cdn.simplecast.com/audio/jUB1229h/jUB1229h.mp3",
      duration: "15:00",
      pubDate: "2026-07-29",
      description: "تسجيلات متميزة لأهم الكتب والمؤلفات العربية والعالمية بصوت نقي وممتع."
    },
    campaign: {
      googleSeoArticle: {
        title: "كتب صوتية - استمع لأهم الكتب والمؤلفات",
        metaDescription: "مكتبة صوتية شاملة تضم قراءات وتسجيلات لأهم الكتب العربية والعالمية.",
        contentMarkdown: "يقدم بودكاست **كتب صوتية** فرصة للاستماع لأمات الكتب والمؤلفات بطريقة مشوقة وميسرة."
      },
      highlightsSummary: "تسجيلات وقراءات متميزة لأهم الكتب العالمية والعربية."
    }
  },
  {
    episode: {
      title: "سيرة الحبيب - الحلقة الأولى",
      showTitle: "سلسلة سيرة الحبيب ـ الشيخ سعيد الكملي",
      link: "https://feeds.simplecast.com/h2a9lppv",
      audioUrl: "https://cdn.simplecast.com/audio/h2a9lppv/h2a9lppv.mp3",
      duration: "40:22",
      pubDate: "2026-07-29",
      description: "سلسلة سيرة الحبيب المصطفى صلى الله عليه وسلم بأسلوب فضيلة الشيخ سعيد الكملي المتمز والشيّق."
    },
    campaign: {
      googleSeoArticle: {
        title: "سلسلة سيرة الحبيب للشيخ سعيد الكملي",
        metaDescription: "استمع لشرح وتفصيل سيرة الحبيب المصطفى صلى الله عليه وسلم بأسلوب الشيخ سعيد الكملي.",
        contentMarkdown: "تتميز **سلسلة سيرة الحبيب** للشيخ سعيد الكملي بالأسلوب البلاغي الممتع والتدقيق العلمي في أحداث السيرة."
      },
      highlightsSummary: "عرض بلاغي وفكري ممتع لسيرة النبي صلى الله عليه وسلم بصوت الشيخ سعيد الكملي."
    }
  }
];

buildSeoWebsite(initialData);
console.log("Built Daylight Theme website with direct MP3 Audio Player for all 5 podcasts successfully!");
