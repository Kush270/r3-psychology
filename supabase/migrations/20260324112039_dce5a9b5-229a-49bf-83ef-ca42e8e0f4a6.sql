
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL,
  total_a INTEGER NOT NULL DEFAULT 0,
  total_b INTEGER NOT NULL DEFAULT 0,
  total_c INTEGER NOT NULL DEFAULT 0,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own assessment"
  ON public.assessment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own assessment"
  ON public.assessment_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
