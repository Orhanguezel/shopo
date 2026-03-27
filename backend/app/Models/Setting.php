<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'default_commission_rate',
        'openai_api_key',
        'openai_model',
        'openai_timeout',
        'openai_enabled',
        'claude_api_key',
        'claude_model',
        'claude_timeout',
        'claude_enabled',
    ];

    protected $casts = [
        'default_commission_rate' => 'decimal:2',
        'openai_timeout' => 'integer',
        'openai_enabled' => 'boolean',
        'claude_timeout' => 'integer',
        'claude_enabled' => 'boolean',
    ];

    protected $hidden = [
        'openai_api_key',
        'claude_api_key',
    ];

    public function currency(){
        return $this->belongsTo(MultiCurrency::class);
    }
}
