import type { Metadata } from "next";

import { AdminAnalysisSections } from "@/components/admin/AdminAnalysisSections";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllAnalysesForAdmin } from "@/lib/analysis";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = {
  title: "Admin · Daily Analysis",
};

export const revalidate = 0;

export default async function AdminAnalysisPage({
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
  const analyses = await listAllAnalysesForAdmin();
  const r2Active = isR2Configured();

  const defaultTab = tab === "upload" ? "upload" : "list";

  return (
    <div className="flex w-full flex-col gap-5">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="success">Daily analysis published / updated successfully.</Notice> : null}
      {deleted ? <Notice tone="success">Analysis record deleted successfully.</Notice> : null}

      {/* Tabbed Sections: Library & Upload */}
      <AdminAnalysisSections
        analyses={analyses}
        r2Active={r2Active}
        defaultTab={defaultTab}
      />
    </div>
  );
}
