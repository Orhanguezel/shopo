import languageModel from "./../../utils/languageModel";

function ServeLangItem() {
  const langCntnt = languageModel();
  // Ensure we always return an object with default values for SSR compatibility
  return langCntnt && typeof langCntnt === "object"
      ? langCntnt
      : {
          home: "Ana Sayfa",
          Show_more: "Daha Fazla",
          Checkout: "Ödeme",
          Addresses: "Adresler",
          Order_Summary: "Sipariş Özeti",
          Billing_Address: "Fatura Adresi",
          Shipping_Address: "Teslimat Adresi",
          All_Categories: "Tüm Kategoriler",
        };
}

export default ServeLangItem;
