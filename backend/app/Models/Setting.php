<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'default_commission_rate',
    ];

    protected $casts = [
        'default_commission_rate' => 'decimal:2',
    ];

    public function currency(){
        return $this->belongsTo(MultiCurrency::class);
    }
}
