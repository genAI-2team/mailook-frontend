# AGENTS.md — mAILOOK 프론트

이 파일은 mAILOOK **프론트**에서 작업하는 코딩 에이전트(Codex 등)가 먼저 읽는 안내서입니다. 백엔드 규칙은 백엔드 쪽 AGENTS.md에 따로 있습니다.
설계의 기준 문서는 Notion(요구사항 정의서, API 명세 초안, 계층구조 초안 — 프론트, 와이어프레임)이고, 이 파일은 그 요약입니다. 둘이 다르면 Notion을 따르고, 이 파일을 고쳐 주세요.

## 0. 브랜치 규칙 (작업 전에 반드시 확인)

### 작업 시작 전 확인 순서

1. **현재 브랜치를 먼저 확인합니다** (`git branch --show-current`).
2. **작업 브랜치(`타입/작업-내용`, 예: `feat/closet-crud`)에 있으면** 브랜치를 새로 만들지 않고 그 브랜치에서 바로 작업합니다.
3. **`main` 또는 `develop`에 있으면** 지시받은 작업에 맞는 작업 브랜치를 새로 만든 뒤 작업합니다.
    - 이때 지시가 불분명해서 무엇을 만들거나 고칠지, 어떤 타입(feat/fix/...)인지 정할 수 없으면 **경고 메시지만 남기고 아무 작업도 하지 않습니다.** 브랜치도 만들지 않고, 파일도 고치지 않습니다.
    - 경고 예: `⚠️ 지시가 불분명해 작업하지 않았습니다. 무엇을 바꿔야 하는지(대상 기능·화면·API)와 작업 종류(기능 추가/버그 수정 등)를 알려 주세요.`
    - 작업 브랜치는 항상 **최신 develop에서** 만듭니다. main에 있었다면 develop으로 옮긴 뒤 만듭니다.
   ```bash
   git switch develop
   git pull origin develop
   git switch -c 타입/작업-내용
   ```

### 브랜치 구조

| 브랜치 | 역할 | 규칙 |
|---|---|---|
| `main` | 최종 빌드·발표용 (기본 브랜치) | 직접 커밋·push 금지 |
| `develop` | 개발 통합 브랜치 | 직접 커밋·push 금지 |
| `타입/작업-내용` | 개인 작업 브랜치. develop에서 생성 | 작업 후 develop으로 PR |

- 작업 브랜치 이름: `타입/작업-내용` (소문자, 단어는 하이픈). 예: `feat/closet-crud`, `fix/weather-cache-expire`, `design/home-layout`
- **main과 develop에는 절대 직접 커밋하지 않습니다.** 합치는 것은 PR로만 합니다.

### 타입

| 타입 | 언제 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 (기능 변화 없음) |
| `design` | UI/UX 및 CSS 스타일링 변경 |
| `chore` | 패키지 매니저, 빌드 설정 등 코드 외 변경 |

### 커밋 메시지

- 형식: `타입: 작업 내용` (예: `feat: 옷 등록 시 AI 분류 결과 저장`)
- 한 커밋에는 한 가지 일만 담습니다.

### PR

- 작업 브랜치 → develop. develop → main은 최종 빌드 때만.
- 제목: `[타입] 작업 내용` (타입은 대문자. 예: `[FEAT] 옷장 목록 카테고리 필터 구현`)
- PR 하나에는 기능 하나만 담습니다.
- 본문 템플릿:
  ```markdown
  ## 무엇을 했나요
  - 한두 줄로 이 PR의 목적

  ## 변경 사항
  -

  ## 확인한 것
  - [ ] 로컬에서 실행 확인
  - [ ] API 응답 확인 (Postman 등)
  - [ ] 화면 확인 (UI 변경 시 스크린샷 첨부)

  ## 리뷰 때 봐주세요
  - 특히 확인이 필요한 부분이나 고민한 지점

  ## 관련 이슈
  - closes #
  ```

### 환경 변수 · 설정 파일

- API 키, DB 비밀번호 같은 값은 코드에 쓰지 않습니다. `.env` 등 실제 값이 든 파일은 커밋하지 않습니다.
- `package.json`(패키지 추가·버전 변경)을 바꿨다면, 무엇을 왜 바꿨는지 작업 결과에 꼭 적어서 사용자가 팀에 공유할 수 있게 합니다.

## 실행 명령

- `npm run dev`

## 1. 프로젝트 한 줄 요약

내 옷장 안에서, 오늘 날씨에 춥지도 덥지도 않은 옷차림을 추천하고, 저녁 체감 피드백으로 개인의 추위·더위 성향을 학습하는 서비스입니다.
학습하는 것은 스타일이 아니라 "이 사람이 얼마나 춥고 덥게 느끼는지"입니다.

핵심 흐름: 옷 등록(AI 분류) → 아침 추천 → "이걸로 입을게요"(착용 기록) → 저녁 피드백 → 성향 갱신 → 다음 추천에 반영

## 2. 기술 스택

- **Next.js App Router, JavaScript**(TypeScript 아님), axios, Tailwind CSS
- 브랜드 색 `#990635`
- 지도: 카카오 지도(장소 검색·핀 표시)
- 백엔드는 Spring Boot이고, API 주소는 모두 `/api`로 시작합니다.

## 3. 담당
| 담당 | 화면 (app/) | 컴포넌트 (components/) |
|---|---|---|
| 전이레 | feedback, profile, signup/preference | common, weather, feedback, preference (+ 프론트 틀: `api/`의 axios 인스턴스, `constants.js`, `utils/`) |
| 정동화 | login, signup, signup/info, places, account | user, place |
| 강민주 | closet, closet/storage, closet/new, closet/[clothesId], preview, wear/new, wear/history | closet, wear |
| 최수인 | / (홈), uniform | recommend |

홈(/)은 최수인 담당이지만, 날씨 띠와 '오늘은 몸이 안 좋아요'의 학습 제외는 전이레, '이걸로 입을게요' 착용 기록 저장은 강민주 담당입니다. 내 성향 화면의 기본 설정 칸은 정동화 담당입니다.

### 담당 밖 파일 수정 규칙

- **작업을 지시한 사람의 담당 화면·컴포넌트가 아닌 파일을 수정해야 하면, 수정하기 전에 먼저 물어봅니다.** 어떤 파일을, 왜, 어떻게 바꾸려는지 적고, 사용자가 허락한 뒤에만 수정합니다. 묻는 동안 해당 파일은 건드리지 않습니다.
- 공통 영역도 같은 규칙입니다. `components/common/`, `api/`의 axios 인스턴스, `constants.js`, `utils/`, `package.json`은 여러 사람이 함께 쓰므로 고치기 전에 물어봅니다.
- 지시한 사람이 누구인지(어느 담당인지) 알 수 없으면, 담당 밖 파일을 고쳐야 하는 시점에 먼저 물어봅니다.
- 담당 화면·컴포넌트 안의 파일은 묻지 않고 작업해도 됩니다.

## 4. 폴더 구조와 화면

```
frontend/          src 폴더 없이 프로젝트 맨 위에 둠
├─ app/           화면. 폴더 = 주소 = 화면 ID (예: 옷 등록 = closet/new, 홈 = /)
├─ api/           axios 인스턴스(요청마다 localStorage 토큰을 Authorization 헤더에, 공통 응답 틀 풀기, 401이면 토큰 지우고 /login) + 도메인별 호출
├─ components/    common/(layout·control·form·feedback·display, 가져올 때는 @/components/common 하나) 과 도메인별 폴더(user, place, closet, wear, recommend, weather, feedback, preference)
├─ constants.js   ENUM 값과 화면 표시 문구 (백엔드 ENUM 이름 그대로)
└─ utils/         날짜 형식, localStorage, warmth.js(clo ↔ 따뜻한 정도 단계) 등
```

- **화면 ID는 `app/` 아래 폴더 명입니다.**
- **UI를 만들 때는 `components/common/`의 공통 컴포넌트를 먼저 찾아서 씁니다.** 버튼, 칩, 모달, 헤더, 입력창 등 비슷한 것이 이미 있으면 새로 만들지 않고 그것을 씁니다. 필요한 공통 컴포넌트가 없거나 기능이 부족하면, 도메인 폴더에 비슷한 것을 따로 만들지 말고 공통 컴포넌트를 추가·수정해도 되는지 먼저 물어봅니다(공통 영역 수정 규칙 적용).
- **`src/` 폴더를 쓰지 않습니다.** `app/`, `api/`, `components/` 등은 프로젝트 맨 위에 둡니다.
- 로그인 확인은 axios로만 합니다. `proxy.js`(middleware)는 만들지 않습니다. 로그인이 필요한 화면은 처음 열 때 `GET /api/users/me`를 부르고(헤더 닉네임도 이 값), 로그인이 없거나 토큰이 만료·위조돼 API가 401을 주면 axios 응답 인터셉터가 localStorage 토큰을 지우고 /login으로 보냅니다. 로그인·회원가입 화면과 로그인 API 자체의 401은 이동시키지 않습니다.
- ENUM 문자열을 컴포넌트에 직접 쓰지 말고 `constants.js`에서 가져옵니다(JS라 오타가 에러로 안 잡힘).
- "오늘 안 나갔어요"는 서버에 저장하지 않고 localStorage에 그 날짜를 남겨 피드백 요청을 감춥니다(시연·단일 브라우저 전제).
- 브랜드 색은 `#990635`입니다. 선택된 칩·페이지 번호는 브랜드 색으로 채웁니다.


## 5. API 호출 규칙

- 호출은 `api/`의 axios 인스턴스로만 합니다. 컴포넌트에서 `fetch`나 새 axios 인스턴스를 만들지 않습니다.
- **비동기는 기본 `async`/`await`만 씁니다(교육과정 범위).** `api/`의 함수는 `async` 함수로 axios를 `await`해서 값을 돌려주고, 화면에서는 `try`/`catch`로 감싸 부릅니다. `.then()` 체인은 쓰지 않습니다.
- 데이터를 쓰는 화면은 `'use client'` 컴포넌트로 만들고, 처음 불러오기는 `useEffect` 안에서 `async` 함수를 만들어 부른 뒤 결과를 `useState`에 담습니다. 불러오는 중·실패 상태도 `useState`로 둡니다.
  ```js
  useEffect(() => {
    const load = async () => {
      try {
        setClothes(await getClothes());
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  ```
- 로그인 토큰은 **localStorage**에 둡니다(키 이름은 `constants.js`의 `ACCESS_TOKEN_KEY` 하나로). 로그인 응답의 `accessToken`을 저장하고, axios 요청 인터셉터가 요청마다 `Authorization: Bearer {토큰}` 헤더를 붙입니다. 로그아웃하면 토큰을 지우고 /login으로 갑니다. `withCredentials`는 쓰지 않습니다. 토큰을 다른 곳(sessionStorage·state·쿠키)에 따로 두지 않습니다.
- 응답은 공통 틀 `{ success, data, error: { code, message } }`입니다. axios 인스턴스에서 풀어 `data`만 넘기고, 실패하면 `error.code`로 처리합니다.
- **주소에 userId를 넣지 않습니다.** 서버가 토큰의 로그인 사용자로 본인 데이터만 돌려줍니다.
- 엔드포인트 목록과 응답 예시는 Notion "API 명세 초안"을 따릅니다. 응답 모양이 명세와 다르면 고쳐 쓰지 말고 백엔드 담당에게 확인합니다.
- **성향 정리 완료 안내(전이레, `Header`):** 피드백을 저장하면 서버가 성향 정리를 따로(`@Async`) 돌립니다. 사용자는 기다리지 않고 다른 화면을 씁니다. `Header`가 화면을 열 때(마운트될 때) `GET /api/preferences/me`의 `summarizedAt`을 localStorage에 저장해 둔 값과 비교하고, 더 최신이면 "성향 정리가 끝났어요" 토스트(내 성향으로 가는 링크)를 띄운 뒤 localStorage 값을 바꿉니다. localStorage에 값이 없으면(처음 로그인·다른 브라우저) 토스트 없이 저장만 합니다. 몇 초마다 계속 부르는 폴링은 하지 않습니다.

## 6. 화면 규칙

- 와이어프레임(Design 캔버스)과 발표 자료 "mAILOOK 화면 흐름과 동작"의 번호 주석이 버튼별 이동 화면의 기준입니다.
- **페이지 라우팅:** 첫 화면은 `/login`입니다. 화면 사이 이동은 "화면 흐름과 동작"의 '페이지 라우팅 흐름' 슬라이드와 화면별 번호 주석을 따릅니다. 새 화면을 만들면 그 화면에서 나가는 버튼을 모두 실제 주소로 연결합니다.
- 단순 이동은 `next/link`의 `<Link>`, 저장·삭제처럼 처리한 뒤 이동하는 버튼은 `useRouter().push()`를 씁니다. 주소 문자열은 `app/` 폴더 이름과 똑같이 씁니다.
- 기능이 아직 없는 화면도 `page.js`를 만들고, 화면 제목과 나가는 버튼만 있는 뼈대로 둡니다(라우팅 확인용).
- **보온(조합 clo·적정 clo)·보정 계산은 프론트에서 하지 않습니다.** 서버가 준 값을 보여주기만 합니다.
- 예외 하나: 따뜻한 정도 단계 변환은 프론트가 합니다. 서버는 옷마다 clo만 주고받으므로 `utils/warmth.js`의 `cloToLevel(clo)`(round(clo ÷ 0.08), 0 이하는 1, 최대 10)과 `levelToClo(level)`(level × 0.08)만 씁니다. 따뜻한 정도는 10단계(화면에서는 5칸 막대, 반 칸 = 0.5단계)로 보여줍니다.
- 추천을 AI가 만들지 못하면 서버가 규칙 기반 추천을 주고, 화면에는 그 안내 문구를 보여줍니다.
- 착용 기록은 하루 1개이고, 피드백을 남긴 날은 '이걸로 입을게요'·'다른 조합 보기'·'바꾸기'·'직접 기록하기'를 숨기고 완료 문구만 보여줍니다.
- 버튼·링크·입력은 실제 `<button>`, `<a>`, `<input>` + `<label>`을 씁니다. 아이콘만 있는 버튼에는 `aria-label`을 붙입니다.

## 7. 하지 말 것

- TypeScript를 추가하지 않습니다.
- 교육과정 범위를 넘는 데이터·상태 관리 도구를 쓰지 않습니다: React Query(TanStack Query), SWR, Redux·Zustand·Recoil 같은 상태 관리 라이브러리, Server Actions, 서버 컴포넌트에서 직접 데이터 불러오기, Suspense 기반 데이터 로딩. 필요해 보이면 먼저 물어봅니다.
- 토큰을 localStorage 말고 다른 곳에 따로 저장하지 않고, 화면에 출력하거나 console.log로 찍지 않습니다.
- ENUM 문자열을 컴포넌트에 직접 쓰지 않습니다(`constants.js`에서 가져옴).
- 보온·보정 계산을 프론트에서 구현하지 않습니다(단계 변환 `utils/warmth.js`만 예외).
- 공통 컴포넌트와 비슷한 것을 도메인 폴더에 따로 만들지 않습니다.
- API 키를 코드에 쓰지 않습니다. `.env.local` 등 실제 값이 든 파일은 커밋하지 않습니다.
- 백엔드 폴더의 파일을 고치지 않습니다. 필요하면 무엇이 필요한지 작업 결과에 적습니다.
- main, develop 브랜치에 직접 커밋하지 않습니다.