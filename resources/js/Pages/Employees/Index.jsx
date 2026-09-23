import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    Eye,
    Briefcase,
    Building2,
    Clock,
    Phone,
    Mail,
    X,
    Coins,
    Receipt,
    Landmark,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const STATUS_CONFIG = {
    active: {
        label: 'Active',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
    },
    inactive: {
        label: 'Inactive',
        classes: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
    },
    on_leave: {
        label: 'On Leave',
        classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
    },
    terminated: {
        label: 'Terminated',
        classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
    },
};

const EMPLOYMENT_TYPES = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
];

export default function EmployeesIndex({
    employees,
    departments = [],
    designations = [],
    shifts = [],
    allowanceMasters = [],
    deductionMasters = [],
    nextEmployeeCode = 'EMP-001',
    filters = {},
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department_id || '',
    );
    const [designationFilter, setDesignationFilter] = useState(
        filters.designation_id || '',
    );
    const [shiftFilter, setShiftFilter] = useState(filters.shift_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState(
        filters.employment_type || '',
    );

    // Create / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const mapEmployeeAllowances = (allowances) => {
        if (!Array.isArray(allowances)) return [];
        return allowances.map((a) => ({
            allowance_id: a.allowance_id || (a.allowance ? a.allowance.id : ''),
            amount: a.amount !== undefined ? a.amount : '',
        }));
    };

    const mapEmployeeDeductions = (deductions) => {
        if (!Array.isArray(deductions)) return [];
        return deductions.map((d) => ({
            deduction_id: d.deduction_id || (d.deduction ? d.deduction.id : ''),
            amount: d.amount !== undefined ? d.amount : '',
        }));
    };

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
        employee_code: nextEmployeeCode || 'EMP-001',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        joining_date: new Date().toISOString().split('T')[0],
        department_id: '',
        designation_id: '',
        shift_id: '',
        employment_type: 'full_time',
        salary: '',
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        upi_id: '',
        pan_number: '',
        allowances: [],
        deductions: [],
        address: '',
        emergency_contact: '',
        status: 'active',
    });

    // Filtered designations based on selected department in Modal
    const modalDesignations = useMemo(() => {
        if (!data.department_id) return designations;
        return designations.filter(
            (d) => String(d.department_id) === String(data.department_id),
        );
    }, [designations, data.department_id]);

    // Allowances Handlers
    const addAllowance = (allowanceId = '', amount = '') => {
        const current = Array.isArray(data.allowances)
            ? [...data.allowances]
            : [];
        setData('allowances', [
            ...current,
            { allowance_id: allowanceId, amount },
        ]);
    };

    const handleAddPresetAllowance = (master) => {
        if (!master) return;
        const exists = (data.allowances || []).some(
            (a) => Number(a.allowance_id) === Number(master.id),
        );
        if (!exists) {
            addAllowance(master.id, '');
        }
    };

    const updateAllowance = (index, field, value) => {
        const current = Array.isArray(data.allowances)
            ? [...data.allowances]
            : [];
        current[index] = { ...current[index], [field]: value };
        setData('allowances', current);
    };

    const removeAllowance = (index) => {
        const current = Array.isArray(data.allowances)
            ? [...data.allowances]
            : [];
        setData(
            'allowances',
            current.filter((_, i) => i !== index),
        );
    };

    // Deductions Handlers
    const addDeduction = (deductionId = '', amount = '') => {
        const current = Array.isArray(data.deductions)
            ? [...data.deductions]
            : [];
        setData('deductions', [
            ...current,
            { deduction_id: deductionId, amount },
        ]);
    };

    const handleAddPresetDeduction = (master) => {
        if (!master) return;
        const exists = (data.deductions || []).some(
            (d) => Number(d.deduction_id) === Number(master.id),
        );
        if (!exists) {
            addDeduction(master.id, '');
        }
    };

    const updateDeduction = (index, field, value) => {
        const current = Array.isArray(data.deductions)
            ? [...data.deductions]
            : [];
        current[index] = { ...current[index], [field]: value };
        setData('deductions', current);
    };

    const removeDeduction = (index) => {
        const current = Array.isArray(data.deductions)
            ? [...data.deductions]
            : [];
        setData(
            'deductions',
            current.filter((_, i) => i !== index),
        );
    };

    const totalFormAllowances = (
        Array.isArray(data.allowances) ? data.allowances : []
    ).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const totalFormDeductions = (
        Array.isArray(data.deductions) ? data.deductions : []
    ).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const grossFormSalary =
        (parseFloat(data.salary) || 0) + totalFormAllowances;

    const netFormSalary = Math.max(0, grossFormSalary - totalFormDeductions);

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingEmployee(null);
        const defaultDept = departments[0]?.id || '';
        const matchingDesigs = designations.filter(
            (d) => String(d.department_id) === String(defaultDept),
        );
        setData({
            employee_code: nextEmployeeCode || 'EMP-001',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            gender: 'male',
            date_of_birth: '',
            joining_date: new Date().toISOString().split('T')[0],
            department_id: defaultDept,
            designation_id: matchingDesigs[0]?.id || '',
            shift_id: shifts[0]?.id || '',
            employment_type: 'full_time',
            salary: '',
            bank_name: '',
            account_holder_name: '',
            account_number: '',
            ifsc_code: '',
            branch_name: '',
            upi_id: '',
            pan_number: '',
            allowances: [],
            deductions: [],
            address: '',
            emergency_contact: '',
            status: 'active',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        clearErrors();
        setEditingEmployee(employee);
        setData({
            employee_code: employee.employee_code || '',
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            gender: employee.gender || 'male',
            date_of_birth: employee.date_of_birth
                ? employee.date_of_birth.substring(0, 10)
                : '',
            joining_date: employee.joining_date
                ? employee.joining_date.substring(0, 10)
                : '',
            department_id: employee.department_id || '',
            designation_id: employee.designation_id || '',
            shift_id: employee.shift_id || '',
            employment_type: employee.employment_type || 'full_time',
            salary: employee.salary ?? '',
            bank_name: employee.bank_name || '',
            account_holder_name: employee.account_holder_name || '',
            account_number: employee.account_number || '',
            ifsc_code: employee.ifsc_code || '',
            branch_name: employee.branch_name || '',
            upi_id: employee.upi_id || '',
            pan_number: employee.pan_number || '',
            allowances: mapEmployeeAllowances(employee.allowances),
            deductions: mapEmployeeDeductions(employee.deductions),
            address: employee.address || '',
            emergency_contact: employee.emergency_contact || '',
            status: employee.status || 'active',
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
        if (editingEmployee) {
            put(route('employees.update', editingEmployee.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('employees.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    const handleDelete = () => {
        if (employeeToDelete) {
            router.delete(route('employees.destroy', employeeToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const handleFilterChange = (params) => {
        router.get(
            route('employees.index'),
            {
                search,
                department_id: departmentFilter,
                designation_id: designationFilter,
                shift_id: shiftFilter,
                status: statusFilter,
                employment_type: employmentTypeFilter,
                ...params,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const clearAllFilters = () => {
        setSearch('');
        setDepartmentFilter('');
        setDesignationFilter('');
        setShiftFilter('');
        setStatusFilter('');
        setEmploymentTypeFilter('');
        router.get(route('employees.index'), {}, { preserveState: true });
    };

    const hasActiveFilters =
        Boolean(search) ||
        Boolean(departmentFilter) ||
        Boolean(designationFilter) ||
        Boolean(shiftFilter) ||
        Boolean(statusFilter) ||
        Boolean(employmentTypeFilter);

    const formatCurrency = (val) => {
        if (val === null || val === undefined || isNaN(val) || val === '') {
            return '—';
        }
        return `₹ ${Number(val).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <Users className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Employees Directory
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Manage employee directory, profiles, compensation, and deductions
                                </p>
                            </div>
                        </div>
                    </div>

                    <PrimaryButton
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Employee</span>
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Employees Directory" />

            <div className="space-y-6">
                {/* Flash message */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Filters & Search Bar */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex-1 lg:max-w-md"
                        >
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, code, phone, or email..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </form>

                        {/* Filter Selects */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Department Filter */}
                            <select
                                value={departmentFilter}
                                onChange={(e) => {
                                    setDepartmentFilter(e.target.value);
                                    handleFilterChange({
                                        department_id: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>

                            {/* Designation Filter */}
                            <select
                                value={designationFilter}
                                onChange={(e) => {
                                    setDesignationFilter(e.target.value);
                                    handleFilterChange({
                                        designation_id: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Designations</option>
                                {designations.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>

                            {/* Shift Filter */}
                            <select
                                value={shiftFilter}
                                onChange={(e) => {
                                    setShiftFilter(e.target.value);
                                    handleFilterChange({
                                        shift_id: e.target.value,
                                    });
                                }}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Shifts</option>
                                {shifts.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
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
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                                <option value="terminated">Terminated</option>
                            </select>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="flex h-10 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Employee</th>
                                    <th className="px-6 py-3.5">Contact</th>
                                    <th className="px-6 py-3.5">Role & Department</th>
                                    <th className="px-6 py-3.5">Shift</th>
                                    <th className="px-6 py-3.5">Net Monthly Pay</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {employees.data && employees.data.length > 0 ? (
                                    employees.data.map((employee) => {
                                        const statusCfg =
                                            STATUS_CONFIG[employee.status] ||
                                            STATUS_CONFIG.active;
                                        const initials = `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`.toUpperCase() || 'EM';
                                        
                                        const allowancesSum = (Array.isArray(employee.allowances) ? employee.allowances : []).reduce(
                                            (sum, item) => sum + (parseFloat(item.amount) || 0),
                                            0,
                                        );
                                        const deductionsSum = (Array.isArray(employee.deductions) ? employee.deductions : []).reduce(
                                            (sum, item) => sum + (parseFloat(item.amount) || 0),
                                            0,
                                        );
                                        const baseSal = parseFloat(employee.salary) || 0;
                                        const grossSal = baseSal + allowancesSum;
                                        const netSal = Math.max(0, grossSal - deductionsSum);

                                        return (
                                            <tr
                                                key={employee.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                {/* Employee Name & Code */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            href={route('employees.show', employee.id)}
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 hover:bg-indigo-100 transition"
                                                        >
                                                            {initials}
                                                        </Link>
                                                        <div>
                                                            <Link
                                                                href={route('employees.show', employee.id)}
                                                                className="font-bold text-slate-900 hover:text-indigo-600 transition block text-sm"
                                                            >
                                                                {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                                                            </Link>
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                {employee.employee_code}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <span>{employee.phone}</span>
                                                        </div>
                                                        {employee.email ? (
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                                                <Mail className="h-3 w-3 text-slate-400" />
                                                                <span className="truncate max-w-[150px]">{employee.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400 italic">
                                                                No email
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Department & Designation */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-slate-900">
                                                            {employee.designation?.name || 'Unassigned'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                            <Building2 className="h-3 w-3 text-slate-400" />
                                                            {employee.department?.name || 'No Dept'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Shift */}
                                                <td className="px-6 py-4">
                                                    {employee.shift ? (
                                                        <div className="space-y-0.5">
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                                                <Clock className="h-3 w-3 text-indigo-600" />
                                                                {employee.shift.name}
                                                            </span>
                                                            <p className="text-[10px] text-slate-400">
                                                                {employee.shift.start_time?.substring(0, 5)} - {employee.shift.end_time?.substring(0, 5)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>

                                                {/* Net Salary & Breakdown */}
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="font-bold text-emerald-700 block text-sm">
                                                            {netSal > 0 ? formatCurrency(netSal) : '—'}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                            <span>Gross: {formatCurrency(grossSal)}</span>
                                                            {deductionsSum > 0 && (
                                                                <span className="text-rose-600 font-medium">
                                                                    (-{formatCurrency(deductionsSum)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${statusCfg.classes}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                                        {statusCfg.label}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('employees.show', employee.id)}
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(employee)}
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                            title="Edit Employee"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(employee)}
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                            title="Delete Employee"
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
                                            No employees found. Click "Add Employee" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees.links && employees.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {employees.from || 0} to{' '}
                                {employees.to || 0} of {employees.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {employees.links.map((link, idx) => (
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

            {/* Create / Edit Employee Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto sidebar-scroll">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        {editingEmployee ? 'Edit Employee Profile' : 'Create New Employee'}
                    </h3>

                    <div className="mt-4 space-y-6">
                        {/* 1. Personal Information */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
                                1. Personal Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="first_name" value="First Name *" />
                                    <TextInput
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData('first_name', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. John"
                                        required
                                    />
                                    <InputError message={errors.first_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="last_name" value="Last Name *" />
                                    <TextInput
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. Doe"
                                        required
                                    />
                                    <InputError message={errors.last_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone Number *" />
                                    <TextInput
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. +1 234 567 8900"
                                        required
                                    />
                                    <InputError message={errors.phone} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email Address (Optional)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. john.doe@example.com"
                                    />
                                    <InputError message={errors.email} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gender" value="Gender" />
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) =>
                                            setData('gender', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={errors.gender} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) =>
                                            setData('date_of_birth', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                    />
                                    <InputError message={errors.date_of_birth} className="mt-1.5" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Job & Organizational Details */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-t border-slate-100 pt-4">
                                2. Job & Organizational Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <InputLabel htmlFor="employee_code" value="Employee Code / ID *" />
                                        {!editingEmployee && (
                                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/60">
                                                Auto-generated
                                            </span>
                                        )}
                                    </div>
                                    <TextInput
                                        id="employee_code"
                                        type="text"
                                        value={data.employee_code}
                                        onChange={(e) =>
                                            setData('employee_code', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs font-mono font-bold text-slate-900"
                                        placeholder="e.g. EMP-001"
                                        required
                                    />
                                    <InputError message={errors.employee_code} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="joining_date" value="Joining Date *" />
                                    <TextInput
                                        id="joining_date"
                                        type="date"
                                        value={data.joining_date}
                                        onChange={(e) =>
                                            setData('joining_date', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        required
                                    />
                                    <InputError message={errors.joining_date} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="department_id" value="Department *" />
                                    <select
                                        id="department_id"
                                        value={data.department_id}
                                        onChange={(e) => {
                                            const newDeptId = e.target.value;
                                            setData((prev) => {
                                                const matching = designations.filter(
                                                    (d) => String(d.department_id) === String(newDeptId),
                                                );
                                                return {
                                                    ...prev,
                                                    department_id: newDeptId,
                                                    designation_id: matching[0]?.id || '',
                                                };
                                            });
                                        }}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                        required
                                    >
                                        <option value="">Select Department *</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.department_id} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="designation_id" value="Designation *" />
                                    <select
                                        id="designation_id"
                                        value={data.designation_id}
                                        onChange={(e) =>
                                            setData('designation_id', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                        required
                                    >
                                        <option value="">Select Designation *</option>
                                        {modalDesignations.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.designation_id} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="shift_id" value="Assigned Shift" />
                                    <select
                                        id="shift_id"
                                        value={data.shift_id}
                                        onChange={(e) =>
                                            setData('shift_id', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                    >
                                        <option value="">Select Shift (Optional)</option>
                                        {shifts.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.shift_id} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="employment_type" value="Employment Type *" />
                                    <select
                                        id="employment_type"
                                        value={data.employment_type}
                                        onChange={(e) =>
                                            setData('employment_type', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                        required
                                    >
                                        {EMPLOYMENT_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.employment_type} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status *" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-1.5" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Allowances (Earnings) Section */}
                        <div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-3">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                                        <Coins className="h-4 w-4" />
                                        <span>3. Allowances (Earnings)</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Configure base monthly salary and recurring employee allowances
                                    </p>
                                </div>
                                <SecondaryButton
                                    type="button"
                                    onClick={() => addAllowance()}
                                    className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add Allowance</span>
                                </SecondaryButton>
                            </div>

                            {/* Base Salary */}
                            <div className="mb-4">
                                <InputLabel htmlFor="salary" value="Monthly Base Salary (₹)" />
                                <TextInput
                                    id="salary"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.salary}
                                    onChange={(e) =>
                                        setData('salary', e.target.value)
                                    }
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. 50000.00"
                                />
                                <InputError message={errors.salary} className="mt-1.5" />
                            </div>

                            {/* Quick Presets from Allowance Master */}
                            {allowanceMasters.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Quick Add From Master:
                                    </span>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {allowanceMasters.map((m) => {
                                            const isAlreadyAdded = (data.allowances || []).some(
                                                (a) => Number(a.allowance_id) === Number(m.id),
                                            );
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    disabled={isAlreadyAdded}
                                                    onClick={() =>
                                                        handleAddPresetAllowance(m)
                                                    }
                                                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition flex items-center gap-1 ${
                                                        isAlreadyAdded
                                                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                                                    }`}
                                                >
                                                    <span>{isAlreadyAdded ? '✓' : '+'} {m.name}</span>
                                                    {m.code && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            ({m.code})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Validation Errors for Allowances */}
                            {Object.keys(errors)
                                .filter((k) => k.startsWith('allowances'))
                                .map((k) => (
                                    <InputError key={k} message={errors[k]} className="mb-2" />
                                ))}

                            {/* Dynamic Allowances Rows */}
                            <div className="space-y-2.5">
                                {Array.isArray(data.allowances) &&
                                data.allowances.length > 0 ? (
                                    data.allowances.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
                                        >
                                            <div className="flex-1">
                                                <select
                                                    value={item.allowance_id || ''}
                                                    onChange={(e) =>
                                                        updateAllowance(
                                                            idx,
                                                            'allowance_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-md border-slate-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-900"
                                                    required
                                                >
                                                    <option value="">Select Master Allowance *</option>
                                                    {allowanceMasters.map((m) => {
                                                        const isAlreadySelected = (data.allowances || []).some(
                                                            (a, i) => i !== idx && Number(a.allowance_id) === Number(m.id),
                                                        );
                                                        return (
                                                            <option
                                                                key={m.id}
                                                                value={m.id}
                                                                disabled={isAlreadySelected}
                                                            >
                                                                {m.name} {m.code ? `(${m.code})` : ''}{' '}
                                                                {m.is_taxable ? '• Taxable' : '• Tax Exempt'}{' '}
                                                                {isAlreadySelected ? '(Already Added)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div className="w-36">
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                        ₹
                                                    </span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.amount || ''}
                                                        onChange={(e) =>
                                                            updateAllowance(
                                                                idx,
                                                                'amount',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="h-8 w-full rounded-md border-slate-300 pl-6 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAllowance(idx)}
                                                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                title="Remove Allowance"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed border-slate-200 p-3.5 text-center text-xs text-slate-400">
                                        No allowances configured.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Deductions (Withholdings) Section */}
                        <div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-3">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                                        <Receipt className="h-4 w-4" />
                                        <span>4. Deductions (Withholdings)</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Configure statutory and voluntary employee payroll deductions
                                    </p>
                                </div>
                                <SecondaryButton
                                    type="button"
                                    onClick={() => addDeduction()}
                                    className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add Deduction</span>
                                </SecondaryButton>
                            </div>

                            {/* Quick Presets from Deduction Master */}
                            {deductionMasters.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Quick Add From Master:
                                    </span>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {deductionMasters.map((m) => {
                                            const isAlreadyAdded = (data.deductions || []).some(
                                                (d) => Number(d.deduction_id) === Number(m.id),
                                            );
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    disabled={isAlreadyAdded}
                                                    onClick={() =>
                                                        handleAddPresetDeduction(m)
                                                    }
                                                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition flex items-center gap-1 ${
                                                        isAlreadyAdded
                                                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                                                    }`}
                                                >
                                                    <span>{isAlreadyAdded ? '✓' : '+'} {m.name}</span>
                                                    {m.code && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            ({m.code})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Validation Errors for Deductions */}
                            {Object.keys(errors)
                                .filter((k) => k.startsWith('deductions'))
                                .map((k) => (
                                    <InputError key={k} message={errors[k]} className="mb-2" />
                                ))}

                            {/* Dynamic Deductions Rows */}
                            <div className="space-y-2.5">
                                {Array.isArray(data.deductions) &&
                                data.deductions.length > 0 ? (
                                    data.deductions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
                                        >
                                            <div className="flex-1">
                                                <select
                                                    value={item.deduction_id || ''}
                                                    onChange={(e) =>
                                                        updateDeduction(
                                                            idx,
                                                            'deduction_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-md border-slate-300 text-xs shadow-sm focus:border-rose-500 focus:ring-rose-500 text-slate-900"
                                                    required
                                                >
                                                    <option value="">Select Master Deduction *</option>
                                                    {deductionMasters.map((m) => {
                                                        const isAlreadySelected = (data.deductions || []).some(
                                                            (d, i) => i !== idx && Number(d.deduction_id) === Number(m.id),
                                                        );
                                                        return (
                                                            <option
                                                                key={m.id}
                                                                value={m.id}
                                                                disabled={isAlreadySelected}
                                                            >
                                                                {m.name} {m.code ? `(${m.code})` : ''}{' '}
                                                                {m.is_statutory ? '• Statutory' : '• Voluntary'}{' '}
                                                                {isAlreadySelected ? '(Already Added)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div className="w-36">
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                        ₹
                                                    </span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.amount || ''}
                                                        onChange={(e) =>
                                                            updateDeduction(
                                                                idx,
                                                                'amount',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="h-8 w-full rounded-md border-slate-300 pl-6 text-xs shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDeduction(idx)}
                                                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                title="Remove Deduction"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed border-slate-200 p-3.5 text-center text-xs text-slate-400">
                                        No deductions configured.
                                    </div>
                                )}
                            </div>

                            {/* Live Net Salary Summary Banner */}
                            <div className="mt-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white shadow-md">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                            Gross Earnings
                                        </span>
                                        <span className="text-sm font-bold text-white">
                                            {formatCurrency(grossFormSalary)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">
                                            Base ({formatCurrency(data.salary || 0)}) + Allow ({formatCurrency(totalFormAllowances)})
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-rose-400 block text-[10px] uppercase font-bold">
                                            Total Deductions
                                        </span>
                                        <span className="text-sm font-bold text-rose-300">
                                            - {formatCurrency(totalFormDeductions)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">
                                            {data.deductions?.length || 0} deduction items
                                        </span>
                                    </div>

                                    <div className="sm:text-right">
                                        <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                                            Net Monthly Take-Home
                                        </span>
                                        <span className="text-base font-extrabold text-emerald-400">
                                            = {formatCurrency(netFormSalary)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Banking & Payment Details */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-t border-slate-100 pt-4 flex items-center gap-1.5">
                                <Landmark className="h-4 w-4" />
                                <span>5. Banking & Direct Deposit Details</span>
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="bank_name" value="Bank Name" />
                                    <TextInput
                                        id="bank_name"
                                        type="text"
                                        value={data.bank_name}
                                        onChange={(e) =>
                                            setData('bank_name', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. HDFC Bank, State Bank of India"
                                    />
                                    <InputError message={errors.bank_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="account_holder_name" value="Account Holder Name" />
                                    <TextInput
                                        id="account_holder_name"
                                        type="text"
                                        value={data.account_holder_name}
                                        onChange={(e) =>
                                            setData('account_holder_name', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. John Doe"
                                    />
                                    <InputError message={errors.account_holder_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="account_number" value="Bank Account Number" />
                                    <TextInput
                                        id="account_number"
                                        type="text"
                                        value={data.account_number}
                                        onChange={(e) =>
                                            setData('account_number', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs font-mono"
                                        placeholder="e.g. 50100234567890"
                                    />
                                    <InputError message={errors.account_number} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ifsc_code" value="IFSC / Routing Code" />
                                    <TextInput
                                        id="ifsc_code"
                                        type="text"
                                        value={data.ifsc_code}
                                        onChange={(e) =>
                                            setData('ifsc_code', e.target.value.toUpperCase())
                                        }
                                        className="mt-1 block w-full text-xs font-mono uppercase"
                                        placeholder="e.g. HDFC0001234"
                                    />
                                    <InputError message={errors.ifsc_code} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="branch_name" value="Branch Name" />
                                    <TextInput
                                        id="branch_name"
                                        type="text"
                                        value={data.branch_name}
                                        onChange={(e) =>
                                            setData('branch_name', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. MG Road Branch"
                                    />
                                    <InputError message={errors.branch_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="upi_id" value="UPI ID (Optional)" />
                                    <TextInput
                                        id="upi_id"
                                        type="text"
                                        value={data.upi_id}
                                        onChange={(e) =>
                                            setData('upi_id', e.target.value.toLowerCase())
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. john@okhdfcbank"
                                    />
                                    <InputError message={errors.upi_id} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pan_number" value="PAN Card Number (Tax ID)" />
                                    <TextInput
                                        id="pan_number"
                                        type="text"
                                        value={data.pan_number}
                                        onChange={(e) =>
                                            setData('pan_number', e.target.value.toUpperCase())
                                        }
                                        className="mt-1 block w-full text-xs font-mono uppercase"
                                        placeholder="e.g. ABCDE1234F"
                                    />
                                    <InputError message={errors.pan_number} className="mt-1.5" />
                                </div>
                            </div>
                        </div>

                        {/* 6. Additional Details */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-t border-slate-100 pt-4">
                                6. Additional Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="emergency_contact" value="Emergency Contact" />
                                    <TextInput
                                        id="emergency_contact"
                                        type="text"
                                        value={data.emergency_contact}
                                        onChange={(e) =>
                                            setData('emergency_contact', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. Jane Doe (+1 987 654 3210)"
                                    />
                                    <InputError message={errors.emergency_contact} className="mt-1.5" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address" value="Residential Address" />
                                    <textarea
                                        id="address"
                                        rows="2"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-slate-900"
                                        placeholder="Street, City, Postal Code..."
                                    />
                                    <InputError message={errors.address} className="mt-1.5" />
                                </div>
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
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {editingEmployee ? 'Save Changes' : 'Create Employee'}
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
                                Delete Employee
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete{' '}
                                <strong className="text-slate-800">
                                    {employeeToDelete?.full_name || employeeToDelete?.first_name}
                                </strong>{' '}
                                ({employeeToDelete?.employee_code})? This action cannot be undone.
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
