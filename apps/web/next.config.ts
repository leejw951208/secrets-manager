// Next.js 설정. 운영 보안 헤더(CSP 등)를 모든 응답에 적용한다.
import type { NextConfig } from "next"

// Pretendard 폰트는 jsdelivr CDN 에서 stylesheet + woff 로 로드된다(layout.tsx). style-src·font-src 에 허용한다.
const PRETENDARD_CDN = "https://cdn.jsdelivr.net"

// Content-Security-Policy.
// 주의. Next.js App Router 는 부트스트랩 인라인 스크립트와 React 인라인 스타일을 사용하므로
// 'unsafe-inline' 이 필요하다. nonce 기반 강화는 미들웨어로 별도 적용할 수 있다(향후 과제).
const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    `font-src 'self' data: ${PRETENDARD_CDN}`,
    `style-src 'self' 'unsafe-inline' ${PRETENDARD_CDN}`,
    "script-src 'self' 'unsafe-inline'",
    // API 는 same-origin(/api)으로 호출하므로 'self' 로 충분하다.
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
].join("; ")

const securityHeaders = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "no-referrer" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    // WebAuthn(passkey)은 self 로 명시 허용하고 나머지 강력 권한은 차단한다.
    {
        key: "Permissions-Policy",
        value: [
            "publickey-credentials-get=(self)",
            "publickey-credentials-create=(self)",
            "camera=()",
            "microphone=()",
            "geolocation=()",
        ].join(", "),
    },
]

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }]
    },
}

export default nextConfig
