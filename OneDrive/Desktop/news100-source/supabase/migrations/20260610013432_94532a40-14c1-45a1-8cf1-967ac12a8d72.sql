
-- Add subject to contact_messages
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS subject TEXT;

-- Likes (one per visitor fingerprint per post)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, visitor_id)
);
GRANT SELECT, INSERT ON public.post_likes TO anon, authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can like" ON public.post_likes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone reads like counts" ON public.post_likes FOR SELECT TO anon, authenticated USING (true);

-- First-user-becomes-admin trigger (server-side, bypasses RLS)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- Storage policies for featured-images
CREATE POLICY "Public read featured-images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'featured-images');

CREATE POLICY "Admins upload featured-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'featured-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update featured-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'featured-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete featured-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'featured-images' AND public.has_role(auth.uid(), 'admin'));
