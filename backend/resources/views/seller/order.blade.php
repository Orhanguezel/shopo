@extends('seller.master_layout')
@section('title')
<title>{{ $title }}</title>
@endsection
@section('seller-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>{{ $title }}</h1>
            <div class="section-header-breadcrumb">
              <div class="breadcrumb-item active"><a href="{{ route('seller.dashboard') }}">{{__('admin.Dashboard') }}</a></div>
              <div class="breadcrumb-item">{{ $title }}</div>
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
                                    <th width="10%">{{__('admin.Customer')}}</th>
                                    <th width="10%">{{__('admin.Order Id')}}</th>
                                    <th width="15%">{{__('admin.Date')}}</th>
                                    <th width="10%">{{__('admin.Quantity')}}</th>
                                    <th width="10%">{{__('admin.Amount')}}</th>
                                    <th width="10%">{{__('admin.Order Status')}}</th>
                                    <th width="10%">{{__('admin.Payment')}}</th>
                                    <th width="22%">{{__('admin.Action')}}</th>
                                  </tr>
                            </thead>
                            <tbody>
                                @foreach ($orders as $index => $order)
                                    <tr>
                                        <td>{{ ++$index }}</td>
                                        <td>{{ $order->user->name }}</td>
                                        <td>{{ $order->order_id }}</td>
                                        <td>{{ $order->created_at->format('d F, Y') }}</td>
                                        <td>{{ $order->product_qty }}</td>
                                        <td>{{ $setting->currency_icon }}{{ round($order->total_amount) }}</td>
                                        <td>
                                            @if ($order->order_status == 1)
                                            <span class="badge badge-success">{{__('admin.Pregress')}} </span>
                                            @elseif ($order->order_status == 2)
                                            <span class="badge badge-success">{{__('admin.Delivered')}} </span>
                                            @elseif ($order->order_status == 3)
                                            <span class="badge badge-success">{{__('admin.Completed')}} </span>
                                            @elseif ($order->order_status == 4)
                                            <span class="badge badge-danger">{{__('admin.Declined')}} </span>
                                            @else
                                            <span class="badge badge-danger">{{__('admin.Pending')}}</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($order->payment_status == 1)
                                            <span class="badge badge-success">{{__('admin.success')}} </span>
                                            @else
                                            <span class="badge badge-danger">{{__('admin.Pending')}}</span>
                                            @endif
                                        </td>

                                        <td>
                                        @php
                                            $cargo = $order->cargoShipment;
                                            $hasActiveCargo = $cargo && ($cargo->status ?? '') !== 'cancelled';
                                            $canShipCargo = ! $hasActiveCargo && in_array((int) $order->order_status, [0, 1], true);
                                        @endphp
                                        <div class="d-flex flex-wrap align-items-center" style="gap: 4px;">
                                        <a href="{{ route('seller.order-show',$order->id) }}" class="btn btn-primary btn-sm" title="{{__('admin.View')}}"><i class="fa fa-eye" aria-hidden="true"></i></a>

                                        @if((int) $order->order_status === 0)
                                        <form action="{{ route('seller.update-order-status', $order->id) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('PUT')
                                            <input type="hidden" name="order_status" value="1" />
                                            <button type="submit" class="btn btn-success btn-sm">Onayla</button>
                                        </form>
                                        @endif

                                        @if((int) $order->order_status === 1)
                                        <form action="{{ route('seller.update-order-status', $order->id) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('PUT')
                                            <input type="hidden" name="order_status" value="2" />
                                            <button type="submit" class="btn btn-info btn-sm">Teslim Edildi</button>
                                        </form>
                                        @endif

                                        @if($canShipCargo)
                                        <button type="button" class="btn btn-warning btn-sm btn-seller-list-cargo" data-order-id="{{ $order->id }}">Kargoya Ver</button>
                                        @elseif($hasActiveCargo && in_array((int) $order->order_status, [0, 1], true))
                                        <span class="badge badge-secondary">Kargo oluşturuldu</span>
                                        @endif
                                        </div>
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

      <script>
      (function($) {
          "use strict";
          $(document).on("click", ".btn-seller-list-cargo", function () {
              var orderId = $(this).data("order-id");
              var $btn = $(this);
              var originalText = $btn.text();
              var csrfToken = $('meta[name="csrf-token"]').attr("content");
              $btn.prop("disabled", true).text("Kargo…");
              $.ajax({
                  url: "{{ url('seller/orders') }}/" + orderId + "/cargo",
                  method: "POST",
                  data: { _token: csrfToken },
                  success: function (response) {
                      if (typeof toastr !== "undefined") {
                          toastr.success(response.message || "Kargo oluşturuldu.");
                      }
                      window.location.reload();
                  },
                  error: function (xhr) {
                      var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : "Kargo oluşturulamadı.";
                      if (typeof toastr !== "undefined") {
                          toastr.error(msg);
                      } else {
                          alert(msg);
                      }
                      $btn.prop("disabled", false).text(originalText);
                  }
              });
          });
      })(jQuery);
      </script>

@endsection
