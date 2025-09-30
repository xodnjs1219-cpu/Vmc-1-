-- Migration: 블로그 체험단 플랫폼 스키마 생성
-- Description: 광고주/인플루언서 프로필, 캠페인, 지원 관리 테이블 생성

-- Ensure pgcrypto extension is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. profiles: 사용자 공통 프로필 정보
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('advertiser', 'influencer')),
  terms_agreed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

COMMENT ON TABLE public.profiles IS '사용자 공통 프로필 정보 (광고주/인플루언서)';
COMMENT ON COLUMN public.profiles.role IS '사용자 역할: advertiser(광고주), influencer(인플루언서)';

-- ============================================================================
-- 2. influencer_profiles: 인플루언서 전용 프로필
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user_id ON public.influencer_profiles(user_id);

COMMENT ON TABLE public.influencer_profiles IS '인플루언서 전용 프로필 정보';
COMMENT ON COLUMN public.influencer_profiles.birth_date IS '생년월일';

-- ============================================================================
-- 3. influencer_channels: 인플루언서 SNS 채널 정보 (1:N)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.influencer_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('naver', 'youtube', 'instagram', 'threads')),
  channel_name VARCHAR(100) NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_channels_user_id ON public.influencer_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_channels_status ON public.influencer_channels(status);

COMMENT ON TABLE public.influencer_channels IS '인플루언서 SNS 채널 정보';
COMMENT ON COLUMN public.influencer_channels.platform IS 'SNS 플랫폼: naver, youtube, instagram, threads';
COMMENT ON COLUMN public.influencer_channels.status IS '채널 검증 상태: pending(대기), verified(검증완료), failed(실패)';

-- ============================================================================
-- 4. advertiser_profiles: 광고주 전용 프로필
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  location VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  business_number VARCHAR(20) NOT NULL UNIQUE,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_user_id ON public.advertiser_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_business_number ON public.advertiser_profiles(business_number);

COMMENT ON TABLE public.advertiser_profiles IS '광고주 전용 프로필 정보';
COMMENT ON COLUMN public.advertiser_profiles.business_number IS '사업자등록번호 (UNIQUE)';
COMMENT ON COLUMN public.advertiser_profiles.verification_status IS '검증 상태: pending(대기), verified(검증완료), failed(실패)';

-- ============================================================================
-- 5. campaigns: 체험단 캠페인
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  recruitment_start TIMESTAMPTZ NOT NULL,
  recruitment_end TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  benefits TEXT NOT NULL,
  store_info TEXT NOT NULL,
  mission TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_recruitment_dates ON public.campaigns(recruitment_start, recruitment_end);

COMMENT ON TABLE public.campaigns IS '체험단 캠페인 정보';
COMMENT ON COLUMN public.campaigns.status IS '모집 상태: recruiting(모집중), closed(모집종료), completed(선정완료)';
COMMENT ON COLUMN public.campaigns.max_participants IS '모집 인원 (양수)';

-- ============================================================================
-- 6. applications: 체험단 지원 내역
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON public.applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.applications(user_id, status);

COMMENT ON TABLE public.applications IS '체험단 지원 내역';
COMMENT ON COLUMN public.applications.message IS '각오 한마디';
COMMENT ON COLUMN public.applications.visit_date IS '방문 예정일';
COMMENT ON COLUMN public.applications.status IS '지원 상태: pending(신청완료), selected(선정), rejected(반려)';

-- ============================================================================
-- 7. Triggers: updated_at 자동 갱신
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON public.influencer_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON public.advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Disable RLS (Row Level Security)
-- ============================================================================
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.influencer_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.advertiser_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications DISABLE ROW LEVEL SECURITY;