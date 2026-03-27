@extends('seller.master_layout')
@section('title')
<title>Return Request Details</title>
@endsection
@section('seller-content')
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
            <div class="card-header">
              <h4>Request Information</h4>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-6">
                  <strong>Customer:</strong> {{ $return->user->name }}<br>
                  <strong>Email:</strong> {{ $return->user->email }}<br>
                  <strong>Phone:</strong> {{ $return->user->phone }}
                </div>
                <div class="col-md-6 text-md-right">
                  <strong>Order ID:</strong> #{{ $return->order->order_id }}<br>
                  <strong>Date:</strong> {{ $return->created_at->format('d M, Y H:i') }}<br>
                  <strong>Status:</strong>
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
                </div>
              </div>

              <hr>
              <h5>Product Details</h5>
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Return Qty</th>
                    <th>Requested Refund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ $return->orderProduct->product_name }}</td>
                    <td>{{ $setting->currency_icon }}{{ number_format((float) $return->orderProduct->unit_price, 2) }}</td>
                    <td>{{ $return->qty }}</td>
                    <td>{{ $setting->currency_icon }}{{ number_format((float) $return->refund_amount, 2) }}</td>
                  </tr>
                </tbody>
              </table>

              <hr>
              <h5>Reason</h5>
              <p class="p-3 bg-light border rounded mb-2">{{ $return->reason }}</p>
              @if ($return->details)
                <p class="p-3 bg-light border rounded">{{ $return->details }}</p>
              @endif

              @if($return->images->count() > 0)
                <hr>
                <h5>Evidence Images</h5>
                <div class="row mt-3">
                  @foreach($return->images as $img)
                    <div class="col-md-3 mb-3">
                      <a href="{{ asset($img->image) }}" target="_blank">
                        <img src="{{ asset($img->image) }}" class="img-fluid rounded border" alt="Evidence">
                      </a>
                    </div>
                  @endforeach
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
                <form action="{{ route('seller.return-requests.update-status', $return->id) }}" method="POST" class="mb-3">
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
                <div class="alert alert-light border">
                  <strong>Seller Note:</strong><br>
                  {{ $return->seller_note ?: 'No seller note.' }}
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
