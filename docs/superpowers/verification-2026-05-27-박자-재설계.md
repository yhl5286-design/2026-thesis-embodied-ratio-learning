# 박자 탭 재설계 — Playwright 통합 검증

- 실행일: 2026-05-27
- 빌드: master `5c77da8` (재설계 3/3 직후)
- 환경: `python -m http.server 8765` + Playwright MCP

## 재설계 동기

학습자 피드백: 기존 "두 메트로놈 폴리리듬"이 진입부터 너무 어려움. dj-babymix.com 참고하여 손박수 → 합주 → DJ mix 진입 곡선으로 재설계.

## Stage 1 — 손박수

- ✅ 탭 진입 시 `beatState.stage=1`, `beats=4` (기본).
- ✅ `beatStage1SetBeats(3)` → `beats=3` 갱신.
- ✅ 박수 3회 시뮬레이션(`barStart` 직후 호출) → `correct=3`, `total=3`, `unlocked=true`.
- ✅ 해제 배너(`bbeatUnlock`) display:block, "Stage 2 · 합주 시작" 버튼 노출.

## Stage 2 — 리듬 합주 (다중 트랙 layer)

- ✅ `beatEnterStage2()` → `stage=2`, 첫 트랙 `base:3` 자동 적재(Stage 1 박 수 계승).
- ✅ `beatStage2AddTrack('drum')`, `beatStage2AddTrack('melody')` → 트랙 3개.
- ✅ `beatStage2ChangeBeats(2, 2)` → melody 박 수 2→4.
- ✅ 3개 메트로놈(`s2-base`, `s2-drum`, `s2-melody`) 모두 `isRunning=true`.
- ✅ `beatStage2Discover()` → `found=true`, reveal 영역에 "짝지어" + "비" 텍스트 노출 (W4 교량 정상 호출).

## Stage 3 — DJ Mix

- ✅ `beatStage2SetTwoLineAnswer('different')` → `stage=3`, `beatState.s3` 생성.
- ✅ `beatStage3Equiv(2)` → 모든 트랙 박 수 [3,2,4] → [6,4,8] (정수 등가 변환 정상).
- ✅ `lastTransform = {type:'equiv', before:[3,2,4], after:[6,4,8], k:2}`.

## 로깅

- ✅ console JS 에러 0 (favicon 404만).
- ✅ activity 6개 새 식별자(beat.clap, beat.layer, beat.dj + unit 3) 정상 발화 가능.
- 신규 events: `clap`, `clap_accurate`, `stage1_unlock`, `track_add`, `track_remove`, `track_beats_change`, `track_toggle`, `meet_resonance`.

## 미해결 후속

- 다중 트랙 만남 ⚡ 시각·청각 강도 실수업에서 평가.
- 트랙 5개 동시 재생 시 모바일 성능 점검.
- 짝짓기 버튼이 3개 이상 트랙에서 직관적인지 평가 (현재는 2개만 선택 가능).
