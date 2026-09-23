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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('salary');
            $table->string('account_holder_name')->nullable()->after('bank_name');
            $table->string('account_number')->nullable()->after('account_holder_name');
            $table->string('ifsc_code', 20)->nullable()->after('account_number');
            $table->string('branch_name')->nullable()->after('ifsc_code');
            $table->string('upi_id', 100)->nullable()->after('branch_name');
            $table->string('pan_number', 20)->nullable()->after('upi_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name',
                'account_holder_name',
                'account_number',
                'ifsc_code',
                'branch_name',
                'upi_id',
                'pan_number',
            ]);
        });
    }
};
