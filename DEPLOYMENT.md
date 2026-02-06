# GigHub 배포 가이드 (Railway)

## 🚂 Railway 배포 구조

```
Railway Project: GigHub
├─ 📦 PostgreSQL Database (Railway Plugin)
├─ 🔧 Backend Service (Spring Boot)
└─ 🎨 Frontend Service (Nginx)
```

---

## 📋 사전 준비

1. **Railway 계정**: https://railway.app 회원가입
2. **GitHub 연동**: Railway와 GitHub 계정 연결
3. **코드 푸시**: GitHub에 코드 커밋 & 푸시

---

## 🚀 배포 단계

### 1단계: Railway 프로젝트 생성

1. Railway 대시보드에서 **New Project** 클릭
2. **Deploy from GitHub repo** 선택
3. `gighub` 레포지토리 선택
4. 프로젝트 이름: `GigHub`

### 2단계: PostgreSQL 추가

1. 프로젝트 대시보드에서 **New** 클릭
2. **Database** → **PostgreSQL** 선택
3. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 3단계: Backend 서비스 배포

#### 3-1. 백엔드 서비스 생성
1. 프로젝트 대시보드에서 **New** → **GitHub Repo** 클릭
2. 같은 레포지토리 선택
3. 서비스 이름: `backend`

#### 3-2. 설정
**Settings** → **General**:
- **Root Directory**: `backend`
- **Custom Start Command**: (비워둠, Dockerfile 사용)

**Settings** → **Environment Variables**:
```bash
# Railway가 자동으로 연결
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 수동 추가
JWT_SECRET=your-secure-jwt-secret-key-minimum-256-bits-base64-encoded
FRONTEND_URL=https://gighub-frontend.up.railway.app
PORT=8080
```

#### 3-3. JWT Secret 생성 방법
```bash
# 터미널에서 실행
openssl rand -base64 64
```

#### 3-4. 배포
- **Deploy** 버튼 클릭
- 또는 자동 배포 (GitHub push 시)

### 4단계: Frontend 서비스 배포

#### 4-1. 프론트엔드 서비스 생성
1. 프로젝트 대시보드에서 **New** → **GitHub Repo** 클릭
2. 같은 레포지토리 선택
3. 서비스 이름: `frontend`

#### 4-2. 설정
**Settings** → **General**:
- **Root Directory**: `frontend`
- **Custom Start Command**: (비워둠, Dockerfile 사용)

**Settings** → **Environment Variables**:
```bash
# 백엔드 URL (백엔드 배포 후 URL 확인 후 입력)
VITE_API_URL=https://gighub-backend.up.railway.app
```

**⚠️ 중요**:
- 백엔드 서비스를 먼저 배포하고 URL을 확인한 후 설정해야 합니다
- Railway 도메인: `https://[service-name].up.railway.app`
- 또는 **Settings** → **Domains**에서 생성된 URL 확인

#### 4-3. 배포
- **Deploy** 버튼 클릭
- 빌드 시간: 약 2-3분

### 5단계: 도메인 확인 및 CORS 업데이트

#### 5-1. 각 서비스 도메인 확인
1. Backend 서비스 → **Settings** → **Domains**
   - 예: `https://gighub-backend.up.railway.app`
2. Frontend 서비스 → **Settings** → **Domains**
   - 예: `https://gighub-frontend.up.railway.app`

#### 5-2. 백엔드 환경 변수 업데이트
Backend 서비스 → **Variables**:
```bash
FRONTEND_URL=https://gighub-frontend.up.railway.app
```

#### 5-3. 프론트엔드 환경 변수 업데이트
Frontend 서비스 → **Variables**:
```bash
VITE_API_URL=https://gighub-backend.up.railway.app
```

⚠️ 환경 변수 변경 후 **재배포** 필요 (자동 재배포 또는 수동 Deploy)

---

## ✅ 배포 검증

### 1. 백엔드 Health Check
```bash
curl https://gighub-backend.up.railway.app/api/auth/health
```

### 2. 프론트엔드 접속
브라우저에서: `https://gighub-frontend.up.railway.app`

### 3. 기능 테스트
1. 회원가입 (초대 코드 없이)
2. 로그인
3. 밴드 생성
4. 초대 코드 생성

---

## 🔧 트러블슈팅

### 문제 1: 백엔드 빌드 실패
**원인**: Gradle 빌드 오류
**해결**:
```bash
# 로컬에서 빌드 테스트
cd backend
./gradlew clean build -x test
```

### 문제 2: DATABASE_URL 연결 실패
**원인**: PostgreSQL 서비스가 백엔드보다 늦게 시작
**해결**:
1. Railway 대시보드에서 PostgreSQL 서비스 먼저 시작 확인
2. Backend 서비스 재배포

### 문제 3: CORS 오류
**원인**: FRONTEND_URL 설정 누락 또는 잘못됨
**해결**:
1. 백엔드 환경 변수에서 `FRONTEND_URL` 확인
2. 프론트엔드 실제 도메인과 일치하는지 확인
3. 백엔드 재배포

### 문제 4: 프론트엔드에서 API 호출 실패
**원인**: `VITE_API_URL` 설정 오류
**해결**:
1. 프론트엔드 환경 변수 확인
2. 백엔드 URL이 올바른지 확인
3. 프론트엔드 **재배포** (환경 변수는 빌드 타임에 주입됨)

### 문제 5: JWT 오류
**원인**: `JWT_SECRET` 너무 짧거나 없음
**해결**:
```bash
# 256bit 이상 키 생성
openssl rand -base64 64
```

---

## 📊 Railway 비용

### 무료 티어 ($0/month)
- **제공**: $5 크레딧/월
- **제한**:
  - 500시간/월 실행 시간
  - 100GB 아웃바운드 네트워크
  - 공유 CPU/메모리
- **충분**: MVP 및 개인 프로젝트

### 예상 사용량
- PostgreSQL: ~$5/월
- Backend: ~$5/월
- Frontend: ~$5/월
- **총**: ~$15/월 (Hobby Plan 추천)

---

## 🔄 자동 배포 (CI/CD)

Railway는 GitHub 연동 시 **자동 배포** 지원:
- `main` 브랜치에 push → 자동 재배포
- Pull Request → Preview 환경 생성 (Pro Plan)

### 자동 배포 비활성화
**Settings** → **Deploys** → Auto Deploy **OFF**

---

## 🌐 커스텀 도메인 (선택)

### 도메인 연결
1. 도메인 구매 (예: Namecheap, GoDaddy)
2. Railway: **Settings** → **Domains** → **Custom Domain**
3. DNS 설정:
   - `CNAME` 레코드: `gighub.com` → `gighub-frontend.up.railway.app`
   - `CNAME` 레코드: `api.gighub.com` → `gighub-backend.up.railway.app`

---

## 📝 환경 변수 요약

### PostgreSQL (자동 생성)
- `DATABASE_URL`

### Backend
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://...` |
| `JWT_SECRET` | JWT 서명 키 (256bit+) | `openssl rand -base64 64` |
| `FRONTEND_URL` | 프론트엔드 URL | `https://gighub-frontend.up.railway.app` |
| `PORT` | 서버 포트 | `8080` |

### Frontend
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_URL` | 백엔드 API URL | `https://gighub-backend.up.railway.app` |

---

## 🎯 다음 단계

1. ✅ Railway 배포 완료
2. 도메인 구매 및 연결 (선택)
3. 모니터링 설정 (Railway Logs)
4. 백업 전략 수립 (PostgreSQL)
5. 성능 최적화

---

## 📚 참고 링크

- [Railway 공식 문서](https://docs.railway.app)
- [Railway Spring Boot 가이드](https://docs.railway.app/guides/spring-boot)
- [Railway Node.js 가이드](https://docs.railway.app/guides/nodejs)
