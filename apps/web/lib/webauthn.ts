// WebAuthn 세레모니 래퍼. @simplewebauthn/browser 로 등록·인증하고 PRF 확장 출력을 추출한다.
import {
    browserSupportsWebAuthn,
    startAuthentication,
    startRegistration,
    type AuthenticationResponseJSON,
    type PublicKeyCredentialCreationOptionsJSON,
    type PublicKeyCredentialRequestOptionsJSON,
    type RegistrationResponseJSON,
} from "@simplewebauthn/browser"

// simplewebauthn 13 타입에는 prf 출력이 빠져 있어, 런타임에 존재하는 prf 결과를 직접 정의한다.
interface PrfExtensionResults {
    prf?: {
        enabled?: boolean
        results?: {
            first?: ArrayBuffer | Uint8Array
            second?: ArrayBuffer | Uint8Array
        }
    }
}

// 현재 브라우저가 WebAuthn 을 지원하는지 여부.
export function supportsWebAuthn(): boolean {
    return browserSupportsWebAuthn()
}

// ArrayBuffer/Uint8Array 형태의 PRF 출력을 Uint8Array 로 정규화한다.
function toBytes(value: ArrayBuffer | Uint8Array): Uint8Array {
    return value instanceof Uint8Array ? value : new Uint8Array(value)
}

// 세레모니 응답에서 PRF 출력(first)을 추출한다. 없으면 null.
function extractPrfOutput(
    response: RegistrationResponseJSON | AuthenticationResponseJSON,
): Uint8Array | null {
    const ext = response.clientExtensionResults as PrfExtensionResults
    const first = ext.prf?.results?.first
    return first ? toBytes(first) : null
}

export interface RegistrationResult {
    response: RegistrationResponseJSON
    prfOutput: Uint8Array | null
}

export interface AuthenticationResult {
    response: AuthenticationResponseJSON
    prfOutput: Uint8Array | null
}

// PRF 확장 출력이 없을 때 던지는 전용 에러(인증기 PRF 미지원 안내용).
export class PrfUnsupportedError extends Error {
    constructor() {
        super("이 인증기는 PRF 확장을 지원하지 않아 키를 도출할 수 없습니다.")
        this.name = "PrfUnsupportedError"
    }
}

// 사용자가 세레모니를 취소했을 때 던지는 전용 에러.
export class CeremonyCancelledError extends Error {
    constructor() {
        super("인증이 취소되었습니다.")
        this.name = "CeremonyCancelledError"
    }
}

// DOMException name 으로 사용자 취소 여부를 판정한다.
function isCancellation(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error.name === "NotAllowedError" || error.name === "AbortError")
    )
}

// passkey 등록 세레모니를 수행하고 응답 + PRF 출력을 반환한다.
export async function registerPasskey(
    options: PublicKeyCredentialCreationOptionsJSON,
): Promise<RegistrationResult> {
    let response: RegistrationResponseJSON
    try {
        response = await startRegistration({ optionsJSON: options })
    } catch (error) {
        if (isCancellation(error)) throw new CeremonyCancelledError()
        throw error
    }
    return { response, prfOutput: extractPrfOutput(response) }
}

// passkey 인증 세레모니를 수행하고 응답 + PRF 출력을 반환한다.
export async function authenticatePasskey(
    options: PublicKeyCredentialRequestOptionsJSON,
): Promise<AuthenticationResult> {
    let response: AuthenticationResponseJSON
    try {
        response = await startAuthentication({ optionsJSON: options })
    } catch (error) {
        if (isCancellation(error)) throw new CeremonyCancelledError()
        throw error
    }
    return { response, prfOutput: extractPrfOutput(response) }
}
