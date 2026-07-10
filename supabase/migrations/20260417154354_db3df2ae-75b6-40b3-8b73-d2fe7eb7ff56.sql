UPDATE auth.users
SET encrypted_password = crypt('Sooly@777#Bike!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'tom@sooly.com.br';