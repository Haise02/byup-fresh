"""Screenshot the Impostazioni → Menù tab so food-* / drink-* icons are visible."""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'icon-migration-report'
OUT.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:8765'
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)

    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
    page.on('console', lambda m: m.type == 'error' and errors.append(f'{m.type.upper()}: {m.text}'))

    page.goto(f'{BASE}/byup%20Impostazioni.html', wait_until='networkidle', timeout=15000)
    page.wait_for_timeout(700)
    # click the Menù tab
    page.get_by_role('button', name='Menù').first.click()
    page.wait_for_timeout(700)
    page.screenshot(path=str(OUT / 'impostazioni-menu.png'), full_page=False)
    print('  ok  impostazioni-menu')

    if errors:
        print('\n--- Console issues ---')
        for e in errors:
            print(e)
    browser.close()
