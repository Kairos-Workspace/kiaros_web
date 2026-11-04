import { getTranslations } from "@/lib/i18n/server";

import { T } from "@/components/i18n/T";
import type { Metadata } from "next";

import { removeUser } from "@/app/admin/actions";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/format";
import { isAdminEmail, listUsers } from "@/lib/supabase/admin";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Admin · Users"),
  };
}

export const revalidate = 30;

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  await requireAdminPage();
  const { locale } = await getTranslations();
  const { error, deleted } = await searchParams;
  const users = await listUsers();

  const totalCount = users?.length ?? 0;
  const adminCount = users?.filter((u) => isAdminEmail(u.email)).length ?? 0;
  const memberCount = totalCount - adminCount;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950">
            <T>{"Registered Users ("}</T>{totalCount})
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            <T>{"Audit user accounts, security roles, and active session logins across the Kiaros network."}</T> </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-500"><T>{"Admins:"}</T></span>
            <span className="font-mono text-xs font-bold text-zinc-950">{adminCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-500"><T>{"Traders:"}</T></span>
            <span className="font-mono text-xs font-bold text-emerald-700">{memberCount}</span>
          </div>
        </div>
      </div>

      {error ? (
        <Notice tone="error">
          <T>{error}</T>
        </Notice>
      ) : null}
      {deleted ? (
        <Notice tone="success">
          <T>{"User record terminated successfully. Active sessions revoked."}</T> </Notice>
      ) : null}

      {users && users.length > 0 ? (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
                  <th className="px-5 py-3.5"><T>{"User Identity"}</T></th>
                  <th className="px-5 py-3.5"><T>{"Access Role"}</T></th>
                  <th className="px-5 py-3.5"><T>{"Registered"}</T></th>
                  <th className="px-5 py-3.5"><T>{"Last Active"}</T></th>
                  <th className="px-5 py-3.5 text-right"><T>{"Actions"}</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => {
                  const isAdmin = isAdminEmail(u.email);
                  const initial = u.email?.[0]?.toUpperCase() ?? "U";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                            isAdmin
                              ? "bg-zinc-950 text-white"
                              : "bg-zinc-100 text-zinc-800 border border-zinc-200"
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-zinc-950">
                              {u.email}
                            </div>
                            <div className="font-mono text-[10px] text-zinc-400">
                              <T>{"UID:"}</T> {u.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                            <T>{"SUPER ADMIN"}</T> </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <T>{"TRADER"}</T> </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-zinc-600">
                        {formatDateTime(u.createdAt, locale)}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-zinc-600">
                        {u.lastSignInAt ? formatDateTime(u.lastSignInAt, locale) : <span className="text-zinc-400"><T>{"Never"}</T></span>}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isAdmin ? (
                          <span className="font-mono text-[11px] font-bold text-zinc-400">
                            <T>{"Protected"}</T> </span>
                        ) : (
                          <form action={removeUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <button
                              type="submit"
                              className="rounded px-2.5 py-1 font-mono text-[11px] font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              <T>{"Revoke Access"}</T> </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-surface py-12 text-center text-sm text-zinc-500">
          <T>{users ? "No registered users in database." : "Could not load users list."}</T>
        </div>
      )}
    </div>
  );
}
