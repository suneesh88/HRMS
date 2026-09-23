import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Users,
    UserCheck,
    CalendarOff,
    Briefcase,
    TrendingUp,
    Clock,
} from 'lucide-react';

export default function Dashboard() {
    const stats = [
        {
            name: 'Total Employees',
            value: '148',
            change: '+4 this month',
            icon: Users,
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            name: 'Present Today',
            value: '136',
            change: '92% attendance',
            icon: UserCheck,
            color: 'bg-emerald-500/10 text-emerald-600',
        },
        {
            name: 'On Leave',
            value: '12',
            change: '3 pending requests',
            icon: CalendarOff,
            color: 'bg-amber-500/10 text-amber-600',
        },
        {
            name: 'Open Positions',
            value: '6',
            change: '2 closing soon',
            icon: Briefcase,
            color: 'bg-purple-500/10 text-purple-600',
        },
    ];

    const recentActivities = [
        {
            user: 'Sarah Jenkins',
            action: 'applied for Annual Leave',
            time: '25 mins ago',
            status: 'Pending',
        },
        {
            user: 'Alex Rivera',
            action: 'clocked in for Shift A',
            time: '1 hour ago',
            status: 'Completed',
        },
        {
            user: 'Elena Rostova',
            action: 'submitted monthly reimbursement report',
            time: '2 hours ago',
            status: 'Under Review',
        },
        {
            user: 'Marcus Vance',
            action: 'completed onboarding checklist',
            time: '4 hours ago',
            status: 'Approved',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            HR Dashboard
                        </h2>
                        <p className="text-xs text-slate-500">
                            Welcome back! Here's an overview of today's workplace activity.
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 sm:mt-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            System Active
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="HRMS Dashboard" />

            <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.name}
                                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">
                                        {stat.name}
                                    </span>
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                                        {stat.value}
                                    </span>
                                </div>
                                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                    {stat.change}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Dashboard Main Grid: Recent Activity & Quick Shortcuts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Activity List */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Recent HR Activity
                            </h3>
                            <span className="text-xs text-slate-400">
                                Real-time feed
                            </span>
                        </div>
                        <div className="mt-4 divide-y divide-slate-100">
                            {recentActivities.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between py-3 text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-700">
                                            {activity.user.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {activity.user}{' '}
                                                <span className="font-normal text-slate-500">
                                                    {activity.action}
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-1 text-[11px] text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                                        {activity.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Overview Panel */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
                            HR Quick Actions
                        </h3>
                        <div className="mt-4 space-y-2.5">
                            <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                                <span>+ Add New Employee</span>
                                <span>→</span>
                            </button>
                            <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                                <span>Record Attendance</span>
                                <span>→</span>
                            </button>
                            <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                                <span>Approve Leave Requests</span>
                                <span>→</span>
                            </button>
                            <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                                <span>Run Payroll Preview</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
