<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('updated_at');
            $table->boolean('auto_expired')->default(false)->after('expires_at');
            $table->index('expires_at');
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['status', 'expires_at']);
            $table->dropIndex(['expires_at']);
            $table->dropColumn(['expires_at', 'auto_expired']);
        });
    }
};
