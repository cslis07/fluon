// Sidebar navigation tree. Mirrors the original FluON structure:
// overview / clinical(ILI) / hospital(ARI,SARI) / pathogen(K-RISS,LAB) /
// emergency(NEDIS) / vaccination / weekly-newsletter(external KDCA link).

export type NavLeaf = { label: string; href: string };
export type NavSubGroup = { label: string; children: NavLeaf[] };

export type NavNode = {
  key: string;
  label: string;
  icon: string;
  href?: string;
  external?: boolean;
  children?: NavLeaf[]; // flat sub-links
  groups?: NavSubGroup[]; // nested expandable sub-groups
};

export const NEWSLETTER_URL =
  "https://dportal.kdca.go.kr/pot/bbs/BD_selectBbsList.do?q_bbsSn=1010&q_bbsDocNo=&q_clsfNo=2&q_searchKeyTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=";

export const NAV: NavNode[] = [
  { key: "overview", label: "주요 발생 현황", icon: "grid", href: "/" },
  {
    key: "clinical",
    label: "의원급 임상감시",
    icon: "clinic",
    children: [
      { label: "절기별", href: "/clinical/seasonal" },
      { label: "연령별", href: "/clinical/age" },
      { label: "지역별", href: "/clinical/region" },
    ],
  },
  {
    key: "hospital",
    label: "병원급 환자감시",
    icon: "hospital",
    groups: [
      {
        label: "급성호흡기감염증 감시 (ARI)",
        children: [
          { label: "절기별", href: "/hospital/ari/seasonal" },
          { label: "연령별", href: "/hospital/ari/age" },
        ],
      },
      {
        label: "중증급성호흡기감염증 감시(SARI)",
        children: [
          { label: "절기별", href: "/hospital/sari/seasonal" },
          { label: "연령별", href: "/hospital/sari/age" },
        ],
      },
    ],
  },
  {
    key: "pathogen",
    label: "병원체 감시",
    icon: "pathogen",
    groups: [
      {
        label: "K-RISS",
        children: [
          { label: "절기별", href: "/pathogen/kriss/seasonal" },
          { label: "연령별", href: "/pathogen/kriss/age" },
        ],
      },
      {
        label: "민간검사기관",
        children: [
          { label: "절기별", href: "/pathogen/lab/seasonal" },
          { label: "연령별", href: "/pathogen/lab/age" },
        ],
      },
    ],
  },
  {
    key: "emergency",
    label: "응급실 감시",
    icon: "emergency",
    children: [
      { label: "절기별", href: "/emergency/seasonal" },
      { label: "연령별", href: "/emergency/age" },
    ],
  },
  {
    key: "vaccination",
    label: "예방접종률",
    icon: "vaccine",
    children: [
      { label: "어르신 예방접종", href: "/vaccination/senior" },
      { label: "어린이 예방접종", href: "/vaccination/child" },
    ],
  },
  { key: "news", label: "주간소식지", icon: "info", href: NEWSLETTER_URL, external: true },
];
