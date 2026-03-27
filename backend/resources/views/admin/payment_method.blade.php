@extends('admin.master_layout')
@section('title')
<title>{{ __('admin.Payment Methods') }}</title>
@endsection
@section('admin-content')
<div class="main-content">
    <section class="section">
        <div class="section-header">
            <h1>{{ __('admin.Payment Methods') }}</h1>
            <div class="section-header-breadcrumb">
                <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{ __('admin.Dashboard') }}</a></div>
            </div>
        </div>

        <div class="section-body">
            <div class="row mt-4">
                <div class="col">
                    <div class="card">
                        <div class="card-header"></div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 col-sm-12 col-md-3">
                                    <ul class="nav nav-pills flex-column" id="myTab4" role="tablist">
                                        <li class="nav-item border rounded mb-1">
                                            <a class="nav-link active" id="iyzico-tab" data-toggle="tab" href="#iyzicoTab" role="tab" aria-controls="iyzicoTab" aria-selected="true">Iyzico</a>
                                        </li>
                                        <li class="nav-item border rounded mb-1">
                                            <a class="nav-link" id="bank-account-tab" data-toggle="tab" href="#bankAccountTab" role="tab" aria-controls="bankAccountTab" aria-selected="false">{{ __('admin.Bank Account') }}</a>
                                        </li>
                                        @if ($bank)
                                            <li class="nav-item border rounded mb-1">
                                                <a class="nav-link" id="cash-tab" data-toggle="tab" href="#cashTab" role="tab" aria-controls="cashTab" aria-selected="false">{{ __('admin.Cash On Deliver') }}</a>
                                            </li>
                                        @endif
                                    </ul>
                                </div>
                                <div class="col-12 col-sm-12 col-md-9">
                                    <div class="border rounded">
                                        <div class="tab-content no-padding" id="settingsContent">
                                            <div class="tab-pane fade show active" id="iyzicoTab" role="tabpanel" aria-labelledby="iyzico-tab">
                                                <div class="card m-0">
                                                    <div class="card-body">
                                                        <form action="{{ route('admin.update-iyzico') }}" method="POST">
                                                            @csrf
                                                            @method('PUT')
                                                            <div class="form-group">
                                                                <label>Iyzico Status</label>
                                                                <div>
                                                                    <input id="status_toggle" type="checkbox" {{ optional($iyzico)->status == 1 ? 'checked' : '' }} data-toggle="toggle" data-on="{{ __('admin.Enable') }}" data-off="{{ __('admin.Disable') }}" data-onstyle="success" data-offstyle="danger" name="status">
                                                                </div>
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Iyzico API Key</label>
                                                                <input type="text" class="form-control" name="api_key" value="{{ optional($iyzico)->api_key }}">
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Iyzico Secret Key</label>
                                                                <input type="text" class="form-control" name="secret_key" value="{{ optional($iyzico)->secret_key }}">
                                                            </div>
                                                            <div class="form-group">
                                                                <label>{{ __('admin.Currency Name') }}</label>
                                                                <select name="currency_name" class="form-control select2">
                                                                    <option value="">{{ __('admin.Select Currency') }}</option>
                                                                    @foreach ($currencies as $currency)
                                                                        <option {{ optional($iyzico)->currency_id == $currency->id ? 'selected' : '' }} value="{{ $currency->id }}">{{ $currency->currency_name }}</option>
                                                                    @endforeach
                                                                </select>
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Test Mode</label>
                                                                <div>
                                                                    <input id="status_toggle" type="checkbox" {{ optional($iyzico)->is_test_mode == 1 ? 'checked' : '' }} data-toggle="toggle" data-on="{{ __('admin.Enable') }}" data-off="{{ __('admin.Disable') }}" data-onstyle="success" data-offstyle="danger" name="is_test_mode">
                                                                </div>
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Marketplace Mode</label>
                                                                <div>
                                                                    <input id="status_toggle" type="checkbox" {{ optional($iyzico)->marketplace_mode == 1 ? 'checked' : '' }} data-toggle="toggle" data-on="{{ __('admin.Enable') }}" data-off="{{ __('admin.Disable') }}" data-onstyle="success" data-offstyle="danger" name="marketplace_mode">
                                                                </div>
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Default Sub Merchant Key</label>
                                                                <input type="text" class="form-control" name="sub_merchant_key" value="{{ optional($iyzico)->sub_merchant_key }}">
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Store Sub Merchant Keys (JSON)</label>
                                                                <textarea name="store_sub_merchant_keys" cols="30" rows="6" class="form-control text-area-5">{{ optional($iyzico)->store_sub_merchant_keys }}</textarea>
                                                            </div>
                                                            <button class="btn btn-primary">{{ __('admin.Update') }}</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="tab-pane fade" id="bankAccountTab" role="tabpanel" aria-labelledby="bank-account-tab">
                                                <div class="card m-0">
                                                    <div class="card-body">
                                                        <form action="{{ route('admin.update-bank') }}" method="POST">
                                                            @csrf
                                                            @method('PUT')
                                                            <div class="form-group">
                                                                <label>{{ __('admin.Bank Payment Status') }}</label>
                                                                <div>
                                                                    <input id="status_toggle" type="checkbox" {{ $bank->status == 1 ? 'checked' : '' }} data-toggle="toggle" data-on="{{ __('admin.Enable') }}" data-off="{{ __('admin.Disable') }}" data-onstyle="success" data-offstyle="danger" name="status">
                                                                </div>
                                                            </div>
                                                            <div class="form-group">
                                                                <label>{{ __('admin.Account Information') }}</label>
                                                                <textarea name="account_info" cols="30" rows="10" class="text-area-5 form-control">{{ $bank->account_info }}</textarea>
                                                            </div>
                                                            <button class="btn btn-primary">{{ __('admin.Update') }}</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>

                                            @if ($bank)
                                                <div class="tab-pane fade" id="cashTab" role="tabpanel" aria-labelledby="cash-tab">
                                                    <div class="card m-0">
                                                        <div class="card-body">
                                                            <div class="form-group">
                                                                <label>{{ __('admin.Cash on delivery Status') }}</label>
                                                                <div>
                                                                    <a onclick="changeCashOnDeliveryStatus()" href="javascript:;">
                                                                        <input id="status_toggle" type="checkbox" {{ $bank->cash_on_delivery_status == 1 ? 'checked' : '' }} data-toggle="toggle" data-on="{{ __('admin.Enable') }}" data-off="{{ __('admin.Disable') }}" data-onstyle="success" data-offstyle="danger" name="status">
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<script>
    function changeCashOnDeliveryStatus() {
        var isDemo = "{{ env('APP_VERSION') }}";
        if (isDemo == 0) {
            toastr.error('This Is Demo Version. You Can Not Change Anything');
            return;
        }

        $.ajax({
            type: "put",
            data: { _token: '{{ csrf_token() }}' },
            url: "{{ route('admin.update-cash-on-delivery') }}",
            success: function(response) {
                toastr.success(response);
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
</script>
@endsection
