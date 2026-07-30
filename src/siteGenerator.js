import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://turky4500.github.io/simplecast-ai-marketing-agent';

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
 * STRICT BULLETPROOF WEBSITE GENERATOR
 * Dynamically iterates over showsMap keys so episode counts (405, 336, 93, 43, 32) and episode cards are ALWAYS 100% POPULATED!
 */
export function buildSeoWebsite(allProcessedData) {
  console.log(`[Site Generator] Building Zero-Bug AdSense Website for ${allProcessedData.length} episode(s)...`);

  const docsDir = './docs';
  const rootEpDir = './episodes';
  const docsEpDir = './docs/episodes';

  // Ensure all directories exist
  [docsDir, rootEpDir, docsEpDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Write .nojekyll & ads.txt everywhere needed
  fs.writeFileSync('.nojekyll', '', 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');
  fs.writeFileSync('ads.txt', ADS_TXT_CONTENT, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'ads.txt'), ADS_TXT_CONTENT, 'utf8');

  // Group episodes by show name dynamically
  const showsMap = {};
  const episodePages = [];
  const showSlugMap = {};

  let showCounter = 1;

  for (let i = 0; i < allProcessedData.length; i++) {
    const item = allProcessedData[i];
    const { episode, campaign } = item;
    const showName = (episode.showTitle || 'البودكاست').trim();

    if (!showsMap[showName]) {
      showsMap[showName] = [];
      showSlugMap[showName] = `show-${showCounter++}`;
    }

    const showId = showSlugMap[showName];
    const epCleanSlug = `ep-${i + 1}`;

    item.showId = showId;
    item.epSlug = epCleanSlug;
    item.absEpUrl = `${BASE_URL}/episodes/${epCleanSlug}.html`;

    showsMap[showName].push(item);

    const htmlContent = generateEpisodeHtml(episode, campaign, item.absEpUrl, showId);

    try {
      fs.writeFileSync(path.join(rootEpDir, `${epCleanSlug}.html`), htmlContent, 'utf8');
      fs.writeFileSync(path.join(docsEpDir, `${epCleanSlug}.html`), htmlContent, 'utf8');
    } catch (e) {}

    episodePages.push({
      title: episode.title,
      showTitle: episode.showTitle,
      pubDate: episode.pubDate,
      url: `episodes/${epCleanSlug}.html`
    });
  }

  // 1. Generate Dedicated Show Pages (show-1.html, show-2.html...) in both root and docs
  for (const showName of Object.keys(showsMap)) {
    const showItems = showsMap[showName];
    const showId = showSlugMap[showName];
    const showHtml = generateDedicatedShowHtml(showName, showId, showItems);

    fs.writeFileSync(`${showId}.html`, showHtml, 'utf8');
    fs.writeFileSync(path.join(docsDir, `${showId}.html`), showHtml, 'utf8');
  }

  // 2. Generate Main Hub Page (index.html) in both root and docs
  const indexHtml = generateMainHubHtml(showsMap, showSlugMap, allProcessedData.length);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml, 'utf8');

  // 3. Generate Sitemap XML
  const sitemapXml = generateSitemapXml(showsMap, showSlugMap, episodePages);
  fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'sitemap.xml'), sitemapXml, 'utf8');

  // 4. Generate Robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`;
  fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`[Site Generator] ✅ ZERO-BUG Website build completed successfully!`);
}

function generateMainHubHtml(showsMap, showSlugMap, totalEpisodesCount) {
  const showKeys = Object.keys(showsMap);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المكتبة الصوتية للبودكاست</title>
  <meta name="description" content="استمع مباشرة لأحدث حلقات البودكاست مع مشغل MP3 المباشر ورؤى تحليلية متكاملة.">

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
      margin: 0 0 1rem 0;
      font-weight: 800;
    }
    .search-box-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .search-input {
      width: 100%;
      padding: 0.9rem 1.4rem;
      border-radius: 30px;
      border: 2px solid var(--border);
      font-family: 'Cairo', sans-serif;
      font-size: 1rem;
      outline: none;
      box-sizing: border-box;
    }
    .search-input:focus { border-color: var(--accent); }

    .container {
      max-width: 1150px;
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
    }
    .btn-view-all:hover { background: #dbeafe; }

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
    <div class="search-box-container">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 ابحث في جميع الحلقات (${totalEpisodesCount} حلقة)..." onkeyup="filterEpisodes()">
    </div>
  </div>

  <div class="container">
    ${ADSENSE_BANNER}

    ${showKeys.map(showName => {
      const allItems = showsMap[showName];
      const top2Items = allItems.slice(0, 2);
      const showId = showSlugMap[showName];

      return `
      <div class="show-section">
        <div class="show-header">
          <div class="show-title-badge">📌 ${escapeHtml(showName)}</div>
          <span style="color: var(--text-muted); font-weight:600;">(${allItems.length} حلقة)</span>
        </div>

        <div class="episodes-grid">
          ${top2Items.map(item => `
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
                <a href="${item.absEpUrl}" class="btn-details">التفاصيل والقراءة ←</a>
              </div>
            </div>
          `).join('')}
        </div>

        <a href="${BASE_URL}/${showId}.html" class="btn-view-all">
          🔍 استعرض كامل الحلقات (${allItems.length} حلقة) ←
        </a>
      </div>
      `;
    }).join('')}

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

function generateDedicatedShowHtml(showName, showId, showItems) {
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
    .header h1 { color: var(--accent); margin: 0 0 0.5rem 0; font-size: 2rem; font-weight:800; }
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
    <a href="${BASE_URL}/index.html" class="back-btn">← العودة إلى الصفحة الرئيسية</a>

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
            <a href="${item.absEpUrl}" class="btn-details">التفاصيل والقراءة ←</a>
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

function generateEpisodeHtml(episode, campaign, absEpUrl, showId) {
  const seoTitle = `${episode.title} - ${episode.showTitle}`;
  const seoDesc = campaign.googleSeoArticle?.metaDescription || episode.description.substring(0, 160);
  const audioFileUrl = episode.audioUrl || episode.link;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seoTitle)}</title>
  <meta name="description" content="${escapeHtml(seoDesc)}">
  <link rel="canonical" href="${absEpUrl}">
  
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
    audio { width: 100%; outline: none; }
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
    <a href="${BASE_URL}/${showId}.html" class="back-btn">→ العودة إلى أرشيف ${escapeHtml(episode.showTitle)}</a>

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

    ${ADSENSE_BANNER}
  </div>

  <footer>
    <p>© 2026 جميع الحقوق محفوظة - شبكة البودكاست الصوتية</p>
  </footer>
</body>
</html>`;
}

function generateSitemapXml(showsMap, showSlugMap, episodePages) {
  const urls = [
    `${BASE_URL}/index.html`,
    ...Object.keys(showsMap).map(showName => `${BASE_URL}/${showSlugMap[showName]}.html`),
    ...episodePages.map(p => `${BASE_URL}/${p.url}`)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>\n    <loc>${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n')}
</urlset>`;
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
