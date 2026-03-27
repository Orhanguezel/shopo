@extends('admin.master_layout')
@section('title')
<title>Return Requests</title>
@endsection
@section('admin-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>Return Requests</h1>
            <div class="section-header-breadcrumb">
              <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
              <div class="breadcrumb-item">Return Requests</div>
            </div>
          </div>

          <div class="section-body">
            <div class="row mt-4">
                <div class="col">
                  <div class="card">
                    <div class="card-body">
                      <div class="table-responsive table-invoice">
                        <table class="table table-striped" id="dataTable">
                            <thead>
                                <tr>
                                    <th width="5%">{{__('admin.SN')}}</th>
                                    <th width="15%">{{__('admin.Customer')}}</th>
                                    <th width="15%">{{__('admin.Order Id')}}</th>
                                    <th width="20%">Product</th>
                                    <th width="10%">Qty</th>
                                    <th width="15%">Status</th>
                                    <th width="10%">Action</th>
                                  </tr>
                            </thead>
                            <tbody>
                                @foreach ($returns as $index => $return)
                                    <tr>
                                        <td>{{ ++$index }}</td>
                                        <td>{{ $return->user->name }}</td>
                                        <td>{{ $return->order->order_id }}</td>
                                        <td>{{ $return->orderProduct->product_name }}</td>
                                        <td>{{ $return->qty }}</td>
                                        <td>
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
                                        </td>
                                        <td>
                                            <a href="{{ route('admin.return-requests.show', $return->id) }}" class="btn btn-primary btn-sm"><i class="fa fa-eye" aria-hidden="true"></i></a>
                                        </td>
                                    </tr>
                                  @endforeach
                            </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </section>
      </div>
@endsection
