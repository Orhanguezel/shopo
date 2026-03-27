@extends('admin.master_layout')
@section('title')
<title>Seller KYC Details</title>
@endsection
@section('admin-content')
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Seller KYC Details</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item active"><a href="{{ route('admin.kyc.index') }}">Seller KYC</a></div>
        <div class="breadcrumb-item">Details</div>
      </div>
    </div>

    <div class="section-body">
      <a href="{{ route('admin.kyc.index') }}" class="btn btn-primary mb-4"><i class="fas fa-list"></i> Seller KYC</a>

      <div class="row">
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-file-alt"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Documents</h4></div>
              <div class="card-body">{{ $status['document_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Pending</h4></div>
              <div class="card-body">{{ $status['pending_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-check"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Approved</h4></div>
              <div class="card-body">{{ $status['approved_count'] }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-danger"><i class="fas fa-times"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Rejected</h4></div>
              <div class="card-body">{{ $status['rejected_count'] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Seller Information</h4>
            </div>
            <div class="card-body">
              <table class="table table-bordered">
                <tr><td>Name</td><td>{{ optional($seller->user)->name }}</td></tr>
                <tr><td>Shop</td><td>{{ $seller->shop_name }}</td></tr>
                <tr><td>Email</td><td>{{ optional($seller->user)->email }}</td></tr>
                <tr><td>Phone</td><td>{{ optional($seller->user)->phone }}</td></tr>
                <tr><td>Status</td><td><span class="badge badge-warning text-uppercase">{{ $status['kyc_status'] }}</span></td></tr>
                <tr><td>Submitted At</td><td>{{ optional($status['submitted_at'])->format('d M Y H:i') ?: '-' }}</td></tr>
                <tr><td>Approved At</td><td>{{ optional($status['approved_at'])->format('d M Y H:i') ?: '-' }}</td></tr>
                <tr><td>IBAN</td><td>{{ $seller->iban ?: '-' }}</td></tr>
                <tr><td>Tax Number</td><td>{{ $seller->tax_number ?: '-' }}</td></tr>
                <tr><td>Sub Merchant Key</td><td>{{ $seller->iyzico_sub_merchant_key ?: '-' }}</td></tr>
              </table>

              @if($status['kyc_status'] === 'approved' && empty($seller->iyzico_sub_merchant_key))
                <form action="{{ route('admin.kyc.create-sub-merchant', $seller->id) }}" method="POST" class="mt-3">
                  @csrf
                  <button class="btn btn-dark btn-block" type="submit">
                    <i class="fas fa-store"></i> Create Iyzico Sub Merchant
                  </button>
                </form>
              @endif
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4>Documents</h4>
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
                      <i class="fas fa-download"></i> Download
                    </a>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <form action="{{ route('admin.kyc.approve', $document->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                          <label>Admin Note</label>
                          <textarea name="admin_note" class="form-control" rows="3">{{ $document->admin_note }}</textarea>
                        </div>
                        <button class="btn btn-success btn-block" type="submit">
                          <i class="fas fa-check"></i> Approve Document
                        </button>
                      </form>
                    </div>
                    <div class="col-md-6">
                      <form action="{{ route('admin.kyc.reject', $document->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                          <label>Rejection Note <span class="text-danger">*</span></label>
                          <textarea name="admin_note" class="form-control" rows="3" required>{{ $document->status === 'rejected' ? $document->admin_note : '' }}</textarea>
                        </div>
                        <button class="btn btn-danger btn-block" type="submit">
                          <i class="fas fa-times"></i> Reject Document
                        </button>
                      </form>
                    </div>
                  </div>

                  <div class="mt-3 text-muted small">
                    Reviewed At: {{ optional($document->reviewed_at)->format('d M Y H:i') ?: '-' }}
                    @if($document->reviewer)
                      | Reviewer: {{ $document->reviewer->name }}
                    @endif
                  </div>
                </div>
              @empty
                <div class="alert alert-info mb-0">No KYC documents found for this seller.</div>
              @endforelse
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
