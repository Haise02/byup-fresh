"""Screenshot Staff + Profilo + Account + scrolled views to catch missing icons."""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'icon-migration-report'
OUT.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:8765'
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

PAGES = [
    ('staff',        'byup%20Staff.html'),
    ('profilo',      'byup%20Profilo.html'),
    ('config',       'byup%20Configurazione%20Completa.html'),
    ('onboarding',   'byup%20Restaurant%20Onboarding.html'),
    ('login',        'byup%20Login.html'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)

    errors = []
    for label, path in PAGES:
        page = ctx.new_page()
        page.on('pageerror', lambda e, l=label: errors.append(f'[{l}] PAGEERROR: {e}'))
        page.on('console', lambda m, l=label: m.type == 'error' and errors.append(f'[{l}] {m.type.upper()}: {m.text}'))
        try:
            page.goto(f'{BASE}/{path}', wait_until='networkidle', timeout=15000)
            page.wait_for_timeout(700)
            page.screenshot(path=str(OUT / f'{label}.png'), full_page=False)
            print(f'  ok  {label}')
        except Exception as e:
            print(f'  FAIL {label}: {e}')
        page.close()

    if errors:
        print('\n--- Console issues ---')
        for e in errors:
            print(e)
    browser.close()
