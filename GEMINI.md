# GigHub - Band Rehearsal Song Voting System

## Project Overview

GigHub is a voting system for band rehearsal song selection. Band members can create polls, suggest songs with YouTube links, and vote for their preferred rehearsal songs. The name combines "Gig" (performance) with "Hub" (central place), inspired by GitHub.

## Core Requirements

### User
- Email-based registration with invite code
- Each user can belong to multiple bands with different roles
- User can specify their instrument/role (기타, 베이스, 보컬, 드럼 등)

### Band & Membership
- Band has LEADER and MEMBER roles
- LEADER can:
  - Create invite codes
  - Manage band settings
  - Remove members
  - Delete any polls/songs
- MEMBER can:
  - Create polls
  - Suggest songs
  - Vote on songs
  - Leave the band

### Invite Code
- Each invite code is tied to a specific band
- Invite code has a role (LEADER or MEMBER)
- When user registers with invite code, they automatically join the band with specified role

### Poll & Voting
- Polls belong to a specific band
- Only band members can see and participate in polls
- All band members can create polls
- Users can vote for multiple songs in one poll
- Real-time vote counts visible to all band members

## Tech Stack

### Backend
```
Language: Kotlin 2.2.x
Framework: Spring Boot 4.0.x
Security: Spring Security + JWT
ORM: Spring Data JPA
Build Tool: Gradle Kotlin DSL
Database: PostgreSQL
Deployment: Railway.app
```

### Frontend
```
Build Tool: Vite
Language: TypeScript
Styling: Tailwind CSS
Framework: Vanilla JS (no React/Vue)
HTTP Client: Fetch API
Deployment: Vercel
```

### Database
```
PostgreSQL on Supabase (free tier)
- 500MB storage
- Sufficient for MVP
```

## Database Schema

### User
```kotlin
@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    val email: String,
    
    @Column(nullable = false)
    val password: String, // bcrypt hashed
    
    @Column(nullable = false)
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    val instrument: String? = null, // 기타, 베이스, 보컬, 드럼, 키보드 등
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

### Band
```kotlin
@Entity
@Table(name = "bands")
class Band(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

### BandMember (User와 Band 연결 테이블)
```kotlin
enum class BandRole {
    LEADER,  // 밴드 리더 - 모든 권한
    MEMBER   // 일반 팀원 - 투표 및 곡 제안 가능
}

@Entity
@Table(
    name = "band_members",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["band_id", "user_id"])
    ]
)
class BandMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "band_id", nullable = false)
    val band: Band,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val role: BandRole = BandRole.MEMBER,
    
    @Column(nullable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now()
)
```

### InviteCode
```kotlin
@Entity
@Table(name = "invite_codes")
class InviteCode(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    val code: String, // UUID
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "band_id", nullable = false)
    val band: Band, // 어느 밴드로 초대하는지
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val inviteRole: BandRole = BandRole.MEMBER, // 초대된 사람의 역할
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by_user_id")
    val usedByUser: User? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    val expiresAt: LocalDateTime
)
```

### Poll
```kotlin
@Entity
@Table(name = "polls")
class Poll(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "band_id", nullable = false)
    val band: Band, // 어느 밴드의 투표인지
    
    @Column(nullable = false)
    val title: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    val createdBy: User,
    
    @Column(nullable = false)
    val startDate: LocalDateTime,
    
    @Column(nullable = false)
    val endDate: LocalDateTime,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

### Song
```kotlin
@Entity
@Table(name = "songs")
class Song(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    val poll: Poll,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_by_user_id", nullable = false)
    val suggestedBy: User,

    @Column(nullable = false)
    val artist: String,

    @Column(nullable = false)
    val title: String,

    @Column
    val youtubeUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

### Vote
```kotlin
@Entity
@Table(
    name = "votes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "song_id"])
    ]
)
class Vote(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    val song: Song,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

## API Endpoints

### Authentication
```
POST /api/auth/register
- Body: { email, password, name, instrument?, inviteCode }
- Response: { accessToken, refreshToken, user, band }
- Note: inviteCode로 밴드 자동 가입

POST /api/auth/login
- Body: { email, password }
- Response: { accessToken, refreshToken, user, bands: [{ band, role }] }

POST /api/auth/refresh
- Body: { refreshToken }
- Response: { accessToken }

POST /api/auth/logout
- Header: Authorization: Bearer {token}
- Response: 204 No Content
```

### Bands
```
POST /api/bands
- Header: Authorization: Bearer {token}
- Body: { name, description? }
- Response: { band }
- Note: 생성한 사람이 자동으로 LEADER

GET /api/bands/me
- Header: Authorization: Bearer {token}
- Response: [{ band, role, members }]

GET /api/bands/{bandId}
- Header: Authorization: Bearer {token}
- Response: { band, members: [{ user, role }] }

PUT /api/bands/{bandId}
- Header: Authorization: Bearer {token}
- Body: { name, description? }
- Response: { band }
- Note: LEADER만 가능

DELETE /api/bands/{bandId}
- Header: Authorization: Bearer {token}
- Response: 204 No Content
- Note: LEADER만 가능
```

### Band Members
```
PATCH /api/bands/{bandId}/members/{userId}/role
- Header: Authorization: Bearer {token}
- Body: { role: "LEADER" | "MEMBER" }
- Response: { bandMember }
- Note: LEADER만 가능

DELETE /api/bands/{bandId}/members/{userId}
- Header: Authorization: Bearer {token}
- Response: 204 No Content
- Note: LEADER가 멤버 추방 또는 본인이 밴드 탈퇴

GET /api/bands/{bandId}/members
- Header: Authorization: Bearer {token}
- Response: [{ user, role, joinedAt }]
```

### Invite Codes
```
POST /api/bands/{bandId}/invite-codes
- Header: Authorization: Bearer {token}
- Body: { expiresInDays, role?: "LEADER" | "MEMBER" }
- Response: { code, expiresAt, role }
- Note: LEADER만 가능, role 기본값은 MEMBER

GET /api/bands/{bandId}/invite-codes
- Header: Authorization: Bearer {token}
- Response: [{ code, usedByUser?, createdAt, expiresAt, role }]
- Note: LEADER만 가능

DELETE /api/bands/{bandId}/invite-codes/{code}
- Header: Authorization: Bearer {token}
- Response: 204 No Content
- Note: LEADER만 가능
```

### Polls
```
POST /api/bands/{bandId}/polls
- Header: Authorization: Bearer {token}
- Body: { title, description?, startDate, endDate }
- Response: { poll }
- Note: 해당 밴드 멤버면 누구나 생성 가능

GET /api/bands/{bandId}/polls
- Header: Authorization: Bearer {token}
- Query: ?status=active|upcoming|ended
- Response: [{ poll, songs, voteCounts }]

GET /api/polls/{pollId}
- Header: Authorization: Bearer {token}
- Response: { poll, songs, votes, myVotes }

PUT /api/polls/{pollId}
- Header: Authorization: Bearer {token}
- Body: { title, description?, startDate, endDate }
- Response: { poll }
- Note: 생성자 또는 LEADER만 가능

DELETE /api/polls/{pollId}
- Header: Authorization: Bearer {token}
- Response: 204 No Content
- Note: 생성자 또는 LEADER만 가능
```

### Songs
```
POST /api/polls/{pollId}/songs
- Header: Authorization: Bearer {token}
- Body: { artist, title, youtubeUrl?, description? }
- Response: { song }
- Note: 해당 밴드 멤버면 누구나 곡 제안 가능

PUT /api/songs/{songId}
- Header: Authorization: Bearer {token}
- Body: { artist, title, youtubeUrl?, description? }
- Response: { song }
- Note: 제안자 또는 LEADER만 가능

DELETE /api/songs/{songId}
- Header: Authorization: Bearer {token}
- Response: 204 No Content
- Note: 제안자 또는 LEADER만 가능
```

### Votes
```
POST /api/votes
- Header: Authorization: Bearer {token}
- Body: { songId }
- Response: { vote }

DELETE /api/votes/{voteId}
- Header: Authorization: Bearer {token}
- Response: 204 No Content

GET /api/polls/{pollId}/votes/me
- Header: Authorization: Bearer {token}
- Response: [{ songId, voteId, createdAt }]
```

## Security Requirements

### Password
- Minimum 8 characters
- BCrypt hashing with strength 10

### JWT Token
- Access token: 1 hour expiry
- Refresh token: 7 days expiry
- Store refresh token in localStorage

### Invite Code
- UUID v4 format
- Default expiry: 30 days
- Single-use only (marked as used after registration)

## Frontend Structure

```
src/
├── index.html
├── main.ts
├── style.css
├── api/
│   ├── client.ts          # Fetch wrapper with auth
│   ├── auth.ts            # Auth API calls
│   ├── bands.ts           # Band API calls
│   ├── polls.ts           # Poll API calls
│   └── votes.ts           # Vote API calls
├── pages/
│   ├── login.ts           # Login page
│   ├── register.ts        # Registration page
│   ├── bands.ts           # Band list page (user's bands)
│   ├── band-detail.ts     # Band detail with polls
│   ├── polls.ts           # Poll list page
│   ├── poll-detail.ts     # Single poll view
│   ├── create-poll.ts     # Create poll form
│   └── band-settings.ts   # Band settings (for LEADER)
├── components/
│   ├── navbar.ts          # Navigation bar
│   ├── band-card.ts       # Band card component
│   ├── poll-card.ts       # Poll card component
│   ├── song-card.ts       # Song card with vote button
│   └── member-list.ts     # Band member list
└── utils/
    ├── router.ts          # Simple client-side routing
    ├── auth.ts            # Token management
    └── date.ts            # Date formatting utilities
```

## Monorepo Structure

```
gighub/
├── backend/                    # Kotlin + Spring Boot
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/
│   │   │   └── resources/
│   │   └── test/
│   ├── gradle/
│   └── gradlew
├── frontend/                   # Vite + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── style.css
│   │   ├── api/
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/
│   └── index.html
├── .github/
│   └── workflows/
│       ├── backend-ci.yml      # Backend CI/CD
│       └── frontend-ci.yml     # Frontend CI/CD
├── .gitignore
├── README.md
└── CLAUDE.md
```

## Local Development Environment

### Prerequisites
- JDK 21 or higher
- Node.js 22 or higher
- Docker & Docker Compose (for PostgreSQL)

### Database Setup (Docker)

Create `docker-compose.yml` in project root:
```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: gighub-postgres
    environment:
      POSTGRES_DB: gighub
      POSTGRES_USER: gighub
      POSTGRES_PASSWORD: gighub123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start database:
```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Backend Setup

Create `application-local.yml` in `backend/src/main/resources/`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gighub
    username: gighub
    password: gighub123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true

jwt:
  secret: local-dev-secret-key-change-in-production
  access-expiry: 3600000    # 1 hour
  refresh-expiry: 604800000  # 7 days

logging:
  level:
    com.gighub: DEBUG
    org.hibernate.SQL: DEBUG
```

Run backend:
```bash
cd backend

# Run with local profile
./gradlew bootRun --args='--spring.profiles.active=local'

# Run tests
./gradlew test

# Build
./gradlew build
```

### Frontend Setup

Create `.env.local` in `frontend/`:
```env
VITE_API_URL=http://localhost:8080
```

Create `vite.config.ts` with proxy and Tailwind CSS:
```typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

Run frontend:
```bash
cd frontend

# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Full Stack Development Workflow

```bash
# Terminal 1 - Database
docker-compose up

# Terminal 2 - Backend (http://localhost:8080)
cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'

# Terminal 3 - Frontend (http://localhost:3000)
cd frontend && npm run dev
```

Access application at: http://localhost:3000
- Frontend proxies `/api/*` requests to backend at `localhost:8080`
- Backend connects to PostgreSQL at `localhost:5432`

## Deployment

> 상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **Supabase** - PostgreSQL database

## Future Enhancements (Post-MVP)

- ~~Multi-workspace support (multiple bands)~~ ✅ Now included in MVP
- Poll templates
- Practice session history
- Song statistics (most voted, most practiced)
- Spotify integration alongside YouTube
- Mobile app (Kotlin Multiplatform)
- Real-time updates (WebSocket)
- Comments on songs
- Difficulty rating for songs
- Set list generation from poll results
- Band activity feed
- Member availability calendar for rehearsals

## Development Guidelines

### Code Style
- Kotlin: Follow official Kotlin coding conventions
- Use data classes for DTOs
- Prefer immutability
- Use named parameters for clarity

### Git Workflow
- Branch naming: `feature/{feature-name}`, `fix/{bug-name}`
- Commit messages: Conventional Commits format
  - `feat(backend): Add band entity`
  - `feat(frontend): Add band list page`
  - `fix(backend): Fix vote counting query`
  - `chore: Update CLAUDE.md`
- PR required for main branch
- Each PR can contain both frontend and backend changes
- CI runs tests for both when relevant files change

### Testing
- Unit tests for business logic
- Integration tests for repositories
- E2E tests for critical user flows

## Notes for Claude Code

- This is a **monorepo** with independent backend (Kotlin) and frontend (TypeScript)
- Backend and frontend have **separate build tools** (Gradle and npm)
- **No shared code** between backend and frontend - maintain types separately
- This is a learning project for backend engineer expanding to full-stack
- Prefer simple, straightforward implementations over complex patterns
- Focus on getting MVP working before optimization
- Use Kotlin idioms and Spring Boot best practices
- Frontend should be minimal but functional - prioritize functionality over aesthetics
- UI 텍스트는 한국어로 작성 (버튼, 라벨, 안내 문구, 에러 메시지 등 모두 한국어)
- Database queries should be optimized from the start (thinking of batch processing experience)
- When working on features, consider both backend and frontend changes together
- Deploy targets: Railway (backend) and Vercel (frontend) from same repository



## Success Metrics

- Users can register only with invite codes
- Users can create polls with multiple songs
- Users can vote for multiple songs in one poll
- Vote counts update in real-time
- Polls show active/upcoming/ended status correctly
- System handles at least 50 concurrent users (band + friends)
