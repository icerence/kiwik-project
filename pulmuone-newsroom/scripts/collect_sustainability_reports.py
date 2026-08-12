#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
풀무원 뉴스룸 「지속가능경영보고서」 데이터 수집 및 resources.json 병합 스크립트
target URL: https://news.pulmuone.co.kr/pulmuone/newsroom/listReport.do
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

# UTF-8 stdout configuration
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

BASE_URL = 'https://news.pulmuone.co.kr'
LIST_URL = f'{BASE_URL}/pulmuone/newsroom/listReport.do'

def print_log(msg):
    print(msg, flush=True)

def fetch_url(url, retries=3, delay=0.1):
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
            time.sleep(0.5 * (attempt + 1))
    return None

def parse_report_page(page_index):
    url = f"{LIST_URL}?pageIndex={page_index}"
    html_content = fetch_url(url)
    if not html_content:
        return [], 0

    # 1. Remove HTML comments to avoid parsing commented-out legacy blocks
    clean_html = re.sub(r'<!--.*?-->', '', html_content, flags=re.S)

    # 2. Extract report list container <ul id="report_list">
    ul_match = re.search(r'<ul[^>]*id=["\']report_list["\'][^>]*>(.*?)</ul>', clean_html, re.S)
    if not ul_match:
        # Fallback to class="report_list"
        ul_match = re.search(r'<ul[^>]*class=["\'][^"\']*report_list[^"\']*["\'][^>]*>(.*?)</ul>', clean_html, re.S)

    if not ul_match:
        return [], 0

    ul_body = ul_match.group(1)
    lis = re.findall(r'<li[^>]*>(.*?)</li>', ul_body, re.S)

    items = []
    for li in lis:
        tit_match = re.search(r'<div[^>]*class=["\']tit["\'][^>]*>(.*?)</div>', li, re.S)
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', li, re.S)
        
        # Download links onclick fileDownload('1','3880') etc.
        downloads = re.findall(r'<a[^>]+onclick=["\']fileDownload\(([^)]+)\)["\'][^>]*>(.*?)</a>', li, re.S)

        title = html.unescape(re.sub(r'<[^>]+>', '', tit_match.group(1)).strip()) if tit_match else ""
        img_src = img_match.group(1).strip() if img_match else ""

        # Filter out empty or template placeholders
        if not title or title == "'+item.title+'" or "item.id_bbs" in li:
            continue

        # Build absolute image URL
        image_url = ""
        if img_src:
            image_url = urllib.parse.urljoin(BASE_URL, img_src)

        # Extract publication year
        year_match = re.search(r'(\d{4})', title)
        year = year_match.group(1) if year_match else ""

        # Build attachments
        attachments = []
        for args_str, label_raw in downloads:
            label = html.unescape(re.sub(r'<[^>]+>', '', label_raw).strip())
            # args_str: "'1','3880'" or "'2','3880'" or "'1',1910"
            args = [a.strip().strip("'\"") for a in args_str.split(',')]
            if len(args) >= 2:
                filetype, id_bbs = args[0], args[1]
                dl_url = f"{BASE_URL}/pulmuone/common/fileDownload.do?filetype={filetype}&id_bbs={id_bbs}"
                
                # Format name nicely
                name_ext = f"{title} {label}.pdf" if not label.lower().endswith('.pdf') else label
                attachments.append({
                    "name": name_ext,
                    "url": dl_url
                })

        primary_url = attachments[0]['url'] if attachments else ""

        report_item = {
            "category": "지속가능경영보고서",
            "number": None,
            "title": title,
            "description": "",
            "content": "",
            "date": "",
            "year": year,
            "image": image_url,
            "url": primary_url,
            "attachments": attachments
        }
        items.append(report_item)

    # Detect pagination info from pageGo calls
    page_gos = set(re.findall(r'pageGo\((\d+)\)', html_content))
    max_detected_page = max([int(p) for p in page_gos]) if page_gos else 1

    return items, max_detected_page

def collect_all_reports(max_pages_limit=10):
    print_log("Starting collection of Pulmuone Sustainability Reports (지속가능경영보고서)...")
    all_reports = []
    visited_keys = set()
    
    page = 1
    detected_max = 1
    
    while page <= max_pages_limit:
        print_log(f"Fetching page {page}...")
        items, max_p = parse_report_page(page)
        if max_p > detected_max:
            detected_max = max_p

        if not items:
            print_log(f"Page {page} returned 0 valid items. Stopping pagination.")
            break

        new_items_on_page = 0
        for item in items:
            # Deduplication key
            dedup_key = (item['title'], item['year'], item['url'])
            if dedup_key in visited_keys:
                continue
            visited_keys.add(dedup_key)
            all_reports.append(item)
            new_items_on_page += 1

        print_log(f"  Page {page}: parsed {len(items)} items ({new_items_on_page} new). Total collected: {len(all_reports)}")
        page += 1

    # Sort report items: year descending (numeric)
    all_reports.sort(key=lambda x: int(x['year']) if x['year'].isdigit() else 0, reverse=True)

    print_log(f"\nCollection finished. Total unique reports collected: {len(all_reports)}")
    print_log(f"Detected max pagination index: {detected_max}")
    return all_reports, page - 1

def merge_with_resources(new_reports, resources_filepath):
    if not os.path.exists(resources_filepath):
        print_log(f"[Error] Target file does not exist: {resources_filepath}")
        return False, {}

    with open(resources_filepath, 'r', encoding='utf-8') as f:
        try:
            existing_data = json.load(f)
        except Exception as e:
            print_log(f"[Error] Failed loading {resources_filepath}: {e}")
            return False, {}

    if not isinstance(existing_data, list):
        print_log(f"[Error] {resources_filepath} root content is not a JSON list!")
        return False, {}

    # Separate existing press releases vs existing reports
    press_releases = [item for item in existing_data if item.get('category') == '보도자료실']
    existing_other = [item for item in existing_data if item.get('category') != '보도자료실' and item.get('category') != '지속가능경영보고서']
    existing_reports = [item for item in existing_data if item.get('category') == '지속가능경영보고서']

    print_log(f"Existing resources.json breakdown:")
    print_log(f"  - 보도자료실: {len(press_releases)} items")
    print_log(f"  - 지속가능경영보고서 (existing): {len(existing_reports)} items")
    print_log(f"  - 기타 (existing): {len(existing_other)} items")

    # Build unique key lookup for existing report items
    existing_keys = set()
    for r in existing_reports:
        existing_keys.add(r.get('url'))
        for att in r.get('attachments', []):
            existing_keys.add(att.get('url'))
        existing_keys.add(f"{r.get('title')}_{r.get('year')}")

    merged_reports = list(existing_reports)
    added_count = 0
    duplicate_count = 0

    for rep in new_reports:
        rep_url = rep.get('url')
        rep_key = f"{rep.get('title')}_{rep.get('year')}"
        att_urls = [att.get('url') for att in rep.get('attachments', [])]

        is_dup = (
            rep_url in existing_keys or 
            rep_key in existing_keys or 
            any(au in existing_keys for au in att_urls)
        )

        if is_dup:
            duplicate_count += 1
        else:
            merged_reports.append(rep)
            added_count += 1
            existing_keys.add(rep_url)
            existing_keys.add(rep_key)
            for au in att_urls:
                existing_keys.add(au)

    # Sort merged reports by year descending
    merged_reports.sort(key=lambda x: int(x['year']) if str(x.get('year', '')).isdigit() else 0, reverse=True)

    # Final combined list: press releases first, then sustainability reports, then any other categories
    final_data = press_releases + merged_reports + existing_other

    # Save to resources.json
    with open(resources_filepath, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    stats = {
        "press_releases_count": len(press_releases),
        "reports_count": len(merged_reports),
        "other_count": len(existing_other),
        "total_count": len(final_data),
        "added_count": added_count,
        "duplicate_count": duplicate_count
    }

    return True, stats

def main():
    print_log("=" * 70)
    print_log("Pulmuone Sustainability Report Collector & Merger")
    print_log("=" * 70)

    # 1. Collect report data
    reports, last_page = collect_all_reports(max_pages_limit=10)

    if not reports:
        print_log("[Error] No reports collected! Aborting merge.")
        sys.exit(1)

    # 2. Path to resources.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.dirname(script_dir)
    resources_json_path = os.path.join(workspace_dir, "resources.json")

    # 3. Merge with resources.json
    success, stats = merge_with_resources(reports, resources_json_path)

    if success:
        print_log("\n" + "=" * 70)
        print_log("MERGE SUCCESSFUL!")
        print_log(f"  - Total items in resources.json: {stats['total_count']}")
        print_log(f"  - Category '보도자료실': {stats['press_releases_count']}")
        print_log(f"  - Category '지속가능경영보고서': {stats['reports_count']}")
        print_log(f"  - Added new reports: {stats['added_count']}")
        print_log(f"  - Skipped duplicates: {stats['duplicate_count']}")
        print_log("=" * 70)
    else:
        print_log("[Error] Merge failed.")
        sys.exit(1)

if __name__ == '__main__':
    main()
