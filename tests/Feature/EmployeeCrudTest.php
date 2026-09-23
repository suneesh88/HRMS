<?php

namespace Tests\Feature;

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeDeduction;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeCrudTest extends TestCase
{
    use RefreshDatabase;

    private function createDependencies(): array
    {
        $dept = Department::create([
            'name' => 'Technology',
            'code' => 'TECH',
            'status' => true,
        ]);

        $desig = Designation::create([
            'department_id' => $dept->id,
            'name' => 'Lead Architect',
            'code' => 'LA',
            'status' => true,
        ]);

        $shift = Shift::create([
            'name' => 'Day Shift',
            'code' => 'DS',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'status' => true,
        ]);

        $hra = Allowance::create([
            'name' => 'House Rent Allowance',
            'code' => 'HRA',
            'is_taxable' => false,
            'status' => true,
        ]);

        $ta = Allowance::create([
            'name' => 'Transport Allowance',
            'code' => 'TA',
            'is_taxable' => true,
            'status' => true,
        ]);

        $med = Allowance::create([
            'name' => 'Medical Allowance',
            'code' => 'MED',
            'is_taxable' => true,
            'status' => true,
        ]);

        $pf = Deduction::create([
            'name' => 'Provident Fund',
            'code' => 'PF',
            'is_statutory' => true,
            'status' => true,
        ]);

        $pt = Deduction::create([
            'name' => 'Professional Tax',
            'code' => 'PT',
            'is_statutory' => true,
            'status' => true,
        ]);

        return [$dept, $desig, $shift, $hra, $ta, $med, $pf, $pt];
    }

    public function test_authenticated_user_can_view_employees_index(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra, $ta, $med, $pf] = $this->createDependencies();

        $employee = Employee::create([
            'employee_code' => 'EMP-001',
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => 'alice.smith@example.com',
            'phone' => '+1234567890',
            'joining_date' => '2026-01-15',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        EmployeeAllowance::create([
            'employee_id' => $employee->id,
            'allowance_id' => $hra->id,
            'amount' => 12000.00,
        ]);

        EmployeeDeduction::create([
            'employee_id' => $employee->id,
            'deduction_id' => $pf->id,
            'amount' => 4000.00,
        ]);

        $response = $this->actingAs($user)->get(route('employees.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_view_employee_details(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra, $ta, $med, $pf, $pt] = $this->createDependencies();

        $employee = Employee::create([
            'employee_code' => 'EMP-005',
            'first_name' => 'Emma',
            'last_name' => 'Watson',
            'email' => 'emma@example.com',
            'phone' => '+1987654321',
            'joining_date' => '2026-01-10',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'salary' => 95000.00,
            'status' => 'active',
        ]);

        EmployeeAllowance::create([
            'employee_id' => $employee->id,
            'allowance_id' => $hra->id,
            'amount' => 15000.00,
        ]);

        EmployeeAllowance::create([
            'employee_id' => $employee->id,
            'allowance_id' => $ta->id,
            'amount' => 3000.00,
        ]);

        EmployeeDeduction::create([
            'employee_id' => $employee->id,
            'deduction_id' => $pf->id,
            'amount' => 5000.00,
        ]);

        EmployeeDeduction::create([
            'employee_id' => $employee->id,
            'deduction_id' => $pt->id,
            'amount' => 200.00,
        ]);

        $employee->refresh();

        $this->assertEquals(18000.00, $employee->total_allowances);
        $this->assertEquals(113000.00, $employee->gross_salary);
        $this->assertEquals(5200.00, $employee->total_deductions);
        $this->assertEquals(107800.00, $employee->net_salary);

        $response = $this->actingAs($user)->get(route('employees.show', $employee));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_employee_with_allowances_and_deductions(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra, $ta, $med, $pf, $pt] = $this->createDependencies();

        $allowances = [
            ['allowance_id' => $hra->id, 'amount' => 12000.00],
            ['allowance_id' => $med->id, 'amount' => 2500.00],
        ];

        $deductions = [
            ['deduction_id' => $pf->id, 'amount' => 3600.00],
            ['deduction_id' => $pt->id, 'amount' => 200.00],
        ];

        $response = $this->actingAs($user)->post(route('employees.store'), [
            'employee_code' => 'EMP-002',
            'first_name' => 'Bob',
            'last_name' => 'Johnson',
            'email' => null,
            'phone' => '+1234567890',
            'gender' => 'male',
            'joining_date' => '2026-02-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'salary' => 85000.00,
            'bank_name' => 'HDFC Bank',
            'account_holder_name' => 'Bob Johnson',
            'account_number' => '50100234567890',
            'ifsc_code' => 'HDFC0001234',
            'branch_name' => 'Tech Park Branch',
            'upi_id' => 'bob@okhdfcbank',
            'pan_number' => 'ABCDE1234F',
            'allowances' => $allowances,
            'deductions' => $deductions,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('employees.index'));

        $this->assertDatabaseHas('employees', [
            'employee_code' => 'EMP-002',
            'first_name' => 'Bob',
            'last_name' => 'Johnson',
            'email' => null,
            'phone' => '+1234567890',
            'bank_name' => 'HDFC Bank',
            'account_holder_name' => 'Bob Johnson',
            'account_number' => '50100234567890',
            'ifsc_code' => 'HDFC0001234',
            'branch_name' => 'Tech Park Branch',
            'upi_id' => 'bob@okhdfcbank',
            'pan_number' => 'ABCDE1234F',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
        ]);

        $created = Employee::where('employee_code', 'EMP-002')->first();
        $this->assertDatabaseHas('employee_allowances', [
            'employee_id' => $created->id,
            'allowance_id' => $hra->id,
            'amount' => 12000.00,
        ]);
        $this->assertDatabaseHas('employee_allowances', [
            'employee_id' => $created->id,
            'allowance_id' => $med->id,
            'amount' => 2500.00,
        ]);

        $this->assertDatabaseHas('employee_deductions', [
            'employee_id' => $created->id,
            'deduction_id' => $pf->id,
            'amount' => 3600.00,
        ]);
        $this->assertDatabaseHas('employee_deductions', [
            'employee_id' => $created->id,
            'deduction_id' => $pt->id,
            'amount' => 200.00,
        ]);

        $this->assertCount(2, $created->allowances);
        $this->assertCount(2, $created->deductions);
        $this->assertEquals(14500.00, $created->total_allowances);
        $this->assertEquals(99500.00, $created->gross_salary);
        $this->assertEquals(3800.00, $created->total_deductions);
        $this->assertEquals(95700.00, $created->net_salary);
    }

    public function test_employee_creation_requires_phone_and_mandatory_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('employees.store'), [
            'first_name' => '',
            'last_name' => '',
            'phone' => '', // phone is mandatory
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors([
            'employee_code',
            'first_name',
            'last_name',
            'phone',
            'email',
            'joining_date',
            'department_id',
            'designation_id',
            'employment_type',
            'status',
        ]);
    }

    public function test_authenticated_user_can_update_employee_allowances_and_deductions(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra, $ta, $med, $pf, $pt] = $this->createDependencies();

        $employee = Employee::create([
            'employee_code' => 'EMP-003',
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'phone' => '+9876543210',
            'email' => 'charlie@example.com',
            'joining_date' => '2026-03-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'contract',
            'salary' => 60000.00,
            'status' => 'active',
        ]);

        EmployeeAllowance::create([
            'employee_id' => $employee->id,
            'allowance_id' => $hra->id,
            'amount' => 5000.00,
        ]);

        EmployeeDeduction::create([
            'employee_id' => $employee->id,
            'deduction_id' => $pf->id,
            'amount' => 2000.00,
        ]);

        $response = $this->actingAs($user)->put(route('employees.update', $employee), [
            'employee_code' => 'EMP-003',
            'first_name' => 'Charles',
            'last_name' => 'Brown',
            'phone' => '+9876543211',
            'email' => null,
            'joining_date' => '2026-03-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'salary' => 70000.00,
            'bank_name' => 'State Bank of India',
            'account_holder_name' => 'Charles Brown',
            'account_number' => '20192837465',
            'ifsc_code' => 'SBIN0001234',
            'branch_name' => 'Main Branch',
            'upi_id' => 'charles@oksbi',
            'pan_number' => 'BNZPB1234K',
            'allowances' => [
                ['allowance_id' => $hra->id, 'amount' => 15000.00],
                ['allowance_id' => $ta->id, 'amount' => 8000.00],
                ['allowance_id' => $med->id, 'amount' => 2000.00],
            ],
            'deductions' => [
                ['deduction_id' => $pf->id, 'amount' => 4500.00],
                ['deduction_id' => $pt->id, 'amount' => 200.00],
            ],
            'status' => 'on_leave',
        ]);

        $response->assertRedirect();

        $employee->refresh();
        $this->assertEquals('Charles', $employee->first_name);
        $this->assertEquals(70000.00, (float) $employee->salary);
        $this->assertEquals('State Bank of India', $employee->bank_name);
        $this->assertEquals('20192837465', $employee->account_number);
        $this->assertEquals('SBIN0001234', $employee->ifsc_code);
        $this->assertEquals('charles@oksbi', $employee->upi_id);
        $this->assertEquals('BNZPB1234K', $employee->pan_number);

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'bank_name' => 'State Bank of India',
            'account_number' => '20192837465',
            'ifsc_code' => 'SBIN0001234',
            'upi_id' => 'charles@oksbi',
            'pan_number' => 'BNZPB1234K',
        ]);

        $this->assertDatabaseHas('employee_allowances', [
            'employee_id' => $employee->id,
            'allowance_id' => $hra->id,
            'amount' => 15000.00,
        ]);
        $this->assertDatabaseHas('employee_allowances', [
            'employee_id' => $employee->id,
            'allowance_id' => $ta->id,
            'amount' => 8000.00,
        ]);
        $this->assertDatabaseHas('employee_allowances', [
            'employee_id' => $employee->id,
            'allowance_id' => $med->id,
            'amount' => 2000.00,
        ]);

        $this->assertDatabaseHas('employee_deductions', [
            'employee_id' => $employee->id,
            'deduction_id' => $pf->id,
            'amount' => 4500.00,
        ]);
        $this->assertDatabaseHas('employee_deductions', [
            'employee_id' => $employee->id,
            'deduction_id' => $pt->id,
            'amount' => 200.00,
        ]);

        $this->assertCount(3, $employee->allowances);
        $this->assertCount(2, $employee->deductions);
        $this->assertEquals(25000.00, $employee->total_allowances);
        $this->assertEquals(95000.00, $employee->gross_salary);
        $this->assertEquals(4700.00, $employee->total_deductions);
        $this->assertEquals(90300.00, $employee->net_salary);
    }

    public function test_authenticated_user_can_delete_employee(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift] = $this->createDependencies();

        $employee = Employee::create([
            'employee_code' => 'EMP-004',
            'first_name' => 'David',
            'last_name' => 'Miller',
            'phone' => '+1122334455',
            'email' => 'david@example.com',
            'joining_date' => '2026-04-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->delete(route('employees.destroy', $employee));

        $response->assertRedirect(route('employees.index'));

        $this->assertDatabaseMissing('employees', [
            'id' => $employee->id,
        ]);
    }

    public function test_employee_cannot_have_duplicate_allowances(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra] = $this->createDependencies();

        $response = $this->actingAs($user)->post(route('employees.store'), [
            'employee_code' => 'EMP-099',
            'first_name' => 'Duplicate',
            'last_name' => 'Tester',
            'phone' => '+1122334455',
            'joining_date' => '2026-04-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'status' => 'active',
            'allowances' => [
                ['allowance_id' => $hra->id, 'amount' => 5000.00],
                ['allowance_id' => $hra->id, 'amount' => 3000.00], // duplicate HRA
            ],
        ]);

        $response->assertSessionHasErrors([
            'allowances.0.allowance_id',
            'allowances.1.allowance_id',
        ]);
    }

    public function test_employee_cannot_have_duplicate_deductions(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift, $hra, $ta, $med, $pf] = $this->createDependencies();

        $response = $this->actingAs($user)->post(route('employees.store'), [
            'employee_code' => 'EMP-098',
            'first_name' => 'Duplicate',
            'last_name' => 'Deductions',
            'phone' => '+1122334466',
            'joining_date' => '2026-04-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'shift_id' => $shift->id,
            'employment_type' => 'full_time',
            'status' => 'active',
            'deductions' => [
                ['deduction_id' => $pf->id, 'amount' => 2000.00],
                ['deduction_id' => $pf->id, 'amount' => 1500.00], // duplicate PF
            ],
        ]);

        $response->assertSessionHasErrors([
            'deductions.0.deduction_id',
            'deductions.1.deduction_id',
        ]);
    }

    public function test_employee_model_generates_sequential_employee_code(): void
    {
        [$dept, $desig, $shift] = $this->createDependencies();

        // 1. Initial empty state should start with EMP-001
        $this->assertEquals('EMP-001', Employee::generateNextEmployeeCode());

        // 2. Create an employee with EMP-001
        Employee::create([
            'employee_code' => 'EMP-001',
            'first_name' => 'First',
            'last_name' => 'User',
            'phone' => '+1111111111',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $this->assertEquals('EMP-002', Employee::generateNextEmployeeCode());

        // 3. Create another employee with EMP-005 (skipping some numbers)
        Employee::create([
            'employee_code' => 'EMP-005',
            'first_name' => 'Fifth',
            'last_name' => 'User',
            'phone' => '+2222222222',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $this->assertEquals('EMP-006', Employee::generateNextEmployeeCode());

        // 4. Test triple-digit increment e.g. EMP-099 -> EMP-100
        Employee::create([
            'employee_code' => 'EMP-099',
            'first_name' => 'Century',
            'last_name' => 'User',
            'phone' => '+3333333333',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $this->assertEquals('EMP-100', Employee::generateNextEmployeeCode());
    }

    public function test_employees_index_provides_next_sequential_employee_code(): void
    {
        $user = User::factory()->create();
        [$dept, $desig, $shift] = $this->createDependencies();

        Employee::create([
            'employee_code' => 'EMP-003',
            'first_name' => 'Three',
            'last_name' => 'User',
            'phone' => '+1234567890',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get(route('employees.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Employees/Index')
            ->where('nextEmployeeCode', 'EMP-004')
        );
    }
}
