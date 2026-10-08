-- Daily Analysis table: Admin-published technical charts & market breakdowns
create table if not exists public.daily_analyses (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    symbol text not null default 'XAUUSD',
    timeframe text not null default 'H1',
    bias text not null default 'BULLISH' check (bias in ('BULLISH', 'BEARISH', 'NEUTRAL')),
    image_url text not null,
    image_key text,
    description text not null default '',
    session text not null default 'London / New York',
    key_levels jsonb default '[]'::jsonb,
    author text not null default 'Kiaros Quant Team',
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists daily_analyses_published_created_idx
    on public.daily_analyses (published, created_at desc);

create index if not exists daily_analyses_symbol_idx
    on public.daily_analyses (symbol);

alter table public.daily_analyses enable row level security;

drop policy if exists "public read published daily analyses" on public.daily_analyses;
create policy "public read published daily analyses"
    on public.daily_analyses for select
    using (published = true);

drop policy if exists "service role full access to daily analyses" on public.daily_analyses;
create policy "service role full access to daily analyses"
    on public.daily_analyses for all
    using (true)
    with check (true);
