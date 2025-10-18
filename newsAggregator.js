const axios = require('axios');
const cheerio = require('cheerio');
const sources = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/',
    articleSelector: 'a.post-block__title__link',
    dateSelector: 'time',
    summarySelector: '.post-block__content',
    category: 'AI, Software, Hardware, General'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/tech',
    articleSelector: 'h2.c-entry-box--compact__title a',
    dateSelector: 'time',
    summarySelector: 'p.p-dek',
    category: 'General, Hardware, Software'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/',
    articleSelector: 'a.summary-item__hed-link',
    dateSelector: 'time',
    summarySelector: 'div.summary-item__dek',
    category: 'General, AI, Hardware'
  }
];

async function fetchArticles(source) {
  try {
    const { data } = await axios.get(source.url, { timeout: 10000 });
    const $ = cheerio.load(data);
    const articles = [];
    $(source.articleSelector).slice(0, 5).each((i, el) => {
      const headline = $(el).text().trim();
      const link = $(el).attr('href');
      let date = $(el).closest('article').find(source.dateSelector).attr('datetime') || '';
      let summary = $(el).closest('article').find(source.summarySelector).text().trim();
      if (!summary) summary = headline;
      articles.push({ headline, link, date, summary, source: source.name, category: source.category });
    });
    return articles;
  } catch (err) {
    console.error(`Error fetching from ${source.name}:`, err.message);
    return [];
  }
}

function summarizeArticle(article) {
  // Simple transformation for demo; replace with AI summarization for production
  return {
    headline: article.headline,
    summary: `${article.summary} (BarodaTek summary: ${article.headline})`,
    date: article.date,
    source: article.source,
    category: article.category
  };
}

async function aggregateNews() {
  let allSummaries = [];
  for (const source of sources) {
    const articles = await fetchArticles(source);
    for (const article of articles) {
      // Only include articles from last 48 hours
      if (article.date && new Date(article.date) < Date.now() - 2 * 24 * 60 * 60 * 1000) continue;
      const summary = summarizeArticle(article);
      allSummaries.push(summary);
    }
  }
  return allSummaries;
}

module.exports = { aggregateNews };
