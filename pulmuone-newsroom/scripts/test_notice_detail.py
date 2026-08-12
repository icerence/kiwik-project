import urllib.request
import ssl
import sys
import re
import html

sys.stdout.reconfigure(encoding='utf-8')

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
}

def parse_notice_detail(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='replace')

    # Find title
    tit_match = re.search(r'<h3[^>]*class=["\']tit["\'][^>]*>(.*?)</h3>', content, re.S)
    if not tit_match:
        tit_match = re.search(r'<div[^>]*class=["\']tit_area["\'][^>]*>.*?<h\d[^>]*>(.*?)</h\d>', content, re.S)
    if not tit_match:
        tit_match = re.search(r'<title>(.*?)</title>', content, re.S)

    title = html.unescape(re.sub(r'<[^>]+>', '', tit_match.group(1)).strip()) if tit_match else ""

    # Find content / paragraphs
    detail_match = re.search(r'<div[^>]*class=["\'][^"\']*detail[^"\']*["\'][^>]*>(.*?)</div>', content, re.S)
    detail_html = detail_match.group(1) if detail_match else content

    clean_html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', detail_html, flags=re.S|re.I)
    paragraphs = []
    p_tags = re.findall(r'<p[^>]*>(.*?)</p>', clean_html, re.S)
    for p in p_tags:
        p_text = html.unescape(re.sub(r'<[^>]+>', '', p)).strip()
        p_text = re.sub(r'\s+', ' ', p_text)
        if p_text:
            paragraphs.append(p_text)

    summary = paragraphs[0] if paragraphs else ""
    return title, summary

t, s = parse_notice_detail("https://news.pulmuone.co.kr/pulmuone/newsroom/viewNewsroom.do?id=3862")
print(f"Full Title: '{t}'")
print(f"Summary: '{s}'")
