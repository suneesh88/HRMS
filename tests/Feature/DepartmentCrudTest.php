<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_departments_index(): void
    {
        $user = User::factory()->create();

        Department::create([
            'name' => 'Human Resources',
            'code' => 'HR',
            'description' => 'Handles personnel and culture',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('departments.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_department(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('departments.store'), [
            'name' => 'Information Technology',
            'code' => 'IT',
            'description' => 'Tech and infrastructure',
            'status' => true,
        ]);

        $response->assertRedirect(route('departments.index'));

        $this->assertDatabaseHas('departments', [
            'name' => 'Information Technology',
            'code' => 'IT',
        ]);
    }

    public function test_authenticated_user_can_update_department(): void
    {
        $user = User::factory()->create();

        $department = Department::create([
            'name' => 'Finance',
            'code' => 'FIN',
            'description' => 'Financial operations',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('departments.update', $department), [
            'name' => 'Finance & Accounts',
            'code' => 'FA',
            'description' => 'Updated description',
            'status' => true,
        ]);

        $response->assertRedirect(route('departments.index'));

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Finance & Accounts',
            'code' => 'FA',
        ]);
    }

    public function test_authenticated_user_can_delete_department(): void
    {
        $user = User::factory()->create();

        $department = Department::create([
            'name' => 'Marketing',
            'code' => 'MKT',
            'description' => 'Growth and marketing',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('departments.destroy', $department));

        $response->assertRedirect(route('departments.index'));

        $this->assertDatabaseMissing('departments', [
            'id' => $department->id,
        ]);
    }
}

