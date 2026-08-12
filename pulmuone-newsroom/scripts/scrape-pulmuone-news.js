const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://news.pulmuone.co.kr';
const LIST_URL = `${BASE_URL}/pulmuone/newsroom/listPulmuone.do?menu=311`;
const DELAY_MS = 300; // 300ms delay between requests to avoid overloading the server
const MAX_PAGES = 200; // Safety threshold for pagination loop

/**
 * Helper to pause execution for a given duration.
 * @param {number} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format raw date string into YYYY-MM-DD format if possible.
 * @param {string} rawDate 
 * @returns {string}
 */
function formatDate(rawDate) {
  if (!rawDate) return '';
  const datePattern = /(\d{4})[.\s년|-]+(\d{1,2})[.\s월|-]+(\d{1,2})/;
  const match = rawDate.match(datePattern);
  if (match) {
    const yyyy = match[1];
    const mm = match[2].padStart(2, '0');
    const dd = match[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return rawDate.trim();
}

/**
 * Extract news items from page HTML string.
 * @param {string} html 
 * @returns {Array<{category: string, title: string, description: string, date: string, image: string, url: string}>}
 */
function parseNewsItems(html) {
  const items = [];
  
  // Find list block
  const listMatch = html.match(/<div class="fact_list_n01">[\s\S]*?<\/ul>/i);
  if (!listMatch) {
    return items;
  }

  const listHtml = listMatch[0];
  const liMatches = [...listHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)];

  for (const li of liMatches) {
    const liContent = li[1];

    // Title
    const titMatch = liContent.match(/<div class="list_tit">([\s\S]*?)<\/div>/i);
    const title = titMatch ? titMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

    // Title missing check
    if (!title) {
      continue;
    }

    // Detail page URL
    const hrefMatch = liContent.match(/<a\s+[^>]*href=["']([^"']+)["']/i);
    const rawUrl = hrefMatch ? hrefMatch[1].trim() : '';
    let fullUrl = '';
    if (rawUrl) {
      fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    }

    // Thumbnail Image URL
    const imgMatch = liContent.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
    const rawImg = imgMatch ? imgMatch[1].trim() : '';
    let fullImg = '';
    if (rawImg) {
      fullImg = rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    }

    // Description / Summary
    const descMatch = liContent.match(/<div class="list_desc">([\s\S]*?)<\/div>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

    // Date
    const dateMatch = liContent.match(/<div class="list_date">([\s\S]*?)<\/div>/i);
    const rawDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const formattedDate = formatDate(rawDate);

    items.push({
      category: '기업뉴스',
      title,
      description,
      date: formattedDate,
      image: fullImg,
      url: fullUrl
    });
  }

  return items;
}

/**
 * Main scraper function
 * @param {object} options
 * @param {number} [options.maxPagesToScrape] - Optional limit for testing
 */
async function main(options = {}) {
  const maxPagesToScrape = options.maxPagesToScrape || MAX_PAGES;
  console.log('==================================================');
  console.log('풀무원 뉴스룸 기업뉴스 수집을 시작합니다.');
  console.log('==================================================');

  const allNews = [];
  const seenUrls = new Set();
  let pageIndex = 1;

  while (pageIndex <= maxPagesToScrape) {
    const pageUrl = `${LIST_URL}&pageIndex=${pageIndex}`;
    
    try {
      const response = await fetch(pageUrl);
      if (!response.ok) {
        console.error(`[오류] ${pageIndex}페이지 요청 실패 (상태 코드: ${response.status})`);
        break;
      }

      const html = await response.text();
      const pageItems = parseNewsItems(html);

      // Break loop if no news items found on this page
      if (pageItems.length === 0) {
        break;
      }

      let addedCount = 0;
      for (const item of pageItems) {
        if (item.url && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          allNews.push(item);
          addedCount++;
        }
      }

      console.log(`${pageIndex}페이지 수집 완료 (${pageItems.length}건 수집)`);

      // If page had fewer items than standard (6), it might be the last page, but we can continue or let next empty page trigger break
      pageIndex++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`[오류] ${pageIndex}페이지 수집 중 에러 발생:`, error.message);
      break;
    }
  }

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save to data/news.json
  const outputPath = path.join(dataDir, 'news.json');
  fs.writeFileSync(outputPath, JSON.stringify(allNews, null, 2), 'utf8');

  console.log('==================================================');
  console.log(`총 ${allNews.length}건 수집 완료`);
  console.log(`저장 위치: ${outputPath}`);
  console.log('==================================================');
}

// Check command line flags e.g. node scripts/scrape-pulmuone-news.js --test
const isTestMode = process.argv.includes('--test');
main({ maxPagesToScrape: isTestMode ? 3 : MAX_PAGES });
