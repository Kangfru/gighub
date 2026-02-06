# 🎸 GigHub

**밴드 합주곡 투표 시스템** - 밴드 멤버들이 함께 다음 합주곡을 투표로 결정하는 웹 애플리케이션

> "Gig"(공연) + "Hub"(중심지) = GitHub에서 영감을 받은 협업 플랫폼

## 📋 목차

- [주요 기능](#-주요 기능)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [로컬 개발 환경](#-로컬-개발-환경)
- [배포](#-배포)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)

---

## ✨ 주요 기능

### 🎵 밴드 & 멤버십
- **초대 코드 기반 가입**: 밴드별 초대 코드로 멤버 관리
- **역할 기반 권한**: LEADER(리더)와 MEMBER(멤버) 역할 구분
- **멀티 밴드 지원**: 한 사용자가 여러 밴드에 소속 가능

### 📊 투표 시스템
- **투표 생성**: 모든 멤버가 투표를 생성할 수 있음
- **곡 제안**: YouTube 링크와 함께 곡 제안
- **다중 투표**: 한 투표에서 여러 곡에 투표 가능
- **실시간 결과**: 투표 결과를 실시간으로 확인

### 🔐 보안
- **JWT 인증**: Access Token + Refresh Token
- **CORS 보호**: Same-Origin 정책
- **Private Network**: Railway Private Network 사용 (백엔드 노출 방지)
- **Nginx 프록시**: 백엔드 URL이 브라우저에 노출되지 않음

---

## 🛠 기술 스택

### Backend
```
Language    : Kotlin 2.2.21
Framework   : Spring Boot 4.0.2
Security    : Spring Security + JWT
ORM         : Spring Data JPA
Database    : PostgreSQL 17
Build       : Gradle 9.3.0 (Kotlin DSL)
```

### Frontend
```
Build Tool  : Vite 7.x
Language    : TypeScript 5.9.x
Styling     : Tailwind CSS 4.x
Framework   : Vanilla JS (No React/Vue)
HTTP Client : Fetch API
Server      : Nginx (Alpine)
```

### Infrastructure
```
Deployment  : Railway.app
Database    : PostgreSQL (Railway)
Networking  : Railway Private Network
CI/CD       : GitHub Actions (Railway auto-deploy)
```

---

## 🏗 아키텍처

### Production 구조 (Railway)

```
┌─────────────────────────────────────────────────────────────┐
│                        Railway.app                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [PostgreSQL Service]                                       │
│       │                                                     │
│       │ Private Network                                     │
│       ▼                                                     │
│  [Backend Service]                                          │
│   - Spring Boot                                             │
│   - Port: 8080                                              │
│       ▲                                                     │
│       │ Private Network (http://backend.railway.internal)   │
│       │                                                     │
│  [Frontend Service]                                         │
│   - Nginx Proxy                                             │
│   - Port: Dynamic                                           │
│       │                                                     │
│       │ /api/* → Backend (Private Network)                 │
│       │                                                     │
└───────┼─────────────────────────────────────────────────────┘
        │
        │ Public HTTPS
        ▼
   [사용자 브라우저]
```

### 요청 흐름

```
브라우저
  ↓ (HTTPS, Same-Origin)
Nginx (Frontend)
  ↓ (/api/* 프록시)
Spring Boot (Backend - Private Network)
  ↓
PostgreSQL (Private Network)
```

**장점**:
- 🔒 백엔드 URL이 브라우저에 노출되지 않음
- 🚀 Private Network로 빠른 내부 통신
- 🛡️ Same-Origin으로 CORS 복잡도 감소

---

## 💻 로컬 개발 환경

### 필요 사항
- **JDK 21+** (현재 시스템: JDK 25)
- **Node.js 22+**
- **Docker & Docker Compose** (PostgreSQL용)

### 1. 데이터베이스 시작 (Docker)

```bash
# PostgreSQL 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f postgres

# 중지
docker-compose down
```

### 2. 백엔드 실행

```bash
cd backend

# 로컬 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 테스트
./gradlew test

# 빌드
./gradlew build
```

**설정 파일**: `backend/src/main/resources/application-local.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gighub
    username: gighub
    password: gighub123

jwt:
  secret: local-dev-secret-key-change-in-production
```

**주의**: `application-local.yml`은 `.gitignore`에 포함되어 있습니다 (커밋되지 않음).

### 3. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

**Vite 프록시 설정**: `vite.config.ts`
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

### 4. 전체 스택 실행

```bash
# 터미널 1 - 데이터베이스
docker-compose up

# 터미널 2 - 백엔드 (http://localhost:8080)
cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'

# 터미널 3 - 프론트엔드 (http://localhost:3000)
cd frontend && npm run dev
```

**접속**: http://localhost:3000
- 프론트엔드가 `/api/*` 요청을 백엔드(`localhost:8080`)로 프록시

---

## 🚀 배포

### Railway 배포 구조

**3개의 서비스**:
1. **PostgreSQL**: 데이터베이스
2. **Backend**: Spring Boot (Dockerfile 기반)
3. **Frontend**: Nginx (Dockerfile 기반)

### Backend 환경 변수

Railway Backend 서비스에 설정:
```bash
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<Railway에서 자동 생성>
JWT_SECRET=<openssl rand -base64 64>
FRONTEND_URL=https://live-gighub.up.railway.app
PORT=8080
```

### Frontend 환경 변수

환경 변수 **불필요** (Nginx 프록시 사용)

### 배포 방법

1. **GitHub에 Push**
   ```bash
   git push origin main
   ```

2. **Railway 자동 배포**
   - GitHub 연동으로 자동 빌드 및 배포
   - Dockerfile 기반 빌드

3. **배포 확인**
   - Frontend: https://live-gighub.up.railway.app
   - Backend: Private Network (외부 접근 불가)

### 트러블슈팅

**로그 확인**:
```bash
# Railway 대시보드에서 각 서비스 로그 확인
- Backend: Spring Boot 로그 + SQL 쿼리 + 요청/응답 헤더
- Frontend: Nginx 로그 (error log만 출력)
- PostgreSQL: 연결 로그
```

**일반적인 문제**:
- ❌ CORS 에러 → Backend `FRONTEND_URL` 환경 변수 확인
- ❌ DB 연결 실패 → `DB_*` 환경 변수 확인
- ❌ JWT 에러 → `JWT_SECRET` 길이 확인 (256bit 이상)
- ❌ DNS resolve 실패 → Nginx resolver 설정 확인

---

## 📁 프로젝트 구조

```
gighub/
├── backend/                      # Kotlin + Spring Boot
│   ├── src/main/kotlin/com/gighub/
│   │   ├── domain/              # Entity + Repository + Service
│   │   │   ├── user/
│   │   │   ├── band/
│   │   │   ├── poll/
│   │   │   └── common/
│   │   ├── web/                 # Controller + DTO
│   │   │   ├── auth/
│   │   │   ├── band/
│   │   │   ├── poll/
│   │   │   └── vote/
│   │   ├── config/              # Spring 설정
│   │   ├── security/            # JWT + Security
│   │   └── exception/           # Exception Handling
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-local.yml
│   │   ├── application-test.yml
│   │   ├── application-prod.yml
│   │   └── logback-spring.xml
│   ├── build.gradle.kts
│   └── Dockerfile
│
├── frontend/                     # TypeScript + Vite
│   ├── src/
│   │   ├── api/                 # API 클라이언트
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── components/          # UI 컴포넌트
│   │   ├── utils/               # 유틸리티
│   │   ├── main.ts
│   │   └── style.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf               # Nginx 설정
│   └── Dockerfile
│
├── docker-compose.yml           # 로컬 PostgreSQL
├── CLAUDE.md                    # 프로젝트 명세서
├── DEPLOYMENT.md                # 배포 가이드
└── README.md                    # 이 파일
```

---

## 📚 API 문서

### 인증 (Authentication)

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "instrument": "기타",
  "inviteCode": "uuid-code"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 밴드 (Bands)

#### 내 밴드 목록
```http
GET /api/bands/me
Authorization: Bearer {accessToken}
```

#### 밴드 생성
```http
POST /api/bands
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "록밴드",
  "description": "주말마다 합주하는 밴드"
}
```

#### 초대 코드 생성 (LEADER만)
```http
POST /api/bands/{bandId}/invite-codes
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "expiresInDays": 30,
  "role": "MEMBER"
}
```

### 투표 (Polls)

#### 투표 생성
```http
POST /api/bands/{bandId}/polls
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "다음 합주곡 투표",
  "description": "이번 주 합주할 곡을 정해봅시다",
  "startDate": "2026-02-06T00:00:00",
  "endDate": "2026-02-13T23:59:59"
}
```

#### 곡 제안
```http
POST /api/polls/{pollId}/songs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "artist": "버즈",
  "title": "가시",
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "description": "좋은 연습곡입니다"
}
```

#### 투표하기
```http
POST /api/votes
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "songId": 123
}
```

더 자세한 API 문서는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 개인 학습 프로젝트입니다.

---

## 👤 개발자

**Kangfru** - [GitHub](https://github.com/Kangfru)

---

## 🙏 감사의 말

- Spring Boot 4.0 for modern Java development
- Railway.app for seamless deployment
- Tailwind CSS for beautiful styling
- Claude Code for development assistance

---

## 📮 문의

프로젝트에 대한 질문이나 제안이 있으시면 [Issues](https://github.com/Kangfru/gighub/issues)에 남겨주세요.
