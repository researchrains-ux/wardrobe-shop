-- Run this in your Supabase SQL editor to set up the database

-- Items table
create table items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  gender text check (gender in ('men', 'women', 'unisex')) not null,
  size text not null,
  condition text check (condition in ('new', 'used')) not null,
  category text,
  sold boolean default false,
  images text[] default '{}',
  created_at timestamptz default now()
);

-- Pickup slots table
create table pickup_slots (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  date_str text not null,
  time_range text not null,
  location text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_contact text not null,
  contact_type text check (contact_type in ('email', 'phone')) not null,
  pickup_slot_id uuid references pickup_slots(id),
  pickup_slot_label text,
  items jsonb not null,
  total numeric(10,2) not null,
  payment_method text check (payment_method in ('card', 'cash')) not null,
  payment_status text check (payment_status in ('pending', 'paid')) default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz default now()
);

-- Storage bucket for item photos
insert into storage.buckets (id, name, public) values ('items', 'items', true);

-- Allow public read on item images
create policy "Public read items" on storage.objects
  for select using (bucket_id = 'items');

-- Allow authenticated uploads (we'll use service role from API)
create policy "Service role upload" on storage.objects
  for insert with check (bucket_id = 'items');

-- Row level security: public can read items and slots
alter table items enable row level security;
alter table pickup_slots enable row level security;
alter table orders enable row level security;

create policy "Public read items" on items for select using (true);
create policy "Public read slots" on pickup_slots for select using (active = true);
create policy "Public insert orders" on orders for insert with check (true);
