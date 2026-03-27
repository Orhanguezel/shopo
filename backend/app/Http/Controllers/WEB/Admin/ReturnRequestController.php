<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReturnRequest;
use App\Models\Setting;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;

class ReturnRequestController extends Controller
{
    protected $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->middleware('auth:admin');
        $this->commissionService = $commissionService;
    }

    public function index()
    {
        $returns = ReturnRequest::with(['order', 'orderProduct.product', 'user', 'seller'])
                               ->orderBy('id', 'desc')
                               ->get();

        return view('admin.return_request', compact('returns'));
    }

    public function show($id)
    {
        $setting = Setting::first();
        $return = ReturnRequest::with(['order', 'orderProduct.product', 'user', 'seller', 'images'])
                              ->find($id);

        if (!$return) {
            $notification = 'Request not found';
            $notification = array('messege'=>$notification,'alert-type'=>'error');
            return redirect()->back()->with($notification);
        }

        return view('admin.show_return_request', compact('return', 'setting'));
    }

    public function updateStatus(Request $request, $id)
    {
        $return = ReturnRequest::find($id);
        if (!$return) {
            $notification = 'Request not found';
            $notification = array('messege'=>$notification,'alert-type'=>'error');
            return redirect()->back()->with($notification);
        }

        if ($request->status == 4) { // Complete Refund
             return $this->processRefund($return, $request->admin_response);
        }

        $return->status = $request->status;
        $return->admin_response = $request->admin_response;
        $return->save();

        $notification = 'Status updated successfully';
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->back()->with($notification);
    }

    protected function processRefund($return, $note)
    {
        if ($return->status == 4) {
            $notification = 'Already refunded';
            $notification = array('messege'=>$notification,'alert-type'=>'error');
            return redirect()->back()->with($notification);
        }

        DB::beginTransaction();
        try {
            $return->status = 4;
            $return->admin_response = $note;
            $return->save();

            // Record in ledger
            $this->commissionService->recordReturn($return);

            DB::commit();
            $notification = 'Refund processed and completed';
            $notification = array('messege'=>$notification,'alert-type'=>'success');
            return redirect()->route('admin.return-requests.index')->with($notification);
        } catch (\Exception $e) {
            DB::rollBack();
            $notification = 'Error: ' . $e->getMessage();
            $notification = array('messege'=>$notification,'alert-type'=>'error');
            return redirect()->back()->with($notification);
        }
    }
}
