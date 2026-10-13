ALTER TABLE wellness_proofs 
ADD COLUMN proof_type text NOT NULL DEFAULT 'streak',
ADD COLUMN avg_stress numeric;
