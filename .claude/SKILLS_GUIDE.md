# Claude Code Skills 가이드

이 문서는 GigHub 프로젝트에서 유용하게 사용할 수 있는 Claude Code Skills를 정리한 가이드입니다.

## 📌 Skills란?

Skills는 Claude Code에 내장된 특수 명령어로, `/` 로 시작합니다. 슬래시 명령어를 입력하면 해당 작업을 자동화된 워크플로우로 실행합니다.

## 🎯 GigHub 프로젝트에 유용한 Skills

### 1. `/commit` - Git 커밋 자동화

**목적:** 변경사항을 분석하여 의미있는 커밋 메시지를 자동 생성하고 커밋

**사용 시나리오:**
- ✅ 기능 구현 완료 후
- ✅ 버그 수정 후
- ✅ 리팩토링 완료 후
- ✅ 문서 업데이트 후

**사용 방법:**
```bash
/commit
```

**자동으로 수행되는 작업:**
1. `git status` - 변경된 파일 확인
2. `git diff` - 구체적인 변경 내용 확인
3. `git log` - 최근 커밋 스타일 분석
4. 변경사항 분석 및 커밋 메시지 초안 작성
5. 관련 파일 staging (`git add`)
6. 커밋 생성 (Co-Authored-By: Claude 포함)

**커밋 메시지 형식:**
```
feat(backend): Add song suggestion API endpoint

Implement POST /api/polls/{pollId}/songs endpoint for band members
to suggest songs for polls with YouTube links.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**예시 대화:**
```
사용자: "PollService에 투표 집계 로직 추가했어"
Claude: (코드 확인 후)
사용자: "/commit"
Claude: (자동 커밋 수행)
```

**주의사항:**
- 민감한 정보(.env, credentials 등)는 자동으로 제외됨
- Pre-commit hook이 있으면 자동 실행됨
- 커밋 전에 변경사항을 리뷰할 수 있음

---

### 2. `/review-pr` - Pull Request 리뷰

**목적:** GitHub Pull Request를 분석하고 코드 리뷰 제공

**사용 시나리오:**
- ✅ PR 머지 전 코드 품질 확인
- ✅ 잠재적 버그나 이슈 발견
- ✅ 코드 스타일 일관성 검토
- ✅ 보안 취약점 확인

**사용 방법:**
```bash
/review-pr <PR 번호>
/review-pr 123
```

**제공되는 리뷰 내용:**
- 코드 품질 분석
- 잠재적 버그 및 이슈
- 성능 개선 제안
- 보안 취약점 검토
- 테스트 커버리지 확인
- 문서화 필요 여부

**예시:**
```bash
/review-pr 42
```

**활용 팁:**
- PR 생성 후 셀프 리뷰용으로 활용
- 팀원에게 리뷰 요청 전에 미리 확인
- 주요 기능 추가나 리팩토링 시 필수 체크

---

## 🔧 기타 유용한 Skills

### `/help`
Claude Code 사용법 및 도움말 표시

### `/clear`
현재 대화 기록 초기화

---

## 💡 실전 워크플로우

### 워크플로우 1: 기능 개발
```
1. 기능 구현
2. 테스트 작성 및 실행
3. /commit  ← 자동 커밋
4. git push
5. PR 생성
6. /review-pr <번호>  ← 셀프 리뷰
7. 필요시 수정
8. /commit  ← 수정사항 커밋
```

### 워크플로우 2: 버그 수정
```
1. 버그 재현 및 원인 파악
2. 코드 수정
3. 테스트 추가
4. /commit  ← "fix: ..." 자동 생성
5. git push
```

### 워크플로우 3: 리팩토링
```
1. 리팩토링 작업
2. 테스트 실행 (기능 유지 확인)
3. /commit  ← "refactor: ..." 자동 생성
4. /review-pr <번호>  ← 변경 영향 확인
```

---

## 📝 커밋 메시지 컨벤션 (Conventional Commits)

`/commit`이 자동으로 생성하는 커밋 메시지 형식:

### 타입
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `perf`: 성능 개선

### 스코프 (선택)
- `backend`: 백엔드 코드
- `frontend`: 프론트엔드 코드
- `api`: API 관련
- `db`: 데이터베이스 관련
- `security`: 보안 관련

### 예시
```
feat(backend): Add JWT refresh token rotation
fix(frontend): Resolve poll card date formatting issue
refactor(api): Simplify vote counting query
docs: Update API endpoint documentation
test(backend): Add integration tests for AuthService
```

---

## 🚀 시작하기

1. **첫 커밋 시도:**
   ```bash
   # 코드 수정 후
   /commit
   ```

2. **PR 리뷰 시도:**
   ```bash
   # PR 생성 후
   /review-pr <번호>
   ```

3. **도움말 확인:**
   ```bash
   /help
   ```

---

## 📚 더 알아보기

- Claude Code 공식 문서: https://github.com/anthropics/claude-code
- Conventional Commits: https://www.conventionalcommits.org/
