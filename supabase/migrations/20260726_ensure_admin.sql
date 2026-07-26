-- Ensure administrador El Chimbero (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_admin_id uuid := 'a0b07384-d113-4ec5-a581-2292d3b2e999';
  v_instance uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
    UPDATE auth.users
    SET email = 'admin@elchimbero.com',
        encrypted_password = extensions.crypt('chimbero123', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name":"Admin Chimbero","phone":"264000000"}'::jsonb,
        updated_at = now()
    WHERE id = v_admin_id;
  ELSE
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_instance, v_admin_id, 'authenticated', 'authenticated',
      'admin@elchimbero.com',
      extensions.crypt('chimbero123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Chimbero","phone":"264000000"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_admin_id,
      jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@elchimbero.com', 'email_verified', true),
      'email',
      v_admin_id::text,
      now(), now(), now()
    );
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, avatar_url, is_admin)
  VALUES (
    v_admin_id,
    'Admin Chimbero',
    '264000000',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      is_admin = TRUE;
END $$;
