-- ============================================================
-- Migration : authentification Supabase + table profiles
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Table profiles (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT        NOT NULL,
  name             TEXT        NOT NULL,
  role             TEXT        NOT NULL CHECK (role IN ('direction','adjoint','admin','enseignant')),
  color            TEXT        NOT NULL DEFAULT '#0d9488',
  actif            BOOLEAN     NOT NULL DEFAULT true,
  peut_gerer_acces BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pour afficher la liste de profils sur l'écran de connexion)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE : uniquement via Edge Function (service_role bypass RLS automatiquement)
-- Pas de policy → frontend ne peut pas écrire directement

-- 3. Colonnes de traçabilité sur documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS uploaded_by  UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS validateur   TEXT;

-- 4. Création des 5 comptes initiaux
-- IMPORTANT : Exécuter d'abord la section Auth ci-dessous dans Supabase
-- puis insérer les profils avec les UUID réels obtenus.

-- Instructions :
-- 1. Aller dans Supabase > Authentication > Users > "Add user"
-- 2. Créer les 5 utilisateurs avec les emails/mots de passe suivants :
--
--    Email                              | Mot de passe
--    -----------------------------------|----------------------
--    direction@saint-charles-app.re     | SaintCharles!Dir2025
--    adjoint@saint-charles-app.re       | SaintCharles!Adj2025
--    admin1@saint-charles-app.re        | SaintCharles!Adm12025
--    admin2@saint-charles-app.re        | SaintCharles!Adm22025
--    enseignant@saint-charles-app.re    | SaintCharles!Ens2025
--
-- 3. Pour chaque utilisateur créé, copier son UUID et remplacer dans les INSERT ci-dessous.
-- 4. S'assurer que "Email Confirm" est désactivé (Auth > Settings > "Enable email confirmations" = OFF)

-- Remplacer les UUIDs par ceux obtenus depuis Supabase Auth :
-- INSERT INTO public.profiles (id, email, name, role, color, actif, peut_gerer_acces) VALUES
--   ('UUID_DIRECTION',  'direction@saint-charles-app.re',  'Direction',            'direction', '#e91e8c', true, true),
--   ('UUID_ADJOINT',    'adjoint@saint-charles-app.re',    'Adjoint de direction', 'adjoint',   '#0d9488', true, false),
--   ('UUID_ADMIN1',     'admin1@saint-charles-app.re',     'Administration',       'admin',     '#9c27b0', true, false),
--   ('UUID_ADMIN2',     'admin2@saint-charles-app.re',     'Administration 2',     'admin',     '#b8860b', true, false),
--   ('UUID_ENSEIGNANT', 'enseignant@saint-charles-app.re', 'Personnel Enseignant', 'enseignant','#1a237e', true, false);
