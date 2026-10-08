import type { Metadata } from "next";

import { AdminToolsSections } from "@/components/admin/AdminToolsSections";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllTools } from "@/lib/supabase/admin";
import { parseToolRow } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Admin · Tools & EAs",
};

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
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="success">Tools repository updated successfully.</Notice> : null}
      {deleted ? <Notice tone="success">Tool record deleted.</Notice> : null}

      {/* Tabbed Sections: Repository & Add */}
      <AdminToolsSections tools={tools} defaultTab={defaultTab} />
    </div>
  );
}
