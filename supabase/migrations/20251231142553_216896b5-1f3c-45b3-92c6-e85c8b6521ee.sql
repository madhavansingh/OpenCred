-- OpenCred Phase 2: Production Backend Schema

-- 1. Create custom types for the system
CREATE TYPE public.user_role AS ENUM ('student', 'institution', 'employer', 'admin');
CREATE TYPE public.credential_type AS ENUM ('degree', 'transcript', 'skill_certificate', 'internship_proof', 'micro_credential');
CREATE TYPE public.credential_status AS ENUM ('active', 'revoked', 'expired', 'pending');
CREATE TYPE public.verification_status AS ENUM ('verified', 'invalid', 'revoked', 'expired', 'pending');
CREATE TYPE public.governance_action AS ENUM ('institution_approval', 'credential_standard', 'dispute_resolution', 'revocation_approval', 'protocol_upgrade');
CREATE TYPE public.governance_vote AS ENUM ('approve', 'reject', 'abstain');

-- 2. Profiles table (DID-based identity)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  wallet_address TEXT UNIQUE,
  did TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- 4. Institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  institution_did TEXT UNIQUE,
  accreditation_number TEXT,
  country TEXT,
  website TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  total_credentials_issued INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Credentials table (core credential storage)
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT UNIQUE NOT NULL,
  issuer_id UUID REFERENCES public.institutions(id) ON DELETE RESTRICT NOT NULL,
  subject_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  credential_type credential_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credential_hash TEXT NOT NULL,
  ipfs_cid TEXT,
  blockchain_tx_hash TEXT,
  metadata JSONB DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  status credential_status NOT NULL DEFAULT 'active',
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  merkle_root TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Credential shares (access control for sharing)
CREATE TABLE public.credential_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES public.credentials(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  access_type TEXT NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Verifications table
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES public.credentials(id) ON DELETE SET NULL,
  verifier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  credential_hash TEXT NOT NULL,
  verification_status verification_status NOT NULL,
  issuer_verified BOOLEAN DEFAULT false,
  blockchain_verified BOOLEAN DEFAULT false,
  revocation_checked BOOLEAN DEFAULT false,
  verification_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Governance proposals
CREATE TABLE public.governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type governance_action NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  quorum_required INTEGER DEFAULT 3,
  is_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Governance votes
CREATE TABLE public.governance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.governance_proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote governance_vote NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, voter_id)
);

-- 10. Audit logs (append-only)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Create security definer functions for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 12. Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies

-- Profiles: users can view all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles: viewable by authenticated, managed by admins
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Institutions: viewable by all, managed by institution owners and admins
CREATE POLICY "Institutions viewable by everyone" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Institution owners can update" ON public.institutions FOR UPDATE TO authenticated 
  USING (profile_id = public.get_user_profile_id(auth.uid()));
CREATE POLICY "Authenticated can create institution" ON public.institutions FOR INSERT TO authenticated 
  WITH CHECK (profile_id = public.get_user_profile_id(auth.uid()));

-- Credentials: complex access control
CREATE POLICY "Students can view own credentials" ON public.credentials FOR SELECT TO authenticated 
  USING (subject_id = public.get_user_profile_id(auth.uid()));
CREATE POLICY "Institutions can view issued credentials" ON public.credentials FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.institutions WHERE id = issuer_id AND profile_id = public.get_user_profile_id(auth.uid())));
CREATE POLICY "Institutions can issue credentials" ON public.credentials FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.institutions WHERE id = issuer_id AND profile_id = public.get_user_profile_id(auth.uid()) AND is_verified = true));
CREATE POLICY "Institutions can update own credentials" ON public.credentials FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.institutions WHERE id = issuer_id AND profile_id = public.get_user_profile_id(auth.uid())));

-- Credential shares: owner and shared-with can view
CREATE POLICY "Owners can manage shares" ON public.credential_shares FOR ALL TO authenticated 
  USING (owner_id = public.get_user_profile_id(auth.uid()));
CREATE POLICY "Shared users can view" ON public.credential_shares FOR SELECT TO authenticated 
  USING (shared_with_id = public.get_user_profile_id(auth.uid()) AND is_active = true);

-- Verifications: verifiers can create, all authenticated can view own
CREATE POLICY "Anyone can create verification" ON public.verifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Verifiers can view own verifications" ON public.verifications FOR SELECT TO authenticated 
  USING (verifier_id = public.get_user_profile_id(auth.uid()) OR verifier_id IS NULL);

-- Governance: authenticated users participate
CREATE POLICY "Proposals viewable by authenticated" ON public.governance_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Verified institutions can propose" ON public.governance_proposals FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'institution') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Votes viewable by authenticated" ON public.governance_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Voters can cast votes" ON public.governance_votes FOR INSERT TO authenticated 
  WITH CHECK (voter_id = public.get_user_profile_id(auth.uid()) AND (public.has_role(auth.uid(), 'institution') OR public.has_role(auth.uid(), 'admin')));

-- Audit logs: viewable by admins only, insertable by system
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 16. Create indexes for performance
CREATE INDEX idx_credentials_subject ON public.credentials(subject_id);
CREATE INDEX idx_credentials_issuer ON public.credentials(issuer_id);
CREATE INDEX idx_credentials_hash ON public.credentials(credential_hash);
CREATE INDEX idx_credentials_status ON public.credentials(status);
CREATE INDEX idx_verifications_hash ON public.verifications(credential_hash);
CREATE INDEX idx_verifications_created ON public.verifications(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);