import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Clock,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    Coffee,
    Hourglass,
    Sun,
    Moon,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';

const DAYS_OF_WEEK = [
    { key: 'Monday', short: 'Mon', full: 'Monday' },
    { key: 'Tuesday', short: 'Tue', full: 'Tuesday' },
    { key: 'Wednesday', short: 'Wed', full: 'Wednesday' },
    { key: 'Thursday', short: 'Thu', full: 'Thursday' },
    { key: 'Friday', short: 'Fri', full: 'Friday' },
    { key: 'Saturday', short: 'Sat', full: 'Saturday' },
    { key: 'Sunday', short: 'Sun', full: 'Sunday' },
];

export default function ShiftsIndex({ shifts, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Create / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        code: '',
        start_time: '09:00',
        end_time: '18:00',
        break_duration_minutes: 60,
        grace_period_minutes: 15,
        weekend_days: ['Sunday'],
        description: '',
        status: true,
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12;
        return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const calculateDuration = (start, end, breakMinutes = 0) => {
        if (!start || !end) return '';
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let startMinutes = h1 * 60 + m1;
        let endMinutes = h2 * 60 + m2;
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60; // overnight shift
        }
        const totalMinutes = endMinutes - startMinutes;
        const netMinutes = Math.max(0, totalMinutes - (Number(breakMinutes) || 0));
        const hours = Math.floor(netMinutes / 60);
        const mins = netMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
    };

    const toggleWeekendDay = (dayKey) => {
        const current = Array.isArray(data.weekend_days)
            ? [...data.weekend_days]
            : [];
        if (current.includes(dayKey)) {
            setData(
                'weekend_days',
                current.filter((d) => d !== dayKey),
            );
        } else {
            setData('weekend_days', [...current, dayKey]);
        }
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingShift(null);
        setData({
            name: '',
            code: '',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 60,
            grace_period_minutes: 15,
            weekend_days: ['Sunday'],
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (shift) => {
        clearErrors();
        setEditingShift(shift);
        setData({
            name: shift.name,
            code: shift.code || '',
            start_time: shift.start_time
                ? shift.start_time.substring(0, 5)
                : '09:00',
            end_time: shift.end_time ? shift.end_time.substring(0, 5) : '18:00',
            break_duration_minutes: shift.break_duration_minutes ?? 60,
            grace_period_minutes: shift.grace_period_minutes ?? 15,
            weekend_days: Array.isArray(shift.weekend_days)
                ? shift.weekend_days
                : ['Sunday'],
            description: shift.description || '',
            status: Boolean(shift.status),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingShift) {
            put(route('shifts.update', editingShift.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('shifts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (shift) => {
        setShiftToDelete(shift);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setShiftToDelete(null);
    };

    const handleDelete = () => {
        if (shiftToDelete) {
            router.delete(route('shifts.destroy', shiftToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('shifts.index'),
            { search, status: statusFilter },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        router.get(
            route('shifts.index'),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <Clock className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Shift Masters
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Configure shift timings, weekly off days, break durations, and late grace periods
                                </p>
                            </div>
                        </div>
                    </div>
                    <PrimaryButton
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Shift</span>
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Shift Masters" />

            <div className="space-y-6">
                {/* Flash Message Banner */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Filters and Search Bar */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex-1 sm:max-w-md"
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by shift name, code, description..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                            Status:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                handleStatusFilterChange(e.target.value)
                            }
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="1">Active Only</option>
                            <option value="0">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Shifts Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Shift Name</th>
                                    <th className="px-6 py-3.5">Code</th>
                                    <th className="px-6 py-3.5">Timings</th>
                                    <th className="px-6 py-3.5">Net Work Hours</th>
                                    <th className="px-6 py-3.5">Weekend / Off Days</th>
                                    <th className="px-6 py-3.5">Break</th>
                                    <th className="px-6 py-3.5">Grace Period</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {shifts.data && shifts.data.length > 0 ? (
                                    shifts.data.map((shift) => {
                                        const isNight =
                                            shift.start_time &&
                                            shift.end_time &&
                                            shift.end_time < shift.start_time;

                                        const weekendList = Array.isArray(
                                            shift.weekend_days,
                                        )
                                            ? shift.weekend_days
                                            : [];

                                        return (
                                            <tr
                                                key={shift.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {isNight ? (
                                                            <Moon className="h-4 w-4 text-indigo-500 shrink-0" />
                                                        ) : (
                                                            <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                                                        )}
                                                        <span className="font-semibold text-slate-900">
                                                            {shift.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {shift.code ? (
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 border border-slate-200">
                                                            {shift.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>
                                                            {formatTime(
                                                                shift.start_time,
                                                            )}{' '}
                                                            -{' '}
                                                            {formatTime(
                                                                shift.end_time,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                                                        {calculateDuration(
                                                            shift.start_time,
                                                            shift.end_time,
                                                            shift.break_duration_minutes,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {weekendList.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {weekendList.map(
                                                                (day) => (
                                                                    <span
                                                                        key={day}
                                                                        className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200/60"
                                                                    >
                                                                        {day.substring(
                                                                            0,
                                                                            3,
                                                                        )}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            None
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                        <Coffee className="h-3.5 w-3.5 text-amber-600/70" />
                                                        {
                                                            shift.break_duration_minutes
                                                        }
                                                        m
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                        <Hourglass className="h-3.5 w-3.5 text-slate-400" />
                                                        {
                                                            shift.grace_period_minutes
                                                        }
                                                        m
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {shift.status ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    shift,
                                                                )
                                                            }
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                            title="Edit Shift"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    shift,
                                                                )
                                                            }
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                            title="Delete Shift"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="px-6 py-10 text-center text-slate-400"
                                        >
                                            No shifts found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {shifts.links && shifts.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {shifts.from || 0} to{' '}
                                {shifts.to || 0} of {shifts.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {shifts.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        disabled={!link.url || link.active}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        {editingShift ? 'Edit Shift' : 'Create New Shift'}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {/* Name & Code */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Shift Name *"
                                />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. General Shift, Night Shift"
                                    required
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="code"
                                    value="Shift Code (Optional)"
                                />
                                <TextInput
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs font-mono"
                                    placeholder="e.g. GS, MS, NS"
                                />
                                <InputError
                                    message={errors.code}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        {/* Shift Timings */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="start_time"
                                    value="Start Time *"
                                />
                                <TextInput
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData('start_time', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError
                                    message={errors.start_time}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="end_time"
                                    value="End Time *"
                                />
                                <TextInput
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) =>
                                        setData('end_time', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError
                                    message={errors.end_time}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        {/* Break Duration & Grace Period */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="break_duration_minutes"
                                    value="Break Duration (Minutes)"
                                />
                                <TextInput
                                    id="break_duration_minutes"
                                    type="number"
                                    min="0"
                                    max="480"
                                    value={data.break_duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'break_duration_minutes',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full text-xs"
                                    placeholder="60"
                                />
                                <InputError
                                    message={errors.break_duration_minutes}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="grace_period_minutes"
                                    value="Late Grace Period (Minutes)"
                                />
                                <TextInput
                                    id="grace_period_minutes"
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={data.grace_period_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'grace_period_minutes',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full text-xs"
                                    placeholder="15"
                                />
                                <InputError
                                    message={errors.grace_period_minutes}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        {/* Multi-Select Weekend Days */}
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel
                                    value="Weekend / Weekly Off Days"
                                    className="flex items-center gap-1.5"
                                />
                                {/* Quick Presets */}
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <span className="font-medium text-slate-400">
                                        Presets:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('weekend_days', ['Sunday'])
                                        }
                                        className="rounded px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 font-medium transition"
                                    >
                                        Sun Only
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('weekend_days', [
                                                'Saturday',
                                                'Sunday',
                                            ])
                                        }
                                        className="rounded px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 font-medium transition"
                                    >
                                        Sat & Sun
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('weekend_days', [
                                                'Friday',
                                                'Saturday',
                                            ])
                                        }
                                        className="rounded px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 font-medium transition"
                                    >
                                        Fri & Sat
                                    </button>
                                </div>
                            </div>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                                Select one or multiple days that will be treated
                                as non-working weekend days for this shift.
                            </p>

                            {/* 7 Days Toggle Pills */}
                            <div className="mt-2.5 grid grid-cols-7 gap-1.5 sm:gap-2">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = Array.isArray(
                                        data.weekend_days,
                                    )
                                        ? data.weekend_days.includes(day.key)
                                        : false;

                                    return (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() =>
                                                toggleWeekendDay(day.key)
                                            }
                                            className={`flex flex-col items-center justify-center rounded-lg border py-2 text-center transition-all ${
                                                isSelected
                                                    ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-400 font-semibold'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm">
                                                {day.short}
                                            </span>
                                            <span
                                                className={`mt-0.5 text-[9px] font-medium uppercase tracking-wider ${
                                                    isSelected
                                                        ? 'text-rose-600'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {isSelected ? 'Off' : 'Work'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError
                                message={errors.weekend_days}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Duration Preview Banner */}
                        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/80 flex items-center justify-between">
                            <span className="font-medium text-slate-700">
                                Calculated Working Hours:
                            </span>
                            <span className="font-bold text-indigo-600">
                                {calculateDuration(
                                    data.start_time,
                                    data.end_time,
                                    data.break_duration_minutes,
                                )}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                            />
                            <textarea
                                id="description"
                                rows="2"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900 placeholder:text-slate-400"
                                placeholder="Details about this work shift..."
                            />
                            <InputError
                                message={errors.description}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Status Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="status"
                                type="checkbox"
                                checked={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                                htmlFor="status"
                                className="text-xs font-medium text-slate-700"
                            >
                                Active Shift
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <SecondaryButton
                            type="button"
                            onClick={closeModal}
                            disabled={processing}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {editingShift ? 'Save Changes' : 'Create Shift'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Delete Shift
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {shiftToDelete?.name}
                                </strong>
                                ? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <SecondaryButton onClick={closeDeleteModal}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Yes, Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
