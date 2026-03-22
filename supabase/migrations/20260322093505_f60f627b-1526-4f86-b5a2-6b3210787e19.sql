
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  author_name text,
  content text NOT NULL,
  post_slug text NOT NULL DEFAULT 'evolutionary-foundations'
);

CREATE POLICY "Allow anonymous inserts on blog_comments"
  ON public.blog_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public reads on blog_comments"
  ON public.blog_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);
