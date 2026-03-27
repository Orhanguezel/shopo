@extends('seller.master_layout')
@section('title')
<title>Return Request Details</title>
@endsection
@section('seller-content')
@php
  $statusLabels = [
      0 => ['label' => 'Pending', 'class' => 'warning text-dark'],
      1 => ['label' => 'Seller Approved', 'class' => 'info'],
      2 => ['label' => 'Admin Approved', 'class' => 'primary'],
      3 => ['label' => 'Received', 'class' => 'info'],
      4 => ['label' => 'Refunded', 'class' => 'success'],
      5 => ['label' => 'Seller Rejected', 'class' => 'danger'],
      6 => ['label' => 'Admin Rejected', 'class' => 'danger'],
      7 => ['label' => 'Cancelled', 'class' => 'secondary'],
  ];
  $statusMeta = $statusLabels[$return->status] ?? ['label' => 'Unknown', 'class' => 'secondary'];
  $requestDetails = $return->description ?: $return->details;
@endphp
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Return Request Details</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('seller.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item active"><a href="{{ route('seller.return-requests.index') }}">Return Requests</a></div>
        <div class="breadcrumb-item">Details</div>
      </div>
    </div>

    <div class="section-body">
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header justify-content-between">
              <h4 class="mb-0">Request Overview</h4>
              <span class="badge badge-{{ $statusMeta['class'] }}">{{ $statusMeta['label'] }}</span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3 h-100">
                    <small class="text-muted d-block">Customer</small>
                    <strong>{{ $return->user->name }}</strong><br>
                    <span class="text-muted">{{ $return->user->email }}</span><br>
                    <span class="text-muted">{{ $return->user->phone ?: '-' }}</span>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3 h-100">
                    <small class="text-muted d-block">Order</small>
                    <strong>#{{ $return->order->order_id }}</strong><br>
                    <span class="text-muted">{{ optional($return->created_at)->format('d M Y H:i') }}</span><br>
                    <span class="text-muted">Qty: {{ $return->qty }}</span>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3 h-100">
                    <small class="text-muted d-block">Refund</small>
                    <strong>{{ $setting->currency_icon }}{{ number_format((float) ($return->refund_amount ?? 0), 2) }}</strong><br>
                    <span class="text-muted">{{ $return->refund_method ?: 'Awaiting admin decision' }}</span><br>
                    <span class="text-muted">Request #{{ $return->id }}</span>
                  </div>
                </div>
              </div>

              <div class="table-responsive mt-2">
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Requested Qty</th>
                      <th>Requested Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>{{ $return->orderProduct->product_name }}</strong><br>
                        <span class="text-muted text-capitalize">{{ str_replace('_', ' ', $return->reason) }}</span>
                      </td>
                      <td>{{ $setting->currency_icon }}{{ number_format((float) $return->orderProduct->unit_price, 2) }}</td>
                      <td>{{ $return->qty }}</td>
                      <td>{{ $setting->currency_icon }}{{ number_format((float) ($return->refund_amount ?? 0), 2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="row mt-4">
                <div class="col-md-6 mb-3">
                  <div class="border rounded p-3 h-100">
                    <h6 class="mb-2">Customer Message</h6>
                    <p class="mb-0 text-muted">{{ $requestDetails ?: 'No additional details provided.' }}</p>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="border rounded p-3 h-100">
                    <h6 class="mb-2">Decision Notes</h6>
                    <p class="mb-2"><strong>Seller Note:</strong><br>{{ $return->seller_note ?: 'No seller note yet.' }}</p>
                    <p class="mb-0"><strong>Admin Note:</strong><br>{{ $return->admin_note ?: 'No admin note yet.' }}</p>
                  </div>
                </div>
              </div>

              @if($return->rejected_reason)
                <div class="alert alert-danger mb-0">
                  <strong>Rejected Reason:</strong><br>
                  {{ $return->rejected_reason }}
                </div>
              @endif

              @if($return->images->count() > 0)
                <div class="mt-4">
                  <h5>Evidence Images</h5>
                  <div class="row mt-3">
                    @foreach($return->images as $img)
                      <div class="col-md-3 col-sm-4 mb-3">
                        <a href="{{ asset($img->image) }}" target="_blank" rel="noopener noreferrer">
                          <img src="{{ asset($img->image) }}" class="img-fluid rounded border" alt="Evidence image">
                        </a>
                      </div>
                    @endforeach
                  </div>
                </div>
              @endif
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h4>Seller Actions</h4>
            </div>
            <div class="card-body">
              @if ((int) $return->status === 0)
                <form action="{{ route('seller.return-requests.update-status', $return->id) }}" method="POST" class="mb-4">
                  @csrf
                  @method('PUT')
                  <input type="hidden" name="status" value="1">
                  <div class="form-group">
                    <label>Seller Note</label>
                    <textarea name="seller_note" class="form-control" rows="4" placeholder="Optional note for approval">{{ old('seller_note', $return->seller_note) }}</textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block">Approve Request</button>
                </form>

                <form action="{{ route('seller.return-requests.update-status', $return->id) }}" method="POST">
                  @csrf
                  @method('PUT')
                  <input type="hidden" name="status" value="5">
                  <div class="form-group">
                    <label>Reject Reason</label>
                    <textarea name="rejected_reason" class="form-control" rows="4" required placeholder="Explain why the request is rejected">{{ old('rejected_reason', $return->rejected_reason) }}</textarea>
                  </div>
                  <button type="submit" class="btn btn-danger btn-block">Reject Request</button>
                </form>
              @else
                <div class="alert alert-light border mb-0">
                  This request is no longer actionable from the seller panel.
                </div>
              @endif

              @if ($return->admin_note)
                <div class="alert alert-info mt-3 mb-0">
                  <strong>Admin Note:</strong><br>
                  {{ $return->admin_note }}
                </div>
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
