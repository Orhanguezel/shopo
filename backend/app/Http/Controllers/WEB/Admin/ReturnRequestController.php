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

    public function index(Request $request)
    {
        $returns = ReturnRequest::with(['order', 'orderProduct.product', 'user', 'seller'])
                               ->when($request->filled('status'), fn ($query) => $query->where('status', $request->status))
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

        $adminNote = $request->input('admin_note', $request->admin_response);

        if ($request->status == 4) { // Complete Refund
             return $this->processRefund($return, $adminNote);
        }

        $return->status = $request->status;
        $return->admin_response = $adminNote;
        $return->admin_note = $adminNote;

        if ($request->filled('refund_amount')) {
            $return->refund_amount = $request->refund_amount;
        }

        if ($request->filled('refund_method')) {
            $return->refund_method = $request->refund_method;
        }

        if ($request->filled('rejected_reason')) {
            $return->rejected_reason = $request->rejected_reason;
        }

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
            $return->admin_note = $note;
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
