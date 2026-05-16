# Progress. Password Vault

## 현재 단계

구현

## 기능별 진행 현황

| Phase | 태스크 | 내용 | 상태 |
|-------|--------|------|------|
| P1 | T001 | Prisma 모델 추가 (VaultMaster/VaultEntry/VaultCategory enum) | ✅ 완료 |
| P1 | T002 | prisma migrate dev --name vault-init 실행 | ✅ 완료 |
| P2 | T003 | VaultCryptoService (Argon2id + AES-256-GCM) | ✅ 완료 |
| P2 | T004 | VaultSessionService (인메모리 키, idle 타임아웃) | ✅ 완료 |
| P2 | T005 | VaultController (setup/unlock/lock/CRUD/search/status) | ✅ 완료 |
| P2 | T006 | DTO + class-validator (카테고리별 메타 검증) | ✅ 완료 |
| P2 | T013 | OTHER 카테고리 + key-value 쌍 | ✅ 완료 |
| P2 | T014 | export/import 엔드포인트 | ✅ 완료 |
| P2 | T015 | CSRF 미들웨어 | ✅ 완료 |
| P3 | T007 | 잠금해제·마스터 설정 화면 | ✅ 완료 |
| P3 | T008 | 카테고리 선택 + 카테고리별 폼 | ✅ 완료 |
| P3 | T009 | 목록·검색·수정·삭제 | ✅ 완료 |
| P3 | T012 | 클립보드 복사 + 30초 자동 클리어 | ✅ 완료 |
| P4 | T010 | e2e 테스트 (10개 케이스, 모두 통과) | ✅ 완료 |
| P4 | T011 | README 업데이트 (TTHW·argon2 빌드·KDF migration) | ✅ 완료 |

## 블로커 / 이슈 / 특이사항

- 기존 환경에 ESLint 9 config(`eslint.config.js`) 가 없어 `pnpm lint` 가 동작하지 않는다. 이번 작업과 무관한 사전 이슈이며 별도 정비 필요.
- `apps/api/src/auth/auth.guard.ts` 의 빈 가드는 vault 와 분리돼 있다. 정기 지출 모듈에서 후속 인증을 도입할 때 교체한다.

## 최근 업데이트

2026-05-16

## 다음 액션 아이템

| 담당 | 내용 | 기한 |
|------|------|------|
| 검증자 | `/project-verify password-vault` 로 보안·기능 검증 진행 | - |

## 산출물 요약

**API (apps/api/src/vault/)**
- `vault.types.ts` — 카테고리 enum, KDF 파라미터, 에러 코드
- `vault-crypto.service.ts` — Argon2id 키 도출, AES-256-GCM seal/open
- `vault-session.service.ts` — 인메모리 키 + idle 타임아웃
- `vault-backoff.service.ts` — 5회/60초 backoff
- `vault.service.ts` — setup/unlock/CRUD/export/import 비즈니스 로직
- `vault.controller.ts` — HTTP 엔드포인트
- `vault-lock.guard.ts` — 잠금 상태 가드 (APP_GUARD)
- `vault-csrf.middleware.ts` — Origin 화이트리스트 + X-Vault-Request 헤더
- `vault.module.ts` — 모듈 조립
- `dto/master.dto.ts`, `dto/category-payload.dto.ts`, `dto/list-entries.dto.ts`, `dto/import-query.dto.ts`

**스키마 변경 (apps/api/prisma/)**
- `schema.prisma` — VaultMaster, VaultEntry 모델 추가
- `migrations/20260516135007_vault_init/migration.sql` — 자동 생성

**Web (apps/web/app/vault/)**
- `page.tsx`, `VaultView.tsx` — 상태 머신 컨테이너
- `UnlockScreen.tsx` — setup/unlock 분기 화면
- `EntriesScreen.tsx` — 목록·검색·CRUD
- `CategoryForm.tsx` — 카테고리별 폼
- `CopyField.tsx` — 클립보드 복사 + 30초 자동 클리어
- `category-schema.ts` — 카테고리별 필드 메타데이터

**Web (apps/web/lib/)**
- `vault-client.ts` — axios 인스턴스(withCredentials, X-Vault-Request 헤더 기본)

**테스트**
- `apps/api/test/vault.e2e-spec.ts` — 10개 e2e 케이스 (모두 통과)

**문서**
- `README.md` — TTHW 체크리스트, argon2 빌드 안내, KDF migration 절차 추가
