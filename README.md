# Life Key — 정기 지출 관리

로컬 1인용 정기 지출 관리 도구. 카드값, 관리비, 구독료, 월세 등 매월/매주/매년 반복되는 지출을 한 곳에서 등록·조회·결제 처리한다.

## 구조

```
life-key/
├─ apps/
│  ├─ web/   Next.js 15 (App Router) — http://127.0.0.1:3000
│  └─ api/   NestJS 10 + Prisma + SQLite — http://127.0.0.1:4000
├─ docs/features/recurring-expenses/   기능 사양·계획·진행 상태
├─ pnpm-workspace.yaml
└─ package.json (워크스페이스 스크립트)
```

## 필수 도구

- Node.js 24
- pnpm 11 (워크스페이스). 저장소 루트의 `mise.toml`에서 자동 설치 가능하다.

## 설치와 초기 셋업

```bash
pnpm install
pnpm --filter @life-key/api exec prisma migrate dev --name init
```

SQLite 파일은 `apps/api/data/life-key.db` 에 생성되며 git ignore된다.

## 개발 서버 실행

두 프로세스를 함께 띄운다.

```bash
pnpm dev
```

개별 실행이 필요하면 다음을 사용한다.

```bash
pnpm --filter @life-key/api dev   # http://127.0.0.1:4000
pnpm --filter @life-key/web dev   # http://127.0.0.1:3000
```

두 프로세스 모두 `127.0.0.1`에만 바인딩되어 외부 인터페이스로는 접속할 수 없다. API의 CORS는 `http://127.0.0.1:3000` 만 허용한다.

## 테스트

```bash
pnpm --filter @life-key/api exec jest                          # 단위 테스트 (recurrence, expense.service)
pnpm --filter @life-key/api exec jest --config ./test/jest-e2e.json  # e2e
pnpm --filter @life-key/web exec next build                    # 프런트 타입체크 + 빌드 검증
```

## 환경 변수

| 위치 | 변수 | 기본값 | 설명 |
|------|------|--------|------|
| `apps/api/.env` | `DATABASE_URL` | `file:./data/life-key.db` | SQLite 파일 경로 |
| `apps/web/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:4000` | 백엔드 베이스 URL |

## 데이터 백업

SQLite 단일 파일이므로 백업은 파일 복사로 끝난다.

```bash
cp apps/api/data/life-key.db ~/backups/life-key-$(date +%Y%m%d).db
```

DB 파일 권한은 OS 사용자 권한(예. `chmod 600`)으로 두는 것을 권장한다.

## 알려진 한계

- 인증 미적용. NestJS `AuthGuard` 자리만 비워두었다(`apps/api/src/auth/auth.guard.ts`). 후속 비밀번호 관리 기능에서 같은 Guard를 교체할 예정이다.
- 다중 통화 환산 없음. 입력 통화로만 표시한다.
- 격주, 매월 마지막 영업일 같은 복합 규칙은 미지원이다.
- 외부 은행/카드 동기화 없음.

## 후속 기능 자리

- `apps/api/src/`에 `VaultModule`을 추가해 비밀번호 도메인을 붙일 수 있다.
- `apps/web/app/`에 `(vault)` 라우트 그룹을 추가한다.
- 공유 타입이 늘어나면 `packages/shared` 워크스페이스에 분리한다.
