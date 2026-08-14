// 망남마을학교 프로그램 정의.
// 상세페이지 안내와 신청 폼(하고 싶지 않은 프로그램 선택)이 같은 목록을 쓰도록 여기 모아 둔다.

export type Session = {
  /** 신청 데이터에 저장되는 값이므로 한 번 정하면 바꾸지 않는다. */
  id: string;
  time: string;
  title: string;
  desc: string;
  place: string;
  /** 신청 폼의 "하고 싶지 않은 프로그램" 보기로 노출할지 */
  optOut?: boolean;
  /** 희망자만 참여하는 선택 프로그램 */
  optional?: boolean;
};

export type Day = {
  no: number;
  label: string;
  theme: string;
  summary: string;
  sessions: Session[];
};

export const DAYS: Day[] = [
  {
    no: 1,
    label: "1일차 (목)",
    theme: "닿다",
    summary: "도시에서 섬으로. 말하지 않아도 되는 첫날, 4일간의 안전 규칙을 함께 만듭니다.",
    sessions: [
      {
        id: "d1-gather",
        time: "15:00",
        title: "망남 집결 · 오리엔테이션",
        desc: "오후 3시까지 교육문화스테이션으로 모입니다. 안전교육, 회복키트 수령.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-walk",
        time: "15:30",
        title: "망남항 침묵 산책",
        desc: "방파제와 전복 가두리를 바라보며 걷습니다. 아무 말도 하지 않아도 되는 시간입니다.",
        place: "망남방파제",
      },
      {
        id: "d1-open",
        time: "16:30",
        title: "입주식 · 여기서 안 해도 되는 것",
        desc: "신청서에 적어 주신 각자의 금기를 함께 확인하고, 4일간 지킬 안전 규칙을 만듭니다.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-test",
        time: "17:30",
        title: "사전검사 · 목표카드",
        desc: "번아웃(CBI)·우울(PHQ-9) 자가검사와 나의 4일 목표 적기",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d1-dinner",
        time: "18:00",
        title: "석식 · 마을 어머니 밥상",
        desc: "마을에서 차려 주는 첫 저녁",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-buddy",
        time: "19:30",
        title: "조 편성 · 마을살이 짝꿍 매칭",
        desc: "회복 경험이 있는 청년 1명과 3명이 한 조가 되어 4일과 이후 3개월을 함께합니다.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-free",
        time: "21:00",
        title: "자유시간 · 옥상 전망쉼터",
        desc: "별 보기(선택), 숙소 입실. 1인 1침상이 기본입니다.",
        place: "옥상 전망쉼터 · 숙소",
        optional: true,
      },
    ],
  },
  {
    no: 2,
    label: "2일차 (금)",
    theme: "배우다",
    summary: "바다가 일하는 법을 몸으로 배웁니다. 자기 이야기보다 손으로 하는 일이 먼저입니다.",
    sessions: [
      {
        id: "d2-dawn",
        time: "05:00",
        title: "새벽 어장 동행",
        desc: "어민의 실제 작업 시간에 맞춰 배에 오릅니다. 희망자 8명 한정, 구명조끼 필수.",
        place: "망남항",
        optOut: true,
        optional: true,
      },
      {
        id: "d2-breakfast",
        time: "08:00",
        title: "조식",
        desc: "",
        place: "마을식당",
      },
      {
        id: "d2-abalone",
        time: "09:30",
        title: "전복 분망·선별 공동작업",
        desc: "어촌계 주민강사와 함께 실제 작업 공정에 2인 1조로 참여합니다. 체험용 흉내가 아니라 마을에 실제로 남는 일입니다.",
        place: "망남활력스테이션 1F",
        optOut: true,
      },
      {
        id: "d2-elder",
        time: "13:30",
        title: "어르신 인터뷰 · 이 마을이 견뎌온 것들",
        desc: "2012년 볼라벤, 2018년 솔릭, 10년간 인구 29% 감소를 겪은 이야기를 듣고 기록합니다.",
        place: "망남리복지센터",
        optOut: true,
      },
      {
        id: "d2-media",
        time: "15:30",
        title: "마을 미디어 워크숍",
        desc: "드론과 스마트폰으로 마을을 기록합니다. (모두의마을미디어협동조합·전남영상위원회)",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d2-cook",
        time: "18:00",
        title: "공동 저녁 · 반씩 차리는 밥상",
        desc: "참가자와 주민이 절반씩 나눠 저녁을 준비합니다.",
        place: "교육문화스테이션 1F",
        optOut: true,
      },
      {
        id: "d2-circle",
        time: "19:30",
        title: "회고 서클 · 오늘 내가 한 작은 역할",
        desc: "오늘 마을에 남긴 내 몫을 한 문장으로 나눕니다. 듣기만 해도 됩니다.",
        place: "교육문화스테이션 1F",
        optOut: true,
      },
      {
        id: "d2-health",
        time: "21:00",
        title: "건강관리실 스트레칭 · 자유시간",
        desc: "조선대병원 어업안전보건센터와 함께하는 근골격 스트레칭(선택)",
        place: "교육문화스테이션 2F",
        optional: true,
      },
    ],
  },
  {
    no: 3,
    label: "3일차 (토)",
    theme: "만들다",
    summary: "전복 한 마리의 값이 어떻게 정해지는지 뜯어보고, 그 위에서 사업을 만들어 봅니다.",
    sessions: [
      {
        id: "d3-breakfast",
        time: "08:00",
        title: "조식",
        desc: "",
        place: "마을식당",
      },
      {
        id: "d3-market",
        time: "09:00",
        title: "22,000원에 만들어 18,000원에 파는 일",
        desc: "전복 유통구조 해부 워크숍. 산지 도매 경유 80%, '덤' 관행, 8년 사이 35.7% 떨어진 가격을 직접 계산해 봅니다.",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d3-subscribe",
        time: "10:30",
        title: "구독경제·공동구매 실전",
        desc: "망남 전복 공동구매 시범 결과를 리뷰하고 상품을 다시 설계합니다. (HBM·스마일아일랜드)",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d3-lunch",
        time: "12:00",
        title: "중식 · 로컬푸드 원가 계산",
        desc: "오늘 먹는 한 상의 원가를 함께 계산해 봅니다.",
        place: "마을식당",
      },
      {
        id: "d3-proto",
        time: "13:30",
        title: "팀별 미션 · 망남 로컬 비즈니스 3안",
        desc: "돌아와도 되는 마을(관계 유지형) · 완도 숨고르기 스테이(회복 체류형) · 이음 파트너 마을 매칭(동료지원 워케이션형)",
        place: "교육문화스테이션",
        optOut: true,
      },
      {
        id: "d3-field",
        time: "16:00",
        title: "현장 실사",
        desc: "큰개머리 낚시산장, 마을 빈집, 마을편의점 등 협동조합 사업 자산 답사",
        place: "마을 일원",
        optOut: true,
      },
      {
        id: "d3-present",
        time: "19:30",
        title: "마을 발표회",
        desc: "망남신활력 운영위원회와 주민들 앞에서 3안을 발표합니다. 채택된 안은 마을학교 정규 과정이 됩니다.",
        place: "교육문화스테이션 1F",
        optOut: true,
      },
      {
        id: "d3-night",
        time: "21:00",
        title: "자유시간",
        desc: "모닥불과 조용한 방을 함께 엽니다. 어느 쪽이든 괜찮습니다.",
        place: "마을 일원",
        optional: true,
      },
    ],
  },
  {
    no: 4,
    label: "4일차 (일)",
    theme: "잇다",
    summary: "돌아가는 길이 끊기지 않도록, 3개월 동안 이어질 연결을 만들어 둡니다.",
    sessions: [
      {
        id: "d4-checkout",
        time: "08:00",
        title: "조식 · 퇴실 정리",
        desc: "",
        place: "숙소",
      },
      {
        id: "d4-plan",
        time: "09:00",
        title: "사후검사 · 나의 3개월 실천 계획",
        desc: "연락받고 싶은 방식, 도움을 청할 사람 1명, 3개월 목표를 짝꿍과 함께 적습니다.",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d4-register",
        time: "10:30",
        title: "망남 관계인구 등록식",
        desc: "마을과의 연결을 공식화하고 다음 방문을 약속합니다.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d4-farewell",
        time: "12:00",
        title: "중식 · 마을 배웅 후 해산",
        desc: "마을식당에서 마지막 점심을 함께 먹고, 배웅과 함께 현장에서 해산합니다.",
        place: "마을식당",
      },
    ],
  },
];

/** 신청 폼 "하고 싶지 않은 프로그램" 보기 — 일정표에서 optOut 표시된 세션 + 촬영 노출 */
export const OPT_OUT_OPTIONS: { id: string; label: string }[] = [
  ...DAYS.flatMap((d) =>
    d.sessions
      .filter((s) => s.optOut)
      .map((s) => ({ id: s.id, label: `${d.no}일차 · ${s.title}` }))
  ),
  { id: "no-photo", label: "사진·영상에 내 얼굴이 나오는 것" },
];

/** 음식·일상에서 하지 말아야 할 것 */
export const AVOID_OPTIONS = [
  "갑각류 알레르기",
  "조개·패류 알레르기 (전복 포함)",
  "견과류·기타 식품 알레르기",
  "채식 (비건 / 락토·오보)",
  "종교·신념상 못 먹는 음식이 있음",
  "술을 마시지 않음 / 음주 자리가 불편함",
  "이른 아침 기상이 어려움",
  "큰 소리·시끄러운 환경이 힘듦",
  "낯선 사람과 같은 방을 쓰기 어려움 (1인실 필요)",
  "복용 중인 약 또는 지병이 있음",
];

/** 원하는 체험·프로그램 */
export const WISH_OPTIONS = [
  "전복 양식·가두리 작업 체험",
  "갯벌·해루질·바다 낚시",
  "마을 밥상 요리·로컬푸드 만들기",
  "드론·영상으로 마을 기록하기",
  "마을 어르신 이야기 듣기",
  "로컬 창업·상품 기획 워크숍",
  "혼자 걷기·명상·아무것도 안 하기",
];

export const TEAM_OPTIONS = [
  "리셋",
  "호식이 세마리치킨",
  "숨, 셋",
  "해당 없음 / 개인 신청",
];
