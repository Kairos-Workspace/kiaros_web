import { getTranslations } from "@/lib/i18n/server";

import { T } from "@/components/i18n/T";
import type { Metadata } from "next";

import { saveBotSettings } from "@/app/admin/actions";
import { Dropdown } from "@/components/shared/Dropdown";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { getBotSettings, SIGNAL_STRATEGIES } from "@/lib/supabase/admin";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Admin · AI settings"),
  };
}

export const revalidate = 30;

export default async function AdminAiSettings({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdminPage();
  const { error, saved } = await searchParams;
  const settings = await getBotSettings();

  return (
    <div className="flex w-full flex-col gap-4">
      {error ? <Notice tone="error"><T>{error}</T></Notice> : null}
      {saved ? (
        <Notice tone="success">
          <T>{"AI settings saved. Changes apply on the next engine run."}</T> </Notice>
      ) : null}

      {settings ? (
        <form className="mt-2 flex w-full flex-col gap-8">
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="card-surface p-5">
              <h2 className="text-lg font-semibold"><T>{"Scanning"}</T></h2>
              <p className="mt-1 text-sm text-slate">
                <T>{"Pairs the engine checks every run (Kraken USD symbols)."}</T> </p>
              <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
                <T>{"Symbols to scan"}</T> <input
                  type="text"
                  name="symbols"
                  required
                  defaultValue={settings.symbols.join(", ")}
                  placeholder="BTCUSD, ETHUSD"
                  className="input-field w-full font-mono"
                />
                <span className="text-xs font-normal text-slate">
                  <T>{"Comma-separated list, e.g. BTCUSD, ETHUSD, XAUUSD"}</T> </span>
              </label>
            </section>

            <section className="card-surface p-5">
              <h2 className="text-lg font-semibold"><T>{"Strategy"}</T></h2>
              <p className="mt-1 text-sm text-slate">
                <T>{"Rules used to find candidate setups before SEA-LION confirms them."}</T> </p>
              <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
                <T>{"Signal strategy"}</T>
                <Dropdown
                  name="signalStrategy"
                  defaultValue={settings.signalStrategy}
                  fullWidth
                  options={SIGNAL_STRATEGIES.map((strategy) => ({
                    value: strategy.id,
                    label: <T>{strategy.label}</T>,
                    hint: strategy.id,
                  }))}
                />
                <span className="text-xs font-normal text-slate">
                  <T>{SIGNAL_STRATEGIES.find(
                    (s) => s.id === settings.signalStrategy,
                  )?.description ?? ""}</T>
                </span>
              </label>
            </section>

            <section className="card-surface p-5">
              <h2 className="text-lg font-semibold">
                <T>{"Quality gates"}</T> </h2>
              <p className="mt-1 text-sm text-slate">
                <T>{"Separate floors for storing confirms in the dashboard versus sending Telegram alerts."}</T> </p>
              <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
                <T>{"Min confidence to store"}</T> <input
                  type="number"
                  name="minStoreConfidence"
                  required
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={settings.minStoreConfidence}
                  className="input-field w-full max-w-[8rem]"
                />
                <span className="text-xs font-normal text-slate">
                  <T>{"Confirms below this are rejected and not stored. 0 = store all confirms."}</T> </span>
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
                <T>{"Min confidence for Telegram alerts"}</T> <input
                  type="number"
                  name="minAlertConfidence"
                  required
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={settings.minAlertConfidence}
                  className="input-field w-full max-w-[8rem]"
                />
                <span className="text-xs font-normal text-slate">
                  <T>{"Only stored signals at or above this get pushed to Telegram."}</T> </span>
              </label>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-sm text-slate">
              <T>{"Settings apply from the next engine run (every 15 minutes)."}</T> </p>
            <button
              formAction={saveBotSettings}
              className="btn-primary"
            >
              <T>{"Save AI settings"}</T> </button>
          </div>
        </form>
      ) : (
        <Notice tone="error">
          <T>{"Could not load AI settings — run"}</T>{" "}
          <code className="font-mono text-xs">supabase/schema.sql</code>  <T>{"in the Supabase SQL Editor to create the bot_settings table."}</T> </Notice>
      )}
    </div>
  );
}
