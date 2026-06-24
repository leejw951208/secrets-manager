// 복구코드 verifier 계산. 서버는 Base32/Crockford 로직을 구현하지 않는다(상호운용 확정).
// 와이어의 recoveryCode 는 클라가 Crockford 디코딩한 20바이트를 base64url 인코딩한 값이다.
// 서버는 그 바이트에 SHA-256 만 적용해 저장 verifier 와 비교한다.
import { createHash } from "node:crypto"

// 복구코드 원시 바이트 길이(160bit = 20B). DTO 디코딩 결과 길이 검증 기준.
export const RECOVERY_CODE_BYTES = 20

// 복구코드 원시 바이트의 SHA-256 verifier 를 계산한다(웹 recoveryVerifier 와 동일).
export function computeVerifier(recoveryBytes: Buffer): Buffer {
    return createHash("sha256").update(recoveryBytes).digest()
}
