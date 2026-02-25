# **그림이 눈처럼 내린다!**

인터랙티브 파티클 아트 플랫폼 — PixiJS WebGL 기반

> 쓸데없이 예쁘고 재밌는 웹페이지 만들기 프로젝트 1편 by KwonWonpyo (a.k.a 너구리오리)

## 이펙트 프리셋

| 프리셋 | 설명 |
|---|---|
| ❄️ 눈 | 하얀 눈송이가 부드럽게 내려옵니다 |
| 🌧️ 비 | 파란 빗방울이 빠르게 쏟아집니다 |
| 🌸 벚꽃 | 분홍 벚꽃잎이 바람에 흩날립니다 |
| 🍂 낙엽 | 주황 낙엽이 불규칙하게 떨어집니다 |

## 기능

- 4종 이펙트 프리셋 (눈, 비, 벚꽃, 낙엽)
- 실시간 파라미터 조절 (파티클 수, 크기, 속도, 색상 등)
- 마우스 인터랙션 (커서 근처 파티클 밀어내기)
- 배경색 및 배경 이미지 변경
- 커스텀 이미지 파티클 업로드

## 기술 스택

- **렌더링**: PixiJS (WebGL 2D)
- **UI**: Svelte 5
- **언어**: TypeScript
- **빌드**: Vite
- **배포**: GitHub Pages

## 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run check

# 린트
npx eslint src/

# 포맷
npx prettier --write .
```

## 프로젝트 구조

```
src/
├── lib/
│   ├── engine/          # 코어 파티클 엔진 (순수 TypeScript)
│   │   ├── Particle.ts
│   │   ├── Emitter.ts
│   │   ├── ParticleSystem.ts
│   │   └── physics/     # 벡터, 힘 (중력/바람/난류/인력/척력)
│   ├── renderer/        # PixiJS 렌더링 레이어
│   └── presets/         # 이펙트 프리셋 (눈, 비, 벚꽃, 낙엽)
├── components/          # Svelte UI 컴포넌트
├── stores/              # 상태 관리
└── App.svelte
```
