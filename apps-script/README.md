# RatioSense 로그 백엔드 설정

1. 새 Google Sheets 문서 생성(예: "RatioSense Logs").
2. 시트 탭 `roster` 추가. 1행 헤더: `code | grade | class | number | name`. 2행부터 사전 발급 코드 명단 입력(예: `6-3-12 | 6 | 3 | 12 | 홍길동`).
   - sessions/trials/events 시트는 첫 전송 시 자동 생성된다.
3. 확장 프로그램 → Apps Script. `Code.gs` 내용 붙여넣기.
4. 프로젝트 설정(톱니) → 스크립트 속성 → 속성 추가: `TOKEN` = `ratiosense-2026`.
5. 배포 → 새 배포 → 유형: 웹 앱. 실행: 나, 액세스: 모든 사용자 → 배포. **웹 앱 URL 복사**.
6. `index.html`의 `LOG_CFG.endpoint`에 URL, `LOG_CFG.token`에 TOKEN 값을 넣는다.

## 검증
- 브라우저에서 웹 앱 URL 열기 → `{"ok":true,"service":"ratiosense-log"}` 표시되면 배포 성공.
