import fs from 'fs';
import path from 'path';

/**
 * Generates a complete SEO-optimized GitHub Pages Website in both root / and /docs.
 * @param {Array} episodes List of all processed episode objects with their generated campaigns
 */
export function buildSeoWebsite(allProcessedData) {
  console.log(`[Site Generator] Building SEO GitHub Pages website for ${allProcessedData.length} episode(s)...`);

  const docsDir = './docs';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Prevent Jekyll processing so raw custom HTML is served directly
  fs.writeFileSync('.nojekyll', '', 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

  // 1. Generate Individual Episode SEO Pages
  const episodePages = [];
  
  for (const item of allProcessedData) {
    const { episode, campaign } = item;
    const safeShowSlug = slugify(episode.showTitle);
    const safeEpSlug = slugify(episode.title);
    
    // Create folders in both root and docs
    const rootShowDir = path.join('.', safeShowSlug);
    const docsShowDir = path.join(docsDir, safeShowSlug);

    if (!fs.existsSync(rootShowDir)) fs.mkdirSync(rootShowDir, { recursive: true });
    if (!fs.existsSync(docsShowDir)) fs.mkdirSync(docsShowDir, { recursive: true });

    const pageUrl = `${safeShowSlug}/${safeEpSlug}.html`;
    const htmlContent = generateEpisodeHtml(episode, campaign, pageUrl);

    fs.writeFileSync(path.join(rootShowDir, `${safeEpSlug}.html`), htmlContent, 'utf8');
    fs.writeFileSync(path.join(docsShowDir, `${safeEpSlug}.html`), htmlContent, 'utf8');

    episodePages.push({
      title: episode.title,
      showTitle: episode.showTitle,
      pubDate: episode.pubDate,
      url: pageUrl,
      summary: campaign.highlightsSummary || episode.description.substring(0, 150),
      link: episode.link
    });
  }

  // 2. Generate Main Hub Landing Page in both ROOT (index.html) and docs/index.html
  const indexHtml = generateMainHubHtml(episodePages, allProcessedData);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml, 'utf8');

  // 3. Generate Google Sitemap (sitemap.xml)
  const sitemapXml = generateSitemapXml(episodePages);
  fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'sitemap.xml'), sitemapXml, 'utf8');

  // 4. Generate Robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: https://turky4500.github.io/simplecast-ai-marketing-agent/sitemap.xml\n`;
  fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`[Site Generator] ✅ Successfully generated root index.html and SEO website!`);
}

function generateEpisodeHtml(episode, campaign, pageUrl) {
  const fullCanonicalUrl = `https://turky4500.github.io/simplecast-ai-marketing-agent/${pageUrl}`;
  const seoTitle = `${campaign.googleSeoArticle?.title || episode.title} | ${episode.showTitle}`;
  const seoDesc = campaign.googleSeoArticle?.metaDescription || episode.description.substring(0, 160);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "name": episode.title,
    "description": seoDesc,
    "datePublished": episode.pubDate,
    "url": fullCanonicalUrl,
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": episode.audioUrl || episode.link
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": episode.showTitle,
      "url": episode.showLink || fullCanonicalUrl
    }
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seoTitle)}</title>
  <meta name="description" content="${escapeHtml(seoDesc)}">
  <link rel="canonical" href="${fullCanonicalUrl}">
  
  <meta property="og:title" content="${escapeHtml(seoTitle)}">
  <meta property="og:description" content="${escapeHtml(seoDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${fullCanonicalUrl}">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <style>
    :root {
      --bg-color: #0d1117;
      --card-bg: #161b22;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --border: #30363d;
    }
    body {
      font-family: 'Cairo', sans-serif;
      background-color: var(--bg-color);
      color: var(--text);
      margin: 0;
      padding: 0;
      line-height: 1.8;
    }
    header {
      background: linear-gradient(135deg, #1e1e38 0%, #0d1117 100%);
      border-bottom: 1px solid var(--border);
      padding: 2rem 1rem;
      text-align: center;
    }
    header h1 { margin: 0; font-size: 1.8rem; color: #818cf8; }
    header p { color: var(--text-muted); margin-top: 0.5rem; }
    .container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .back-btn {
      display: inline-block;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .hero-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .hero-card h2 { color: #fff; margin-top: 0; }
    .btn-listen {
      display: inline-block;
      background: var(--accent);
      color: white;
      padding: 0.8rem 1.8rem;
      border-radius: 30px;
      text-decoration: none;
      font-weight: 700;
      margin-top: 1rem;
      transition: background 0.2s;
    }
    .btn-listen:hover { background: var(--accent-hover); }
    .article-section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .threads-grid, .shorts-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    .thread-card, .short-card {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem;
    }
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(episode.showTitle)}</h1>
    <p>بوابتك لاستكشاف واستماع أفضل حلقات البودكاست</p>
  </header>

  <div class="container">
    <a href="../index.html" class="back-btn">← العودة للرئيسية</a>

    <div class="hero-card">
      <h2>${escapeHtml(episode.title)}</h2>
      <p>📅 <strong>تاريخ النشر:</strong> ${episode.pubDate}</p>
      <a href="${episode.link}" target="_blank" class="btn-listen">🎧 استمع للحلقة الآن على Simplecast</a>
    </div>

    <div class="article-section">
      <h3>🔍 مقال الدليل الشامل للحلقة (Google SEO)</h3>
      <div>
        ${renderMarkdownToHtml(campaign.googleSeoArticle?.contentMarkdown || episode.description)}
      </div>
    </div>

    ${campaign.twitterThread ? `
    <div class="article-section">
      <h3>🧵 ملخص X (تويتر)</h3>
      <div class="threads-grid">
        ${campaign.twitterThread.map((t, idx) => `<div class="thread-card"><strong>تغريدة ${idx + 1}:</strong><p>${escapeHtml(t)}</p></div>`).join('')}
      </div>
    </div>` : ''}

    ${campaign.shortVideoScripts ? `
    <div class="article-section">
      <h3>🎬 مقاطع صامتة ورؤوس أقلام (بدون موسيقى)</h3>
      <div class="shorts-grid">
        ${campaign.shortVideoScripts.map((s, idx) => `
          <div class="short-card">
            <h4>${escapeHtml(s.clipTitle)}</h4>
            <p><strong>المشهد:</strong> ${escapeHtml(s.visualDescription)}</p>
            <p><strong>الصوت (الكلام فقط):</strong> ${escapeHtml(s.voiceoverScript)}</p>
            <p><strong>النص على الشاشة:</strong> <code>${escapeHtml(s.onScreenText)}</code></p>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
  </div>

  <footer>
    <p>تم توليد وبناء هذا الموقع تلقائياً بواسطة وكيل الذكاء الاصطناعي البصري والـ SEO 🤖</p>
  </footer>
</body>
</html>`;
}

function generateMainHubHtml(episodePages, allProcessedData) {
  const showsMap = {};
  for (const item of allProcessedData) {
    const show = item.episode.showTitle;
    if (!showsMap[show]) showsMap[show] = [];
    showsMap[show].push(item);
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مركز البودكاست الشامل | دليل الاستماع والحلقات</title>
  <meta name="description" content="المكتبة الشاملة لاستكشاف حلقات البودكاست، المقالات التسويقية المحسنة لجوجل، والنصوص الصوتية المباشرة.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-color: #0d1117;
      --card-bg: #161b22;
      --accent: #6366f1;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --border: #30363d;
    }
    body {
      font-family: 'Cairo', sans-serif;
      background-color: var(--bg-color);
      color: var(--text);
      margin: 0;
      line-height: 1.7;
    }
    .hero {
      background: linear-gradient(135deg, #1e1e38 0%, #0d1117 100%);
      padding: 4rem 1rem;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }
    .hero h1 { font-size: 2.5rem; color: #818cf8; margin-bottom: 0.5rem; }
    .hero p { color: var(--text-muted); font-size: 1.2rem; max-width: 600px; margin: 0 auto; }
    .container { max-width: 1100px; margin: 3rem auto; padding: 0 1rem; }
    .show-section { margin-bottom: 3rem; }
    .show-title { font-size: 1.8rem; color: #fff; border-bottom: 2px solid var(--accent); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .ep-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .ep-card:hover { transform: translateY(-3px); border-color: var(--accent); }
    .ep-card h3 { margin-top: 0; color: #fff; font-size: 1.2rem; }
    .ep-card p { color: var(--text-muted); font-size: 0.95rem; flex-grow: 1; }
    .ep-card a {
      display: inline-block;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      margin-top: 1rem;
    }
    footer { text-align: center; padding: 2rem; border-top: 1px solid var(--border); color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="hero">
    <h1>🎙️ منصة البودكاست المتكاملة</h1>
    <p>دليلك الاستكشافي الشامل للحلقات، المقالات، والمحتوى التسويقي المتوافق مع محركات بحث جوجل</p>
  </div>

  <div class="container">
    ${Object.keys(showsMap).length > 0 ? Object.keys(showsMap).map(showName => `
      <div class="show-section">
        <h2 class="show-title">📌 ${escapeHtml(showName)}</h2>
        <div class="episodes-grid">
          ${showsMap[showName].map(item => `
            <div class="ep-card">
              <h3>${escapeHtml(item.episode.title)}</h3>
              <p>${escapeHtml(item.campaign.highlightsSummary || item.episode.description.substring(0, 120))}...</p>
              <a href="${slugify(showName)}/${slugify(item.episode.title)}.html">اقرأ المقال واستمع للحلقة ←</a>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('') : '<p style="text-align:center;">جاري تحميل وحفظ أول دفعة حلقات...</p>'}
  </div>

  <footer>
    <p>تم التحديث والتوليد تلقائياً بواسطة وكيل الذكاء الاصطناعي عبر GitHub Actions 🤖</p>
  </footer>
</body>
</html>`;
}

function generateSitemapXml(episodePages) {
  const baseUrl = 'https://turky4500.github.io/simplecast-ai-marketing-agent';
  const urls = [
    `${baseUrl}/index.html`,
    ...episodePages.map(p => `${baseUrl}/${p.url}`)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>\n    <loc>${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n')}
</urlset>`;
}

function slugify(text) {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
