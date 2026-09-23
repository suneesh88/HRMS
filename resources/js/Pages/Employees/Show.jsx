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
    ArrowLeft,
    Building2,
    Briefcase,
    CheckCircle2,
    Clock,
    Coffee,
    Edit2,
    HeartHandshake,
    Hourglass,
    Mail,
    MapPin,
    Moon,
    Phone,
    Plus,
    Scale,
    Sun,
    Trash2,
    User,
    Coins,
    Receipt,
    Wallet,
    Landmark,
    CreditCard,
    FileText,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const STATUS_CONFIG = {
    active: {
        label: 'Active Employee',
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

export default function EmployeeShow({
    employee,
    departments = [],
    designations = [],
    shifts = [],
    allowanceMasters = [],
    deductionMasters = [],
}) {
    const { flash } = usePage().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
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

    const openEditModal = () => {
        clearErrors();
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
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        clearErrors();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('employees.update', employee.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    const handleDelete = () => {
        router.delete(route('employees.destroy', employee.id), {
            onSuccess: () => {
                router.visit(route('employees.index'));
            },
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12;
        return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const calculateDuration = (start, end, breakMinutes = 0) => {
        if (!start || !end) return '—';
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let startMinutes = h1 * 60 + m1;
        let endMinutes = h2 * 60 + m2;
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }
        const totalMinutes = endMinutes - startMinutes;
        const netMinutes = Math.max(0, totalMinutes - (Number(breakMinutes) || 0));
        const hours = Math.floor(netMinutes / 60);
        const mins = netMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
    };

    const calculateTenure = (joiningDateStr) => {
        if (!joiningDateStr) return '—';
        const join = new Date(joiningDateStr);
        const now = new Date();
        const diffMonths =
            (now.getFullYear() - join.getFullYear()) * 12 +
            (now.getMonth() - join.getMonth());
        if (diffMonths < 1) return 'Just joined';
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
        const years = Math.floor(diffMonths / 12);
        const remainingMonths = diffMonths % 12;
        return remainingMonths > 0
            ? `${years} yr ${remainingMonths} mo`
            : `${years} year${years > 1 ? 's' : ''}`;
    };

    const calculateAge = (dobStr) => {
        if (!dobStr) return null;
        const dob = new Date(dobStr);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatCurrency = (val) => {
        if (val === null || val === undefined || isNaN(val) || val === '') {
            return '—';
        }
        return `₹ ${Number(val).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const initials = `${employee.first_name?.charAt(0) || ''}${
        employee.last_name?.charAt(0) || ''
    }`.toUpperCase() || 'EM';

    const statusCfg = STATUS_CONFIG[employee.status] || STATUS_CONFIG.active;
    const shift = employee.shift;
    const isNightShift =
        shift?.start_time && shift?.end_time && shift.end_time < shift.start_time;

    const allowancesList = Array.isArray(employee.allowances)
        ? employee.allowances
        : [];
    const deductionsList = Array.isArray(employee.deductions)
        ? employee.deductions
        : [];

    const totalAllowances = allowancesList.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
    );
    const totalDeductions = deductionsList.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
    );
    const baseSalary = parseFloat(employee.salary) || 0;
    const grossSalary = baseSalary + totalAllowances;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const hasBankDetails = Boolean(
        employee.bank_name ||
            employee.account_number ||
            employee.ifsc_code ||
            employee.upi_id ||
            employee.pan_number,
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('employees.index')}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
                            title="Back to Directory"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                                </h2>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 border border-slate-200">
                                    {employee.employee_code}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Employee Profile, Compensation, Bank Account & Workplace Schedule
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SecondaryButton
                            onClick={openEditModal}
                            className="flex items-center gap-1.5 text-xs"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Profile</span>
                        </SecondaryButton>
                        <DangerButton
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </DangerButton>
                    </div>
                </div>
            }
        >
            <Head title={`${employee.full_name || 'Employee'} - Profile`} />

            <div className="space-y-6">
                {/* Flash message */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Hero Profile Summary Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
                                {initials}
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-extrabold text-slate-900">
                                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusCfg.classes}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                        {statusCfg.label}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                        {employee.designation?.name || 'No Designation'}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-slate-600">
                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                        {employee.department?.name || 'No Department'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2.5 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0 sm:justify-end">
                            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-center min-w-[90px]">
                                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                    Gross Salary
                                </span>
                                <span className="block text-xs font-bold text-slate-800 mt-0.5">
                                    {grossSalary > 0 ? formatCurrency(grossSalary) : '—'}
                                </span>
                            </div>
                            <div className="rounded-xl bg-rose-50/60 p-2.5 border border-rose-100 text-center min-w-[90px]">
                                <span className="block text-[10px] font-medium text-rose-500 uppercase tracking-wider">
                                    Deductions
                                </span>
                                <span className="block text-xs font-bold text-rose-700 mt-0.5">
                                    {totalDeductions > 0 ? `- ${formatCurrency(totalDeductions)}` : '₹ 0.00'}
                                </span>
                            </div>
                            <div className="rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-200/80 text-center min-w-[100px]">
                                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                    Net Pay (Take-Home)
                                </span>
                                <span className="block text-sm font-extrabold text-emerald-700 mt-0.5">
                                    {netSalary > 0 ? formatCurrency(netSalary) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Column 1 & 2: Compensation, Shift & Bank Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Compensation & Take-Home Overview Card */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <Wallet className="h-4 w-4 text-emerald-600" />
                                    <span>Salary, Allowances & Deductions Breakdown</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={openEditModal}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Edit Compensation</span>
                                </button>
                            </div>

                            {/* Summary Metrics Bar */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Base Salary
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-slate-900">
                                        {formatCurrency(baseSalary)}
                                    </span>
                                </div>

                                <div className="rounded-xl bg-indigo-50/60 p-3 border border-indigo-100/80">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                        + Allowances
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-indigo-700">
                                        + {formatCurrency(totalAllowances)}
                                    </span>
                                </div>

                                <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-100/80">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                        - Deductions
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-rose-700">
                                        - {formatCurrency(totalDeductions)}
                                    </span>
                                </div>

                                <div className="rounded-xl bg-emerald-50/90 p-3 border border-emerald-200">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                        = Net Monthly Pay
                                    </span>
                                    <span className="mt-1 block text-sm font-extrabold text-emerald-700">
                                        {formatCurrency(netSalary)}
                                    </span>
                                </div>
                            </div>

                            {/* Allowances & Deductions Side-by-Side Tables */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Allowances (Earnings) Table */}
                                <div className="rounded-lg border border-slate-200/80 overflow-hidden">
                                    <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                                            <Coins className="h-3.5 w-3.5" />
                                            <span>Allowances (Earnings)</span>
                                        </div>
                                        <span className="text-xs font-bold text-indigo-700">
                                            + {formatCurrency(totalAllowances)}
                                        </span>
                                    </div>

                                    {allowancesList.length > 0 ? (
                                        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                                            {allowancesList.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50"
                                                >
                                                    <div>
                                                        <span className="font-medium text-slate-900 block">
                                                            {item.allowance?.name || 'Allowance'}
                                                        </span>
                                                        {item.allowance?.code && (
                                                            <span className="font-mono text-[10px] text-slate-400">
                                                                {item.allowance.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right font-bold text-slate-800">
                                                        {formatCurrency(item.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            No allowances assigned
                                        </div>
                                    )}
                                </div>

                                {/* Deductions (Withholdings) Table */}
                                <div className="rounded-lg border border-slate-200/80 overflow-hidden">
                                    <div className="bg-rose-50/60 px-3.5 py-2.5 border-b border-rose-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                                            <Receipt className="h-3.5 w-3.5" />
                                            <span>Deductions (Withholdings)</span>
                                        </div>
                                        <span className="text-xs font-bold text-rose-700">
                                            - {formatCurrency(totalDeductions)}
                                        </span>
                                    </div>

                                    {deductionsList.length > 0 ? (
                                        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                                            {deductionsList.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50"
                                                >
                                                    <div>
                                                        <span className="font-medium text-slate-900 block">
                                                            {item.deduction?.name || 'Deduction'}
                                                        </span>
                                                        {item.deduction?.code && (
                                                            <span className="font-mono text-[10px] text-slate-400">
                                                                {item.deduction.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right font-bold text-rose-700">
                                                        - {formatCurrency(item.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            No deductions assigned
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Banking & Direct Deposit Details Card */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <Landmark className="h-4 w-4 text-indigo-600" />
                                    <span>Bank Account & Direct Deposit Information</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={openEditModal}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Edit Bank Details</span>
                                </button>
                            </div>

                            {hasBankDetails ? (
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {/* Bank Name */}
                                    <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                                        <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Bank Name
                                        </span>
                                        <span className="mt-1 block text-xs font-bold text-slate-900">
                                            {employee.bank_name || 'Not Provided'}
                                        </span>
                                        {employee.branch_name && (
                                            <span className="text-[11px] text-slate-500 block mt-0.5">
                                                Branch: {employee.branch_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Account Number */}
                                    <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                                        <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Account Number
                                        </span>
                                        <span className="mt-1 block font-mono text-xs font-extrabold text-indigo-700 tracking-wider">
                                            {employee.account_number || '—'}
                                        </span>
                                        {employee.account_holder_name && (
                                            <span className="text-[11px] text-slate-500 block mt-0.5">
                                                Holder: {employee.account_holder_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* IFSC Code */}
                                    <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                                        <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            IFSC / Routing Code
                                        </span>
                                        <span className="mt-1 block font-mono text-xs font-bold text-slate-900 uppercase">
                                            {employee.ifsc_code || '—'}
                                        </span>
                                    </div>

                                    {/* UPI ID */}
                                    {employee.upi_id && (
                                        <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                                            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                UPI Payment ID
                                            </span>
                                            <span className="mt-1 block font-mono text-xs font-semibold text-slate-800">
                                                {employee.upi_id}
                                            </span>
                                        </div>
                                    )}

                                    {/* PAN Number */}
                                    {employee.pan_number && (
                                        <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                                            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                PAN Card (Tax ID)
                                            </span>
                                            <span className="mt-1 block font-mono text-xs font-bold text-slate-900 uppercase">
                                                {employee.pan_number}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500 border border-slate-100">
                                    No bank account details saved for this employee. Click "Edit Bank Details" to add banking and direct deposit information.
                                </div>
                            )}
                        </div>

                        {/* Assigned Shift & Work Schedule Card */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span>Assigned Shift & Weekly Schedule</span>
                            </h3>

                            {shift ? (
                                <div className="mt-4 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            {isNightShift ? (
                                                <Moon className="h-5 w-5 text-indigo-500" />
                                            ) : (
                                                <Sun className="h-5 w-5 text-amber-500" />
                                            )}
                                            <div>
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {shift.name}
                                                </span>
                                                {shift.code && (
                                                    <span className="ms-2 rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                                                        {shift.code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-indigo-100/70 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                                {calculateDuration(
                                                    shift.start_time,
                                                    shift.end_time,
                                                    shift.break_duration_minutes,
                                                )}{' '}
                                                Net Work
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                Shift Timings
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-900">
                                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                Break Duration
                                            </span>
                                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                                                <Coffee className="h-3.5 w-3.5 text-amber-600" />
                                                {shift.break_duration_minutes} Minutes
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                Grace Period
                                            </span>
                                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                                                <Hourglass className="h-3.5 w-3.5 text-slate-400" />
                                                {shift.grace_period_minutes} Minutes
                                            </span>
                                        </div>
                                    </div>

                                    {/* Weekend / Off Days */}
                                    <div className="border-t border-slate-100 pt-3">
                                        <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Weekend / Weekly Off Days
                                        </span>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {Array.isArray(shift.weekend_days) && shift.weekend_days.length > 0 ? (
                                                shift.weekend_days.map((day) => (
                                                    <span
                                                        key={day}
                                                        className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60"
                                                    >
                                                        {day}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    No specific weekend days configured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500 border border-slate-100">
                                    No shift assigned to this employee.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Contact & Personal Details */}
                    <div className="space-y-6">
                        {/* Organizational & Employment Info */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                <Briefcase className="h-4 w-4 text-indigo-600" />
                                <span>Job Information</span>
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Employee Code / ID
                                    </span>
                                    <span className="mt-0.5 block font-mono text-xs font-bold text-slate-900">
                                        {employee.employee_code}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Joining Date
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold text-slate-900">
                                        {employee.joining_date || '—'}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Department
                                    </span>
                                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                        {employee.department?.name || 'Unassigned'}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Designation
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold text-slate-900">
                                        {employee.designation?.name || 'Unassigned'}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Employment Type
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold capitalize text-slate-900">
                                        {employee.employment_type?.replace('_', ' ') || 'Full Time'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                <Phone className="h-4 w-4 text-indigo-600" />
                                <span>Contact Details</span>
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Phone Number *
                                    </span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <a
                                            href={`tel:${employee.phone}`}
                                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{employee.phone}</span>
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Email Address
                                    </span>
                                    <div className="mt-1">
                                        {employee.email ? (
                                            <a
                                                href={`mailto:${employee.email}`}
                                                className="flex items-center gap-1.5 text-xs font-medium text-slate-800 hover:text-indigo-600 hover:underline"
                                            >
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{employee.email}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">
                                                No email provided
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Residential Address
                                    </span>
                                    <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-700">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{employee.address || 'No address provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                <User className="h-4 w-4 text-indigo-600" />
                                <span>Personal Details</span>
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Gender
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold capitalize text-slate-900">
                                        {employee.gender || 'Not Specified'}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Date of Birth
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold text-slate-900">
                                        {employee.date_of_birth
                                            ? `${employee.date_of_birth} ${
                                                  calculateAge(employee.date_of_birth)
                                                      ? `(${calculateAge(employee.date_of_birth)} yrs)`
                                                      : ''
                                              }`
                                            : 'Not Specified'}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                        Emergency Contact
                                    </span>
                                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                                        {employee.emergency_contact || 'None'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal with Allowances, Deductions & Bank Details */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={handleUpdate} className="p-6 max-h-[85vh] overflow-y-auto sidebar-scroll">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        Edit Employee Profile, Allowances, Deductions & Bank Details
                    </h3>

                    <div className="mt-4 space-y-6">
                        {/* Section 1: Personal Information */}
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

                        {/* Section 2: Job & Organizational Details */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-t border-slate-100 pt-4">
                                2. Job & Organizational Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="employee_code" value="Employee Code / ID *" />
                                    <TextInput
                                        id="employee_code"
                                        type="text"
                                        value={data.employee_code}
                                        onChange={(e) =>
                                            setData('employee_code', e.target.value)
                                        }
                                        className="mt-1 block w-full text-xs font-mono"
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
                                            <option key={t.value} value={t.label}>
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

                        {/* Section 3: Base Salary & Allowances Section */}
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

                            {/* Base Salary Input */}
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
                                    placeholder="e.g. 45000.00"
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
                                                    onClick={() => handleAddPresetAllowance(m)}
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

                            {/* Dynamic Allowances List with Master ID Dropdowns */}
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

                        {/* Section 4: Deductions (Withholdings) Section */}
                        <div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-3">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                                        <Receipt className="h-4 w-4" />
                                        <span>4. Deductions (Withholdings)</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Assign statutory and voluntary payroll deductions
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
                                                    onClick={() => handleAddPresetDeduction(m)}
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

                            {/* Dynamic Deductions List with Master ID Dropdowns */}
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

                        {/* Section 5: Banking & Direct Deposit Details */}
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

                        {/* Section 6: Address & Emergency */}
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
                                    />
                                    <InputError message={errors.address} className="mt-1.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <SecondaryButton
                            type="button"
                            onClick={closeEditModal}
                            disabled={processing}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
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
                                    {employee.full_name || employee.first_name}
                                </strong>{' '}
                                ({employee.employee_code})? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>
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
