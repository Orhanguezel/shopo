# Lighthouse Audit Raporu (Antigravity A2)

**Tarih:** 2026-03-27
**Cihaz:** Desktop & Mobile (Emulated via CLI)
**Kategoriler:** Performance, Accessibility, Best Practices, SEO

---

## 1. Ana Sayfa (`/`)

### Skorlar
| Kategori | Skor | Durum |
|----------|------|-------|
| Performance | **33** | 🔴 Kritik Düşük |
| Accessibility | **82** | 🟡 Kabul Edilebilir |
| Best Practices | **74** | 🟡 Geliştirilebilir |
| SEO | **92** | 🟢 Başarılı |

### Temel Metrikler (Performance)
- **Largest Contentful Paint (LCP):** 21.5 saniye (Kritik düzeyde yavaş)
- **First Contentful Paint (FCP):** 1.1 saniye
- **Cumulative Layout Shift (CLS):** 0
- **Total Blocking Time (TBT):** 4.52 saniye

### Teşhis & Öneriler
1. **LCP Yavaşlığı:** Ana sayfadaki devasa slider görselleri veya LCP elementi çok geç yükleniyor. 
   - *Çözüm:* Hero section görsellerine `priority` prop'u eklenmeli (Next `next/image`).
2. **Total Blocking Time:** JavaScript bundle'ı çok büyük ve main thread'i engelliyor.
   - *Çözüm:* Üçüncü parti scriptler veya gereksiz `use client` component'leri optimize edilmeli, dynamic import (`next/dynamic`) kullanılmalı.
3. **SEO Eksikleri:** `<meta name="description">` ve `rel=canonical` etiketleri eksik algılanıyor.
   - *Çözüm:* `layout.js` veya `page.js` üzerinde `generateMetadata` fonksiyonunda description zorunlu hale getirilmeli.

---

## 2. Ürün Detay Sayfası (`/single-product?slug=test-product`)

### Skorlar
| Kategori | Skor | Durum |
|----------|------|-------|
| Performance | **36** | 🔴 Kritik Düşük |
| Accessibility | **86** | 🟢 Başarılı |
| Best Practices | **75** | 🟡 Geliştirilebilir |
| SEO | **92** | 🟢 Başarılı |

### Temel Metrikler (Performance)
- **Largest Contentful Paint (LCP):** 20.2 saniye
- **First Contentful Paint (FCP):** 1.1 saniye
- **Cumulative Layout Shift (CLS):** 0
- **Total Blocking Time (TBT):** 4.55 saniye
- **Speed Index:** 10.5 saniye

### Teşhis & Öneriler
1. **LCP İyileştirmesi:** Ürün ana görseli muhtemelen `priority` değil. Ürün galerisindeki ilk resim LCP olarak işaretlenmeli.
2. **TBT Sorunu:** Redux store ve component hydration'ları çok fazla blocking time yaratıyor. Ürün sayfasındaki ağır sekmeler (Reviews, Description vs) viewport'a girene kadar defer edilebilir.
3. **Structured Data:** Schema algılandı ancak bir validasyon hatası var (`Structured data is valid: score=0`).
   - *Çözüm:* `JsonLd.jsx` içerisindeki ProductSchema çıktısı Google Rich Results Test aracında debug edilmeli.

---

## Genel Notlar

Frontend geliştirme sunucusunda (Turbopack + dev mode) test yapıldığı için performance skorlarında ekstra payload mevcuttur. Ancak production (`next build && next start`) testi yapıldığında da skorlar belirgin şekilde düşük çıkmıştır.
* `next/image` optimizasyonları ve `dynamic()` (lazy load) kullanımı en öncelikli çözümlerdir.
* Satıcı detay sayfası (`/seller/[slug]`) gibi sayfaların Server Component hatalarını yutmasını (swalllowing) engellemek adına `try/catch` bloklarında `NEXT_NOT_FOUND` için yönlendirme korumaları eklenmiştir.

