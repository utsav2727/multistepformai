-- Webhooks table: one webhook URL per form (can extend to multiple later)
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_form_id ON public.webhooks(form_id);

-- Webhook delivery logs
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  status_code INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  attempt INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own webhooks"
  ON public.webhooks FOR ALL
  USING (
    form_id IN (SELECT id FROM public.forms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their own webhook logs"
  ON public.webhook_logs FOR ALL
  USING (
    webhook_id IN (
      SELECT w.id FROM public.webhooks w
      JOIN public.forms f ON f.id = w.form_id
      WHERE f.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on webhooks
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
