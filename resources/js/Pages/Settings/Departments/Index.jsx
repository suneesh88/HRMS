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
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    SlidersHorizontal,
    Layers,
} from 'lucide-react';
import { useState } from 'react';

export default function DepartmentsIndex({ departments, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Create / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

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
        description: '',
        status: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingDepartment(null);
        setData({
            name: '',
            code: '',
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (department) => {
        clearErrors();
        setEditingDepartment(department);
        setData({
            name: department.name,
            code: department.code || '',
            description: department.description || '',
            status: Boolean(department.status),
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
        if (editingDepartment) {
            put(route('departments.update', editingDepartment.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('departments.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (department) => {
        setDepartmentToDelete(department);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
    };

    const handleDelete = () => {
        if (departmentToDelete) {
            router.delete(route('departments.destroy', departmentToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('departments.index'),
            { search, status: statusFilter },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        router.get(
            route('departments.index'),
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
                                <Building2 className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Department Masters
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Create, edit, and organize company departments
                                </p>
                            </div>
                        </div>
                    </div>
                    <PrimaryButton
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Department</span>
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Department Masters" />

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
                            placeholder="Search by department name or code..."
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

                {/* Departments Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Department Name</th>
                                    <th className="px-6 py-3.5">Code</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Designations</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {departments.data && departments.data.length > 0 ? (
                                    departments.data.map((dept) => (
                                        <tr
                                            key={dept.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {dept.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {dept.code ? (
                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 border border-slate-200">
                                                        {dept.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                                                {dept.description || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">
                                                    <Layers className="h-3 w-3" />
                                                    {dept.designations_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {dept.status ? (
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
                                                            openEditModal(dept)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                        title="Edit Department"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(dept)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                        title="Delete Department"
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
                                            className="px-6 py-10 text-center text-slate-400"
                                        >
                                            No departments found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {departments.links && departments.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {departments.from || 0} to{' '}
                                {departments.to || 0} of {departments.total || 0}{' '}
                                entries
                            </span>
                            <div className="flex items-center gap-1">
                                {departments.links.map((link, idx) => (
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
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        {editingDepartment
                            ? 'Edit Department'
                            : 'Create New Department'}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {/* Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Department Name *" />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Engineering, Human Resources"
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        {/* Code */}
                        <div>
                            <InputLabel
                                htmlFor="code"
                                value="Department Code (Optional)"
                            />
                            <TextInput
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                className="mt-1 block w-full text-xs font-mono"
                                placeholder="e.g. ENG, HR, FIN"
                            />
                            <InputError message={errors.code} className="mt-1.5" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                            />
                            <textarea
                                id="description"
                                rows="3"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900 placeholder:text-slate-400"
                                placeholder="Brief summary of this department's role..."
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
                                Active Department
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
                            {editingDepartment ? 'Save Changes' : 'Create Department'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Delete Department
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {departmentToDelete?.name}
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

