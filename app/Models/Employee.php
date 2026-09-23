<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'joining_date',
        'department_id',
        'designation_id',
        'shift_id',
        'employment_type',
        'salary',
        'bank_name',
        'account_holder_name',
        'account_number',
        'ifsc_code',
        'branch_name',
        'upi_id',
        'pan_number',
        'address',
        'emergency_contact',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'joining_date' => 'date:Y-m-d',
        'salary' => 'decimal:2',
    ];

    protected $appends = [
        'full_name',
        'total_allowances',
        'gross_salary',
        'total_deductions',
        'net_salary',
    ];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getTotalAllowancesAttribute(): float
    {
        if ($this->relationLoaded('allowances')) {
            $total = $this->allowances->sum(fn ($item) => (float) ($item->amount ?? 0));
            return round($total, 2);
        }

        return round((float) $this->allowances()->sum('amount'), 2);
    }

    public function getGrossSalaryAttribute(): float
    {
        $base = (float) ($this->salary ?? 0.0);
        return round($base + $this->total_allowances, 2);
    }

    public function getTotalDeductionsAttribute(): float
    {
        if ($this->relationLoaded('deductions')) {
            $total = $this->deductions->sum(fn ($item) => (float) ($item->amount ?? 0));
            return round($total, 2);
        }

        return round((float) $this->deductions()->sum('amount'), 2);
    }

    public function getNetSalaryAttribute(): float
    {
        return round(max(0, $this->gross_salary - $this->total_deductions), 2);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function allowances(): HasMany
    {
        return $this->hasMany(EmployeeAllowance::class, 'employee_id');
    }

    public function deductions(): HasMany
    {
        return $this->hasMany(EmployeeDeduction::class, 'employee_id');
    }

    /**
     * Generate the next sequential employee code.
     */
    public static function generateNextEmployeeCode(string $prefix = 'EMP-', int $padLength = 3): string
    {
        $codes = static::query()->pluck('employee_code');

        $maxNumber = 0;
        foreach ($codes as $code) {
            if (preg_match('/(\d+)$/', (string) $code, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $nextNumber = $maxNumber + 1;

        do {
            $formattedNumber = str_pad((string) $nextNumber, $padLength, '0', STR_PAD_LEFT);
            $candidateCode = $prefix . $formattedNumber;
            $nextNumber++;
        } while (static::where('employee_code', $candidateCode)->exists());

        return $candidateCode;
    }
}
