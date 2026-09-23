<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'is_statutory',
        'description',
        'status',
    ];

    protected $casts = [
        'is_statutory' => 'boolean',
        'status' => 'boolean',
    ];

    public function employeeDeductions(): HasMany
    {
        return $this->hasMany(EmployeeDeduction::class, 'deduction_id');
    }
}
