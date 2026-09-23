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
    Briefcase,
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

export default function DesignationsIndex({
    designations,
    departments,
    filters,
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department_id || '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Create / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [designationToDelete, setDesignationToDelete] = useState(null);

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
        department_id: '',
        name: '',
        code: '',
        description: '',
        status: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingDesignation(null);
        setData({
            department_id: departments[0]?.id || '',
            name: '',
            code: '',
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (designation) => {
        clearErrors();
        setEditingDesignation(designation);
        setData({
            department_id: designation.department_id || '',
            name: designation.name,
            code: designation.code || '',
            description: designation.description || '',
            status: Boolean(designation.status),
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
        if (editingDesignation) {
            put(route('designations.update', editingDesignation.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('designations.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (designation) => {
        setDesignationToDelete(designation);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDesignationToDelete(null);
    };

    const handleDelete = () => {
        if (designationToDelete) {
            router.delete(
                route('designations.destroy', designationToDelete.id),
                {
                    onSuccess: () => closeDeleteModal(),
                },
            );
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('designations.index'),
            {
                search,
                department_id: departmentFilter,
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleDepartmentFilterChange = (deptId) => {
        setDepartmentFilter(deptId);
        router.get(
            route('designations.index'),
            {
                search,
                department_id: deptId,
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        router.get(
            route('designations.index'),
            {
                search,
                department_id: departmentFilter,
                status,
            },
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
                                <Briefcase className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Designation Masters
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Manage job roles and hierarchy designations across departments
                                </p>
                            </div>
                        </div>
                    </div>
                    <PrimaryButton
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Designation</span>
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Designation Masters" />

            <div className="space-y-6">
                {/* Flash Message Banner */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Filters and Search Bar */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex-1 sm:max-w-md"
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by designation title or code..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Department Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                                Department:
                            </span>
                            <select
                                value={departmentFilter}
                                onChange={(e) =>
                                    handleDepartmentFilterChange(e.target.value)
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
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
                </div>

                {/* Designations Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">
                                        Designation Title
                                    </th>
                                    <th className="px-6 py-3.5">Code</th>
                                    <th className="px-6 py-3.5">Department</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {designations.data &&
                                designations.data.length > 0 ? (
                                    designations.data.map((desig) => (
                                        <tr
                                            key={desig.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {desig.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {desig.code ? (
                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 border border-slate-200">
                                                        {desig.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {desig.department ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">
                                                        <Building2 className="h-3 w-3" />
                                                        {desig.department.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                                                {desig.description || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {desig.status ? (
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
                                                            openEditModal(desig)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                        title="Edit Designation"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(desig)
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                        title="Delete Designation"
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
                                            No designations found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {designations.links && designations.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {designations.from || 0} to{' '}
                                {designations.to || 0} of{' '}
                                {designations.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {designations.links.map((link, idx) => (
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
                        {editingDesignation
                            ? 'Edit Designation'
                            : 'Create New Designation'}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {/* Designation Title */}
                        <div>
                            <InputLabel
                                htmlFor="name"
                                value="Designation Title *"
                            />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Senior Software Engineer, HR Specialist"
                                required
                            />
                            <InputError
                                message={errors.name}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Department Dropdown */}
                        <div>
                            <InputLabel
                                htmlFor="department_id"
                                value="Department *"
                            />
                            <select
                                id="department_id"
                                value={data.department_id}
                                onChange={(e) =>
                                    setData('department_id', e.target.value)
                                }
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                            >
                                <option value="">Select Department *</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={errors.department_id}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <InputLabel
                                htmlFor="code"
                                value="Designation Code (Optional)"
                            />
                            <TextInput
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                className="mt-1 block w-full text-xs font-mono"
                                placeholder="e.g. SSE, HRS, TL"
                            />
                            <InputError
                                message={errors.code}
                                className="mt-1.5"
                            />
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
                                placeholder="Role responsibilities and description..."
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
                                Active Designation
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
                            {editingDesignation
                                ? 'Save Changes'
                                : 'Create Designation'}
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
                                Delete Designation
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {designationToDelete?.name}
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

