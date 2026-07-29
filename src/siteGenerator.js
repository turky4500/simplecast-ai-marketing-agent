import fs from 'fs';
import path from 'path';

const ADSENSE_SCRIPT = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7778135355055222" crossorigin="anonymous"></script>`;

const ADSENSE_BANNER = `
<div style="margin: 1.5rem 0; text-align: center;">
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-7778135355055222"
       data-ad-slot="auto"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>`;

const ADS_TXT_CONTENT = `google.com, pub-7778135355055222, DIRECT, f08c47fec0942fa0\n`;

/**
 * Generates a high-end, professional Light Mode Podcast Website with 100% working clean URLs.
 * @param {Array} allProcessedData
 */
export function buildSeoWebsite(allProcessedData) {
  console.log(`[Site Generator] Building AdSense Monetized Website for ${allProcessedData.length} episode(s)...`);

  const docsDir = './docs';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Prevent Jekyll processing
  fs.writeFileSync('.nojekyll', '', 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

  // Write ads.txt for AdSense verification
  fs.writeFileSync('ads.txt', ADS_TXT_CONTENT, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'ads.txt'), ADS_TXT_CONTENT, 'utf8');

  // Group episodes by show name
  const showsMap = {};
  const episodePages = [];

  for (let i = 0; i < allProcessedData.length; i++) {
    const item = allProcessedData[i];
    const { episode, campaign } = item;
    const show = episode.showTitle;
    
    const safeShowSlug = slugify(episode.showTitle);
    const epCleanSlug = slugify(episode.title) || `ep-${i + 1}`;
    
    // Assign calculated slugs to item
    item.showSlug = safeShowSlug;
    item.epSlug = epCleanSlug;

    if (!showsMap[show]) showsMap[show] = [];
    showsMap[show].push(item);

    const rootShowDir = path.join('.', safeShowSlug);
    const docsShowDir = path.join(docsDir, safeShowSlug);

    if (!fs.existsSync(rootShowDir)) fs.mkdirSync(rootShowDir, { recursive: true });
    if (!fs.existsSync(docsShowDir)) fs.mkdirSync(docsShowDir, { recursive: true });

    const pageUrl = `${safeShowSlug}/${epCleanSlug}.html`;
    const htmlContent = generateEpisodeHtml(episode, campaign, pageUrl);

    try {
      fs.writeFileSync(path.join(rootShowDir, `${epCleanSlug}.html`), htmlContent, 'utf8');
      fs.writeFileSync(path.join(docsShowDir, `${epCleanSlug}.html`), htmlContent, 'utf8');
    } catch (e) {
      console.error(`Error writing file for ${safeEpSlug}:`, e.message);
    }

    episodePages.push({
      title: episode.title,
      showTitle: episode.showTitle,
      pubDate: episode.pubDate,
      audioUrl: episode.audioUrl || episode.link,
      duration: episode.duration || '',
      url: pageUrl,
      summary: campaign.highlightsSummary || episode.description.substring(0, 150),
      link: episode.link
    });
  }

  // 1. Generate Dedicated Show Pages (showSlug/index.html)
  for (const showName of Object.keys(showsMap)) {
    const showItems = showsMap[showName];
    const safeShowSlug = slugify(showName);
    const showHtml = generateDedicatedShowHtml(showName, showItems);

    const rootShowDir = path.join('.', safeShowSlug);
    const docsShowDir = path.join(docsDir, safeShowSlug);

    fs.writeFileSync(path.join(rootShowDir, 'index.html'), showHtml, 'utf8');
    fs.writeFileSync(path.join(docsShowDir, 'index.html'), showHtml, 'utf8');
  }

  // 2. Generate Main Hub Page (index.html)
  const indexHtml = generateMainHubHtml(showsMap, allProcessedData.length);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml, 'utf8');

  // 3. Generate Sitemap XML
  const sitemapXml = generateSitemapXml(episodePages);
  fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'sitemap.xml'), sitemapXml, 'utf8');

  // 4. Generate Robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: https://turky4500.github.io/simplecast-ai-marketing-agent/sitemap.xml\n`;
  fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`[Site Generator] ✅ 100% bulletproof URLs generated for all ${allProcessedData.length} episodes!`);
}

function generateMainHubHtml(showsMap, totalEpisodesCount) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المكتبة الصوتية للبودكاست</title>
  <meta name="description" content="استمع لأحدث حلقات البودكاست واستكشف الأرشيف الشامل مع مشغل MP3 المباشر.">

  <!-- Google AdSense Script -->
  ${ADSENSE_SCRIPT}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    body {
      font-family: 'Cairo', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      line-height: 1.7;
    }
    .top-bar {
      background-color: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 2.5rem 1rem;
      text-align: center;
      box-shadow: var(--shadow);
    }
    .top-bar h1 {
      font-size: 2.2rem;
      color: var(--accent);
      margin: 0;
      font-weight: 800;
    }
    .container {
      max-width: 1100px;
      margin: 3rem auto;
      padding: 0 1rem;
    }
    .show-section {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 3rem;
      box-shadow: var(--shadow);
    }
    .show-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .show-title-badge {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--accent);
    }
    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .ep-card {
      background: var(--bg-color);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ep-card h3 {
      margin-top: 0;
      color: var(--text-main);
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.4;
    }
    .ep-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
      flex-grow: 1;
      margin-bottom: 1rem;
    }
    audio {
      width: 100%;
      margin-top: 0.8rem;
      outline: none;
    }
    .ep-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 0.8rem;
      border-top: 1px solid var(--border);
    }
    .btn-details {
      color: var(--accent);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.88rem;
    }
    .btn-details:hover { text-decoration: underline; }
    
    .btn-view-all {
      display: block;
      width: 100%;
      text-align: center;
      background: #eff6ff;
      color: var(--accent);
      border: 1px solid #dbeafe;
      padding: 0.9rem 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 800;
      font-size: 1rem;
      margin-top: 1.8rem;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-view-all:hover {
      background: #dbeafe;
      transform: translateY(-2px);
    }

    footer {
      text-align: center;
      padding: 2.5rem;
      border-top: 1px solid var(--border);
      background: #ffffff;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <h1>🎙️ المكتبة الصوتية للبودكاست</h1>
  </div>

  <div class="container">
    ${ADSENSE_BANNER}

    ${Object.keys(showsMap).map(showName => {
      const allItems = showsMap[showName];
      const top2Items = allItems.slice(0, 2);
      const safeShowSlug = slugify(showName);

      return `
      <div class="show-section">
        <div class="show-header">
          <div class="show-title-badge">📌 ${escapeHtml(showName)}</div>
        </div>

        <div class="episodes-grid">
          ${top2Items.map(item => `
            <div class="ep-card">
              <div>
                <h3>${escapeHtml(item.episode.title)}</h3>
                <p>${escapeHtml(item.campaign.highlightsSummary || item.episode.description.substring(0, 110))}...</p>
                
                <audio controls preload="none">
                  <source src="${item.episode.audioUrl || item.episode.link}" type="audio/mpeg">
                </audio>
              </div>

              <div class="ep-footer">
                <span style="font-size: 0.85rem; color: var(--text-muted);">📅 ${item.episode.pubDate}</span>
                <a href="${safeShowSlug}/${item.epSlug}.html" class="btn-details">التفاصيل والقراءة ←</a>
              </div>
            </div>
          `).join('')}
        </div>

        <a href="${safeShowSlug}/index.html" class="btn-view-all">
          🔍 استعرض كامل الحلقات (${allItems.length} حلقة) ←
        </a>
      </div>
      `;
    }).join('')}

    ${ADSENSE_BANNER}
  </div>

  <footer>
    <p>© 2026 جميع الحقوق محفوظة - شبكة البودكاست الصوتية</p>
  </footer>
</body>
</html>`;
}

function generateDedicatedShowHtml(showName, showItems) {
  const safeShowSlug = slugify(showName);
  
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>جميع حلقات ${escapeHtml(showName)} (${showItems.length} حلقة)</title>
  <meta name="description" content="الأرشيف الكامل لحلقات بودكاست ${escapeHtml(showName)} مع مشغل MP3 مباشر للجميع.">

  <!-- Google AdSense Script -->
  ${ADSENSE_SCRIPT}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --accent: #2563eb;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    body {
      font-family: 'Cairo', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      line-height: 1.7;
    }
    .header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 2.5rem 1rem;
      text-align: center;
      box-shadow: var(--shadow);
    }
    .header h1 { color: var(--accent); margin: 0 0 0.5rem 0; font-size: 2rem; }
    .search-input {
      width: 100%;
      max-width: 500px;
      padding: 0.8rem 1.4rem;
      border-radius: 30px;
      border: 2px solid var(--border);
      font-family: 'Cairo', sans-serif;
      font-size: 1rem;
      outline: none;
      margin-top: 1rem;
    }
    .search-input:focus { border-color: var(--accent); }
    .container { max-width: 1150px; margin: 3rem auto; padding: 0 1rem; }
    .back-btn {
      display: inline-block;
      color: var(--accent);
      text-decoration: none;
      font-weight: 700;
      margin-bottom: 2rem;
    }
    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .ep-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ep-card h3 { margin-top: 0; color: var(--text-main); font-size: 1.15rem; }
    .ep-card p { color: var(--text-muted); font-size: 0.9rem; flex-grow: 1; }
    audio { width: 100%; margin-top: 0.8rem; outline: none; }
    .ep-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 0.8rem;
      border-top: 1px solid var(--border);
    }
    .btn-details { color: var(--accent); text-decoration: none; font-weight: 700; font-size: 0.88rem; }
    footer { text-align: center; padding: 2.5rem; border-top: 1px solid var(--border); background: #ffffff; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="header">
    <h1>📌 ${escapeHtml(showName)}</h1>
    <p>الأرشيف الكامل (${showItems.length} حلقة)</p>
    <input type="text" id="searchInput" class="search-input" placeholder="🔍 ابحث في حلقات هذا البودكاست..." onkeyup="filterEpisodes()">
  </div>

  <div class="container">
    <a href="../index.html" class="back-btn">← العودة إلى الصفحة الرئيسية</a>

    ${ADSENSE_BANNER}

    <div class="episodes-grid">
      ${showItems.map(item => `
        <div class="ep-card" data-title="${escapeHtml(item.episode.title)}">
          <div>
            <h3>${escapeHtml(item.episode.title)}</h3>
            <p>${escapeHtml(item.campaign.highlightsSummary || item.episode.description.substring(0, 110))}...</p>
            
            <audio controls preload="none">
              <source src="${item.episode.audioUrl || item.episode.link}" type="audio/mpeg">
            </audio>
          </div>

          <div class="ep-footer">
            <span style="font-size: 0.85rem; color: var(--text-muted);">📅 ${item.episode.pubDate}</span>
            <a href="${item.epSlug}.html" class="btn-details">التفاصيل والقراءة ←</a>
          </div>
        </div>
      `).join('')}
    </div>

    ${ADSENSE_BANNER}
  </div>

  <script>
    function filterEpisodes() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.ep-card');
      cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        if (title.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>

  <footer>
    <p>© 2026 جميع الحقوق محفوظة - شبكة البودكاست الصوتية</p>
  </footer>
</body>
</html>`;
}

function generateEpisodeHtml(episode, campaign, pageUrl) {
  const fullCanonicalUrl = `https://turky4500.github.io/simplecast-ai-marketing-agent/${pageUrl}`;
  const seoTitle = `${episode.title} - ${episode.showTitle}`;
  const seoDesc = campaign.googleSeoArticle?.metaDescription || episode.description.substring(0, 160);
  const audioFileUrl = episode.audioUrl || episode.link;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "name": episode.title,
    "description": seoDesc,
    "datePublished": episode.pubDate,
    "url": fullCanonicalUrl,
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": audioFileUrl
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": episode.showTitle
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
  
  <!-- Google AdSense Script -->
  ${ADSENSE_SCRIPT}

  <meta property="og:title" content="${escapeHtml(seoTitle)}">
  <meta property="og:description" content="${escapeHtml(seoDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${fullCanonicalUrl}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    body {
      font-family: 'Cairo', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 0;
      line-height: 1.8;
    }
    header {
      background-color: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 1.5rem 1rem;
      text-align: center;
      box-shadow: var(--shadow);
    }
    header h1 { margin: 0; font-size: 1.6rem; color: var(--accent); font-weight: 800; }
    .container {
      max-width: 900px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      color: var(--accent);
      text-decoration: none;
      font-weight: 700;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    .back-btn:hover { text-decoration: underline; }
    .player-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .player-card h2 { color: var(--text-main); margin-top: 0; font-size: 1.6rem; }
    .meta-info {
      display: flex;
      gap: 1.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    audio {
      width: 100%;
      outline: none;
      border-radius: 30px;
    }
    .content-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .content-box h3 {
      color: var(--accent);
      margin-top: 0;
      font-size: 1.3rem;
      border-bottom: 2px solid #eff6ff;
      padding-bottom: 0.5rem;
    }
    .threads-grid, .shorts-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    .thread-card, .short-card {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem;
    }
    footer {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      background: #ffffff;
      margin-top: 4rem;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(episode.showTitle)}</h1>
  </header>

  <div class="container">
    <a href="index.html" class="back-btn">→ العودة إلى أرشيف البودكاست</a>

    <div class="player-card">
      <h2>${escapeHtml(episode.title)}</h2>
      <div class="meta-info">
        <span>📅 ${episode.pubDate}</span>
        ${episode.duration ? `<span>⏱️ ${episode.duration}</span>` : ''}
      </div>

      <audio controls preload="metadata">
        <source src="${audioFileUrl}" type="audio/mpeg">
        متصفحك لا يدعم مشغل الصوتيات.
      </audio>
    </div>

    <!-- AdSense Banner Middle -->
    ${ADSENSE_BANNER}

    <div class="content-box">
      <h3>عن هذه الحلقة</h3>
      <div>
        ${renderMarkdownToHtml(campaign.googleSeoArticle?.contentMarkdown || episode.description)}
      </div>
    </div>

    ${campaign.twitterThread ? `
    <div class="content-box">
      <h3>🧵 ملخص X (تويتر)</h3>
      <div class="threads-grid">
        ${campaign.twitterThread.map((t, idx) => `<div class="thread-card"><strong>تغريدة ${idx + 1}:</strong><p>${escapeHtml(t)}</p></div>`).join('')}
      </div>
    </div>` : ''}

    ${campaign.shortVideoScripts ? `
    <div class="content-box">
      <h3>🎬 مقاطع صامتة ورؤوس أقلام (بدون موسيقى)</h3>
      <div class="shorts-grid">
        ${campaign.shortVideoScripts.map((s, idx) => `
          <div class="short-card">
            <h4 style="margin-top:0; color:var(--accent);">${escapeHtml(s.clipTitle)}</h4>
            <p><strong>المشهد المرئي:</strong> ${escapeHtml(s.visualDescription)}</p>
            <p><strong>الصوت (الكلام فقط):</strong> ${escapeHtml(s.voiceoverScript)}</p>
            <p><strong>النص المكتوب على الشاشة:</strong> <code>${escapeHtml(s.onScreenText)}</code></p>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- AdSense Banner Bottom -->
    ${ADSENSE_BANNER}
  </div>

  <footer>
    <p>© 2026 جميع الحقوق محفوظة - شبكة البودكاست الصوتية</p>
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
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\.\_\:\,\/\?\!\(\)\[\]"'`؟،]/g, '') // Remove dots, colons, question marks, quotes, etc.
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
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
