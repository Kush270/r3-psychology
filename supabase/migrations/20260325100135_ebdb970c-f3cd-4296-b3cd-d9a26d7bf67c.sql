CREATE POLICY "Users can delete own assessment"
ON public.assessment_responses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);