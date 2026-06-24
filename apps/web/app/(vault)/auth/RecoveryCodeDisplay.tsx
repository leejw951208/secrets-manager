"use client"
// 복구코드 발급 화면. 표시·복사·다운로드 후 "저장했습니다" 확인을 받아야 완료된다.
import { useState } from "react"

interface Props {
    code: string
    onConfirmed: () => void
}

export function RecoveryCodeDisplay({ code, onConfirmed }: Props) {
    const [copied, setCopied] = useState(false)
    const [downloaded, setDownloaded] = useState(false)
    const [acknowledged, setAcknowledged] = useState(false)
    const [status, setStatus] = useState("")

    async function handleCopy() {
        try {
            if (typeof navigator === "undefined" || !navigator.clipboard) {
                setStatus("이 환경에선 클립보드를 사용할 수 없습니다.")
                return
            }
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setStatus("복구코드를 클립보드에 복사했습니다.")
        } catch {
            setStatus("복사에 실패했습니다. 직접 받아 적어 주세요.")
        }
    }

    function handleDownload() {
        const blob = new Blob(
            [
                "Secrets Manager 복구코드\n",
                "분실 시 이 코드로만 보관함을 복구할 수 있습니다. 안전한 곳에 보관하세요.\n\n",
                code,
                "\n",
            ],
            { type: "text/plain" },
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `secrets-manager-recovery-${new Date().toISOString().slice(0, 10)}.txt`
        a.click()
        URL.revokeObjectURL(url)
        setDownloaded(true)
        setStatus("복구코드 파일을 다운로드했습니다.")
    }

    const saved = copied || downloaded

    return (
        <section style={{ maxWidth: 480, margin: "0 auto", paddingTop: 24 }}>
            <span className="eyebrow">Secrets · 복구코드</span>
            <h1 style={{ marginTop: 6 }}>복구코드를 안전하게 보관하세요</h1>
            <p className="muted" style={{ marginTop: 8 }}>
                기기를 분실하면 이 복구코드로만 보관함을 다시 열 수 있습니다.
                서버에는 저장되지 않으니 지금 반드시 보관하세요.
            </p>

            <div
                className="card"
                style={{ marginTop: 20, display: "grid", gap: 12 }}
            >
                <code
                    className="secret-value revealed"
                    style={{
                        fontSize: 18,
                        lineHeight: 1.6,
                        wordBreak: "break-all",
                        userSelect: "all",
                    }}
                    aria-label="복구코드"
                >
                    {code}
                </code>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={handleCopy}
                    >
                        {copied ? "복사됨" : "복사"}
                    </button>
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={handleDownload}
                    >
                        {downloaded ? "다운로드됨" : "파일로 저장"}
                    </button>
                </div>
            </div>

            <div
                role="alert"
                className="error-box"
                style={{ marginTop: 16 }}
            >
                이 화면을 벗어나면 복구코드를 다시 볼 수 없습니다.
            </div>

            <label
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    marginTop: 16,
                    minHeight: 44,
                }}
            >
                <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    style={{ width: 22, height: 22, marginTop: 2 }}
                />
                <span>복구코드를 안전한 곳에 저장했습니다.</span>
            </label>

            <button
                type="button"
                className="btn"
                style={{ width: "100%", marginTop: 16 }}
                disabled={!saved || !acknowledged}
                onClick={onConfirmed}
            >
                완료하고 보관함 열기
            </button>

            <span
                role="status"
                aria-live="polite"
                style={{ position: "absolute", left: -9999 }}
            >
                {status}
            </span>
        </section>
    )
}
