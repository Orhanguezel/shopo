import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
cats = data.get('categories', {})
print('=== LIGHTHOUSE SCORES ===')
for key in ['performance', 'accessibility', 'best-practices', 'seo']:
    c = cats.get(key, {})
    score = c.get('score', 0)
    print(f'{c.get("title", key):20s}: {int(score*100)}')
print()
audits = data.get('audits', {})
print('--- Performance Issues ---')
for a_key in ['largest-contentful-paint', 'cumulative-layout-shift', 'first-contentful-paint', 'total-blocking-time', 'speed-index']:
    a = audits.get(a_key, {})
    print(f'{a.get("title", a_key):35s}: {a.get("displayValue", "N/A")} (score: {int((a.get("score",0) or 0)*100)})')
print()
print('--- SEO Issues ---')
for a_key in ['document-title', 'meta-description', 'hreflang', 'canonical', 'robots-txt', 'structured-data']:
    a = audits.get(a_key, {})
    if a:
        print(f'{a.get("title", a_key):35s}: score={int((a.get("score",0) or 0)*100)} - {a.get("displayValue", "")}')
