@extends('admin.master_layout')
@section('title')
<title>Satıcı Hesap Doğrulama (KYC)</title>
@endsection
@section('admin-content')
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Satıcı Hesap Doğrulama (KYC)</h1>
    </div>

    <div class="section-body">

      {{-- Özet Kartları --}}
      @php
        $allVendors = \App\Models\Vendor::where('status', 1)->get();
        $notSubmitted = $allVendors->where('kyc_status', 'not_submitted')->count();
        $pending = $allVendors->where('kyc_status', 'pending')->count();
        $approved = $allVendors->where('kyc_status', 'approved')->count();
        $rejected = $allVendors->where('kyc_status', 'rejected')->count();
      @endphp
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <a href="{{ route('admin.kyc.index', ['status' => 'not_submitted']) }}">
            <div class="card card-statistic-1">
              <div class="card-icon bg-secondary"><i class="fas fa-user-clock"></i></div>
              <div class="card-wrap"><div class="card-header"><h4>Belge Yüklenmemiş</h4></div><div class="card-body">{{ $notSubmitted }}</div></div>
            </div>
          </a>
        </div>
        <div class="col-lg-3 col-md-6">
          <a href="{{ route('admin.kyc.index', ['status' => 'pending']) }}">
            <div class="card card-statistic-1">
              <div class="card-icon bg-warning"><i class="fas fa-hourglass-half"></i></div>
              <div class="card-wrap"><div class="card-header"><h4>Onay Bekleyen</h4></div><div class="card-body">{{ $pending }}</div></div>
            </div>
          </a>
        </div>
        <div class="col-lg-3 col-md-6">
          <a href="{{ route('admin.kyc.index', ['status' => 'approved']) }}">
            <div class="card card-statistic-1">
              <div class="card-icon bg-success"><i class="fas fa-check-circle"></i></div>
              <div class="card-wrap"><div class="card-header"><h4>Onaylanan</h4></div><div class="card-body">{{ $approved }}</div></div>
            </div>
          </a>
        </div>
        <div class="col-lg-3 col-md-6">
          <a href="{{ route('admin.kyc.index', ['status' => 'rejected']) }}">
            <div class="card card-statistic-1">
              <div class="card-icon bg-danger"><i class="fas fa-times-circle"></i></div>
              <div class="card-wrap"><div class="card-header"><h4>Reddedilen</h4></div><div class="card-body">{{ $rejected }}</div></div>
            </div>
          </a>
        </div>
      </div>

      {{-- Filtre --}}
      <div class="card mb-3">
        <div class="card-body py-3">
          <div class="d-flex flex-wrap align-items-center" style="gap:8px;">
            <a href="{{ route('admin.kyc.index') }}" class="btn btn-sm {{ !request('status') || request('status') == 'all' ? 'btn-primary' : 'btn-outline-primary' }}">Tümü ({{ $allVendors->count() }})</a>
            <a href="{{ route('admin.kyc.index', ['status' => 'not_submitted']) }}" class="btn btn-sm {{ request('status') == 'not_submitted' ? 'btn-secondary' : 'btn-outline-secondary' }}">Belge Yok ({{ $notSubmitted }})</a>
            <a href="{{ route('admin.kyc.index', ['status' => 'pending']) }}" class="btn btn-sm {{ request('status') == 'pending' ? 'btn-warning' : 'btn-outline-warning' }}">Bekleyen ({{ $pending }})</a>
            <a href="{{ route('admin.kyc.index', ['status' => 'approved']) }}" class="btn btn-sm {{ request('status') == 'approved' ? 'btn-success' : 'btn-outline-success' }}">Onaylı ({{ $approved }})</a>
            <a href="{{ route('admin.kyc.index', ['status' => 'rejected']) }}" class="btn btn-sm {{ request('status') == 'rejected' ? 'btn-danger' : 'btn-outline-danger' }}">Reddedilen ({{ $rejected }})</a>
          </div>
        </div>
      </div>

      {{-- Tablo --}}
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped" id="dataTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Satıcı</th>
                  <th>İletişim</th>
                  <th>TC / IBAN</th>
                  <th>KYC Durumu</th>
                  <th>Iyzico</th>
                  <th>Belgeler</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                @forelse($sellers as $index => $seller)
                  <tr>
                    <td>{{ $seller->id }}</td>
                    <td>
                      <strong>{{ optional($seller->user)->name ?? '-' }}</strong><br>
                      <span class="text-muted small">{{ $seller->shop_name }}</span>
                    </td>
                    <td class="small">
                      {{ optional($seller->user)->email ?? '-' }}<br>
                      {{ optional($seller->user)->phone ?? $seller->phone ?? '-' }}
                    </td>
                    <td class="small">
                      @if($seller->tc_identity)
                        <span class="text-success"><i class="fas fa-check mr-1"></i>TC: {{ Str::mask($seller->tc_identity, '*', 3, 5) }}</span><br>
                      @else
                        <span class="text-danger"><i class="fas fa-times mr-1"></i>TC: Yok</span><br>
                      @endif
                      @if($seller->iban)
                        <span class="text-success"><i class="fas fa-check mr-1"></i>IBAN: ...{{ substr($seller->iban, -4) }}</span>
                      @else
                        <span class="text-danger"><i class="fas fa-times mr-1"></i>IBAN: Yok</span>
                      @endif
                    </td>
                    <td>
                      @switch($seller->kyc_status)
                        @case('not_submitted')
                          <span class="badge badge-secondary">Belge Yok</span>
                          @break
                        @case('pending')
                          <span class="badge badge-warning">Onay Bekliyor</span>
                          @break
                        @case('approved')
                          <span class="badge badge-success">Onaylı</span>
                          @break
                        @case('rejected')
                          <span class="badge badge-danger">Reddedildi</span>
                          @break
                      @endswitch
                    </td>
                    <td>
                      @if($seller->iyzico_sub_merchant_key)
                        <span class="badge badge-success">Kayıtlı</span>
                      @else
                        <span class="badge badge-light">—</span>
                      @endif
                    </td>
                    <td>{{ $seller->kycDocuments->count() }}</td>
                    <td>
                      <a href="{{ route('admin.kyc.show', $seller->id) }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye mr-1"></i> İncele
                      </a>
                    </td>
                  </tr>
                @empty
                  <tr><td colspan="8" class="text-center text-muted py-4">Bu filtreye uygun satıcı yok.</td></tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
