import { getTranslations } from "@/lib/i18n/server";

import { T } from "@/components/i18n/T";
import type { Metadata } from "next";

import { AdminToolsSections } from "@/components/admin/AdminToolsSections";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllTools } from "@/lib/supabase/admin";
import { parseToolRow } from "@/lib/tools";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Admin · Tools & EAs"),
  };
}

export const revalidate = 30;

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    deleted?: string;
    tab?: string;
  }>;
}) {
  await requireAdminPage();
  const { error, saved, deleted, tab } = await searchParams;
  const rows = await listAllTools();
  const tools = rows.map(parseToolRow).filter((t): t is NonNullable<typeof t> => t != null);

  const defaultTab = tab === "add" || tab === "upload" ? "add" : "list";

  return (
    <div className="flex w-full flex-col gap-5">
      {error ? <Notice tone="error"><T>{error}</T></Notice> : null}
      {saved ? <Notice tone="success"><T>{"Tools repository updated successfully."}</T></Notice> : null}
      {deleted ? <Notice tone="success"><T>{"Tool record deleted."}</T></Notice> : null}

      {/* Tabbed Sections: Repository & Add */}
      <AdminToolsSections tools={tools} defaultTab={defaultTab} />
    </div>
  );
}
