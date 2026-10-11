-- Economic News Predictions by Gemini AI
create table if not exists public.economic_predictions (
    id text primary key, -- deterministic event ID, e.g. "USD-Core-CPI-2026-10-14"
    event_title text not null,
    currency text not null,
    event_date timestamptz,
    forecast text,
    previous text,
    actual text,
    bias text not null default 'NEUTRAL' check (bias in ('BULLISH', 'BEARISH', 'NEUTRAL')),
    gold_impact text not null default 'NEUTRAL' check (gold_impact in ('BULLISH', 'BEARISH', 'NEUTRAL')),
    predicted_outcome text not null,
    confidence integer default 75,
    summary text not null,
    macro_analysis text not null,
    trading_playbook text not null,
    model_name text not null default 'gemini-2.5-flash',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists economic_predictions_created_at_idx
    on public.economic_predictions (created_at desc);

create index if not exists economic_predictions_currency_idx
    on public.economic_predictions (currency);

alter table public.economic_predictions enable row level security;

drop policy if exists "public read economic predictions" on public.economic_predictions;
create policy "public read economic predictions"
    on public.economic_predictions for select
    using (true);

drop policy if exists "service role full access to economic predictions" on public.economic_predictions;
create policy "service role full access to economic predictions"
    on public.economic_predictions for all
    using (true)
    with check (true);
