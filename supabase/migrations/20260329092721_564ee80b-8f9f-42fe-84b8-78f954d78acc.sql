CREATE TABLE public.audit_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  score integer NOT NULL,
  maturity_level text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Allow anonymous inserts on audit_submissions"
  ON public.audit_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);