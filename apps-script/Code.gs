// RatioSense 로그 수집 백엔드 (Google Apps Script Web App)
// 배포: 편집기 → 배포 → 새 배포 → 웹 앱 → 액세스: '모든 사용자'
// 스크립트 속성에 TOKEN 설정: 프로젝트 설정 → 스크립트 속성 → TOKEN = ratiosense-2026

var SHEETS = {
  sessions: ['schemaVersion','sessionId','userCode','userName','codeValid','startTs','endTs','userAgent','screen','lang','appVersion','seq','clientTs'],
  trials:   ['schemaVersion','trialId','sessionId','userCode','userName','tab','activityId','taskId','attemptNo','startTs','endTs','outcome','trajectory','finalState','triggerRef','seq','clientTs'],
  events:   ['schemaVersion','eventId','trialId','sessionId','userCode','userName','tab','eventType','payload','seq','clientTs']
};

function doGet() {
  return json_({ ok: true, service: 'ratiosense-log' });
}

function doPost(e) {
  try {
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    var body = JSON.parse(e.postData.contents);
    if (!token || body.token !== token) {
      return json_({ ok: true, accepted: 0 }); // 조용히 무시(봇 차단)
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
