<?php

namespace App\Http\Controllers;

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeDeduction;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $designationId = $request->input('designation_id');
        $shiftId = $request->input('shift_id');
        $status = $request->input('status');
        $employmentType = $request->input('employment_type');

        $query = Employee::query()
            ->with([
                'department:id,name,code',
                'designation:id,name,code',
                'shift:id,name,code,start_time,end_time',
                'allowances.allowance:id,name,code,is_taxable',
                'deductions.deduction:id,name,code,is_statutory',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('employee_code', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($designationId, fn ($q) => $q->where('designation_id', $designationId))
            ->when($shiftId, fn ($q) => $q->where('shift_id', $shiftId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($employmentType, fn ($q) => $q->where('employment_type', $employmentType))
            ->orderBy('id', 'desc');

        $employees = $query->paginate(15)->withQueryString();

        $departments = Department::query()
            ->select('id', 'name', 'code')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $designations = Designation::query()
            ->select('id', 'department_id', 'name', 'code')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $shifts = Shift::query()
            ->select('id', 'name', 'code', 'start_time', 'end_time')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $allowanceMasters = Allowance::query()
            ->select('id', 'name', 'code', 'is_taxable')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $deductionMasters = Deduction::query()
            ->select('id', 'name', 'code', 'is_statutory')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'designations' => $designations,
            'shifts' => $shifts,
            'allowanceMasters' => $allowanceMasters,
            'deductionMasters' => $deductionMasters,
            'nextEmployeeCode' => Employee::generateNextEmployeeCode(),
            'filters' => [
                'search' => $search ?? '',
                'department_id' => $departmentId ?? '',
                'designation_id' => $designationId ?? '',
                'shift_id' => $shiftId ?? '',
                'status' => $status ?? '',
                'employment_type' => $employmentType ?? '',
            ],
        ]);
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'department:id,name,code',
            'designation:id,name,code',
            'shift:id,name,code,start_time,end_time,break_duration_minutes,grace_period_minutes,weekend_days',
            'allowances.allowance:id,name,code,is_taxable',
            'deductions.deduction:id,name,code,is_statutory',
        ]);

        $departments = Department::query()
            ->select('id', 'name', 'code')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $designations = Designation::query()
            ->select('id', 'department_id', 'name', 'code')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $shifts = Shift::query()
            ->select('id', 'name', 'code', 'start_time', 'end_time')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $allowanceMasters = Allowance::query()
            ->select('id', 'name', 'code', 'is_taxable')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        $deductionMasters = Deduction::query()
            ->select('id', 'name', 'code', 'is_statutory')
            ->where('status', true)
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Employees/Show', [
            'employee' => $employee,
            'departments' => $departments,
            'designations' => $designations,
            'shifts' => $shifts,
            'allowanceMasters' => $allowanceMasters,
            'deductionMasters' => $deductionMasters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['required', 'string', 'max:30'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['required', 'date'],
            'department_id' => ['required', 'exists:departments,id'],
            'designation_id' => ['required', 'exists:designations,id'],
            'shift_id' => ['nullable', 'exists:shifts,id'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'account_holder_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'ifsc_code' => ['nullable', 'string', 'max:20'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'upi_id' => ['nullable', 'string', 'max:100'],
            'pan_number' => ['nullable', 'string', 'max:20'],
            'allowances' => ['nullable', 'array'],
            'allowances.*.allowance_id' => ['required_with:allowances', 'distinct', 'exists:allowances,id'],
            'allowances.*.amount' => ['required_with:allowances', 'numeric', 'min:0'],
            'deductions' => ['nullable', 'array'],
            'deductions.*.deduction_id' => ['required_with:deductions', 'distinct', 'exists:deductions,id'],
            'deductions.*.amount' => ['required_with:deductions', 'numeric', 'min:0'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:active,inactive,on_leave,terminated'],
        ], [
            'allowances.*.allowance_id.distinct' => 'Duplicate allowances cannot be assigned to an employee.',
            'deductions.*.deduction_id.distinct' => 'Duplicate deductions cannot be assigned to an employee.',
        ]);

        $employee = Employee::create($validated);

        if ($request->has('allowances')) {
            foreach ($request->input('allowances', []) as $item) {
                if (!empty($item['allowance_id']) && isset($item['amount']) && $item['amount'] !== '' && is_numeric($item['amount'])) {
                    $employee->allowances()->create([
                        'allowance_id' => $item['allowance_id'],
                        'amount' => $item['amount'],
                    ]);
                }
            }
        }

        if ($request->has('deductions')) {
            foreach ($request->input('deductions', []) as $item) {
                if (!empty($item['deduction_id']) && isset($item['amount']) && $item['amount'] !== '' && is_numeric($item['amount'])) {
                    $employee->deductions()->create([
                        'deduction_id' => $item['deduction_id'],
                        'amount' => $item['amount'],
                    ]);
                }
            }
        }

        return redirect()->route('employees.index')
            ->with('message', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'employee_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('employees', 'employee_code')->ignore($employee->id),
            ],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employee->id),
            ],
            'phone' => ['required', 'string', 'max:30'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['required', 'date'],
            'department_id' => ['required', 'exists:departments,id'],
            'designation_id' => ['required', 'exists:designations,id'],
            'shift_id' => ['nullable', 'exists:shifts,id'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'account_holder_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'ifsc_code' => ['nullable', 'string', 'max:20'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'upi_id' => ['nullable', 'string', 'max:100'],
            'pan_number' => ['nullable', 'string', 'max:20'],
            'allowances' => ['nullable', 'array'],
            'allowances.*.allowance_id' => ['required_with:allowances', 'distinct', 'exists:allowances,id'],
            'allowances.*.amount' => ['required_with:allowances', 'numeric', 'min:0'],
            'deductions' => ['nullable', 'array'],
            'deductions.*.deduction_id' => ['required_with:deductions', 'distinct', 'exists:deductions,id'],
            'deductions.*.amount' => ['required_with:deductions', 'numeric', 'min:0'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:active,inactive,on_leave,terminated'],
        ], [
            'allowances.*.allowance_id.distinct' => 'Duplicate allowances cannot be assigned to an employee.',
            'deductions.*.deduction_id.distinct' => 'Duplicate deductions cannot be assigned to an employee.',
        ]);

        $employee->update($validated);

        // Sync employee allowances in separate table
        $employee->allowances()->delete();
        if ($request->has('allowances')) {
            foreach ($request->input('allowances', []) as $item) {
                if (!empty($item['allowance_id']) && isset($item['amount']) && $item['amount'] !== '' && is_numeric($item['amount'])) {
                    $employee->allowances()->create([
                        'allowance_id' => $item['allowance_id'],
                        'amount' => $item['amount'],
                    ]);
                }
            }
        }

        // Sync employee deductions in separate table
        $employee->deductions()->delete();
        if ($request->has('deductions')) {
            foreach ($request->input('deductions', []) as $item) {
                if (!empty($item['deduction_id']) && isset($item['amount']) && $item['amount'] !== '' && is_numeric($item['amount'])) {
                    $employee->deductions()->create([
                        'deduction_id' => $item['deduction_id'],
                        'amount' => $item['amount'],
                    ]);
                }
            }
        }

        return redirect()->back()
            ->with('message', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('employees.index')
            ->with('message', 'Employee deleted successfully.');
    }
}
