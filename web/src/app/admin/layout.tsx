import Image from "next/image";
import Link from "next/link";

import { signout } from "@/app/auth/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/shared/Logo";
import { requireAdminPage } from "@/lib/admin-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await requireAdminPage();
  const initials = email ? email.substring(0, 2).toUpperCase() : "AD";

  return (
    <div className="flex min-h-screen flex-1 bg-[#fafafa] text-zinc-900">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200/80 bg-white lg:flex">
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200/80 px-4">
          <Link href="/admin" className="flex items-center gap-2.5 group min-w-0">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 p-1 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo/kiaros-logo.png"
                alt="Kiaros"
                width={28}
                height={28}
                priority
                className="h-5 w-5 object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-sans text-[15px] font-black tracking-tight text-zinc-950">
                  Kiar<span className="text-zinc-500">os</span>
                </span>
                <span className="rounded bg-zinc-950 px-1 py-0.2 font-mono text-[9px] font-bold tracking-wider text-white uppercase">
                  DESK
                </span>
              </div>
              <span className="mt-0.5 font-mono text-[10px] font-medium text-zinc-400 truncate">
                Quant Operations
              </span>
            </div>
          </Link>

          <div className="flex items-center" title="System operational">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <AdminNav />
        </div>

        {/* Sidebar Footer: Telemetry & Admin Profile Card */}
        <div className="border-t border-zinc-200/80 bg-zinc-50/60 p-3 flex flex-col gap-2.5">
          {/* Telemetry status ticker */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-white/80 px-2.5 py-1.5 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Engine Status
            </span>
            <span className="font-semibold text-emerald-700">ONLINE • v2.4</span>
          </div>

          {/* Admin Profile Card */}
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 font-mono text-xs font-bold text-white shadow-2xs ring-1 ring-zinc-900/10">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-950" title={email}>
                {email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/signals"
              target="_blank"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              <span>Live App</span>
              <span className="text-zinc-400">↗</span>
            </Link>
            <form action={signout} className="flex">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 shadow-2xs hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col lg:ml-60 min-w-0">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo suffix="admin" />
            </div>
            <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="font-bold text-zinc-950">Kiaros Desk</span>
              <span className="text-zinc-300">/</span>
              <span className="text-zinc-500">Operations Control</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              STP-ECN LIVE
            </span>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <span>Visit Website</span>
              <span>↗</span>
            </Link>

            <form action={signout} className="lg:hidden">
              <button type="submit" className="btn-ghost text-xs">
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Mobile Navigation Strip */}
        <div className="block border-b border-zinc-200 bg-white px-3 py-1.5 overflow-x-auto lg:hidden">
          <AdminNav orientation="horizontal" />
        </div>

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

