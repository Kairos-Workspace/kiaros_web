-- Seed default free tools (served from /tools/*.mq5 in web/public/tools/).
insert into public.tools (
    id,
    title_km,
    description_km,
    category,
    file_url,
    file_name,
    mime_type,
    file_size,
    external_url,
    sort_order,
    published
)
values
    (
        'f1a2b3c4-d5e6-7890-abcd-ef1111111111',
        'Kiaros BBMA EA',
        'BBMA (Oma Ally) Expert Advisor for XAUUSD — H4 bias, H1 re-entry, and extreme setups. Automatically publishes signals to Kiaros.',
        'mt5_ea',
        '/tools/KiarosBBMA.mq5',
        'KiarosBBMA.mq5',
        'text/plain',
        null,
        null,
        0,
        true
    ),
    (
        'f1a2b3c4-d5e6-7890-abcd-ef2222222222',
        'Kiaros Tick Push EA',
        'Companion EA — Pushes real-time tick and M1 candles to Kiaros for automated TP/SL tracking and pattern scanning. Pairs with BBMA EA.',
        'mt5_ea',
        '/tools/KiarosTickPush.mq5',
        'KiarosTickPush.mq5',
        'text/plain',
        null,
        null,
        1,
        true
    )
on conflict (id) do nothing;
