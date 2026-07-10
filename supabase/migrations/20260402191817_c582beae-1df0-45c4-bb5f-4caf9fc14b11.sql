
-- Delete all user_documents
DELETE FROM public.user_documents;

-- Delete all reservations
DELETE FROM public.reservations;

-- Delete user_roles for users that will be removed
DELETE FROM public.user_roles WHERE user_id IN (
  'd7010a76-90bd-472d-8d48-ee867a1f8bd5', -- admin@teste.com.br
  'f940f5c5-c893-43ec-a1e6-79d61ce355ef', -- teste@teste.com.br
  '0ad03f9a-0bc0-475e-8adf-71e2e8be69e6', -- ben@ben.com.br
  '94035230-5521-4b54-bf9e-687d3dd987cb', -- novoteste@testenovo.com.br
  'c67c9dfd-8171-407b-81bd-061e4c7e7ca1', -- pietro.lealb@gmail.com
  '1e8f2ebe-a657-43a3-b847-00165251ad85'  -- ricardogoecks@gmail.com
);

-- Delete profiles for users that will be removed
DELETE FROM public.profiles WHERE id IN (
  'd7010a76-90bd-472d-8d48-ee867a1f8bd5',
  'f940f5c5-c893-43ec-a1e6-79d61ce355ef',
  '0ad03f9a-0bc0-475e-8adf-71e2e8be69e6',
  '94035230-5521-4b54-bf9e-687d3dd987cb',
  'c67c9dfd-8171-407b-81bd-061e4c7e7ca1',
  '1e8f2ebe-a657-43a3-b847-00165251ad85'
);
