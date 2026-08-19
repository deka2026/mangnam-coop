/**
 * 망남마을학교 참가 신청 백엔드 (Google Apps Script 웹앱)
 *
 * 이 사이트는 GitHub Pages 정적 배포라 서버가 없다. 신청 저장과 관리자 조회를
 * 이 스크립트가 대신 맡고, 데이터는 이 스크립트가 붙은 스프레드시트에 쌓인다.
 *
 * 설치 절차는 apps-script/README.md 참고.
 *
 * 요청/응답 규약 (본문은 모두 JSON 문자열, Content-Type은 text/plain)
 *   파란교실(청년):
 *   { action: "apply", name, phone, email, team, avoid[], avoidEtc,
 *     wish[], wishEtc, optOut[], note }        -> { ok: true, id }
 *   연두교실(청소년)·푸른교실(장년) 스킴보드 신청:
 *   { action: "apply", program: "teen"|"senior", programLabel,
 *     name, phone, email, detailsText, note }  -> { ok: true, id }
 *   { action: "list",  password }              -> { ok: true, rows: [...] }
 *   ※ list는 파란교실('신청' 시트)만 반환한다. 스킴보드 신청은 '스킴보드신청' 시트에서 직접 확인.
 */

var SHEET_NAME = '신청';
var HEADERS = [
  'id', '신청일시', '이름', '전화번호', '이메일', '소속',
  '금기사항', '금기사항(기타)', '희망체험', '희망체험(기타)',
  '비희망 프로그램', '비고',
];

var CAMP_SHEET_NAME = '스킴보드신청';
var CAMP_HEADERS = [
  'id', '신청일시', '프로그램', '이름', '연락처', '이메일', '추가정보', '문의·요청',
];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'apply') return json(handleApply(body));
    if (body.action === 'list') return json(handleList(body));
    return json({ ok: false, error: '알 수 없는 요청입니다.' });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  // 브라우저로 직접 열었을 때 배포 상태만 확인할 수 있게 한다. 데이터는 주지 않는다.
  return json({ ok: true, service: '망남마을학교 신청 백엔드', ready: true });
}

function handleApply(body) {
  // 연두·푸른교실 스킴보드 신청은 별도 시트로 분리해 저장한다.
  if (body.program === 'teen' || body.program === 'senior') {
    return handleCampApply(body);
  }

  var name = trim(body.name);
  var phone = trim(body.phone);
  if (!name) throw new Error('이름이 비어 있습니다.');
  if (!phone) throw new Error('전화번호가 비어 있습니다.');

  var sheet = getSheet();
  var id = 'MNS-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMdd-HHmmss');

  // 동시 신청이 겹쳐 같은 행에 덮어쓰이지 않도록 잠근다.
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet.appendRow([
      id,
      new Date(),
      name,
      phone,
      trim(body.email),
      trim(body.team),
      joinList(body.avoid),
      trim(body.avoidEtc),
      joinList(body.wish),
      trim(body.wishEtc),
      joinList(body.optOut),
      trim(body.note),
    ]);
  } finally {
    lock.releaseLock();
  }

  notify(name, phone, body);
  return { ok: true, id: id };
}

function handleCampApply(body) {
  var name = trim(body.name);
  var phone = trim(body.phone);
  if (!name) throw new Error('이름이 비어 있습니다.');
  if (!phone) throw new Error('연락처가 비어 있습니다.');

  var label = trim(body.programLabel) || (body.program === 'teen' ? '연두교실' : '푸른교실');
  var sheet = getCampSheet();
  var id = 'MNC-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMdd-HHmmss');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet.appendRow([
      id,
      new Date(),
      label,
      name,
      phone,
      trim(body.email),
      trim(body.detailsText),
      trim(body.note),
    ]);
  } finally {
    lock.releaseLock();
  }

  notifyCamp(label, name, phone, body);
  return { ok: true, id: id };
}

function handleList(body) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!expected) throw new Error('서버에 관리자 비밀번호가 설정되지 않았습니다.');
  if (trim(body.password) !== expected) throw new Error('비밀번호가 올바르지 않습니다.');

  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return { ok: true, rows: [] };

  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var rows = values.map(function (r) {
    return {
      id: String(r[0]),
      createdAt: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      name: String(r[2]),
      phone: String(r[3]),
      email: String(r[4]),
      team: String(r[5]),
      avoid: splitList(r[6]),
      avoidEtc: String(r[7]),
      wish: splitList(r[8]),
      wishEtc: String(r[9]),
      optOut: splitList(r[10]),
      note: String(r[11]),
    };
  });
  rows.reverse(); // 최신 신청이 위로
  return { ok: true, rows: rows };
}

/** 신청이 들어오면 운영진에게 메일로 알린다. NOTIFY_EMAIL 속성이 없으면 건너뛴다. */
function notify(name, phone, body) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail(
      to,
      '[망남마을학교] ' + name + '님 참가 신청',
      [
        '이름: ' + name,
        '전화: ' + phone,
        '소속: ' + trim(body.team),
        '',
        '하지 말아야 할 것: ' + (joinList(body.avoid) || '(없음)'),
        '기타: ' + trim(body.avoidEtc),
        '',
        '원하는 체험: ' + (joinList(body.wish) || '(없음)'),
        '기타: ' + trim(body.wishEtc),
        '',
        '하고 싶지 않은 프로그램: ' + (joinList(body.optOut) || '(없음)'),
        '',
        '비고: ' + trim(body.note),
      ].join('\n')
    );
  } catch (err) {
    // 알림 실패가 신청 접수를 막아서는 안 된다.
  }
}

/**
 * 스프레드시트에 붙여 만든 스크립트면 getActiveSpreadsheet()가 그 시트를 준다.
 * script.google.com에서 독립형으로 만들었으면 null이 오므로,
 * 스크립트 속성 SPREADSHEET_ID에 적어 둔 시트를 대신 연다.
 */
function getSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error(
      '독립형 스크립트입니다. 스크립트 속성에 SPREADSHEET_ID를 등록해 주세요.'
    );
  }
  return SpreadsheetApp.openById(id);
}

function getSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getCampSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CAMP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CAMP_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CAMP_HEADERS);
    sheet.getRange(1, 1, 1, CAMP_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** 스킴보드(연두·푸른) 신청 알림. NOTIFY_EMAIL 속성이 없으면 건너뛴다. */
function notifyCamp(label, name, phone, body) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail(
      to,
      '[망남마을학교/' + label + '] ' + name + '님 신청',
      [
        '프로그램: ' + label,
        '이름: ' + name,
        '연락처: ' + phone,
        '이메일: ' + trim(body.email),
        '',
        '추가정보:',
        trim(body.detailsText) || '(없음)',
        '',
        '문의·요청: ' + (trim(body.note) || '(없음)'),
      ].join('\n')
    );
  } catch (err) {
    // 알림 실패가 신청 접수를 막아서는 안 된다.
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function trim(v) {
  return v == null ? '' : String(v).trim();
}

function joinList(v) {
  return Array.isArray(v) ? v.map(trim).filter(String).join(' | ') : trim(v);
}

function splitList(v) {
  return trim(v) ? trim(v).split('|').map(function (s) { return s.trim(); }).filter(String) : [];
}
