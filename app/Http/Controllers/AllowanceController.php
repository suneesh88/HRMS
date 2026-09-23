<?php

namespace App\Http\Controllers;

use App\Models\Allowance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AllowanceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $taxable = $request->input('taxable');
        $status = $request->input('status');

        $query = Allowance::query()
            ->withCount('employeeAllowances')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($taxable !== null && $taxable !== '', function ($query) use ($taxable) {
                $query->where('is_taxable', filter_var($taxable, FILTER_VALIDATE_BOOLEAN));
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('status', filter_var($status, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('name', 'asc');

        $allowances = $query->paginate(15)->withQueryString();

        $metrics = [
            'total' => Allowance::count(),
            'active' => Allowance::where('status', true)->count(),
            'taxable' => Allowance::where('is_taxable', true)->count(),
            'exempt' => Allowance::where('is_taxable', false)->count(),
        ];

        return Inertia::render('Settings/Allowances/Index', [
            'allowances' => $allowances,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
                'taxable' => $taxable ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:allowances,code'],
            'is_taxable' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        Allowance::create($validated);

        return redirect()->route('allowances.index')
            ->with('message', 'Allowance created successfully.');
    }

    public function update(Request $request, Allowance $allowance): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('allowances', 'code')->ignore($allowance->id),
            ],
            'is_taxable' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $allowance->update($validated);

        return redirect()->route('allowances.index')
            ->with('message', 'Allowance updated successfully.');
    }

    public function destroy(Allowance $allowance): RedirectResponse
    {
        if ($allowance->employeeAllowances()->exists()) {
            $count = $allowance->employeeAllowances()->count();
            return redirect()->route('allowances.index')
                ->with('error', "Cannot delete '{$allowance->name}' because it is currently assigned to {$count} employee(s). Please remove it from their compensation profiles first.");
        }

        $allowance->delete();

        return redirect()->route('allowances.index')
            ->with('message', 'Allowance deleted successfully.');
    }
}
