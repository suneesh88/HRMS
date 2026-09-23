<?php

use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\DeductionController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShiftController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Workforce Routes
    Route::resource('employees', EmployeeController::class)->except(['create', 'edit']);

    // Settings - Masters Routes
    Route::prefix('settings')->group(function () {
        Route::resource('departments', DepartmentController::class)->except(['create', 'show', 'edit']);
        Route::resource('designations', DesignationController::class)->except(['create', 'show', 'edit']);
        Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
        Route::resource('holidays', HolidayController::class)->except(['create', 'show', 'edit']);
        Route::resource('allowances', AllowanceController::class)->except(['create', 'show', 'edit']);
        Route::resource('deductions', DeductionController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__.'/auth.php';
