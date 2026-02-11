---
name: commit
description: This skill should be used when the user asks to "commit changes", "/commit", "make a commit", "create commit", mentions "git commit", or needs to create a git commit with automatic message generation following Conventional Commits format.
version: 1.0.0
---

# Git 커밋 자동화

Git 커밋 자동화 skill - 변경사항을 분석하여 의미있는 커밋 메시지를 자동으로 생성하고 커밋합니다.

## 사용법
```
/commit
```

## 자동 수행 작업
1. `git status` - 변경된 파일 확인
2. `git diff` - 구체적인 변경 내용 분석
3. `git log` - 최근 커밋 스타일 분석
4. 커밋 메시지 자동 생성 (Conventional Commits 형식)
5. 관련 파일 staging
6. 커밋 생성 (Co-Authored-By: Claude 포함)

## 커밋 메시지 형식
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### Scope (선택)
- `backend`: 백엔드 코드
- `frontend`: 프론트엔드 코드
- `api`: API 관련
- `db`: 데이터베이스

## 사용 시나리오

### 기능 구현 완료
```kotlin
// PollService에 투표 집계 기능 추가
fun getVoteResults(pollId: Long): VoteResultDto { ... }
```
→ `/commit` → `feat(backend): Add vote result aggregation to PollService`

### 버그 수정
```kotlin
// JWT 토큰 만료 시간 버그 수정
val expiryDate = Date(System.currentTimeMillis() + jwtProperties.accessExpiry)
```
→ `/commit` → `fix(security): Correct JWT token expiry calculation`

### 리팩토링
```kotlin
// 중복 코드 제거
private fun validateBandMember(bandId: Long, userId: Long) { ... }
```
→ `/commit` → `refactor(backend): Extract band member validation logic`

## 주의사항
- 민감한 정보(.env, credentials) 자동 제외
- Pre-commit hook 자동 실행
- 커밋 전 변경사항 리뷰 가능
- 여러 파일을 논리적으로 그룹화하여 커밋

## GigHub 프로젝트 사용 예시

### Backend 기능 추가
```
작업: Poll 종료 자동화 스케줄러 추가
→ /commit
→ feat(backend): Add scheduled job for auto-closing polls
```

### Frontend UI 개선
```
작업: 투표 카드 반응형 디자인 개선
→ /commit
→ feat(frontend): Improve poll card responsive design
```

### 전체 기능 완성
```
작업: 실시간 투표 결과 기능 (backend + frontend)
→ /commit
→ feat: Add real-time vote result updates with WebSocket
```
