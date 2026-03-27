@extends('admin.master_layout')
@section('title')
<title>Stock Alerts</title>
@endsection
@section('admin-content')
<div class="main-content">
  <section class="section">
    <div class="section-header">
      <h1>Stock Alerts</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="{{ route('admin.dashboard') }}">{{__('admin.Dashboard')}}</a></div>
        <div class="breadcrumb-item">Stock Alerts</div>
      </div>
    </div>

    <div class="section-body">
      <div class="row">
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon bg-danger">
              <i class="fas fa-box-open"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header"><h4>Low Stock Products</h4></div>
              <div class="card-body">{{ $products->count() }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-sliders-h"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header"><h4>Current Threshold</h4></div>
              <div class="card-body">{{ $threshold }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-statistic-1">
            <div class="card-icon {{ ($setting->stock_alert_enabled ?? true) ? 'bg-success' : 'bg-secondary' }}">
              <i class="fas fa-bell"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header"><h4>Alert Status</h4></div>
              <div class="card-body">{{ ($setting->stock_alert_enabled ?? true) ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h4>Alert Settings</h4>
        </div>
        <div class="card-body">
          <form action="{{ route('admin.stock-alerts.update') }}" method="POST">
            @csrf
            @method('PUT')
            <div class="row">
              <div class="form-group col-md-6">
                <label>Low Stock Threshold</label>
                <input type="number" min="1" max="1000" name="low_stock_threshold" class="form-control" value="{{ old('low_stock_threshold', $threshold) }}" required>
              </div>
              <div class="form-group col-md-6">
                <label>Stock Alerts</label>
                <select name="stock_alert_enabled" class="form-control">
                  <option value="1" {{ (int) old('stock_alert_enabled', $setting->stock_alert_enabled ?? 1) === 1 ? 'selected' : '' }}>Enable</option>
                  <option value="0" {{ (int) old('stock_alert_enabled', $setting->stock_alert_enabled ?? 1) === 0 ? 'selected' : '' }}>Disable</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h4>Products At Or Below Threshold</h4>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped" id="dataTable">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Name</th>
                  <th>Seller</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @foreach($products as $index => $product)
                  <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $product->name }}</td>
                    <td>{{ optional($product->seller)->shop_name ?: 'Admin Product' }}</td>
                    <td>{{ $product->sku ?: '-' }}</td>
                    <td><span class="badge badge-danger">{{ $product->qty }}</span></td>
                    <td>
                      @if($product->status == 1)
                        <span class="badge badge-success">Active</span>
                      @else
                        <span class="badge badge-secondary">Inactive</span>
                      @endif
                    </td>
                    <td>
                      <a href="{{ route('admin.product.edit', $product->id) }}" class="btn btn-primary btn-sm">
                        <i class="fa fa-edit"></i>
                      </a>
                      <a href="{{ route('admin.stock-history', $product->id) }}" class="btn btn-info btn-sm">
                        <i class="fas fa-history"></i>
                      </a>
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          </div>

          @if($products->isEmpty())
            <div class="alert alert-info mb-0">No products are currently at or below the low stock threshold.</div>
          @endif
        </div>
      </div>
    </div>
  </section>
</div>
@endsection
