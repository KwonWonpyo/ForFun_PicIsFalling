# Phase 2 결과 보고

## 목표

Phase 1의 코어 엔진 위에 Ambient Mode와 Create Mode를 추가하여, 단순한 "이펙트 뷰어"에서 **도구**로 격상시킨다.

## 달성 현황

| 마일스톤 | 내용 | 상태 |
|---|---|---|
| P2-M1 | 렌더러 최적화 (SVG → 래스터 Sprite) | ✅ 완료 |
| P2-M2 | 모드 탭 UI (기본/Ambient/Create) | ✅ 완료 |
| P2-M3 | Create — 장면 저장/불러오기, URL 공유 | ✅ 완료 |
| P2-M4 | Create — 스크린샷, 멀티 레이어 | ✅ 완료 |
| P2-M5 | Ambient — 시간대 배경, 자동 순환, 전체화면 | ✅ 완료 |
| P2-M6 | Ambient — 날씨 API, 음악 비주얼라이저 | ⏳ TODO |
| P2-M7 | 마무리 및 배포 | ✅ 완료 |

## 구현된 기능

### Phase 1.5: 이미지 파티클 + 그라디언트 배경

| 항목 | 내용 |
|---|---|
| 눈꽃 SVG | 6각 결정 형태 |
| 물방울 SVG | 길쭉한 물방울 (그라디언트) |
| 벚꽃잎 SVG | 5장 꽃잎 (방사형 그라디언트) |
| 단풍잎 SVG | 2종 변형 (잎맥 포함) |
| 배경 그라디언트 | 프리셋별 자동 전환 (밤하늘/흐린 하늘/봄/가을) |
| 모양 변형 | scaleX 진동 (꽃잎 뒤집힘), rotationSpeed (자연스러운 회전) |

### P2-M1: 렌더러 최적화

- `Graphics`(원) → `Sprite` + 사전 래스터화 `RenderTexture`
- `WeakMap` 기반 파티클↔텍스처 캐시, textureId 검증으로 프리셋 전환 시 올바른 텍스처 적용
- PixiJS v8 자동 배칭으로 성능 확보

### P2-M2: 모드 탭 UI

- 3탭 네비게이션: ✨ 기본 / 🌙 Ambient / 🎨 Create
- 공통 영역(프리셋 선택, 파라미터 슬라이더, 버튼)은 모든 모드에서 공유
- 모드별 전용 섹션이 탭 전환 시 표시/숨김

### P2-M3: Create Mode — 장면 저장/공유

| 기능 | 구현 |
|---|---|
| 💾 JSON 저장 | SceneData(v1) 스키마 → JSON 다운로드 |
| 📂 불러오기 | JSON 파일 선택 → 모든 파라미터 자동 복원 |
| 🔗 URL 공유 | Base64 인코딩 → 쿼리스트링 → 클립보드 복사 |
| 자동 복원 | 페이지 로드 시 `?scene=` 파라미터에서 자동 복원 |

### P2-M4: Create Mode — 스크린샷 + 멀티 레이어

| 기능 | 구현 |
|---|---|
| 📸 스크린샷 | PixiJS Canvas → PNG 캡처 → 자동 다운로드 |
| 멀티 레이어 | 독립 ParticleSystem + PixiRenderer per layer |
| 레이어 UI | 드롭다운 프리셋 선택 + 추가/제거 버튼 |

### P2-M5: Ambient Mode — 시간대/순환/전체화면

| 기능 | 구현 |
|---|---|
| 시간대 배경 | 6개 테마 (새벽/아침/낮/노을/저녁/밤), 1분마다 갱신 |
| 자동 프리셋 순환 | 4개 프리셋 순차 전환, 5~120초 간격 조절 |
| 전체화면 | HTML5 Fullscreen API 토글 |

## TODO (P2-M6 — 미구현)

다음 기능은 외부 의존성(API 키, 마이크 권한)이 필요하여 별도 진행 예정:

- **날씨 API 연동**: OpenWeatherMap API 키 필요. 현재 날씨에 따라 프리셋 자동 전환.
- **음악 비주얼라이저**: Web Audio API + 마이크 권한. BPM 분석으로 파티클 속도/밀도 실시간 변화.
- **커스텀 프리셋 저장**: localStorage 기반. 사용자가 조정한 파라미터를 이름 붙여 저장.
- **GIF/영상 녹화**: Canvas → WebM/GIF 내보내기.

## 디렉토리 구조 (Phase 2 최종)

```
src/
├── lib/
│   ├── engine/              # 코어 파티클 엔진 (순수 TS)
│   │   ├── Particle.ts      # 위치/속도/크기/수명/회전/scaleX 변형
│   │   ├── Emitter.ts       # 설정 기반 생성 + 오브젝트 풀링
│   │   ├── ParticleSystem.ts
│   │   ├── types.ts
│   │   └── physics/
│   │       ├── Vector2.ts
│   │       └── Forces.ts    # Gravity/Wind/Turbulence/Attract/Repel
│   ├── renderer/
│   │   └── PixiRenderer.ts  # Sprite + 래스터 텍스처 캐시
│   ├── presets/              # 4종 (snow/rain/sakura/leaves)
│   ├── scene/               # 장면 저장/불러오기/URL 공유/스크린샷
│   └── ambient/             # 시간대 테마/프리셋 순환
├── components/
│   ├── Canvas.svelte         # PixiJS + 멀티 레이어
│   ├── ControlPanel.svelte   # 모드별 분기 + 공통 컨트롤
│   ├── AmbientPanel.svelte   # 시간대/순환/전체화면
│   ├── CreatePanel.svelte    # 저장/공유/스크린샷/레이어
│   ├── controls/
│   │   ├── ModeTabs.svelte
│   │   ├── PresetSelector.svelte
│   │   ├── SliderControl.svelte
│   │   ├── ColorPicker.svelte
│   │   └── ImageUploader.svelte
│   └── layout/
│       └── SidePanel.svelte
├── stores/
│   ├── particleConfig.ts
│   └── appState.ts
└── App.svelte
```
