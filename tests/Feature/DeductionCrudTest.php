<?php

namespace Tests\Feature;

use App\Models\Deduction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeductionCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_deductions_index(): void
    {
        $user = User::factory()->create();

        Deduction::create([
            'name' => 'Provident Fund',
            'code' => 'PF',
            'is_statutory' => true,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('deductions.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_deduction(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('deductions.store'), [
            'name' => 'Professional Tax',
            'code' => 'PT',
            'is_statutory' => true,
            'description' => 'State professional tax deduction',
            'status' => true,
        ]);

        $response->assertRedirect(route('deductions.index'));

        $this->assertDatabaseHas('deductions', [
            'name' => 'Professional Tax',
            'code' => 'PT',
            'is_statutory' => true,
        ]);
    }

    public function test_deduction_creation_requires_mandatory_name_and_unique_code(): void
    {
        $user = User::factory()->create();

        Deduction::create([
            'name' => 'Tax Deducted at Source',
            'code' => 'TDS',
            'is_statutory' => true,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->post(route('deductions.store'), [
            'name' => '',
            'code' => 'TDS', // duplicate code
        ]);

        $response->assertSessionHasErrors(['name', 'code']);
    }

    public function test_authenticated_user_can_update_deduction(): void
    {
        $user = User::factory()->create();

        $deduction = Deduction::create([
            'name' => 'Employee State Insurance',
            'code' => 'ESI',
            'is_statutory' => true,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('deductions.update', $deduction), [
            'name' => 'ESI Scheme',
            'code' => 'ESIS',
            'is_statutory' => true,
            'status' => true,
        ]);

        $response->assertRedirect(route('deductions.index'));

        $this->assertDatabaseHas('deductions', [
            'id' => $deduction->id,
            'name' => 'ESI Scheme',
            'code' => 'ESIS',
            'is_statutory' => true,
        ]);
    }

    public function test_authenticated_user_can_delete_deduction(): void
    {
        $user = User::factory()->create();

        $deduction = Deduction::create([
            'name' => 'Temporary Deduction',
            'code' => 'TEMP_DED',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('deductions.destroy', $deduction));

        $response->assertRedirect(route('deductions.index'));

        $this->assertDatabaseMissing('deductions', [
            'id' => $deduction->id,
        ]);
    }

    public function test_cannot_delete_deduction_assigned_to_employee(): void
    {
        $user = User::factory()->create();

        $dept = \App\Models\Department::create(['name' => 'Tech', 'code' => 'TECH']);
        $desig = \App\Models\Designation::create(['department_id' => $dept->id, 'name' => 'Dev', 'code' => 'DEV']);
        $employee = \App\Models\Employee::create([
            'employee_code' => 'EMP-02',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'phone' => '+1234567890',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $deduction = Deduction::create([
            'name' => 'Provident Fund',
            'code' => 'PF_DED',
            'is_statutory' => true,
            'status' => true,
        ]);

        \App\Models\EmployeeDeduction::create([
            'employee_id' => $employee->id,
            'deduction_id' => $deduction->id,
            'amount' => 4500.00,
        ]);

        $response = $this->actingAs($user)->delete(route('deductions.destroy', $deduction));

        $response->assertRedirect(route('deductions.index'));
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('deductions', [
            'id' => $deduction->id,
        ]);
    }
}

