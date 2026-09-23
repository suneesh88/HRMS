<?php

namespace Tests\Feature;

use App\Models\Allowance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AllowanceCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_allowances_index(): void
    {
        $user = User::factory()->create();

        Allowance::create([
            'name' => 'House Rent Allowance',
            'code' => 'HRA',
            'is_taxable' => false,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('allowances.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_allowance(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('allowances.store'), [
            'name' => 'Transport Allowance',
            'code' => 'TA',
            'is_taxable' => true,
            'description' => 'Standard city travel allowance',
            'status' => true,
        ]);

        $response->assertRedirect(route('allowances.index'));

        $this->assertDatabaseHas('allowances', [
            'name' => 'Transport Allowance',
            'code' => 'TA',
            'is_taxable' => true,
        ]);
    }

    public function test_allowance_creation_requires_mandatory_name_and_unique_code(): void
    {
        $user = User::factory()->create();

        Allowance::create([
            'name' => 'Medical Allowance',
            'code' => 'MED',
            'is_taxable' => true,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->post(route('allowances.store'), [
            'name' => '',
            'code' => 'MED', // duplicate code
        ]);

        $response->assertSessionHasErrors(['name', 'code']);
    }

    public function test_authenticated_user_can_update_allowance(): void
    {
        $user = User::factory()->create();

        $allowance = Allowance::create([
            'name' => 'Special Allowance',
            'code' => 'SA',
            'is_taxable' => true,
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('allowances.update', $allowance), [
            'name' => 'Special Executive Allowance',
            'code' => 'SEA',
            'is_taxable' => false,
            'status' => true,
        ]);

        $response->assertRedirect(route('allowances.index'));

        $this->assertDatabaseHas('allowances', [
            'id' => $allowance->id,
            'name' => 'Special Executive Allowance',
            'code' => 'SEA',
            'is_taxable' => false,
        ]);
    }

    public function test_authenticated_user_can_delete_allowance(): void
    {
        $user = User::factory()->create();

        $allowance = Allowance::create([
            'name' => 'Temporary Allowance',
            'code' => 'TEMP',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('allowances.destroy', $allowance));

        $response->assertRedirect(route('allowances.index'));

        $this->assertDatabaseMissing('allowances', [
            'id' => $allowance->id,
        ]);
    }

    public function test_cannot_delete_allowance_assigned_to_employee(): void
    {
        $user = User::factory()->create();

        $dept = \App\Models\Department::create(['name' => 'Tech', 'code' => 'TECH']);
        $desig = \App\Models\Designation::create(['department_id' => $dept->id, 'name' => 'Dev', 'code' => 'DEV']);
        $employee = \App\Models\Employee::create([
            'employee_code' => 'EMP-01',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '+1234567890',
            'joining_date' => '2026-01-01',
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $allowance = Allowance::create([
            'name' => 'Special Project Allowance',
            'code' => 'SPA',
            'status' => true,
        ]);

        \App\Models\EmployeeAllowance::create([
            'employee_id' => $employee->id,
            'allowance_id' => $allowance->id,
            'amount' => 5000.00,
        ]);

        $response = $this->actingAs($user)->delete(route('allowances.destroy', $allowance));

        $response->assertRedirect(route('allowances.index'));
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('allowances', [
            'id' => $allowance->id,
        ]);
    }
}
