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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-52 flex-col border-r border-zinc-200 bg-white lg:flex">
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200/80 px-4">
          <Logo suffix="admin" />
          <span className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-600 uppercase">
            DESK
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3.5 scrollbar-thin">
          <AdminNav />
        </div>

        {/* Sidebar Footer: Admin Profile Card */}
        <div className="border-t border-zinc-200 bg-zinc-50/70 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 font-mono text-xs font-bold text-white shadow-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-950" title={email}>
                {email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-zinc-200/80 pt-2 text-[11px] font-mono">
            <Link
              href="/signals"
              target="_blank"
              className="text-zinc-600 hover:text-zinc-950 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Live Terminal</span>
              <span>↗</span>
            </Link>
            <form action={signout}>
              <button
                type="submit"
                className="text-zinc-500 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col lg:ml-52 min-w-0">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo suffix="admin" />
            </div>
            <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="font-bold text-zinc-950">KIAROS QUANT DESK</span>
              <span>/</span>
              <span>CONTROL PANEL</span>
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
        <div className="block border-b border-zinc-200 bg-white px-2 py-2 overflow-x-auto lg:hidden">
          <AdminNav />
        </div>

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
