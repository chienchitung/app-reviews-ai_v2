import sys
import json
import aiohttp
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
from typing import Optional
import asyncio

@dataclass
class AppInfo:
    name: Optional[str] = None
    link: Optional[str] = None
    platform: str = ""
    search_term: str = ""

async def search_apple_store(session: aiohttp.ClientSession, search_term: str) -> AppInfo:
    base_url = f"https://www.apple.com/tw/search/{search_term}?src=serp"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    app_info = AppInfo(platform="Apple App Store", search_term=search_term)
    
    try:
        async with session.get(base_url, headers=headers) as response:
            if response.status == 200:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                if product_block := soup.find('div', class_='rf-serp-product-description'):
                    if name_tag := product_block.find('h2', class_='rf-serp-productname'):
                        app_info.name = name_tag.get_text(strip=True)
                    if link_tag := product_block.find('a', href=True):
                        app_info.link = link_tag['href']
    except Exception as e:
        print(f"Apple Store search error: {e}", file=sys.stderr)
    
    return app_info

async def search_google_play(session: aiohttp.ClientSession, search_term: str) -> AppInfo:
    base_url = f"https://play.google.com/store/search?q={search_term}&c=apps"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    app_info = AppInfo(platform="Google Play Store", search_term=search_term)
    
    try:
        async with session.get(base_url, headers=headers) as response:
            if response.status == 200:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                if name_div := soup.select_one('div.vWM94c'):
                    app_info.name = name_div.text.strip()
                if link_element := soup.select_one('a[href*="/store/apps/details"]'):
                    app_info.link = f"https://play.google.com{link_element['href']}"
    except Exception as e:
        print(f"Google Play search error: {e}", file=sys.stderr)
    
    return app_info

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No search term provided"}))
        return

    search_term = sys.argv[1]
    
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            search_apple_store(session, search_term),
            search_google_play(session, search_term)
        )
        
        # Convert results to dictionary for JSON serialization
        results_dict = [asdict(result) for result in results]
        print(json.dumps(results_dict))

if __name__ == "__main__":
    asyncio.run(main()) 