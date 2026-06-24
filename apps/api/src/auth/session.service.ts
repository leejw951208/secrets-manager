// 인증 세션. 단일 사용자라 인메모리 토큰 집합으로 충분하다. 프로세스 재시작 시 폐기된다.
// 일반 세션(idle 만료)과 단기 복구 세션(짧은 TTL, 등록 1회 스코프)을 함께 관리한다.
import { Injectable } from "@nestjs/common"
import { randomBytes } from "node:crypto"
import { IDLE_TIMEOUT_MS, RECOVERY_SESSION_TTL_MS } from "./auth.types"

@Injectable()
export class SessionService {
    // 일반 세션 토큰 → 만료 시각(ms).
    private readonly tokens = new Map<string, number>()
    // 복구 세션 토큰 → 만료 시각(ms). 새 passkey 등록 1회 허용 스코프.
    private readonly recoveryTokens = new Map<string, number>()

    issue(): string {
        const token = randomBytes(32).toString("base64url")
        this.tokens.set(token, Date.now() + IDLE_TIMEOUT_MS)
        return token
    }

    // 유효(미만료) 토큰이면 만료 시각을 갱신하고 true. 만료/부재면 폐기 후 false.
    isValid(token: string | undefined): boolean {
        if (token === undefined) return false
        const expiresAt = this.tokens.get(token)
        if (expiresAt === undefined) return false
        if (Date.now() >= expiresAt) {
            this.tokens.delete(token)
            return false
        }
        this.tokens.set(token, Date.now() + IDLE_TIMEOUT_MS)
        return true
    }

    revoke(token: string | undefined): void {
        if (token) this.tokens.delete(token)
    }

    // 단기 복구 세션 발급(idle 갱신 없음, 고정 TTL).
    issueRecovery(): string {
        const token = randomBytes(32).toString("base64url")
        this.recoveryTokens.set(token, Date.now() + RECOVERY_SESSION_TTL_MS)
        return token
    }

    // 복구 세션 유효성 검사(만료 시 폐기). 만료 시각은 갱신하지 않는다.
    isRecoveryValid(token: string | undefined): boolean {
        if (token === undefined) return false
        const expiresAt = this.recoveryTokens.get(token)
        if (expiresAt === undefined) return false
        if (Date.now() >= expiresAt) {
            this.recoveryTokens.delete(token)
            return false
        }
        return true
    }

    revokeRecovery(token: string | undefined): void {
        if (token) this.recoveryTokens.delete(token)
    }
}
