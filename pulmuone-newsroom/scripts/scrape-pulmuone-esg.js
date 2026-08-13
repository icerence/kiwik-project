const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://news.pulmuone.co.kr';

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

/**
 * Scrape 기획자료 (listEsg.do)
 */
async function scrapePlanningData(maxPages = 5) {
  console.log('--- 1. 기획자료(listEsg.do) 수집 시작 ---');
  const items = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `${BASE_URL}/pulmuone/newsroom/listEsg.do?pageIndex=${page}`;
    try {
      const res = await fetch(url);
      if (!res.ok) break;
      const html = await res.text();

      const matches = [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)];
      let countOnPage = 0;

      for (const m of matches) {
        const snippet = m[1];
        if (!snippet.includes('viewEsg.do')) continue;

        const hrefMatch = snippet.match(/<a\s+[^>]*href=["']([^"']*viewEsg\.do[^"']*)["']/i);
        const rawUrl = hrefMatch ? hrefMatch[1].trim() : '';
        const fullUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`) : '';

        const imgMatch = snippet.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
        const rawImg = imgMatch ? imgMatch[1].trim() : '';
        const fullImg = rawImg ? (rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : '';

        const titMatch = snippet.match(/<div class="list_tit">([\s\S]*?)<\/div>/i);
        const title = titMatch ? titMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

        const descMatch = snippet.match(/<div class="list_desc">([\s\S]*?)<\/div>/i);
        const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

        const dateMatch = snippet.match(/<div class="list_date">([\s\S]*?)<\/div>/i);
        const rawDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const formattedDate = formatDate(rawDate);

        if (title && fullUrl) {
          items.push({
            category: '기획자료',
            title,
            description: description || '풀무원의 ESG 전략과 주요 실천 사례 기획자료',
            date: formattedDate || '2024-11-11',
            image: fullImg || 'assets/esg-feature.png',
            url: fullUrl
          });
          countOnPage++;
        }
      }

      if (countOnPage === 0) break;

      console.log(`기획자료 ${page}페이지 수집 완료 (${countOnPage}건)`);
      await sleep(250);
    } catch (e) {
      console.error(`기획자료 ${page}페이지 오류:`, e.message);
      break;
    }
  }

  return items;
}

/**
 * Scrape ESG 영상 (listEsgMultimedia.do & listEsgMain.do)
 */
async function scrapeEsgVideos() {
  console.log('--- 2. ESG영상(listEsgMultimedia.do & listEsgMain.do) 수집 시작 ---');
  const items = [];
  const seenUrls = new Set();

  // First fetch from listEsgMain.do swiper slides
  try {
    const resMain = await fetch(`${BASE_URL}/pulmuone/newsroom/listEsgMain.do`);
    const htmlMain = await resMain.text();
    const slideMatches = [...htmlMain.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*class="esg-slide[^"']*">([\s\S]*?)<\/a>/gi)];

    for (const m of slideMatches) {
      const rawUrl = m[1].trim();
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      const snippet = m[2];

      const imgMatch = snippet.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
      const rawImg = imgMatch ? imgMatch[1].trim() : '';
      const fullImg = rawImg ? (rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : '';

      const titMatch = snippet.match(/<div class="esg-slide__title">([\s\S]*?)<\/div>/i);
      const title = titMatch ? titMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

      const dateMatch = snippet.match(/<div class="newsroom-date">([\s\S]*?)<\/div>/i);
      const rawDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const formattedDate = formatDate(rawDate);

      if (title && fullUrl && !seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        items.push({
          category: 'ESG영상',
          title,
          description: '자연순환, 친환경 패키지, 식물성 식품 등 풀무원의 지속가능 ESG 영상 콘텐츠',
          date: formattedDate || '2024-10-15',
          image: fullImg || 'assets/esg-video.png',
          url: fullUrl
        });
      }
    }
  } catch (e) {
    console.error('ESG 메인 영상 수집 오류:', e.message);
  }

  // Next fetch from listEsgMultimedia.do
  try {
    const resMedia = await fetch(`${BASE_URL}/pulmuone/newsroom/listEsgMultimedia.do?pageIndex=1`);
    const htmlMedia = await resMedia.text();
    const mediaMatches = [...htmlMedia.matchAll(/<a\s+[^>]*href=["']([^"']*view(?:Esg|Newsroom)\.do[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];

    for (const m of mediaMatches) {
      const rawUrl = m[1].trim();
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      const title = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');

      if (title && title.length > 5 && !seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        items.push({
          category: 'ESG영상',
          title,
          description: '풀무원 ESG 경영 실천 사례 영상 콘텐츠',
          date: '2024-10-15',
          image: 'assets/esg-video.png',
          url: fullUrl
        });
      }
    }
  } catch (e) {
    console.error('ESG 멀티미디어 수집 오류:', e.message);
  }

  console.log(`ESG영상 총 ${items.length}건 수집 완료`);
  return items;
}

/**
 * Scrape ESG 뉴스 (from listEsgMain.do / newsroom.json)
 */
async function scrapeEsgNews() {
  console.log('--- 3. ESG 뉴스(listEsgMain.do) 수집 시작 ---');
  const items = [];

  try {
    const res = await fetch(`${BASE_URL}/pulmuone/newsroom/listEsgMain.do`);
    const html = await res.text();

    const matches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']*viewNewsroom\.do[^"']*)["'][^>]*class="esg-news__item-inner[^"']*">([\s\S]*?)<\/a>/gi)];

    for (const m of matches) {
      const href = m[1].trim();
      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      const snippet = m[2];

      const imgMatch = snippet.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
      const rawImg = imgMatch ? imgMatch[1].trim() : '';
      const fullImg = rawImg ? (rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : '';

      const titMatch = snippet.match(/<div class="newsroom-title[^"]*">([\s\S]*?)<\/div>/i);
      const title = titMatch ? titMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';

      const dateMatch = snippet.match(/<div class="newsroom-date[^"]*">([\s\S]*?)<\/div>/i);
      const rawDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const formattedDate = formatDate(rawDate);

      const typeMatch = snippet.match(/<div class="newsroom-type[^"]*">([\s\S]*?)<\/div>/i);
      const category = typeMatch ? typeMatch[1].replace(/<[^>]+>/g, '').trim() : '기업뉴스';

      if (title && fullUrl) {
        items.push({
          category,
          title,
          date: formattedDate,
          image: fullImg || 'assets/esg-news-01.png',
          url: fullUrl
        });
      }
    }

    console.log(`ESG 뉴스 수집 완료 (${items.length}건)`);
  } catch (e) {
    console.error('ESG 뉴스 수집 오류:', e.message);
  }

  // Complement from newsroom.json to ensure 8 items
  if (items.length < 8) {
    try {
      const rootJsonPath = path.join(__dirname, '..', 'newsroom.json');
      if (fs.existsSync(rootJsonPath)) {
        const allNews = JSON.parse(fs.readFileSync(rootJsonPath, 'utf8'));
        const esgKeywords = ['ESG', '친환경', '지속가능', '탄소', '재활용', '사회공헌', '동물보호', '노사문화', '생태계'];
        const matchedNews = allNews.filter(n => 
          esgKeywords.some(kw => (n.title && n.title.includes(kw)) || (n.description && n.description.includes(kw)))
        );

        for (const item of matchedNews) {
          if (!items.some(i => i.url === item.url)) {
            items.push({
              category: item.category,
              title: item.title,
              date: item.date,
              image: item.image,
              url: item.url
            });
            if (items.length >= 8) break;
          }
        }
      }
    } catch (e) {
      console.error('newsroom.json 읽기 오류:', e.message);
    }
  }

  return items;
}

async function main() {
  console.log('==================================================');
  console.log('풀무원 ESG 경영 (esg.json) 수집 작업을 시작합니다.');
  console.log('==================================================');

  const featured = await scrapePlanningData(5);
  const videos = await scrapeEsgVideos();
  const news = await scrapeEsgNews();

  const esgData = {
    featured,
    videos,
    news
  };

  const jsonString = JSON.stringify(esgData, null, 2);

  const rootJsonPath = path.join(__dirname, '..', 'esg.json');
  const dataDirPath = path.join(__dirname, '..', 'data');
  const dataEsgPath = path.join(dataDirPath, 'esg.json');

  fs.writeFileSync(rootJsonPath, jsonString, 'utf8');
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath, { recursive: true });
  }
  fs.writeFileSync(dataEsgPath, jsonString, 'utf8');

  console.log('==================================================');
  console.log('ESG 데이터 저장 성공!');
  console.log(`- 대표/기획자료 개수: ${featured.length}건`);
  console.log(`- ESG영상 개수: ${videos.length}건`);
  console.log(`- ESG뉴스 개수: ${news.length}건`);
  console.log(`- 저장 파일: ${rootJsonPath}`);
  console.log('==================================================');
}

main();
