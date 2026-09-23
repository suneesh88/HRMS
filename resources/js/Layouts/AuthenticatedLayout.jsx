import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';
import {
    Menu,
    Bell,
    Search,
    ChevronDown,
    User,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props?.auth?.user || {};
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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

    const userName = user?.name || 'User';
    const userEmail = user?.email || '';
    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Left Sidebar */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content Area */}
            <div
                className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${
                    collapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                {/* Top Navbar */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Search Input */}
                        <div className="relative hidden md:block">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees, leaves, reports..."
                                className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all sm:w-80"
                            />
                        </div>
                    </div>

                    {/* Right Action Icons & User Dropdown */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button
                            type="button"
                            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none transition"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                                            {initial}
                                        </div>
                                        <span className="hidden sm:inline-block max-w-[120px] truncate">
                                            {userName}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="border-b border-slate-100 px-4 py-2">
                                        <p className="text-xs font-medium text-slate-900">
                                            {userName}
                                        </p>
                                        {userEmail && (
                                            <p className="truncate text-[11px] text-slate-500">
                                                {userEmail}
                                            </p>
                                        )}
                                    </div>
                                    <Dropdown.Link
                                        href={safeRoute('profile.edit', '/profile')}
                                        className="flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4 text-slate-400" />
                                        <span>Profile Settings</span>
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={safeRoute('logout', '/logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log Out</span>
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page Title / Breadcrumb Header */}
                {header && (
                    <div className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
