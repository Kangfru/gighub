# .claude 디렉토리

GigHub 프로젝트에서 사용하는 Claude Code skills와 agents 레퍼런스

## 📁 구조

```
.claude/
├── README.md                      # 이 파일
├── skills/                        # Claude Code Skills
│   ├── commit.md                  # /commit - Git 커밋 자동화
│   └── review-pr.md               # /review-pr - PR 리뷰
└── agents/                        # Claude Code Agents
    └── modern-java-expert.md      # 최신 Java/Kotlin 전문가
```

## 🎯 Skills

### /commit
Git 커밋 메시지를 자동으로 생성하고 커밋합니다.
→ [`skills/commit.md`](./skills/commit.md)

### /review-pr
GitHub Pull Request를 분석하고 코드 리뷰를 제공합니다.
→ [`skills/review-pr.md`](./skills/review-pr.md)

## 🤖 Agents

### modern-java-expert
JDK 21+ 및 Spring Boot 4.x 최신 기능을 활용한 코드 작성/개선
→ [`agents/modern-java-expert.md`](./agents/modern-java-expert.md)

**주요 기능:**
- Virtual Threads를 활용한 동시성 처리
- Pattern Matching을 통한 코드 간소화
- Spring Boot 4.x 최신 기능 활용

## 🚀 빠른 시작

### Skills 사용
```
# 코드 변경 후
/commit

# PR 생성 후
/review-pr 42
```

### Agent 사용
```
"이 코드를 Virtual Thread로 최적화해줘"
"Spring Boot 4.x의 새 기능으로 개선해줘"
```

## 💡 일반적인 워크플로우

### 1. 기능 개발
```
1. 기능 구현
2. 테스트 작성
3. /commit
4. git push
5. PR 생성
6. /review-pr <번호>
```

### 2. 성능 개선
```
1. "PollService를 modern-java-expert로 최적화해줘"
2. 코드 개선
3. 성능 테스트
4. /commit
```

### 3. 코드 리팩토링
```
1. "이 코드를 최신 Kotlin 기능으로 개선해줘"
2. modern-java-expert agent가 리팩토링
3. 테스트 실행
4. /commit
```

## 📚 더 알아보기

각 skill/agent의 상세 사용법은 해당 파일을 참조하세요:
- [commit.md](./skills/commit.md)
- [review-pr.md](./skills/review-pr.md)
- [modern-java-expert.md](./agents/modern-java-expert.md)
