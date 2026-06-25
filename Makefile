# 개발 환경 전용 명령 모음. (운영 배포는 docker-compose.yml 로 별도 관리)
# 개발 구성: DB 는 도커(docker-compose.dev.yml), web·API 는 호스트에서 직접 실행.
# 명명 규칙: 개발 환경 타깃은 dev-, 운영 배포 타깃은 prod- 프리픽스. 검증(lint/typecheck/test/build/clean)은 환경 무관.
.PHONY: help dev-up dev-down dev-reset dev-stop dev-down-db dev-reset-db dev-migrate dev-generate lint typecheck test build clean prod-up prod-up-api prod-up-web prod-deploy prod-deploy-api prod-deploy-web prod-pull prod-down prod-logs prod-ps prod-backup tunnel-up tunnel-down tunnel-restart tunnel-logs

# 개발 DB 컨테이너 자격증명도 apps/api/.env.development 를 ${} 치환 출처로 쓴다(운영과 동일 패턴).
DEV_COMPOSE := docker compose -f docker-compose.dev.yml --env-file apps/api/.env.development
# 운영은 apps/api/.env.production 을 env_file 주입 + ${} 치환 출처로 함께 사용한다.
PROD_COMPOSE := docker compose -f docker-compose.yml --env-file apps/api/.env.production
# 터널(cloudflared)은 앱과 분리된 별도 compose 로 운영한다(앱 재배포와 무관하게 유지).
TUNNEL_COMPOSE := docker compose -f docker-compose.cloudflared.yml

help:
	@echo "개발 환경 명령:"
	@echo "  make dev-up        DB(도커) 기동 + 마이그레이션 후 web·API(로컬) 동시 실행"
	@echo "  make dev-down      web·API 종료 + 개발 DB 종료 (데이터 유지)"
	@echo "  make dev-reset     web·API 종료 + 개발 DB 종료 + 데이터 삭제"
	@echo ""
	@echo "  make dev-stop      web·API(로컬) 개발 서버만 종료 (DB 유지)"
	@echo "  make dev-down-db   개발 DB 컨테이너만 종료 (데이터 유지)"
	@echo "  make dev-reset-db  개발 DB 컨테이너만 종료 + 데이터 삭제"
	@echo "  make dev-migrate   Prisma 마이그레이션 적용 (DB 자동 기동)"
	@echo "  make dev-generate  Prisma Client 재생성 (schema 변경 후)"
	@echo ""
	@echo "  make lint           전체 린트"
	@echo "  make typecheck      전체 타입체크"
	@echo "  make test           전체 테스트"
	@echo "  make build          전체 빌드"
	@echo "  make clean          node_modules / 빌드 산출물 제거"
	@echo ""
	@echo "운영 배포 명령 (VPS, docker-compose.yml — DEPLOY.md 참고):"
	@echo "  [권장: CI 이미지 pull — 서버에서 빌드 안 함]"
	@echo "  make prod-deploy     GHCR 이미지 pull + 기동 (전체)"
	@echo "  make prod-deploy-api api 이미지만 pull + 재기동"
	@echo "  make prod-deploy-web web 이미지만 pull + 재기동"
	@echo "  make prod-pull       GHCR 최신 이미지만 내려받기"
	@echo "  [폴백: 서버에서 직접 빌드]"
	@echo "  make prod-up     빌드 + 기동 (전체)"
	@echo "  make prod-up-api api 만 재빌드·재기동"
	@echo "  make prod-up-web web 만 재빌드·재기동"
	@echo "  make prod-down   종료 (데이터 유지)"
	@echo "  make prod-logs   로그 추적"
	@echo "  make prod-ps     서비스 상태"
	@echo "  make prod-backup DB 즉시 백업 (R2)"
	@echo ""
	@echo "터널(cloudflared, 앱과 분리된 별도 스택):"
	@echo "  make tunnel-up      cloudflared 기동 (사전: docker network create daeoebi-net)"
	@echo "  make tunnel-down    cloudflared 종료"
	@echo "  make tunnel-restart cloudflared 재시작"
	@echo "  make tunnel-logs    터널 엣지 연결 로그"

# ── DB (도커) ──────────────────────────────────────────
dev-down-db:
	$(DEV_COMPOSE) down

dev-reset-db:
	$(DEV_COMPOSE) down -v

# ── Prisma ─────────────────────────────────────────────
dev-migrate:
	$(DEV_COMPOSE) up -d --wait
	pnpm --filter @daeoebi/api exec prisma migrate dev

dev-generate:
	pnpm --filter @daeoebi/api exec prisma generate

# ── 앱 (호스트) ────────────────────────────────────────
# DB(도커) 기동 → 마이그레이션 적용 → web·API 병렬 실행을 한 번에 수행한다.
# --wait 로 DB 헬스체크 통과를 기다린 뒤 migrate 한다(연결 거부 방지).
dev-up:
	$(DEV_COMPOSE) up -d --wait
	pnpm --filter @daeoebi/api exec prisma migrate deploy
	pnpm -r --parallel run dev

# ── 종료 ───────────────────────────────────────────────
# 호스트에서 떠 있는 web(:3010)·API(:4010) 개발 서버를 포트 점유 프로세스 기준으로 종료한다.
# 프로세스가 없어도 실패하지 않는다.
dev-stop:
	@echo "▶ web·API 개발 서버 종료"
	@pids="$$(lsof -ti tcp:3010 2>/dev/null; lsof -ti tcp:4010 2>/dev/null)"; \
		if [ -n "$$pids" ]; then kill $$pids 2>/dev/null || true; else echo "  (실행 중인 개발 서버 없음)"; fi

# 서비스(web·API) + DB 를 함께 내린다. DB 데이터는 유지한다.
dev-down: dev-stop dev-down-db

# 서비스(web·API) + DB 를 함께 내리고 DB 데이터까지 삭제한다.
dev-reset: dev-stop dev-reset-db

# ── 검증 ───────────────────────────────────────────────
lint:
	pnpm -r run lint

typecheck:
	pnpm -r run typecheck

test:
	pnpm -r run test

build:
	pnpm -r run build

clean:
	rm -rf node_modules apps/*/node_modules apps/*/dist apps/web/.next

# ── 운영 배포 (VPS) ────────────────────────────────────
# docker-compose.yml + apps/api/.env.production + cloudflared/ 가 준비된 상태에서 실행한다(DEPLOY.md).
prod-up:
	$(PROD_COMPOSE) up -d --build

prod-up-api:
	$(PROD_COMPOSE) up -d --build api

prod-up-web:
	$(PROD_COMPOSE) up -d --build web

# CI(GitHub Actions)가 GHCR 에 올린 이미지를 pull 해 기동한다(서버 빌드 없음, 1코어 VPS 권장 경로).
# postgres 는 build 대상이 아니므로 pull 은 api·web 만 한다. up 은 --build 없이 pull 된 이미지를 그대로 쓴다.
prod-pull:
	$(PROD_COMPOSE) pull api web

prod-deploy: prod-pull
	$(PROD_COMPOSE) up -d

prod-deploy-api:
	$(PROD_COMPOSE) pull api
	$(PROD_COMPOSE) up -d api

prod-deploy-web:
	$(PROD_COMPOSE) pull web
	$(PROD_COMPOSE) up -d web

prod-down:
	$(PROD_COMPOSE) down

prod-logs:
	$(PROD_COMPOSE) logs -f

prod-ps:
	$(PROD_COMPOSE) ps

prod-backup:
	./scripts/backup-db.sh

# ── 터널 (cloudflared, 별도 스택) ──────────────────────
tunnel-up:
	$(TUNNEL_COMPOSE) up -d

tunnel-down:
	$(TUNNEL_COMPOSE) down

tunnel-restart:
	$(TUNNEL_COMPOSE) restart

tunnel-logs:
	$(TUNNEL_COMPOSE) logs -f
