@extends('seller.master_layout')
@section('title')
<title>{{__('admin.Product Bulk Import')}}</title>
@endsection
@section('seller-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>{{__('admin.Product Bulk Import')}}</h1>

          </div>

          <div class="section-body">
            <a href="{{ route('seller.product.index') }}" class="btn btn-primary"><i class="fas fa-list"></i> {{__('admin.Product List')}}</a>

            <a href="{{ route('seller.product-export') }}" class="btn btn-success"><i class="fas fa-file-export"></i> {{__('admin.Export Product List')}}</a>

            <a href="{{ route('seller.product-demo-export') }}" class="btn btn-primary"><i class="fas fa-file-export"></i> {{__('admin.Demo Export')}}</a>

            <div class="row mt-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                        <form action="{{ route('seller.product-import') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="row">
                                <div class="form-group col-12">
                                    <label>{{__('admin.Import File')}} <span class="text-danger">*</span></label>
                                    <input type="file" id="name" class="form-control-file"  name="import_file" required>
                                </div>

                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <button class="btn btn-primary">{{__('admin.Upload')}}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                  </div>
                </div>
          </div>

          <div class="section-body">
            <div class="card">
                <div class="card-body">
                    <table class="table">
                        @php
                            $required = 'Bu alan zorunludur';
                            $not_required = 'Zorunlu değil';
                            $required_and_unique = 'Bu alan zorunludur ve benzersiz olmalıdır';
                        @endphp
                        <tr>
                            <td>{{__('Thumbnail Image')}}</td>
                            <td>{{ $required }}</td>
                        </tr>

                        <tr>
                            <td>{{__('Name')}}</td>
                            <td>{{ $required }}</td>
                        </tr>

                        <tr>
                            <td>{{__('Short Name')}}</td>
                            <td>{{ $required }}</td>
                        </tr>

                        <tr>
                            <td>{{__('Slug')}}</td>
                            <td>{{ $required_and_unique }}. Slug ve ürün parça numarası aynıdır.</td>
                        </tr>

                        <tr>
                            <td>{{__('Category Id')}}</td>
                            <td>{{ $required }}.</td>
                        </tr>

                        <tr>
                            <td>{{__('Sub category id')}}</td>
                            <td>Alt kategori yoksa 0 yazın</td>
                        </tr>

                        <tr>
                            <td>{{__('Child category id')}}</td>
                            <td>Alt alt kategori yoksa 0 yazın</td>
                        </tr>

                        <tr>
                            <td>{{__('Brand id')}}</td>
                            <td>Marka yoksa 0 yazın</td>
                        </tr>

                        <tr>
                            <td>{{__('Sku')}}</td>
                            <td>{{ $not_required }}</td>
                        </tr>


                        <tr>
                            <td>{{__('Price')}}</td>
                            <td>{{ $required }}. Sadece sayısal değer giriniz.</td>
                        </tr>

                        <tr>
                            <td>{{__('Offer price')}}</td>
                            <td>{{ $not_required }}.Sadece sayısal değer giriniz.</td>
                        </tr>

                        <tr>
                            <td>{{__('Quantity')}}</td>
                            <td>{{ $required }}.Sadece sayısal değer giriniz.</td>
                        </tr>

                        <tr>
                            <td>{{__('Weight')}}</td>
                            <td>{{ $required }}.Sadece sayısal değer giriniz.</td>
                        </tr>

                        <tr>
                            <td>{{__('Vendor Id')}}</td>
                            <td>{{ $required }}. Satıcı kimliğiniz = {{ $seller->id }}</td>
                        </tr>


                        <tr>
                            <td>{{__('Short description')}}</td>
                            <td>{{ $required }}.</td>
                        </tr>

                        <tr>
                            <td>{{__('Long description')}}</td>
                            <td>{{ $required }}.</td>
                        </tr>

                        <tr>
                            <td>{{__('Top Product')}}</td>
                            <td>{{ $required }}. 0 veya 1 yazın. 0 = Hayır, 1 = Evet</td>
                        </tr>

                        <tr>
                            <td>{{__('New Arrival')}}</td>
                            <td>{{ $required }}. 0 veya 1 yazın. 0 = Hayır, 1 = Evet</td>
                        </tr>

                        <tr>
                            <td>{{__('Best Product')}}</td>
                            <td>{{ $required }}. 0 veya 1 yazın. 0 = Hayır, 1 = Evet</td>
                        </tr>

                        <tr>
                            <td>{{__('Featured Product')}}</td>
                            <td>{{ $required }}. 0 veya 1 yazın. 0 = Hayır, 1 = Evet</td>
                        </tr>

                        <tr>
                            <td>{{__('status')}}</td>
                            <td>{{ $required }}. Evet = 1, Hayır = 0</td>
                        </tr>

                        <tr>
                            <td>{{__('Is specification')}}</td>
                            <td>{{ $required }}. Evet = 1, Hayır = 0</td>
                        </tr>

                        <tr>
                            <td>{{__('Approve by admin')}}</td>
                            <td>{{ $required }}. Evet = 1, Hayır = 0</td>
                        </tr>

                    </table>
                </div>
            </div>
        </div>

        </section>
      </div>

@endsection
