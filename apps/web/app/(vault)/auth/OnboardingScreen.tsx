"use client"
// 온보딩/passkey 등록 화면. passkey 생성 → VK·복구코드 생성 → PRF·복구코드로 래핑 → register/verify → 복구코드 발급.
import { useState } from "react"
import { ShieldPlus } from "lucide-react"
import { Icon } from "@/components/Icon"
import {
    getRegisterOptions,
    postRegisterVerify,
} from "@/lib/vault-client"
import { isApiError } from "@/lib/api-error"
import {
    generateRecoveryCode,
    generateVaultKey,
    randomSalt,
    recoveryVerifier,
    toBase64Url,
    wrapVkWithPrf,
    wrapVkWithRecovery,
} from "@/lib/vault-crypto"
import {
    CeremonyCancelledError,
    PrfUnsupportedError,
    registerPasskey,
    supportsWebAuthn,
} from "@/lib/webauthn"
import { RecoveryCodeDisplay } from "./RecoveryCodeDisplay"

type Phase = "intro" | "registering" | "recovery"

interface Props {
    onUnlocked: (vaultKey: CryptoKey) => void
}

export function OnboardingScreen({ onUnlocked }: Props) {
    const [phase, setPhase] = useState<Phase>("intro")
    const [error, setError] = useState<string | null>(null)
    // 등록 완료 후 사용자가 복구코드를 확인할 때까지 VK 와 코드를 보관한다.
    const [pending, setPending] = useState<{
        vaultKey: CryptoKey
        recoveryCode: string
    } | null>(null)

    async function handleRegister() {
        if (!supportsWebAuthn()) {
            setError("이 브라우저는 passkey(WebAuthn)를 지원하지 않습니다.")
            return
        }
        setPhase("registering")
        setError(null)
        try {
            const options = await getRegisterOptions()
            const { response, prfOutput } = await registerPasskey(options)
            if (!prfOutput) throw new PrfUnsupportedError()

            // VK·복구코드 생성 후 PRF·복구코드로 각각 래핑한다.
            const vaultKey = await generateVaultKey()
            const recovery = generateRecoveryCode()
            const prfSalt = randomSalt()
            const rcSalt = randomSalt()
            const wrappedVkPrf = await wrapVkWithPrf(vaultKey, prfOutput, prfSalt)
            const wrappedVkRc = await wrapVkWithRecovery(
                vaultKey,
                recovery.bytes,
                rcSalt,
            )
            // verifier=SHA-256(복구코드 바이트). 서버가 복구 시 상수시간 비교(H-1).
            const verifier = await recoveryVerifier(recovery.bytes)

            await postRegisterVerify({
                response,
                prfSalt: toBase64Url(prfSalt),
                wrappedVkPrf: toBase64Url(wrappedVkPrf),
                recovery: {
                    rcSalt: toBase64Url(rcSalt),
                    wrappedVkRc: toBase64Url(wrappedVkRc),
                    verifier: toBase64Url(verifier),
                },
            })

            setPending({ vaultKey, recoveryCode: recovery.display })
            setPhase("recovery")
        } catch (e) {
            setPhase("intro")
            setError(resolveError(e))
        }
    }

    if (phase === "recovery" && pending) {
        return (
            <RecoveryCodeDisplay
                code={pending.recoveryCode}
                onConfirmed={() => onUnlocked(pending.vaultKey)}
            />
        )
    }

    return (
        <section style={{ maxWidth: 440, margin: "0 auto", paddingTop: 32 }}>
            <span className="vault-emblem">
                <Icon icon={ShieldPlus} size={26} />
            </span>
            <span className="eyebrow">Secrets · Vault</span>
            <h1 style={{ marginTop: 6 }}>passkey로 시작하기</h1>
            <p className="muted" style={{ marginTop: 8 }}>
                이 기기의 생체 인증(지문·얼굴) 또는 보안키로 보관함을 보호합니다.
                비밀번호는 따로 만들 필요가 없습니다.
            </p>

            <ol className="muted" style={{ marginTop: 16, paddingLeft: 18 }}>
                <li>passkey 만들기</li>
                <li>복구코드 발급·보관</li>
            </ol>

            <button
                type="button"
                className="btn"
                style={{ width: "100%", marginTop: 24 }}
                onClick={handleRegister}
                disabled={phase === "registering"}
                aria-busy={phase === "registering"}
            >
                {phase === "registering"
                    ? "passkey 만드는 중..."
                    : "passkey 만들기"}
            </button>

            {error && (
                <div role="alert" className="error-box" style={{ marginTop: 16 }}>
                    {error}
                </div>
            )}
        </section>
    )
}

// 예외를 사용자에게 보여줄 한국어 메시지로 변환한다.
function resolveError(e: unknown): string {
    if (e instanceof CeremonyCancelledError) return e.message
    if (e instanceof PrfUnsupportedError) return e.message
    if (isApiError(e)) return e.message
    return e instanceof Error ? e.message : "등록에 실패했습니다."
}
