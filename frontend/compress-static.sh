#!/bin/bash
# Pre-compress static files for production
echo "Compressing static assets..."
find .next/static -type f \( -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.svg" \) | while read f; do
  gzip -9 -k -f "$f" 2>/dev/null
done
echo "Done. Compressed files:"
find .next/static -name "*.gz" | wc -l
echo "files created"
