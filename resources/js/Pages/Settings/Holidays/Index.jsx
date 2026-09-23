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
    CalendarDays,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    Calendar,
    Sparkles,
    ShieldCheck,
    BookmarkCheck,
    Clock,
    Building2,
    ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

const TYPE_CONFIG = {
    public: {
        label: 'Public Holiday',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
    },
    restricted: {
        label: 'Restricted / Optional',
        classes: 'bg-purple-50 text-purple-700 border-purple-200/80',
        dot: 'bg-purple-500',
    },
    company: {
        label: 'Company Holiday',
        classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500',
    },
};

export default function HolidaysIndex({
    holidays,
    metrics = {},
    years = [],
    selectedYear = new Date().getFullYear(),
    filters,
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [yearFilter, setYearFilter] = useState(selectedYear);
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);

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
        date: '',
        end_date: '',
        type: 'public',
        description: '',
        status: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingHoliday(null);
        setData({
            name: '',
            date: `${selectedYear}-01-01`,
            end_date: '',
            type: 'public',
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (holiday) => {
        clearErrors();
        setEditingHoliday(holiday);
        setData({
            name: holiday.name,
            date: holiday.date ? holiday.date.substring(0, 10) : '',
            end_date: holiday.end_date ? holiday.end_date.substring(0, 10) : '',
            type: holiday.type || 'public',
            description: holiday.description || '',
            status: Boolean(holiday.status),
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
        if (editingHoliday) {
            put(route('holidays.update', editingHoliday.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('holidays.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (holiday) => {
        setHolidayToDelete(holiday);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setHolidayToDelete(null);
    };

    const handleDelete = () => {
        if (holidayToDelete) {
            router.delete(route('holidays.destroy', holidayToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const handleFilterChange = (params) => {
        router.get(
            route('holidays.index'),
            {
                year: yearFilter,
                search,
                type: typeFilter,
                status: statusFilter,
                ...params,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const formatDateBadge = (dateStr) => {
        if (!dateStr) return { month: '—', day: '—', dayOfWeek: '—' };
        const d = new Date(dateStr);
        const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = d.getDate();
        const dayOfWeek = d.toLocaleString('default', { weekday: 'short' });
        return { month, day, dayOfWeek };
    };

    const getDurationText = (startStr, endStr) => {
        if (!startStr) return '';
        if (!endStr || startStr === endStr) return '1 Day';
        const s = new Date(startStr);
        const e = new Date(endStr);
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} Days`;
    };

    const isUpcoming = (dateStr, endDateStr) => {
        const checkDate = endDateStr || dateStr;
        if (!checkDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return checkDate >= today;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <CalendarDays className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Holiday Masters
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Manage public holidays, restricted options, and company closures
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Year Quick Selector */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                            {years.map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => {
                                        setYearFilter(y);
                                        handleFilterChange({ year: y });
                                    }}
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                        Number(yearFilter) === Number(y)
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>

                        <PrimaryButton
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Holiday</span>
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Holiday Masters" />

            <div className="space-y-6">
                {/* Flash message */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Total Holidays ({yearFilter})
                            </span>
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <Calendar className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {metrics.total || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Upcoming Holidays
                            </span>
                            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                                <Sparkles className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {metrics.upcoming || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Public Holidays
                            </span>
                            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {metrics.public || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Restricted / Optional
                            </span>
                            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                <BookmarkCheck className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-600">
                            {metrics.restricted || 0}
                        </p>
                    </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex-1 sm:max-w-md"
                        >
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by holiday name or description..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    handleFilterChange({
                                        type: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Holiday Types</option>
                                <option value="public">Public Holidays</option>
                                <option value="restricted">
                                    Restricted / Optional
                                </option>
                                <option value="company">
                                    Company Holidays
                                </option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    handleFilterChange({
                                        status: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="1">Active Only</option>
                                <option value="0">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Holidays Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Date</th>
                                    <th className="px-6 py-3.5">Holiday Name</th>
                                    <th className="px-6 py-3.5">Type</th>
                                    <th className="px-6 py-3.5">Duration</th>
                                    <th className="px-6 py-3.5">Timeline</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {holidays.data && holidays.data.length > 0 ? (
                                    holidays.data.map((holiday) => {
                                        const dateBadge = formatDateBadge(
                                            holiday.date,
                                        );
                                        const typeCfg =
                                            TYPE_CONFIG[holiday.type] ||
                                            TYPE_CONFIG.public;
                                        const upcoming = isUpcoming(
                                            holiday.date,
                                            holiday.end_date,
                                        );

                                        return (
                                            <tr
                                                key={holiday.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                {/* Date Badge */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                                                            <span className="text-[9px] font-bold uppercase text-indigo-600">
                                                                {dateBadge.month}
                                                            </span>
                                                            <span className="text-sm font-extrabold leading-none">
                                                                {dateBadge.day}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-slate-900 block">
                                                                {holiday.date}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500">
                                                                {dateBadge.dayOfWeek}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Holiday Name & Description */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {holiday.name}
                                                        </p>
                                                        {holiday.description && (
                                                            <p className="text-[11px] text-slate-500 line-clamp-1">
                                                                {holiday.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${typeCfg.classes}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${typeCfg.dot}`}
                                                        />
                                                        {typeCfg.label}
                                                    </span>
                                                </td>

                                                {/* Duration */}
                                                <td className="px-6 py-4">
                                                    {holiday.end_date &&
                                                    holiday.end_date !== holiday.date ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                                                            {getDurationText(
                                                                holiday.date,
                                                                holiday.end_date,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 font-medium">
                                                            1 Day
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Timeline Status */}
                                                <td className="px-6 py-4">
                                                    {upcoming ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                                                            <Sparkles className="h-3 w-3" />
                                                            Upcoming
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Clock className="h-3 w-3" />
                                                            Past
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {holiday.status ? (
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

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(holiday)
                                                            }
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                            title="Edit Holiday"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(holiday)
                                                            }
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                            title="Delete Holiday"
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
                                            colSpan="7"
                                            className="px-6 py-12 text-center text-slate-400"
                                        >
                                            No holidays found for year {yearFilter}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {holidays.links && holidays.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {holidays.from || 0} to{' '}
                                {holidays.to || 0} of {holidays.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {holidays.links.map((link, idx) => (
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
                        {editingHoliday ? 'Edit Holiday' : 'Create New Holiday'}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {/* Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Holiday Name *" />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Independence Day, Diwali"
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        {/* Date & End Date */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="date" value="Holiday Date *" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError message={errors.date} className="mt-1.5" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="end_date"
                                    value="End Date (Optional / Multi-day)"
                                />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    min={data.date}
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                />
                                <InputError
                                    message={errors.end_date}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <InputLabel htmlFor="type" value="Holiday Type *" />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                required
                            >
                                <option value="public">Public Holiday</option>
                                <option value="restricted">
                                    Restricted / Optional Holiday
                                </option>
                                <option value="company">Company Holiday</option>
                            </select>
                            <InputError message={errors.type} className="mt-1.5" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description / Notes"
                            />
                            <textarea
                                id="description"
                                rows="3"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900 placeholder:text-slate-400"
                                placeholder="Details about this holiday..."
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
                                Active Holiday
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
                            {editingHoliday ? 'Save Changes' : 'Create Holiday'}
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
                                Delete Holiday
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {holidayToDelete?.name}
                                </strong>{' '}
                                ({holidayToDelete?.date})? This action cannot be undone.
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

