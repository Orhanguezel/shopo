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
        'geliver_api_token',
        'geliver_test_mode',
        'geliver_sender_address_id',
        'geliver_webhook_header_name',
        'geliver_webhook_header_secret',
        'netgsm_usercode',
        'netgsm_password',
        'netgsm_msgheader',
        'netgsm_enabled',
    ];

    protected $casts = [
        'default_commission_rate' => 'decimal:2',
        'openai_timeout' => 'integer',
        'openai_enabled' => 'boolean',
        'claude_timeout' => 'integer',
        'claude_enabled' => 'boolean',
        'netgsm_enabled' => 'boolean',
    ];

    protected $hidden = [
        'openai_api_key',
        'claude_api_key',
        'geliver_api_token',
        'geliver_webhook_header_secret',
        'netgsm_password',
    ];

    public function currency(){
        return $this->belongsTo(MultiCurrency::class);
    }
}
