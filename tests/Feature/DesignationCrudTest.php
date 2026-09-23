<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DesignationCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_designations_index(): void
    {
        $user = User::factory()->create();

        $dept = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
            'status' => true,
        ]);

        Designation::create([
            'department_id' => $dept->id,
            'name' => 'Software Engineer',
            'code' => 'SE',
            'description' => 'Builds features',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('designations.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_designation(): void
    {
        $user = User::factory()->create();

        $dept = Department::create([
            'name' => 'Design',
            'code' => 'DSN',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->post(route('designations.store'), [
            'department_id' => $dept->id,
            'name' => 'UI/UX Designer',
            'code' => 'UID',
            'description' => 'Designs interfaces',
            'status' => true,
        ]);

        $response->assertRedirect(route('designations.index'));

        $this->assertDatabaseHas('designations', [
            'name' => 'UI/UX Designer',
            'code' => 'UID',
            'department_id' => $dept->id,
        ]);
    }

    public function test_department_id_is_required_when_creating_designation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('designations.store'), [
            'name' => 'Freelancer',
            'code' => 'FL',
            'status' => true,
        ]);

        $response->assertSessionHasErrors(['department_id']);
    }

    public function test_authenticated_user_can_update_designation(): void
    {
        $user = User::factory()->create();

        $dept = Department::create([
            'name' => 'Sales',
            'code' => 'SLS',
            'status' => true,
        ]);

        $designation = Designation::create([
            'department_id' => $dept->id,
            'name' => 'Sales Associate',
            'code' => 'SA',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('designations.update', $designation), [
            'department_id' => $dept->id,
            'name' => 'Senior Sales Executive',
            'code' => 'SSE',
            'description' => 'Leads sales team',
            'status' => true,
        ]);

        $response->assertRedirect(route('designations.index'));

        $this->assertDatabaseHas('designations', [
            'id' => $designation->id,
            'name' => 'Senior Sales Executive',
            'code' => 'SSE',
        ]);
    }

    public function test_authenticated_user_can_delete_designation(): void
    {
        $user = User::factory()->create();

        $dept = Department::create([
            'name' => 'Operations',
            'code' => 'OPS',
            'status' => true,
        ]);

        $designation = Designation::create([
            'department_id' => $dept->id,
            'name' => 'Temporary Contractor',
            'code' => 'TC',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('designations.destroy', $designation));

        $response->assertRedirect(route('designations.index'));

        $this->assertDatabaseMissing('designations', [
            'id' => $designation->id,
        ]);
    }
}
