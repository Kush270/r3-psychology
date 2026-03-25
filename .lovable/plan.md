

## Plan: Allow Assessment Retake

### Problem
Currently, if a user has an existing assessment response, they are immediately redirected to `/assessment/results` and cannot retake the assessment. The `assessment_responses` table also has a unique constraint on `user_id`, preventing a second insert.

### Changes

**1. Add DELETE RLS policy** (migration)
- Add a policy allowing authenticated users to delete their own assessment response (`auth.uid() = user_id`).

**2. Add "Retake Assessment" button to `AssessmentResults.tsx`**
- Add a button alongside the existing Download/Share buttons.
- On click: delete the user's existing row from `assessment_responses`, then navigate to `/assessment`.

**3. Update `Assessment.tsx` redirect logic**
- Remove or adjust the `useEffect` that auto-redirects to results when an existing response is found. Instead, allow the user to land on the assessment page if they navigated there intentionally (e.g., after deleting their previous result).

### Files changed
- **Migration SQL**: Add DELETE policy on `assessment_responses`
- **`src/pages/AssessmentResults.tsx`**: Add "Retake" button with delete logic
- **`src/pages/Assessment.tsx`**: Remove auto-redirect to results

