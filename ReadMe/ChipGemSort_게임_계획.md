# ChipGemSort 게임 계획서

> 색상/워터 소트 퍼즐 장르, ChipPuzzleGame 젬(Gem) 모양을 활용한 정렬 퍼즐 게임  
> 참고: Woody Sort, Sort Jam / D:\vs\ChipGames\ChipPuzzleGame, D:\vs\ChipGames\ChipBlockCrush

---

## 1. 저작권 검토 결론

상세 분석은 **ReadMe/01-저작권분석/** 문서를 참조한다.

| 항목                         | 결론                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **장르·규칙**                | 게임 아이디어·규칙·메커니즘은 저작권으로 보호되지 않음. 동일 장르(색상/워터 소트 퍼즐)로 제작 가능.                    |
| **프로젝트명**               | "ChipGemSort"는 Woody Sort·Sort Jam과 다른 조합의 자체 명칭. 저작권·상표권상 사용 가능(상표 검색 권장).                |
| **ChipPuzzleGame 젬 스타일** | 같은 제작자일 경우 자기 저작물 재활용으로 문제 없음. 참고 시 코드/에셋 복사 없이 ChipGemSort용으로 **자체 구현**할 것. |
| **타사 자산**                | Woody Sort, Sort Jam의 이름·캐릭터·UI·아트·음악·코드는 사용 금지. 비주얼·테마·문구는 전부 독자 제작.                   |

**정리**: 저작권·상표권상 ChipGemSort 개발 및 ChipPuzzleGame 젬 모양을 참고한 “젬 형태 오브젝트로 색상 정렬” 구성은 문제 없다. 제작 시 [저작권-법적-분석.md](01-저작권분석/저작권-법적-분석.md), [ChipGemSort-이름-및-잼스타일-검토.md](01-저작권분석/ChipGemSort-이름-및-잼스타일-검토.md)의 체크리스트를 준수한다.

---

## 2. 프로젝트 개요

### 2.1 목표

- **ChipGemSort**: 색상/워터 소트 퍼즐을 **ChipPuzzleGame 젬(Gem) 모양**으로 표현해, 튜브(병)에 담긴 젬을 옮겨 **한 병에 한 색만** 되도록 정렬하는 웹 게임.
- GitHub Pages 기반 무료 호스팅, React + Canvas 반응형.
- 다국어·반응형·모바일 가로/세로·다크/라이트(파스텔)·SEO·AdSense·PWA를 적용한 완성도 높은 서비스.

### 2.2 게임 컨셉

- **장르**: 색상 소트 퍼즐 (Woody Sort, Sort Jam과 동일 메커니즘).
- **비주얼**: ChipPuzzleGame과 같은 **젬 형태**(둥근 사각형, 그라데이션, 6색, 내부 패턴·테두리)·파스텔 톤으로 차별화.
- **규칙**: 병에서 병으로 젬을 옮겨, 한 병에 한 색만 남기기. “맨 위만 옮기기”, “빈 병 또는 같은 색 위에만 붓기” 등.

---

## 3. 요구사항 정리 (체크리스트)

| 번호 | 항목             | 내용                                                            |
| ---- | ---------------- | --------------------------------------------------------------- |
| 1    | 다국어 지원      | 한국어, 영어, 일본어, 중국어 등                                 |
| 2    | 반응형 지원      | 데스크톱·태블릿·모바일 대응                                     |
| 3    | 모바일 가로/세로 | 가로·세로 모드 모두 지원, 화면 고정 옵션, 메뉴 보기/숨김 옵션   |
| 4    | 다크/라이트 모드 | 테마 전환 및 파스텔 톤 적용                                     |
| 5    | SEO              | 구글, 네이버, 다음 등 검색 최적화(해외 검색 포함)               |
| 6    | AdSense          | client=ca-pub-2533613198240039                                  |
| 7    | 호스팅           | GitHub Pages                                                    |
| 8    | 기술 스택        | React + Canvas, Canvas 16:9 고정·반응형(최대 가로 1200px)       |
| 9    | PWA              | manifest, Service Worker, 오프라인·앱처럼 실행(메뉴에 다운로드) |
| 10   | 웹 구조          | 스테이지 선택 화면 이미지 및 ChipPuzzleGame 참고                |
| 11   | 디자인           | 파스텔 톤                                                       |
| 12   | 오브젝트 형태    | ChipPuzzleGame의 Gem 모양처럼 표현하여 정렬하는 형식            |

---

## 4. 웹 구조 (UI/레이아웃)

참고: **스테이지 선택 화면 첨부 이미지** 및 **D:\vs\ChipGames\ChipPuzzleGame** 구조.

### 4.1 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (로고, 게임명, 네비, 다크모드, 소리, 언어, 메뉴 보기/숨김) │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Main (게임하기 / 가이드 / 도움말 / 게임 소개 / PWA 다운로드 등)   │
│  - 스테이지 선택: 그리드 + 페이지네이션 (ChipPuzzleGame 유사)      │
│  - 게임 플레이: Canvas (16:9, 최대 가로 1200px) 영역              │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Footer (개인정보처리방침, 문의하기, 언어, © ChipGames, 버전)     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 화면(스크린) 구성

| 화면              | 설명                                                                    | 참고                             |
| ----------------- | ----------------------------------------------------------------------- | -------------------------------- |
| **스테이지 선택** | 스테이지 그리드(예: 50개/페이지), 페이지네이션(1/N), 잠금/해제 표시     | ChipPuzzleGame StageSelectScreen |
| **게임하기**      | Canvas 16:9 영역에서 젬(병)·정렬 플레이, ChipPuzzleGame Gem 형태 렌더링 | Sort Jam / Woody Sort 메커니즘   |
| **가이드**        | 게임 방법 안내                                                          | ChipPuzzleGame GuideScreen       |
| **도움말**        | 자주 묻는 질문 등                                                       | ChipPuzzleGame HelpScreen        |
| **게임 소개**     | 게임·제작자 소개                                                        | ChipPuzzleGame AboutScreen       |

### 4.3 헤더 네비게이션

- **게임하기**: 스테이지 선택 또는 직전 플레이 화면
- **가이드**: 플레이 방법
- **도움말**: FAQ 등
- **게임 소개**: 소개 페이지
- **앱 다운로드(PWA)**: 메뉴에 “앱으로 설치” 등 진입점 제공
- 우측: 다크/라이트 토글, 소리 토글, 언어 선택, **메뉴 보기/숨김** 옵션

### 4.4 반응형·모바일

- **768px 이하**: 햄버거 메뉴 등으로 네비 축약, 스테이지 그리드 열 수 조절
- **모바일**: 터치로 병 선택·젬 이동, 가로·세로 모두 지원
- **화면 고정**: 선택 시 가로 또는 세로 고정 (Screen Orientation API, 전체화면 권장)
- **메뉴 보기/숨김**: 플레이 시 헤더/푸터 숨김 옵션 (ChipPuzzleGame·ChipBlockCrush와 동일 패턴)

---

## 5. 기술 스택 및 구현 방향

### 5.1 기본 스택

| 구분        | 선택                    | 비고                    |
| ----------- | ----------------------- | ----------------------- |
| 프레임워크  | React                   | 함수 컴포넌트 + Hooks   |
| 언어        | TypeScript              | 타입 안정성             |
| 빌드        | Vite                    | 빠른 개발·빌드          |
| 스타일      | CSS (변수·테마)         | 파스텔 톤 변수 정의     |
| 게임 렌더링 | Canvas API              | 젬·병·그리드·애니메이션 |
| 상태        | useState, useContext 등 | 전역은 필요 시 Context  |

### 5.2 Canvas 규격

- **비율**: 16:9 고정
- **반응형**: 뷰포트(또는 컨테이너) 크기에 맞춰 Canvas 크기 자동 조절. **최대 가로 1200px** 제한.
- **구현**: `canvasConfig.aspectRatio = 16/9`, `maxWidth: 1200`, 컨테이너 측정 후 16:9 유지, `devicePixelRatio` 반영.
- ChipPuzzleGame의 `canvasConfig.ts`, `GameCanvas`, `GemRenderer` 패턴 참고. 젬은 ChipPuzzleGame과 유사한 **둥근 사각형·그라데이션·6색·패턴**으로 ChipGemSort 전용 구현.

### 5.3 폴더 구조 (ChipPuzzleGame·ChipBlockCrush 참고)

```
ChipGemSort/
├── public/
│   ├── .nojekyll
│   ├── manifest.json      # PWA
│   ├── sw.js              # Service Worker
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── Ads.txt             # AdSense
│   ├── favicon, icons (192, 512 등)
│   └── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/        # Header, Footer, GameContainer, ErrorBoundary
│   │   ├── screens/       # StageSelectScreen, GuideScreen, HelpScreen, AboutScreen
│   │   ├── game/          # 게임 로직 + Canvas 래퍼 (정렬 퍼즐)
│   │   ├── canvas/        # GameCanvas (16:9, max 1200px), GemRenderer(젬 형태)
│   │   ├── seo/           # SEOHead
│   │   └── ui/            # LanguageSelector, ThemeToggle, OrientationLock, UIHide
│   ├── constants/         # canvasConfig, gameConfig, gemConfig
│   ├── hooks/             # useLanguage, useTheme, useGameState, useOrientationLock, usePWAInstall
│   ├── locales/           # ko.json, en.json, ja.json, zh.json
│   ├── styles/            # themes.css (파스텔), App.css
│   ├── types/
│   ├── utils/             # storage, adsense, serviceWorker
│   └── services/          # LanguageService
├── ReadMe/
│   ├── README.md
│   ├── ChipGemSort_게임_계획.md
│   ├── 01-저작권분석/
│   ├── 02-게임상세분석/
│   └── 03-장르참고자료/
├── vite.config.ts         # base: '/ChipGemSort/' (GitHub Pages)
├── package.json
└── index.html
```

---

## 6. 다국어 지원 (요구 1)

- **대상 언어**: 한국어(ko), 영어(en), 일본어(ja), 중국어(zh) 필수, 추가 언어는 선택
- **방식**: JSON locale 파일(`src/locales/ko.json` 등) + `useLanguage` 훅 + `LanguageSelector` UI
- **URL·저장**: `?lang=ko` 등 쿼리·localStorage로 유지, SEO hreflang과 연동
- ChipPuzzleGame의 `locales/`, `LanguageService`, `LanguageSelector` 구조 재사용 권장

---

## 7. 반응형 지원 (요구 2)

- **미디어 쿼리**: 768px(또는 1024px) 기준으로 헤더·그리드·폰트 조절
- **레이아웃**: flex/grid로 Header·Main·Footer 배치, 스테이지 그리드 열 수만 조절 (예: 10열 → 5열)
- **Canvas**: 16:9 비율 유지, 부모 너비에 맞춰 크기 계산, **최대 가로 1200px**
- **터치**: 터치 디바이스에서 병 선택·젬 이동 지원

---

## 8. 모바일 가로/세로 (요구 3)

- **orientation**: any 또는 portrait/landscape 세부 지원
- **화면 고정 버튼**: 모바일에서만 표시, Screen Orientation API로 방향 고정/해제 (전체화면 권장)
- **resize / orientationchange**: Canvas·레이아웃 재계산
- **메뉴 보기/숨김**: 플레이 시 헤더·푸터 숨김 옵션 (ChipPuzzleGame·ChipBlockCrush와 동일)

---

## 9. 다크/라이트 모드 (요구 4)

- **data-theme**: `data-theme="dark"` | `data-theme="light"`, 기본값은 사용자 선호 또는 dark
- **파스텔 톤** (요구 11):
  - 다크: 배경 `#1a1a2e` 계열, 액센트 `#a8b5ff`, `#c5a3ff`, `#ffb3e6` 등
  - 라이트: 배경 `#f5f5f8` 계열, 액센트 `#7c8aff`, `#a78aff` 등
- **CSS 변수**: `themes.css`에 `--bg-primary`, `--accent-primary` 등 정의
- **저장**: localStorage에 테마 저장, `useTheme`으로 초기화
- ChipPuzzleGame의 `themes.css`, `ThemeToggle` 참고

---

## 10. SEO (요구 5)

### 10.1 검색 엔진 대상

- **구글**: meta description, title, og, Twitter Card, JSON-LD
- **네이버**: NaverBot 허용, 메타 태그, 구조화 데이터
- **다음**: Daum/Daumoa 허용, 동일 메타·구조화
- **해외**: Bing, Yandex 등 메타·hreflang·sitemap 반영

### 10.2 구현

- **react-helmet-async**: 페이지별 `title`, `meta name="description"`, `meta name="keywords"`, `og:title`, `og:description`, `og:image`, `og:type`
- **다국어**: `hreflang` (ko, en, ja, zh)를 sitemap 및 Helmet에 반영
- **JSON-LD**: WebSite, Game, Organization 등 스키마
- **robots.txt**: User-agent별 Allow, Sitemap URL
- **sitemap.xml**: 메인·가이드·도움말·소개 등 URL + hreflang
- **index.html**: 기본 title/description (기본 언어)

---

## 11. Google AdSense (요구 6)

- **Publisher ID**: `ca-pub-2533613198240039`
- **로드**: `index.html`에 스크립트 한 번만 로드  
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2533613198240039`
- **초기화**: 프로덕션에서만 실행, localhost에서는 스킵
- **유틸**: `preventAdSenseErrors`, `setupAdObserver` 등으로 오류·레이아웃 깨짐 방지
- **Ads.txt**: 필요 시 public/Ads.txt에 구글 제공 내용 추가

---

## 12. GitHub Pages (요구 7)

- **배포 경로**: `https://<user>.github.io/ChipGemSort/` (또는 org 경로)
- **Vite base**: `base: '/ChipGemSort/'`
- **빌드**: `npm run build` → `dist` 출력
- **배포**: `gh-pages -d dist` 또는 `npm run deploy`
- **public/.nojekyll**: Jekyll 무시

---

## 13. Canvas + React, 16:9·최대 1200px (요구 8)

- **역할 분리**: React는 화면·UI·상태, Canvas는 젬·병·애니메이션 렌더링
- **비율**: 16:9 고정. 컨테이너 width 기준 height = width×(9/16), **max-width: 1200px** 적용
- **해상도**: `devicePixelRatio` 반영해 선명도 확보
- **이벤트**: 마우스/터치를 Canvas 좌표로 변환해 병 선택·젬 이동
- **젬 렌더링**: ChipPuzzleGame Gem 스타일(둥근 사각형, 그라데이션, 6색, 패턴·테두리)을 ChipGemSort용으로 **자체 구현** (코드 복사 없이)

---

## 14. PWA (요구 9)

- **manifest.json**:
  - `name`, `short_name`: ChipGemSort 관련 문구
  - `start_url`: `/ChipGemSort/`
  - `display`: `standalone`
  - `orientation`: `any`
  - `icons`: 192x192, 512x512 (maskable)
  - `theme_color`, `background_color`: 파스텔 톤
  - `scope`: `/ChipGemSort/`
- **Service Worker**: sw.js로 캐시 전략, 버전 관리
- **등록**: main.tsx 또는 App.tsx에서 `registerServiceWorker()` 호출
- **메뉴에 다운로드**: “앱으로 설치” 등 PWA 설치 진입점을 메뉴에 노출
- **iOS**: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-mobile-web-app-title
- ChipPuzzleGame의 `public/manifest.json`, `sw.js`, `serviceWorker.ts` 참고

---

## 15. 디자인 (파스텔 톤, 요구 11)

- **일관성**: 다크 배경 + 파스텔 그라데이션(연보라·하늘색)으로 버튼·선택 상태 강조
- **색상 변수 예시** (themes.css):
  - 다크: `--accent-primary: #a8b5ff`, `--accent-secondary: #c5a3ff`, `--gradient-primary: linear-gradient(135deg, #a8b5ff 0%, #c5a3ff 100%)`
  - 라이트: 배경 밝게, 액센트 동일 톤으로 약간 진하게
- **스테이지 카드**: 잠금 = 회색+자물쇠, 해제 = 파스텔 그라데이션 배경
- **젬 색상**: ChipPuzzleGame과 유사한 6색(빨강·노랑·파랑·초록·보라·주황)을 파스텔 톤으로 조정 가능

---

## 16. 게임 설계 (색상 소트 + Gem 형태, 요구 12)

### 16.1 핵심 규칙

- **필드**: 여러 개의 **튜브(병)** 와 그 안에 담긴 **젬**(ChipPuzzleGame과 같은 형태·색상 계열)
- **목표**: 젬을 병에서 병으로 옮겨 **한 병에 한 색만** 남기기
- **규칙**: 맨 위에 있는 젬만 옮기기, 빈 병 또는 같은 색 위에만 붓기
- **조작**: 터치/클릭으로 출발 병 → 도착 병 선택

### 16.2 젬(Gem) 표현

- **모양**: ChipPuzzleGame과 유사한 둥근 사각형(roundRect, radius 비율 약 0.2)
- **색**: 6색(red, yellow, blue, green, purple, orange) + light/dark 그라데이션
- **패턴**: 색상별 내부 패턴(원·별·다이아몬드 등), 테두리·하이라이트
- **구현**: ChipPuzzleGame `GemRenderer.ts`, `gemConfig.ts`를 **참고만** 하고, ChipGemSort 전용 GemRenderer·gemConfig를 새로 작성 (코드·에셋 복사 없음)

### 16.3 스테이지·진행

- **스테이지**: 1~N단계 (예: 50~500), 순차 해제, 진행은 localStorage 저장
- **레벨 설계**: NP-완전 특성상 “풀 수 있는 배치”만 사용. 병 수·색 수·초기 배치로 난이도 조절
- **보조 기능**: Undo(실행 취소), Shuffle(셔플), 힌트, 별/등급 등 (03-장르참고자료/장르-개요.md 참고)

---

## 17. 일정·우선순위 제안

| 단계 | 내용                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| 1    | 프로젝트 셋업 (Vite + React + TS), 라우팅/화면 구조, Header/Footer                      |
| 2    | 테마(다크/라이트)·파스텔 CSS 변수, 반응형 기본                                          |
| 3    | 다국어 (locales, useLanguage, LanguageSelector)                                         |
| 4    | 스테이지 선택 화면 (그리드, 페이지네이션, 잠금/해제)                                    |
| 5    | Canvas 16:9 래퍼(max 1200px) + 젬·병 렌더링(Gem 스타일) + 터치/클릭                     |
| 6    | 게임 로직 (정렬 규칙, 이동, 클리어/실패, Undo/힌트 등)                                  |
| 7    | PWA (manifest, Service Worker, 메뉴에 다운로드), SEO (Helmet, sitemap, robots), AdSense |
| 8    | 모바일 가로/세로·화면 고정·메뉴 보기/숨김, 최종 테스트 및 GitHub Pages 배포             |

---

## 18. 참고 자료

- **프로젝트**: D:\vs\ChipGames\ChipPuzzleGame (웹 구조, Canvas, GemRenderer, PWA, SEO, AdSense, 테마, 다국어)
- **프로젝트**: D:\vs\ChipGames\ChipBlockCrush (웹 구조, 게임 계획서 형식)
- **저작권·이름·젬 스타일**: ReadMe/01-저작권분석/
- **게임 규칙·장르**: ReadMe/02-게임상세분석/, ReadMe/03-장르참고자료/
- **UI 참고**: 제공된 스테이지 선택 화면 이미지, ChipPuzzleGame StageSelectScreen

---

_이 계획서는 ChipGemSort 개발 시 요구사항과 구조를 정리한 문서이며, 구현 중 세부 사항은 변경될 수 있습니다._
