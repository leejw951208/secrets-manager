---
name: project-implement
description: 계획 문서를 기반으로 구현을 시작한다. docs/features/<slug>/ 의 spec.md, plan.md를 읽고 구현 태스크를 실행한다. 사용 예. /project-implement user-login
---

# project-implement

구현 단계를 시작한다. 본 스킬의 모든 작업은 **메인 세션에서 직접 수행**한다(서브에이전트 디스패치 없음).

---

## 0. 대상 기능 확인

`$ARGUMENTS` 를 feature slug로 사용한다.

- `$ARGUMENTS` 가 있으면 그대로 사용한다. 예: `/project-implement user-login`
- `$ARGUMENTS` 가 없으면 사용자에게 묻는다. > 어떤 기능을 구현할까요?

`docs/features/$ARGUMENTS/` 경로가 존재하는지 확인한다.

```bash
ls docs/features/$ARGUMENTS/spec.md docs/features/$ARGUMENTS/plan.md 2>/dev/null \
  && echo "DOCS_OK" || echo "DOCS_MISSING"
```

`DOCS_MISSING` 이면 중단한다.

> `docs/features/$ARGUMENTS/` 문서를 찾을 수 없습니다. `/project-plan` 을 먼저 실행하세요.

확인된 slug를 `FEATURE_SLUG` 로 사용한다.

---

## 1. 준비

```bash
mkdir -p docs/features/$FEATURE_SLUG
echo "implementing" > docs/features/$FEATURE_SLUG/phase.md
```

`docs/features/$FEATURE_SLUG/spec.md` 와 `plan.md` 를 읽는다.

디자인 단계 산출물이 있으면 함께 입력 컨텍스트로 사용한다.

```bash
ls docs/features/$FEATURE_SLUG/design.md \
   .design-cache/$FEATURE_SLUG/ 2>/dev/null
```

존재하면 모두 읽는다.
- `docs/features/$FEATURE_SLUG/design.md` — 디자인 토큰·선정 변형·OPEN 보완 항목·React 변환 매핑이 모두 들어 있는 단일 문서
- `.design-cache/$FEATURE_SLUG/` — 변환할 HTML/CSS 원본. design.md §4 “React 변환 매핑” 표에 명시된 대로 `apps/web/...` 로 옮긴다

React 변환 완료 후 `.design-cache/$FEATURE_SLUG/` 는 삭제해도 된다.

---

## 2. 코딩 제약

**단순함 우선**
- 한 번만 사용되는 코드에 추상화 계층을 만들지 않는다.
- 요청되지 않은 "유연성", "확장성", "설정 가능성"을 추가하지 않는다.
- 발생할 수 없는 시나리오에 대한 에러 처리를 작성하지 않는다.
- 작성한 코드가 200줄인데 50줄로 표현 가능하다면 다시 작성한다.

**변경 범위 최소화**
- 태스크와 직접 연관된 파일만 수정한다.
- 변경 대상이 아닌 인접 코드, 주석, 포맷팅을 "개선"하지 않는다.
- 깨지지 않은 코드를 리팩터링하지 않는다.
- 기존 스타일과 다르더라도 기존 스타일을 따른다.
- 변경과 무관한 데드 코드를 발견하면 보고만 한다. 직접 삭제하지 않는다.
- 자신의 변경으로 미사용 상태가 된 import, 변수, 함수는 제거한다.

**디자인 토큰 일치 (design.md 가 존재할 때만)**
- `design.md` §1 의 컬러/타이포/스페이싱 토큰을 그대로 사용한다. 색상 HEX 값을 코드에 직접 박지 않는다.
- `.design-cache/$FEATURE_SLUG/` 의 마크업/클래스 구조를 React/Next 컴포넌트로 옮길 때, 시각적 결과물(여백·정렬·폰트)이 동일해야 한다.
- `design.md` §3 의 OPEN 보완 항목 중 “HTML 단계 진입 전 반드시 반영” 으로 분류된 항목은 구현에 반드시 포함한다.
- 변환 매핑은 `design.md` §4 “React 변환 매핑” 표를 따른다.

---

## 3. 구현 파이프라인

**Step 1 — 구현 계획 수립**

`Skill` 툴을 사용해 `superpowers:writing-plans` 스킬을 호출한다.

- `spec.md` 의 요구사항과 `plan.md` 의 태스크 목록을 입력으로 사용한다.
- 기존 `plan.md` 에 태스크가 충분히 구체화되어 있으면 이 단계를 건너뛴다.

**Step 2 — 구현 실행**

태스크 단위로 직접 구현을 진행한다(메인 세션). 병렬 작업이 가능하다고 판단되는 독립 태스크가 있으면 `superpowers:dispatching-parallel-agents` 스킬을 사용해 그 부분만 한정적으로 분리해도 된다.

- 각 태스크 완료 시 `progress.md` 의 해당 태스크 상태를 업데이트한다.

**Step 3 — 테스트**

`Skill` 툴을 사용해 `superpowers:test-driven-development` 스킬을 호출한다.

- RED-GREEN-REFACTOR 사이클을 따른다.
- 테스트 없이 작성된 코드는 삭제하고 재작성한다.

---

## 4. progress.md 업데이트

모든 태스크 완료 후 `progress.md` 를 업데이트한다.

- 현재 단계: `구현`
- 각 태스크 상태: `✅ 완료`
- 최근 업데이트 날짜 갱신

---

## 5. 완료 보고

```bash
echo "implemented" > docs/features/$FEATURE_SLUG/phase.md
```

```
✅ 구현 완료

docs/features/$FEATURE_SLUG/
  └── progress.md (업데이트됨)

검증 준비가 되면 `/clear` 로 세션을 초기화한 뒤 `/project-verify $FEATURE_SLUG` 를 실행하세요.
```

여기서 종료한다. /project-verify 입력 전까지 추가 코드를 작성하지 않는다.
