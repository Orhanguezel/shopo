# SEO Layout Stratejisi — "use client" Kaldirma Plani

**Tarih:** 2026-03-27
**Dosya:** `frontend/src/app/(website)/layout.js` → `DefaultLayout.jsx`
**Risk:** YUKSEK — breaking change potansiyeli var
**Oncelik:** ORTA — V1 sonrasi, Lighthouse skorlarina gore karar verilecek

---

## MEVCUT DURUM

```
layout.js (SERVER ✓ — "use client" yok)
└─> DefaultLayout.jsx ("use client" ✗ — tum alt agaci client yapiyor)
    ├─> Layout.jsx ("use client")
    │   ├─> Header (Redux, hooks)
    │   ├─> Footer (Redux data)
    │   └─> Drawer (state)
    ├─> MaintenanceWrapper (Redux — "use client" eksik!)
    ├─> Consent (Redux, cookies — "use client" eksik!)
    ├─> GoogleTagManager ("use client" ✓)
    ├─> AuthenticationModal ("use client" ✓)
    ├─> SimpleFlyingCart ("use client" ✓)
    ├─> FixedCartButton ("use client" ✓)
    └─> MessageWidget ("use client" ✓)
```

**Sorun:** `DefaultLayout.jsx` "use client" oldugundan tum alt agac (Header, Footer dahil) client component olarak render ediliyor. Bu SSR/streaming avantajlarini yok ediyor.

## NEDEN ONEMLI

- Server component layout → ilk HTML aninda gelir (TTFB iyilesir)
- Meta tag'lar server tarafinda render edilir (SEO icin kritik)
- JS bundle kuculur (server-only kod client'a gitmez)
- Core Web Vitals: LCP ve FCP iyilesir

## NEDEN RISKLI

DefaultLayout.jsx su client ozellikleri kullaniyor:
- `usePathname()`, `useSearchParams()` — Next.js navigation
- `useDispatch()` — Redux
- `useState()` x4, `useEffect()` x4, `useCallback()` — React hooks
- `useGetDefaultSetupQuery()` — RTK Query
- `localStorage` + `window` erisimi
- Google Tag Manager, Facebook Pixel, Tawk.to init

## STRATEJI: Katmanli Ayirma

### Adim 1: DefaultLayoutClient.jsx Olustur

```jsx
"use client";
// Tum client-side init logigini buraya tasi:
// - Redux dispatch
// - GTM, FB Pixel, Tawk.to init
// - localStorage operations
// - Navigation hooks
// - RTK Query (website setup)
```

### Adim 2: DefaultLayout.jsx → Server Component

```jsx
// "use client" KALDIR
import DefaultLayoutClient from "./DefaultLayoutClient";

export default function DefaultLayout({ children, childrenClasses }) {
  return (
    <DefaultLayoutClient childrenClasses={childrenClasses}>
      {children}
    </DefaultLayoutClient>
  );
}
```

### Adim 3: Eksik "use client" Ekle

Bu dosyalara "use client" eklenmeli (simdi DefaultLayout'un "use client"i onlari da client yapiyor):
- `MaintenanceWrapper.jsx` — useState, useSelector, useEffect kullaniyor
- `Consent.jsx` — useState, useSelector, useEffect, cookies kullaniyor

### Adim 4: Test

```bash
# 1. Build basarili mi?
bun run build

# 2. Hydration mismatch var mi?
bun run dev → Console'da hata kontrolu

# 3. Tum entegrasyonlar calisiyor mu?
# - GTM event'leri firelaniyor mu?
# - Tawk.to chat widget gorunuyor mu?
# - Redux store dogru dolduruluyor mu?
# - Mesajlasma widget'i aciliyor mu?

# 4. Lighthouse karsilastirmasi
# Onceki vs sonraki skor
```

## KARAR MATRISI

| Kosul | Aksiyon |
|-------|---------|
| Lighthouse Performance < 70 | Hemen yap |
| Lighthouse Performance 70-85 | V1 sonrasi yap |
| Lighthouse Performance > 85 | Ertelenebilir |
| Bot simulator SSR sorunu gosteriyor | Hemen yap |

## TAHMINI ETKI

| Metrik | Beklenen Iyilesme |
|--------|-------------------|
| TTFB | -100ms ~ -300ms |
| FCP | -200ms ~ -500ms |
| LCP | -100ms ~ -200ms |
| JS Bundle | -15% ~ -25% (layout kisminda) |
| Lighthouse Perf | +5 ~ +15 puan |

## NOTLAR

- Bu degisiklik ayri branch'te yapilmali (`refactor/server-layout`)
- Layout.jsx (Header/Footer sarmalayici) "use client" kalacak — bu beklenen
- Esas kazanc: layout shell'in server'dan HTML olarak gelmesi
- Redux Provider zaten `_app` veya root layout'ta tanimli olmali
