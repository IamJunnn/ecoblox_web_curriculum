#!/usr/bin/env python3
"""
Scraper for Roblox Documentation Page
Collects all text data and downloads images from the specified URL
"""

import requests
from bs4 import BeautifulSoup
import os
import json
from urllib.parse import urljoin, urlparse
import time
import hashlib

# Configuration
URL = "https://create.roblox.com/docs/tutorials/curriculums/studio/explore-ui"
OUTPUT_DIR = "roblox_docs_data"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
DATA_FILE = os.path.join(OUTPUT_DIR, "page_data.json")
HTML_FILE = os.path.join(OUTPUT_DIR, "page_content.html")

# Known image URLs from the page
KNOWN_IMAGES = [
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/Mezzanine.jpg",
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/Toolbar.jpg",
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/3D-Viewport.jpg",
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/Toolbox.jpg",
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/Explorer.jpg",
    "https://prod.docsiteassets.roblox.com/assets/tutorials/studio-lesson/Properties.jpg",
]

def create_output_directories():
    """Create output directories if they don't exist"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    print(f"Created output directories: {OUTPUT_DIR} and {IMAGES_DIR}")

def fetch_page(url):
    """Fetch the HTML content of the page"""
    print(f"Fetching page: {url}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    print("Page fetched successfully")
    return response.text

def download_image(img_url, output_dir, is_absolute=True):
    """Download an image from URL with improved error handling"""
    try:
        # Use the URL as-is if it's already absolute
        if is_absolute:
            absolute_url = img_url
        else:
            absolute_url = urljoin(URL, img_url)

        print(f"Downloading: {absolute_url}")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://create.roblox.com/',
            'Connection': 'keep-alive',
        }

        response = requests.get(absolute_url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()

        # Verify we got image content
        content_type = response.headers.get('Content-Type', '')
        if 'image' not in content_type.lower():
            print(f"Warning: Content-Type is {content_type}, may not be an image")

        # Extract filename from URL
        parsed_url = urlparse(absolute_url)
        filename = os.path.basename(parsed_url.path)

        # If filename is empty or invalid, generate one from URL hash
        if not filename or '.' not in filename:
            url_hash = hashlib.md5(absolute_url.encode()).hexdigest()[:8]
            ext = content_type.split('/')[-1] if 'image' in content_type else 'jpg'
            filename = f"image_{url_hash}.{ext}"

        filepath = os.path.join(output_dir, filename)

        # Save the image in binary mode
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        # Verify file was written and has content
        file_size = os.path.getsize(filepath)
        print(f"✓ Saved: {filename} ({file_size:,} bytes)")

        return {
            'url': absolute_url,
            'local_path': filepath,
            'filename': filename,
            'size_bytes': file_size,
            'content_type': content_type,
            'success': True
        }
    except Exception as e:
        print(f"✗ Error downloading {img_url}: {str(e)}")
        return {
            'url': img_url,
            'error': str(e),
            'success': False
        }

def extract_page_data(html, base_url):
    """Extract all text content and image URLs from the page"""
    soup = BeautifulSoup(html, 'html.parser')

    data = {
        'url': base_url,
        'title': '',
        'sections': [],
        'images': [],
        'tables': [],
        'links': [],
        'metadata': {}
    }

    # Extract title
    title_tag = soup.find('title')
    if title_tag:
        data['title'] = title_tag.text.strip()

    # Extract main heading
    h1_tag = soup.find('h1')
    if h1_tag:
        data['metadata']['main_heading'] = h1_tag.text.strip()

    # Extract all sections (by headings)
    print("Extracting sections...")
    for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        section = {
            'level': heading.name,
            'title': heading.text.strip(),
            'content': []
        }

        # Get content after this heading until next heading
        for sibling in heading.find_next_siblings():
            if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                break

            if sibling.name == 'p':
                section['content'].append({
                    'type': 'paragraph',
                    'text': sibling.text.strip()
                })
            elif sibling.name in ['ul', 'ol']:
                items = [li.text.strip() for li in sibling.find_all('li')]
                section['content'].append({
                    'type': 'list',
                    'items': items
                })
            elif sibling.name == 'table':
                # Handle tables separately
                pass

        if section['content']:
            data['sections'].append(section)

    # Extract all images
    print("Extracting images...")
    for img in soup.find_all('img'):
        img_data = {
            'src': img.get('src', ''),
            'alt': img.get('alt', ''),
            'title': img.get('title', ''),
            'absolute_url': urljoin(base_url, img.get('src', ''))
        }
        data['images'].append(img_data)

    # Extract all tables
    print("Extracting tables...")
    for table in soup.find_all('table'):
        table_data = {
            'headers': [],
            'rows': []
        }

        # Extract headers
        headers = table.find_all('th')
        if headers:
            table_data['headers'] = [th.text.strip() for th in headers]

        # Extract rows
        for tr in table.find_all('tr'):
            cells = tr.find_all(['td', 'th'])
            if cells:
                row = [cell.text.strip() for cell in cells]
                table_data['rows'].append(row)

        data['tables'].append(table_data)

    # Extract all links
    print("Extracting links...")
    for link in soup.find_all('a', href=True):
        data['links'].append({
            'text': link.text.strip(),
            'href': link['href'],
            'absolute_url': urljoin(base_url, link['href'])
        })

    return data

def save_json_data(data, filepath):
    """Save extracted data to JSON file"""
    print(f"Saving data to {filepath}")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Data saved successfully")

def main():
    """Main execution function"""
    print("=" * 70)
    print("Roblox Documentation Scraper - Enhanced Version")
    print("=" * 70)

    # Create output directories
    create_output_directories()

    # Fetch the page
    html = fetch_page(URL)

    # Save raw HTML for reference
    print(f"\nSaving raw HTML to {HTML_FILE}")
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(html)

    # Extract data
    print("\nExtracting page data...")
    page_data = extract_page_data(html, URL)

    # Collect all image URLs (from parsed data + known images)
    all_image_urls = set()

    # Add images found in HTML
    for img_data in page_data['images']:
        if img_data['absolute_url']:
            all_image_urls.add(img_data['absolute_url'])

    # Add known images from the documentation
    for known_img in KNOWN_IMAGES:
        all_image_urls.add(known_img)

    # Download all images
    print(f"\n{'=' * 70}")
    print(f"Downloading {len(all_image_urls)} images...")
    print("=" * 70)
    downloaded_images = []

    for idx, img_url in enumerate(sorted(all_image_urls), 1):
        print(f"\n[{idx}/{len(all_image_urls)}]")
        result = download_image(img_url, IMAGES_DIR, is_absolute=True)
        downloaded_images.append(result)
        time.sleep(0.7)  # Be polite to the server

    # Update page data with download results
    page_data['downloaded_images'] = downloaded_images

    # Save all data to JSON
    save_json_data(page_data, DATA_FILE)

    # Calculate statistics
    successful_downloads = [i for i in downloaded_images if i.get('success', False)]
    failed_downloads = [i for i in downloaded_images if not i.get('success', False)]
    total_size = sum(i.get('size_bytes', 0) for i in successful_downloads)

    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Title: {page_data['title']}")
    print(f"Sections extracted: {len(page_data['sections'])}")
    print(f"Tables extracted: {len(page_data['tables'])}")
    print(f"Links extracted: {len(page_data['links'])}")
    print(f"\nImages:")
    print(f"  - Found in HTML: {len(page_data['images'])}")
    print(f"  - Total unique URLs: {len(all_image_urls)}")
    print(f"  - Successfully downloaded: {len(successful_downloads)}")
    print(f"  - Failed: {len(failed_downloads)}")
    print(f"  - Total size: {total_size:,} bytes ({total_size / 1024 / 1024:.2f} MB)")

    if failed_downloads:
        print(f"\nFailed downloads:")
        for failed in failed_downloads:
            print(f"  ✗ {failed['url']}")
            print(f"    Error: {failed.get('error', 'Unknown')}")

    print(f"\nOutput:")
    print(f"  - Directory: {OUTPUT_DIR}")
    print(f"  - HTML file: {HTML_FILE}")
    print(f"  - JSON data: {DATA_FILE}")
    print(f"  - Images: {IMAGES_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nError: {str(e)}")
        import traceback
        traceback.print_exc()
