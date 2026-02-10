---
name: review-pr
description: This skill should be used when the user asks to "review pr", "review pull request", "/review-pr", mentions "pr review", "code review", or needs to analyze and review a GitHub Pull Request with detailed feedback.
version: 1.0.0
---

# Pull Request 코드 리뷰

GitHub Pull Request를 자동으로 분석하고 상세한 코드 리뷰를 제공합니다.

## 사용법
```
/review-pr <PR번호>
```

## 예시
```
/review-pr 42
/review-pr 123
```

## 리뷰 항목

### 1. 코드 품질
- 코드 가독성 및 명확성
- 네이밍 컨벤션 준수
- 코드 중복 확인
- 복잡도 분석

### 2. 기능 및 로직
- 구현 로직 정확성
- 엣지 케이스 처리
- 에러 핸들링
- 비즈니스 로직 검증

### 3. 성능
- N+1 쿼리 문제
- 불필요한 연산
- 메모리 사용 최적화
- 캐싱 기회

### 4. 보안
- SQL Injection 취약점
- XSS 취약점
- 인증/권한 검증
- 민감 정보 노출

### 5. 테스트
- 테스트 커버리지
- 테스트 케이스 충분성
- 엣지 케이스 테스트

### 6. 문서화
- 코드 주석 필요성
- API 문서 업데이트
- README 업데이트

## 사용 시나리오

### 시나리오 1: 새 기능 추가 PR
```
PR #45: feat(backend): Add song recommendation feature

→ /review-pr 45

리뷰 결과:
✅ 코드 품질: 양호
✅ 테스트: 통합 테스트 포함
⚠️ 성능: N+1 쿼리 가능성 (recommendations 조회)
⚠️ 문서: API 엔드포인트 문서 필요
```

### 시나리오 2: 버그 수정 PR
```
PR #52: fix(security): Resolve JWT token refresh issue

→ /review-pr 52

리뷰 결과:
✅ 버그 수정 확인
✅ 보안: 토큰 검증 로직 개선
⚠️ 테스트: 회귀 테스트 추가 권장
```

### 시나리오 3: 리팩토링 PR
```
PR #38: refactor(backend): Simplify permission check logic

→ /review-pr 38

리뷰 결과:
✅ 코드 간소화 확인
✅ 기존 기능 유지
✅ 테스트 통과
💡 제안: PermissionService를 @Component로 분리 고려
```

## GigHub 프로젝트 활용

### 머지 전 체크리스트
```
1. PR 생성
2. /review-pr <번호>
3. 리뷰 결과 확인 및 수정
4. 다시 /review-pr <번호> (필요시)
5. 팀원 리뷰 요청
6. 머지
```

### 셀프 리뷰 워크플로우
```
[기능 구현]
→ [git push]
→ [PR 생성]
→ /review-pr <번호>
→ [이슈 발견 시 수정]
→ [재검토]
→ [팀 리뷰 요청]
```

### 주요 PR 유형별 체크포인트

#### Backend API 추가
- [ ] API 엔드포인트 문서화
- [ ] 권한 검증 확인
- [ ] 에러 응답 처리
- [ ] 통합 테스트
- [ ] N+1 쿼리 확인

#### Frontend 페이지 추가
- [ ] 반응형 디자인
- [ ] 에러 처리 UI
- [ ] 로딩 상태 처리
- [ ] API 호출 에러 핸들링
- [ ] 접근성 (a11y)

#### Database 스키마 변경
- [ ] 마이그레이션 스크립트
- [ ] 기존 데이터 영향 확인
- [ ] 인덱스 추가 필요성
- [ ] 백업 계획

#### 보안 관련 변경
- [ ] 인증/권한 로직 검증
- [ ] 민감 정보 처리
- [ ] OWASP Top 10 확인
- [ ] 보안 테스트

## 주의사항
- PR 번호는 GitHub PR 번호 사용
- 대규모 PR은 리뷰 시간이 오래 걸릴 수 있음
- 리뷰 결과는 참고용이며, 최종 판단은 개발자의 몫
- 중요한 변경사항은 팀원 리뷰도 필수
