<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $shifts = Shift::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('status', filter_var($status, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('start_time', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Settings/Shifts/Index', [
            'shifts' => $shifts,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:shifts,code'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'break_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:480'],
            'grace_period_minutes' => ['nullable', 'integer', 'min:0', 'max:120'],
            'weekend_days' => ['nullable', 'array'],
            'weekend_days.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $validated['break_duration_minutes'] = $validated['break_duration_minutes'] ?? 0;
        $validated['grace_period_minutes'] = $validated['grace_period_minutes'] ?? 0;
        $validated['weekend_days'] = $validated['weekend_days'] ?? ['Sunday'];

        Shift::create($validated);

        return redirect()->route('shifts.index')
            ->with('message', 'Shift created successfully.');
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('shifts', 'code')->ignore($shift->id),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'break_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:480'],
            'grace_period_minutes' => ['nullable', 'integer', 'min:0', 'max:120'],
            'weekend_days' => ['nullable', 'array'],
            'weekend_days.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $validated['break_duration_minutes'] = $validated['break_duration_minutes'] ?? 0;
        $validated['grace_period_minutes'] = $validated['grace_period_minutes'] ?? 0;
        $validated['weekend_days'] = $validated['weekend_days'] ?? ['Sunday'];

        $shift->update($validated);

        return redirect()->route('shifts.index')
            ->with('message', 'Shift updated successfully.');
    }

    public function destroy(Shift $shift): RedirectResponse
    {
        $shift->delete();

        return redirect()->route('shifts.index')
            ->with('message', 'Shift deleted successfully.');
    }
}

