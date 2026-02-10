# modern-java-expert

최신 Java/Kotlin 기능 활용 전문 agent

## 설명
JDK 21+의 최신 기능과 Spring Boot 3.5+/4.x 기능을 활용하여 코드를 작성하거나 개선하는 전문 agent입니다.

## GigHub 프로젝트 환경
- **Kotlin**: 2.2.21
- **Spring Boot**: 4.0.2
- **JDK**: 21+ (system: JDK 25)
- **주요 기술**: Virtual Threads, Pattern Matching, Spring Boot 4.x

## 사용법

직접 요청하면 자동으로 modern-java-expert agent가 호출됩니다:

```
"이 코드를 Virtual Thread를 사용하도록 리팩토링해줘"
"최신 Kotlin 기능을 활용해서 이 when 표현식을 개선해줘"
"Spring Boot 4.x의 새 기능으로 성능을 개선해줘"
```

## 주요 기능

### 1. Virtual Threads (Project Loom)
경량 스레드를 활용한 동시성 처리 개선

**예시 요청:**
```
"여러 밴드의 투표를 동시에 조회하는 API를 Virtual Thread로 최적화해줘"
```

**개선 전:**
```kotlin
@Service
class PollService {
    fun getMultipleBandPolls(bandIds: List<Long>): List<PollDto> {
        return bandIds.map { bandId ->
            pollRepository.findByBandId(bandId)
        }.flatten()
    }
}
```

**개선 후:**
```kotlin
@Service
class PollService(
    private val virtualThreadExecutor: Executor
) {
    fun getMultipleBandPolls(bandIds: List<Long>): List<PollDto> {
        return bandIds.map { bandId ->
            CompletableFuture.supplyAsync(
                { pollRepository.findByBandId(bandId) },
                virtualThreadExecutor
            )
        }.map { it.join() }.flatten()
    }
}
```

### 2. Pattern Matching
타입 체크와 캐스팅을 간결하게 처리

**예시 요청:**
```
"이 예외 처리 로직을 Pattern Matching으로 개선해줘"
```

**개선 전:**
```kotlin
fun handleException(ex: Exception): ErrorResponse {
    if (ex is GigHubException) {
        return ErrorResponse(ex.errorCode.code, ex.message)
    } else if (ex is IllegalArgumentException) {
        return ErrorResponse("INVALID_INPUT", ex.message)
    } else {
        return ErrorResponse("INTERNAL_ERROR", "An error occurred")
    }
}
```

**개선 후:**
```kotlin
fun handleException(ex: Exception): ErrorResponse = when (ex) {
    is GigHubException -> ErrorResponse(ex.errorCode.code, ex.message)
    is IllegalArgumentException -> ErrorResponse("INVALID_INPUT", ex.message)
    else -> ErrorResponse("INTERNAL_ERROR", "An error occurred")
}
```

### 3. Record Patterns
구조 분해를 통한 데이터 접근 간소화

**예시 요청:**
```
"이 DTO 변환 로직을 더 간결하게 만들어줘"
```

### 4. Structured Concurrency
구조화된 동시성 처리

**예시 요청:**
```
"여러 API를 동시에 호출하고 결과를 합치는 코드를 Structured Concurrency로 작성해줘"
```

### 5. Spring Boot 4.x 최신 기능

**예시 요청:**
```
"Spring Boot 4.x의 새로운 기능을 활용해서 API 응답 속도를 개선해줘"
"Spring Security의 최신 설정 방식으로 SecurityConfig를 업데이트해줘"
```

## GigHub 프로젝트 활용 시나리오

### 시나리오 1: 성능 최적화
```
현재 상황:
- BandService에서 여러 밴드의 멤버 정보를 순차적으로 조회
- 응답 시간이 느림

요청:
"BandService의 멤버 조회 로직을 Virtual Thread로 병렬화해서 성능을 개선해줘"

결과:
→ modern-java-expert agent가 Virtual Thread를 활용한 병렬 처리 코드 생성
→ 응답 시간 50% 감소
```

### 시나리오 2: 코드 간소화
```
현재 상황:
- PollService의 투표 상태 판단 로직이 복잡한 if-else 체인

요청:
"이 투표 상태 판단 로직을 최신 Kotlin when 표현식으로 리팩토링해줘"

결과:
→ 간결하고 읽기 쉬운 when 표현식으로 변환
→ 코드 라인 수 30% 감소
```

### 시나리오 3: 동시성 처리
```
현재 상황:
- 투표 집계 시 여러 데이터 소스를 조회해야 함
- 순차 처리로 인한 지연

요청:
"투표 집계 로직을 Structured Concurrency로 개선해서 여러 쿼리를 동시에 실행해줘"

결과:
→ 여러 쿼리를 안전하게 병렬 실행
→ 에러 처리 및 취소 로직 자동 포함
```

### 시나리오 4: 최신 프레임워크 기능 활용
```
현재 상황:
- Spring Boot 4.0.2로 업그레이드했지만 구버전 코드 사용 중

요청:
"Spring Boot 4.x의 새로운 기능을 활용해서 AuthController를 현대화해줘"

결과:
→ 최신 Spring Security 설정 적용
→ 새로운 애노테이션 및 설정 방식 적용
→ 더 간결하고 안전한 코드
```

## 사용 팁

### 1. 구체적인 요청
❌ "코드를 개선해줘"
✅ "이 서비스의 DB 조회를 Virtual Thread로 병렬화해줘"

### 2. 컨텍스트 제공
❌ "성능을 개선해줘"
✅ "PollService.getVoteResults()가 느린데, N+1 쿼리 문제가 있는 것 같아. 최신 기능으로 최적화해줘"

### 3. 점진적 개선
한 번에 전체를 리팩토링하기보다는:
1. 병목 지점 파악
2. 해당 부분만 개선
3. 테스트
4. 다음 부분 개선

### 4. 테스트 병행
```
1. modern-java-expert로 코드 개선
2. 기존 테스트 실행
3. 새로운 동시성 테스트 추가
4. 성능 측정 및 비교
```

## 주의사항

- Virtual Thread는 JDK 21+에서만 사용 가능 (현재 프로젝트 ✅)
- 기존 코드와의 호환성 확인 필요
- 성능 개선 전후 벤치마크 권장
- 팀원들이 최신 기능에 익숙한지 확인

## 언제 사용하는가?

### ✅ 사용하면 좋은 경우
- 성능 병목이 있는 경우
- 복잡한 조건 분기가 많은 경우
- 동시성 처리가 필요한 경우
- 코드 간소화가 필요한 경우
- 최신 프레임워크 기능을 활용하고 싶을 때

### ⚠️ 조심해야 하는 경우
- 레거시 코드를 대규모로 리팩토링할 때
- 팀원들이 최신 기능에 익숙하지 않을 때
- 안정성이 최우선인 프로덕션 코드

### ❌ 사용하지 않는 경우
- 간단한 CRUD 로직
- 이미 충분히 빠른 코드
- 테스트가 없는 코드 (테스트 먼저 작성)
