@extends('admin.master_layout')
@section('title')
<title>Satıcı KYC Detayları</title>
@endsection
@section('admin-content')
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Satıcı KYC Detayları</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item active"><a href="{{ route('admin.kyc.index') }}">Satıcı KYC</a></div>
        <div class="breadcrumb-item">Detaylar</div>
      </div>
    </div>

    <div class="section-body">
      <a href="{{ route('admin.kyc.index') }}" class="btn btn-primary mb-4"><i class="fas fa-list"></i> Satıcı KYC</a>

      <div class="row">
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-file-alt"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Toplam Belge</h4></div>
              <div class="card-body">{{ $status['document_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Bekleyen</h4></div>
              <div class="card-body">{{ $status['pending_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-check"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Onaylanan</h4></div>
              <div class="card-body">{{ $status['approved_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-danger"><i class="fas fa-times"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Reddedilen</h4></div>
              <div class="card-body">{{ $status['rejected_count'] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Satıcı Bilgileri</h4>
            </div>
            <div class="card-body">
              <table class="table table-bordered">
                <tr><td>Ad Soyad</td><td>{{ optional($seller->user)->name }}</td></tr>
                <tr><td>Mağaza</td><td>{{ $seller->shop_name }}</td></tr>
                <tr><td>E-posta</td><td>{{ optional($seller->user)->email }}</td></tr>
                <tr><td>Telefon</td><td>{{ optional($seller->user)->phone }}</td></tr>
                <tr><td>Durum</td><td><span class="badge badge-warning text-uppercase">{{ $status['kyc_status'] }}</span></td></tr>
                <tr><td>Gönderim Tarihi</td><td>{{ optional($status['submitted_at'])->format('d M Y H:i') ?: '-' }}</td></tr>
                <tr><td>Onay Tarihi</td><td>{{ optional($status['approved_at'])->format('d M Y H:i') ?: '-' }}</td></tr>
                <tr><td>IBAN</td><td>{{ $seller->iban ?: '-' }}</td></tr>
                <tr><td>Vergi Numarası</td><td>{{ $seller->tax_number ?: '-' }}</td></tr>
                <tr><td>Alt Üye İşyeri Anahtarı</td><td>{{ $seller->iyzico_sub_merchant_key ?: '-' }}</td></tr>
              </table>

              @if($status['kyc_status'] === 'approved' && empty($seller->iyzico_sub_merchant_key))
                <form action="{{ route('admin.kyc.create-sub-merchant', $seller->id) }}" method="POST" class="mt-3">
                  @csrf
                  <button class="btn btn-dark btn-block" type="submit">
                    <i class="fas fa-store"></i> Iyzico Alt Üye İşyeri Oluştur
                  </button>
                </form>
              @endif
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4>Belgeler</h4>
            </div>
            <div class="card-body">
              @forelse($seller->kycDocuments as $document)
                <div class="border rounded p-3 mb-4">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 class="mb-1 text-uppercase">{{ str_replace('_', ' ', $document->document_type) }}</h6>
                      <div class="text-muted small">{{ $document->original_name }} | {{ number_format(($document->file_size ?? 0) / 1024, 1) }} KB</div>
                    </div>
                    <div>
                      @if($document->status === 'approved')
                        <span class="badge badge-success text-uppercase">{{ $document->status }}</span>
                      @elseif($document->status === 'rejected')
                        <span class="badge badge-danger text-uppercase">{{ $document->status }}</span>
                      @else
                        <span class="badge badge-warning text-uppercase">{{ $document->status }}</span>
                      @endif
                    </div>
                  </div>

                  <div class="mb-3">
                      <a href="{{ route('admin.kyc.download', $document->id) }}" class="btn btn-info btn-sm">
                      <i class="fas fa-download"></i> İndir
                    </a>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <form action="{{ route('admin.kyc.approve', $document->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                          <label>Yönetici Notu</label>
                          <textarea name="admin_note" class="form-control" rows="3">{{ $document->admin_note }}</textarea>
                        </div>
                        <button class="btn btn-success btn-block" type="submit">
                          <i class="fas fa-check"></i> Belgeyi Onayla
                        </button>
                      </form>
                    </div>
                    <div class="col-md-6">
                      <form action="{{ route('admin.kyc.reject', $document->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                          <label>Red Notu <span class="text-danger">*</span></label>
                          <textarea name="admin_note" class="form-control" rows="3" required>{{ $document->status === 'rejected' ? $document->admin_note : '' }}</textarea>
                        </div>
                        <button class="btn btn-danger btn-block" type="submit">
                          <i class="fas fa-times"></i> Belgeyi Reddet
                        </button>
                      </form>
                    </div>
                  </div>

                  <div class="mt-3 text-muted small">
                    İncelenme Tarihi: {{ optional($document->reviewed_at)->format('d M Y H:i') ?: '-' }}
                    @if($document->reviewer)
                      | İnceleyen: {{ $document->reviewer->name }}
                    @endif
                  </div>
                </div>
              @empty
                <div class="alert alert-info mb-0">Bu satıcı için KYC belgesi bulunamadı.</div>
              @endforelse
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
