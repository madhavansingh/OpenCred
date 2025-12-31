CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: credential_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credential_status AS ENUM (
    'active',
    'revoked',
    'expired',
    'pending'
);


--
-- Name: credential_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credential_type AS ENUM (
    'degree',
    'transcript',
    'skill_certificate',
    'internship_proof',
    'micro_credential'
);


--
-- Name: governance_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.governance_action AS ENUM (
    'institution_approval',
    'credential_standard',
    'dispute_resolution',
    'revocation_approval',
    'protocol_upgrade'
);


--
-- Name: governance_vote; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.governance_vote AS ENUM (
    'approve',
    'reject',
    'abstain'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'student',
    'institution',
    'employer',
    'admin'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'verified',
    'invalid',
    'revoked',
    'expired',
    'pending'
);


--
-- Name: get_user_profile_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_profile_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_role(uuid, public.user_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.user_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credential_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credential_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    credential_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    shared_with_id uuid,
    share_token text,
    access_type text DEFAULT 'view'::text NOT NULL,
    expires_at timestamp with time zone,
    max_views integer,
    current_views integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    credential_id text NOT NULL,
    issuer_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    credential_type public.credential_type NOT NULL,
    title text NOT NULL,
    description text,
    credential_hash text NOT NULL,
    ipfs_cid text,
    blockchain_tx_hash text,
    metadata jsonb DEFAULT '{}'::jsonb,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone,
    status public.credential_status DEFAULT 'active'::public.credential_status NOT NULL,
    revoked_at timestamp with time zone,
    revocation_reason text,
    merkle_root text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: governance_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposer_id uuid,
    action_type public.governance_action NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    target_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    votes_for integer DEFAULT 0,
    votes_against integer DEFAULT 0,
    votes_abstain integer DEFAULT 0,
    quorum_required integer DEFAULT 3,
    is_executed boolean DEFAULT false,
    executed_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: governance_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_id uuid NOT NULL,
    voter_id uuid NOT NULL,
    vote public.governance_vote NOT NULL,
    reasoning text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    name text NOT NULL,
    institution_did text,
    accreditation_number text,
    country text,
    website text,
    logo_url text,
    is_verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    trust_score integer DEFAULT 0,
    total_credentials_issued integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT institutions_trust_score_check CHECK (((trust_score >= 0) AND (trust_score <= 100)))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    wallet_address text,
    did text,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    granted_by uuid
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    credential_id uuid,
    verifier_id uuid,
    credential_hash text NOT NULL,
    verification_status public.verification_status NOT NULL,
    issuer_verified boolean DEFAULT false,
    blockchain_verified boolean DEFAULT false,
    revocation_checked boolean DEFAULT false,
    verification_time_ms integer,
    ip_address inet,
    user_agent text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: credential_shares credential_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_shares
    ADD CONSTRAINT credential_shares_pkey PRIMARY KEY (id);


--
-- Name: credential_shares credential_shares_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_shares
    ADD CONSTRAINT credential_shares_share_token_key UNIQUE (share_token);


--
-- Name: credentials credentials_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_credential_id_key UNIQUE (credential_id);


--
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);


--
-- Name: governance_proposals governance_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_proposals
    ADD CONSTRAINT governance_proposals_pkey PRIMARY KEY (id);


--
-- Name: governance_votes governance_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_votes
    ADD CONSTRAINT governance_votes_pkey PRIMARY KEY (id);


--
-- Name: governance_votes governance_votes_proposal_id_voter_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_votes
    ADD CONSTRAINT governance_votes_proposal_id_voter_id_key UNIQUE (proposal_id, voter_id);


--
-- Name: institutions institutions_institution_did_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_institution_did_key UNIQUE (institution_did);


--
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- Name: institutions institutions_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_profile_id_key UNIQUE (profile_id);


--
-- Name: profiles profiles_did_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_did_key UNIQUE (did);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_wallet_address_key UNIQUE (wallet_address);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_actor ON public.audit_logs USING btree (actor_id);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_credentials_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credentials_hash ON public.credentials USING btree (credential_hash);


--
-- Name: idx_credentials_issuer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credentials_issuer ON public.credentials USING btree (issuer_id);


--
-- Name: idx_credentials_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credentials_status ON public.credentials USING btree (status);


--
-- Name: idx_credentials_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credentials_subject ON public.credentials USING btree (subject_id);


--
-- Name: idx_verifications_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_created ON public.verifications USING btree (created_at DESC);


--
-- Name: idx_verifications_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_hash ON public.verifications USING btree (credential_hash);


--
-- Name: credentials update_credentials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: institutions update_institutions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: credential_shares credential_shares_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_shares
    ADD CONSTRAINT credential_shares_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE CASCADE;


--
-- Name: credential_shares credential_shares_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_shares
    ADD CONSTRAINT credential_shares_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: credential_shares credential_shares_shared_with_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_shares
    ADD CONSTRAINT credential_shares_shared_with_id_fkey FOREIGN KEY (shared_with_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: credentials credentials_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.institutions(id) ON DELETE RESTRICT;


--
-- Name: credentials credentials_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: governance_proposals governance_proposals_proposer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_proposals
    ADD CONSTRAINT governance_proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: governance_votes governance_votes_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_votes
    ADD CONSTRAINT governance_votes_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.governance_proposals(id) ON DELETE CASCADE;


--
-- Name: governance_votes governance_votes_voter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_votes
    ADD CONSTRAINT governance_votes_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: institutions institutions_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: verifications verifications_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE SET NULL;


--
-- Name: verifications verifications_verifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_verifier_id_fkey FOREIGN KEY (verifier_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.user_role));


--
-- Name: audit_logs Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.user_role));


--
-- Name: verifications Anyone can create verification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create verification" ON public.verifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: institutions Authenticated can create institution; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can create institution" ON public.institutions FOR INSERT TO authenticated WITH CHECK ((profile_id = public.get_user_profile_id(auth.uid())));


--
-- Name: institutions Institution owners can update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Institution owners can update" ON public.institutions FOR UPDATE TO authenticated USING ((profile_id = public.get_user_profile_id(auth.uid())));


--
-- Name: credentials Institutions can issue credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Institutions can issue credentials" ON public.credentials FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.institutions
  WHERE ((institutions.id = credentials.issuer_id) AND (institutions.profile_id = public.get_user_profile_id(auth.uid())) AND (institutions.is_verified = true)))));


--
-- Name: credentials Institutions can update own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Institutions can update own credentials" ON public.credentials FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.institutions
  WHERE ((institutions.id = credentials.issuer_id) AND (institutions.profile_id = public.get_user_profile_id(auth.uid()))))));


--
-- Name: credentials Institutions can view issued credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Institutions can view issued credentials" ON public.credentials FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.institutions
  WHERE ((institutions.id = credentials.issuer_id) AND (institutions.profile_id = public.get_user_profile_id(auth.uid()))))));


--
-- Name: institutions Institutions viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Institutions viewable by everyone" ON public.institutions FOR SELECT USING (true);


--
-- Name: credential_shares Owners can manage shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can manage shares" ON public.credential_shares TO authenticated USING ((owner_id = public.get_user_profile_id(auth.uid())));


--
-- Name: profiles Profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: governance_proposals Proposals viewable by authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Proposals viewable by authenticated" ON public.governance_proposals FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Roles viewable by authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);


--
-- Name: credential_shares Shared users can view; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Shared users can view" ON public.credential_shares FOR SELECT TO authenticated USING (((shared_with_id = public.get_user_profile_id(auth.uid())) AND (is_active = true)));


--
-- Name: credentials Students can view own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own credentials" ON public.credentials FOR SELECT TO authenticated USING ((subject_id = public.get_user_profile_id(auth.uid())));


--
-- Name: audit_logs System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: governance_proposals Verified institutions can propose; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Verified institutions can propose" ON public.governance_proposals FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'institution'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role)));


--
-- Name: verifications Verifiers can view own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Verifiers can view own verifications" ON public.verifications FOR SELECT TO authenticated USING (((verifier_id = public.get_user_profile_id(auth.uid())) OR (verifier_id IS NULL)));


--
-- Name: governance_votes Voters can cast votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voters can cast votes" ON public.governance_votes FOR INSERT TO authenticated WITH CHECK (((voter_id = public.get_user_profile_id(auth.uid())) AND (public.has_role(auth.uid(), 'institution'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role))));


--
-- Name: governance_votes Votes viewable by authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Votes viewable by authenticated" ON public.governance_votes FOR SELECT TO authenticated USING (true);


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: credential_shares; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credential_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: governance_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: governance_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: institutions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;