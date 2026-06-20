// RatioSense v2 로그 수집 백엔드 (Google Apps Script Web App) — v2 파일럿 전용
// ※ 운영(루트 앱)과 분리: '새 구글 시트'를 만들고 그 시트의 Apps Script에 이 코드를 붙여넣어 배포하세요.
//
// 배포 절차:
//  1) 새 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용 붙여넣기
//  2) 프로젝트 설정 → 스크립트 속성 → TOKEN = ratiosense-v2-2026   (v2 앱이 보내는 토큰과 반드시 일치)
//  3) 배포 → 새 배포 → 유형: 웹 앱 → 실행: 나, 액세스: '모든 사용자' → 배포
//  4) 표시되는 웹 앱 URL(/exec)을 복사해서 전달
//
// 차이점(운영 Code.gs 대비): 모든 시트 헤더에 appVariant 컬럼 추가 → v2 데이터 태그 저장.

var SHEETS = {
  sessions: ['schemaVersion','appVariant','sessionId','userCode','userName','codeValid','startTs','endTs','userAgent','screen','lang','appVersion','seq','clientTs'],
  trials:   ['schemaVersion','appVariant','trialId','sessionId','userCode','userName','tab','activityId','taskId','attemptNo','startTs','endTs','outcome','trajectory','finalState','triggerRef','seq','clientTs'],
  events:   ['schemaVersion','appVariant','eventId','trialId','sessionId','userCode','userName','tab','eventType','payload','seq','clientTs']
};

function doGet() {
  return json_({ ok: true, service: 'ratiosense-log-v2' });
}

function doPost(e) {
  try {
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    var body = JSON.parse(e.postData.contents);
    if (!token || body.token !== token) {
      return json_({ ok: true, accepted: 0 }); // 토큰 불일치 → 조용히 무시(봇 차단)
    }
    var recs = body.records || [];
    var byType = { sessions: [], trials: [], events: [] };
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      var t = r._t; // 'sessions' | 'trials' | 'events'
      if (byType[t]) {
        if (t === 'sessions') r.codeValid = isValidCode_(r.userCode);
        byType[t].push(r);
      }
    }
    var accepted = 0;
    for (var t2 in byType) {
      if (byType[t2].length) accepted += appendRows_(t2, byType[t2]);
    }
    return json_({ ok: true, accepted: accepted });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendRows_(sheetName, rows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var header = SHEETS[sheetName];
  if (sh.getLastRow() === 0) sh.appendRow(header);
  var matrix = rows.map(function (r) {
    return header.map(function (h) {
      var v = r[h];
      if (v && typeof v === 'object') return JSON.stringify(v);
      return v == null ? '' : v;
    });
  });
  sh.getRange(sh.getLastRow() + 1, 1, matrix.length, header.length).setValues(matrix);
  return matrix.length;
}

// (선택) 'roster' 시트 A열에 허용 코드(학년-반-번호)를 넣으면 codeValid에 유효성 기록.
function isValidCode_(code) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('roster');
  if (!sh || sh.getLastRow() < 2) return '';
  var codes = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); });
  return codes.indexOf(String(code).trim()) >= 0;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
