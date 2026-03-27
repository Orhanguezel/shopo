@extends('admin.master_layout')
@section('title')
<title>{{__('admin.Commission Report')}}</title>
@endsection
@section('admin-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>{{__('admin.Commission Report')}}</h1>
            <div class="section-header-breadcrumb">
              <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
              <div class="breadcrumb-item">{{__('admin.Commission Report')}}</div>
            </div>
          </div>

          <div class="section-body">
            <div class="row mt-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                      <form method="GET" action="{{ route('admin.commission-report') }}">
                        <div class="row">
                          <div class="col-md-4">
                            <div class="form-group">
                              <label>{{__('admin.Shop Name')}}</label>
                              <select name="seller_id" class="form-control">
                                <option value="">{{__('admin.All')}}</option>
                                @foreach ($vendors as $vendor)
                                  <option value="{{ $vendor->id }}" {{ (string) $sellerId === (string) $vendor->id ? 'selected' : '' }}>{{ $vendor->shop_name }}</option>
                                @endforeach
                              </select>
                            </div>
                          </div>
                          <div class="col-md-4">
                            <div class="form-group">
                              <label>{{__('admin.Status')}}</label>
                              <select name="status" class="form-control">
                                <option value="">{{__('admin.All')}}</option>
                                <option value="pending" {{ $status === 'pending' ? 'selected' : '' }}>{{__('admin.Pending')}}</option>
                                <option value="settled" {{ $status === 'settled' ? 'selected' : '' }}>{{__('admin.Settled')}}</option>
                                <option value="refunded" {{ $status === 'refunded' ? 'selected' : '' }}>{{__('admin.Refunded')}}</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-md-4 d-flex align-items-end">
                            <div class="form-group w-100">
                              <button class="btn btn-primary">{{__('admin.Filter')}}</button>
                              <a href="{{ route('admin.commission-report') }}" class="btn btn-outline-secondary">{{__('admin.Reset')}}</a>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Sales')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ number_format($summary->total_gross ?? 0, 2) }}
                        </div>
                      </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-success">
                        <i class="fas fa-money-bill-wave"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Commission')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ number_format($summary->total_commission ?? 0, 2) }}
                        </div>
                      </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-info">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Sellers Net Profit')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ number_format($summary->total_seller_net ?? 0, 2) }}
                        </div>
                      </div>
                    </div>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-warning">
                        <i class="fas fa-clock"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Pending Seller Net')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ number_format($summary->pending_seller_net ?? 0, 2) }}
                        </div>
                      </div>
                    </div>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-success">
                        <i class="fas fa-check"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Settled Seller Net')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ number_format($summary->settled_seller_net ?? 0, 2) }}
                        </div>
                      </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header">
                      <h4>{{__('admin.Seller Breakdown')}}</h4>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive table-invoice">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>{{__('admin.Shop Name')}}</th>
                                    <th>{{__('admin.Total Sales')}}</th>
                                    <th>{{__('admin.Total Commission')}}</th>
                                    <th>{{__('admin.Net for Seller')}}</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($sellerBreakdown as $row)
                                    <tr>
                                        <td>{{ $row->vendor->shop_name ?? __('admin.N/A') }}</td>
                                        <td>{{ number_format($row->total_gross, 2) }}</td>
                                        <td>{{ number_format($row->total_commission, 2) }}</td>
                                        <td>{{ number_format($row->total_seller_net, 2) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center">{{__('admin.No Data Found')}}</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                      <div class="table-responsive table-invoice">
                        <table class="table table-striped" id="dataTable">
                            <thead>
                                <tr>
                                    <th>{{__('admin.Date')}}</th>
                                    <th>{{__('admin.Order ID')}}</th>
                                    <th>{{__('admin.Shop Name')}}</th>
                                    <th>{{__('admin.Gross Amount')}}</th>
                                    <th>{{__('admin.Commission')}} (%)</th>
                                    <th>{{__('admin.Commission Amount')}}</th>
                                    <th>{{__('admin.Net for Seller')}}</th>
                                    <th>{{__('admin.Status')}}</th>
                                  </tr>
                            </thead>
                            <tbody>
                                @foreach ($ledgers as $ledger)
                                    <tr>
                                        <td>{{ $ledger->created_at->format('Y-m-d') }}</td>
                                        <td><a href="{{ route('admin.order-show', $ledger->order_id) }}">#{{ $ledger->order->order_id }}</a></td>
                                        <td>{{ $ledger->vendor->shop_name }}</td>
                                        <td>{{ number_format($ledger->gross_amount, 2) }}</td>
                                        <td>{{ $ledger->commission_rate }}%</td>
                                        <td>{{ number_format($ledger->commission_amount, 2) }}</td>
                                        <td>{{ number_format($ledger->seller_net_amount, 2) }}</td>
                                        <td>
                                            @if ($ledger->status == 'pending')
                                                <div class="badge badge-warning">{{__('admin.Pending')}}</div>
                                            @elseif ($ledger->status == 'settled')
                                                <div class="badge badge-success">{{__('admin.Settled')}}</div>
                                            @else
                                                <div class="badge badge-danger">{{__('admin.Refunded')}}</div>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                      </div>
                      {{ $ledgers->links() }}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>
      </div>
@endsection
