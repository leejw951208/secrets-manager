---
name: project-design
description: gstack 디자인 스킬 5종(design-consultation → design-shotgun → plan-design-review → design-html → design-review)을 한 번의 호출로 순차 실행하고, 결과를 docs/features/<slug>/design.md 한 파일에 누적 저장한다. 사용 예. /project-design 사용자 로그인
---

# project-design

디자인 단계를 시작한다. 본 스킬의 모든 작업은 **메인 세션에서 직접 수행**한다(서브에이전트 디스패치 없음).

`design-consultation` → `design-shotgun` → `plan-design-review` → `design-html` → `design-review` 를 한 번의 호출로 이어서 실행하며, 모든 영구 산출물은 `docs/features/<slug>/design.md` 한 파일에 섹션으로 누적한다.

---

## 0. 기능 설명 수집

`$ARGUMENTS` 를 입력으로 사용한다. 기능 설명(NEW) 또는 기존 slug(RESUME) 둘 다 받는다.

- `$ARGUMENTS` 가 있으면 그대로 사용한다. 예: `/project-design 사용자 로그인`
- `$ARGUMENTS` 가 없으면 사용자에게 묻는다. > 어떤 화면/기능의 디자인을 진행할까요? 기능 설명 또는 기존 slug를 입력하세요.

`docs/features/$ARGUMENTS/spec.md` 존재 여부로 분기한다.

```bash
ls docs/features/$ARGUMENTS/spec.md 2>/dev/null && echo "RESUME" || echo "NEW"
```

- **`NEW`** → `$ARGUMENTS` 를 기능 설명으로 보고 kebab-case slug로 변환한다.
  - 한국어 → 영어로 의미 번역 후 kebab-case 적용
  - 예: "사용자 로그인" → `user-login`, "결제 수단 등록" → `payment-method-registration`
  - 변환된 slug를 사용자에게 확인한다. > `docs/features/<slug>/design.md` 에 디자인 산출물을 누적할게요. 맞나요?
- **`RESUME`** → `$ARGUMENTS` 를 slug로 그대로 사용한다.

확인된 slug를 `FEATURE_SLUG` 로 사용한다.

---

## 1. 준비

```bash
mkdir -p docs/features/$FEATURE_SLUG .design-cache/$FEATURE_SLUG
echo "designing" > docs/features/$FEATURE_SLUG/phase.md
[ -f docs/features/$FEATURE_SLUG/design.md ] || \
  cp ${CLAUDE_SKILL_DIR}/templates/design.md docs/features/$FEATURE_SLUG/design.md
```

기존 `design.md` 가 있으면 상단 체크박스를 읽어 시작 지점을 정한다.

| design.md 상단 체크박스 | 시작 단계 |
|------------------------|----------|
| 1 시스템 미체크 | 2단계 (CONSULT) |
| 1만 체크 | 3단계 (SHOTGUN) |
| 2까지 체크 | 4단계 (PLAN REVIEW) |
| 3까지 체크 | 5단계 (HTML) |
| 4까지 체크 | 6단계 (LIVE REVIEW) |

---

## 산출물 규약

- 모든 영구 산출물은 `docs/features/$FEATURE_SLUG/design.md` §1~§5 에 누적한다. 새 파일을 만들지 않는다.
- **`design.md` 의 섹션 구조(표·서브섹션·필드)는 `${CLAUDE_SKILL_DIR}/templates/design.md` 를 읽고 그대로 사용한다.** 헤더/표 컬럼/순서를 임의로 바꾸지 않고, 각 단계에서는 해당 섹션의 빈 셀과 플레이스홀더만 채운다.
- HTML/CSS는 `.design-cache/$FEATURE_SLUG/` 에 임시 보관한다(gitignored).
- 변형 후보 HTML/스크린샷, 라이브 QA 스크린샷은 영구 보존하지 않는다.
- 하위 스킬은 `Skill` 툴로 호출하고 dispatch 로직을 복제하지 않는다. 하위 스킬의 “여기서 종료한다” 지시는 무시하고 다음 단계로 진행한다.
- 어느 단계든 하위 스킬이 실패를 보고하면 즉시 중단하고 현재까지의 결과를 보고한다.

---

## 2. CONSULT (디자인 시스템 정의)

`Skill` 툴로 `design-consultation` 스킬을 호출한다. (`$FEATURE_SLUG` 와 기능 설명을 컨텍스트로 전달)

추출한 컬러 토큰·타이포·스페이싱·모션·컴포넌트 원칙을 `design.md` 의 **§1 디자인 시스템 (CONSULT)** 섹션에 채워 넣는다. 임시 파일은 모두 삭제하고 상단 체크박스 “1 시스템” 을 체크한다.

```bash
rm -f DESIGN.md fonts.html colors.html 2>/dev/null
```

---

## 3. SHOTGUN (변형 후보 생성)

`Skill` 툴로 `design-shotgun` 스킬을 호출한다. (디자인 시스템을 컨텍스트로 전달)

생성된 변형 후보를 사용자에게 비교 보드로 보여주고 선정 의견을 받는다. 평가 매트릭스, 선정 결과, 기각 사유를 `design.md` 의 **§2 변형 탐색 (SHOTGUN)** 섹션에 기록한다. 변형 HTML/PNG 자체는 보존하지 않는다.

```bash
rm -rf design-shotgun-variants/ shotgun-output/ 2>/dev/null
```

상단 체크박스 “2 변형” 을 체크한다.

---

## 4. PLAN REVIEW (사용자 승인 게이트)

`Skill` 툴로 `plan-design-review` 스킬을 호출한다. (선정된 변형 + 디자인 시스템을 컨텍스트로 전달)

11개 차원 점수와 OPEN 보완 항목을 `design.md` 의 **§3 계획 리뷰 (PLAN REVIEW)** 섹션에 기록한다. “HTML 단계 진입 전 반드시 반영” 으로 분류된 OPEN 항목 목록을 명확히 표기한다.

완료 후 사용자에게 1회 정지하여 승인을 받는다.

> `docs/features/$FEATURE_SLUG/design.md` §3 점수와 OPEN 항목을 검토하세요. HTML 구현 단계로 진행할까요?

승인 시 5단계로 진행한다. 거부하거나 수정을 요청하면 멈춘다. 상단 체크박스 “3 계획 리뷰” 를 체크하고 사용자 승인 항목을 갱신한다.

---

## 5. HTML (프로덕션 HTML/CSS 구현)

`Skill` 툴로 `design-html` 스킬을 호출한다. (시스템 + 선정 변형 + PLAN REVIEW 보완안을 컨텍스트로 전달)

생성된 HTML/CSS 파일을 `.design-cache/$FEATURE_SLUG/` 로 이동한다.

```bash
mkdir -p .design-cache/$FEATURE_SLUG
mv index.html _components.html styles.css .design-cache/$FEATURE_SLUG/ 2>/dev/null || true
rm -rf design-html-output/ html-staging/ 2>/dev/null
```

`design.md` 의 **§4 HTML 구현 (HTML)** 섹션에 캐시 위치, 디자인 토큰 매핑, 동적 동작/상태, 접근성 체크, React 변환 매핑을 채워 넣고 상단 체크박스 “4 HTML” 을 체크한다.

---

## 6. LIVE REVIEW (라이브 디자인 QA)

`Skill` 툴로 `design-review` 스킬을 호출한다. (`.design-cache/$FEATURE_SLUG/` 의 HTML을 검사 대상으로 지정)

발견 이슈와 자동 수정 결과를 `design.md` 의 **§5 라이브 QA (LIVE REVIEW)** 섹션에 기록한다. 자동 수정 코드 변경은 `design-review` 의 기본 동작에 따라 개별 git 커밋으로 분리되어 남는다. 스크린샷은 보존하지 않는다.

```bash
rm -rf design-review-screenshots/ before/ after/ annotations/ 2>/dev/null
```

상단 체크박스 “5 라이브 QA” 를 체크한다.

---

## 7. 완료 보고

```bash
echo "designed" > docs/features/$FEATURE_SLUG/phase.md
```

```
✅ 디자인 완료

docs/features/$FEATURE_SLUG/
  ├── design.md (§1~§5 모두 채워짐)
  └── phase.md  (designed)

.design-cache/$FEATURE_SLUG/   HTML/CSS 임시 보관 (project-implement 에서 소비)

OPEN: §3 PLAN REVIEW {n}건 / §5 LIVE REVIEW {n}건

구현 준비가 되면 `/clear` 로 세션을 초기화한 뒤 `/project-implement $FEATURE_SLUG` 를 실행하세요.
```

여기서 종료한다. /project-implement 입력 전까지 추가 코드를 작성하지 않는다.
