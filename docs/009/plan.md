# UC-009: 광고주 체험단 상세 & 모집 관리 - 모듈화 설계

## 개요

### 필요 모듈 목록

#### Backend Layer

1. **src/features/campaigns/backend/schema.ts** (확장)
   - CampaignDetailResponseSchema (체험단 상세 + 지원자 목록)
   - ApplicantItemSchema (지원자 정보)
   - CampaignCloseRequestSchema (모집 종료)
   - CampaignSelectRequestSchema (체험단 선정)

2. **src/features/campaigns/backend/service.ts** (확장)
   - getCampaignDetail: 체험단 상세 조회 (권한 확인 포함)
   - getApplicants: 지원자 목록 조회 (JOIN applications + profiles + influencer_profiles)
   - closeCampaign: 모집 종료 (status: 'recruiting' → 'closed')
   - selectApplicants: 체험단 선정 (트랜잭션 처리)

3. **src/features/campaigns/backend/route.ts** (확장)
   - GET /api/campaigns/:id/detail 엔드포인트
   - PATCH /api/campaigns/:id/close 엔드포인트
   - POST /api/campaigns/:id/select 엔드포인트

#### Frontend Layer

4. **src/features/campaigns/components/campaign-detail-advertiser.tsx**
   - 광고주용 체험단 상세 페이지 컴포넌트
   - 체험단 정보 표시
   - 신청 현황 테이블 표시
   - 모집종료/체험단 선정 버튼

5. **src/features/campaigns/components/applicant-table.tsx**
   - 지원자 목록 테이블 컴포넌트
   - 체크박스 선택 기능 (선정용)
   - 정렬 기능

6. **src/features/campaigns/components/applicant-row.tsx**
   - 지원자 정보 행 컴포넌트
   - 이름, 채널 정보, 지원 일시, 각오 한마디, 방문 예정일자, 상태 표시

7. **src/features/campaigns/hooks/useCampaignDetailQuery.ts**
   - React Query useQuery 훅
   - GET /api/campaigns/:id/detail 호출

8. **src/features/campaigns/hooks/useCampaignCloseMutation.ts**
   - React Query useMutation 훅
   - PATCH /api/campaigns/:id/close 호출

9. **src/features/campaigns/hooks/useCampaignSelectMutation.ts**
   - React Query useMutation 훅
   - POST /api/campaigns/:id/select 호출

10. **src/features/campaigns/lib/dto.ts** (확장)
    - Backend schema 재노출

#### Page Layer

11. **src/app/campaigns/[id]/page.tsx** (수정)
    - 역할에 따라 분기 (광고주 vs 인플루언서)
    - 광고주: CampaignDetailAdvertiser 컴포넌트
    - 인플루언서: 기존 CampaignDetail 컴포넌트

---

## Diagram

```mermaid
graph TB
    subgraph Frontend
        A[CampaignDetailPage<br>/app/campaigns/[id]/page.tsx] -->|광고주| B[CampaignDetailAdvertiser<br>/features/campaigns/components/campaign-detail-advertiser.tsx]
        B --> C[ApplicantTable<br>/features/campaigns/components/applicant-table.tsx]
        C --> D[ApplicantRow<br>/features/campaigns/components/applicant-row.tsx]
        B --> E[useCampaignDetailQuery<br>/features/campaigns/hooks/useCampaignDetailQuery.ts]
        B --> F[useCampaignCloseMutation<br>/features/campaigns/hooks/useCampaignCloseMutation.ts]
        B --> G[useCampaignSelectMutation<br>/features/campaigns/hooks/useCampaignSelectMutation.ts]
        E --> H[apiClient]
        F --> H
        G --> H
    end

    subgraph Backend
        H -->|GET /api/campaigns/:id/detail| I[CampaignRoute<br>/features/campaigns/backend/route.ts]
        H -->|PATCH /api/campaigns/:id/close| I
        H -->|POST /api/campaigns/:id/select| I
        I --> J[CampaignDetailResponseSchema<br>/features/campaigns/backend/schema.ts]
        I --> K[getCampaignDetail<br>/features/campaigns/backend/service.ts]
        I --> L[closeCampaign<br>/features/campaigns/backend/service.ts]
        I --> M[selectApplicants<br>/features/campaigns/backend/service.ts]
        K --> N[Supabase Client]
        L --> N
        M --> N
        N --> O[(campaigns table)]
        N --> P[(applications table)]
        N --> Q[(profiles + influencer_profiles - JOIN)]
        M -.트랜잭션.-> R[BEGIN → UPDATE applications → UPDATE campaigns → COMMIT]
        I --> S[respond<br>/backend/http/response.ts]
    end

    S -->|200 OK / 4xx Error| H
    F -->|Success| T[상태 업데이트 & 성공 토스트]
    G -->|Success| U[선정 완료 & 지원자 상태 반영]
```

---

## Implementation Plan

### 1. Backend Schema (`src/features/campaigns/backend/schema.ts` - 확장)

#### 구현 내용
- **ApplicantItemSchema**: 지원자 정보
  - application_id: UUID
  - user_id: UUID
  - name: string
  - email: string
  - channels: Array<{ platform, name, url, status }>
  - message: string (각오 한마디)
  - planned_visit_date: string
  - application_status: 'pending' | 'selected' | 'rejected'
  - created_at: string

- **CampaignDetailResponseSchema**: 체험단 상세 응답
  - campaign: CampaignItemSchema (확장)
  - applicants: ApplicantItemSchema[]
  - is_owner: boolean (본인 체험단 여부)

- **CampaignCloseRequestSchema**: 모집 종료 요청
  - 빈 객체 (추가 데이터 불필요)

- **CampaignSelectRequestSchema**: 체험단 선정 요청
  - selected_application_ids: UUID[] (선정할 지원자 ID 배열)

#### Unit Test Cases
```typescript
describe('CampaignSelectRequestSchema', () => {
  it('유효한 선정 요청을 파싱한다', () => {
    const input = {
      selected_application_ids: ['uuid-1', 'uuid-2', 'uuid-3'],
    };
    const result = CampaignSelectRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('빈 배열이면 실패한다', () => {
    const input = { selected_application_ids: [] };
    const result = CampaignSelectRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('UUID가 아닌 값이 포함되면 실패한다', () => {
    const input = { selected_application_ids: ['invalid'] };
    const result = CampaignSelectRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
```

---

### 2. Backend Service (`src/features/campaigns/backend/service.ts` - 확장)

#### 구현 내용
- **getCampaignDetail** 함수
  - campaign_id 기반 체험단 정보 조회
  - 광고주 권한 확인 (advertiser_id === user_id)
  - 지원자 목록 조회 (getApplicants 호출)

- **getApplicants** 함수
  - campaign_id 기반 지원자 목록 조회
  - JOIN applications + profiles + influencer_profiles + influencer_channels
  - 최신순 정렬 (created_at ASC - 선착순 표시)

- **closeCampaign** 함수
  - campaign_id 기반 체험단 조회
  - 권한 확인 (본인 체험단인지)
  - 현재 상태 확인 (status === 'recruiting')
  - UPDATE campaigns SET status = 'closed'

- **selectApplicants** 함수 (트랜잭션 처리)
  - campaign_id 기반 체험단 조회
  - 권한 확인
  - 현재 상태 확인 (status === 'closed')
  - 선정 인원 검증 (selected_application_ids.length === max_participants)
  - BEGIN TRANSACTION
  - UPDATE applications SET status = 'selected' WHERE id IN (selected_ids)
  - UPDATE applications SET status = 'rejected' WHERE id NOT IN (selected_ids)
  - UPDATE campaigns SET status = 'completed'
  - COMMIT TRANSACTION

#### Unit Test Cases
```typescript
describe('getCampaignDetail', () => {
  it('체험단 상세 및 지원자 목록 조회 성공', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await getCampaignDetail(supabaseMock, 'campaign-uuid', 'advertiser-uuid');

    expect(result.ok).toBe(true);
    expect(result.data.campaign).toBeDefined();
    expect(result.data.applicants).toBeInstanceOf(Array);
    expect(result.data.is_owner).toBe(true);
  });

  it('타인의 체험단 접근 시 UNAUTHORIZED_ACCESS 반환', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await getCampaignDetail(supabaseMock, 'campaign-uuid', 'other-advertiser-uuid');

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(campaignErrorCodes.unauthorizedAccess);
  });
});

describe('closeCampaign', () => {
  it('모집 종료 성공', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await closeCampaign(supabaseMock, 'campaign-uuid', 'advertiser-uuid');

    expect(result.ok).toBe(true);
    expect(result.data.status).toBe('closed');
  });

  it('이미 종료된 체험단 시 에러', async () => {
    const supabaseMock = createSupabaseMockWithClosedCampaign();
    const result = await closeCampaign(supabaseMock, 'campaign-uuid', 'advertiser-uuid');

    expect(result.ok).toBe(false);
  });
});

describe('selectApplicants', () => {
  it('체험단 선정 성공 (트랜잭션)', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await selectApplicants(supabaseMock, 'campaign-uuid', 'advertiser-uuid', {
      selected_application_ids: ['uuid-1', 'uuid-2'],
    });

    expect(result.ok).toBe(true);
    expect(result.data.selected_count).toBe(2);
    expect(result.data.rejected_count).toBe(3);
  });

  it('선정 인원과 모집 인원이 불일치 시 에러', async () => {
    const supabaseMock = createSupabaseMock();
    const result = await selectApplicants(supabaseMock, 'campaign-uuid', 'advertiser-uuid', {
      selected_application_ids: ['uuid-1'], // 모집 인원 2명인데 1명만 선정
    });

    expect(result.ok).toBe(false);
  });

  it('모집중 상태에서 선정 시도 시 에러', async () => {
    const supabaseMock = createSupabaseMockWithRecruitingCampaign();
    const result = await selectApplicants(supabaseMock, 'campaign-uuid', 'advertiser-uuid', validInput);

    expect(result.ok).toBe(false);
  });
});
```

---

### 3. Backend Route (`src/features/campaigns/backend/route.ts` - 확장)

#### 구현 내용
- GET /api/campaigns/:id/detail
  - campaign_id 파라미터 추출
  - user_id 인증 컨텍스트에서 추출
  - getCampaignDetail 서비스 호출
  - 성공 시 200 OK + CampaignDetailResponse

- PATCH /api/campaigns/:id/close
  - campaign_id 파라미터 추출
  - user_id 인증 컨텍스트에서 추출
  - closeCampaign 서비스 호출
  - 성공 시 200 OK

- POST /api/campaigns/:id/select
  - campaign_id 파라미터 추출
  - 요청 바디를 CampaignSelectRequestSchema로 파싱
  - user_id 인증 컨텍스트에서 추출
  - selectApplicants 서비스 호출
  - 성공 시 200 OK

#### Unit Test Cases (Integration Test)
```typescript
describe('GET /api/campaigns/:id/detail', () => {
  it('체험단 상세 조회 성공', async () => {
    const response = await request(app).get('/api/campaigns/campaign-uuid/detail');

    expect(response.status).toBe(200);
    expect(response.body.campaign).toBeDefined();
    expect(response.body.applicants).toBeInstanceOf(Array);
  });

  it('타인의 체험단 접근 시 403 에러', async () => {
    const response = await request(app).get('/api/campaigns/campaign-uuid/detail');

    expect(response.status).toBe(403);
  });
});

describe('PATCH /api/campaigns/:id/close', () => {
  it('모집 종료 성공', async () => {
    const response = await request(app).patch('/api/campaigns/campaign-uuid/close');

    expect(response.status).toBe(200);
  });
});

describe('POST /api/campaigns/:id/select', () => {
  it('체험단 선정 성공', async () => {
    const response = await request(app).post('/api/campaigns/campaign-uuid/select').send({
      selected_application_ids: ['uuid-1', 'uuid-2'],
    });

    expect(response.status).toBe(200);
  });

  it('선정 인원 불일치 시 400 에러', async () => {
    const response = await request(app).post('/api/campaigns/campaign-uuid/select').send({
      selected_application_ids: ['uuid-1'], // 부족
    });

    expect(response.status).toBe(400);
  });
});
```

---

### 4. Frontend Component (`src/features/campaigns/components/campaign-detail-advertiser.tsx`)

#### 구현 내용
- 광고주용 체험단 상세 페이지
- 체험단 기본 정보 표시 (제목, 모집 기간, 혜택, 미션, 매장 정보, 상태)
- ApplicantTable 컴포넌트 통합
- 상태에 따른 버튼 표시:
  - 모집중: "모집종료" 버튼
  - 모집종료: "체험단 선정" 버튼
  - 선정완료: 버튼 없음, 최종 상태 표시
- 확인 다이얼로그 (모집종료, 체험단 선정)

#### QA Sheet
| Test Case | Condition | Expected Behavior | Pass/Fail |
|-----------|-----------|-------------------|-----------|
| 모집중 상태 | status: "recruiting" | "모집종료" 버튼 표시 | |
| 모집종료 상태 | status: "closed" | "체험단 선정" 버튼 표시 | |
| 선정완료 상태 | status: "completed" | 버튼 없음, "선정 완료" 안내 표시 | |
| 모집종료 버튼 클릭 | - | "모집을 종료하시겠습니까?" 다이얼로그 표시 | |
| 모집종료 확인 | 다이얼로그 확인 | 모집 종료 API 호출, 상태 업데이트 | |
| 체험단 선정 버튼 클릭 | 선정 인원 선택 | "선정을 확정하시겠습니까?" 다이얼로그 표시 | |
| 선정 확인 | 다이얼로그 확인 | 선정 API 호출, 지원자 상태 반영 | |
| 지원자 없음 | applicants.length === 0 | "지원자가 없습니다" 안내 | |

---

### 5. Frontend Component (`src/features/campaigns/components/applicant-table.tsx`)

#### 구현 내용
- 지원자 목록 테이블
- ApplicantRow 컴포넌트 반복 렌더링
- 체크박스 선택 기능 (모집종료 상태에서만 활성화)
- 전체 선택 체크박스
- 선정 인원 검증 (max_participants와 일치하는지)
- 상태별 정렬 및 필터

#### QA Sheet
| Test Case | User Action | Expected Behavior | Pass/Fail |
|-----------|-------------|-------------------|-----------|
| 전체 선택 체크박스 클릭 | 클릭 | 모든 지원자 선택/해제 | |
| 개별 체크박스 클릭 | 특정 지원자 선택 | 해당 지원자 선택 상태 변경 | |
| 선정 인원 초과 | max_participants 초과 선택 | "모집 인원은 N명입니다" 경고 표시 | |
| 선정 인원 부족 | max_participants 미달 선택 | "모집 인원과 일치해야 합니다" 경고 표시 | |
| 모집중 상태 | status: "recruiting" | 체크박스 비활성화 | |
| 선정완료 상태 | status: "completed" | 최종 상태만 표시, 체크박스 없음 | |

---

### 6. Frontend Component (`src/features/campaigns/components/applicant-row.tsx`)

#### 구현 내용
- 지원자 정보 행
- 표시 정보:
  - 체크박스 (선택 가능한 경우)
  - 지원자명
  - 채널 정보 (플랫폼 아이콘 + 채널명)
  - 지원 일시
  - 각오 한마디 (요약)
  - 방문 예정일자
  - 지원 상태 (신청완료 / 선정 / 반려)
- 상태별 색상 구분

#### QA Sheet
| Test Case | Condition | Expected Behavior | Pass/Fail |
|-----------|-----------|-------------------|-----------|
| 신청완료 상태 | status: "pending" | 회색 "신청완료" 배지 | |
| 선정 상태 | status: "selected" | 녹색 "선정" 배지 | |
| 반려 상태 | status: "rejected" | 빨간색 "반려" 배지 | |
| 채널 정보 표시 | 복수 채널 | 첫 번째 채널 표시 + "외 N개" | |
| 각오 한마디 요약 | message.length > 50 | "각오 한마디..." 형태로 표시 | |

---

### 7-9. Frontend Hooks

#### useCampaignDetailQuery
- GET /api/campaigns/:id/detail 호출
- queryKey: ['campaigns', id, 'detail']

#### useCampaignCloseMutation
- PATCH /api/campaigns/:id/close 호출
- onSuccess: 쿼리 무효화, 성공 토스트

#### useCampaignSelectMutation
- POST /api/campaigns/:id/select 호출
- onSuccess: 쿼리 무효화, 성공 토스트
- 트랜잭션 처리 완료 확인

---

### 10. Frontend DTO (`src/features/campaigns/lib/dto.ts` - 확장)

#### 구현 내용
```typescript
export {
  CampaignDetailResponseSchema,
  ApplicantItemSchema,
  CampaignCloseRequestSchema,
  CampaignSelectRequestSchema,
  type CampaignDetailResponse,
  type ApplicantItem,
  type CampaignCloseRequest,
  type CampaignSelectRequest,
} from '@/features/campaigns/backend/schema';
```

---

### 11. Campaign Detail Page (`src/app/campaigns/[id]/page.tsx` - 수정)

#### 구현 내용
- 역할에 따라 분기
  - 광고주: CampaignDetailAdvertiser 렌더링
  - 인플루언서: 기존 CampaignDetail 렌더링
- 권한 확인
  - 광고주: 본인 체험단만 접근 가능
  - 인플루언서: 모든 체험단 접근 가능

#### QA Sheet
| Test Case | Condition | Expected Behavior | Pass/Fail |
|-----------|-----------|-------------------|-----------|
| 광고주 + 본인 체험단 | role: 'advertiser', is_owner: true | CampaignDetailAdvertiser 렌더링 | |
| 광고주 + 타인 체험단 | role: 'advertiser', is_owner: false | 403 에러 또는 접근 거부 | |
| 인플루언서 | role: 'influencer' | 기존 CampaignDetail 렌더링 | |

---

## 구현 순서

1. Backend Schema 확장 (CampaignDetailResponseSchema, ApplicantItemSchema 등)
2. Backend Service 확장 (getCampaignDetail, closeCampaign, selectApplicants)
3. Backend Route 확장 (GET detail, PATCH close, POST select)
4. Frontend DTO 확장
5. Frontend Hooks (useCampaignDetailQuery, useCampaignCloseMutation, useCampaignSelectMutation)
6. Frontend Components (ApplicantRow → ApplicantTable → CampaignDetailAdvertiser)
7. Page Integration (campaigns/[id]/page.tsx 분기 처리)

---

## 추가 고려사항

### 트랜잭션 처리
- selectApplicants 함수에서 BEGIN/COMMIT 트랜잭션 사용
- 선정/반려 업데이트 + 체험단 상태 변경 원자적 처리
- 트랜잭션 실패 시 ROLLBACK

### 선정 인원 검증
- Frontend: 선택 시 실시간 검증
- Backend: API 호출 전 한 번 더 검증
- max_participants와 정확히 일치해야 함

### 동시성 문제
- 트랜잭션 격리 수준 설정
- 동시에 여러 선정 요청 발생 시 하나만 성공

### 지원자 개인정보
- 광고주에게만 제한적으로 노출 (이름, 이메일, 채널 정보)
- 민감 정보 (생년월일 등) 노출 제한

### 알림 (향후 구현)
- 모집 종료 시 지원자에게 알림
- 선정/반려 시 지원자에게 알림 발송

### 상태 전환 제약
- 모집중 → 모집종료 → 선정완료 순서 강제
- 역방향 전환 불가

### 지원자 없을 때 처리
- 모집 종료는 가능
- 선정은 불가능 (지원자 없음 안내)