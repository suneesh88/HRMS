<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HolidayController extends Controller
{
    public function index(Request $request): Response
    {
        $currentYear = (int) date('Y');
        $year = $request->filled('year') ? (int) $request->input('year') : $currentYear;
        $search = $request->input('search');
        $type = $request->input('type');
        $status = $request->input('status');

        $query = Holiday::query()
            ->where(function ($q) use ($year) {
                $q->whereYear('date', $year)
                  ->orWhere(function ($sub) use ($year) {
                      $sub->whereNotNull('end_date')
                          ->whereYear('end_date', $year);
                  });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('status', filter_var($status, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('date', 'asc');

        $holidays = $query->paginate(15)->withQueryString();

        // Metrics for the selected year
        $today = Carbon::today()->toDateString();
        $yearQuery = Holiday::where(function ($q) use ($year) {
            $q->whereYear('date', $year)
              ->orWhere(function ($sub) use ($year) {
                  $sub->whereNotNull('end_date')
                      ->whereYear('end_date', $year);
              });
        });

        $metrics = [
            'total' => (clone $yearQuery)->count(),
            'upcoming' => (clone $yearQuery)->where('date', '>=', $today)->count(),
            'public' => (clone $yearQuery)->where('type', 'public')->count(),
            'restricted' => (clone $yearQuery)->where('type', 'restricted')->count(),
            'company' => (clone $yearQuery)->where('type', 'company')->count(),
        ];

        // Available years for dropdown
        $years = range($currentYear - 2, $currentYear + 3);

        return Inertia::render('Settings/Holidays/Index', [
            'holidays' => $holidays,
            'metrics' => $metrics,
            'years' => $years,
            'selectedYear' => $year,
            'filters' => [
                'year' => $year,
                'search' => $search ?? '',
                'type' => $type ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:date'],
            'type' => ['required', 'string', 'in:public,restricted,company'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        Holiday::create($validated);

        return redirect()->route('holidays.index', ['year' => Carbon::parse($validated['date'])->year])
            ->with('message', 'Holiday created successfully.');
    }

    public function update(Request $request, Holiday $holiday): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:date'],
            'type' => ['required', 'string', 'in:public,restricted,company'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $holiday->update($validated);

        return redirect()->route('holidays.index', ['year' => Carbon::parse($validated['date'])->year])
            ->with('message', 'Holiday updated successfully.');
    }

    public function destroy(Holiday $holiday): RedirectResponse
    {
        $holiday->delete();

        return redirect()->back()
            ->with('message', 'Holiday deleted successfully.');
    }
}

