#!/usr/bin/env python3
"""
Test script to validate Open Graph tags on the website.
This script checks if all required Open Graph tags are present and valid.
"""

import os
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import argparse
import colorama
from colorama import Fore, Style

# Initialize colorama
colorama.init()

def check_og_tags(url):
    """Check if the page has all required Open Graph tags."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"{Fore.RED}Error fetching {url}: {e}{Style.RESET_ALL}")
        return False

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Required OG tags
    required_tags = [
        'og:title',
        'og:description',
        'og:image',
        'og:url',
        'og:type',
        'og:site_name',
        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image'
    ]
    
    # Optional but recommended tags
    recommended_tags = [
        'og:image:width',
        'og:image:height',
        'og:locale',
        'twitter:site',
        'twitter:creator'
    ]
    
    missing_required = []
    missing_recommended = []
    found_tags = {}
    
    # Check meta tags
    for tag in soup.find_all('meta'):
        prop = tag.get('property', tag.get('name', ''))
        if prop in required_tags or prop in recommended_tags:
            found_tags[prop] = tag.get('content', '')
    
    # Check for missing required tags
    for tag in required_tags:
        if tag not in found_tags:
            missing_required.append(tag)
    
    # Check for missing recommended tags
    for tag in recommended_tags:
        if tag not in found_tags:
            missing_recommended.append(tag)
    
    # Print results
    print(f"\n{Fore.CYAN}Testing Open Graph tags for: {url}{Style.RESET_ALL}")
    
    if missing_required:
        print(f"{Fore.RED}Missing required tags: {', '.join(missing_required)}{Style.RESET_ALL}")
        success = False
    else:
        print(f"{Fore.GREEN}All required tags present!{Style.RESET_ALL}")
        success = True
    
    if missing_recommended:
        print(f"{Fore.YELLOW}Missing recommended tags: {', '.join(missing_recommended)}{Style.RESET_ALL}")
    else:
        print(f"{Fore.GREEN}All recommended tags present!{Style.RESET_ALL}")
    
    # Print found tags
    print(f"\n{Fore.CYAN}Found tags:{Style.RESET_ALL}")
    for tag, content in found_tags.items():
        print(f"{Fore.WHITE}{tag}: {Fore.GREEN}{content}{Style.RESET_ALL}")
    
    # Check image URLs
    if 'og:image' in found_tags:
        image_url = found_tags['og:image']
        if not image_url.startswith(('http://', 'https://')):
            print(f"{Fore.YELLOW}Warning: og:image URL is not absolute: {image_url}{Style.RESET_ALL}")
            image_url = urljoin(url, image_url)
        
        try:
            img_response = requests.head(image_url, timeout=5)
            if img_response.status_code == 200:
                print(f"{Fore.GREEN}Image URL is valid: {image_url}{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}Image URL returns status code {img_response.status_code}: {image_url}{Style.RESET_ALL}")
                success = False
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}Error checking image URL {image_url}: {e}{Style.RESET_ALL}")
            success = False
    
    return success

def main():
    parser = argparse.ArgumentParser(description='Test Open Graph tags on a website')
    parser.add_argument('--url', default='https://eihdah.com', help='Base URL to test')
    parser.add_argument('--pages', nargs='+', default=['/', '/privacy.html', '/terms.html', '/contact.html', '/thanks.html'], 
                        help='Pages to test (relative to base URL)')
    args = parser.parse_args()
    
    all_success = True
    for page in args.pages:
        url = urljoin(args.url, page)
        if not check_og_tags(url):
            all_success = False
    
    if all_success:
        print(f"\n{Fore.GREEN}All tests passed!{Style.RESET_ALL}")
        return 0
    else:
        print(f"\n{Fore.RED}Some tests failed!{Style.RESET_ALL}")
        return 1

if __name__ == '__main__':
    sys.exit(main())