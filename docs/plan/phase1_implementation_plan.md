# Phase 1: 코어 엔진 구현 세부 계획

## 목표

현재 Vanilla HTML/CSS/JS 프로젝트를 **Svelte + TypeScript + PixiJS + Vite** 기반으로 리팩토링하고, 확장 가능한 파티클 엔진을 설계한다.

---

## 디렉토리 구조

```
/
├── src/
│   ├── lib/
│   │   ├── engine/                  # 코어 파티클 엔진 (프레임워크 무관)
│   │   │   ├── Particle.ts          # 개별 파티클 상태
│   │   │   ├── Emitter.ts           # 파티클 방출기
│   │   │   ├── ParticleSystem.ts    # 시스템 총괄 (Emitter + Force 관리)
│   │   │   ├── types.ts             # 공유 타입 정의
│   │   │   └── physics/
│   │   │       ├── Vector2.ts       # 2D 벡터 연산
│   │   │       ├── Forces.ts        # 힘 (중력, 바람, 난류)
│   │   │       └── index.ts
│   │   │
│   │   ├── renderer/                # PixiJS 렌더링 레이어
│   │   │   ├── PixiRenderer.ts      # PixiJS 래퍼
│   │   │   └── index.ts
│   │   │
│   │   └── presets/                 # 내장 이펙트 프리셋
│   │       ├── snow.ts              # 눈 (현재 기능 이관)
│   │       ├── rain.ts              # 비
│   │       ├── sakura.ts            # 벚꽃
│   │       ├── leaves.ts            # 낙엽
│   │       └── index.ts
│   │
│   ├── components/                  # Svelte UI 컴포넌트
│   │   ├── Canvas.svelte            # PixiJS 캔버스 마운트
│   │   ├── ControlPanel.svelte      # 메인 컨트롤 패널
│   │   ├── controls/
│   │   │   ├── SliderControl.svelte
│   │   │   ├── ColorPicker.svelte
│   │   │   ├── ImageUploader.svelte
│   │   │   └── PresetSelector.svelte
│   │   └── layout/
│   │       └── SidePanel.svelte     # 슬라이드 패널 레이아웃
│   │
│   ├── stores/                      # Svelte 스토어 (상태 관리)
│   │   ├── particleConfig.ts        # 파티클 설정 상태
│   │   └── appState.ts              # 앱 전역 상태
│   │
│   ├── App.svelte                   # 루트 컴포넌트
│   ├── main.ts                      # 엔트리포인트
│   └── app.css                      # 글로벌 스타일
│
├── public/
│   └── assets/                      # 정적 에셋 (아이콘 등)
│
├── docs/plan/                       # 기획 문서 (현재)
│
├── index.html                       # Vite 엔트리 HTML
├── package.json
├── tsconfig.json
├── svelte.config.js
├── vite.config.ts
└── README.md
```

---

## 코어 엔진 아키텍처

엔진은 **프레임워크에 의존하지 않는 순수 TypeScript**로 작성한다. 이후 Phase 3에서 npm 패키지로 추출할 수 있도록 `src/lib/engine/`은 Svelte나 PixiJS를 import하지 않는다.

### 핵심 모듈

```
┌─────────────────────────────────────────────┐
│              ParticleSystem                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │ Emitter │  │ Emitter │  │   Forces[]  │ │
│  │ (눈)    │  │ (벚꽃)  │  │ 중력/바람   │ │
│  └────┬────┘  └────┬────┘  └──────┬──────┘ │
│       │            │              │         │
│       ▼            ▼              │         │
│  ┌─────────────────────────┐      │         │
│  │     Particle Pool       │◄─────┘         │
│  │  (위치, 속도, 수명...)  │  힘 적용       │
│  └─────────────────────────┘                │
└──────────────────┬──────────────────────────┘
                   │ 상태 전달 (읽기 전용)
                   ▼
┌──────────────────────────────────────────────┐
│              PixiRenderer                    │
│  ParticleContainer로 GPU 가속 렌더링         │
└──────────────────────────────────────────────┘
```

### Particle

```typescript
interface ParticleState {
  position: Vector2;
  velocity: Vector2;
  size: number;
  rotation: number;
  opacity: number;
  age: number;        // 현재 생존 시간
  lifetime: number;   // 최대 수명
  color: number;      // hex
  textureId?: string; // 이미지 파티클용
}
```

### Emitter

파티클을 생성하는 방출기. 프리셋은 Emitter 설정의 조합이다.

```typescript
interface EmitterConfig {
  spawnRate: number;          // 초당 생성 수
  spawnArea: SpawnArea;       // 생성 영역 (선, 점, 사각형)
  particleLifetime: [min, max];
  initialSpeed: [min, max];
  initialDirection: [min, max]; // 각도 (라디안)
  initialSize: [min, max];
  initialRotation: [min, max];
  initialOpacity: [min, max];
  color: number | number[];    // 단색 또는 랜덤 선택
  texture?: string;            // 이미지 경로
}
```

### Force

파티클에 매 프레임 적용되는 힘.

```typescript
interface Force {
  type: 'gravity' | 'wind' | 'turbulence' | 'attract' | 'repel';
  apply(particle: ParticleState, dt: number): void;
}
```

- **Gravity**: 일정한 하향 가속도
- **Wind**: 수평 방향 힘 (시간에 따라 변화 가능)
- **Turbulence**: Simplex noise 기반 랜덤 흔들림 (눈송이 좌우 흔들림)
- **Attract/Repel**: 특정 좌표(마우스 등)를 향한 인력/척력

### Preset = Emitter 설정 + Force 조합

```typescript
// 예: 눈 프리셋
const snowPreset: PresetConfig = {
  emitter: {
    spawnRate: 50,
    spawnArea: { type: 'line', y: -20, x1: 0, x2: screenWidth },
    particleLifetime: [8, 15],
    initialSpeed: [30, 80],
    initialDirection: [Math.PI * 0.45, Math.PI * 0.55], // 대략 아래쪽
    initialSize: [3, 12],
    initialOpacity: [0.5, 1.0],
    color: 0xFFFFFF,
  },
  forces: [
    { type: 'gravity', strength: 20 },
    { type: 'turbulence', frequency: 0.5, amplitude: 30 },
  ]
};
```

---

## 마일스톤

### M1. 프로젝트 초기화 (1일)

- [ ] Vite + Svelte + TypeScript 프로젝트 스캐폴딩
- [ ] PixiJS 설치 및 기본 캔버스 렌더링 확인
- [ ] GitHub Actions로 `gh-pages` 브랜치 자동 배포 설정
- [ ] ESLint + Prettier 설정
- [ ] 기존 파일(`index.html`, `snowflake.js`, `snowflake.css`) → `legacy/` 디렉토리로 이동

### M2. 코어 엔진 구현 (3~4일)

- [ ] `Vector2` 클래스 (덧셈, 스칼라 곱, 정규화, 거리 등)
- [ ] `Particle` 클래스 (상태 관리, 수명 업데이트)
- [ ] `Emitter` 클래스 (설정 기반 파티클 생성, 오브젝트 풀링)
- [ ] `Force` 구현 (Gravity, Wind, Turbulence)
- [ ] `ParticleSystem` 클래스 (Emitter/Force 등록, 메인 루프 `update(dt)`)
- [ ] `PixiRenderer` (ParticleSystem 상태 → PixiJS ParticleContainer 동기화)
- [ ] 단위 테스트: Vector2 연산, Particle 수명, Emitter 생성률

### M3. 현재 기능 마이그레이션 (2~3일)

- [ ] 눈 프리셋 구현 (현재 앱과 동일한 동작 재현)
- [ ] Svelte `Canvas.svelte` — PixiJS Application 마운트
- [ ] Svelte `ControlPanel.svelte` — 현재 컨트롤 패널 UI 재구현
  - 눈송이 개수, 크기(최소/최대), 투명도, 낙하 속도, 속도 다양성
  - 배경색 변경
  - 이미지 업로드 (커스텀 파티클 텍스처)
- [ ] 패널 열기/닫기 애니메이션
- [ ] "바로 적용" / "모두 제거" 버튼 동작

### M4. 프리셋 확장 및 UI 개선 (3~4일)

- [ ] 추가 프리셋 구현: 비, 벚꽃, 낙엽
- [ ] `PresetSelector.svelte` — 프리셋 선택 UI (썸네일 + 이름)
- [ ] 파라미터 변경 시 실시간 반영 (Apply 버튼 없이)
- [ ] 바람 방향/세기 컨트롤 추가
- [ ] 마우스 인터랙션 (커서 근처 파티클 밀어내기)

### M5. 마무리 및 배포 (1~2일)

- [ ] 성능 프로파일링 (10,000 파티클 60fps 확인)
- [ ] 반응형 레이아웃 (모바일 대응)
- [ ] README 업데이트
- [ ] GitHub Pages 배포 확인
- [ ] `legacy/` 디렉토리 제거

---

## GitHub Pages 배포 전략

```yaml
# .github/workflows/deploy.yml
# main 브랜치 push 시:
#   1. npm install
#   2. npm run build
#   3. dist/ 폴더를 gh-pages 브랜치에 배포
```

`vite build`의 출력은 `dist/` 폴더에 정적 파일로 생성되므로, 현재 GitHub Pages 배포 방식과 동일하게 유지 가능.

`vite.config.ts`에 `base` 옵션을 리포지토리명으로 설정:

```typescript
export default defineConfig({
  base: '/ForFun_PicIsFalling/',
});
```

---

## 총 예상 기간

| 마일스톤 | 기간 | 누적 |
|---|---|---|
| M1. 프로젝트 초기화 | 1일 | 1일 |
| M2. 코어 엔진 구현 | 3~4일 | 4~5일 |
| M3. 현재 기능 마이그레이션 | 2~3일 | 6~8일 |
| M4. 프리셋 확장 및 UI 개선 | 3~4일 | 9~12일 |
| M5. 마무리 및 배포 | 1~2일 | **10~14일** |

Phase 1 완료 시점의 결과물: 현재 앱의 모든 기능 + 4가지 이펙트 프리셋 + 확장 가능한 파티클 엔진 + GitHub Pages 배포.
