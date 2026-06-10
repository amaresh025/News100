
-- Lock down helper functions: only triggers/RLS internally need them.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- authenticated keeps EXECUTE so RLS policies that call has_role() work.

-- Replace overly-permissive insert policies with minimal validation
DROP POLICY IF EXISTS "Anyone can submit comment" ON public.comments;
CREATE POLICY "Anyone can submit comment" ON public.comments FOR INSERT
  WITH CHECK (
    approved = false
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND length(trim(content)) BETWEEN 2 AND 2000
  );

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT
  WITH CHECK (
    is_read = false
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND length(trim(message)) BETWEEN 5 AND 5000
  );
