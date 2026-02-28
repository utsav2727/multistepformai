-- RPC to increment view_count on a form (called publicly, no auth)
CREATE OR REPLACE FUNCTION public.increment_view_count(form_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.forms SET view_count = view_count + 1 WHERE id = form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow public (anon) to call this function
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO authenticated;
