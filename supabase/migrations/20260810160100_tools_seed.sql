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
        'EA BBMA (Oma Ally) សម្រាប់ XAUUSD — H4 bias, H1 re-entry និង extreme setup។ បោះផ្សាយ signal ទៅ Kiaros ដោយស្វ័យប្រវត្តិ។',
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
        'EA companion — រុញ tick និង M1 candles ទៅ Kiaros សម្រាប់ TP/SL outcome និង pattern scan។ ភ្ជាប់ជាមួយ BBMA EA។',
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
