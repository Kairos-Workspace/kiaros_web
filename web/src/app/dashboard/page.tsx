import { getTranslations } from "@/lib/i18n/server";
import { T } from "@/components/i18n/T";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SignalsBrowse } from "@/components/signals/SignalsBrowse";
import { Notice } from "@/components/shared/Notice";
import {
  parseAiSignalStrategy,
  parseSignalsBrowseTab,
} from "@/lib/signals-browse-tabs";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Dashboard"),
  };
}

export const revalidate = 30;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    admin?: string;
    tab?: string;
    strategy?: string;
    page?: string;
  }>;
}) {
  const supabase = await createClient();
  // No login gate: anon visitors see the same RLS-limited (24h) history as
  // /signals. accessToken stays undefined for them, same as that page.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const accessToken = session?.access_token;
  const { admin, tab, strategy, page: pageParam } = await searchParams;

  const currentTab = parseSignalsBrowseTab(tab);
  const currentStrategy = parseAiSignalStrategy(strategy);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <DashboardShell
      title="Signals"
      subtitle="AI-confirmed setups and live EA feeds"
    >
      <div className="w-full space-y-6">
        {admin === "denied" && user ? (
          <Notice tone="error">
            <T values={{ email: user.email ?? "" }}>{"Admin access is not enabled for {email}. Ask the owner to add your email to ADMIN_EMAILS, then sign out and back in."}</T>
          </Notice>
        ) : null}

        <div className="lg:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-ink"><T>{"Signals"}</T></h1>
          <p className="mt-1 text-sm text-slate">
            <T>{"AI-confirmed setups and live EA feeds"}</T>
          </p>
        </div>

        <SignalsBrowse
          tab={currentTab}
          strategy={currentStrategy}
          page={page}
          accessToken={accessToken}
          basePath="/dashboard"
          hideFilter
        />
      </div>
    </DashboardShell>
  );
}
