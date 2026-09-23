<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DesignationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $status = $request->input('status');

        $designations = Designation::query()
            ->with('department:id,name')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($departmentId, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('status', filter_var($status, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();

        $departments = Department::query()
            ->select('id', 'name')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Settings/Designations/Index', [
            'designations' => $designations,
            'departments' => $departments,
            'filters' => [
                'search' => $search ?? '',
                'department_id' => $departmentId ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        Designation::create($validated);

        return redirect()->route('designations.index')
            ->with('message', 'Designation created successfully.');
    }

    public function update(Request $request, Designation $designation): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $designation->update($validated);

        return redirect()->route('designations.index')
            ->with('message', 'Designation updated successfully.');
    }

    public function destroy(Designation $designation): RedirectResponse
    {
        $designation->delete();

        return redirect()->route('designations.index')
            ->with('message', 'Designation deleted successfully.');
    }
}

