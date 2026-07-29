import fs from 'fs';
import path from 'path';

/**
 * Generates a high-end, professional Light Mode Podcast Website with direct inline MP3 Audio Players.
 * Supports instant client-side search across all 900+ episodes.
 * @param {Array} allProcessedData
 */
export function buildSeoWebsite(allProcessedData) {
  console.log(`[Site Generator] Building Professional Light Mode Podcast Website for ${allProcessedData.length} episode(s)...`);

  const docsDir = './docs';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Prevent Jekyll processing
  fs.writeFileSync('.nojekyll', '', 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

  // 1. Generate Individual Episode Pages
  const episodePages = [];
  
  for (const item of allProcessedData) {
    const { episode, campaign } = item;
    const safeShowSlug = slugify(episode.showTitle);
    const safeEpSlug = slugify(episode.title);
    
    const rootShowDir = path.join('.', safeShowSlug);
    const docsShowDir = path.join(docsDir, safeShowSlug);

    if (!fs.existsSync(rootShowDir)) fs.mkdirSync(rootShowDir, { recursive: true });
    if (!fs.existsSync(docsShowDir)) fs.mkdirSync(docsShowDir, { recursive: true });

    const pageUrl = `${safeShowSlug}/${safeEpSlug}.html`;
    const htmlContent = generateEpisodeHtml(episode, campaign, pageUrl);

    try {
      fs.writeFileSync(path.join(rootShowDir, `${safeEpSlug}.html`), htmlContent, 'utf8');
      fs.writeFileSync(path.join(docsShowDir, `${safeEpSlug}.html`), htmlContent, 'utf8');
    } catch (e) {}

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

  // 2. Generate Main Hub Page in both root index.html and docs/index.html
  const indexHtml = generateMainHubHtml(episodePages, allProcessedData);
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

  console.log(`[Site Generator] ✅ Successfully generated clean Light Mode website for all ${allProcessedData.length} episodes!`);
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
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
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
    <a href="../index.html" class="back-btn">→ العودة إلى قائمة الحلقات</a>

    <div class="player-card">
      <h2>${escapeHtml(episode.title)}</h2>
      <div class="meta-info">
        <span>📅 ${episode.pubDate}</span>
        ${episode.duration ? `<span>⏱️ ${episode.duration}</span>` : ''}
      </div>

      <!-- MP3 Inline Player -->
      <audio controls preload="metadata">
        <source src="${audioFileUrl}" type="audio/mpeg">
        متصفحك لا يدعم مشغل الصوتيات.
      </audio>
    </div>

    <!-- Article Content -->
    <div class="content-box">
      <h3>عن هذه الحلقة</h3>
      <div>
        ${renderMarkdownToHtml(campaign.googleSeoArticle?.contentMarkdown || episode.description)}
      </div>
    </div>
  </div>

  <footer>
    <p>© 2026 جميع الحقوق محفوظة - شبكة البودكاست الصوتية</p>
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

  const totalEpisodesCount = allProcessedData.length;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المكتبة الصوتية الشاملة - البودكاست (${totalEpisodesCount} حلقة)</title>
  <meta name="description" content="استمع مباشرة لأكثر من ${totalEpisodesCount} حلقة بودكاست مع مشغل MP3 ورؤى تحليلية متكاملة.">

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
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
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
    .search-box-container {
      max-width: 600px;
      margin: 1.5rem auto 0;
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
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
    }
    .container {
      max-width: 1150px;
      margin: 3rem auto;
      padding: 0 1rem;
    }
    .show-section {
      margin-bottom: 3.5rem;
    }
    .show-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .show-title-badge {
      display: inline-block;
      background: #eff6ff;
      color: var(--accent);
      font-size: 1.4rem;
      font-weight: 800;
      padding: 0.4rem 1.2rem;
      border-radius: 12px;
      border: 1px solid #dbeafe;
    }
    .show-count {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.95rem;
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
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .ep-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .ep-card h3 {
      margin-top: 0;
      color: var(--text-main);
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.4;
    }
    .ep-card p {
      color: var(--text-muted);
      font-size: 0.92rem;
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
      margin-top: 1.2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .btn-details {
      color: var(--accent);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .btn-details:hover {
      text-decoration: underline;
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
    <h1>🎙️ المكتبة الصوتية الشاملة للبودكاست (${totalEpisodesCount} حلقة)</h1>
    <div class="search-box-container">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 ابحث في جميع الحلقات البالغ عددها ${totalEpisodesCount}..." onkeyup="filterEpisodes()">
    </div>
  </div>

  <div class="container">
    ${Object.keys(showsMap).length > 0 ? Object.keys(showsMap).map(showName => `
      <div class="show-section">
        <div class="show-header">
          <div class="show-title-badge">📌 ${escapeHtml(showName)}</div>
          <span class="show-count">(${showsMap[showName].length} حلقة)</span>
        </div>
        <div class="episodes-grid">
          ${showsMap[showName].map(item => `
            <div class="ep-card" data-title="${escapeHtml(item.episode.title)}" data-show="${escapeHtml(showName)}">
              <div>
                <h3>${escapeHtml(item.episode.title)}</h3>
                <p>${escapeHtml(item.campaign.highlightsSummary || item.episode.description.substring(0, 110))}...</p>
                
                <!-- Direct Inline MP3 Audio Player -->
                <audio controls preload="none">
                  <source src="${item.episode.audioUrl || item.episode.link}" type="audio/mpeg">
                </audio>
              </div>

              <div class="ep-footer">
                <span style="font-size: 0.85rem; color: var(--text-muted);">📅 ${item.episode.pubDate}</span>
                <a href="${slugify(showName)}/${slugify(item.episode.title)}.html" class="btn-details">التفاصيل والقراءة ←</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('') : '<p style="text-align:center;">جاري تحميل الحلقات...</p>'}
  </div>

  <script>
    function filterEpisodes() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.ep-card');
      cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const show = card.getAttribute('data-show').toLowerCase();
        if (title.includes(query) || show.includes(query)) {
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
