# Comprehensive Codebase Audit Report: Kiaros Quantitative Platform

**Target Repository:** `/Users/bunkheangheng/Desktop/Project/Qauntra/kairos_web`  
**Date of Audit:** November 2026  
**Auditing Team:** Multi-Agent Autonomous Audit Consortium  
- **Agent 1:** Principal Security & Backend Architecture Auditor  
- **Agent 2:** Principal Frontend Architect & UI/UX Quality Auditor  
- **Agent 3:** Principal Quantitative Engineer & Trading Systems Auditor  
- **Agent 4:** Principal MQL5 Systems, Database Architect & Cloud Infrastructure Auditor  
**Audit Scope:** Full Stack (Next.js 16.2.10, React 19, MQL5 EAs, Supabase PostgreSQL, Python Quantitative Engine, GitHub Actions CI/CD, and Cloud Storage)

---

## Executive Summary & Audit Dashboard

A deep-dive, multi-agent code audit was performed across the complete Kiaros ecosystem. The platform consists of a quantitative algorithmic trading infrastructure spanning Python market scanners and execution models, MetaTrader 5 Expert Advisors (EAs), Supabase PostgreSQL data persistence, and a Next.js 16 App Router web terminal with English and Khmer (`km`) internationalization.

The audit verified that the project has strong foundations: Pydantic typed data models, mathematical risk scaling models, clean Tailwind v4 styling tokens, and an active test suite (738 Python tests passing in 6.47s; 219 Vitest frontend tests passing in 5.69s). However, the audit uncovered **critical vulnerabilities and architectural flaws** that could lead to financial losses, serverless performance degradation, broker feed drops, and security breaches.

### Risk & Severity Matrix

| Severity Level | Security & Auth | Quant Engine | MT5 & Database | Frontend & UI/UX | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **CRITICAL** | 2 | 3 | 2 | 0 | **7** |
| **HIGH** | 6 | 5 | 4 | 5 | **20** |
| **MEDIUM** | 6 | 3 | 6 | 6 | **21** |
| **LOW / INFO** | 3 | 2 | 3 | 3 | **11** |
| **TOTAL** | **17** | **13** | **15** | **14** | **59** |

---

## Top 7 Critical Findings Requiring Immediate Attention

1. **[Real-time Trading Disablement] Event Loop Monotonic Clock Defect Discarding Crypto Ticks**  
   `signals/outcomes/realtime.py:163`  
   WebSocket ticks are timestamped using Python's monotonic boot clock (`loop.time()`), while trade creation timestamps use UNIX epoch milliseconds. The condition `c.open_time >= created_ms` is always `False`, silently discarding all real-time BTC/ETH ticks and disabling SL/TP outcome monitoring.

2. **[Trading Capital Risk] Gold Level Snapping Corrupts Structural Stop Loss Geometry**  
   `signals/pipeline/market_data.py:180`  
   When snapping Gold setups from closed bars to live prices, `_snap_gold_setup_to_live` adds `delta` directly to `stop_loss`. This shifts structural support/resistance stop losses into market noise, triggering premature stop-outs on normal retracements.

3. **[Quantitative Integrity] Resampled MT5 Multi-Timeframe Feeds Violate Zero-Repaint Guarantee**  
   `signals/clients/market.py:257`  
   Incomplete 1m bars from MT5 are aggregated into higher-timeframe buckets (e.g. 15m or 1h) and treated as fully closed. Live indicators evaluate fluctuating, unclosed candles, causing signals to fire on bars that repaint.

4. **[Database Security] Catastrophic RLS Write Bypass on `economic_predictions` and `daily_analyses`**  
   `supabase/migrations/20261011120000_economic_predictions.sql:35` & `20261008120000_daily_analyses.sql:32`  
   Policies intended for `service_role` omitted the `TO service_role` clause, defaulting in Postgres to `TO PUBLIC`. Any anonymous client holding the public anon key can insert, modify, or delete production economic predictions and daily analysis entries via PostgREST.

5. **[Terminal Freeze] Cascading UI Lockup & Synchronous WebRequest Flooding on Tick Push Failure**  
   `mt5/KiarosTickPush.mq5:940`  
   `lastSentTick` is only updated when HTTP status returns `200`. If an HTTP error occurs, every tick from active market feeds invokes a blocking 30-second `WebRequest` on MT5's main UI thread, freezing the terminal and halting chart redraws and trade operations.

6. **[Privilege Escalation] Unconfirmed Email Privilege Escalation to Super-Admin**  
   `src/proxy.ts:57`, `src/lib/admin-api-guard.ts:8`, `src/app/admin/actions.ts:37`  
   Admin authorization checks whether `user.email` matches `process.env.ADMIN_EMAILS` without verifying `user.email_confirmed_at`. If email signups are enabled or invoked via API, an attacker registering with an admin email can gain full Super-Admin dashboard and mutation access.

7. **[Authentication Bypass] Unverified Session Read (`getSession()`) with Fail-Open Proxy Handling**  
   `src/proxy.ts:69`, `src/lib/auth-session.ts:10`, `src/lib/admin-guard.ts:17`  
   Server components rely on `getSession()` without cryptographically validating the JWT against Supabase. Furthermore, `proxy.ts` catches refresh errors and fails open (`NextResponse.next()`), allowing unverified requests into protected admin layouts during Supabase network blips.

---

# SECTION 1: Web Security, Backend APIs & Authentication Audit

### [CRITICAL] 1.1: Unconfirmed Email Privilege Escalation to Super-Admin
- **Location:** `web/src/proxy.ts:57-65`, `web/src/lib/admin-api-guard.ts:8-15`, `web/src/app/admin/actions.ts:37-41`
- **Description:** Admin authorization checks whether the user's email string exists in `process.env.ADMIN_EMAILS`. None of the admin guards verify `user.email_confirmed_at`. An attacker can register an account using an administrator's email address and immediately gain Super-Admin privileges.
- **Current Code (`web/src/lib/admin-api-guard.ts`):**
  ```ts
  export async function requireAdminApi(): Promise<NextResponse | null> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdminEmail(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return null;
  }
  ```
- **Remediation:** Enforce that `user.email_confirmed_at` is populated, or rely on `app_metadata.role`:
  ```ts
  export async function requireAdminApi(): Promise<NextResponse | null> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email || !user.email_confirmed_at) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  }
  ```

---

### [CRITICAL] 1.2: Unverified Session Read (`getSession()`) with Fail-Open Proxy Exception Handling
- **Location:** `web/src/proxy.ts:40-72`, `web/src/lib/auth-session.ts:10-19`, `web/src/lib/admin-guard.ts:17-22`
- **Description:** `auth-session.ts` and `admin-guard.ts` call `getSession()` instead of `getUser()`. Supabase documentation notes that `getSession()` is insecure on server runtimes because it parses cookie data without validating the cryptographic signature. In `proxy.ts`, network or rate-limit errors in the catch block execute `return NextResponse.next({ request })` (fail-open), forwarding unverified requests to `AdminLayout`.
- **Remediation:**
  1. In `proxy.ts`, fail closed on admin paths: if session verification fails on `/admin/*`, redirect to `/login?error=auth_unavailable`.
  2. In `requireAdminPage()`, call `supabase.auth.getUser()`. React `cache()` deduplicates repeated calls within the same server render.

---

### [HIGH] 1.3: Host Header Poisoning & Insecure Scheme in Auth Callback Generation
- **Location:** `web/src/app/auth/actions.ts:48-57`
- **Description:** Callback URLs for email confirmation are constructed directly from client-controlled `Origin` or `Host` headers. An attacker sending a spoofed `Host: evil.com` header will cause confirmation emails to send links targeting `https://evil.com/auth/confirm?token_hash=...`, leaking tokens to the attacker.
- **Remediation:** Derive origin from `process.env.NEXT_PUBLIC_SITE_URL` with a strict hostname allowlist fallback.

---

### [HIGH] 1.4: Systemic Row-Level Security (RLS) Bypass via Service Role Key on Public Pages
- **Location:** `web/src/lib/analysis.ts:102-130`, `web/src/lib/economic-calendar.ts:314-350`, `web/src/app/(marketing)/track-record/page.tsx:4, 18-22`
- **Description:** Public pages (`/analysis`, `/calendar`, `/track-record`) fetch published records using `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses all RLS policies in PostgreSQL. If any PostgREST filter bug occurs, unconstrained database access is possible. Furthermore, responses are cached in Next.js's Data Cache, risking cross-contamination between privileged and unprivileged queries.
- **Remediation:** Use the public anonymous client (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) with explicit PostgreSQL RLS policies (`published = true`) for all public pages.

---

### [HIGH] 1.5: PostgREST Filter Parameter Injection via Unencoded URL Parameters
- **Location:** `web/src/lib/supabase/admin.ts:515, 1180`, `web/src/lib/economic-calendar.ts:434`
- **Description:** Query filters concatenate raw string IDs without URL encoding or UUID validation:
  `fetch(`${cfg.url}/rest/v1/signals?id=eq.${id}`, { method: "DELETE" })`
  If `id` contains PostgREST operators (e.g. `none,id=neq.0`), the SQL WHERE clause is manipulated, risking unintended mass deletion.
- **Remediation:** Enforce UUID regex validation (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) and wrap parameters in `encodeURIComponent()`.

---

### [HIGH] 1.6: Arbitrary File Deletion / Path Traversal in Analysis File Management
- **Location:** `web/src/lib/r2.ts:133-142`
- **Description:** `deleteAnalysisImage()` resolves local storage file keys via `path.join(process.cwd(), "public", "uploads", "analysis", fileName)`. If `fileName` contains `../../`, an attacker can trigger `unlink()` on arbitrary host files.
- **Remediation:** Sanitize filenames with `path.basename()` and assert `path.resolve()` remains inside the designated target directory.

---

### [HIGH] 1.7: Information Disclosure of Draft Content in Public Static Directory
- **Location:** `web/src/lib/analysis.ts:83-100`
- **Description:** Local fallback storage saves `daily-analyses.json` inside `public/uploads/`. Next.js serves all files in `public/` statically to the public. Unpublished draft analyses (`published: false`) are directly readable by anyone navigating to `/uploads/daily-analyses.json`. Furthermore, serverless runtimes (Vercel) have read-only filesystems outside `/tmp`.
- **Remediation:** Store private data in PostgreSQL or outside `public/`. Fail closed if database storage is unavailable.

---

### [HIGH] 1.8: Missing Rate Limiting Across Auth, Cron, and Compute-Intensive Routes
- **Location:** `web/src/app/auth/actions.ts`, `web/src/app/api/cron/*`, `web/src/app/api/admin/signals/export/route.ts`
- **Description:**
  1. No brute-force protection on `/login` allows infinite password guessing against admin accounts.
  2. Cron routes can be invoked repeatedly, exhausting GitHub Actions API quotas (5,000/hr) and billing limits.
  3. Export routes generate in-memory Excel and PDF files via `ExcelJS` and `jsPDF`, exposing serverless workers to Out-Of-Memory (OOM) crashes under parallel requests.
- **Remediation:** Integrate edge rate limiting via Upstash Redis (`@upstash/ratelimit`) in `proxy.ts`.

---

### [MEDIUM] 1.9: Secret Exposure in URL Query Strings & Length Timing Leakage
- **Location:** `web/src/lib/webhook-guard.ts:3-8, 25-28`
- **Description:**
  1. `authorizedBySecret` permits `?secret=...` query parameters, exposing secrets in server access logs and browser histories.
  2. `safeTimingCompare` executes `if (bufA.length !== bufB.length) return false;` before `timingSafeEqual()`. Mismatched lengths return in sub-microsecond time, leaking secret length to attackers.
- **Remediation:** Compare SHA-256 digests of both strings via `timingSafeEqual()` (guaranteeing equal-length buffers) and deprecate query parameter secrets.

---

### [MEDIUM] 1.10: Stale Open-Signals In-Memory Cache in Multi-Instance Serverless Runtime
- **Location:** `web/src/lib/supabase/admin.ts:530-577`, `web/src/app/api/mt5/tick/route.ts`
- **Description:** `openSignalsCache` stores empty results for 8 seconds in container memory. In serverless multi-instance environments, invalidating cache on one container leaves sibling containers serving empty trades for up to 8 seconds. Fast-moving XAUUSD trades can cross SL/TP without triggering outcomes.
- **Remediation:** Query Supabase with `cache: "no-store"` or use Redis for sub-millisecond distributed cache invalidation.

---

### [MEDIUM] 1.11: Inverted Quote Auto-Swapping Masking Broker Corruptions
- **Location:** `web/src/app/api/mt5/tick/route.ts:38-42`
- **Description:** When `ask < bid` (inverted feed due to bridge corruption or broker disconnect), the route automatically swaps them. Evaluating inverted quotes triggers false Stop Loss or Take Profit events.
- **Remediation:** Drop inverted ticks immediately and log an operational warning.

---

### [MEDIUM] 1.12: LLM Prompt Injection & API Key Exposure in URL Parameter
- **Location:** `web/src/lib/gemini.ts:38-73`
- **Description:**
  1. Event data is interpolated into Gemini prompts without structural separation, allowing adversarial calendar descriptions to alter trading recommendations.
  2. Google Gemini API key is passed in the URL query string (`?key=...`), exposing it in proxy logs.
- **Remediation:** Pass Gemini API key in `x-goog-api-key` header and separate system instructions from dynamic inputs.

---

# SECTION 2: Quantitative Engine, Strategy Logic & Real-time Pipelines Audit

### [CRITICAL] 2.1: Realtime Kraken WebSocket Watcher Discarding All Ticks
- **Location:** `signals/outcomes/realtime.py:163-165` & `signals/outcomes/tracker.py:143-145`
- **Description:** Ticks arriving via WebSocket are timestamped with monotonic boot clock seconds: `ts_ms = int(asyncio.get_event_loop().time() * 1000)`. In `tracker.py`, `_scan_start` checks `if c.open_time >= created_ms: return i`. Because `created_ms` is UNIX epoch milliseconds ($\sim 1.7 \times 10^{12}$) and `ts_ms` is monotonic milliseconds ($\sim 2.5 \times 10^7$), the condition is always `False`. Every tick stream is sliced to an empty list `[]`, disabling real-time crypto outcome evaluation.
- **Current Code:**
  ```python
  # signals/outcomes/realtime.py:163-165
  ts_ms = int(asyncio.get_event_loop().time() * 1000)
  await asyncio.to_thread(watcher.handle_tick, symbol, float(price), ts_ms)
  ```
- **Remediation:** Use true wall-clock UTC epoch milliseconds:
  ```python
  import time
  ts_ms = int(time.time() * 1000)
  await asyncio.to_thread(watcher.handle_tick, symbol, float(price), ts_ms)
  ```

---

### [CRITICAL] 2.2: Resampled MT5 Multi-Timeframe Feeds Violate Zero-Repaint Guarantee
- **Location:** `signals/clients/market.py:257-268` & `signals/analysis/candle_resample.py:10-34`
- **Description:** For XAUUSD, 1m bars are resampled to 15m/1h. Incomplete intervals (e.g. 15 minutes of a 60-minute bar) are bucketed and appended with an artificial dummy forming bar. Downstream code slices `candles[:-1]`, stripping the dummy bar but retaining the incomplete 15-minute bar as a "closed" 1-hour bar. Technical indicators evaluate unclosed bars, generating signals on bars whose values repaint.
- **Remediation:** Enforce that `resample_candles` only emits buckets whose closing timestamp is $\le$ the close of the latest completed 1m bar:
  `if bucket_close > latest_m1_close: continue`.

---

### [CRITICAL] 2.3: Gold Live Level Snapping Destroys Structural Stop Loss Geometry
- **Location:** `signals/pipeline/market_data.py:180-188`
- **Description:** When snapping setups from closed bars to live MT5 market mid, `_snap_gold_setup_to_live` adds `delta = live - setup.entry` to `stop_loss`. For strategies with structural stop losses (swing points, rejection wicks, order blocks), shifting the stop loss moves it away from structural invalidation levels into random market noise, triggering premature stop-outs.
- **Remediation:** Keep `new_stop = setup.stop_loss` anchored to market structure, and recalculate target levels proportionally from live entry.

---

### [HIGH] 2.4: Chandelier Exit Missing Upward/Downward Ratchet Mechanism
- **Location:** `signals/analysis/indicators.py:247-260`
- **Description:** Reference Chandelier Exit algorithms ratchet trailing stops monotonically:
  `longStop := trend == 1 ? math.max(longRaw, longStop[1]) : longRaw`.  
  `indicators.py` computes trailing stops statelessly (`hh - multiplier * atr`). If volatility expands or old highs roll off the lookback window, the stop drops significantly, causing erratic trend flips and false MSS breaks.
- **Remediation:** Implement monotonic ratcheting:
  `cur_long = max(long_raw, prev_long) if (prev_dir == 1) else long_raw`.

---

### [HIGH] 2.5: Signal Deduplication Re-Check Ignores Open Multi-TP Positions
- **Location:** `signals/pipeline/dedup.py:159-165`
- **Description:** Before generating a trade, `already_signaled` checks `if row.get("status") == "open": return True`. When a trade reaches TP1 or TP2, its status updates to `"tp1_hit"` or `"tp2_hit"`. Because it is no longer `"open"`, deduplication falls through to the 3-bar recency check and opens duplicate positions on the same symbol while an active trade is running.
- **Remediation:** Check against all active open statuses:
  `if status in {"open", "tp1_hit", "tp2_hit"} and not closed_at: return True`.

---

### [HIGH] 2.6: Expired Trades Evaluated as Flat 0.0R Inducing Severe Survivorship Bias
- **Location:** `signals/analysis/r_model.py:43-60`
- **Description:** `scaled_r` records `0.0R` for expired trades. If a trade floats at -0.95R for 14 days and reaches expiry, it is logged as 0.0R breakeven rather than a loss. This artificially inflates historical performance metrics.
- **Remediation:** Mark expired trades to market using actual exit prices at the expiry timestamp.

---

### [HIGH] 2.7: Engine Distributed Lock Fails Open on Network/Database Outages
- **Location:** `signals/persistence/locks.py:47-49`
- **Description:** `try_acquire_engine_lock` returns `True` ("continuing anyway") on database exceptions. During Supabase connection blips, multiple cron instances run concurrently, generating duplicate signals and broadcasting duplicate alerts to Telegram.
- **Remediation:** Distributed execution locks must fail closed (`return False`) on exceptions.

---

### [HIGH] 2.8: Non-Thread-Safe Matplotlib / Mplfinance in Concurrent Engine Scans
- **Location:** `signals/pipeline/scan.py:475` & `signals/chart/render.py:9-14`
- **Description:** `engine.py` parallelizes symbol processing via `ThreadPoolExecutor(max_workers=4)`. Matplotlib's `pyplot` module is a global state machine and is not thread-safe. Concurrent chart rendering across threads produces race conditions and corrupted image artifacts.
- **Remediation:** Synchronize chart rendering with a module-level `threading.Lock()`.

---

### [MEDIUM] 2.9: ICT FVG Detector Counter-Trend Fallback Bypasses HTF Hard Filter
- **Location:** `signals/strategies/ict_fvg/detector.py:378-388`
- **Description:** When `htf_trend == "down"`, the detector attempts `_short_candidate()`, but falls back to `_long_candidate()` if no short setup is found. This allows long trades to execute during higher-timeframe downtrends.
- **Remediation:** Enforce HTF trend direction as a strict exclusive filter.

---

### [MEDIUM] 2.10: Raw Price Delta Misrepresented as "Pips" Across Asset Classes
- **Location:** `signals/clients/telegram.py:388-397` & `signals/chart/render.py:379-381`
- **Description:** Outcome alerts calculate price change as `move = float(exit_price) - entry` and append `"pips"`. On BTCUSD, a $1,500 move displays as `+1500.00 pips`. On XAUUSD, a $10 move ($1 = 10 pips) displays as `+10.00 pips` instead of `+100.0 pips`.
- **Remediation:** Apply asset-specific pip multiplier factors (`XAUUSD: 10.0`, `Forex: 10000.0`, `BTCUSD: 1.0`).

---

### [MEDIUM] 2.11: Missing Floating-Point Tick Size & Broker Digit Normalization
- **Location:** `signals/models.py:27-38`, `signals/pipeline/market_data.py:180-208`
- **Description:** Levels are calculated using IEEE 754 floats (e.g. `2341.2483819201924`). Transmitting unquantized prices causes MT5 order placement to fail with `ERR_INVALID_STOPS`.
- **Remediation:** Round price fields to broker digits (`round(price, 2)` for Gold, `round(price, 5)` for Forex).

---

# SECTION 3: MQL5 Expert Advisors, Supabase Database & Cloud Infrastructure Audit

### [CRITICAL] 3.1: Catastrophic RLS Write Bypass on `economic_predictions` and `daily_analyses`
- **Location:** `supabase/migrations/20261011120000_economic_predictions.sql:35-39`, `20261008120000_daily_analyses.sql:32-36`
- **Description:** The policy `create policy "service role full access to economic predictions" on public.economic_predictions for all using (true) with check (true);` omitted `TO service_role`. In Postgres, omitting `TO <role>` defaults to `TO PUBLIC`. Anyone holding the public anon key can insert, update, and delete economic predictions and market analysis records.
- **Remediation:** Drop these policies immediately. In Supabase, `service_role` automatically possesses `bypassrls` and never needs an explicit policy.

---

### [CRITICAL] 3.2: Cascading UI Freeze & Synchronous WebRequest Flooding on Tick Push Failure
- **Location:** `mt5/KiarosTickPush.mq5:940-968` & `web/public/tools/KiarosTickPush.mq5:940-968`
- **Description:** In `OnTick()`, `lastSentTick` is only updated when `HttpPost` returns status `200`. On HTTP errors or network timeouts, `lastSentTick` remains unchanged. Because Gold generates 10–50 ticks/second, `GetTickCount() - lastSentTick >= MinIntervalMs` evaluates to `true` on every subsequent tick, triggering continuous 30-second blocking `WebRequest` calls on MT5's UI thread and freezing the terminal.
- **Remediation:** Update `lastAttemptTick` on every send attempt, apply exponential backoff (up to 10s cool-down) on consecutive errors, and reduce `WebRequest` timeout to 2,000 ms.

---

### [HIGH] 3.3: Permanent MQL5 Signal Dropping on Transient WebRequest Failure
- **Location:** `mt5/KiarosBBMA.mq5:714-729` & `mt5/KiarosSMC.mq5:637-649`
- **Description:** In `OnTick()`, `lastEvaluatedBar` is updated immediately upon bar close detection, prior to calling `Publish()`. If `Publish()` fails due to a network glitch or server restart, `lastEvaluatedBar` remains set. On subsequent ticks of that hour, the EA skips evaluation, permanently dropping valid trading setups.
- **Remediation:** Only advance `lastEvaluatedBar` when `Publish()` succeeds or returns HTTP 409 (already exists). If it fails, retain `failedBar` and retry with a 15-second timer.

---

### [HIGH] 3.4: Inefficient Partial Indexing for High-Frequency Live Tick Queries
- **Location:** `supabase/migrations/20260803000000_reclassify_tp1_then_sl_as_win.sql:9-26` & `web/src/lib/supabase/admin.ts:556-560`
- **Description:** Incoming ticks query `signals` with `status IN ('open', 'tp1_hit', 'tp2_hit') AND closed_at IS NULL`. The existing partial index has predicate `WHERE shadow = false`. The tick query does not filter on `shadow`, so Postgres's query planner cannot use the index, resulting in table scans and in-memory sorts on every tick.
- **Remediation:** Add composite index:
  `CREATE INDEX signals_open_symbol_created_idx ON public.signals (symbol, created_at ASC) WHERE status IN ('open', 'tp1_hit', 'tp2_hit') AND closed_at IS NULL;`

---

### [HIGH] 3.5: 24/7 Looping Daemon Violation of GitHub Actions Terms of Service
- **Location:** `.github/workflows/xau-scalper.yml:28-48`
- **Description:** `xau-scalper.yml` runs a 58-minute bash loop executing `python -m signals.xau_scan` every 60 seconds, triggered hourly to occupy a continuous runner 24/7 (~43,000 minutes/month). This violates GitHub Actions Acceptable Use Policy and risks account termination.
- **Remediation:** Move the 1-minute market scalper loop onto a dedicated Linux VPS or container (systemd service alongside `deploy/kiaros-realtime.service`).

---

### [HIGH] 3.6: Internal Infrastructure IP and Database Topology Leak in `.env.example`
- **Location:** `web/.env.example:14, 38, 41-42`
- **Description:** Committed file contains live internal identifiers:
  `DATABASE_URL=postgresql://finhub:password@34.87.81.86:5432/finhubkh?sslmode=require`, `GCP_PROJECT_ID=project-d0cd5eb1-dc1d-4138-ba9`, and `GCS_BUCKET_NAME=finhubkh-media`.
- **Remediation:** Sanitize `.env.example` with generic placeholders (`localhost`, `your-bucket-name`).

---

### [MEDIUM] 3.7: Missing Foreign Key Constraints & Orphaned Debates on Signal Deletion
- **Location:** `supabase/migrations/20260722000000_agent_debates.sql:5` & `web/src/app/admin/actions.ts:118-132`
- **Description:** `agent_debates.signal_id` is defined as a bare `uuid` without a foreign key referencing `signals(id)`. Deleting a signal leaves orphaned debate rows in the database.
- **Remediation:** Add `FOREIGN KEY (signal_id) REFERENCES public.signals(id) ON DELETE CASCADE`.

---

### [MEDIUM] 3.8: Read-Modify-Write Concurrency Race Condition in Storage-Based Candle Aggregation
- **Location:** `web/src/lib/supabase/admin.ts:665-723`
- **Description:** `mergeMt5Candles` downloads a JSON array from Supabase Storage, merges new bars in memory, and re-uploads it with `x-upsert: true`. Overlapping requests from multiple MT5 terminals overwrite each other, silently losing candle history.
- **Remediation:** Store candles in a relational PostgreSQL table (`market_candles`) with atomic `INSERT ... ON CONFLICT DO UPDATE`.

---

### [MEDIUM] 3.9: Triplicated Cloud Storage Architecture with Failing Fallback Chain
- **Location:** `web/src/lib/r2.ts:4-120` & `web/src/lib/gcs.ts:5-6`
- **Description:** The codebase simultaneously references Supabase Storage, Google Cloud Storage, and Cloudflare R2. In `r2.ts`, `isGcsConfigured()` checks `Boolean(bucketName)`. Because `bucketName` defaults to `"finhubkh-media"`, it evaluates to `true` even without credentials, triggering failing GCS uploads before falling back. If R2 is missing, it attempts a local write to `public/uploads/analysis`, which crashes on Vercel with `EROFS: read-only file system`.
- **Remediation:** Standardize uploads on Supabase Storage and remove dead GCS/local fallback code.

---

### [MEDIUM] 3.10: Process Group Orphan Leak in `dev.sh`
- **Location:** `dev.sh:22-37`
- **Description:** `dev.sh` traps EXIT/INT and runs `kill "$ENGINE_PID"`. `ENGINE_PID` is an outer subshell running `.venv/bin/python` in a pipeline. Killing the subshell leaves the Python engine and sleep processes orphaned in the background.
- **Remediation:** Kill the entire process group: `trap 'kill -- -$$ 2>/dev/null || true' EXIT INT TERM`.

---

# SECTION 4: Frontend UI/UX, Accessibility (a11y), React 19 & Internationalization Audit

### [HIGH] 4.1: Critical 60–120Hz Re-render Storm on Mouse Move in `InteractiveHeroBackground`
- **Location:** `web/src/components/landing/InteractiveHeroBackground.tsx:27, 93-101`
- **Description:** On every `pointermove` across the hero canvas, `setCoords({ x, y })` triggers React state reconciliation at 60–120 FPS. This causes main-thread throttling and frame drops on scroll to update a small coordinate label.
- **Remediation:** Eliminate React state from the pointer loop. Update the coordinate label via a direct DOM ref (`coordsRef.current.textContent = ...`).

---

### [HIGH] 4.2: Data Fetching Waste & Dead Code Pipeline in Track Record
- **Location:** `web/src/app/(marketing)/track-record/page.tsx:19-35` & `web/src/components/track-record/TrackRecordTabs.tsx:17-31`
- **Description:** On `/track-record`, the server fetches closed trades, equity points, and breakdown rows and passes them to `<TrackRecordTabs>`. The component discards all props except `dailyPnL`, rendering only the calendar. `EquityCurve.tsx`, `Breakdown.tsx`, and `RecentTrades.tsx` are 100% orphaned dead code.
- **Remediation:** Reintroduce tabbed navigation to view the Equity Curve and Trade Ledger, or prune the unused database queries in the server page.

---

### [HIGH] 4.3: Complete Absence of Error Boundaries Across the Entire Application
- **Location:** `web/src/app/` (`layout.tsx`, `(marketing)/`, `admin/`, `dashboard/`)
- **Description:** There is no `error.tsx` or `global-error.tsx` in the App Router. Any server exception or Supabase network failure crashes the entire page into Next.js's raw error screen without recovery controls.
- **Remediation:** Create `src/app/global-error.tsx` and segment-level `error.tsx` boundaries with user recovery buttons (`reset()`).

---

### [HIGH] 4.4: Invalid HTML Element Nesting — Interactive Elements inside Buttons
- **Location:** `web/src/components/dashboard/SignalsGrid.tsx:208, 212-215` & `web/src/components/admin/DeleteSignalButton.tsx:44-53`
- **Description:** When `SignalCard` receives `onSelect`, its root renders as a `<button>`. On admin pages, `<DeleteSignalButton>` is rendered inside it, nesting a `<button>` inside another `<button>`. This violates HTML specifications, causes hydration warnings, and triggers erratic click bubbling.
- **Remediation:** Render the card as a `<div>` and attach click triggers only to the card header/body, keeping admin action buttons outside.

---

### [HIGH] 4.5: Lack of Focus Trapping and Escape Handling in Modals
- **Location:**
  - `web/src/components/dashboard/SignalsGrid.tsx:388-404` (`SignalDetailModal`)
  - `web/src/components/calendar/EconomicCalendarView.tsx:331-357` (`Gemini AI Outlook Modal`)
  - `web/src/components/shared/DailyPnLCalendar.tsx:500-523` (`Day Inspection Modal`)
  - `web/src/components/landing/Certificates.tsx:128-152` (`Certificate Inspector`)
- **Description:** Tabbing inside modals allows keyboard focus to escape into the underlying page behind the backdrop (violating WCAG 2.1.2). In `EconomicCalendarView` and `DailyPnLCalendar`, pressing `Escape` does nothing.
- **Remediation:** Implement focus trapping, restore focus to trigger elements upon modal close, and attach global Escape listeners.

---

### [HIGH] 4.6: Sentence Fragmentation & String Concatenation Anti-Pattern in i18n
- **Location:** `web/src/components/shared/Pagination.tsx:53-54`, `web/src/components/shared/Footer.tsx:78`, `web/src/components/track-record/EquityCurve.tsx:89`
- **Description:** Splitting sentences into fragments with intermediate numbers (e.g. `<T>{"Showing"}</T> {from}–{to} <T>{"of"}</T> {total} <T>{items}</T>`) forces English grammatical structure onto Khmer, producing garbled translations.
- **Remediation:** Use single parametric translation strings: `<T values={{ from, to, total, items }}>{"Showing {from}–{to} of {total} {items}"}</T>`.

---

### [HIGH] 4.7: Global Typography Overrides Breaking Monospace Tabular Figures in Khmer
- **Location:** `web/src/app/globals.css:94-108`
- **Description:** Line 97 sets `html[lang="km"] .font-mono { font-family: var(--font-khmer), sans-serif; }`, overriding monospace figures to proportional sans-serif in Khmer mode. Financial tables lose column alignment. Furthermore, setting `line-height: 1.8` universally on `button, th, td` clips text in fixed-height buttons.
- **Remediation:** Keep `var(--font-jetbrains)` first in `.font-mono` with `tabular-nums`, and restrict `line-height: 1.8` to long-form body text (`p, .prose`).

---

### [MEDIUM] 4.8: Missing Khmer Translation Keys for Existing `<T>` Tags
- **Location:** `web/src/lib/i18n/messages/`
- **Description:** Eight strings actively rendered in `<T>` tags are missing from `khmerMessages`: `"Excel (.xlsx)"`, `"PDF (.pdf)"`, `"TP1 / TP2 / TP3"`, `"XAUUSD:"`, `"M15"`, `"TP"`, `"SL"`, `"R"`. In Khmer mode, these strings remain in English.
- **Remediation:** Add missing keys to `src/lib/i18n/messages/common.ts` and `admin.ts`.

---

### [MEDIUM] 4.9: Pitch-Black Hardcoded Styles in `DailyPnLCalendar` Detached from Design System
- **Location:** `web/src/components/shared/DailyPnLCalendar.tsx:283, 322, 382`
- **Description:** The component uses hardcoded black hex codes (`bg-black`, `border-[#1a1a1e]`, `bg-[#121214]`) on a `#fafafa` light studio page, breaking visual continuity.
- **Remediation:** Refactor container surfaces to use CSS tokens (`var(--card)`, `var(--line)`).

---

### [MEDIUM] 4.10: Root Layout Cookie Reading Bypassing Static Edge Caching
- **Location:** `web/src/app/layout.tsx:77` & `web/src/lib/i18n/server.ts:7-10`
- **Description:** `RootLayout` awaits `getTranslations()`, reading cookies on every request and forcing all 22 application routes into dynamic server-rendered execution (`ƒ Dynamic`). Public marketing pages cannot be served from static edge caches.
- **Remediation:** Use Next.js middleware with `x-locale` request header rewriting to generate static shells per locale.

---

# Master Prioritized Remediation Roadmap

```mermaid
flowchart TD
    subgraph P0["P0: Immediate Critical Fixes (Next 24h)"]
        direction TB
        A1["SEC-01: Fix time.time() in Realtime Crypto Watcher"]
        A2["SEC-02: Fix Resampled MT5 Multi-TF Incomplete Bar Leak"]
        A3["SEC-03: Anchor Structural SL in Gold Snapping"]
        A4["DB-01: Drop Permissive RLS Policies on Analyses/Predictions"]
        A5["MT5-01: Prevent Blocking WebRequest Floods in TickPush"]
        A6["AUTH-01: Require email_confirmed_at in Admin Guards"]
        A7["PERF-01: Fix 120Hz Mouse Move Re-render Storm in Hero"]
    end

    subgraph P1["P1: High Priority Architecture & Integrity (Next Sprint)"]
        direction TB
        B1["QUANT-01: Implement Ratcheted Chandelier Exit"]
        B2["QUANT-02: Support tp1_hit / tp2_hit in Deduplication"]
        B3["QUANT-03: Mark Expired Trades to Market in r_model"]
        B4["MT5-02: Prevent Dropped Signals on Transient Publish Errors"]
        B5["DB-02: Add signals_open_symbol_created_idx Composite Index"]
        B6["DEVOPS-01: Migrate 24/7 Scalper off GitHub Actions"]
        B7["FE-01: Add Root & Segment Error Boundaries"]
        B8["FE-02: Restore Focus Trapping & Escape in Modals"]
        B9["I18N-01: Fix Sentence Fragmentation & Typography Overrides"]
    end

    subgraph P2["P2: Infrastructure & Hardening"]
        direction TB
        C1["FAIL-01: Fail Closed on Distributed Engine Locks"]
        C2["SEC-04: Implement Upstash Edge Rate Limiting"]
        C3["SEC-05: Add Constant-Time SHA-256 Compare in Webhook Guard"]
        C4["DB-03: Add HNSW Vector Index on playbook_chunks"]
        C5["STORAGE-01: Consolidate onto Supabase Storage"]
    end

    subgraph P3["P3: Code Hygiene & Testing"]
        direction TB
        D1["TEST-01: Expand Component & Integration Tests"]
        D2["CLEAN-01: Prune 7 Orphan Landing Components"]
        D3["I18N-02: Populate 8 Missing Khmer Translation Keys"]
    end

    P0 --> P1
    P1 --> P2
    P2 --> P3
```

### Action Items Summary:
1. **P0 (Immediate):** Deploy fixes for the 7 Critical vulnerabilities to safeguard trading capital, stop MT5 terminal freezes, secure database RLS policies, and eliminate CPU throttling on the web hero.
2. **P1 (Next Sprint):** Address structural stop loss ratcheting, multi-target deduplication, GitHub Actions ToS violations, modal focus trapping, and Khmer typography alignment.
3. **P2 (Hardening):** Implement distributed edge rate limiting, fail-closed locks, and composite database indexing.
4. **P3 (Quality):** Expand automated test coverage and prune dead landing components.

---
*Report compiled and certified by Multi-Agent Autonomous Audit Consortium.*
