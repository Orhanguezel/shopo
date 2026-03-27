@extends('admin.master_layout')
@section('title')
<title>Return Request Details</title>
@endsection
@section('admin-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>Return Request Details</h1>
            <div class="section-header-breadcrumb">
              <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
              <div class="breadcrumb-item active"><a href="{{ route('admin.return-requests.index') }}">Return Requests</a></div>
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
                                    <strong>Current Status:</strong> 
                                    @if ($return->status == 0)
                                        <span class="badge badge-warning text-dark">Pending</span>
                                    @elseif ($return->status == 1)
                                        <span class="badge badge-info">Vendor Approved</span>
                                    @elseif ($return->status == 2)
                                        <span class="badge badge-primary">Admin Approved</span>
                                    @elseif ($return->status == 3)
                                        <span class="badge badge-info">Received</span>
                                    @elseif ($return->status == 4)
                                        <span class="badge badge-success">Completed (Refunded)</span>
                                    @elseif ($return->status == 5)
                                        <span class="badge badge-danger">Vendor Rejected</span>
                                    @elseif ($return->status == 6)
                                        <span class="badge badge-danger">Admin Rejected</span>
                                    @elseif ($return->status == 7)
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

                            <h5>Reason for Return</h5>
                            <p class="p-3 bg-light border rounded">{{ $return->reason }}</p>
                            @if($return->details)
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
                            <h4>Admin Actions</h4>
                        </div>
                        <div class="card-body">
                            @if ((int) $return->status === 1 || (int) $return->status === 5)
                              <form action="{{ route('admin.return-requests.update-status', $return->id) }}" method="POST" class="mb-3">
                                  @csrf
                                  @method('PUT')
                                  <input type="hidden" name="status" value="2">
                                  <div class="form-group">
                                      <label>Refund Amount</label>
                                      <input type="number" step="0.01" min="0" name="refund_amount" class="form-control" value="{{ old('refund_amount', $return->refund_amount) }}" required>
                                  </div>
                                  <div class="form-group">
                                      <label>Refund Method</label>
                                      <input type="text" name="refund_method" class="form-control" value="{{ old('refund_method', $return->refund_method) }}" required>
                                  </div>
                                  <div class="form-group">
                                      <label>Admin Note</label>
                                      <textarea name="admin_note" class="form-control" rows="3">{{ old('admin_note', $return->admin_note) }}</textarea>
                                  </div>
                                  <button type="submit" class="btn btn-primary btn-block shadow-sm">Approve Request</button>
                              </form>

                              <form action="{{ route('admin.return-requests.update-status', $return->id) }}" method="POST">
                                  @csrf
                                  @method('PUT')
                                  <input type="hidden" name="status" value="6">
                                  <div class="form-group">
                                      <label>Reject Reason</label>
                                      <textarea name="rejected_reason" class="form-control" rows="3" required>{{ old('rejected_reason', $return->rejected_reason) }}</textarea>
                                  </div>
                                  <div class="form-group">
                                      <label>Admin Note</label>
                                      <textarea name="admin_note" class="form-control" rows="3">{{ old('admin_note', $return->admin_note) }}</textarea>
                                  </div>
                                  <button type="submit" class="btn btn-danger btn-block shadow-sm">Reject Request</button>
                              </form>
                            @elseif ((int) $return->status === 2)
                              <form action="{{ route('admin.return-requests.update-status', $return->id) }}" method="POST" class="mb-3">
                                  @csrf
                                  @method('PUT')
                                  <input type="hidden" name="status" value="3">
                                  <div class="form-group">
                                      <label>Admin Note</label>
                                      <textarea name="admin_note" class="form-control" rows="3">{{ old('admin_note', $return->admin_note) }}</textarea>
                                  </div>
                                  <button type="submit" class="btn btn-info btn-block shadow-sm">Mark as Received</button>
                              </form>

                              <form action="{{ route('admin.return-requests.update-status', $return->id) }}" method="POST">
                                  @csrf
                                  @method('PUT')
                                  <input type="hidden" name="status" value="4">
                                  <div class="form-group">
                                      <label>Admin Note</label>
                                      <textarea name="admin_note" class="form-control" rows="3">{{ old('admin_note', $return->admin_note) }}</textarea>
                                  </div>
                                  <button type="submit" class="btn btn-success btn-block shadow-sm">Finalize Refund</button>
                              </form>
                            @elseif ((int) $return->status === 3)
                              <form action="{{ route('admin.return-requests.update-status', $return->id) }}" method="POST">
                                  @csrf
                                  @method('PUT')
                                  <input type="hidden" name="status" value="4">
                                  <div class="form-group">
                                      <label>Admin Note</label>
                                      <textarea name="admin_note" class="form-control" rows="3">{{ old('admin_note', $return->admin_note) }}</textarea>
                                  </div>
                                  <button type="submit" class="btn btn-success btn-block shadow-sm">Finalize Refund</button>
                              </form>
                            @else
                              <div class="alert alert-light border mb-0">
                                  This request is in a terminal state. No further admin action is available.
                              </div>
                            @endif
                        </div>
                    </div>

                    <div class="card mt-4">
                        <div class="card-header">
                            <h4>Vendor Status</h4>
                        </div>
                        <div class="card-body">
                            <strong>Vendor:</strong> <a href="{{ route('admin.seller-show', $return->seller_id) }}">{{ $return->seller->shop_name }}</a><br>
                            <strong>Vendor Response:</strong><br>
                            <p class="mt-2 text-muted italic">{{ $return->vendor_response ?: 'No response yet' }}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>
      </div>
@endsection
