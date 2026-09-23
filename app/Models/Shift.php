<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'start_time',
        'end_time',
        'break_duration_minutes',
        'grace_period_minutes',
        'weekend_days',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'break_duration_minutes' => 'integer',
        'grace_period_minutes' => 'integer',
        'weekend_days' => 'array',
    ];
}
