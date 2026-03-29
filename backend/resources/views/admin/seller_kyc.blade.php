@extends('admin.master_layout')
@section('title')
<title>Satıcı KYC</title>
@endsection
@section('admin-content')
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Satıcı KYC</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item">Satıcı KYC</div>
      </div>
    </div>

    <div class="section-body">
      <div class="row">
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-id-card"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Bekleyen Satıcılar</h4>
              </div>
              <div class="card-body">
                {{ $sellers->count() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped" id="dataTable">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Satıcı</th>
                  <th>İletişim</th>
                  <th>Durum</th>
                  <th>Belgeler</th>
                  <th>Gönderim</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                @foreach($sellers as $index => $seller)
                  <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                      <strong>{{ optional($seller->user)->name }}</strong><br>
                      <span class="text-muted">{{ $seller->shop_name }}</span>
                    </td>
                    <td>
                      {{ optional($seller->user)->email }}<br>
                      <span class="text-muted">{{ optional($seller->user)->phone }}</span>
                    </td>
                    <td><span class="badge badge-warning text-uppercase">{{ $seller->kyc_status }}</span></td>
                    <td>{{ $seller->kycDocuments->count() }}</td>
                    <td>{{ optional($seller->kyc_submitted_at)->format('d M Y H:i') ?: '-' }}</td>
                    <td>
                      <a href="{{ route('admin.kyc.show', $seller->id) }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye"></i>
                      </a>
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
