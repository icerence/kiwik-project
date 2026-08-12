const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://news.pulmuone.co.kr';
const DELAY_MS = 250;

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

function detectLanguage(title) {
  if (!title) return 'KOR';
  if (/[\u3040-\u30ff\u31f0-\u31ff]/.test(title)) return 'JPN'; // Japanese hiragana/katakana
  if (/[\u4e00-\u9faf]/.test(title) && (title.includes('奠基者') || title.includes('圃美多') || title.includes('元敬善'))) return 'CHN'; // Chinese
  if (/^[A-Za-z0-9\s.,!?'"()-]+$/.test(title.trim()) || title.includes('The beginning of') || title.includes('PR Film')) return 'ENG';
  return 'KOR';
}

function parseMultimediaItems(html, category) {
  const items = [];
  const innerBoxes = [...html.matchAll(/<div class="inner_box">([\s\S]*?)<\/div>\s*<\/li>/gi)];

  for (const box of innerBoxes) {
    const snippet = box[1];

    // 1. Title & URL
    const dtMatch = snippet.match(/<dt><a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a><\/dt>/i);
    if (!dtMatch) continue;

    const rawUrl = dtMatch[1].trim();
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

    const title = dtMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (!title) continue;

    // 2. Date
    const ddMatch = snippet.match(/<dd>([\s\S]*?)<\/dd>/i);
    const rawDateText = ddMatch ? ddMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const formattedDate = formatDate(rawDateText);

    // 3. YouTube URL & Video ID from inline script
    let videoUrl = '';
    let youtubeId = '';
    const scriptMatch = snippet.match(/getParams\s*\(\s*['"]([^'"]+)['"]\s*\)/i) || snippet.match(/(https?:\/\/(?:www\.)?youtube\.com\/[^\s"']+)/i);
    if (scriptMatch) {
      const rawYt = scriptMatch[1].trim();
      const ytIdMatch = rawYt.match(/(?:v=|\/embed\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/);
      if (ytIdMatch) {
        youtubeId = ytIdMatch[1];
        videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
      } else if (rawYt.startsWith('http')) {
        videoUrl = rawYt;
      }
    }

    // 4. Image Thumbnail
    let fullImg = '';
    const imgMatch = snippet.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
    if (imgMatch) {
      const rawImg = imgMatch[1].trim();
      if (rawImg && !rawImg.includes('logo') && !rawImg.includes('btn_')) {
        fullImg = rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
      }
    }

    if (!fullImg && youtubeId) {
      fullImg = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    // 5. Language
    const language = detectLanguage(title);

    // 6. Description default / snippet
    let description = '';
    if (category === '회사 동영상') {
      description = `풀무원의 기업 철학과 비전을 소개하는 공식 홍보 영상입니다 (${title}).`;
    } else if (category === 'TV CF') {
      description = `풀무원의 주요 제품과 브랜드 스토리를 전달하는 TV 광고 영상입니다 (${title}).`;
    } else if (category === '바른먹거리 영상') {
      description = `바른먹거리 가치와 올바른 식생활 정보를 전하는 풀무원 캠페인 영상입니다 (${title}).`;
    } else if (category === '그래픽 뉴스') {
      description = `풀무원의 최신 소식과 정보를 한눈에 이해하기 쉽게 정리한 그래픽 카드뉴스입니다 (${title}).`;
    }

    items.push({
      category,
      title,
      description,
      date: formattedDate || '2024-01-01',
      image: fullImg || 'assets/multimedia-01.png',
      url: fullUrl,
      videoUrl: videoUrl || '',
      language: language || 'KOR',
      views: ''
    });
  }

  return items;
}

async function scrapeCategory(categoryName, menuId, maxPagesToScrape) {
  console.log(`--- [${categoryName}] (menu=${menuId}) 수집 시작 ---`);
  const categoryItems = [];
  const seenUrls = new Set();
  let page = 1;

  while (page <= maxPagesToScrape) {
    const pageUrl = `${BASE_URL}/pulmuone/newsroom/listMultimedia.do?menu=${menuId}&pageIndex=${page}`;
    try {
      const res = await fetch(pageUrl);
      if (!res.ok) {
        console.error(`[오류] ${categoryName} ${page}페이지 요청 실패 (상태 코드: ${res.status})`);
        break;
      }

      const html = await res.text();
      const pageItems = parseMultimediaItems(html, categoryName);

      if (pageItems.length === 0) {
        break;
      }

      for (const item of pageItems) {
        if (item.url && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          categoryItems.push(item);
        }
      }

      console.log(`${categoryName} ${page}페이지 수집 완료 (${pageItems.length}건 수집)`);
      page++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`[오류] ${categoryName} ${page}페이지 수집 중 에러:`, error.message);
      break;
    }
  }

  console.log(`=> [${categoryName}] 총 ${categoryItems.length}건 수집 완료 (페이지 수: ${page - 1})\n`);
  return { items: categoryItems, lastPage: page - 1 };
}

async function main() {
  const isTestMode = process.argv.includes('--test');
  const maxPagesToScrape = isTestMode ? 2 : 100;

  console.log('==================================================');
  console.log(`풀무원 멀티미디어(multimedia.json) 수집을 시작합니다. (${isTestMode ? '테스트 모드: 최대 2페이지' : '전체 모드'})`);
  console.log('==================================================\n');

  const categories = [
    { name: '회사 동영상', menu: 341 },
    { name: 'TV CF', menu: 342 },
    { name: '바른먹거리 영상', menu: 343 },
    { name: '그래픽 뉴스', menu: 344 }
  ];

  let allMultimediaItems = [];
  const categoryStats = {};
  const seenUrls = new Set();
  let duplicateCount = 0;

  for (const cat of categories) {
    const result = await scrapeCategory(cat.name, cat.menu, maxPagesToScrape);
    
    let countForCat = 0;
    for (const item of result.items) {
      if (seenUrls.has(item.url)) {
        duplicateCount++;
      } else {
        seenUrls.add(item.url);
        allMultimediaItems.push(item);
        countForCat++;
      }
    }

    categoryStats[cat.name] = {
      menu: cat.menu,
      lastPage: result.lastPage,
      count: countForCat
    };
  }

  const jsonString = JSON.stringify(allMultimediaItems, null, 2);

  const rootJsonPath = path.join(__dirname, '..', 'multimedia.json');
  const dataDirPath = path.join(__dirname, '..', 'data');
  const dataMultimediaPath = path.join(dataDirPath, 'multimedia.json');

  fs.writeFileSync(rootJsonPath, jsonString, 'utf8');
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath, { recursive: true });
  }
  fs.writeFileSync(dataMultimediaPath, jsonString, 'utf8');

  console.log('==================================================');
  console.log('멀티미디어 데이터 수집 및 multimedia.json 저장 성공!');
  console.log(`- 전체 수집 기사 수: ${allMultimediaItems.length}건`);
  console.log(`- 중복 제외 개수: ${duplicateCount}건`);
  console.log('- 카테고리별 수집 결과:');
  for (const [key, val] of Object.entries(categoryStats)) {
    console.log(`  * ${key} (menu=${val.menu}): ${val.count}건 (마지막 페이지: ${val.lastPage}p)`);
  }
  console.log(`- 저장 파일: ${rootJsonPath}`);
  console.log('==================================================');
}

main();
