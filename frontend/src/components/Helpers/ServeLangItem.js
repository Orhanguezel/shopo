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
          Categories: "Kategoriler",
          Main_Menu: "Ana Menü",
          Shop: "Mağaza",
          Pages: "Sayfalar",
          Login: "Giriş Yap",
          Log_In: "Giriş Yap",
          cart: "Sepetim",
          Description: "Açıklama",
          Reviews: "Değerlendirmeler",
          Seller_Info: "Satıcı Bilgisi",
          Share_This: "Paylaş",
          Password: "Şifre",
          Verify: "Doğrula",
          Send: "Gönder",
          Reset: "Sıfırla",
          Clear_Cart: "Sepeti Temizle",
          Update_Cart: "Güncelle",
          Account: "Hesap",
          Track_Order: "Sipariş Takip",
          Forgot_password: "Şifremi Unuttum",
          Reset_Password: "Şifre Sıfırla",
          Create_Account: "Hesap Oluştur",
          Already_have_an_Account: "Zaten hesabınız var mı",
          Dontt_have_an_account: "Hesabınız yok mu",
          sign_up_free: "Ücretsiz Kayıt Ol",
        };
}

export default ServeLangItem;
