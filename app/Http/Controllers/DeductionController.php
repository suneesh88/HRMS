<?php

namespace App\Http\Controllers;

use App\Models\Deduction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DeductionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $statutory = $request->input('statutory');
        $status = $request->input('status');

        $query = Deduction::query()
            ->withCount('employeeDeductions')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($statutory !== null && $statutory !== '', function ($query) use ($statutory) {
                $query->where('is_statutory', filter_var($statutory, FILTER_VALIDATE_BOOLEAN));
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('status', filter_var($status, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('name', 'asc');

        $deductions = $query->paginate(15)->withQueryString();

        $metrics = [
            'total' => Deduction::count(),
            'active' => Deduction::where('status', true)->count(),
            'statutory' => Deduction::where('is_statutory', true)->count(),
            'voluntary' => Deduction::where('is_statutory', false)->count(),
        ];

        return Inertia::render('Settings/Deductions/Index', [
            'deductions' => $deductions,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
                'statutory' => $statutory ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:deductions,code'],
            'is_statutory' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        Deduction::create($validated);

        return redirect()->route('deductions.index')
            ->with('message', 'Deduction created successfully.');
    }

    public function update(Request $request, Deduction $deduction): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('deductions', 'code')->ignore($deduction->id),
            ],
            'is_statutory' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $deduction->update($validated);

        return redirect()->route('deductions.index')
            ->with('message', 'Deduction updated successfully.');
    }

    public function destroy(Deduction $deduction): RedirectResponse
    {
        if ($deduction->employeeDeductions()->exists()) {
            $count = $deduction->employeeDeductions()->count();
            return redirect()->route('deductions.index')
                ->with('error', "Cannot delete '{$deduction->name}' because it is currently assigned to {$count} employee(s). Please remove it from their compensation profiles first.");
        }

        $deduction->delete();

        return redirect()->route('deductions.index')
            ->with('message', 'Deduction deleted successfully.');
    }
}
