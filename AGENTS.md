# AGENTS.md

## Cursor Cloud specific instructions

### 프로젝트 개요

**ForFun_PicIsFalling** — PixiJS 기반 인터랙티브 파티클 아트 플랫폼. Svelte + TypeScript + Vite로 구성.

### 개발 서버 실행

```bash
npm run dev
```

`http://localhost:5173/ForFun_PicIsFalling/` 으로 접속. `vite.config.ts`에 `base: '/ForFun_PicIsFalling/'`가 설정되어 있어 base path 포함 필요.

### 주요 명령어

- `npm run dev` — 개발 서버 (HMR)
- `npm run build` — 프로덕션 빌드 (`dist/`)
- `npm run check` — Svelte + TypeScript 타입 체크
- `npx eslint src/` — 린트
- `npx prettier --check .` — 포맷 체크

### 디렉토리 구조 참고

- `src/lib/engine/` — 프레임워크 무관 코어 파티클 엔진 (순수 TypeScript)
- `src/lib/renderer/` — PixiJS 렌더링 레이어
- `src/lib/presets/` — 이펙트 프리셋 (눈, 비, 벚꽃 등)
- `src/components/` — Svelte UI 컴포넌트
- `src/stores/` — Svelte 스토어 (상태 관리)
- `legacy/` — 리팩토링 이전 원본 HTML/CSS/JS 파일

### 주의사항

- GitHub Pages 배포 시 `base` 경로가 `/ForFun_PicIsFalling/`이므로 에셋 경로에 주의.
- `src/lib/engine/`은 Svelte나 PixiJS를 import하면 안 됨 (향후 npm 패키지로 추출 예정).
