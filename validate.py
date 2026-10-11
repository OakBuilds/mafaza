"""Check deployable static pages; does not claim rendered browser verification."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).parent / 'dist'
MAIN = ['index.html', 'about-us.html', 'consulting.html', 'solutions.html', 'voip.html', 'contact-us.html']

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

pages = {p.relative_to(ROOT).as_posix(): Page(p) for p in ROOT.rglob('*.html')}
checked = 0
for name, page in pages.items():
    ids = [a['id'] for _, a in page.tags if 'id' in a]
    assert len(ids) == len(set(ids)), f'Duplicate ID in {name}'
    for tag, attrs in page.tags:
        if tag == 'img':
            assert 'alt' in attrs, f'Missing image alt in {name}'
            assert 'width' in attrs and 'height' in attrs
        for key in ['href', 'src']:
            raw = attrs.get(key)
            if not raw:
                continue
            u = urlsplit(raw)
            if u.scheme or u.netloc:
                assert u.scheme in ['https', 'mailto'], f'Unsafe URL: {raw}'
                continue
            target = (ROOT / unquote(u.path.lstrip('/'))) if u.path.startswith('/') else (ROOT / name).parent / unquote(u.path)
            if not u.path:
                target = ROOT / name
            if target.is_dir():
                target /= 'index.html'
            assert target.exists(), f'Broken target {name}: {raw}'
            if u.fragment:
                target_page = pages[target.relative_to(ROOT).as_posix()]
                assert any(a.get('id') == unquote(u.fragment) for _, a in target_page.tags), f'Broken anchor {raw}'
            checked += 1
    if name in MAIN:
        assert sum(t == 'h1' for t, _ in page.tags) == 1
        assert sum(t == 'main' for t, _ in page.tags) == 1
        assert any(t == 'meta' and a.get('name') == 'viewport' for t, a in page.tags)
        assert any(t == 'meta' and a.get('name') == 'robots' and 'noindex' in a.get('content', '') for t, a in page.tags)
        assert sum(t == 'a' and a.get('aria-current') == 'page' for t, a in page.tags) == 1
        assert any(a.get('aria-controls') == 'primary-nav' for _, a in page.tags)
        assert 'info@mafazanetwork.com' in (ROOT / name).read_text()

contact = pages['contact-us.html']
labels = {a.get('for') for t, a in contact.tags if t == 'label'}
for t, a in contact.tags:
    if t in ['input', 'select', 'textarea']:
        assert a.get('id') in labels, f'Unlabelled form control {a}'
    if t == 'form':
        assert not a.get('action'), 'Prototype must not transmit inquiries'
solutions = (ROOT / 'solutions.html').read_text()
for term in ['SD-WAN', 'HLD', 'LLD', 'Proof of concept', 'Decommission', 'Project management']:
    assert term.lower() in solutions.lower(), f'Missing essential service: {term}'

css = (ROOT / 'assets/site.css').read_text()
assert css.count('{') == css.count('}')
for width in [1100, 960, 760, 380]:
    assert f'@media(max-width:{width}px)' in css
assert 'prefers-reduced-motion' in css
assert '.header.menu-open .nav' in css
assert 'grid-template-columns:1fr' in css
assert 'overflow-wrap:anywhere' in css
for asset in re.findall(r'url\([\'\"]?(.*?)[\'\"]?\)', css):
    assert (ROOT / 'assets' / asset).exists(), f'Missing CSS asset: {asset}'
assert (ROOT / 'assets/network-infrastructure.webp').stat().st_size < 600_000
assert 'Disallow: /' in (ROOT / 'robots.txt').read_text()
js = (ROOT / 'assets/site.js').read_text()
assert 'fetch(' not in js and 'localStorage' not in js
assert 'reportValidity' in js and 'encodeURIComponent(body)' in js
print(f'Passed: {len(MAIN)} main pages, {len(pages)} HTML routes, {checked} links/assets, metadata, form labels, essential services, responsive rules, privacy checks.')
print('Limit: responsive rules checked statically; rendered browser/device QA unavailable.')
