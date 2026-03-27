<?php

namespace App\Services;

use App\Models\IyzicoPayment;
use Iyzipay\Model\Address;
use Iyzipay\Model\BasketItem;
use Iyzipay\Model\BasketItemType;
use Iyzipay\Model\Buyer;
use Iyzipay\Model\CheckoutForm;
use Iyzipay\Model\CheckoutFormInitialize;
use Iyzipay\Model\Currency;
use Iyzipay\Model\Locale;
use Iyzipay\Model\PaymentGroup;
use Iyzipay\Model\Refund;
use Iyzipay\Options;
use Iyzipay\Request\CreateCheckoutFormInitializeRequest;
use Iyzipay\Request\CreateRefundRequest;
use Iyzipay\Request\RetrieveCheckoutFormRequest;

class IyzicoService
{
    public function getConfig(): IyzicoPayment
    {
        $config = IyzicoPayment::first();
        if (!$config || !$config->status) {
            throw new \Exception('Iyzico ödeme yapılandırması bulunamadı veya aktif değil.');
        }
        if (!$config->api_key || !$config->secret_key) {
            throw new \Exception('Iyzico API anahtarları eksik.');
        }

        return $config;
    }

    private function options(): Options
    {
        $config = $this->getConfig();
        $options = new Options();
        $options->setApiKey($config->api_key);
        $options->setSecretKey($config->secret_key);
        $options->setBaseUrl(
            $config->is_test_mode
                ? 'https://sandbox-api.iyzipay.com'
                : 'https://api.iyzipay.com'
        );
        return $options;
    }

    public function createCheckoutForm(array $data): CheckoutFormInitialize
    {
        $request = new CreateCheckoutFormInitializeRequest();
        $request->setLocale($data['locale'] ?? Locale::TR);
        $request->setConversationId((string)$data['conversation_id']);
        $request->setPrice((string)$data['price']);
        $request->setPaidPrice((string)$data['paid_price']);
        $request->setCurrency($data['currency'] ?? Currency::TL);
        $request->setBasketId((string)$data['basket_id']);
        $request->setPaymentGroup($data['payment_group'] ?? PaymentGroup::PRODUCT);
        $request->setCallbackUrl((string)$data['callback_url']);
        $request->setBuyer($this->makeBuyer($data['buyer']));
        $request->setShippingAddress($this->makeAddress($data['shipping_address']));
        $request->setBillingAddress($this->makeAddress($data['billing_address']));
        $request->setBasketItems($this->makeBasketItems($data['basket_items'] ?? []));

        return CheckoutFormInitialize::create($request, $this->options());
    }

    public function retrieveCheckoutForm(string $token, string $conversationId): CheckoutForm
    {
        $request = new RetrieveCheckoutFormRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($conversationId);
        $request->setToken($token);

        return CheckoutForm::retrieve($request, $this->options());
    }

    /**
     * Process a refund via Iyzico API.
     *
     * @param string $paymentTransactionId The payment transaction ID from Iyzico
     * @param float $amount The refund amount (supports partial refunds)
     * @param string $conversationId Unique identifier for this refund request
     * @return Refund
     */
    public function refund(string $paymentTransactionId, float $amount, string $conversationId): Refund
    {
        $request = new CreateRefundRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($conversationId);
        $request->setPaymentTransactionId($paymentTransactionId);
        $request->setPrice((string) number_format($amount, 2, '.', ''));
        $request->setCurrency(Currency::TL);
        $request->setIp('127.0.0.1');

        return Refund::create($request, $this->options());
    }

    private function makeBuyer(array $payload): Buyer
    {
        $buyer = new Buyer();
        $buyer->setId((string)$payload['id']);
        $buyer->setName((string)$payload['name']);
        $buyer->setSurname((string)$payload['surname']);
        $buyer->setGsmNumber((string)$payload['gsm_number']);
        $buyer->setEmail((string)$payload['email']);
        $buyer->setIdentityNumber((string)$payload['identity_number']);
        $buyer->setLastLoginDate((string)$payload['last_login_date']);
        $buyer->setRegistrationDate((string)$payload['registration_date']);
        $buyer->setRegistrationAddress((string)$payload['registration_address']);
        $buyer->setIp((string)$payload['ip']);
        $buyer->setCity((string)$payload['city']);
        $buyer->setCountry((string)$payload['country']);
        $buyer->setZipCode((string)$payload['zip_code']);
        return $buyer;
    }

    private function makeAddress(array $payload): Address
    {
        $address = new Address();
        $address->setContactName((string)$payload['contact_name']);
        $address->setCity((string)$payload['city']);
        $address->setCountry((string)$payload['country']);
        $address->setAddress((string)$payload['address']);
        $address->setZipCode((string)$payload['zip_code']);
        return $address;
    }

    private function makeBasketItems(array $items): array
    {
        $basketItems = [];

        foreach ($items as $item) {
            $basketItem = new BasketItem();
            $basketItem->setId((string)$item['id']);
            $basketItem->setName((string)$item['name']);
            $basketItem->setCategory1((string)($item['category_1'] ?? 'Genel'));
            $basketItem->setCategory2((string)($item['category_2'] ?? 'Urun'));
            $basketItem->setItemType((string)($item['item_type'] ?? BasketItemType::PHYSICAL));
            $basketItem->setPrice((string)$item['price']);
            if (!empty($item['sub_merchant_key'])) {
                $basketItem->setSubMerchantKey((string)$item['sub_merchant_key']);
            }
            if (isset($item['sub_merchant_price']) && $item['sub_merchant_price'] !== null) {
                $basketItem->setSubMerchantPrice((string)$item['sub_merchant_price']);
            }
            $basketItems[] = $basketItem;
        }

        return $basketItems;
    }
}
