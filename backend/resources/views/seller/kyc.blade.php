@extends('seller.master_layout')
@section('title')<title>Hesap Doğrulama (KYC)</title>@endsection
@section('seller-content')
<div class="main-content">
  <section class="section">
    <div class="section-header"><h1>Hesap Doğrulama (KYC)</h1></div>
    <div class="section-body">

      {{-- Durum Kartı --}}
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon {{ $seller->kyc_status == 'approved' ? 'bg-success' : ($seller->kyc_status == 'pending' ? 'bg-warning' : ($seller->kyc_status == 'rejected' ? 'bg-danger' : 'bg-secondary')) }}">
              <i class="fas fa-id-card"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header"><h4>Doğrulama Durumu</h4></div>
              <div class="card-body">
                @switch($seller->kyc_status)
                  @case('approved') <span class="text-success">Onaylı</span> @break
                  @case('pending') <span class="text-warning">Onay Bekliyor</span> @break
                  @case('rejected') <span class="text-danger">Reddedildi</span> @break
                  @default <span class="text-secondary">Belge Yüklenmedi</span>
                @endswitch
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-file-alt"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Yüklenen Belgeler</h4></div>
              <div class="card-body">{{ $documents->count() }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon {{ $seller->iyzico_sub_merchant_key ? 'bg-success' : 'bg-secondary' }}"><i class="fas fa-credit-card"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Ödeme Alma</h4></div>
              <div class="card-body">{{ $seller->iyzico_sub_merchant_key ? 'Aktif' : 'Pasif' }}</div>
            </div>
          </div>
        </div>
      </div>

      @if($seller->kyc_status == 'approved')
        <div class="alert alert-success">
          <i class="fas fa-check-circle mr-1"></i> Hesabınız doğrulanmış. Ürün ekleyebilir ve ödeme alabilirsiniz.
        </div>
      @elseif($seller->kyc_status == 'rejected')
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle mr-1"></i> Hesap doğrulamanız reddedildi. Lütfen belgelerinizi kontrol edip tekrar yükleyin.
        </div>
      @elseif($seller->kyc_status == 'pending')
        <div class="alert alert-warning">
          <i class="fas fa-clock mr-1"></i> Belgeleriniz inceleniyor. Onaylandığında ürün eklemeye başlayabilirsiniz.
        </div>
      @else
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-1"></i> Ürün ekleyebilmek için hesap doğrulamanızı tamamlamanız gerekmektedir. Aşağıdaki formu doldurup belgelerinizi yükleyin.
        </div>
      @endif

      <div class="row">
        {{-- Belge Yükleme Formu --}}
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header"><h4>Belge Yükle</h4></div>
            <div class="card-body">
              <form action="{{ route('seller.kyc.upload') }}" method="POST" enctype="multipart/form-data">
                @csrf

                <div class="form-group">
                  <label>TC Kimlik No <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="tc_identity" id="tc_identity"
                    value="{{ $seller->tc_identity }}"
                    placeholder="Örn: 12345678901"
                    maxlength="11"
                    pattern="\d{11}"
                    title="11 haneli TC Kimlik Numarası (sadece rakam)"
                    required>
                  <small class="text-muted">11 haneli, sadece rakamlardan oluşan TC Kimlik Numaranız</small>
                </div>

                <div class="form-group">
                  <label>IBAN <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="iban" id="iban_input"
                    value="{{ $seller->iban }}"
                    placeholder="TR960015700000000083650899"
                    maxlength="26"
                    pattern="TR[0-9]{24}"
                    title="TR ile başlayan 26 karakterli IBAN (boşluksuz, büyük harf)"
                    required>
                  <small class="text-muted">
                    <strong>Format:</strong> TR ile başlayan 26 karakter — boşluksuz yazın.<br>
                    <strong>Örnek:</strong> <code>TR960015700000000083650899</code><br>
                    <span class="text-info">Not: IBAN'ınızı bankadan veya internet bankacılığından boşluksuz kopyalayın.</span>
                  </small>
                </div>

                <div class="form-group">
                  <label>Vergi No</label>
                  <input type="text" class="form-control" name="tax_number" value="{{ $seller->tax_number }}" placeholder="Vergi numarası (kurumsal ise)">
                </div>

                <hr>

                <div class="form-group">
                  <label>Belge Türü <span class="text-danger">*</span></label>
                  <select name="document_type" class="form-control" required>
                    <option value="identity_front">Kimlik Ön Yüz</option>
                    <option value="identity_back">Kimlik Arka Yüz</option>
                    <option value="tax_certificate">Vergi Belgesi</option>
                    <option value="address_proof">Adres Belgesi</option>
                    <option value="bank_statement">Banka Hesap Özeti</option>
                    <option value="iban_document">IBAN Belgesi</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Belge Dosyası <span class="text-danger">*</span></label>
                  <input type="file" class="form-control-file" name="document" accept=".pdf,.jpg,.jpeg,.png" required>
                  <small class="text-muted">PDF, JPG veya PNG (max 5MB)</small>
                </div>

                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-upload mr-1"></i> Belgeyi Yükle
                </button>
              </form>
            </div>
          </div>
        </div>

        {{-- Yüklenen Belgeler --}}
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header"><h4>Yüklenen Belgeler</h4></div>
            <div class="card-body">
              @if($documents->count() > 0)
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr><th>Belge</th><th>Dosya</th><th>Durum</th><th>Tarih</th></tr>
                    </thead>
                    <tbody>
                      @php
                        $typeLabels = [
                          'identity_front' => 'Kimlik Ön Yüz',
                          'identity_back' => 'Kimlik Arka Yüz',
                          'tax_certificate' => 'Vergi Belgesi',
                          'address_proof' => 'Adres Belgesi',
                          'bank_statement' => 'Banka Hesap Özeti',
                          'iban_document' => 'IBAN Belgesi',
                        ];
                      @endphp
                      @foreach($documents as $doc)
                        <tr>
                          <td>{{ $typeLabels[$doc->document_type] ?? $doc->document_type }}</td>
                          <td class="small">{{ Str::limit($doc->original_name, 25) }}</td>
                          <td>
                            @switch($doc->status)
                              @case('approved') <span class="badge badge-success">Onaylı</span> @break
                              @case('pending') <span class="badge badge-warning">Bekliyor</span> @break
                              @case('rejected') <span class="badge badge-danger">Reddedildi</span> @break
                            @endswitch
                          </td>
                          <td class="small">{{ $doc->created_at->format('d.m.Y') }}</td>
                        </tr>
                      @endforeach
                    </tbody>
                  </table>
                </div>
              @else
                <p class="text-muted text-center py-4">Henüz belge yüklenmedi.</p>
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection

@push('scripts')
<script>
  // IBAN auto-normalize: boşlukları sil, büyük harfe çevir
  const ibanInput = document.getElementById('iban_input');
  if (ibanInput) {
    ibanInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase().replace(/\s+/g, '');
    });
    ibanInput.addEventListener('blur', function () {
      let val = this.value.toUpperCase().replace(/\s+/g, '');
      if (val && !val.startsWith('TR')) val = 'TR' + val;
      this.value = val;
      if (val.length > 0 && val.length !== 26) {
        this.setCustomValidity('Türkiye IBAN\'ı TR ile başlayan 26 karakter olmalıdır. Şu an: ' + val.length + ' karakter.');
      } else {
        this.setCustomValidity('');
      }
    });
  }
  // TC Kimlik: sadece rakam
  const tcInput = document.getElementById('tc_identity');
  if (tcInput) {
    tcInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });
  }
</script>
@endpush
