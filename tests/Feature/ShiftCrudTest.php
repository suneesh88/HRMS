<?php

namespace Tests\Feature;

use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_shifts_index(): void
    {
        $user = User::factory()->create();

        Shift::create([
            'name' => 'General Shift',
            'code' => 'GS',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'break_duration_minutes' => 60,
            'grace_period_minutes' => 15,
            'weekend_days' => ['Saturday', 'Sunday'],
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('shifts.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_shift_with_multiple_weekend_days(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('shifts.store'), [
            'name' => 'Morning Shift',
            'code' => 'MS',
            'start_time' => '07:00',
            'end_time' => '15:30',
            'break_duration_minutes' => 45,
            'grace_period_minutes' => 10,
            'weekend_days' => ['Friday', 'Saturday'],
            'description' => 'Early morning operational shift',
            'status' => true,
        ]);

        $response->assertRedirect(route('shifts.index'));

        $this->assertDatabaseHas('shifts', [
            'name' => 'Morning Shift',
            'code' => 'MS',
        ]);

        $shift = Shift::where('code', 'MS')->first();
        $this->assertEquals(['Friday', 'Saturday'], $shift->weekend_days);
    }

    public function test_shift_timings_and_weekend_days_are_validated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('shifts.store'), [
            'name' => 'Invalid Shift',
            'start_time' => 'invalid-time',
            'end_time' => '18:00',
            'weekend_days' => ['Funday'], // invalid day name
        ]);

        $response->assertSessionHasErrors(['start_time', 'weekend_days.0']);
    }

    public function test_authenticated_user_can_update_shift_weekend_days(): void
    {
        $user = User::factory()->create();

        $shift = Shift::create([
            'name' => 'Night Shift',
            'code' => 'NS',
            'start_time' => '22:00',
            'end_time' => '06:00',
            'break_duration_minutes' => 30,
            'grace_period_minutes' => 15,
            'weekend_days' => ['Sunday'],
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('shifts.update', $shift), [
            'name' => 'Overnight Shift',
            'code' => 'ONS',
            'start_time' => '21:00',
            'end_time' => '05:30',
            'break_duration_minutes' => 45,
            'grace_period_minutes' => 10,
            'weekend_days' => ['Saturday', 'Sunday'],
            'status' => true,
        ]);

        $response->assertRedirect(route('shifts.index'));

        $shift->refresh();
        $this->assertEquals('Overnight Shift', $shift->name);
        $this->assertEquals(['Saturday', 'Sunday'], $shift->weekend_days);
    }

    public function test_authenticated_user_can_delete_shift(): void
    {
        $user = User::factory()->create();

        $shift = Shift::create([
            'name' => 'Temporary Shift',
            'code' => 'TS',
            'start_time' => '10:00',
            'end_time' => '14:00',
            'weekend_days' => ['Sunday'],
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('shifts.destroy', $shift));

        $response->assertRedirect(route('shifts.index'));

        $this->assertDatabaseMissing('shifts', [
            'id' => $shift->id,
        ]);
    }
}
