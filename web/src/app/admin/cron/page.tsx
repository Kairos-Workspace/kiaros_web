import type { Metadata } from "next";

import { AdminCronSections } from "@/components/admin/AdminCronSections";
import { requireAdminPage } from "@/lib/admin-guard";
import { listCronStatuses } from "@/lib/github-engine";
import { getXauScanStatus } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin · Cron & Telemetry",
};

export const dynamic = "force-dynamic";

export default async function AdminCronPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  await requireAdminPage();
  const { tab } = (await searchParams) ?? {};

  const [statuses, xau] = await Promise.all([
    listCronStatuses(8),
    getXauScanStatus(),
  ]);

  const alertsConfigured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      process.env.TELEGRAM_ALERTS_CHAT_ID?.trim(),
  );

  const defaultTab = tab === "watchdog" ? "watchdog" : "workflows";

  return (
    <div className="flex w-full flex-col gap-5">
      <AdminCronSections
        statuses={statuses}
        xau={xau}
        alertsConfigured={alertsConfigured}
        defaultTab={defaultTab}
      />
    </div>
  );
}
