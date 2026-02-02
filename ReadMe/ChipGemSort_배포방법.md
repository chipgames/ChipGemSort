# ChipGemSort 배포 방법 (GitHub Pages)

이 문서는 ChipGemSort 프로젝트를 **GitHub Pages**에 배포하는 방법을 정리합니다.

---

## 1. 사전 준비

- **Node.js** (v16 이상 권장) 및 **npm**
- **Git** 및 GitHub 저장소 (`ChipGemSort` 원격 저장소 연결 완료)
- 프로젝트 루트에서 `npm install` 완료

```bash
cd ChipGemSort
npm install
```

---

## 2. 빌드

프로덕션용 정적 파일을 `dist` 폴더에 생성합니다.

```bash
npm run build
```

- TypeScript 검사(`tsc`) 후 Vite 빌드가 실행됩니다.
- 결과물은 `dist/` 디렉터리에 생성됩니다.
- 빌드 시 `vite.config.ts`의 `base`가 `/ChipGemSort/`로 설정되어 있어, **프로젝트 경로 기준**으로 배포됩니다.

---

## 3. GitHub Pages 배포

### 3-1. 한 번에 배포 (권장)

빌드와 배포를 한 번에 실행합니다.

```bash
npm run deploy
```

- 내부 동작: `npm run build` → `npx gh-pages -d dist`
- `dist` 내용이 **gh-pages** 브랜치로 푸시되고, GitHub Pages가 해당 브랜치를 사용해 사이트를 서빙합니다.

### 3-2. 빌드와 배포를 나눠서 실행

이미 빌드가 끝난 상태에서 배포만 하고 싶을 때:

```bash
npm run build
npx gh-pages -d dist
```

---

## 4. GitHub 저장소 설정

1. GitHub에서 **ChipGemSort** 저장소로 이동
2. **Settings** → **Pages**
3. **Source**: **Deploy from a branch**
4. **Branch**: `gh-pages` 선택, 폴더는 **/(root)** 로 두고 **Save**

`npm run deploy`를 실행하면 `gh-pages` 브랜치가 자동으로 생성/갱신되므로, 위 설정만 맞추면 됩니다.

---

## 5. 접속 주소

- 저장소가 `https://github.com/<사용자명>/ChipGemSort` 인 경우:
  - **게임 주소**: `https://<사용자명>.github.io/ChipGemSort/`
- 반영까지 1~2분 걸릴 수 있습니다.

---

## 6. base 경로 변경 시 (선택)

- **사용자/조직 메인 사이트**로 서빙하려면(예: `https://<사용자명>.github.io/`)  
  `vite.config.ts`에서 `base`를 `"/"`로 바꾸고, Pages 설정에서 해당 저장소를 메인 사이트로 지정해야 합니다.
- **프로젝트 하위 경로**로 두는 현재 설정(`/ChipGemSort/`)이면 `base`는 수정하지 않아도 됩니다.

---

## 7. 요약

| 단계                      | 명령                   |
| ------------------------- | ---------------------- |
| 의존성 설치               | `npm install`          |
| 빌드만                    | `npm run build`        |
| 빌드 + 배포               | `npm run deploy`       |
| 배포만 (이미 빌드된 경우) | `npx gh-pages -d dist` |

배포 후 접속: **https://\<사용자명\>.github.io/ChipGemSort/**
