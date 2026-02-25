# AGENTS.md

## Cursor Cloud specific instructions

### 프로젝트 개요

**ForFun_PicIsFalling** — 눈송이 애니메이션 정적 웹페이지. Vanilla HTML/CSS/JS로 구성되어 있으며 빌드 도구, 패키지 매니저, 테스트 프레임워크, 린터가 없음.

### 개발 서버 실행

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080/` 으로 접속. 별도의 빌드 단계 없음.

### 주요 참고사항

- 외부 의존성(jQuery, spectrum-colorpicker2)은 CDN으로 로드됨. 인터넷 연결이 없으면 색상 선택기가 작동하지 않지만, 핵심 눈송이 애니메이션은 동작함.
- `package.json`, `Makefile`, Docker 파일 등 없음 — 의존성 설치 불필요.
- 자동화된 테스트, 린트 도구 없음. 변경사항은 브라우저에서 수동 확인.
- 파일 구조: `index.html`, `snowflake.js`, `snowflake.css`, `btn_openclose.png` (4개 소스 파일).
