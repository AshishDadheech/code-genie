DROP POLICY IF EXISTS "view projects" ON public.projects;
CREATE POLICY "view projects" ON public.projects FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR public.is_project_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));