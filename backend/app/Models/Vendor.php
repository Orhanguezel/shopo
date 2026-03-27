<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;


    protected $guarded = [];

    protected $casts = [
        'commission_rate' => 'decimal:2',
    ];

    protected $appends = ['averageRating'];

    public function getEffectiveCommissionRate()
    {
        if ($this->commission_rate !== null) {
            return (float) $this->commission_rate;
        }

        return (float) (Setting::first()->default_commission_rate ?? 0);
    }

    public function getAverageRatingAttribute()
    {
        return $this->activeReviews()->avg('rating') ? : '0';
    }

    public function socialLinks(){
        return $this->hasMany(VendorSocialLink::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function products(){
        return $this->hasMany(Product::class,'vendor_id');
    }

    public function activeReviews(){
        return $this->hasMany(ProductReview::class,'product_vendor_id');
    }


}
