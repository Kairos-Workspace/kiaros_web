-- Security & Performance Migration
-- 1. Revoke accidental public write access on economic_predictions & daily_analyses
drop policy if exists "service role full access to economic predictions" on public.economic_predictions;
drop policy if exists "service role full access to daily analyses" on public.daily_analyses;

-- 2. Optimize high-frequency tick queries on live signals
create index if not exists signals_open_symbol_created_idx
    on public.signals (symbol, created_at asc)
    where status in ('open', 'tp1_hit', 'tp2_hit')
      and closed_at is null;

-- 3. Maintain referential integrity on agent_debates when signals are removed
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fk_agent_debates_signal_id'
    ) then
        alter table public.agent_debates
            add constraint fk_agent_debates_signal_id
            foreign key (signal_id)
            references public.signals(id)
            on delete cascade;
    end if;
end $$;

-- 4. Accelerated vector similarity search on playbook chunks
do $$
begin
    if exists (select 1 from pg_extension where extname = 'vector') then
        create index if not exists playbook_chunks_embedding_hnsw_idx
            on public.playbook_chunks
            using hnsw (embedding vector_cosine_ops);
    end if;
end $$;
