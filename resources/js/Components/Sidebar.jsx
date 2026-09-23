import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    CalendarOff,
    Banknote,
    Briefcase,
    Settings,
    UserCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Shield,
    Layers,
    Clock,
    CalendarDays,
    Coins,
    Receipt,
} from 'lucide-react';

export default function Sidebar({
    collapsed = false,
    setCollapsed = () => {},
    mobileOpen = false,
    setMobileOpen = () => {},
}) {
    const page = usePage();
    const url = page.url || '';
    const user = page.props?.auth?.user || {};

    const safeRoute = (name, fallback = '#') => {
        try {
            if (typeof route === 'function') {
                return route(name);
            }
        } catch {
            // fallback
        }
        return fallback;
    };

    const isCurrentRoute = (name) => {
        try {
            if (typeof route === 'function') {
                return route().current(name);
            }
        } catch {
            // fallback
        }
        return false;
    };

    const navSections = [
        {
            title: 'Overview',
            items: [
                {
                    name: 'Dashboard',
                    href: safeRoute('dashboard', '/dashboard'),
                    icon: LayoutDashboard,
                    active: isCurrentRoute('dashboard') || url === '/dashboard',
                },
            ],
        },
        {
            title: 'Workforce',
            items: [
                {
                    name: 'Employees',
                    href: safeRoute('employees.index', '/employees'),
                    icon: Users,
                    badge: 'HR',
                    active: isCurrentRoute('employees.index') || url.startsWith('/employees'),
                },
            ],
        },
        {
            title: 'Time & Attendance',
            items: [
                {
                    name: 'Attendance',
                    href: '#',
                    icon: CalendarCheck,
                    active: url.startsWith('/attendance'),
                },
                {
                    name: 'Leaves & Time Off',
                    href: '#',
                    icon: CalendarOff,
                    active: url.startsWith('/leaves'),
                },
            ],
        },
        {
            title: 'Finance & Hiring',
            items: [
                {
                    name: 'Payroll',
                    href: '#',
                    icon: Banknote,
                    active: url.startsWith('/payroll'),
                },
                {
                    name: 'Recruitment',
                    href: '#',
                    icon: Briefcase,
                    active: url.startsWith('/recruitment'),
                },
            ],
        },
        {
            title: 'Settings & Masters',
            items: [
                {
                    name: 'Departments',
                    href: safeRoute('departments.index', '/settings/departments'),
                    icon: Building2,
                    active: isCurrentRoute('departments.index') || url.startsWith('/settings/departments'),
                },
                {
                    name: 'Designations',
                    href: safeRoute('designations.index', '/settings/designations'),
                    icon: Layers,
                    active: isCurrentRoute('designations.index') || url.startsWith('/settings/designations'),
                },
                {
                    name: 'Shifts',
                    href: safeRoute('shifts.index', '/settings/shifts'),
                    icon: Clock,
                    active: isCurrentRoute('shifts.index') || url.startsWith('/settings/shifts'),
                },
                {
                    name: 'Holidays',
                    href: safeRoute('holidays.index', '/settings/holidays'),
                    icon: CalendarDays,
                    active: isCurrentRoute('holidays.index') || url.startsWith('/settings/holidays'),
                },
                {
                    name: 'Allowances',
                    href: safeRoute('allowances.index', '/settings/allowances'),
                    icon: Coins,
                    active: isCurrentRoute('allowances.index') || url.startsWith('/settings/allowances'),
                },
                {
                    name: 'Deductions',
                    href: safeRoute('deductions.index', '/settings/deductions'),
                    icon: Receipt,
                    active: isCurrentRoute('deductions.index') || url.startsWith('/settings/deductions'),
                },
                {
                    name: 'Profile Settings',
                    href: safeRoute('profile.edit', '/profile'),
                    icon: UserCircle,
                    active: isCurrentRoute('profile.edit') || url === '/profile',
                },
            ],
        },
    ];

    const userName = user?.name || 'User';
    const userEmail = user?.email || 'user@example.com';
    const initial = userName.charAt(0).toUpperCase();

    const sidebarContent = (
        <div className="flex h-full flex-col bg-slate-900 text-slate-200">
            {/* Top Brand Header (Fixed) */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
                <Link
                    href={safeRoute('dashboard', '/dashboard')}
                    className="flex items-center gap-3 overflow-hidden"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30">
                        <Shield className="h-6 w-6" />
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-white">
                                HRMS Portal
                            </span>
                            <span className="text-xs text-slate-400">
                                Enterprise Suite
                            </span>
                        </div>
                    )}
                </Link>

                {/* Mobile Close Button */}
                {mobileOpen && (
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Navigation Links (Scrollable) */}
            <nav className="flex-1 min-h-0 space-y-6 overflow-y-auto px-3 py-4 sidebar-scroll">
                {navSections.map((section, idx) => (
                    <div key={idx}>
                        {(!collapsed || mobileOpen) && (
                            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                {section.title}
                            </p>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={collapsed && !mobileOpen ? item.name : undefined}
                                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            item.active
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                        } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 shrink-0 transition-colors ${
                                                item.active
                                                    ? 'text-white'
                                                    : 'text-slate-400 group-hover:text-white'
                                            }`}
                                        />
                                        {(!collapsed || mobileOpen) && (
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                        )}
                                        {(!collapsed || mobileOpen) && item.badge && (
                                            <span className="ms-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-slate-700">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom User Profile Section & Collapse Toggle (Fixed) */}
            <div className="shrink-0 border-t border-slate-800 p-3">
                <div
                    className={`flex items-center gap-3 rounded-lg bg-slate-800/50 p-2 ${
                        collapsed && !mobileOpen ? 'justify-center p-1.5' : ''
                    }`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-semibold text-white">
                        {initial}
                    </div>

                    {(!collapsed || mobileOpen) && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                                {userName}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                                {userEmail}
                            </p>
                        </div>
                    )}

                    {(!collapsed || mobileOpen) && (
                        <Link
                            href={safeRoute('logout', '/logout')}
                            method="post"
                            as="button"
                            title="Log Out"
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                {/* Desktop Collapse / Expand Toggle */}
                <div className="mt-2 hidden lg:block">
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4" />
                                <span>Collapse Menu</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Persistent Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 ease-in-out lg:block ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-full shadow-2xl transition-transform ease-in-out">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}

