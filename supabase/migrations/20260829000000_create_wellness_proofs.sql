-- wellness_proofs: public, privacy-preserving proof storage
-- No user_id or personal data ever stored here.

create table if not exists public.wellness_proofs (
  id          uuid primary key default gen_random_uuid(),
  proof_hash  text not null unique,
  streak_length int not null,
  created_at  timestamptz not null default now()
);

alter table public.wellness_proofs enable row level security;

-- Anyone can verify (SELECT) a proof hash
create policy "Public can read proofs"
  on public.wellness_proofs for select
  using (true);

-- Only authenticated users can publish a proof
create policy "Authenticated users can insert proofs"
  on public.wellness_proofs for insert
  to authenticated
  with check (true);
