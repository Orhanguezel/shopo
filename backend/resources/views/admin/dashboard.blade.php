@extends('admin.master_layout')
@section('title')
<title>{{__('admin.Dashboard')}}</title>
@endsection
@section('admin-content')
<!-- Main Content -->
<div class="main-content">
    <section class="section">
      <div class="section-header">
        <h1>{{__('admin.Dashbaord')}}</h1>
      </div>

      <div class="section-body">
      <h2 class="d-title">{{__('admin.Orders')}}</h2>
      <div class="row">

       <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Today Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $todayOrders->count() }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Today Pending Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $todayPendingOrder }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $todayTotalOrder }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Pending Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $totalPendingOrder }}
                        </div>
                      </div>
                    </div>
                  </div>


                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Declined Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $totalDeclinedOrder }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-primary">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Complete Order')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $totalCompleteOrder }}
                        </div>
                      </div>
                    </div>
                  </div>
      </div>
      <h2 class="d-title">{{__('admin.Sale')}}</h2>
            <div class="row">
             <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                          <div class="card card-statistic-1">
                            <div class="card-icon bg-success">
                              <i class="fab fa-get-pocket"></i>
                            </div>
                            <div class="card-wrap">
                              <div class="card-header">
                                <h4>{{__('admin.Today Product Sale')}}</h4>
                              </div>
                              <div class="card-body">
                                {{ $todayProductSale }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                          <div class="card card-statistic-1">
                            <div class="card-icon bg-success">
                              <i class="fab fa-get-pocket"></i>
                            </div>
                            <div class="card-wrap">
                              <div class="card-header">
                                <h4>{{__('admin.This Month Product Sale')}}</h4>
                              </div>
                              <div class="card-body">
                                {{ $thisMonthProductSale }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                          <div class="card card-statistic-1">
                            <div class="card-icon bg-success">
                              <i class="fab fa-get-pocket"></i>
                            </div>
                            <div class="card-wrap">
                              <div class="card-header">
                                <h4>{{__('admin.This Year Product Sale')}}</h4>
                              </div>
                              <div class="card-body">
                                {{ $thisYearProductSale }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                          <div class="card card-statistic-1">
                            <div class="card-icon bg-success">
                              <i class="fab fa-get-pocket"></i>
                            </div>
                            <div class="card-wrap">
                              <div class="card-header">
                                <h4>{{__('admin.Total Product Sale')}}</h4>
                              </div>
                              <div class="card-body">
                                {{ $totalProductSale }}
                              </div>
                            </div>
                          </div>
                        </div>
            </div>
       <h2 class="d-title">{{__('Earning')}}</h2>
      <div class="row">
         <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                      <div class="card card-statistic-1">
                        <div class="card-icon bg-danger">
                          <i class="fas fa-money-bill-alt"></i>
                        </div>
                        <div class="card-wrap">
                          <div class="card-header">
                            <h4>{{__('admin.Today Earning')}}</h4>
                          </div>
                          <div class="card-body">
                            {{ $setting->currency_icon }}{{ round($todayEarning,2) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                      <div class="card card-statistic-1">
                        <div class="card-icon bg-danger">
                          <i class="fas fa-money-bill-alt"></i>
                        </div>
                        <div class="card-wrap">
                          <div class="card-header">
                            <h4>{{__('admin.Today Pending Earning')}}</h4>
                          </div>
                          <div class="card-body">
                            {{ $setting->currency_icon }}{{ round($todayPendingEarning,2) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                      <div class="card card-statistic-1">
                        <div class="card-icon bg-danger">
                          <i class="fas fa-money-bill-alt"></i>
                        </div>
                        <div class="card-wrap">
                          <div class="card-header">
                            <h4>{{__('admin.This month Earning')}}</h4>
                          </div>
                          <div class="card-body">
                            {{ $setting->currency_icon }}{{ round($thisMonthEarning,2) }}
                          </div>
                        </div>
                      </div>
                    </div>



                    <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                      <div class="card card-statistic-1">
                        <div class="card-icon bg-danger">
                          <i class="fas fa-money-bill-alt"></i>
                        </div>
                        <div class="card-wrap">
                          <div class="card-header">
                            <h4>{{__('admin.This Year Earning')}}</h4>
                          </div>
                          <div class="card-body">
                            {{ $setting->currency_icon }}{{ round($thisYearEarning,2) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                      <div class="card card-statistic-1">
                        <div class="card-icon bg-danger">
                          <i class="fas fa-money-bill-alt"></i>
                        </div>
                        <div class="card-wrap">
                          <div class="card-header">
                            <h4>{{__('admin.Total Earning')}}</h4>
                          </div>
                          <div class="card-body">
                            {{ $setting->currency_icon }}{{ round($totalEarning,2) }}
                          </div>
                        </div>
                      </div>
                    </div>
      </div>

       <h2 class="d-title">{{__('admin.Product')}}</h2>
      <div class="row">

      <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-info">
                        <i class="fas fa-box"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Product')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $totalProduct }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-info">
                        <i class="fas fa-box"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Product Report')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $reports }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
                    <div class="card card-statistic-1">
                      <div class="card-icon bg-info">
                        <i class="fas fa-box"></i>
                      </div>
                      <div class="card-wrap">
                        <div class="card-header">
                          <h4>{{__('admin.Total Product Review')}}</h4>
                        </div>
                        <div class="card-body">
                          {{ $reviews }}
                        </div>
                      </div>
                    </div>
                  </div>
      </div>
      <h2 class="d-title">{{__('admin.Others')}}</h2>
        <div class="row">
            <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
              <div class="card card-statistic-1">
                <div class="card-icon bg-warning">
                  <i class="far fa-user"></i>
                </div>
                <div class="card-wrap">
                  <div class="card-header">
                    <h4>{{__('admin.Total Seller')}}</h4>
                  </div>
                  <div class="card-body">
                    {{ $sellers }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
              <div class="card card-statistic-1">
                <div class="card-icon  bg-warning">
                  <i class="far fa-user"></i>
                </div>
                <div class="card-wrap">
                  <div class="card-header">
                    <h4>{{__('admin.Total User')}}</h4>
                  </div>
                  <div class="card-body">
                    {{ $users }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
              <div class="card card-statistic-1">
                <div class="card-icon  bg-warning">
                  <i class="fas fa-hand-point-up"></i>
                </div>
                <div class="card-wrap">
                  <div class="card-header">
                    <h4>{{__('admin.Total Subscriber')}}</h4>
                  </div>
                  <div class="card-body">
                    {{ $subscribers }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
              <div class="card card-statistic-1">
                <div class="card-icon  bg-warning">
                  <i class="fas fa-box"></i>
                </div>
                <div class="card-wrap">
                  <div class="card-header">
                    <h4>{{__('admin.Product Category')}}</h4>
                  </div>
                  <div class="card-body">
                    {{ $categories }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 col-12">
              <div class="card card-statistic-1">
                <div class="card-icon  bg-warning">
                  <i class="fab fa-asymmetrik"></i>
                </div>
                <div class="card-wrap">
                  <div class="card-header">
                    <h4>{{__('admin.Total Brand')}}</h4>
                  </div>
                  <div class="card-body">
                    {{ $brands }}
                  </div>
                </div>
              </div>
            </div>

          </div>
      </div>



      <div class="section-body row mt-4">
          <div class="col-12">
              <!-- Charts One -->
              <div class="card charts-main charts-home-one p-4">
                  <!-- Top Heading -->
                  <div class="card-header">
                      <h3>{{ __('Order Statitics') }}</h3>

                  </div>
                  <div class="charts-main__one">
                      <div class="tab-content" id="nav-tabContent">
                          <div class="tab-pane fade show active" id="crancy-chart__s1" role="tabpanel" aria-labelledby="crancy-chart__s1">
                              <div class="crancy-chart__inside crancy-chart__three">
                                  <!-- Chart One -->
                                  <canvas id="myChart_recent_statics"></canvas>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <!-- End Charts One -->
          </div>
      </div>


      <div class="section-body">
        <div class="row mt-4">
            <div class="col">
              <div class="card">
                  <div class="card-header">
                    <h3>{{__('admin.Today New Order')}}</h3>
                  </div>
                <div class="card-body">
                  <div class="table-responsive table-invoice">
                    <table class="table table-striped" id="dataTable">
                        <thead>
                            <tr>
                                <th width="5%">{{__('admin.SN')}}</th>
                                <th width="10%">{{__('admin.Customer')}}</th>
                                <th width="10%">{{__('admin.Order Id')}}</th>
                                <th width="10%">{{__('admin.Date')}}</th>
                                <th width="10%">{{__('admin.Quantity')}}</th>
                                <th width="10%">{{__('admin.Amount')}}</th>
                                <th width="10%">{{__('admin.Order Status')}}</th>
                                <th width="10%">{{__('admin.Payment')}}</th>
                                <th width="15%">{{__('admin.Action')}}</th>
                              </tr>
                        </thead>
                        <tbody>
                            @foreach ($todayOrders->where('order_status',0) as $index => $order)
                                <tr>
                                    <td>{{ ++$index }}</td>
                                    <td>{{ $order->user->name }}</td>
                                    <td>{{ $order->order_id }}</td>
                                    <td>{{ $order->created_at->format('d F, Y') }}</td>
                                    <td>{{ $order->product_qty }}</td>
                                    <td>{{ $setting->currency_icon }}{{ $order->amount_real_currency }}</td>
                                    <td>
                                        @if ($order->order_status == 1)
                                        <span class="badge badge-success">{{__('admin.Pregress')}} </span>
                                        @elseif ($order->order_status == 2)
                                        <span class="badge badge-success">{{__('admin.Delivered')}} </span>
                                        @elseif ($order->order_status == 3)
                                        <span class="badge badge-success">{{__('admin.Completed')}}</span>
                                        @elseif ($order->order_status == 4)
                                        <span class="badge badge-danger">{{__('admin.Declined')}}</span>
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

                                    <a href="{{ route('admin.order-show',$order->id) }}" class="btn btn-primary btn-sm"><i class="fa fa-eye" aria-hidden="true"></i></a>

                                    <a href="javascript:;" data-toggle="modal" data-target="#deleteModal" class="btn btn-danger btn-sm" onclick="deleteData({{ $order->id }})"><i class="fa fa-trash" aria-hidden="true"></i></a>

                                    <a href="javascript:;" data-toggle="modal" data-target="#orderModalId-{{ $order->id }}" class="btn btn-warning btn-sm"><i class="fas fa-truck" aria-hidden="true"></i></a>
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

   <!-- Modal -->
   @foreach ($todayOrders as $index => $order)
   <div class="modal fade" id="orderModalId-{{ $order->id }}" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
       <div class="modal-dialog" role="document">
           <div class="modal-content">
                   <div class="modal-header">
                           <h5 class="modal-title">{{__('admin.Order Status')}}</h5>
                               <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                   <span aria-hidden="true">&times;</span>
                               </button>
                       </div>
               <div class="modal-body">
                   <div class="container-fluid">
                       <form action="{{ route('admin.update-order-status',$order->id) }}" method="POST">
                         @method('PUT')
                           @csrf
                           <div class="form-group">
                               <label for="">{{__('admin.Payment')}}</label>
                               <select name="payment_status" id="" class="form-control">
                                   <option {{ $order->payment_status == 0 ? 'selected' : '' }} value="0">{{__('admin.Pending')}}</option>
                                   <option {{ $order->payment_status == 1 ? 'selected' : '' }} value="1">{{__('admin.Success')}}</option>
                               </select>
                           </div>
                           <div class="form-group">
                               <label for="">{{__('admin.Order')}}</label>
                               <select name="order_status" id="" class="form-control">
                                 <option {{ $order->order_status == 0 ? 'selected' : '' }} value="0">{{__('admin.Pending')}}</option>
                                 <option {{ $order->order_status == 1 ? 'selected' : '' }} value="1">{{__('admin.In Progress')}}</option>
                                 <option {{ $order->order_status == 2 ? 'selected' : '' }}  value="2">{{__('admin.Delivered')}}</option>
                                 <option {{ $order->order_status == 3 ? 'selected' : '' }} value="3">{{__('admin.Completed')}}</option>
                                 <option {{ $order->order_status == 4 ? 'selected' : '' }} value="4">{{__('admin.Declined')}}</option>
                               </select>
                           </div>


                   </div>
               </div>
               <div class="modal-footer">
                   <button type="button" class="btn btn-danger" data-dismiss="modal">{{__('admin.Close')}}</button>
                   <button type="submit" class="btn btn-primary">{{__('admin.Update Status')}}</button>
               </div>
             </form>
           </div>
       </div>
   </div>

   @endforeach

   <script>
    function deleteData(id){
        $("#deleteForm").attr("action",'{{ url("admin/delete-order/") }}'+"/"+id)
    }
</script>

  <script src="{{ asset('backend/js/charts.js') }}"></script>
  <script>
      "use strict";

      let purchase_data = {{ $data }};
      let date_label = {{ $lable }};

      // Chart
      const ctx = document.getElementById('myChart_recent_statics').getContext('2d');
      const gradientBgs = ctx.createLinearGradient(400, 100, 100, 400);
        gradientBgs.addColorStop(0, 'rgba(103, 119, 239, 0.3)'); 
        gradientBgs.addColorStop(1, 'rgba(103, 119, 239, 1)'); 


      const myChart_recent_statics = new Chart(ctx, {
          type: 'line',
          data: {
              labels: date_label,
              datasets: [{
                  label: 'Sales',
                  data: purchase_data,
                  backgroundColor: gradientBgs,
                  borderColor: '#6777ef',
                  borderWidth: 3,
                  tension: 0.4,
                  pointRadius: 2,
                  fill: 'start',
              }]
          },
          options: {
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                  x: {
                      ticks: {
                          color: '#9AA2B1',
                      },
                      grid: {
                          display: false,
                          drawBorder: false,
                          color: '#E6F3FF',
                      },
                  },
                  y: {
                      ticks: {
                          color: '#5D6A83',
                          callback: function(value) {
                              return value + ' $';
                          }
                      },
                      grid: {
                          drawBorder: false,
                          color: '#D7DCE7',
                          borderDash: [5, 5]
                      },
                  },
              },
              plugins: {
                  tooltip: {
                      padding: 10,
                      displayColors: true,
                      yAlign: 'bottom',
                      backgroundColor: '#fff',
                      titleColor: '#000',
                      bodyColor: '#2F3032',
                      cornerRadius: 12,
                      boxPadding: 3,
                      usePointStyle: true,
                      borderWidth: 0,
                      font: { size: 14 },
                      caretSize: 9,
                  },
                  legend: {
                      position: 'bottom',
                      display: false,
                  },
                  title: {
                      display: false,
                      text: "{{ __('Order Statistics') }}"
                  }
              }
          }
      });

  </script>


@endsection
