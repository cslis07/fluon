# 변경 이력 (CHANGELOG)

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
