const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://news.pulmuone.co.kr';
const LIST_URL = `${BASE_URL}/pulmuone/newsroom/listPulmuone.do?menu=314`;
const DELAY_MS = 250;
const MAX_PAGES = 100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

function parseNewsItems(html) {
  const items = [];
  const listMatch = html.match(/<div class="fact_list_n01">[\s\S]*?<\/ul>/i);
  if (!listMatch) {
    return items;
  }

  const listHtml = listMatch[0];
  const liMatches = [...listHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)];

  for (const li of liMatches) {
    const liContent = li[1];

    const titMatch = liContent.match(/<div class="list_tit">([\s\S]*?)<\/div>/i);
    const title = titMatch ? titMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

    if (!title) {
      continue;
    }

    const hrefMatch = liContent.match(/<a\s+[^>]*href=["']([^"']+)["']/i);
    const rawUrl = hrefMatch ? hrefMatch[1].trim() : '';
    let fullUrl = '';
    if (rawUrl) {
      fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    }

    const imgMatch = liContent.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
    const rawImg = imgMatch ? imgMatch[1].trim() : '';
    let fullImg = '';
    if (rawImg) {
      fullImg = rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    }

    const descMatch = liContent.match(/<div class="list_desc">([\s\S]*?)<\/div>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

    const dateMatch = liContent.match(/<div class="list_date">([\s\S]*?)<\/div>/i);
    const rawDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const formattedDate = formatDate(rawDate);

    items.push({
      category: '사회공헌 뉴스',
      title,
      description,
      date: formattedDate,
      image: fullImg,
      url: fullUrl
    });
  }

  return items;
}

async function main(options = {}) {
  const maxPagesToScrape = options.maxPagesToScrape || MAX_PAGES;
  console.log('==================================================');
  console.log('풀무원 뉴스룸 사회공헌 뉴스(menu=314) 데이터 수집을 시작합니다.');
  console.log('==================================================');

  const scrapedSocialNews = [];
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

      if (pageItems.length === 0) {
        break;
      }

      for (const item of pageItems) {
        if (item.url && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          scrapedSocialNews.push(item);
        }
      }

      console.log(`${pageIndex}페이지 수집 완료 (${pageItems.length}건 수집)`);

      pageIndex++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`[오류] ${pageIndex}페이지 수집 중 에러 발생:`, error.message);
      break;
    }
  }

  console.log('==================================================');
  console.log(`사회공헌 뉴스 총 ${scrapedSocialNews.length}건 수집 완료.`);
  console.log('기존 newsroom.json 데이터와 병합을 진행합니다...');

  const rootJsonPath = path.join(__dirname, '..', 'newsroom.json');
  const dataNewsroomPath = path.join(__dirname, '..', 'data', 'newsroom.json');
  const dataNewsPath = path.join(__dirname, '..', 'data', 'news.json');

  let existingData = [];
  if (fs.existsSync(rootJsonPath)) {
    try {
      const raw = fs.readFileSync(rootJsonPath, 'utf8');
      existingData = JSON.parse(raw);
    } catch (e) {
      console.error('[경고] 기존 newsroom.json 읽기 실패:', e.message);
    }
  }

  // Deduplicate and merge by URL
  const mergedMap = new Map();
  let duplicateCount = 0;

  // Add existing data first
  for (const item of existingData) {
    if (item.url) {
      mergedMap.set(item.url, item);
    }
  }

  // Add newly scraped social contribution news
  for (const item of scrapedSocialNews) {
    if (item.url) {
      if (mergedMap.has(item.url)) {
        duplicateCount++;
      } else {
        mergedMap.set(item.url, item);
      }
    }
  }

  const finalData = Array.from(mergedMap.values());

  // Count by category
  const counts = {};
  for (const item of finalData) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }

  // Write to all json locations
  const jsonString = JSON.stringify(finalData, null, 2);
  fs.writeFileSync(rootJsonPath, jsonString, 'utf8');

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataNewsroomPath, jsonString, 'utf8');
  fs.writeFileSync(dataNewsPath, jsonString, 'utf8');

  console.log('==================================================');
  console.log(`병합 성공!`);
  console.log(`- 새로 수집된 사회공헌 뉴스: ${scrapedSocialNews.length}건`);
  console.log(`- 중복 제외된 개수: ${duplicateCount}건`);
  console.log(`- 병합 후 전체 기사 개수: ${finalData.length}건`);
  console.log(`- 카테고리별 기사 분포:`, counts);
  console.log(`- 저장 파일: ${rootJsonPath}`);
  console.log('==================================================');
}

const isTestMode = process.argv.includes('--test');
main({ maxPagesToScrape: isTestMode ? 3 : MAX_PAGES });
