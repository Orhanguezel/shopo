<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Language;
use DB;
use File;

class AdminLanguageController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function languages(){
        $languages = Language::get();
        return view('admin.languages')->with([
            'languages' => $languages,
        ]);
    }

    public function create(){
        return view('admin.create_language');
    }

    public function store(Request $request){

        $rules = [
            'lang_name'=>'required|unique:languages',
            'lang_code'=>'required|unique:languages'
        ];
        $customMessages = [
            'lang_name.required' => trans('admin_validation.Name is required'),
            'lang_name.unique' => trans('admin_validation.Name already exist'),
            'lang_code.required' => trans('admin_validation.Code is required'),
            'lang_code.unique' => trans('admin_validation.Code already exist'),
        ];
        $this->validate($request, $rules,$customMessages);

        $language = new Language();

        if($request->is_default == 'Yes'){
            DB::table('languages')->update(['is_default' => 'No']);
        }

        $language->lang_name = $request->lang_name;
        $language->lang_code = $request->lang_code;
        $language->is_default = $request->is_default;
        $language->lang_direction = $request->lang_direction;
        $language->status = $request->status;
        $language->save();


        $path = base_path().'/resources/'.'lang/'.$request->lang_code;


        if (! File::exists($path)) {
            File::makeDirectory($path);


            $sourcePath = base_path().'/resources/'.'lang/en';
            $destinationPath = $path;

            // Get all files from the source folder
            $files = File::allFiles($sourcePath);

            foreach ($files as $file) {
                $destinationFile = $destinationPath . '/' . $file->getRelativePathname();

                // Copy the file to the destination folder
                File::copy($file->getRealPath(), $destinationFile);
            }

        }

        $notification=trans('admin_validation.Created Successfully');
        $notification=array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->route('admin.languages')->with($notification);
    }

    public function edit($id){
        $language = Language::findOrFail($id);
        return view('admin.edit_language')->with([
            'language' => $language,
        ]);
    }

    public function update(Request $request, $id){

        $rules = [
            'lang_name'=> $id != 1 ? 'required|unique:languages,id,'.$id : '',
            'lang_code'=> $id != 1 ? 'required|unique:languages,id,'.$id : '',
        ];
        $customMessages = [
            'lang_name.required' => trans('admin_validation.Name is required'),
            'lang_name.unique' => trans('admin_validation.Name already exist'),
            'lang_code.required' => trans('admin_validation.Code is required'),
            'lang_code.unique' => trans('admin_validation.Code already exist'),
        ];

        $this->validate($request, $rules,$customMessages);

        $language = Language::findOrFail($id);

        if ($language->id != 1) {
            $old_path = base_path().'/resources'.'/lang'.'/'.$language->lang_code;
            $update_path = base_path().'/resources'.'/lang'.'/'.$request->lang_code;

            if (File::exists($old_path) && $old_path != $update_path) {
                File::move($old_path, $update_path);
            }
        }

        if($request->is_default == 'Yes'){
            DB::table('languages')->where('id', '!=', $language->id)->update(['is_default' => 'No']);
        }

        if($language->is_default == 'Yes' && $request->is_default == 'No'){
            DB::table('languages')->where('id', 1)->update(['is_default' => 'Yes']);
        }

        if ($language->id != 1) {
            $language->lang_name = $request->lang_name;
        }

        if ($language->id != 1) {
            $language->lang_code = $request->lang_code;
        }


        $language->is_default = $request->is_default;

        $language->lang_direction = $request->lang_direction;

        if ($language->id != 1) {
            $language->status = $request->status;
        }

        $language->save();


        $notification=trans('admin_validation.Updated Successfully');
        $notification=array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->route('admin.languages')->with($notification);
    }

    public function destroy($id)
    {
        $language = Language::findOrFail($id);
        $path = base_path().'/resources'.'/lang'.'/'.$language->lang_code;

        if (File::exists($path)) {
            File::deleteDirectory($path);
        }
        $language->delete();

        $notification = trans('admin_validation.Delete Successfully');
        $notification = array('messege'=>$notification,'alert-type'=>'success');
        return redirect()->route('admin.languages')->with($notification);
    }
}
