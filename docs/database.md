# 블로그 체험단 SaaS — 데이터베이스 설계 문서

## 목차

1. [데이터플로우](#데이터플로우)
2. [테이블 구조](#테이블-구조)
3. [ERD 관계도](#erd-관계도)
4. [인덱스 전략](#인덱스-전략)
5. [제약조건](#제약조건)

---

## 데이터플로우

### 1. 회원가입 & 역할선택

```
입력 데이터
  ↓
Supabase Auth (users)
  ↓
profiles 테이블 생성
  - user_id (FK to auth.users)
  - name, phone, email
  - role (advertiser | influencer)
  - terms_agreed_at
```

### 2. 인플루언서 정보 등록

```
profiles (role = 'influencer')
  ↓
influencer_profiles 생성
  - user_id (FK to profiles)
  - birth_date
  ↓
influencer_channels 생성 (1:N)
  - user_id (FK to profiles)
  - platform, channel_name, channel_url
  - status (pending | verified | failed)
```

### 3. 광고주 정보 등록

```
profiles (role = 'advertiser')
  ↓
advertiser_profiles 생성
  - user_id (FK to profiles)
  - company_name, location, category
  - business_number (UNIQUE)
  - verification_status (pending | verified | failed)
```

### 4. 홈 & 체험단 목록 탐색

```
SELECT * FROM campaigns
WHERE status = 'recruiting'
  AND recruitment_end >= NOW()
ORDER BY created_at DESC
```

### 5. 체험단 상세

```
SELECT c.*, ap.*
FROM campaigns c
JOIN advertiser_profiles ap ON c.advertiser_id = ap.user_id
WHERE c.id = :campaign_id

권한 체크:
  - profiles.role = 'influencer'
  - EXISTS(SELECT 1 FROM influencer_profiles WHERE user_id = :user_id)
```

### 6. 체험단 지원

```
INSERT INTO applications (
  campaign_id,
  user_id,
  message,
  visit_date,
  status
) VALUES (
  :campaign_id,
  :user_id,
  :message,
  :visit_date,
  'pending'
)

제약:
  - UNIQUE(campaign_id, user_id) — 중복 지원 방지
  - recruitment_start <= NOW() <= recruitment_end
```

### 7. 내 지원 목록 (인플루언서 전용)

```
SELECT a.*, c.title, c.recruitment_end, c.benefits
FROM applications a
JOIN campaigns c ON a.campaign_id = c.id
WHERE a.user_id = :user_id
  AND (:status_filter IS NULL OR a.status = :status_filter)
ORDER BY a.created_at DESC
```

### 8. 광고주 체험단 관리

```
조회:
  SELECT * FROM campaigns
  WHERE advertiser_id = :user_id
  ORDER BY created_at DESC

생성:
  INSERT INTO campaigns (
    advertiser_id,
    title,
    recruitment_start,
    recruitment_end,
    max_participants,
    benefits,
    store_info,
    mission,
    status
  ) VALUES (...)
```

### 9. 광고주 체험단 상세 & 모집 관리

```
신청자 조회:
  SELECT a.*, ip.birth_date, p.name, p.email
  FROM applications a
  JOIN profiles p ON a.user_id = p.id
  JOIN influencer_profiles ip ON a.user_id = ip.user_id
  WHERE a.campaign_id = :campaign_id
  ORDER BY a.created_at ASC

모집 종료:
  UPDATE campaigns
  SET status = 'closed'
  WHERE id = :campaign_id

체험단 선정:
  UPDATE campaigns
  SET status = 'completed'
  WHERE id = :campaign_id;

  UPDATE applications
  SET status = CASE
    WHEN id IN (:selected_ids) THEN 'selected'
    ELSE 'rejected'
  END
  WHERE campaign_id = :campaign_id;
```

---

## 테이블 구조

### 1. profiles

사용자 공통 프로필 정보

| 컬럼            | 타입         | 제약조건                                      | 설명                      |
| --------------- | ------------ | --------------------------------------------- | ------------------------- |
| id              | UUID         | PK, FK → auth.users(id) ON DELETE CASCADE     | Supabase Auth 사용자 ID   |
| name            | VARCHAR(100) | NOT NULL                                      | 이름                      |
| phone           | VARCHAR(20)  | NOT NULL                                      | 휴대폰번호                |
| email           | VARCHAR(255) | NOT NULL                                      | 이메일                    |
| role            | VARCHAR(20)  | NOT NULL, CHECK IN ('advertiser','influencer') | 역할                      |
| terms_agreed_at | TIMESTAMPTZ  | NOT NULL                                      | 약관 동의 시각            |
| created_at      | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 생성 시각                 |
| updated_at      | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 수정 시각 (트리거 자동)   |

**인덱스:**
- `idx_profiles_role` ON (role)
- `idx_profiles_email` ON (email)

---

### 2. influencer_profiles

인플루언서 전용 프로필

| 컬럼       | 타입        | 제약조건                                  | 설명                    |
| ---------- | ----------- | ----------------------------------------- | ----------------------- |
| id         | UUID        | PK DEFAULT gen_random_uuid()              | 프로필 ID               |
| user_id    | UUID        | UNIQUE, FK → profiles(id) ON DELETE CASCADE | 사용자 ID               |
| birth_date | DATE        | NOT NULL                                  | 생년월일                |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                    | 생성 시각               |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                    | 수정 시각 (트리거 자동) |

**인덱스:**
- `idx_influencer_profiles_user_id` ON (user_id)

---

### 3. influencer_channels

인플루언서 SNS 채널 정보 (1:N)

| 컬럼         | 타입         | 제약조건                                      | 설명                                  |
| ------------ | ------------ | --------------------------------------------- | ------------------------------------- |
| id           | UUID         | PK DEFAULT gen_random_uuid()                  | 채널 ID                               |
| user_id      | UUID         | FK → profiles(id) ON DELETE CASCADE           | 사용자 ID                             |
| platform     | VARCHAR(20)  | NOT NULL, CHECK IN ('naver','youtube','instagram','threads') | 플랫폼 유형                           |
| channel_name | VARCHAR(100) | NOT NULL                                      | 채널명                                |
| channel_url  | VARCHAR(500) | NOT NULL                                      | 채널 URL                              |
| status       | VARCHAR(20)  | NOT NULL DEFAULT 'pending', CHECK IN ('pending','verified','failed') | 검증 상태                             |
| created_at   | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 생성 시각                             |
| updated_at   | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 수정 시각 (트리거 자동)               |

**인덱스:**
- `idx_influencer_channels_user_id` ON (user_id)
- `idx_influencer_channels_status` ON (status)

---

### 4. advertiser_profiles

광고주 전용 프로필

| 컬럼                | 타입         | 제약조건                                      | 설명                                  |
| ------------------- | ------------ | --------------------------------------------- | ------------------------------------- |
| id                  | UUID         | PK DEFAULT gen_random_uuid()                  | 프로필 ID                             |
| user_id             | UUID         | UNIQUE, FK → profiles(id) ON DELETE CASCADE   | 사용자 ID                             |
| company_name        | VARCHAR(200) | NOT NULL                                      | 업체명                                |
| location            | VARCHAR(500) | NOT NULL                                      | 위치                                  |
| category            | VARCHAR(100) | NOT NULL                                      | 카테고리                              |
| business_number     | VARCHAR(20)  | NOT NULL, UNIQUE                              | 사업자등록번호                        |
| verification_status | VARCHAR(20)  | NOT NULL DEFAULT 'pending', CHECK IN ('pending','verified','failed') | 검증 상태                             |
| created_at          | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 생성 시각                             |
| updated_at          | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 수정 시각 (트리거 자동)               |

**인덱스:**
- `idx_advertiser_profiles_user_id` ON (user_id)
- `idx_advertiser_profiles_business_number` ON (business_number)

---

### 5. campaigns

체험단 캠페인

| 컬럼              | 타입         | 제약조건                                      | 설명                                  |
| ----------------- | ------------ | --------------------------------------------- | ------------------------------------- |
| id                | UUID         | PK DEFAULT gen_random_uuid()                  | 캠페인 ID                             |
| advertiser_id     | UUID         | FK → profiles(id) ON DELETE CASCADE           | 광고주 ID                             |
| title             | VARCHAR(200) | NOT NULL                                      | 체험단명                              |
| recruitment_start | TIMESTAMPTZ  | NOT NULL                                      | 모집 시작일                           |
| recruitment_end   | TIMESTAMPTZ  | NOT NULL                                      | 모집 종료일                           |
| max_participants  | INTEGER      | NOT NULL, CHECK (max_participants > 0)        | 모집 인원                             |
| benefits          | TEXT         | NOT NULL                                      | 제공 혜택                             |
| store_info        | TEXT         | NOT NULL                                      | 매장 정보                             |
| mission           | TEXT         | NOT NULL                                      | 미션 내용                             |
| status            | VARCHAR(20)  | NOT NULL DEFAULT 'recruiting', CHECK IN ('recruiting','closed','completed') | 모집 상태                             |
| created_at        | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 생성 시각                             |
| updated_at        | TIMESTAMPTZ  | NOT NULL DEFAULT NOW()                        | 수정 시각 (트리거 자동)               |

**인덱스:**
- `idx_campaigns_advertiser_id` ON (advertiser_id)
- `idx_campaigns_status` ON (status)
- `idx_campaigns_created_at` ON (created_at DESC)
- `idx_campaigns_recruitment_dates` ON (recruitment_start, recruitment_end)

---

### 6. applications

체험단 지원 내역

| 컬럼        | 타입        | 제약조건                                      | 설명                                  |
| ----------- | ----------- | --------------------------------------------- | ------------------------------------- |
| id          | UUID        | PK DEFAULT gen_random_uuid()                  | 지원 ID                               |
| campaign_id | UUID        | FK → campaigns(id) ON DELETE CASCADE          | 캠페인 ID                             |
| user_id     | UUID        | FK → profiles(id) ON DELETE CASCADE           | 지원자 ID                             |
| message     | TEXT        | NOT NULL                                      | 각오 한마디                           |
| visit_date  | DATE        | NOT NULL                                      | 방문 예정일                           |
| status      | VARCHAR(20) | NOT NULL DEFAULT 'pending', CHECK IN ('pending','selected','rejected') | 지원 상태                             |
| created_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                        | 생성 시각                             |
| updated_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                        | 수정 시각 (트리거 자동)               |

**제약조건:**
- UNIQUE(campaign_id, user_id) — 중복 지원 방지

**인덱스:**
- `idx_applications_campaign_id` ON (campaign_id)
- `idx_applications_user_id` ON (user_id)
- `idx_applications_status` ON (status)
- `idx_applications_user_status` ON (user_id, status)

---

## ERD 관계도

```
auth.users (Supabase Auth)
    ↓ 1:1
profiles (id, name, phone, email, role, terms_agreed_at)
    ↓
    ├─ 1:1 → influencer_profiles (user_id, birth_date)
    │         ↓ 1:N
    │         influencer_channels (user_id, platform, channel_name, channel_url, status)
    │
    ├─ 1:1 → advertiser_profiles (user_id, company_name, location, category, business_number, verification_status)
    │         ↓ 1:N
    │         campaigns (advertiser_id, title, recruitment_start, recruitment_end, max_participants, benefits, store_info, mission, status)
    │
    └─ 1:N → applications (user_id, campaign_id, message, visit_date, status)
                ↑ N:1
            campaigns
```

---

## 인덱스 전략

### 조회 성능 최적화

1. **역할 기반 조회**: `profiles.role` 인덱스
2. **이메일 검색**: `profiles.email` 인덱스
3. **모집 중 체험단 조회**: `campaigns.status` + `campaigns.created_at DESC`
4. **지원 목록 조회**: `applications.user_id` + `applications.status` 복합 인덱스
5. **광고주 체험단 관리**: `campaigns.advertiser_id` 인덱스
6. **채널 검증 상태**: `influencer_channels.status` 인덱스

---

## 제약조건

### 데이터 무결성 보장

1. **역할 제한**: `profiles.role` CHECK IN ('advertiser', 'influencer')
2. **플랫폼 제한**: `influencer_channels.platform` CHECK IN ('naver', 'youtube', 'instagram', 'threads')
3. **검증 상태**: CHECK IN ('pending', 'verified', 'failed')
4. **캠페인 상태**: `campaigns.status` CHECK IN ('recruiting', 'closed', 'completed')
5. **지원 상태**: `applications.status` CHECK IN ('pending', 'selected', 'rejected')
6. **중복 지원 방지**: `applications` UNIQUE(campaign_id, user_id)
7. **사업자번호 중복 방지**: `advertiser_profiles.business_number` UNIQUE
8. **모집 인원 양수**: `campaigns.max_participants` CHECK (> 0)
9. **CASCADE 삭제**: 모든 FK에 ON DELETE CASCADE 적용

---

## SQL 마이그레이션

### 트리거: updated_at 자동 갱신

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON influencer_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 주요 설계 원칙

1. **최소 스펙**: 유저플로우에 명시된 데이터만 포함
2. **역할 기반 분리**: 인플루언서/광고주 프로필 테이블 분리
3. **정규화**: 1:N 관계 적절히 분리 (channels, campaigns, applications)
4. **타임스탬프**: 모든 테이블 created_at/updated_at + 자동 트리거
5. **제약조건**: CHECK, UNIQUE, FK로 데이터 무결성 강제
6. **인덱스**: 주요 조회 패턴 기반 인덱스 설계
7. **CASCADE**: 사용자 삭제 시 관련 데이터 자동 정리