{{-- Ortak: ödeme + sipariş bilgisi + (admin) teslimat görevlisi --}}
<div class="row">
    <div class="col-md-6">
        <address>
            <strong>{{ __('admin.Payment Information') }}:</strong><br>
            {{ __('admin.Method') }}: {{ $order->payment_method }}<br>
            {{ __('admin.Status') }} :
            @if ($order->payment_status == 1)
                <span class="badge badge-success">{{ __('admin.Success') }}</span>
            @else
                <span class="badge badge-danger">{{ __('admin.Pending') }}</span>
            @endif
            <br>
            {{ __('admin.Transaction') }}: {!! clean(nl2br($order->transection_id)) !!}
        </address>
    </div>
    <div class="col-md-6 text-md-right">
        <address>
            <strong>{{ __('admin.Order Information') }}:</strong><br>
            {{ __('admin.Date') }}: {{ $order->created_at->format('d F, Y') }}<br>
            {{ __('admin.Shipping') }}: {{ $order->shipping_method }}<br>
            {{ __('admin.Status') }} :
            @if ($order->order_status == 1)
                <span class="badge badge-success">{{ __('admin.Pregress') }} </span>
            @elseif ($order->order_status == 2)
                <span class="badge badge-success">{{ __('admin.Delivered') }} </span>
            @elseif ($order->order_status == 3)
                <span class="badge badge-success">{{ __('admin.Completed') }} </span>
            @elseif ($order->order_status == 4)
                <span class="badge badge-danger">{{ __('admin.Declined') }} </span>
            @else
                <span class="badge badge-danger">{{ __('admin.Pending') }}</span>
            @endif

            @if (($invoiceContext ?? 'admin') === 'seller')
                @if ((int) $order->order_status === 0)
                    <div class="mt-2">
                        <form action="{{ route('seller.update-order-status', $order->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            <input type="hidden" name="order_status" value="1" />
                            <button class="btn btn-success btn-sm" type="submit">Siparişi Onayla</button>
                        </form>
                    </div>
                @endif
                @if ((int) $order->order_status === 1)
                    <div class="mt-2">
                        <form action="{{ route('seller.update-order-status', $order->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            <input type="hidden" name="order_status" value="2" />
                            <button class="btn btn-info btn-sm" type="submit">Teslim Edildi</button>
                        </form>
                    </div>
                @endif
            @endif
        </address>

        @if ($setting->map_status == 1)
            <address>
                <strong>{{ __('admin.Delivery Location') }} :</strong><br><br>
                <button class="badge badge-success" data-toggle="modal" data-target="#mapModal" id="viewMapButton">{{ __('admin.View Map') }}</button>
            </address>
        @endif
    </div>

    @include('partials.order_invoice.delivery_man_block', ['order' => $order, 'invoiceContext' => $invoiceContext ?? 'admin'])
</div>
