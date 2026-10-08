import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signup } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { Notice } from "@/components/shared/Notice";
import { ALLOW_SIGNUP } from "@/lib/access-mode";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  const supabase = await createClient();
  // getUser() re-verifies the token with the auth server, unlike
  // getSession() which just trusts the cookie's claimed contents.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      headline="Join the Kiaros Trading Network."
      sub="Access real-time algorithmic execution, full session history, and neural confluence telemetry."
    >
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[10px] font-bold text-zinc-700 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>INSTITUTIONAL REGISTRATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
          Create Account
        </h1>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
          Open your complimentary terminal access to monitor verified setups and session streams.
        </p>
      </div>

      {!ALLOW_SIGNUP ? (
        <Notice tone="success" className="mt-6">
          Public registration is currently closed — all signals can be browsed freely
          without an account. Head to{" "}
          <Link href="/signals" className="font-semibold underline">
            Signals
          </Link>{" "}
          to explore live setups.
        </Notice>
      ) : (
        <>
          {error ? (
            <Notice tone="error" className="mt-5">
              {error}
            </Notice>
          ) : null}
          {sent ? (
            <Notice tone="success" className="mt-5">
              Check your email — we sent a confirmation link to activate your terminal.
            </Notice>
          ) : (
            <form className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="trader@quantdesk.com"
                  className="input-field py-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Password (Min 6 Characters)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="input-field py-2.5 font-mono text-xs"
                />
              </div>

              <button
                formAction={signup}
                className="btn-primary mt-2 w-full py-3 text-sm font-bold tracking-tight shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Terminal Account</span>
                <span className="font-mono">→</span>
              </button>
            </form>
          )}
        </>
      )}

      <div className="mt-8 border-t border-zinc-100 pt-5 flex flex-col gap-3">
        <p className="text-xs text-zinc-500 text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-zinc-950 hover:underline">
            Sign In to Terminal
          </Link>
        </p>
        <p className="text-center font-mono text-[10px] text-zinc-400">
          *Institutional encryption & secure cookie session handling enabled.
        </p>
      </div>
    </AuthShell>
  );
}
