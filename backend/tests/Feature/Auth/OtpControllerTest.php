<?php

namespace Tests\Feature\Auth;

use App\Models\OtpVerification;
use App\Services\SmsServiceInterface;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Tests\Concerns\UsesInMemorySqlite;
use Tests\TestCase;

class OtpControllerTest extends TestCase
{
    use WithFaker;
    use UsesInMemorySqlite;

    protected function setUp(): void
    {
        parent::setUp();
        $this->configureInMemorySqlite();

        Schema::create('otp_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20);
            $table->string('otp_code', 6);
            $table->string('purpose')->default('register');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Config::set('sms.otp.length', 6);
        Config::set('sms.otp.expire_minutes', 5);
        Config::set('sms.otp.max_attempts', 3);
        Config::set('sms.otp.cooldown_seconds', 60);

        $this->app->bind(SmsServiceInterface::class, function () {
            return new class implements SmsServiceInterface {
                public function send(string $phone, string $message): bool
                {
                    return true;
                }
            };
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('otp_verifications');
        parent::tearDown();
    }

    public function test_send_otp_creates_a_record(): void
    {
        $response = $this->postJson('/api/auth/otp/send', [
            'phone' => '+905551234567',
            'purpose' => 'register',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'OTP sent successfully.',
                'expires_in' => 300,
            ]);

        $this->assertDatabaseCount('otp_verifications', 1);
    }

    public function test_verify_otp_returns_a_verified_token(): void
    {
        OtpVerification::create([
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
            'attempts' => 0,
            'max_attempts' => 3,
            'expires_at' => Carbon::now()->addMinutes(5),
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->postJson('/api/auth/otp/verify', [
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('verified', true);

        $token = $response->json('token');
        $this->assertNotEmpty($token);
        $this->assertNotNull(Cache::get('otp_verified_token:' . $token));
    }

    public function test_verify_otp_rejects_invalid_code_and_increments_attempts(): void
    {
        $otp = OtpVerification::create([
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
            'attempts' => 0,
            'max_attempts' => 3,
            'expires_at' => Carbon::now()->addMinutes(5),
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->postJson('/api/auth/otp/verify', [
            'phone' => '+905551234567',
            'otp_code' => '999999',
            'purpose' => 'register',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('verified', false);

        $this->assertSame(1, $otp->fresh()->attempts);
    }

    public function test_verify_otp_rejects_expired_code(): void
    {
        OtpVerification::create([
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
            'attempts' => 0,
            'max_attempts' => 3,
            'expires_at' => Carbon::now()->subMinute(),
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->postJson('/api/auth/otp/verify', [
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'OTP has expired. Please request a new code.');
    }

    public function test_resend_otp_enforces_cooldown(): void
    {
        OtpVerification::create([
            'phone' => '+905551234567',
            'otp_code' => '123456',
            'purpose' => 'register',
            'attempts' => 0,
            'max_attempts' => 3,
            'expires_at' => Carbon::now()->addMinutes(5),
            'ip_address' => '127.0.0.1',
            'created_at' => Carbon::now()->subSeconds(20),
            'updated_at' => Carbon::now()->subSeconds(20),
        ]);

        $response = $this->postJson('/api/auth/otp/resend', [
            'phone' => '+905551234567',
            'purpose' => 'register',
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('success', false);
    }
}
