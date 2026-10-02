# 변경 이력 (CHANGELOG)

## 2026-10-02 — 데이터 활용 기능 4종

- **[ADD]** 모든 차트에 **CSV 다운로드 · PNG 저장** 버튼(제목·범례 포함 PNG 합성,
  UTF-8 BOM CSV). (참고: CDC FluView·Our World in Data)
- **[ADD]** 지역별 화면에 **여러 지역 겹쳐 비교** 추이 차트(`/api/region-trend`).
  원본 지역 데이터가 현재 절기 3주만 공개 → 3주 범위로 표시.
- **[ADD]** 홈 **전 절기 동주 대비 요약 카드**(`/api/season-compare`) — ILI 문장 +
  6개 지표 증감 칩.
- **[ADD]** 선택한 절기·계열을 **URL 쿼리에 저장**해 같은 화면 링크 공유
  (`?season=&series=`), 로드 시 복원.

## 2026-10-01 — Vercel Analytics 연결

- **[ADD]** `@vercel/analytics` 설치 + 루트 레이아웃에 `<Analytics />` 추가
  (방문 측정). 실제 수집 시작은 Vercel 대시보드에서 Web Analytics 활성화 필요.

## 2026-10-01 — 모바일 대응 · 후속 점검

- **[ADD]** 모바일(≤900px) 레이아웃: 상단 바 + 햄버거 오프캔버스 드로어, 콘텐츠
  풀폭, 카드 1열, 컨트롤 줄바꿈. 390px 기준 가로 오버플로 0 확인(CDP 실측)
- **[FIX]** 절기별 차트 기본 선택을 **최근 3개 절기**로 통일(원본 대조) —
  comparison 기반 페이지가 전체 선택되던 것 수정
- **[UPDATE]** 데이터 최신화 파이프라인 검증(harvest→build-data, 재구성 30/30
  byte-identical), 최신 주차 38주 유지

## 2026-09-28 — UI 개선 (원본 대조 피드백 반영)

- **[UPDATE]** 주요 발생 현황 지표 카드 미니차트에 **호버 툴팁**(절기·주차·수치) 추가
- **[UPDATE]** 연령대/절기/아형 선택 팝오버를 원본형으로 개편(제목 + 전체선택 버튼 +
  계열 색상 점), **전체선택 재클릭 시 전체해제** 토글
- **[UPDATE]** 차트 높이 확대(430→540px)·여백 조정으로 계열 구분 개선

## 2026-09-28 — 초기 구축 및 배포

- **[ADD]** FluON 인플루엔자·호흡기감염병 감시 대시보드 초기 구현
  - 원본 `fluon-web-ui-revision-v52-final-dat.vercel.app`(소스 유실)을 라이브 API
    전수 수확 → 번들 데이터셋으로 완전 재구축
  - 화면 16종(주요현황 / 임상감시 절기·연령·지역 / 병원급 ARI·SARI / 병원체
    K-RISS·검사기관 / 응급실 / 예방접종률 어르신·어린이)
  - API 라우트 8종(overview·comparison·ili-age·ili-region·ili-seasonal·
    age-comparison·pathogen-seasonal·vaccination-detail)
  - `scripts/harvest.mjs`(원본 API 수집) + `scripts/build-data.mjs`(정규화)
- **[ADD]** cslis07/fluon GitHub 저장소 생성, `fluon.vercel.app` 프로덕션 배포
- **[FIX]** Next.js 15.1.6 → **15.5.26** 업그레이드 (Vercel 보안 게이트 통과)
- **[FIX]** 홈 "최근 업데이트" 날짜 타임존 보정(UTC 밀림 → 로컬 기준)
- **[FIX]** 사이드바 KDCA 로고를 원본 비율(가로형 워드마크)로 표시
