import React from 'react';
import appConfig from '@/appConfig';

/**
 * JSON-LD structured data component
 * @param {Object} data - Structured data object
 * @returns {JSX.Element}
 */
const JsonLd = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default JsonLd;

/**
 * Generate Product Schema
 * @param {Object} product - Product data from API
 * @returns {Object} JSON-LD structured data
 */
export const generateProductSchema = (product) => {
  if (!product) return null;

  const reviews = product.product?.active_reviews || [];
  const ratingValue = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + parseInt(rev.rating), 0) / reviews.length).toFixed(1)
    : 0;

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.product?.name,
    "image": [appConfig.BASE_URL + product.product?.thumb_image],
    "description": product.product?.short_description || product.product?.seo_description,
    "sku": `PROD-${product.product?.id}`,
    "brand": {
      "@type": "Brand",
      "name": product.product?.brand?.name || "Seyfibaba"
    },
    "offers": {
      "@type": "Offer",
      "url": `${appConfig.APPLICATION_URL}/single-product?slug=${product.product?.slug}`,
      "priceCurrency": "TRY",
      "price": product.product?.offer_price || product.product?.price,
      "priceValidUntil": validUntil.toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.product?.qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.product?.vendor?.shop_name || "Seyfibaba"
      }
    }
  };

  if (reviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
    schema.review = reviews.slice(0, 5).map(rev => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": rev.name },
      "reviewRating": { "@type": "Rating", "ratingValue": rev.rating },
      "reviewBody": rev.review
    }));
  }

  return schema;
};

/**
 * Generate Organization Schema
 * @returns {Object} JSON-LD structured data
 */
export const generateOrganizationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Seyfibaba",
      "url": appConfig.APPLICATION_URL,
      "logo": `${appConfig.APPLICATION_URL}/assets/images/logo.png`,
      "sameAs": [
        "https://facebook.com/seyfibaba",
        "https://instagram.com/seyfibaba",
        "https://twitter.com/seyfibaba",
        "https://linkedin.com/company/seyfibaba",
        "https://youtube.com/@seyfibaba"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-543-501-1995",
        "contactType": "customer service",
        "areaServed": "TR",
        "availableLanguage": "Turkish"
      }
    };
  };

/**
 * Generate Store (LocalBusiness) Schema for Seyfibaba
 * @returns {Object} JSON-LD structured data
 */
export const generateStoreSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Seyfibaba",
    "url": appConfig.APPLICATION_URL,
    "logo": `${appConfig.APPLICATION_URL}/assets/images/logo.png`,
    "image": `${appConfig.BASE_URL}uploads/website-images/logo-2025-12-18-04-53-36-7704.png`,
    "description": "Berber malzemeleri, kuaför malzemeleri, berber koltuğu, kuaför ekipmanları, salon ekipmanları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
    "telephone": "+905435011995",
    "email": "info@seyfibaba.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR",
      "addressLocality": "İstanbul"
    },
    "priceRange": "₺₺",
    "currenciesAccepted": "TRY",
    "paymentAccepted": "Kredi Kartı, Banka Kartı",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://facebook.com/seyfibaba",
      "https://instagram.com/seyfibaba",
      "https://twitter.com/seyfibaba",
      "https://linkedin.com/company/seyfibaba",
      "https://youtube.com/@seyfibaba"
    ]
  };
};

/**
 * Generate BreadcrumbList Schema
 * @param {Array} items - Array of {name, item} objects
 * @returns {Object} JSON-LD structured data
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.item && { "item": item.item.startsWith('http') ? item.item : appConfig.APPLICATION_URL + (item.item.startsWith('/') ? '' : '/') + item.item })
    }))
  };
};

/**
 * Generate FAQ Schema
 * @param {Array} faqs - Array of {question, answer} objects
 * @returns {Object} JSON-LD structured data
 */
export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

/**
 * Generate WebSite Schema for Search Action
 * @returns {Object} JSON-LD structured data
 */
export const generateWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Seyfibaba",
    "url": appConfig.APPLICATION_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${appConfig.APPLICATION_URL}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

/**
 * Generate ItemList Schema for product listings
 * @param {Array} products - Array of product objects
 * @returns {Object} JSON-LD structured data
 */
export const generateItemListSchema = (products) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${appConfig.APPLICATION_URL}/single-product?slug=${product.slug}`
    }))
  };
};

/**
 * Generate Seller (LocalBusiness) Schema
 * @param {Object} seller - Seller data from API
 * @returns {Object|null} JSON-LD structured data
 */
export const generateSellerSchema = (seller) => {
  if (!seller) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": seller.shop_name || seller.name,
    "url": `${appConfig.APPLICATION_URL}/seller/${seller.slug}`,
    "@id": `${appConfig.APPLICATION_URL}/seller/${seller.slug}#business`,
  };

  if (seller.logo) {
    schema.image = seller.logo.startsWith('http')
      ? seller.logo
      : `${appConfig.BASE_URL}${seller.logo}`;
  }

  if (seller.description || seller.seo_description) {
    schema.description = seller.description || seller.seo_description;
  }

  if (seller.email) {
    schema.email = seller.email;
  }

  if (seller.phone) {
    schema.telephone = seller.phone;
  }

  if (seller.address || seller.city) {
    schema.address = {
      "@type": "PostalAddress",
      ...(seller.address && { "streetAddress": seller.address }),
      ...(seller.city && { "addressLocality": seller.city }),
      "addressCountry": "TR",
    };
  }

  if (seller.averageRating && parseFloat(seller.averageRating) > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(seller.averageRating).toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": seller.totalReviews || seller.review_count || 1,
    };
  }

  schema.parentOrganization = {
    "@type": "Organization",
    "name": "Seyfibaba",
    "url": appConfig.APPLICATION_URL,
  };

  return schema;
};
