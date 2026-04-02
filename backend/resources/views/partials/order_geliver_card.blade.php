{{--
  Geliver sipariş kargo kartı — admin show_order ile birebir aynı işaretleme.
  @var \App\Models\Order $order
  @var string|null $cardId opsiyonel DOM id (ör. satıcı listesinden #geliver-kargo anchor)
--}}
<div class="row mt-4">
  <div class="col-12">
    <div class="card"@if(!empty($cardId)) id="{{ $cardId }}"@endif>
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Geliver Kargo</h4>
        <div class="d-flex align-items-center">
          <button type="button" class="btn btn-outline-primary btn-sm mr-2" id="loadCargoOffers">Teklifleri Getir</button>
          <button type="button" class="btn btn-primary btn-sm" id="createCargoWithoutOffer">En Uygun Teklifle Oluştur</button>
        </div>
      </div>
      <div class="card-body">
        <div class="alert alert-light border">
          <div><strong>Mevcut Kargo Durumu:</strong> <span id="cargoStatusText">{{ $order->cargoShipment?->status ?? 'Kargo kaydı yok' }}</span></div>
          <div class="mt-1"><strong>Takip No:</strong> <span id="cargoTrackingText">{{ $order->cargoShipment?->tracking_number ?? '-' }}</span></div>
          <div class="mt-1"><strong>Kargo Firması:</strong> <span id="cargoCarrierText">{{ $order->cargoShipment?->carrier_name ?? '-' }}</span></div>
          <div class="mt-2">
            @if($order->cargoShipment?->tracking_url)
              <a id="cargoTrackingLink" href="{{ $order->cargoShipment->tracking_url }}" class="btn btn-outline-info btn-sm mr-2" target="_blank">Takip Linki</a>
            @else
              <a id="cargoTrackingLink" href="#" class="btn btn-outline-info btn-sm mr-2 d-none" target="_blank">Takip Linki</a>
            @endif
            @if($order->cargoShipment?->label_url)
              <a id="cargoLabelLink" href="{{ $order->cargoShipment->label_url }}" class="btn btn-outline-secondary btn-sm mr-2" target="_blank">Etiketi Aç</a>
            @else
              <a id="cargoLabelLink" href="#" class="btn btn-outline-secondary btn-sm mr-2 d-none" target="_blank">Etiketi Aç</a>
            @endif
            @if($order->cargoShipment && $order->cargoShipment->status !== 'cancelled')
              <button type="button" class="btn btn-danger btn-sm" id="cancelCargoBtn">Kargoyu İptal Et</button>
            @else
              <button type="button" class="btn btn-danger btn-sm d-none" id="cancelCargoBtn">Kargoyu İptal Et</button>
            @endif
          </div>
        </div>

        <div class="table-responsive d-none" id="cargoOffersWrap">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Seç</th>
                <th>Kargo Firması</th>
                <th>Fiyat</th>
              </tr>
            </thead>
            <tbody id="cargoOffersBody"></tbody>
          </table>
          <button type="button" class="btn btn-success btn-sm" id="createCargoWithOffer">Seçili Teklifle Oluştur</button>
        </div>
      </div>
    </div>
  </div>
</div>
