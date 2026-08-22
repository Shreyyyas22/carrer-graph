"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Building2,
  Route,
  Network,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/profile", label: "Profile", icon: User, enabled: true },
  { href: "/jobs", label: "Jobs", icon: Briefcase, enabled: true },
  { href: "/companies", label: "Companies", icon: Building2, enabled: true },
  { href: "/career-path", label: "Career Path", icon: Route, enabled: true },
  { href: "/graph", label: "Graph", icon: Network, enabled: true },
];

function DesktopNav({ pathname }) {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {navItems.map(({ href, label, icon: Icon, enabled }) => {
        const isActive = pathname === href;
        if (!enabled) {
          return (
            <span
              key={href}
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400"
              title="Coming soon"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </span>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
            CG
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">CareerGraph</span>
        </Link>

        <DesktopNav pathname={pathname} />

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6" aria-label="Mobile primary">
            {navItems.map(({ href, label, icon: Icon, enabled }) => {
              const isActive = pathname === href;
              if (!enabled) {
                return (
                  <span key={href} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                  </span>
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
