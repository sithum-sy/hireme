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
            // Drop existing name column if exists
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }

            // Add new columns
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            $table->enum('role', ['client', 'service_provider', 'admin', 'staff'])->default('client')->after('email');
            $table->text('address')->nullable()->after('role');
            $table->string('contact_number')->nullable()->after('address');
            $table->string('profile_picture')->nullable()->after('contact_number');
            $table->boolean('is_active')->default(true)->after('profile_picture');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'role',
                'address',
                'contact_number',
                'profile_picture',
                'is_active'
            ]);
            $table->string('name')->after('id');
        });
    }
};
