-- Run this in your Supabase SQL Editor
-- Creates/updates user_payments table used by checkout + refund lifecycle

create extension if not exists pgcrypto;

create table if not exists user_payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_name text,
  user_email text,
  user_phone text,
  plan_id text not null,
  plan_name text not null,
  amount bigint not null,
  currency text not null default 'INR',
  cashfree_order_id text not null unique,
  cashfree_payment_id text,
  status text not null default 'pending',
  refund_reason text,
  refund_requested_at timestamptz,
  refund_completed_at timestamptz,
  refund_id text,
  refund_amount bigint,
  refund_status text,
  refund_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_payments
  add column if not exists user_id text,
  add column if not exists user_name text,
  add column if not exists user_email text,
  add column if not exists user_phone text,
  add column if not exists plan_id text,
  add column if not exists plan_name text,
  add column if not exists amount bigint,
  add column if not exists currency text,
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_payment_id text,
  add column if not exists status text,
  add column if not exists refund_reason text,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refund_completed_at timestamptz,
  add column if not exists refund_id text,
  add column if not exists refund_amount bigint,
  add column if not exists refund_status text,
  add column if not exists refund_note text,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table user_payments
  alter column user_id set not null,
  alter column plan_id set not null,
  alter column plan_name set not null,
  alter column amount set not null,
  alter column currency set not null,
  alter column cashfree_order_id set not null,
  alter column status set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

create unique index if not exists user_payments_cashfree_order_id_key on user_payments(cashfree_order_id);
create index if not exists user_payments_user_id_idx on user_payments(user_id);
create index if not exists user_payments_user_email_idx on user_payments(user_email);
create index if not exists user_payments_status_idx on user_payments(status);
create index if not exists user_payments_created_at_idx on user_payments(created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_payments_status_check'
  ) then
    alter table user_payments
      add constraint user_payments_status_check
      check (status in ('pending', 'success', 'failed', 'refund_requested', 'refunded'));
  end if;
end $$;

alter table user_payments enable row level security;

drop policy if exists "Users can read own payments" on user_payments;
drop policy if exists "Users can insert own payments" on user_payments;
drop policy if exists "Users can update own payments" on user_payments;

create policy "Users can read own payments"
  on user_payments
  for select
  using (
    auth.uid()::text = user_id
    or lower(coalesce(user_email, '')) = lower(coalesce(auth.email(), ''))
  );

create policy "Users can insert own payments"
  on user_payments
  for insert
  with check (
    auth.uid()::text = user_id
    or lower(coalesce(user_email, '')) = lower(coalesce(auth.email(), ''))
  );

create policy "Users can update own payments"
  on user_payments
  for update
  using (
    auth.uid()::text = user_id
    or lower(coalesce(user_email, '')) = lower(coalesce(auth.email(), ''))
  )
  with check (
    auth.uid()::text = user_id
    or lower(coalesce(user_email, '')) = lower(coalesce(auth.email(), ''))
  );

-- Optional: keep updated_at fresh on every update
create or replace function set_user_payments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_payments_updated_at on user_payments;
create trigger trg_user_payments_updated_at
before update on user_payments
for each row
execute function set_user_payments_updated_at();

-- Dedicated refund ledger for merchant-initiated and webhook-updated lifecycle
create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  refund_id text not null unique,
  cashfree_refund_id text,
  entity_type text not null default 'order',
  entity_id text not null,
  order_id text,
  subscription_id text,
  payment_id text,
  refund_amount bigint,
  refund_speed text,
  refund_status text not null default 'PENDING',
  liquidity_state text,
  reason text,
  refund_note text,
  bank_reference text,
  source text not null default 'merchant_api',
  webhook_event text,
  requested_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  raw_response jsonb,
  raw_webhook jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table refunds
  add column if not exists refund_id text,
  add column if not exists cashfree_refund_id text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists order_id text,
  add column if not exists subscription_id text,
  add column if not exists payment_id text,
  add column if not exists refund_amount bigint,
  add column if not exists refund_speed text,
  add column if not exists refund_status text,
  add column if not exists liquidity_state text,
  add column if not exists reason text,
  add column if not exists refund_note text,
  add column if not exists bank_reference text,
  add column if not exists source text,
  add column if not exists webhook_event text,
  add column if not exists requested_at timestamptz,
  add column if not exists last_updated_at timestamptz,
  add column if not exists raw_response jsonb,
  add column if not exists raw_webhook jsonb,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update refunds
set entity_type = 'order'
where entity_type is null;

update refunds
set source = 'merchant_api'
where source is null;

update refunds
set requested_at = coalesce(requested_at, now())
where requested_at is null;

update refunds
set last_updated_at = coalesce(last_updated_at, now())
where last_updated_at is null;

update refunds
set updated_at = coalesce(updated_at, now())
where updated_at is null;

update refunds
set created_at = coalesce(created_at, now())
where created_at is null;

alter table refunds
  alter column refund_id set not null,
  alter column entity_type set not null,
  alter column entity_id set not null,
  alter column refund_status set not null,
  alter column source set not null,
  alter column requested_at set not null,
  alter column last_updated_at set not null,
  alter column created_at set not null,
  alter column updated_at set not null,
  alter column entity_type set default 'order',
  alter column source set default 'merchant_api',
  alter column refund_status set default 'PENDING',
  alter column requested_at set default now(),
  alter column last_updated_at set default now(),
  alter column created_at set default now(),
  alter column updated_at set default now();

create unique index if not exists refunds_refund_id_key on refunds(refund_id);
create index if not exists refunds_order_id_idx on refunds(order_id);
create index if not exists refunds_subscription_id_idx on refunds(subscription_id);
create index if not exists refunds_entity_idx on refunds(entity_type, entity_id);
create index if not exists refunds_refund_status_idx on refunds(refund_status);
create index if not exists refunds_last_updated_at_idx on refunds(last_updated_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'refunds_entity_type_check'
  ) then
    alter table refunds
      add constraint refunds_entity_type_check
      check (entity_type in ('order', 'subscription'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'refunds_refund_speed_check'
  ) then
    alter table refunds
      add constraint refunds_refund_speed_check
      check (refund_speed is null or refund_speed in ('STANDARD', 'INSTANT'));
  end if;
end $$;

alter table refunds enable row level security;

drop policy if exists "Users can read own refunds" on refunds;

create policy "Users can read own refunds"
  on refunds
  for select
  using (
    order_id is not null
    and exists (
      select 1
      from user_payments up
      where up.cashfree_order_id = refunds.order_id
        and (
          auth.uid()::text = up.user_id
          or lower(coalesce(up.user_email, '')) = lower(coalesce(auth.email(), ''))
        )
    )
  );

create or replace function set_refunds_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.last_updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_refunds_updated_at on refunds;
create trigger trg_refunds_updated_at
before update on refunds
for each row
execute function set_refunds_updated_at();

-- Notes:
-- 1) Merchant-triggered refund calls should write into refunds table with refund_id.
-- 2) Cashfree webhook should upsert refund_status transitions (PENDING/SUCCESS/FAILED/ONHOLD).
-- 3) user_payments remains the subscription/payment ledger for UI eligibility checks.
