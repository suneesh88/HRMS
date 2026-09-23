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
    Receipt,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Scale,
    HeartHandshake,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function DeductionsIndex({
    deductions,
    metrics = {},
    filters,
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statutoryFilter, setStatutoryFilter] = useState(
        filters.statutory || '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeduction, setEditingDeduction] = useState(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deductionToDelete, setDeductionToDelete] = useState(null);

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
        is_statutory: false,
        description: '',
        status: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingDeduction(null);
        setData({
            name: '',
            code: '',
            is_statutory: false,
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (deduction) => {
        clearErrors();
        setEditingDeduction(deduction);
        setData({
            name: deduction.name,
            code: deduction.code || '',
            is_statutory: Boolean(deduction.is_statutory),
            description: deduction.description || '',
            status: Boolean(deduction.status),
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
        if (editingDeduction) {
            put(route('deductions.update', editingDeduction.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('deductions.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (deduction) => {
        setDeductionToDelete(deduction);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeductionToDelete(null);
    };

    const handleDelete = () => {
        if (deductionToDelete) {
            router.delete(route('deductions.destroy', deductionToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const handleFilterChange = (params) => {
        router.get(
            route('deductions.index'),
            {
                search,
                statutory: statutoryFilter,
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
                                <Receipt className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Deduction Masters
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Define company payroll deductions and statutory withholding rules
                                </p>
                            </div>
                        </div>
                    </div>

                    <PrimaryButton
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Deduction</span>
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Deduction Masters" />

            <div className="space-y-6">
                {/* Flash success message */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Flash error message */}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-sm">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Total Deductions
                            </span>
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <Receipt className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {metrics.total || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Active Deductions
                            </span>
                            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {metrics.active || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Statutory (Govt/Legal)
                            </span>
                            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                <Scale className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-600">
                            {metrics.statutory || 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Voluntary / Other
                            </span>
                            <span className="rounded-lg bg-sky-50 p-2 text-sky-600">
                                <HeartHandshake className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-sky-600">
                            {metrics.voluntary || 0}
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
                                placeholder="Search by deduction name, code, or description..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Statutory Filter */}
                            <select
                                value={statutoryFilter}
                                onChange={(e) => {
                                    setStatutoryFilter(e.target.value);
                                    handleFilterChange({
                                        statutory: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            >
                                <option value="">All Classifications</option>
                                <option value="1">Statutory Only</option>
                                <option value="0">Voluntary Only</option>
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
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="1">Active Only</option>
                                <option value="0">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Deductions Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Deduction Name</th>
                                    <th className="px-6 py-3.5">Code</th>
                                    <th className="px-6 py-3.5">Classification</th>
                                    <th className="px-6 py-3.5">Assigned To</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {deductions.data && deductions.data.length > 0 ? (
                                    deductions.data.map((deduction) => (
                                        <tr
                                            key={deduction.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            {/* Name & Description */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-900 text-sm">
                                                        {deduction.name}
                                                    </p>
                                                    {deduction.description && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            {deduction.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Code */}
                                            <td className="px-6 py-4">
                                                {deduction.code ? (
                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 border border-slate-200">
                                                        {deduction.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>

                                            {/* Classification */}
                                            <td className="px-6 py-4">
                                                {deduction.is_statutory ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200/60">
                                                        <Scale className="h-3 w-3" />
                                                        Statutory (Govt)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-200/60">
                                                        <HeartHandshake className="h-3 w-3" />
                                                        Voluntary
                                                    </span>
                                                )}
                                            </td>

                                            {/* Assigned Employees */}
                                            <td className="px-6 py-4">
                                                {Number(deduction.employee_deductions_count || 0) > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
                                                        <Users className="h-3 w-3" />
                                                        {deduction.employee_deductions_count} {deduction.employee_deductions_count === 1 ? 'Employee' : 'Employees'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {deduction.status ? (
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
                                                            openEditModal(deduction)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                                                        title="Edit Deduction"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(deduction)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                        title="Delete Deduction"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center text-slate-400"
                                        >
                                            No deductions found. Click "Add Deduction" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {deductions.links && deductions.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {deductions.from || 0} to{' '}
                                {deductions.to || 0} of {deductions.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {deductions.links.map((link, idx) => (
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
                                                ? 'bg-rose-600 text-white'
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
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        {editingDeduction ? 'Edit Deduction' : 'Create New Deduction'}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {/* Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Deduction Name *" />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Provident Fund (PF), Professional Tax, TDS"
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        {/* Code */}
                        <div>
                            <InputLabel htmlFor="code" value="Deduction Code (Optional)" />
                            <TextInput
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value.toUpperCase())
                                }
                                className="mt-1 block w-full text-xs font-mono"
                                placeholder="e.g. PF, PT, ESI, TDS"
                            />
                            <InputError message={errors.code} className="mt-1.5" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description / Rules"
                            />
                            <textarea
                                id="description"
                                rows="3"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-xs text-slate-900 placeholder:text-slate-400"
                                placeholder="Details about this payroll deduction..."
                            />
                            <InputError
                                message={errors.description}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            {/* Statutory Checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="is_statutory"
                                    type="checkbox"
                                    checked={data.is_statutory}
                                    onChange={(e) =>
                                        setData('is_statutory', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                <label
                                    htmlFor="is_statutory"
                                    className="text-xs font-medium text-slate-700"
                                >
                                    Statutory / Mandatory (Govt)
                                </label>
                            </div>

                            {/* Status Checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="status"
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                <label
                                    htmlFor="status"
                                    className="text-xs font-medium text-slate-700"
                                >
                                    Active Deduction
                                </label>
                            </div>
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
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {editingDeduction ? 'Save Changes' : 'Create Deduction'}
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
                                Delete Deduction
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {deductionToDelete?.name}
                                </strong>{' '}
                                {deductionToDelete?.code ? `(${deductionToDelete?.code})` : ''}?
                            </p>
                        </div>
                    </div>

                    {Number(deductionToDelete?.employee_deductions_count || 0) > 0 ? (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-semibold block text-rose-900">
                                        Deletion Blocked
                                    </strong>
                                    <span>
                                        This deduction is currently assigned to{' '}
                                        <strong className="font-bold">
                                            {deductionToDelete.employee_deductions_count} employee(s)
                                        </strong>. You must remove it from their employee profiles before deleting.
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-slate-500">
                            This action cannot be undone.
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <SecondaryButton onClick={closeDeleteModal}>
                            {Number(deductionToDelete?.employee_deductions_count || 0) > 0 ? 'Close' : 'Cancel'}
                        </SecondaryButton>
                        {Number(deductionToDelete?.employee_deductions_count || 0) === 0 && (
                            <DangerButton onClick={handleDelete}>
                                Yes, Delete
                            </DangerButton>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
