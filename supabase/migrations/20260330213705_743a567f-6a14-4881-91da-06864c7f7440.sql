
-- Create missing types
CREATE TYPE public.document_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.payment_status AS ENUM ('pending', 'invoiced', 'paid', 'overdue');

-- Add delivery and status columns to reservations
ALTER TABLE public.reservations 
  ADD COLUMN delivery_address TEXT,
  ADD COLUMN delivery_city TEXT DEFAULT 'Florianópolis',
  ADD COLUMN delivery_neighborhood TEXT,
  ADD COLUMN delivery_notes TEXT,
  ADD COLUMN document_status public.document_status DEFAULT 'pending',
  ADD COLUMN payment_status public.payment_status DEFAULT 'pending';

-- Add bike model fields to spaces
ALTER TABLE public.spaces 
  ADD COLUMN model_code TEXT,
  ADD COLUMN motor_power TEXT,
  ADD COLUMN features TEXT[] DEFAULT '{}',
  ADD COLUMN top_speed TEXT,
  ADD COLUMN battery_range TEXT;

-- User documents table
CREATE TABLE public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status public.document_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.user_documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upload documents" ON public.user_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all reservations" ON public.reservations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all reservations" ON public.reservations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all documents" ON public.user_documents
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all documents" ON public.user_documents
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage spaces" ON public.spaces
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can upload own docs storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own docs storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all docs storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
