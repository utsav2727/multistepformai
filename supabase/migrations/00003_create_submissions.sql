CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_step INTEGER,
  is_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_form_id ON public.submissions(form_id);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_submissions_form_complete ON public.submissions(form_id, is_complete);

-- Update form submission count
CREATE OR REPLACE FUNCTION public.increment_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true THEN
    UPDATE public.forms SET submission_count = submission_count + 1 WHERE id = NEW.form_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_submission_created
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.increment_submission_count();
