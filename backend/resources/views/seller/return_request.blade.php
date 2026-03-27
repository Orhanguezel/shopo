@extends('seller.master_layout')
@section('title')
<title>Return Requests</title>
@endsection
@section('seller-content')
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @forelse ($returns as $index => $return)
                  <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $return->user->name }}</td>
                    <td>#{{ $return->order->order_id }}</td>
                    <td>{{ $return->orderProduct->product_name }}</td>
                    <td>{{ $return->qty }}</td>
                    <td>{{ $setting->currency_icon }}{{ number_format((float) $return->refund_amount, 2) }}</td>
                    <td>
                      @if ($return->status == 0)
                        <span class="badge badge-warning text-dark">Pending</span>
                      @elseif ($return->status == 1)
                        <span class="badge badge-info">Seller Approved</span>
                      @elseif ($return->status == 2)
                        <span class="badge badge-primary">Admin Approved</span>
                      @elseif ($return->status == 3)
                        <span class="badge badge-info">Received</span>
                      @elseif ($return->status == 4)
                        <span class="badge badge-success">Refunded</span>
                      @elseif ($return->status == 5)
                        <span class="badge badge-danger">Seller Rejected</span>
                      @elseif ($return->status == 6)
                        <span class="badge badge-danger">Admin Rejected</span>
                      @else
                        <span class="badge badge-secondary">Cancelled</span>
                      @endif
                    </td>
                    <td>
                      <a href="{{ route('seller.return-requests.show', $return->id) }}" class="btn btn-primary btn-sm"><i class="fa fa-eye"></i></a>
                    </td>
                  </tr>
                @empty
                  <tr>
                    <td colspan="8" class="text-center">No return requests found.</td>
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
