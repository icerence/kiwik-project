#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
풀무원 뉴스룸 「보도자료실」 데이터 수집 스크립트 (실시간 저장 및 이어받기 지원)
target URL: https://news.pulmuone.co.kr/pulmuone/newsroom/listDataroom.do
"""

import urllib.request
import urllib.parse
import ssl
import re
import json
import time
import sys
import os
import html

# Ensure UTF-8 & line buffering
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
}

def print_log(msg):
    print(msg, flush=True)

def fetch_url(url, retries=3, delay=0.05):
    time.sleep(delay)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except Exception as e:
            if attempt == retries - 1:
                print_log(f"[Error] Failed fetching {url} (attempt {attempt+1}/{retries}): {e}")
                return None
            time.sleep(0.3 * (attempt + 1))
    return None

def parse_list_page(page_index):
    url = f"https://news.pulmuone.co.kr/pulmuone/newsroom/listDataroom.do?pageIndex={page_index}"
    html_content = fetch_url(url)
    if not html_content:
        return [], 0
    
    total_pages = 0
    last_page_m = re.search(r'pageGo\((\d+)\)"[^>]*class=["\']last["\']', html_content)
    if last_page_m:
        total_pages = int(last_page_m.group(1))
    else:
        all_pages = [int(p) for p in re.findall(r'pageGo\((\d+)\)', html_content)]
        if all_pages:
            total_pages = max(all_pages)

    table_match = re.search(r'<table[^>]*class=["\'][^"\']*board_list[^"\']*["\'][^>]*>(.*?)</table>', html_content, re.S)
    if not table_match:
        table_match = re.search(r'<table[^>]*>(.*?)</table>', html_content, re.S)
        
    if not table_match:
        return [], total_pages
        
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_match.group(1), re.S)
    items = []
    
    for tr in rows:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
        if len(tds) < 3:
            continue
            
        num_text = re.sub(r'<[^>]+>', '', tds[0]).strip()
        if not num_text.isdigit():
            continue
        number = int(num_text)
        
        title_td = None
        for td in tds[1:]:
            if '<a' in td:
                title_td = td
                break
        if not title_td:
            continue
            
        link_m = re.search(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', title_td, re.S)
        if not link_m:
            continue
            
        rel_url = link_m.group(1).strip()
        raw_title = link_m.group(2)
        clean_title = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', raw_title)).strip())
        
        abs_url = urllib.parse.urljoin('https://news.pulmuone.co.kr/pulmuone/newsroom/', rel_url)
        
        date_text = re.sub(r'<[^>]+>', '', tds[-1]).strip()
        date_m = re.search(r'(\d{4})[.\-년]\s*(\d{1,2})[.\-월]\s*(\d{1,2})', date_text)
        formatted_date = ""
        if date_m:
            formatted_date = f"{date_m.group(1)}-{int(date_m.group(2)):02d}-{int(date_m.group(3)):02d}"
            
        items.append({
            "category": "보도자료실",
            "number": number,
            "title": clean_title,
            "date": formatted_date,
            "url": abs_url
        })
        
    return items, total_pages

def parse_detail_page(url):
    html_content = fetch_url(url)
    if not html_content:
        return {"description": "", "content": "", "image": "", "attachments": []}
        
    detail_match = re.search(r'<div[^>]*class=["\'][^"\']*detail[^"\']*["\'][^>]*>(.*?)</div>\s*</div>\s*(?:<div[^>]*class=["\']data_list|</section>|<div class=["\']reply)', html_content, re.S)
    if not detail_match:
        detail_match = re.search(r'<div[^>]*class=["\'][^"\']*detail[^"\']*["\'][^>]*>(.*?)</div>', html_content, re.S)
        
    detail_html = detail_match.group(1) if detail_match else html_content

    image_url = ""
    img_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', detail_html, re.I)
    for img_src in img_matches:
        if any(skip in img_src.lower() for skip in ['common', 'btn', 'logo', 'sns', 'print', 'icon', 'pop_cancle', 'dimd']):
            continue
        if '/webfile/' in img_src or 'webedit' in img_src or 'bbs' in img_src or img_src.startswith('/'):
            image_url = urllib.parse.urljoin('https://news.pulmuone.co.kr/', img_src.strip())
            break
            
    attachments = []
    data_list_match = re.search(r'<div[^>]*class=["\'][^"\']*data_list[^"\']*["\'][^>]*>(.*?)</div>', html_content, re.S)
    if data_list_match:
        dl_html = data_list_match.group(1)
        file_matches = re.findall(r'fileDownload\(["\'](\d+)["\'],\s*["\'](\d+)["\']\)[^>]*>(.*?)</a>', dl_html, re.S)
        for filetype, f_id, text in file_matches:
            raw_name = re.sub(r'<[^>]+>', '', text).strip()
            clean_name = html.unescape(re.sub(r'\s+', ' ', raw_name).strip())
            att_url = f"https://news.pulmuone.co.kr/pulmuone/common/fileDownload.do?filetype={filetype}&id_bbs={f_id}"
            attachments.append({
                "name": clean_name,
                "url": att_url
            })
            
    clean_html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', detail_html, flags=re.S|re.I)
    
    paragraphs = []
    p_tags = re.findall(r'<p[^>]*>(.*?)</p>', clean_html, re.S)
    for p in p_tags:
        p_text = re.sub(r'&nbsp;', ' ', p)
        p_text = html.unescape(re.sub(r'<[^>]+>', '', p_text)).strip()
        p_text = re.sub(r'\s+', ' ', p_text)
        if p_text:
            paragraphs.append(p_text)
            
    if not paragraphs:
        raw_text = html.unescape(re.sub(r'<[^>]+>', '\n', clean_html))
        for line in raw_text.splitlines():
            line_str = re.sub(r'\s+', ' ', line).strip()
            if line_str and len(line_str) > 10:
                paragraphs.append(line_str)
                
    content_text = "\n\n".join(paragraphs)
    
    description = ""
    for p in paragraphs:
        if len(p) >= 15:
            description = p
            break
    if not description and paragraphs:
        description = paragraphs[0]
        
    return {
        "description": description,
        "content": content_text,
        "image": image_url,
        "attachments": attachments
    }

def save_json(items, output_filepath):
    # Sort items: date descending, then number descending
    sorted_items = sorted(items, key=lambda x: (x['date'], x['number']), reverse=True)
    with open(output_filepath, 'w', encoding='utf-8') as f:
        json.dump(sorted_items, f, ensure_ascii=False, indent=2)

def run_collector(max_pages=None, output_filename="dataroom.json"):
    print_log("=" * 60)
    print_log("Starting Pulmuone Dataroom (보도자료실) Collector")
    print_log("=" * 60)
    
    out_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_filepath = os.path.join(out_dir, output_filename)
    
    collected_items = []
    visited_urls = set()
    visited_numbers = set()
    
    # Load existing progress if available
    if os.path.exists(output_filepath):
        try:
            with open(output_filepath, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if isinstance(existing_data, list):
                    collected_items = existing_data
                    for item in collected_items:
                        visited_urls.add(item['url'])
                        visited_numbers.add(item['number'])
                    print_log(f"[Resume] Loaded {len(collected_items)} existing items from {output_filename}")
        except Exception as e:
            print_log(f"[Warning] Could not load existing file {output_filename}: {e}")
            
    first_items, detected_total = parse_list_page(1)
    if not first_items and not collected_items:
        print_log("[Error] Failed to parse page 1. Aborting.")
        return
        
    total_pages = max_pages if max_pages else detected_total
    print_log(f"[Info] Detected total pages: {detected_total}. Will collect up to page {total_pages}.")
    
    failed_pages = []
    failed_details = []
    
    start_time = time.time()
    
    for page in range(1, total_pages + 1):
        page_items, _ = parse_list_page(page)
        
        if not page_items:
            print_log(f"  [Warning] Page {page} returned 0 items.")
            failed_pages.append(page)
            continue
            
        new_count = 0
        for item in page_items:
            if item['url'] in visited_urls or item['number'] in visited_numbers:
                continue
                
            visited_urls.add(item['url'])
            visited_numbers.add(item['number'])
            
            detail_data = parse_detail_page(item['url'])
            if not detail_data['content'] and not detail_data['description']:
                failed_details.append(item['url'])
                
            merged_item = {
                "category": item['category'],
                "number": item['number'],
                "title": item['title'],
                "description": detail_data['description'],
                "content": detail_data['content'],
                "date": item['date'],
                "image": detail_data['image'],
                "url": item['url'],
                "attachments": detail_data['attachments']
            }
            
            collected_items.append(merged_item)
            new_count += 1
            
        # Save after every page
        save_json(collected_items, output_filepath)
        
        elapsed = time.time() - start_time
        print_log(f"  [Page {page}/{total_pages}] Added {new_count} items. Total: {len(collected_items)} | Elapsed: {elapsed:.1f}s")

    # Final Save
    save_json(collected_items, output_filepath)
    
    print_log("=" * 60)
    print_log(f"Collection Complete! Saved {len(collected_items)} items to:")
    print_log(f"  {output_filepath}")
    print_log("=" * 60)
    
    if collected_items:
        sorted_items = sorted(collected_items, key=lambda x: (x['date'], x['number']), reverse=True)
        newest = sorted_items[0]
        oldest = sorted_items[-1]
        print_log(f"Latest item: #{newest['number']} ({newest['date']}) - {newest['title']}")
        print_log(f"Oldest item: #{oldest['number']} ({oldest['date']}) - {oldest['title']}")
        
    print_log(f"Failed pages ({len(failed_pages)}): {failed_pages}")
    print_log(f"Failed detail URLs ({len(failed_details)}): {len(failed_details)}")

if __name__ == '__main__':
    is_test = '--test' in sys.argv or '-t' in sys.argv
    if is_test:
        print_log("[TEST MODE] Running on 2 pages only.")
        run_collector(max_pages=2, output_filename="dataroom_test.json")
    else:
        print_log("[FULL MODE] Running full collection.")
        run_collector(max_pages=None, output_filename="dataroom.json")
