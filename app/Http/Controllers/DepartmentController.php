<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $departments = Department::query()
            ->withCount('designations')
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
            ->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Settings/Departments/Index', [
            'departments' => $departments,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments,name'],
            'code' => ['nullable', 'string', 'max:50', 'unique:departments,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        Department::create($validated);

        return redirect()->route('departments.index')
            ->with('message', 'Department created successfully.');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'name')->ignore($department->id),
            ],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('departments', 'code')->ignore($department->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['boolean'],
        ]);

        $department->update($validated);

        return redirect()->route('departments.index')
            ->with('message', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $department->delete();

        return redirect()->route('departments.index')
            ->with('message', 'Department deleted successfully.');
    }
}

