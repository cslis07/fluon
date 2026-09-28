// Per-route page descriptors (headers, info boxes, chart config). Texts are
// transcribed verbatim from the original FluON pages.

export type InfoBox =
  | { tag: "term"; label: string; term: string; def: string }
  | { tag: "notice"; label: string; text: string }
  | { tag: "target"; label: string; text: string };

export type ChartKind = "age" | "season" | "subtype" | "vaccination";

export interface ChartPageCfg {
  eyebrow: string; // english subtitle
  title: string; // korean H1
  desc: string;
  boxes?: InfoBox[];
  kind: ChartKind;
  chartPill: string;
  chartTitle: string;
  unit: string; // shown as "단위: {unit}"
  endpoint: string; // /api/...
  query?: Record<string, string>; // fixed query (metric/target)
  seriesLabel: string; // "연령대 선택" | "아형 선택"
  metricWord: string; // used in footnote ("ILI", "ARI", ...)
  axisLabel?: string; // x/hover phrasing ("연령대별" | "절기별")
}

const CLINICAL_DESC =
  "인플루엔자 의사환자 임상감시는 의원급 표본감시의료기관(약 800개소)를 대상으로 매주 내원한 외래환자 중 인플루엔자 의사환자 수를 신고받는 감시체계 입니다.";
const CLINICAL_BOXES: InfoBox[] = [
  {
    tag: "term",
    label: "용어설명",
    term: "인플루엔자 의사환자 (Influenza like illness, ILI)",
    def: "38 °C 이상의 발열과 함께 기침, 인후통 증상을 보이는 사람",
  },
];
const CLINICAL_NOTICE: InfoBox = {
  tag: "notice",
  label: "안내사항",
  text: "26/27절기부터 의원급 표본감시 의료기관이 확대 운영됨에 따라 이전 절기와의 단순 비교 등 해석에 유의바랍니다.",
};

const NEDIS_DESC =
  "인플루엔자 응급실 환자감시(NEDIS)는 전국 응급의료기관에 방문한 인플루엔자 환자를 감시하여 위기상황을 조기에 감지하고 대응하기 위한 감시체계 입니다";
const NEDIS_BOXES: InfoBox[] = [
  {
    tag: "notice",
    label: "안내사항",
    text: "응급실 특성상 주말, 공휴일에 환자가 증가하는 경향이 있으므로 해석에 주의가 필요",
  },
];

const ARI_DESC =
  "급성호흡기감염증 표본감시사업에 참여하는 전국 병원급 이상 의료기관(223개소, ’26.9월 기준)를 대상으로 매주 연령층별 인플루엔자 신규 입원환자 수를 신고받는 감시체계입니다.";
const SARI_DESC =
  "중증급성호흡기감염증 표본감시(SARI)는 민간위탁사업에 참여하는 전국 종합병원급 이상 의료기관(42개소)에서 신고한 SARI 환자 중 병원체 검사 결과 인플루엔자 양성으로 확인된 환자 수를 보고하는 감시체계입니다.";
const SARI_BOXES: InfoBox[] = [
  {
    tag: "term",
    label: "용어설명",
    term: "SARI 환자",
    def: "38℃ 이상의 고열 및 기침을 동반하고 입원을 필요로 하며, 10일 이내에 증상을 보인 사람",
  },
];

const KRISS_DESC =
  "인플루엔자 병원체 감시(K-RISS)는 표본감시에 참여하는 1차 의원급 의료기관으로부터 수집된 호흡기감염증 의심환자 검체에 대한 유전자 검출 검사 결과 기반의 인플루엔자 감시체계입니다.";
const LAB_DESC =
  "인플루엔자 병원체 감시 (검사전문기관감시)는 민간 검사전문 의료기관에서 수집된 유전자 검출 검사 결과 기반의 인플루엔자 감시체계입니다.";
const LAB_BOXES: InfoBox[] = [{ tag: "notice", label: "안내사항", text: "24년 1월부터 운영" }];

const VAX_DESC =
  "인플루엔자 예방접종률은 매년 인플루엔자 국가예방접종 사업기간(매년 9월~다음해 4월)동안 인플루엔자 국가예방접종 대상이 백신을 접종받은 비율입니다.";

export const PAGES: Record<string, ChartPageCfg> = {
  // ---------------- clinical (ILI) ----------------
  "clinical/age": {
    eyebrow: "Influenza like illness, ILI",
    title: "의원급 임상감시 · 연령별",
    desc: CLINICAL_DESC,
    boxes: [...CLINICAL_BOXES, CLINICAL_NOTICE],
    kind: "age",
    chartPill: "연령별",
    chartTitle: "인플루엔자 의사환자(ILI) 연령별 현황",
    unit: "외래환자 1천명 당",
    endpoint: "/api/ili-age",
    seriesLabel: "연령대 선택",
    metricWord: "ILI",
    axisLabel: "연령대별",
  },
  "clinical/seasonal": {
    eyebrow: "Influenza like illness, ILI",
    title: "의원급 임상감시 · 절기별",
    desc: CLINICAL_DESC,
    boxes: [...CLINICAL_BOXES, CLINICAL_NOTICE],
    kind: "season",
    chartPill: "절기별",
    chartTitle: "인플루엔자 의사환자(ILI) 절기별 현황",
    unit: "외래환자 1천명 당",
    endpoint: "/api/ili-seasonal",
    seriesLabel: "절기 선택",
    metricWord: "ILI",
    axisLabel: "절기별",
  },

  // ---------------- emergency (NEDIS) ----------------
  "emergency/age": {
    eyebrow: "National Emergency Department Information System, NEDIS",
    title: "응급실 감시 · 연령별",
    desc: NEDIS_DESC,
    boxes: NEDIS_BOXES,
    kind: "age",
    chartPill: "연령별",
    chartTitle: "응급실 인플루엔자 환자 수(NEDIS) 연령별 현황",
    unit: "명",
    endpoint: "/api/age-comparison",
    query: { metric: "nedis" },
    seriesLabel: "연령대 선택",
    metricWord: "NEDIS",
    axisLabel: "연령대별",
  },
  "emergency/seasonal": {
    eyebrow: "National Emergency Department Information System, NEDIS",
    title: "응급실 감시 · 절기별",
    desc: NEDIS_DESC,
    boxes: NEDIS_BOXES,
    kind: "season",
    chartPill: "절기별",
    chartTitle: "응급실 인플루엔자 환자 수(NEDIS) 절기별 현황",
    unit: "명",
    endpoint: "/api/comparison",
    query: { metric: "nedis" },
    seriesLabel: "절기 선택",
    metricWord: "NEDIS",
    axisLabel: "절기별",
  },

  // ---------------- hospital ARI ----------------
  "hospital/ari/age": {
    eyebrow: "Acute respiratory infection, ARI",
    title: "급성호흡기감염증 감시(ARI) · 연령별",
    desc: ARI_DESC,
    kind: "age",
    chartPill: "연령별",
    chartTitle: "인플루엔자 입원환자(ARI) 연령별 현황",
    unit: "명",
    endpoint: "/api/age-comparison",
    query: { metric: "ari" },
    seriesLabel: "연령대 선택",
    metricWord: "ARI",
    axisLabel: "연령대별",
  },
  "hospital/ari/seasonal": {
    eyebrow: "Acute respiratory infection, ARI",
    title: "급성호흡기감염증 감시(ARI) · 절기별",
    desc: ARI_DESC,
    kind: "season",
    chartPill: "절기별",
    chartTitle: "인플루엔자 입원환자(ARI) 절기별 현황",
    unit: "명",
    endpoint: "/api/comparison",
    query: { metric: "ari" },
    seriesLabel: "절기 선택",
    metricWord: "ARI",
    axisLabel: "절기별",
  },

  // ---------------- hospital SARI ----------------
  "hospital/sari/age": {
    eyebrow: "Severe acute respiratory infection, SARI",
    title: "중증급성호흡기감염증 감시(SARI) · 연령별",
    desc: SARI_DESC,
    boxes: SARI_BOXES,
    kind: "age",
    chartPill: "연령별",
    chartTitle: "인플루엔자 환자(SARI) 연령별 현황",
    unit: "명",
    endpoint: "/api/age-comparison",
    query: { metric: "sari" },
    seriesLabel: "연령대 선택",
    metricWord: "SARI",
    axisLabel: "연령대별",
  },
  "hospital/sari/seasonal": {
    eyebrow: "Severe acute respiratory infection, SARI",
    title: "중증급성호흡기감염증 감시(SARI) · 절기별",
    desc: SARI_DESC,
    boxes: SARI_BOXES,
    kind: "season",
    chartPill: "절기별",
    chartTitle: "인플루엔자 환자(SARI) 절기별 현황",
    unit: "명",
    endpoint: "/api/comparison",
    query: { metric: "sari" },
    seriesLabel: "절기 선택",
    metricWord: "SARI",
    axisLabel: "절기별",
  },

  // ---------------- pathogen K-RISS ----------------
  "pathogen/kriss/age": {
    eyebrow: "Influenza pathogen surveillance, K-RISS",
    title: "K-RISS · 연령별",
    desc: KRISS_DESC,
    kind: "age",
    chartPill: "연령별",
    chartTitle: "의원급 의료기관 인플루엔자 검출률(K-RISS) 연령별 현황",
    unit: "%",
    endpoint: "/api/age-comparison",
    query: { metric: "kriss" },
    seriesLabel: "연령대 선택",
    metricWord: "검출률",
    axisLabel: "연령대별",
  },
  "pathogen/kriss/seasonal": {
    eyebrow: "Influenza pathogen surveillance, K-RISS",
    title: "K-RISS · 절기별",
    desc: KRISS_DESC,
    kind: "subtype",
    chartPill: "절기/아형별",
    chartTitle: "의원급 의료기관 인플루엔자 검출률(K-RISS) 절기/아형별 현황",
    unit: "%",
    endpoint: "/api/pathogen-seasonal",
    query: { metric: "kriss" },
    seriesLabel: "아형 선택",
    metricWord: "검출률",
    axisLabel: "아형별",
  },

  // ---------------- pathogen LAB (민간검사기관) ----------------
  "pathogen/lab/age": {
    eyebrow: "Influenza laboratory surveillance",
    title: "민간검사기관 · 연령별",
    desc: LAB_DESC,
    boxes: LAB_BOXES,
    kind: "age",
    chartPill: "연령별",
    chartTitle: "검사기관 인플루엔자 검출률(LAB) 연령별 현황",
    unit: "%",
    endpoint: "/api/age-comparison",
    query: { metric: "lab" },
    seriesLabel: "연령대 선택",
    metricWord: "검출률",
    axisLabel: "연령대별",
  },
  "pathogen/lab/seasonal": {
    eyebrow: "Influenza laboratory surveillance",
    title: "민간검사기관 · 절기별",
    desc: LAB_DESC,
    boxes: LAB_BOXES,
    kind: "subtype",
    chartPill: "절기/아형별",
    chartTitle: "검사기관 인플루엔자 검출률 절기/아형별 현황",
    unit: "%",
    endpoint: "/api/pathogen-seasonal",
    query: { metric: "lab" },
    seriesLabel: "아형 선택",
    metricWord: "검출률",
    axisLabel: "아형별",
  },

  // ---------------- vaccination ----------------
  "vaccination/senior": {
    eyebrow: "Influenza vaccination rates",
    title: "어르신 예방접종률",
    desc: VAX_DESC,
    boxes: [{ tag: "target", label: "예방접종사업 대상자", text: "65세 이상" }],
    kind: "vaccination",
    chartPill: "어르신",
    chartTitle: "어르신 인플루엔자 예방접종률",
    unit: "%",
    endpoint: "/api/vaccination-detail",
    query: { target: "senior" },
    seriesLabel: "연령대 선택",
    metricWord: "예방접종률",
    axisLabel: "연령대별",
  },
  "vaccination/child": {
    eyebrow: "Influenza vaccination rates",
    title: "어린이 예방접종률",
    desc: VAX_DESC,
    boxes: [
      {
        tag: "target",
        label: "예방접종사업 대상자",
        text: "(17/18절기) 6개월~59개월 → (18/19절기 & 19/20절기) 6개월~12세 → (20/21절기 이후) 6개월~13세",
      },
    ],
    kind: "vaccination",
    chartPill: "어린이",
    chartTitle: "어린이 인플루엔자 예방접종률",
    unit: "%",
    endpoint: "/api/vaccination-detail",
    query: { target: "child" },
    seriesLabel: "연령대 선택",
    metricWord: "예방접종률",
    axisLabel: "연령대별",
  },
};
