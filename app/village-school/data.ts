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
    label: "1일차 · 9/28(월)",
    theme: "닿다",
    summary: "도시에서 섬으로. 마을을 한 바퀴 걷고, 바다에서 보드를 타고, 저녁 밥상에서 서로를 소개합니다.",
    sessions: [
      {
        id: "d1-arrive",
        time: "15:00",
        title: "망남리 도착 · 체크인 · 오리엔테이션",
        desc: "오후 3시까지 완도 망남리 교육문화스테이션으로 각자 도착·집결합니다. 숙소 배정(남·여 분리)과 짐 풀기, 3박 4일 일정과 안전 수칙 안내.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-tour",
        time: "16:10",
        title: "마을 구경 (필수)",
        desc: "망남리 도보 투어 — 마을회관, 교육문화스테이션, 망남항, 해변. 나흘 동안 지낼 마을을 몸으로 익힙니다.",
        place: "마을 일원",
      },
      {
        id: "d1-skim",
        time: "17:10",
        title: "스킴보드 강습",
        desc: "이론(스킴보드의 역사·보드 명칭) → RDS 기초(드랍·밸런스 훈련) → 라이딩 영상 피드백. 미참가자는 장보기 조에 합류해 저녁 식재료를 사 옵니다.",
        place: "망남 해변",
        optOut: true,
      },
      {
        id: "d1-dinner",
        time: "18:40",
        title: "저녁식사",
        desc: "다 같이 준비하고 다 같이 정리하는 첫 밥상",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-intro",
        time: "19:30",
        title: "자기소개 시간",
        desc: "네 가지 질문 — 좋아하는 것, 못하는 것, 하기 싫은 것, 잘하는 것. 길게 말하지 않아도 됩니다.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d1-free",
        time: "21:00",
        title: "자유시간 · 취침",
        desc: "",
        place: "숙소",
        optional: true,
      },
    ],
  },
  {
    no: 2,
    label: "2일차 · 9/29(화)",
    theme: "만들다",
    summary: "AI를 배우고, 배운 것으로 각자 원하는 것을 만들어 발표합니다.",
    sessions: [
      {
        id: "d2-breakfast",
        time: "08:00",
        title: "조식",
        desc: "",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d2-ai",
        time: "10:00",
        title: "AI 교육 (2시간)",
        desc: "AI 기초와 활용 — 프롬프트 쓰는 법, 이미지·문서·웹페이지 만들기 실습. 노트북이나 스마트폰만 있으면 됩니다.",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d2-lunch",
        time: "12:00",
        title: "중식 · 외식",
        desc: "인근 식당에서 함께",
        place: "완도 일원",
      },
      {
        id: "d2-make",
        time: "13:30",
        title: "AI로 원하는 것 만들기",
        desc: "카드뉴스, 짧은 영상, 홈페이지, 노래 — 주제는 자유. 강사가 순회하며 돕습니다.",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d2-present",
        time: "17:00",
        title: "발표",
        desc: "한 사람 5분, 서로의 결과물에 피드백을 나눕니다.",
        place: "교육문화스테이션 2F",
        optOut: true,
      },
      {
        id: "d2-dinner",
        time: "18:00",
        title: "석식",
        desc: "",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d2-free",
        time: "19:00",
        title: "자유시간",
        desc: "해변 산책, 보드게임, 아무것도 안 하기",
        place: "마을 일원",
        optional: true,
      },
    ],
  },
  {
    no: 3,
    label: "3일차 · 9/30(수)",
    theme: "거닐다",
    summary: "새벽 일출로 하루를 열고, 완도를 거닐거나 파는 법을 배웁니다. 저녁엔 일자리 이야기.",
    sessions: [
      {
        id: "d3-sunrise",
        time: "05:00",
        title: "큰개머리 일출 탐방",
        desc: "차량과 도보로 이동해 큰개머리에서 일출을 봅니다. 희망자만, 담요는 준비해 드립니다.",
        place: "큰개머리",
        optOut: true,
        optional: true,
      },
      {
        id: "d3-breakfast",
        time: "08:00",
        title: "조식",
        desc: "늦게 일어나도 괜찮은, 여유 있는 아침",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d3-wando",
        time: "10:00",
        title: "트랙 A · 완도 어슬렁대기",
        desc: "완도읍 자유 탐방 — 수산시장, 카페, 완도타워. 점심은 자율, 17시 마을 복귀. 트랙은 신청서에서 미리 고릅니다.",
        place: "완도읍",
        optional: true,
      },
      {
        id: "d3-seller",
        time: "10:00",
        title: "트랙 B · 온라인 셀러 교육",
        desc: "스마트스토어·라이브커머스 기초, 전복 같은 마을 특산품을 상품으로 만드는 실습.",
        place: "교육문화스테이션 2F",
        optional: true,
      },
      {
        id: "d3-party",
        time: "18:00",
        title: "저녁식사 겸 네트워크 파티",
        desc: "\"이런 일자리가 필요하다\" — 포스트잇에 적어 붙이고, 먹고 이야기하며 서로의 일 이야기를 잇습니다.",
        place: "교육문화스테이션 1F",
      },
    ],
  },
  {
    no: 4,
    label: "4일차 · 10/1(목)",
    theme: "잇다",
    summary: "사교원과 인연을 맺고, 연결을 남긴 채 돌아갑니다.",
    sessions: [
      {
        id: "d4-checkout",
        time: "08:00",
        title: "조식 · 짐 정리 · 체크아웃",
        desc: "",
        place: "숙소",
      },
      {
        id: "d4-sakyowon",
        time: "10:00",
        title: "사교원과의 인연맺기",
        desc: "사회혁신교육원의 비전 소개, \"함께 일하기 위해 궁금한 것\" 질의응답, 이후 이어질 채널(기수 단톡방) 안내.",
        place: "교육문화스테이션 1F",
      },
      {
        id: "d4-lunch",
        time: "12:00",
        title: "중식 · 외식",
        desc: "마무리 점심",
        place: "완도 일원",
      },
      {
        id: "d4-depart",
        time: "13:30",
        title: "단체사진 · 설문 · 귀가",
        desc: "오후 2시에 해산합니다.",
        place: "교육문화스테이션 1F",
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

/** 원하는 체험·프로그램 (예시) */
export const WISH_OPTIONS = [
  "스킴보드 강습",
  "해안로 탐방",
  "AI 교육",
  "온라인셀러 교육",
  "취창업 교육",
];

export const TEAM_OPTIONS = [
  "리셋",
  "호식이 세마리치킨",
  "숨, 셋",
  "해당 없음 / 개인 신청",
];
