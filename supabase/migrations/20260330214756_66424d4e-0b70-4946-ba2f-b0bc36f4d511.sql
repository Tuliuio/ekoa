
-- Add payment_link column to reservations for admin-generated payment links
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- Remove admin role from test user (regular user shouldn't be admin)
DELETE FROM public.user_roles WHERE user_id = 'f940f5c5-c893-43ec-a1e6-79d61ce355ef' AND role = 'admin';
