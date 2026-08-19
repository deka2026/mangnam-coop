// 마을학교 신청 백엔드 설정.
//
// 신청은 사교원 자체 서버(가비아)의 /api/applications 로 저장한다.
// 사이트와 API를 같은 출처(sakyowon.co.kr)에서 서빙하므로 상대경로면 충분하고
// 브라우저 CORS 문제가 없다. 서버 코드·설치는 sakyowon-site/server 참고.
//
// 필요하면 빌드 시 NEXT_PUBLIC_VILLAGE_SCHOOL_ENDPOINT 로 절대주소 재정의 가능
// (예: 정적이 아직 다른 출처에 있는 전환기).
export const ENDPOINT =
  process.env.NEXT_PUBLIC_VILLAGE_SCHOOL_ENDPOINT ?? "/api/applications";

/** 신청 데이터에 함께 보내는 사이트 식별자 (자체 서버가 여러 사이트를 공용으로 받음) */
export const SITE = "mangnam-coop";

/** 서버 연결 전이거나 전송 실패 시 폼은 "내용 복사 후 문의폼 전달" 방식으로 동작한다. */
export const CONTACT_FORM_URL = "https://sakyowon.poomasi.org/#/contact";

/** 신청 내용을 브라우저에도 남겨 두어, 전송 실패 시 사용자가 복구할 수 있게 한다. */
export const LOCAL_BACKUP_KEY = "mangnam-village-school-application";
