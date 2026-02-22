-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- FORMS: Users can CRUD their own forms
CREATE POLICY "Users can view own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- Published forms are publicly readable (for /f/[slug] and /embed/[id])
CREATE POLICY "Published forms are publicly viewable"
  ON public.forms FOR SELECT
  USING (status = 'published');

-- SUBMISSIONS: Form owner can read; anyone can insert to published forms
CREATE POLICY "Form owners can view submissions"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = submissions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit to published forms"
  ON public.submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_id
      AND forms.status = 'published'
    )
  );
