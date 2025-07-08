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
        Schema::table('users', function (Blueprint $table) {
            // Add created_by field to track who created staff accounts
            $table->unsignedBigInteger('created_by')->nullable()->after('email_verified_at');

            // Add last_login_at timestamp for activity tracking
            $table->timestamp('last_login_at')->nullable()->after('created_by');

            // Add soft deletes for user accounts
            $table->softDeletes()->after('last_login_at');

            // Add foreign key constraint for created_by
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            // Add index for better query performance
            $table->index(['role', 'is_active']);
            $table->index(['created_by']);
            $table->index(['deleted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['created_by']);

            // Drop indexes
            $table->dropIndex(['role', 'is_active']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['deleted_at']);

            // Drop columns
            $table->dropColumn(['created_by', 'last_login_at']);
            $table->dropSoftDeletes();
        });
    }
};
