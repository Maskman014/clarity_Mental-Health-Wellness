
/*
# Create diagnostics table for Clarity wellness platform

## Overview
Creates the `diagnostics` table to persist user mood assessments, journal entries,
and stress index readings. Each row is tied to an authenticated user via `user_id`.
This replaces the prior localStorage-only approach with durable, per-user cloud storage.

## New Tables

### `diagnostics`
| Column        | Type        | Description                                              |
|---------------|-------------|----------------------------------------------------------|
| id            | uuid        | Primary key, auto-generated                              |
| user_id       | uuid        | Owner – defaults to auth.uid() so inserts can omit it   |
| mood          | text        | One of: flourishing, grounded, overwhelmed, exhausted, restless |
| journal       | text        | Micro-journal entry (max 3 sentences)                    |
| stress_level  | integer     | Biometric stress index 1–10                              |
| created_at    | timestamptz | Timestamp of the diagnostic session                      |

## Security
- RLS enabled on `diagnostics`.
- Four separate policies (SELECT / INSERT / UPDATE / DELETE) scoped to `authenticated`.
- Ownership check: `auth.uid() = user_id` on every policy.
- `user_id` defaults to `auth.uid()` so the frontend omits it from inserts safely.

## Notes
1. Idempotent: all statements use IF NOT EXISTS / DROP IF EXISTS so re-running is safe.
2. Index on (user_id, created_at DESC) for efficient per-user chronological queries.
*/

CREATE TABLE IF NOT EXISTS diagnostics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood         text NOT NULL,
  journal      text NOT NULL DEFAULT '',
  stress_level integer NOT NULL DEFAULT 5,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS diagnostics_user_created
  ON diagnostics (user_id, created_at DESC);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_diagnostics" ON diagnostics;
CREATE POLICY "select_own_diagnostics" ON diagnostics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_diagnostics" ON diagnostics;
CREATE POLICY "insert_own_diagnostics" ON diagnostics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_diagnostics" ON diagnostics;
CREATE POLICY "update_own_diagnostics" ON diagnostics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_diagnostics" ON diagnostics;
CREATE POLICY "delete_own_diagnostics" ON diagnostics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
