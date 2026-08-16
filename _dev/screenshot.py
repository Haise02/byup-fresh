"""Quick visual verification across pages updated with SF Content icons."""
from playwright.sync_api import sync_playwright
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / 'icon-migration-report'
OUT.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:8765'
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

PAGES = [
    ('panoramica',   'byup%20Panoramica.html'),
    ('sala',         'byup%20Sala%20v3.html'),
    ('cucina',       'byup%20Cucina.html'),
    ('statistiche',  'byup%20Statistiche.html'),
    ('contabilita',  'byup%20Contabilita%20v2.html'),
    ('impostazioni', 'byup%20Impostazioni.html'),
    ('account',      'byup%20Account.html'),
    ('supporto',     'byup%20Supporto.html'),
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

    # Preview
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(f'[preview] PAGEERROR: {e}'))
    page.on('console', lambda m: m.type == 'error' and errors.append(f'[preview] {m.type.upper()}: {m.text}'))
    page.goto(f'{BASE}/_dev/icons.html', wait_until='networkidle', timeout=15000)
    page.wait_for_timeout(700)
    page.screenshot(path=str(OUT / 'icons-preview.png'), full_page=True)
    print('  ok  preview')

    if errors:
        print('\n--- Console issues ---')
        for e in errors:
            print(e)
    else:
        print('\nNo console errors.')

    browser.close()
