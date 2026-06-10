
-- =========================================================
-- PHASE A: Security hardening
-- =========================================================

-- 1) COMMENTS: drop public read of full row (which exposed email)
DROP POLICY IF EXISTS "Approved comments public read" ON public.comments;
DROP POLICY IF EXISTS "Public can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;

-- Create a safe public view that excludes email
CREATE OR REPLACE VIEW public.public_comments
WITH (security_invoker = true) AS
SELECT id, post_id, name, content, created_at
FROM public.comments
WHERE approved = true;

GRANT SELECT ON public.public_comments TO anon, authenticated;

-- Admins can still read full comments (including email) for moderation
DROP POLICY IF EXISTS "Admins read all comments" ON public.comments;
CREATE POLICY "Admins read all comments"
ON public.comments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert a comment (will be moderated)
DROP POLICY IF EXISTS "Anyone can submit comments" ON public.comments;
CREATE POLICY "Anyone can submit comments"
ON public.comments FOR INSERT
TO anon, authenticated
WITH CHECK (approved = false);

-- Only admins can update / delete
DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments"
ON public.comments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete comments" ON public.comments;
CREATE POLICY "Admins delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke direct anon select on comments table (force via view)
REVOKE SELECT ON public.comments FROM anon;
GRANT SELECT ON public.comments TO authenticated; -- gated by RLS (admin-only policy)

-- 2) USER_ROLES: prevent self-promotion to admin
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON public.user_roles;

-- Users can read only their own role rows (needed for client-side role checks)
CREATE POLICY "Users read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can insert / update / delete roles. No anon access at all.
CREATE POLICY "Admins insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.user_roles FROM anon;

-- 3) SITE_SETTINGS: only expose safe public keys
DROP POLICY IF EXISTS "Site settings public read" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;

-- Whitelist of keys readable by the public
CREATE POLICY "Public reads safe site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (key IN ('site_title', 'tagline', 'logo_url', 'footer_text',
               'social_facebook', 'social_twitter', 'social_instagram',
               'social_youtube', 'social_linkedin'));

CREATE POLICY "Admins read all site settings"
ON public.site_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage site settings"
ON public.site_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Lock down has_role function (already SECURITY DEFINER, restrict EXECUTE)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
