-- ============================================================================
-- Blood MVP | seed.sql  (LOCAL / STAGING ONLY. Never run on production.)
-- Three clearly fake blood banks near Rajahmundry so the UI has something to show.
-- Real blood banks are imported by an admin from a CSV (see PRD A-03).
-- ============================================================================
insert into public.blood_banks (name, address, city, district, geo, phones, bank_type, is_24x7, trust_score)
values
 ('TEST Blood Bank A (delete me)', 'Test address A', 'Rajahmundry', 'East Godavari',
   st_setsrid(st_makepoint(81.7990, 17.0010), 4326)::geography, array['+910000000001'], 'government', true, 50),
 ('TEST Blood Bank B (delete me)', 'Test address B', 'Rajahmundry', 'East Godavari',
   st_setsrid(st_makepoint(81.8200, 17.0300), 4326)::geography, array['+910000000002'], 'private', false, 50),
 ('TEST Blood Bank C (delete me)', 'Test address C', 'Kakinada', 'Kakinada',
   st_setsrid(st_makepoint(82.2475, 16.9891), 4326)::geography, array['+910000000003'], 'red_cross', true, 50);

insert into public.bank_stock (bank_id, blood_group, component, units, source)
select b.id, g.bg, 'whole_blood', (abs(hashtext(b.name || g.bg::text)) % 9), 'admin_call'
from public.blood_banks b cross join (select unnest(enum_range(null::public.blood_group)) as bg) g
where b.name like 'TEST Blood Bank%';
