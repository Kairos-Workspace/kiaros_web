import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { login } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { Notice } from "@/components/shared/Notice";
import { isAdminEmail } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign In · Kiaros Quant Terminal",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    if (user.email && isAdminEmail(user.email)) {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <AuthShell
      headline="Welcome to Kiaros Quant."
      sub="Access real-time algorithmic execution, full session history, and neural confluence telemetry."
    >
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[10px] font-bold text-zinc-700 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>AUTHENTICATION PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
          Sign In to Terminal
        </h1>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
          Enter your authorized credentials to access trading intelligence and execution controls.
        </p>
      </div>

      {error ? (
        <Notice tone="error" className="mt-5">
          {error}
        </Notice>
      ) : null}

      <form className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="trader@quantdesk.com"
              className="input-field py-2.5 font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="input-field py-2.5 font-mono text-xs"
            />
          </div>
        </div>

        <button
          formAction={login}
          className="btn-primary mt-2 w-full py-3 text-sm font-bold tracking-tight shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Sign In to Terminal</span>
          <span className="font-mono">→</span>
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-100 pt-5 flex flex-col gap-3">
        <p className="text-xs text-zinc-500 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-zinc-950 hover:underline">
            Create free account
          </Link>
        </p>
        <p className="text-center font-mono text-[10px] text-zinc-400">
          *Authorized institutional & community access only.
        </p>
      </div>
    </AuthShell>
  );
}
