<?php

namespace Tests\Feature;

use App\Models\Holiday;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HolidayCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_holidays_index(): void
    {
        $user = User::factory()->create();

        Holiday::create([
            'name' => 'New Year Day',
            'date' => '2026-01-01',
            'type' => 'public',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->get(route('holidays.index', ['year' => 2026]));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_single_day_holiday(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'name' => 'Republic Day',
            'date' => '2026-01-26',
            'type' => 'public',
            'description' => 'National Holiday',
            'status' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('holidays', [
            'name' => 'Republic Day',
            'date' => '2026-01-26',
            'type' => 'public',
        ]);
    }

    public function test_authenticated_user_can_create_multi_day_holiday(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'name' => 'Diwali Break',
            'date' => '2026-11-08',
            'end_date' => '2026-11-10',
            'type' => 'company',
            'description' => 'Festival of Lights',
            'status' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('holidays', [
            'name' => 'Diwali Break',
            'date' => '2026-11-08',
            'end_date' => '2026-11-10',
            'type' => 'company',
        ]);
    }

    public function test_holiday_creation_validates_dates_and_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'name' => '',
            'date' => 'invalid-date',
            'end_date' => '2026-01-01',
            'type' => 'invalid-type',
        ]);

        $response->assertSessionHasErrors(['name', 'date', 'type']);
    }

    public function test_authenticated_user_can_update_holiday(): void
    {
        $user = User::factory()->create();

        $holiday = Holiday::create([
            'name' => 'Spring Festival',
            'date' => '2026-03-15',
            'type' => 'restricted',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->put(route('holidays.update', $holiday), [
            'name' => 'Holi Festival',
            'date' => '2026-03-16',
            'end_date' => '2026-03-17',
            'type' => 'public',
            'status' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('holidays', [
            'id' => $holiday->id,
            'name' => 'Holi Festival',
            'date' => '2026-03-16',
            'end_date' => '2026-03-17',
            'type' => 'public',
        ]);
    }

    public function test_authenticated_user_can_delete_holiday(): void
    {
        $user = User::factory()->create();

        $holiday = Holiday::create([
            'name' => 'Temporary Closure',
            'date' => '2026-06-01',
            'type' => 'company',
            'status' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('holidays.destroy', $holiday));

        $response->assertRedirect();

        $this->assertDatabaseMissing('holidays', [
            'id' => $holiday->id,
        ]);
    }
}

