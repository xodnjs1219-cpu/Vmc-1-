# UC-005: 체험단 상세 조회 - 모듈화 설계

## 개요

### 필요 모듈 목록

#### Backend Layer

1. **src/features/campaigns/backend/schema.ts** (확장)
   - CampaignDetailPublicResponseSchema (인플루언서용 상세 정보)
   - CampaignDetailSchema (체험단 상세 정보)

2. **src/features/campaigns/backend/service.ts** (확장)
   - getCampaignDetailPublic: 인플루언서용 체험단 상세 조회
   - checkApplicationStatus: 지원 이력 확인
   - checkEligibility: 지원 가능 여부 판단

3. **src/features/campaigns/backend/route.ts** (확장)
   - GET /api/campaigns/:id 엔드포인트 (공개 상세 조회)

#### Frontend Layer

4. **src/features/campaigns/components/campaign-detail.tsx**
   - 인플루언서용 체험단 상세 페이지 컴포넌트
   - 체험단 정보 표시
   - 지원 버튼 (ApplicationForm 트리거)
   - 지원 가능 여부 안내

5. **src/features/campaigns/components/campaign-info-section.tsx**
   - 체험단 기본 정보 섹션
   - 제목, 카테고리, 모집 기간, 모집 인원 등

6. **src/features/campaigns/components/campaign-benefits-section.tsx**
   - 혜택 정보 섹션

7. **src/features/campaigns/components/campaign-mission-section.tsx**
   - 미션 정보 섹션

8. **src/features/campaigns/components/campaign-store-section.tsx**
   - 매장 정보 섹션 (지도 포함 가능)

9. **src/features/campaigns/components/eligibility-guard.tsx**
   - 지원 가능 여부 가드 컴포넌트
   - 조건 미충족 시 안내 메시지 표시

10. **src/features/campaigns/hooks/useCampaignPublicQuery.ts**
    - React Query useQuery 훅
    - GET /api/campaigns/:id 호출
    - 지원 가능 여부 포함

11. **src/features/campaigns/lib/dto.ts** (확장)
    - Backend schema 재노출

#### Page Layer

12. **src/app/campaigns/[id]/page.tsx**
    - 체험단 상세 페이지
    - 역할에 따라 분기 (광고주 vs 인플루언서)
    - 인플루언서: CampaignDetail 컴포넌트
    - 광고주: CampaignDetailAdvertiser 컴포넌트 (기능 9에서 구현)

---

## Diagram

```mermaid
graph TB
    subgraph Frontend
        A[CampaignDetailPage<br>/app/campaigns/[id]/page.tsx] -->|인플루언서| B[CampaignDetail<br>/features/campaigns/components/campaign-detail.tsx]
        B --> C[CampaignInfoSection]
        B --> D[CampaignBenefitsSection]
        B --> E[CampaignMissionSection]
        B --> F[CampaignStoreSection]
        B --> G[EligibilityGuard]
        B --> H[ApplicationForm<br>기능 6]
        B --> I[useCampaignPublicQuery<br>/features/campaigns/hooks/useCampaignPublicQuery.ts]
        I --> J[apiClient]
    end

    subgraph Backend
        J -->|GET /api/campaigns/:id| K[CampaignRoute<br>/features/campaigns/backend/route.ts]
        K --> L[CampaignDetailPublicResponseSchema<br>/features/campaigns/backend/schema.ts]
        K --> M[getCampaignDetailPublic<br>/features/campaigns/backend/service.ts]
        M --> N[Supabase Client]
        N --> O[(campaigns table)]
        N --> P[(advertiser_profiles - JOIN)]
        N --> Q[(applications - 지원 이력 확인)]
        N --> R[(influencer_profiles - 자격 확인)]
        M --> S[checkApplicationStatus]
        M --> T[checkEligibility]
        K --> U[respond]
    end

    subgraph Shared
        I --> V[DTO Re-export<br>/features/campaigns/lib/dto.ts]
    end

    U -->|200 OK| J
    G -->|지원 불가| W[안내 메시지 표시]
    G -->|지원 가능| H
```

---

## Implementation Plan

### 1. Backend Schema (`src/features/campaigns/backend/schema.ts` - 확장)

#### 구현 내용
- **CampaignDetailSchema**: 체험단 상세 정보
  - id: UUID
  - advertiser_id: UUID
  - title: string
  - category: string
  - recruitment_start: string
  - recruitment_end: string
  - max_participants: number
  - applicant_count: number (현재 신청 인원)
  - benefits: string
  - mission: string
  - store_info: string
  - status: 'recruiting' | 'closed' | 'completed'
  - created_at: string
  - advertiser: { company_name, location, category }

- **CampaignDetailPublicResponseSchema**: 인플루언서용 상세 응답
  - campaign: CampaignDetailSchema
  - can_apply: boolean (지원 가능 여부)
  - application_status?: 'pending' | 'selected' | 'rejected' (지원 이력)
  - ineligibility_reason?: string (지원 불가 사유)

#### Unit Test Cases
```typescript
describe('CampaignDetailPublicResponseSchema', () => {
  it('유효한 상세 응답을 파싱한다', () => {
    const input = {
      campaign: {
        id: 'uuid-1',
        title: '블로그 체험단',
        // ... other fields
      },
      can_apply: true,
      application_status: null,
      ineligibility_reason: null,
    };
    const result = CampaignDetailPublicResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('지원 불가 사유 포함', () => {
    const input = {
      campaign: { /* ... */ },
      can_apply: false,
      ineligibility_reason: '인플루언서 등록이 필요합니다',
    };
    const result = CampaignDetailPublicResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
```

---

### 2. Backend Service (`src/features/campaigns/backend/service.ts` - 확장)

#### 구현 내용
- **getCampaignDetailPublic** 함수
  - campaign_id 기반 체험단 정보 조회
  - JOIN advertiser_profiles (광고주 정보 포함)
  - 현재 지원 인원 COUNT
  - user_id가 있으면 checkApplicationStatus, checkEligibility 호출

- **checkApplicationStatus** 함수
  - campaign_id + user_id 기반 지원 이력 조회
  - 반환: 'pending' | 'selected' | 'rejected' | null

- **checkEligibility** 함수
  - 지원 가능 여부 판단
  - 조건:
    - 인플루언서 프로필 등록 완료
    - 인플루언서 채널 검증 완료 (최소 1개 verified)
    - 모집 기간 내
    - 중복 지원 아님
    - 모집 인원 미달
  - 반환: { can_apply: boolean, reason?: string }

#### Unit Test Cases
```typescript
describe('getCampaignDetailPublic', () => {
  it('체험단 상세 조회 성공 (비로그인)', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await getCampaignDetailPublic(supabaseMock, 'campaign-uuid', null);

    expect(result.ok).toBe(true);
    expect(result.data.campaign).toBeDefined();
    expect(result.data.can_apply).toBe(false); // 비로그인
    expect(result.data.ineligibility_reason).toContain('로그인');
  });

  it('체험단 상세 조회 성공 (인플루언서)', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await getCampaignDetailPublic(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.ok).toBe(true);
    expect(result.data.can_apply).toBe(true);
  });

  it('존재하지 않는 체험단 시 CAMPAIGN_NOT_FOUND', async () => {
    const supabaseMock = createSupabaseMockWithNoCampaign();
    const result = await getCampaignDetailPublic(supabaseMock, 'invalid-uuid', null);

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(campaignErrorCodes.campaignNotFound);
  });
});

describe('checkEligibility', () => {
  it('모든 조건 충족 시 지원 가능', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await checkEligibility(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.can_apply).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('인플루언서 미등록 시 지원 불가', async () => {
    const supabaseMock = createSupabaseMockWithNoInfluencerProfile();
    const result = await checkEligibility(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.can_apply).toBe(false);
    expect(result.reason).toContain('인플루언서 등록');
  });

  it('채널 미검증 시 지원 불가', async () => {
    const supabaseMock = createSupabaseMockWithUnverifiedChannels();
    const result = await checkEligibility(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.can_apply).toBe(false);
    expect(result.reason).toContain('채널 검증');
  });

  it('이미 지원한 경우 지원 불가', async () => {
    const supabaseMock = createSupabaseMockWithExistingApplication();
    const result = await checkEligibility(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.can_apply).toBe(false);
    expect(result.reason).toContain('이미 지원');
  });

  it('모집 종료 시 지원 불가', async () => {
    const supabaseMock = createSupabaseMockWithClosedCampaign();
    const result = await checkEligibility(supabaseMock, 'campaign-uuid', 'user-uuid');

    expect(result.can_apply).toBe(false);
    expect(result.reason).toContain('모집 종료');
  });
});
```

---

### 3. Backend Route (`src/features/campaigns/backend/route.ts` - 확장)

#### 구현 내용
- GET /api/campaigns/:id
  - campaign_id 파라미터 추출
  - user_id를 인증 컨텍스트에서 추출 (선택적, 비로그인 가능)
  - getCampaignDetailPublic 서비스 호출
  - 성공 시 200 OK + CampaignDetailPublicResponse
  - 인증 불필요 (공개 API)

#### Unit Test Cases (Integration Test)
```typescript
describe('GET /api/campaigns/:id', () => {
  it('체험단 상세 조회 성공 (비로그인)', async () => {
    const response = await request(app).get('/api/campaigns/campaign-uuid');

    expect(response.status).toBe(200);
    expect(response.body.campaign).toBeDefined();
    expect(response.body.can_apply).toBe(false);
  });

  it('체험단 상세 조회 성공 (인플루언서)', async () => {
    const response = await request(app)
      .get('/api/campaigns/campaign-uuid')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.can_apply).toBe(true);
  });

  it('존재하지 않는 체험단 시 404 에러', async () => {
    const response = await request(app).get('/api/campaigns/invalid-uuid');

    expect(response.status).toBe(404);
  });
});
```

---

### 4. Frontend Component (`src/features/campaigns/components/campaign-detail.tsx`)

#### 구현 내용
- 인플루언서용 체험단 상세 페이지
- CampaignInfoSection, BenefitsSection, MissionSection, StoreSection 통합
- EligibilityGuard 통합 (지원 가능 여부 판단)
- 지원 버튼 (ApplicationForm 트리거)
- 지원 상태 표시 (이미 지원한 경우)
- useCampaignPublicQuery 훅 사용

#### QA Sheet
| Test Case | Condition | Expected Behavior | Pass/Fail |
|-----------|-----------|-------------------|-----------|
| 체험단 정보 표시 | 유효한 데이터 | 모든 섹션 렌더링 | |
| 지원 가능 | can_apply: true | "지원하기" 버튼 활성화 | |
| 지원 불가 (미로그인) | user: null | "로그인이 필요합니다" 안내 표시 | |
| 지원 불가 (미등록) | 인플루언서 미등록 | "인플루언서 등록 후 지원 가능합니다" 안내 | |
| 지원 불가 (미검증) | 채널 미검증 | "채널 검증 후 지원 가능합니다" 안내 | |
| 이미 지원 | application_status: 'pending' | "지원 완료" 배지, 버튼 비활성화 | |
| 선정됨 | application_status: 'selected' | "선정됨" 녹색 배지 | |
| 반려됨 | application_status: 'rejected' | "반려됨" 회색 배지 | |
| 모집 종료 | status: 'closed' | "모집 종료" 배지, 버튼 비활성화 | |
| 모집 인원 마감 | applicant_count >= max_participants | "모집 인원 마감" 배지 | |

---

### 5-8. Section Components

#### CampaignInfoSection
- 체험단명, 카테고리, 모집 기간, 모집 인원, 현재 신청 인원, 상태 표시
- 모집 진행률 프로그레스 바

#### CampaignBenefitsSection
- 혜택 내용 표시 (텍스트 포맷팅)

#### CampaignMissionSection
- 미션 내용 표시 (텍스트 포맷팅)

#### CampaignStoreSection
- 매장 정보 표시 (주소, 연락처)
- 지도 임베드 (향후 구현)
- 광고주 정보 (업체명, 위치, 카테고리)

---

### 9. Frontend Component (`src/features/campaigns/components/eligibility-guard.tsx`)

#### 구현 내용
- 지원 가능 여부 판단 컴포넌트
- can_apply: false인 경우 안내 메시지 표시
- 조건별 안내:
  - 비로그인: "로그인이 필요합니다" + 로그인 버튼
  - 인플루언서 미등록: "인플루언서 등록 후 지원 가능합니다" + 등록 페이지 링크
  - 채널 미검증: "채널 검증 후 지원 가능합니다" + 프로필 페이지 링크
  - 이미 지원: "이미 지원하신 체험단입니다" + 내 지원 목록 링크
  - 모집 종료: "모집이 종료되었습니다"
  - 모집 인원 마감: "모집 인원이 마감되었습니다"

#### QA Sheet
| Test Case | Reason | Expected Behavior | Pass/Fail |
|-----------|--------|-------------------|-----------|
| 비로그인 | "로그인이 필요합니다" | 로그인 버튼 표시 | |
| 미등록 | "인플루언서 등록" | 등록 페이지 링크 표시 | |
| 미검증 | "채널 검증" | 프로필 페이지 링크 표시 | |
| 이미 지원 | "이미 지원" | 내 지원 목록 링크 표시 | |
| 모집 종료 | "모집 종료" | 안내 메시지만 표시 | |

---

### 10. Frontend Hook (`src/features/campaigns/hooks/useCampaignPublicQuery.ts`)

#### 구현 내용
- useQuery 사용
- queryKey: ['campaigns', id, 'public']
- queryFn: GET /api/campaigns/:id via apiClient
- enabled: !!id
- 인증 선택적 (비로그인 가능)

#### Unit Test Cases
```typescript
describe('useCampaignPublicQuery', () => {
  it('체험단 상세 조회 성공', async () => {
    const { result } = renderHook(() => useCampaignPublicQuery('campaign-uuid'), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.campaign).toBeDefined();
  });

  it('존재하지 않는 체험단 시 에러', async () => {
    server.use(
      rest.get('/api/campaigns/:id', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: { code: 'CAMPAIGN_NOT_FOUND' } }));
      })
    );

    const { result } = renderHook(() => useCampaignPublicQuery('invalid-uuid'), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

### 12. Campaign Detail Page (`src/app/campaigns/[id]/page.tsx`)

#### 구현 내용
- campaign_id 파라미터 추출
- useCurrentUser 훅으로 역할 확인
- 역할에 따라 분기:
  - 광고주 + 본인 체험단: CampaignDetailAdvertiser (기능 9)
  - 인플루언서 또는 비로그인: CampaignDetail
- SEO 메타 태그 설정 (체험단명, 설명 등)

#### QA Sheet
| Test Case | Condition | Expected Behavior | Pass/Fail |
|-----------|-----------|-------------------|-----------|
| 비로그인 사용자 | user: null | CampaignDetail 렌더링, 지원 불가 안내 | |
| 인플루언서 | role: 'influencer' | CampaignDetail 렌더링 | |
| 광고주 + 본인 체험단 | role: 'advertiser', is_owner: true | CampaignDetailAdvertiser 렌더링 (기능 9) | |
| 광고주 + 타인 체험단 | role: 'advertiser', is_owner: false | CampaignDetail 렌더링 (지원 불가) | |
| 존재하지 않는 체험단 | 404 | "체험단을 찾을 수 없습니다" 에러 페이지 | |

---

## 구현 순서

1. Backend Schema 확장 (CampaignDetailPublicResponseSchema)
2. Backend Service 확장 (getCampaignDetailPublic, checkEligibility)
3. Backend Route 확장 (GET /api/campaigns/:id)
4. Frontend DTO 확장
5. Frontend Hook (useCampaignPublicQuery)
6. Frontend Section Components (InfoSection, BenefitsSection 등)
7. Frontend Component (EligibilityGuard)
8. Frontend Component (CampaignDetail)
9. Page Integration (campaigns/[id]/page.tsx)

---

## 추가 고려사항

### 지원 가능 조건
- 인플루언서 프로필 등록 완료
- 인플루언서 채널 검증 완료 (최소 1개 verified)
- 모집 기간 내
- 중복 지원 아님
- 모집 인원 미달

### 지원 상태 표시
- 신청완료: 회색 배지
- 선정: 녹색 배지
- 반려: 회색 배지

### 모집 진행률
- 프로그레스 바로 시각화
- (applicant_count / max_participants) * 100%

### 광고주 정보 표시
- 업체명, 위치, 카테고리
- 광고주 프로필 링크 (향후 구현)

### SEO 최적화
- 메타 태그: title, description, og:image
- 구조화된 데이터 (JSON-LD)
- 서버 사이드 렌더링 (Next.js SSR)

### 공유 기능 (향후 구현)
- 소셜 미디어 공유 버튼
- 링크 복사 버튼

### 접근 권한
- 공개 API (인증 불필요)
- 비로그인 사용자도 상세 조회 가능
- 지원은 로그인 + 인플루언서만 가능

### 캐싱 전략
- React Query 캐싱
- staleTime: 5분
- 지원 후 자동 리페치