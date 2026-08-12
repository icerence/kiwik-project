import urllib.request
import ssl
import re
import json
import sys
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

BASE_URL = 'https://news.pulmuone.co.kr'

def check_url(path):
    url = f"{BASE_URL}{path}"
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as resp:
            content = resp.read().decode('utf-8', errors='replace')
            print(f"  Length: {len(content)}")
            return content
    except Exception as e:
        print(f"  Error: {e}")
        return ""

brochure_html = check_url("/pulmuone/newsroom/listbrochure.do")
notice_html = check_url("/pulmuone/newsroom/listNewsnotice.do")

# Save HTML files for detailed analysis
with open("temp_brochure.html", "w", encoding="utf-8") as f:
    f.write(brochure_html)
with open("temp_notice.html", "w", encoding="utf-8") as f:
    f.write(notice_html)

print("Saved temp_brochure.html and temp_notice.html")
