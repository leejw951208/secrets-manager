// WebAuthn 챌린지 인메모리 보관. 짧은 TTL·1회용으로 검증 후 즉시 폐기한다.
// 단일 사용자라 등록/로그인 종류별 단일 챌린지 슬롯이면 충분하다.
import { Injectable } from "@nestjs/common"
import { CHALLENGE_TTL_MS } from "./auth.types"

type ChallengeKind = "register" | "login"

interface ChallengeEntry {
    value: string
    expiresAt: number
}

@Injectable()
export class ChallengeService {
    private readonly store = new Map<ChallengeKind, ChallengeEntry>()

    // 챌린지를 저장한다(같은 종류의 이전 챌린지는 덮어써 폐기).
    set(kind: ChallengeKind, value: string): void {
        this.store.set(kind, {
            value,
            expiresAt: Date.now() + CHALLENGE_TTL_MS,
        })
    }

    // 챌린지를 1회 소비한다. 유효하면 값을 반환하고 즉시 폐기, 만료/부재면 null.
    consume(kind: ChallengeKind): string | null {
        const entry = this.store.get(kind)
        this.store.delete(kind)
        if (!entry) return null
        if (Date.now() >= entry.expiresAt) return null
        return entry.value
    }
}
