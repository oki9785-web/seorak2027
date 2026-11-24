# 2027 설악 원정대 랜딩 페이지 — 작업 안내 (Claude용)

이 저장소에서 작업을 시작하는 Claude가 먼저 읽는 파일입니다. 다른 PC에서 이어서 작업할 때를 위한 인수인계 메모입니다.

## 프로젝트
- 바이크루 × 양평자전거연맹 '2027 설악 원정대' 모집·훈련 독려 한 페이지 사이트
- 기획: [SPEC.md](SPEC.md) / 운영자용 수정 방법: [README.md](README.md)
- 정적 사이트(HTML + CSS + 바닐라 JS, 프레임워크·빌드 없음)
- 배포: Netlify, `main` 브랜치 루트 자동 배포 → https://seorak2027.netlify.app/ (2026-11-24 GitHub Pages에서 전환, Pages는 끔)
- 설정값은 `data/config.json`, 동계 훈련 11주는 `data/weeks.json`
- 디자인: `config.json`의 `"theme": "C"` (숲길: 숲 초록 + 중앙선 노랑). A~D 팔레트가 `assets/style.css`에 있음

## 작업 방식 (꼭 지킬 것)
1. **수정은 모아 두었다가, 사용자가 "올려 줘"라고 할 때만 `git push` 한다.** 작은 수정마다 올리지 않는다.
2. 수정 후에는 로컬 미리보기로 확인한 결과를 보여 주고, **아직 올리지 않은 수정 목록**을 알려 준다.
3. 페이지 문구를 바꾸면 **SPEC.md도 같은 내용으로 맞춘다.** (화면, SPEC.md, `data/*.json`이 항상 일치)
4. 사실(대회 역사, 숫자 등)은 **출처로 확인된 것만** 넣는다. 확인 못 한 내용은 넣지 말고 사용자에게 알린다.
5. 이모지는 쓰지 않는다. 모바일(카카오톡·네이버 앱 안 브라우저)이 우선.
6. 사용자에게는 한국어로 답한다.
7. 작업을 시작하기 전에 `git pull`로 최신 내용을 받는다. (여러 PC에서 번갈아 작업함)

## 로컬 미리보기
`index.html`을 더블클릭하면 데이터를 못 읽어 내용이 비어 보인다. 간단한 서버로 연다.
- Windows: `powershell -ExecutionPolicy Bypass -File .claude/serve.ps1` → http://localhost:8080
- Python이 있으면: `python -m http.server 8080`
- 날짜별 화면 확인: 주소 뒤에 `?date=2027-01-12`처럼 붙임

## 다음에 할 일 (2026-11-24 기준)
- Netlify 연결 완료 (2026-11-24). 대표 주소 https://seorak2027.netlify.app/ , og:url·og:image도 이 주소.
  - 남은 일: 카카오 공유 디버거에서 캐시 초기화, 카페 링크를 Netlify 주소로 교체 (사용자가 직접)
  - Netlify 방문자 공개 설정은 Public (팀 기본값이 비공개라 새 프로젝트는 확인 필요)
- 구글 폼 "2027 설악 원정대 참가 신청" 게시 완료, `googleFormUrl` 연결됨. 카페 공고글 주소가 나오면 `cafePostUrl`과 폼 확인 메시지에 넣기
- 아직 비어 있는 설정 (`data/config.json`): `cafePostUrl`, `cafeUrl`, `firstRideMeetingPoint`, 주별 응원 문구(`weeks.json`의 `cheer`), 대회 이동 방식(`raceTravelNote`)
- 2027 공식 요강이 나오면 `raceDate`, `raceDateIsEstimate`, 체크포인트 날짜 갱신
