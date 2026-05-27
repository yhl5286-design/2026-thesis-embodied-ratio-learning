# 박자·단위화 두 탭 — Playwright 통합 검증

- 실행일: 2026-05-27
- 환경: `python -m http.server 8765` + Playwright MCP (Windows)
- 빌드: master `750c349` 시점 (Spec F 전 11 Task 통합 후)

## 검증 절차 요약

브라우저로 `http://localhost:8765/` 진입 → `doLogin('6-3-99','테스트')` → `switchTab('unit')` → 단위 카드 다중 시도 → `unitDiscover()` → 0≠1 토글 → `unitSetTwoLineAnswer('different')` → Stage 3 변환 + 체크리스트 → `switchTab('beat')` → 슬라이더·두드림 추출 → `beatDiscover()` → 0≠1 → `beatSetTwoLineAnswer('same')` → 등가×2 변환.

## 단위화 탭 (`unit`)

- ✅ 탭바 7개 노출 (📐 단위화 포함). `ALL_TABS` 배열 일치.
- ✅ `unitBuild()` 1회만 실행, `unitRoot.dataset.built === '1'`.
- ✅ 단위 카드 5종(𝅗𝅥/♩/♪/♬/3연음) 선택 시 한 마디 막대 slot 수 갱신 (`half`=2 slots).
- ✅ `unit.fill` trial 진입 시 생성, `attemptsByUnit`에 `[half, eighth, sixteenth]` 누적.
- ✅ `unitDiscover()` 후 `uunitReveal` 표시, "박수선/음표선" + "시간선" 텍스트 포함.
- ✅ 0≠1 토글 → `unitState.s2.zeroOneMode === 'one'` 전환.
- ✅ `unit.twoline` trial 자동 시작, `twoline_question_answer('different')` 후 `unit.transform` trial 진입.
- ✅ Stage 3 "변환·불변량" 패널 + 체크리스트 표시.
- ✅ `unitTransformUnit('quarter')` → `lastTransform = {type:'unit', before:'sixteenth', after:'quarter'}`.
- ✅ `unitToggleChanged('count')` / `unitToggleInvariant('ratio')` 정상 누적.

## 박자 탭 (`beat`)

- ✅ `beatBuild()` 1회만 실행. 좌/우 트랙·진행 막대 DOM 생성.
- ✅ `beatSetLeft(3)` → 슬라이더 카운트 "3박" 표시.
- ✅ `TapExtractor`로 두드림 `[0,600,1200,1800]ms` (간격 600ms, 마디 2400ms) → 4박 추출 정상 (±25% 관대도).
- ✅ `beatDiscover()` 후 `bbeatReveal` reveal, "Stage 2" + W4 교량(비/분수/나눗셈/백분율) + "12박마다" 만남 카운트 표시.
- ✅ `beat.twoline` trial 시작, `same` 응답 후 `beat.transform` 진입.
- ✅ `beatTransformEquiv(2)` → 3:4 → 6:8 (정수 등가 배수 정상).
- ✅ `lastTransform = {type:'equiv', before:[3,4], after:[6,8], k:2}`.

## 로깅

- ✅ `Logger._q()` 큐 적재 확인 — 5초/10건 batch로 자동 flush 동작 (검증 종료 시점 큐에 5건 남음, 이전 건은 이미 flush됨).
- ✅ 누적 적재된 activity: `unit.fill`, `unit.twoline`, `unit.transform`, `beat.meet`, `beat.twoline`, `beat.transform` (Spec F 8.1의 6 activity 전부 발생).
- ✅ events: `unit_select`, `discovery_trigger`, `zero_one_toggle`, `twoline_question_answer`, `transform_apply`, `invariance_check`, `tap`, `slider_change` 발생.
- ✅ console JS 에러 0 (favicon 404만 — 무관).
- 네트워크: Apps Script 적재까지 직접 확인은 세션 만료로 별도 검증 필요(이전 화음·소리 탭 Logger 인프라 그대로 사용, schema 무변경이라 회귀 위험 낮음).

## 순수 로직 (TDD)

- ✅ `tests/tapExtractor.pure.test.mjs` — 8/8 pass
- ✅ `tests/transforms.pure.test.mjs` — 9/9 pass

## 미해결 후속

- 실데이터 적재 시 Apps Script Sheet의 events·trials 컬럼 점검 필요 (Spec F 9절).
- 모바일 두드림 반응성·햅틱 실기기 테스트 필요.
- 자동 힌트(90초+3종 시도) 실수업 환경에서 적절도 평가.
