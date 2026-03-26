<?php

namespace App\Http\Controllers\WEB\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Language;
use Auth;
class LanguageController extends Controller
{

    public function adminLnagugae(Request $request){
        if($request->lang_code){
            $data = include(resource_path('lang/'.$request->lang_code.'/admin.php'));
        }else{
            $data = include(resource_path('lang/en/admin.php'));
        }
        $languages = Language::get();
        return view('admin.admin_language', compact('data','languages'));
    }

    public function updateAdminLanguage(Request $request){

        $dataArray = [];
        foreach($request->values as $index => $value){
            $dataArray[$index] = $value;
        }
        file_put_contents(resource_path('lang/'.$request->lang_code.'/admin.php'), "");
        $dataArray = var_export($dataArray, true);
        file_put_contents(resource_path('lang/'.$request->lang_code.'/admin.php'), "<?php\n return {$dataArray};\n ?>");

        $notification= trans('admin_validation.Update Successfully');
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->back()->with($notification);
    }

    public function adminValidationLnagugae(Request $request){
        if($request->lang_code){
            $data = include(resource_path('lang/'.$request->lang_code.'/admin_validation.php'));
        }else{
            $data = include(resource_path('lang/en/admin_validation.php'));
        }
        $languages = Language::get();
        return view('admin.admin_validation_language', compact('data','languages'));
    }

    public function updateAdminValidationLnagugae(Request $request){
        $dataArray = [];
        foreach($request->values as $index => $value){
            $dataArray[$index] = $value;
        }
        file_put_contents(resource_path('lang/'.$request->lang_code.'/admin_validation.php'), "");
        $dataArray = var_export($dataArray, true);
        file_put_contents(resource_path('lang/'.$request->lang_code.'/admin_validation.php'), "<?php\n return {$dataArray};\n ?>");

        $notification= trans('admin_validation.Update Successfully');
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->back()->with($notification);
    }

    public function websiteLanguage(Request $request){

        if($request->lang_code){
            $data = include(resource_path('lang/'.$request->lang_code.'/user.php'));
        }else{
            $data = include(resource_path('lang/en/user.php'));
        }
        $languages = Language::get();
        return view('admin.language', compact('data','languages'));

    }

    public function updateLanguage(Request $request){

        $dataArray = [];
        foreach($request->values as $index => $value){
            $dataArray[$index] = $value;
        }
        file_put_contents(resource_path('lang/'.$request->lang_code.'/user.php'), "");
        $dataArray = var_export($dataArray, true);
        file_put_contents(resource_path('lang/'.$request->lang_code.'/user.php'), "<?php\n return {$dataArray};\n ?>");

        $notification= trans('admin_validation.Update Successfully');
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->back()->with($notification);
    }


    public function websiteValidationLanguage(Request $request){
        if($request->lang_code){
            $data = include(resource_path('lang/'.$request->lang_code.'/user_validation.php'));
        }else{
            $data = include(resource_path('lang/en/user_validation.php'));
        }
        $languages = Language::get();
        return view('admin.website_validation_language', compact('data','languages'));
    }

    public function updateValidationLanguage(Request $request){

        $dataArray = [];
        foreach($request->values as $index => $value){
            $dataArray[$index] = $value;
        }
        file_put_contents(resource_path('lang/'.$request->lang_code.'/user_validation.php'), "");
        $dataArray = var_export($dataArray, true);
        file_put_contents(resource_path('lang/'.$request->lang_code.'/user_validation.php'), "<?php\n return {$dataArray};\n ?>");

        $notification= trans('admin_validation.Update Successfully');
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->back()->with($notification);
    }
}
