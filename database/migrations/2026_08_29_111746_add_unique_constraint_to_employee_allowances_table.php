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
        Schema::table('employee_allowances', function (Blueprint $table) {
            $table->unique(['employee_id', 'allowance_id'], 'emp_allowance_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_allowances', function (Blueprint $table) {
            $table->dropUnique('emp_allowance_unique');
        });
    }
};
