# 2027 설악 원정대 랜딩 페이지

바이크루(BICREW) × 양평자전거연맹. 정적 페이지(HTML + CSS + 바닐라 JS)이고 GitHub Pages로 배포합니다.
기획 내용은 [SPEC.md](SPEC.md)에 있습니다.

## 파일 구조

```
index.html          페이지 본문, 공유 미리보기(og) 태그
assets/style.css    디자인 (A/B 색상 포함)
assets/main.js      날짜 계산, '이번 주 훈련' 카드, 카운트다운, 스크롤 움직임
assets/hero.jpg     (넣을 예정) 히어로 사진
assets/og-image.jpg (넣을 예정) 공유 미리보기 사진 1200×630
data/config.json    운영자가 고치는 설정
data/weeks.json     동계 훈련 11주 계획
netlify.toml        Netlify 배포 설정, 보안 헤더
.gitignore          GitHub에 올리지 않을 파일 (.env 등)
```

## 자주 고치는 것: `data/config.json`

| 항목 | 설명 |
|---|---|
| `theme` | 디자인 색. `"C"` 숲길(숲 초록+중앙선 노랑, 현재), `"D"` 안개 산(청회색), `"A"` 흰 바탕+초록, `"B"` 미색 바탕+주황 |
| `raceDate`, `raceStartTime` | 대회일과 그란폰도 출발 시각. 카운트다운·카드·일정표가 모두 이 값을 따름 |
| `raceDateIsEstimate` | 공식 요강이 나오면 `false`로 바꾸면 '예상일' 표시가 사라짐 |
| `confirmDeadline` | 참가 확정 마감일 (신청 섹션 D-day) |
| `googleFormUrl` | 구글 폼 주소. 비워 두면 버튼이 회색 '준비 중'으로 보임 |
| `cafePostUrl` | 카페 모집 공고글 주소 ('신청 완료!' 댓글 버튼). 비워 두면 위와 같음 |
| `cafeUrl` | 카페 주소 (푸터 '카페 쪽지' 링크). 비우면 신청글 주소를 씀 |
| `heroImage` | 히어로 사진 경로, 예: `"assets/hero.jpg"`. 비우면 산 능선 그림 |
| `firstRideMeetingPoint`, `firstRideStartTime` | 3/7 집결지와 출발 시간 |
| `checkpoints` | 원정대 일정 타임라인. `date`는 보이는 글자, `end`는 끝나는 날(지나면 회색) |
| `groupRideNotes` | 단체 훈련 표의 날짜별 한 줄 메모 (3/21 이후 코스 확정되면 여기에) |
| `raceTravelNote` | 대회 이동 안내 문구 (일정표 대회 행, 대회 주간 카드에 표시) |
| `race` | 대회 정보(2026년 기준). 2027 요강 발표 후 숫자 갱신 |

날짜는 모두 `YYYY-MM-DD`, 한국 시간 기준입니다. 쉼표·따옴표가 하나라도 빠지면 페이지가 안 뜨니,
고친 뒤 <https://jsonlint.com> 같은 곳에 붙여 넣어 확인하면 안전합니다.

## 주별 응원 메시지: `data/weeks.json`

각 주의 `"cheer": ""` 안에 문구를 넣으면 '이번 주 훈련' 카드 아래에 표시됩니다.
비어 있으면 `cheerTopic`(소재)만 카드 제목처럼 보입니다.

## 사진

- 히어로: `assets/hero.jpg` (가로 1600px 안팎, 300KB 이하 권장) → config의 `heroImage`에 경로 입력
- 공유 미리보기: `assets/og-image.jpg` (1200×630, 200KB 안팎)
- 얼굴이 나온 회원에게 사용 동의를 먼저 받아 주세요.

## 공유 미리보기(카카오톡·네이버)

`index.html` 맨 위 `og:` 태그는 JS로 바뀌지 않으므로 직접 고칩니다.
배포 주소가 정해지면 `og:url`에 주소를, `og:image`는 **전체 주소**로 바꿔 주세요.
예: `https://아이디.github.io/seorak2027/assets/og-image.jpg`
카카오톡은 미리보기를 캐시하므로, 바꾼 뒤엔 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 초기화합니다.

## 날짜 테스트

주소 뒤에 `?date=2027-01-12`처럼 붙이면 그 날짜 기준으로 보입니다(화면 아래에 '테스트 날짜' 표시).
확인할 만한 날짜: `2026-12-13`(시작 전), `2027-02-10`(9주차, 목요일 포인트), `2027-03-03`(준비 주간),
`2027-04-10`(시즌), `2027-05-20`(대회 주간), `2027-05-29`(대회 당일), `2027-06-01`(완주 후).

## 내 컴퓨터에서 미리 보기

`index.html`을 더블클릭하면 데이터 파일을 못 읽어 내용이 비어 보입니다. 간단한 서버로 여세요.
이 폴더에서 PowerShell로:

```
powershell -ExecutionPolicy Bypass -File .claude/serve.ps1
```

그다음 브라우저에서 <http://localhost:8080> 을 엽니다.

## 배포 (GitHub Pages)

1. GitHub에 저장소 만들기 (예: `seorak2027`), 이 폴더 내용을 올리기
2. 저장소 Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)`
3. 1~2분 뒤 `https://아이디.github.io/seorak2027/` 에서 확인
4. 이후엔 config.json 등을 고쳐 올리면 자동 반영 (반영까지 1~2분, 브라우저 캐시로 조금 늦게 보일 수 있음)
