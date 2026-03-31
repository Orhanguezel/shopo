<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogGallery;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Image;
use File;

class BlogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index()
    {
        $blogs = Blog::with('category')->orderBy('id', 'desc')->get();
        return view('admin.blog', compact('blogs'));
    }

    public function create()
    {
        $categories = BlogCategory::where('status', 1)->orderBy('name')->get();
        $setting = Setting::first();
        $aiEnabled = (bool) ($setting->openai_enabled ?? false) || (bool) ($setting->claude_enabled ?? false);
        return view('admin.create_blog', compact('categories', 'aiEnabled'));
    }

    public function store(Request $request)
    {
        $rules = [
            'title' => 'required',
            'slug' => 'required|unique:blogs',
            'category' => 'required',
            'description' => 'required',
            'image' => 'required|image',
        ];
        $this->validate($request, $rules);

        $blog = new Blog();

        if ($request->image) {
            $extention = $request->image->getClientOriginalExtension();
            $image_name = 'blog-' . date('Y-m-d-h-i-s') . '-' . rand(999, 9999) . '.' . $extention;
            $image_name = 'uploads/custom-images/' . $image_name;
            Image::make($request->image)->save(public_path() . '/' . $image_name);
            $blog->image = $image_name;
        }

        $blog->admin_id = auth('admin')->user()->id;
        $blog->title = $request->title;
        $blog->slug = $request->slug;
        $blog->blog_category_id = $request->category;
        $blog->description = $request->description;
        $blog->seo_title = $request->seo_title;
        $blog->seo_description = $request->seo_description;
        $blog->status = $request->status;
        $blog->show_homepage = $request->show_homepage ? 1 : 0;
        $blog->save();

        $notification = array('messege' => 'Blog başarıyla oluşturuldu.', 'alert-type' => 'success');
        return redirect()->route('admin.blog.index')->with($notification);
    }

    public function edit($id)
    {
        $blog = Blog::with('gallery')->find($id);
        $categories = BlogCategory::where('status', 1)->orderBy('name')->get();
        $setting = Setting::first();
        $aiEnabled = (bool) ($setting->openai_enabled ?? false) || (bool) ($setting->claude_enabled ?? false);
        return view('admin.edit_blog', compact('blog', 'categories', 'aiEnabled'));
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'title' => 'required',
            'slug' => 'required|unique:blogs,slug,' . $id,
            'category' => 'required',
            'description' => 'required',
        ];
        $this->validate($request, $rules);

        $blog = Blog::find($id);

        if ($request->image) {
            $old_image = $blog->image;
            $extention = $request->image->getClientOriginalExtension();
            $image_name = 'blog-' . date('Y-m-d-h-i-s') . '-' . rand(999, 9999) . '.' . $extention;
            $image_name = 'uploads/custom-images/' . $image_name;
            Image::make($request->image)->save(public_path() . '/' . $image_name);
            $blog->image = $image_name;
            if ($old_image && File::exists(public_path() . '/' . $old_image)) {
                unlink(public_path() . '/' . $old_image);
            }
        }

        $blog->title = $request->title;
        $blog->slug = $request->slug;
        $blog->blog_category_id = $request->category;
        $blog->description = $request->description;
        $blog->seo_title = $request->seo_title;
        $blog->seo_description = $request->seo_description;
        $blog->status = $request->status;
        $blog->show_homepage = $request->show_homepage ? 1 : 0;
        $blog->save();

        $notification = array('messege' => 'Blog başarıyla güncellendi.', 'alert-type' => 'success');
        return redirect()->route('admin.blog.index')->with($notification);
    }

    public function destroy($id)
    {
        $blog = Blog::find($id);
        $old_image = $blog->image;
        $blog->delete();
        if ($old_image && File::exists(public_path() . '/' . $old_image)) {
            unlink(public_path() . '/' . $old_image);
        }

        $notification = array('messege' => 'Blog başarıyla silindi.', 'alert-type' => 'success');
        return redirect()->route('admin.blog.index')->with($notification);
    }

    public function changeStatus($id)
    {
        $blog = Blog::find($id);
        $blog->status = $blog->status == 1 ? 0 : 1;
        $blog->save();
        return response()->json($blog->status == 1 ? 'Aktif edildi' : 'Pasif edildi');
    }

    public function storeGallery(Request $request)
    {
        $this->validate($request, [
            'images' => 'required',
            'blog_id' => 'required',
        ]);

        foreach ($request->images as $image) {
            $ext = $image->getClientOriginalExtension();
            $name = 'blog-gallery-' . date('Y-m-d-h-i-s-') . rand(999, 9999) . '.' . $ext;
            $path = 'uploads/custom-images/' . $name;
            Image::make($image)->save(public_path() . '/' . $path);

            $gallery = new BlogGallery();
            $gallery->blog_id = $request->blog_id;
            $gallery->image = $path;
            $gallery->save();
        }

        if (request()->ajax()) {
            return response()->json(['success' => true, 'message' => 'Görseller yüklendi.']);
        }

        $notification = array('messege' => 'Görseller yüklendi.', 'alert-type' => 'success');
        return redirect()->back()->with($notification);
    }

    public function destroyGallery($id)
    {
        $gallery = BlogGallery::find($id);
        $old = $gallery->image;
        $gallery->delete();
        if ($old && File::exists(public_path() . '/' . $old)) {
            unlink(public_path() . '/' . $old);
        }

        if (request()->ajax()) {
            return response()->json(['success' => true, 'message' => 'Görsel silindi.']);
        }

        $notification = array('messege' => 'Görsel silindi.', 'alert-type' => 'success');
        return redirect()->back()->with($notification);
    }
}
