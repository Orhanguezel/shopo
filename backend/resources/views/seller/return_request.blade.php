@extends('seller.master_layout')
@section('title')
<title>Return Requests</title>
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
  $activeStatus = request('status');
@endphp
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Return Requests</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('seller.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item">Return Requests</div>
      </div>
    </div>

    <div class="section-body">
      <div class="row">
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-undo"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Requests</h4></div>
              <div class="card-body">{{ $returns->count() }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Pending</h4></div>
              <div class="card-body">{{ $returns->where('status', 0)->count() }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-check"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Approved</h4></div>
              <div class="card-body">{{ $returns->whereIn('status', [1, 2, 3, 4])->count() }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-statistic-1">
            <div class="card-icon bg-danger"><i class="fas fa-times"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Rejected</h4></div>
              <div class="card-body">{{ $returns->whereIn('status', [5, 6])->count() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="d-flex flex-wrap align-items-center" style="gap:10px;">
            <a href="{{ route('seller.return-requests.index') }}" class="btn {{ $activeStatus === null ? 'btn-primary' : 'btn-outline-primary' }} btn-sm">All</a>
            @foreach($statusLabels as $statusValue => $statusMeta)
              <a href="{{ route('seller.return-requests.index', ['status' => $statusValue]) }}" class="btn {{ (string) $activeStatus === (string) $statusValue ? 'btn-primary' : 'btn-outline-primary' }} btn-sm">
                {{ $statusMeta['label'] }}
              </a>
            @endforeach
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Refund Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @forelse ($returns as $index => $return)
                  <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                      <strong>{{ $return->user->name }}</strong><br>
                      <span class="text-muted">{{ $return->user->email }}</span>
                    </td>
                    <td>#{{ $return->order->order_id }}</td>
                    <td>
                      <strong>{{ $return->orderProduct->product_name }}</strong><br>
                      <span class="text-muted text-capitalize">{{ str_replace('_', ' ', $return->reason) }}</span>
                    </td>
                    <td>{{ $return->qty }}</td>
                    <td>{{ $setting->currency_icon }}{{ number_format((float) $return->refund_amount, 2) }}</td>
                    <td>
                      <span class="badge badge-{{ $statusLabels[$return->status]['class'] ?? 'secondary' }}">
                        {{ $statusLabels[$return->status]['label'] ?? 'Unknown' }}
                      </span>
                    </td>
                    <td>{{ optional($return->created_at)->format('d M Y') }}</td>
                    <td>
                      <a href="{{ route('seller.return-requests.show', $return->id) }}" class="btn btn-primary btn-sm"><i class="fa fa-eye"></i></a>
                    </td>
                  </tr>
                @empty
                  <tr>
                    <td colspan="9" class="text-center">No return requests found for the selected filter.</td>
                  </tr>
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
