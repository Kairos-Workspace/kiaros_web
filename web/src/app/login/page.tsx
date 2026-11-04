import { getTranslations } from "@/lib/i18n/server";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { redirect } from "next/navigation";

import { login } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { Notice } from "@/components/shared/Notice";
import { isAdminEmail } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Sign In · Kiaros Quant Terminal"),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
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
          <span><T>{"AUTHENTICATION PORTAL"}</T></span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
          <T>{"Sign In to Terminal"}</T>
        </h1>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
          <T>{"Enter your authorized credentials to access trading intelligence and execution controls."}</T>
        </p>
      </div>

      {error ? (
        <Notice tone="error" className="mt-5">
          <T>{error}</T>
        </Notice>
      ) : null}

      <form className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
            <T>{"Email Address"}</T>
          </label>
          <div className="relative">
            <input
              type="email"
              id="login-email"
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
            <label htmlFor="login-password" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              <T>{"Password"}</T>
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="login-password"
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
          <span><T>{"Sign In to Terminal"}</T></span>
          <span className="font-mono">→</span>
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-100 pt-5 flex flex-col gap-3">
        <p className="text-xs text-zinc-500 text-center">
          <T>{"Don't have an account?"}</T>{" "}
          <Link href="/signup" className="font-bold text-zinc-950 hover:underline">
            <T>{"Create free account"}</T>
          </Link>
        </p>
        <p className="text-center font-mono text-[10px] text-zinc-400">
          <T>{"*Authorized institutional & community access only."}</T>
        </p>
      </div>
    </AuthShell>
  );
}
