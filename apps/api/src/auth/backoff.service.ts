// 로그인 실패 백오프. 단일 사용자라 글로벌 카운터 1개로 5회/60초를 관리한다.
import { Injectable } from "@nestjs/common"
import { BACKOFF_DURATION_MS, MAX_LOGIN_FAILURES } from "./auth.types"

@Injectable()
export class BackoffService {
    private failureCount = 0
    private blockedUntil = 0

    isBlocked(): boolean {
        if (Date.now() < this.blockedUntil) return true
        if (this.blockedUntil !== 0 && Date.now() >= this.blockedUntil) {
            this.reset()
        }
        return false
    }

    retryAfterSeconds(): number {
        const remainingMs = this.blockedUntil - Date.now()
        return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0
    }

    recordFailure(): void {
        this.failureCount += 1
        if (this.failureCount >= MAX_LOGIN_FAILURES) {
            this.blockedUntil = Date.now() + BACKOFF_DURATION_MS
        }
    }

    reset(): void {
        this.failureCount = 0
        this.blockedUntil = 0
    }
}
