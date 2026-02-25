# 기술 스택 비교 및 선정

## 최종 선정 스택

```
렌더링:    PixiJS (2D WebGL, 파티클 시스템)
UI:       Svelte (경량 반응형 프레임워크)
언어:     TypeScript
빌드:     Vite
배포:     GitHub Pages (vite build → gh-pages 브랜치)
```

---

## 렌더링 엔진 비교

| | Canvas 2D (Raw) | WebGL (Raw) | PixiJS | Three.js | p5.js |
|---|---|---|---|---|---|
| **파티클 성능** | ~3,000개 한계 | 100,000개+ | 100,000개+ | 100,000개+ | ~5,000개 한계 |
| **학습 곡선** | 낮음 | 매우 높음 | 중간 | 중~높음 | 낮음 |
| **2D 특화** | O | - | **O (최적)** | X (3D 중심) | O |
| **파티클 시스템 내장** | X (직접 구현) | X (직접 구현) | **O** (ParticleContainer) | O (Points) | X |
| **셰이더 커스텀** | X | O | O (Filter) | O | X |
| **번들 크기** | 0KB | 0KB | ~200KB | ~600KB | ~800KB |

### PixiJS 선정 이유

- 2D WebGL 전문 라이브러리로, GPU 가속 파티클을 간단한 API로 사용 가능
- ParticleContainer가 10만 개 이상의 파티클을 60fps로 렌더링
- Three.js는 3D가 필요 없으면 과잉이고, Raw WebGL은 셰이더를 직접 작성해야 해서 개발 속도가 크게 떨어짐
- p5.js는 교육용으로는 좋지만 성능 천장이 낮아서 "아트 플랫폼"으로 확장 시 병목

---

## 앱 프레임워크 비교

| | Vanilla JS | Svelte | React | Vue | Lit |
|---|---|---|---|---|---|
| **번들 크기** | 0KB | ~2KB | ~40KB | ~33KB | ~5KB |
| **Canvas 궁합** | 좋음 | **매우 좋음** | 보통 | 보통 | 좋음 |
| **상태 관리** | 직접 구현 | 내장 (반응형) | 외부 라이브러리 | 내장 | 직접 구현 |
| **컴포넌트 구조** | X | O | O | O | O |

### Svelte 선정 이유

- 컴파일 타임에 프레임워크가 사라져서 번들이 거의 Vanilla 수준으로 가벼움
- 반응형 상태 관리가 내장되어, 슬라이더 조작 시 Canvas가 즉시 반응하는 구조를 쉽게 구현
- React/Vue처럼 Virtual DOM이 Canvas 렌더링과 충돌하지 않음
- Canvas 영역은 PixiJS가, UI 영역은 Svelte가 각자 담당하는 깔끔한 분리 가능

---

## 빌드 도구

| | 없음 (현재) | Vite | Webpack |
|---|---|---|---|
| **개발 서버 속도** | 즉시 | 즉시 (HMR) | 느림 |
| **설정 복잡도** | 없음 | 거의 없음 | 높음 |
| **TypeScript 지원** | X | O (내장) | 플러그인 |
| **Svelte 지원** | X | 플러그인 1줄 | 가능 |

### Vite 선정 이유

- 설정이 거의 없고, Svelte + TypeScript를 바로 지원
- `vite build` 결과물이 정적 파일이라 GitHub Pages에 그대로 배포 가능

---

## TypeScript 전환 이유

- 파티클 시스템은 벡터, 물리 파라미터, 이펙트 설정 등 복잡한 데이터 구조를 다루게 됨. 타입 없으면 리팩토링 시 버그 급증
- PixiJS가 TypeScript 타입을 완벽 지원하여 자동완성 우수
- Vite가 별도 설정 없이 TypeScript를 처리
