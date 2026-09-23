<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Allowance extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'is_taxable',
        'description',
        'status',
    ];

    protected $casts = [
        'is_taxable' => 'boolean',
        'status' => 'boolean',
    ];

    public function employeeAllowances(): HasMany
    {
        return $this->hasMany(EmployeeAllowance::class, 'allowance_id');
    }
}
