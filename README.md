# FluON — 인플루엔자·호흡기감염병 감시 대시보드

질병관리청(KDCA) 공개 감염병 감시 데이터를 시각화하는 대시보드입니다.
Next.js(App Router) + Recharts 로 구현했으며, 데이터는 KDCA 감염병포털
(`dportal.kdca.go.kr`)의 공개 감시 자료 스냅샷을 번들로 포함합니다.

## 구성

- **화면 16종**: 주요 발생 현황(overview) / 의원급 임상감시(ILI: 절기·연령·지역) /
  병원급 환자감시(ARI·SARI) / 병원체 감시(K-RISS·민간검사기관) / 응급실 감시(NEDIS) /
  예방접종률(어르신·어린이)
- **API 라우트 8종**: `/api/{overview,comparison,ili-age,ili-region,ili-seasonal,age-comparison,pathogen-seasonal,vaccination-detail}`
- **데이터**: `data/*.json` (번들). 원본 API 스냅샷을 `scripts/harvest.mjs` 로 수집하고
  `scripts/build-data.mjs` 로 정규화해 생성합니다. (`data/raw/` 는 재생성 가능한 캐시)

## 개발

```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm start
```

데이터 재수집(선택):

```bash
npm run harvest      # 원본 API → data/raw
npm run build-data   # data/raw → data/*.json
```

## 기술 스택

Next.js 15 · React 19 · Recharts · TypeScript · Pretendard

> 데이터 출처: 질병관리청(KDCA) 감염병포털 공개 감시 자료. 본 대시보드는 자료 시각화용이며
> 공식 발표 수치는 KDCA 원본을 확인하시기 바랍니다.
