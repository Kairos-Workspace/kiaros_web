-- Rebrand the default downloadable tools for databases where the original
-- seed migration has already been applied.
update public.tools
set
    title_km = 'Kiaros BBMA EA',
    description_km = replace(description_km, 'Qauntify', 'Kiaros'),
    file_url = '/tools/KiarosBBMA.mq5',
    file_name = 'KiarosBBMA.mq5',
    updated_at = now()
where id = 'f1a2b3c4-d5e6-7890-abcd-ef1111111111';

update public.tools
set
    title_km = 'Kiaros Tick Push EA',
    description_km = replace(description_km, 'Qauntify', 'Kiaros'),
    file_url = '/tools/KiarosTickPush.mq5',
    file_name = 'KiarosTickPush.mq5',
    updated_at = now()
where id = 'f1a2b3c4-d5e6-7890-abcd-ef2222222222';
