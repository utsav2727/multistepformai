CREATE TYPE form_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT DEFAULT '',
  schema JSONB NOT NULL DEFAULT '{"version":"1.0","steps":[],"logicRules":[]}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{
    "theme": {
      "primaryColor": "#6366f1",
      "backgroundColor": "#ffffff",
      "textColor": "#0f172a",
      "fontFamily": "Inter",
      "borderRadius": "8px"
    },
    "behavior": {
      "showProgressBar": true,
      "showStepNumbers": true,
      "submitButtonText": "Submit",
      "successMessage": "Thank you for your submission!",
      "successRedirectUrl": null,
      "autoSaveProgress": false
    },
    "notifications": {
      "emailOnSubmission": false,
      "notificationEmail": null
    }
  }'::jsonb,
  status form_status NOT NULL DEFAULT 'draft',
  slug TEXT UNIQUE,
  submission_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_slug ON public.forms(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_forms_status ON public.forms(status);

CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Maintain forms_count on profiles
CREATE OR REPLACE FUNCTION public.update_forms_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET forms_count = forms_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET forms_count = forms_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_form_count_change
  AFTER INSERT OR DELETE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_forms_count();
