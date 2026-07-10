
-- Add new values to existing reservation_status enum
ALTER TYPE public.reservation_status ADD VALUE IF NOT EXISTS 'pending_docs';
ALTER TYPE public.reservation_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.reservation_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.reservation_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.reservation_status ADD VALUE IF NOT EXISTS 'active';
