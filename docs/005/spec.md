# UC-005: 체험단 상세 조회

## Primary Actor

인플루언서 (등록 완료된 사용자)

## Precondition

- 사용자가 로그인되어 있음
- 인플루언서 프로필 등록이 완료됨
- 조회하려는 체험단이 모집 중 상태임

## Trigger

사용자가 홈 화면 또는 목록에서 체험단 카드를 클릭

## Main Scenario

1. 사용자가 체험단 카드를 클릭
2. FE가 체험단 ID를 포함한 상세 조회 요청을 BE에 전송
3. BE가 사용자 인증 및 권한 확인
4. BE가 Database에서 체험단 정보 조회 (campaigns, advertiser_profiles 조인)
5. Database가 체험단 상세 정보 반환 (제목, 설명, 모집기간, 혜택, 미션, 매장정보, 모집인원)
6. BE가 현재 지원 인원 조회
7. BE가 사용자의 지원 이력 확인 (중복 지원 방지)
8. BE가 인플루언서 프로필 검증 상태 확인
9. BE가 구조화된 상세 정보를 FE에 반환
10. FE가 체험단 상세 화면 렌더링
11. FE가 지원 가능 여부에 따라 지원 버튼 상태 설정

## Edge Cases

### E1: 존재하지 않는 체험단
- **조건**: 잘못된 ID 또는 삭제된 체험단 접근
- **처리**: 404 에러 반환, "체험단을 찾을 수 없습니다" 메시지 표시

### E2: 모집 종료된 체험단
- **조건**: 모집 기간이 종료되었거나 상태가 '모집중'이 아님
- **처리**: 상세는 표시하되 "모집 종료" 배지 표시, 지원 버튼 비활성화

### E3: 인플루언서 프로필 미완료
- **조건**: 사용자가 인플루언서 등록을 완료하지 않음
- **처리**: 상세는 표시하되 "인플루언서 등록 후 지원 가능" 메시지, 등록 페이지 링크 제공

### E4: 이미 지원한 체험단
- **조건**: 사용자가 해당 체험단에 이미 지원함
- **처리**: "지원 완료" 배지 표시, 지원 상태 표시 (대기중/선정/반려)

### E5: 모집 인원 마감
- **조건**: 현재 지원자 수가 모집 인원 이상
- **처리**: "모집 인원 마감" 배지 표시, 지원 버튼 비활성화

### E6: 광고주 본인 체험단
- **조건**: 광고주가 자신이 등록한 체험단 조회
- **처리**: 지원 버튼 대신 "관리" 버튼 표시, 관리 페이지로 이동 가능

### E7: 네트워크 오류
- **조건**: API 요청 실패 또는 타임아웃
- **처리**: 에러 메시지 표시, 재시도 버튼 제공

## Business Rules

### BR1: 접근 권한
- 로그인하지 않은 사용자는 상세 페이지를 볼 수 없음
- 인플루언서 프로필 미완료 시 지원 불가

### BR2: 지원 가능 조건
- 인플루언서 프로필 등록 완료
- 인플루언서 채널 검증 완료
- 모집 기간 내
- 중복 지원 불가
- 모집 인원 미달

### BR3: 정보 표시
- 체험단 제목, 설명, 모집기간, 혜택, 미션 내용
- 매장 정보 (업체명, 위치, 카테고리)
- 현재 지원 인원 / 모집 인원
- 광고주 기본 정보

### BR4: 상태 관리
- 모집 기간이 지나면 자동으로 '모집 종료' 처리
- 상태 변경은 실시간 반영

## Sequence Diagram

\`\`\`plantuml
@startuml
actor User
participant FE
participant BE
database Database

User -> FE: 체험단 카드 클릭
FE -> BE: GET /api/campaigns/:id (with auth token)
BE -> BE: 사용자 인증 검증
BE -> Database: SELECT campaign details\n(campaigns JOIN advertiser_profiles)
Database --> BE: 체험단 정보 반환
BE -> Database: SELECT COUNT(*) FROM applications\nWHERE campaign_id = :id
Database --> BE: 현재 지원 인원 반환
BE -> Database: SELECT * FROM applications\nWHERE campaign_id = :id\nAND user_id = :userId
Database --> BE: 사용자 지원 이력 반환
BE -> Database: SELECT * FROM influencer_profiles\nWHERE user_id = :userId
Database --> BE: 인플루언서 프로필 상태 반환
BE -> BE: 지원 가능 여부 판단\n(프로필 검증, 모집기간, 중복지원, 인원)
BE --> FE: 200 OK\n{campaign, applicantCount, canApply, applyStatus}
FE -> FE: 상세 화면 렌더링
FE -> FE: 지원 버튼 상태 설정\n(canApply 기반)
FE --> User: 체험단 상세 화면 표시
@enduml
\`\`\`