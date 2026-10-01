insert into public.membership_plans (name, description, duration_days, price, status)
values
  ('Monthly', '30-day gym access', 30, 2000, 'ACTIVE'),
  ('Quarterly', '90-day gym access', 90, 5400, 'ACTIVE'),
  ('Six Months', '180-day gym access', 180, 10200, 'ACTIVE'),
  ('Annual', '365-day gym access', 365, 18000, 'ACTIVE')
on conflict (name) do update
set description = excluded.description,
    duration_days = excluded.duration_days,
    price = excluded.price,
    status = excluded.status;

insert into public.devices (name, manufacturer, model, location, status)
values ('Main Entrance', 'ZKTeco', 'SenseFace 7A Plus', 'Main Entrance', 'DEMO')
on conflict (name) do update
set manufacturer = excluded.manufacturer,
    model = excluded.model,
    location = excluded.location,
    status = excluded.status;