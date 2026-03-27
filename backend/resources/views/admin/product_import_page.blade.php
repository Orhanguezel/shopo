@extends('admin.master_layout')
@section('title')
<title>{{__('admin.Product Bulk Import')}}</title>
@endsection
@section('admin-content')
      <!-- Main Content -->
      <div class="main-content">
        <section class="section">
          <div class="section-header">
            <h1>{{__('admin.Product Bulk Import')}}</h1>

          </div>

          <div class="section-body">
            <a href="{{ route('admin.product.index') }}" class="btn btn-primary"><i class="fas fa-list"></i> {{__('admin.Product List')}}</a>

            <a href="{{ route('admin.product-bulk-import-template') }}" class="btn btn-success"><i class="fas fa-file-download"></i> Download CSV Template</a>

            <a href="{{ route('admin.product-export') }}" class="btn btn-info"><i class="fas fa-file-export"></i> Legacy Export</a>

            <div class="row mt-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                        <form action="{{ route('admin.product-import') }}" method="POST" enctype="multipart/form-data">
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
                            $required = 'This Field is required';
                            $not_required = 'Not required';
                            $required_and_unique = 'This Field is required and unique';
                        @endphp
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
                            <td>{{ $required_and_unique }} , {{__('Slug and manufacture part no both are same')}}</td>
                        </tr>

                        <tr>
                            <td>{{__('Category')}}</td>
                            <td>{{ $required }}. Use category name from admin panel.</td>
                        </tr>

                        <tr>
                            <td>{{__('Sub category')}}</td>
                            <td>{{ $not_required }}. Use sub category name.</td>
                        </tr>

                        <tr>
                            <td>{{__('Child category')}}</td>
                            <td>{{ $not_required }}. Use child category name.</td>
                        </tr>

                        <tr>
                            <td>{{__('Brand')}}</td>
                            <td>{{ $not_required }}. Use brand name.</td>
                        </tr>

                        <tr>
                            <td>{{__('Sku')}}</td>
                            <td>{{ $not_required }}</td>
                        </tr>


                        <tr>
                            <td>{{__('Price')}}</td>
                            <td>{{ $required }}.{{__('Allowed only numeric value')}}</td>
                        </tr>

                        <tr>
                            <td>{{__('Offer price')}}</td>
                            <td>{{ $not_required }}.{{__('You can put only numeric value')}}</td>
                        </tr>

                        <tr>
                            <td>{{__('Quantity')}}</td>
                            <td>{{ $required }}.{{__('You can put only integer value')}}</td>
                        </tr>

                        <tr>
                            <td>{{__('Weight')}}</td>
                            <td>{{ $required }}.{{__('You can put only numeric value')}}</td>
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
                            <td>{{__('status')}}</td>
                            <td>{{ $required }}. Yes = 1, No= 0</td>
                        </tr>

                    </table>
                </div>
            </div>
        </div>

        <div class="section-body">
            <div class="card">
                <div class="card-header">
                    <h4>Recent Bulk Imports</h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Status</th>
                                    <th>Rows</th>
                                    <th>Success</th>
                                    <th>Errors</th>
                                    <th>Started</th>
                                    <th>Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($imports as $import)
                                    <tr>
                                        <td>{{ $import->original_name }}</td>
                                        <td><span class="badge badge-{{ $import->status === 'completed' ? 'success' : ($import->status === 'failed' ? 'danger' : 'warning') }}">{{ strtoupper($import->status) }}</span></td>
                                        <td>{{ $import->processed_rows }}/{{ $import->total_rows }}</td>
                                        <td>{{ $import->success_count }}</td>
                                        <td>{{ $import->error_count }}</td>
                                        <td>{{ optional($import->started_at)->format('d M Y H:i') ?: '-' }}</td>
                                        <td>{{ optional($import->completed_at)->format('d M Y H:i') ?: '-' }}</td>
                                    </tr>
                                    @if(!empty($import->error_log))
                                        <tr>
                                            <td colspan="7" class="bg-light">
                                                @foreach(array_slice($import->error_log, 0, 3) as $error)
                                                    <div>Row {{ $error['row'] ?? '?' }}: {{ $error['message'] ?? 'Unknown error' }}</div>
                                                @endforeach
                                                @if(count($import->error_log) > 3)
                                                    <div class="text-muted">+{{ count($import->error_log) - 3 }} more errors</div>
                                                @endif
                                            </td>
                                        </tr>
                                    @endif
                                @empty
                                    <tr>
                                        <td colspan="7" class="text-center">No bulk import history found.</td>
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
