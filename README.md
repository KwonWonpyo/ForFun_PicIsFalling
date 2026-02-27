# **그림이 눈처럼 내린다!**

인터랙티브 파티클 아트 플랫폼 — PixiJS WebGL 기반

> 쓸데없이 예쁘고 재밌는 웹페이지 만들기 프로젝트 1편 by KwonWonpyo (a.k.a 너구리오리)

## 이펙트 프리셋

| 프리셋 | 설명 |
|---|---|
| ❄️ 눈 | 6각 눈꽃 결정이 부드럽게 내려옵니다 |
| 🌧️ 비 | 물방울이 빠르게 쏟아집니다 |
| 🌸 벚꽃 | 5장 꽃잎이 바람에 흩날립니다 |
| 🍂 낙엽 | 단풍잎이 불규칙하게 떨어집니다 |

## 기능

### 기본 모드
- 4종 이펙트 프리셋 (눈, 비, 벚꽃, 낙엽) + 이미지 파티클
- 실시간 파라미터 조절 (파티클 수, 크기, 속도, 색상 등)
- 마우스 인터랙션 (커서 근처 파티클 밀어내기)
- 프리셋별 그라디언트 배경 + 배경 이미지 업로드

### 🌙 Ambient Mode
- 시간대 배경: 현재 시간에 맞는 배경 자동 적용 (새벽/아침/낮/노을/저녁/밤)
- 자동 프리셋 순환: 설정 간격(5~120초)으로 이펙트 자동 전환
- 전체화면 모드: 카페/매장 디스플레이용

### 🎨 Create Mode
- 장면 저장/불러오기 (JSON export/import)
- URL 공유 (Base64 인코딩 공유 링크)
- 스크린샷 PNG 내보내기
- 멀티 레이어 (여러 이펙트 동시 렌더링)

## 기술 스택

- **렌더링**: PixiJS 8 (WebGL 2D, 래스터 텍스처 캐시)
- **UI**: Svelte 5
- **언어**: TypeScript
- **빌드**: Vite 7
- **배포**: GitHub Pages

## 개발 환경

```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (HMR)
npm run build   # 프로덕션 빌드
npm run build:site # GitHub Pages(legacy source)용 site 빌드
npm run check   # 타입 체크
npx eslint src/ # 린트
```

## GitHub Pages 배포 참고

- 현재 GitHub Pages가 `Deploy from a branch (main / root)`인 경우, 루트 `index.html`은 자동으로 `/ForFun_PicIsFalling/site/`로 리다이렉트됩니다.
- `main`에 반영할 때는 `npm run build:site`를 실행해 `site/` 산출물을 함께 업데이트해야 합니다.

## 프로젝트 구조

```
src/
├── lib/
│   ├── engine/      # 코어 파티클 엔진 (순수 TypeScript)
│   ├── renderer/    # PixiJS 렌더링 레이어
│   ├── presets/     # 이펙트 프리셋 (눈, 비, 벚꽃, 낙엽)
│   ├── scene/       # 장면 저장/불러오기/URL 공유/스크린샷
│   └── ambient/     # 시간대 테마/프리셋 순환
├── components/      # Svelte UI 컴포넌트
├── stores/          # 상태 관리
└── App.svelte
```
