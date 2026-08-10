// 마을학교 신청 백엔드 설정.
//
// 이 사이트는 GitHub Pages 정적 배포(output: "export")라 서버가 없다.
// 그래서 신청 저장·조회는 Google Apps Script 웹앱 + 스프레드시트가 맡는다.
// 배포 절차는 apps-script/README.md 참고.
//
// 엔드포인트 URL은 정적 번들에 그대로 실리므로 비밀이 아니다.
// 웹앱은 저장(apply)만 열어 두고, 조회(list)는 관리자가 런타임에 입력한
// 비밀번호를 스크립트 속성과 대조해서만 응답한다. 비밀번호는 코드에 없다.
export const ENDPOINT =
  process.env.NEXT_PUBLIC_VILLAGE_SCHOOL_ENDPOINT ?? "";

/** 엔드포인트가 아직 연결되지 않았으면 폼은 "내용 복사 후 문의폼 전달" 방식으로 동작한다. */
export const CONTACT_FORM_URL = "https://sakyowon.poomasi.org/#/contact";

/** 신청 내용을 브라우저에도 남겨 두어, 전송 실패 시 사용자가 복구할 수 있게 한다. */
export const LOCAL_BACKUP_KEY = "mangnam-village-school-application";
