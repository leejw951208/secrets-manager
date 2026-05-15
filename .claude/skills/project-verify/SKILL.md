---
name: project-verify
description: spec.md, plan.md 기반으로 코드 리뷰, 기능 검증, 보안 감사를 수행하고 docs/features/<slug>/review.md를 생성한다. 사용 예. /project-verify user-login
---

# project-verify

검증 단계를 시작한다.

---

## 0. 대상 기능 확인

`$ARGUMENTS` 를 feature slug로 사용한다.

- `$ARGUMENTS` 가 있으면 그대로 사용한다. 예: `/project-verify user-login`
- `$ARGUMENTS` 가 없으면 사용자에게 묻는다. > 어떤 기능을 검증할까요?

`docs/features/$ARGUMENTS/` 경로와 구현 완료 여부를 확인한다.

```bash
ls docs/features/$ARGUMENTS/spec.md \
   docs/features/$ARGUMENTS/plan.md 2>/dev/null \
  && echo "DOCS_OK" || echo "DOCS_MISSING"

cat docs/features/$ARGUMENTS/phase.md 2>/dev/null
```

`DOCS_MISSING` 이면 중단한다.

> `docs/features/$ARGUMENTS/` 문서를 찾을 수 없습니다. `/project-plan` 을 먼저 실행하세요.

`phase.md` 가 `implemented` 가 아니면 사용자에게 알린다.

> 구현이 완료되지 않은 것 같습니다. 그대로 진행할까요?

---

## 1. 서브에이전트 디스패치

`{FEATURE_SLUG}` 를 확인된 실제 slug 값으로 치환하여 Task 툴로 아래 지시를 전달한다.

---

> FEATURE_SLUG 는 `{FEATURE_SLUG}` 다.
> 다음 단계를 순서대로 실행하라.
>
> ### 준비
>
> ```bash
> mkdir -p docs/features/{FEATURE_SLUG}
> echo "verifying" > docs/features/{FEATURE_SLUG}/phase.md
> ```
>
> 기존 `docs/features/{FEATURE_SLUG}/review.md` 가 있으면 OPEN 항목 수를 확인한다.
>
> ```bash
> grep -c "| OPEN |" docs/features/{FEATURE_SLUG}/review.md 2>/dev/null || echo "0"
> ```
>
> 출력이 `0` 이면 이미 완료된 리뷰다. 사용자에게 알리고 중단한다.
> > 이미 완료된 리뷰가 있습니다. 재실행할까요?
>
> `docs/features/{FEATURE_SLUG}/spec.md`, `plan.md` 를 읽는다.
>
> 디자인 산출물이 있으면 함께 읽는다.
>
> ```bash
> ls docs/features/{FEATURE_SLUG}/design.md 2>/dev/null
> ```
>
> 존재하면 “디자인 적합성” 검증 섹션을 활성화한다(아래 산출물 저장 단계 참조). 토큰 정의는 §1, 라이브 QA 결과(잔존 OPEN)는 §5 에서 인용한다.
>
> ### 코드 리뷰
>
> `Skill` 툴을 사용해 gstack의 `review` 스킬을 호출한다. 완료 후 결과를 수집한다.
>
> 이후 `spec.md`, `plan.md` 와 대조해 다음을 추가로 검토한다.
>
> - 각 요구사항의 구현 여부 (`DONE` / `PARTIAL` / `NOT DONE` / `CHANGED`)
> - plan.md 태스크 완료 여부
> - Spec에 없는 구현 (`SCOPE_CREEP`)
> - 테스트 커버리지 (`UNTESTED`)
>
> 파일:라인 근거 없이 `DONE` 판정하지 않는다.
>
> ### 기능 검증
>
> `Skill` 툴을 사용해 gstack의 `qa-only` 스킬을 호출한다. 완료 후 결과를 수집한다.
>
> ### 보안 감사
>
> `Skill` 툴을 사용해 gstack의 `cso` 스킬을 호출한다. 완료 후 결과를 수집한다.
>
> ### 산출물 저장
>
> 결과를 `docs/features/{FEATURE_SLUG}/review.md` 에 저장한다.
> 산출물 템플릿은 `${CLAUDE_SKILL_DIR}/templates/review.md` 를 읽고 해당 구조를 그대로 사용한다.
> 헤더/표 컬럼/순서를 임의로 바꾸지 않고, 각 섹션의 빈 셀과 플레이스홀더만 채운다.
>
> §7 디자인 적합성은 `docs/features/{FEATURE_SLUG}/design.md` 가 존재할 때만 채운다. 없으면 섹션 본문을 `없음 (디자인 단계 미실행)` 한 줄로 대체한다.
>
> ### 완료 보고
>
> ```bash
> echo "verified" > docs/features/{FEATURE_SLUG}/phase.md
> ```
>
> ```
> ✅ 검증 완료
>
> docs/features/{FEATURE_SLUG}/
>   └── review.md (생성됨)
>
> SPEC_ITEMS:  DONE {n} / PARTIAL {n} / NOT DONE {n}
> PLAN_TASKS:  완료 {n} / 미완료 {n}
> UNTESTED:    {n}건
> OPEN_ITEMS:  {n}건
>
> /project-patch {FEATURE_SLUG} 로 OPEN 항목을 해결한 후 /project-verify 를 재실행하세요.
> ```
>
> 여기서 종료한다.

---

서브에이전트가 완료되면 메인 세션으로 결과를 반환한다.
