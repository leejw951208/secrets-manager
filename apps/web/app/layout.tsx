// 전역 레이아웃. 단일 모바일 셸 + 데스크탑 phone-frame + PWA 메타 + Strongbox 타입.
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { BottomTabBar } from "@/components/BottomTabBar"
import { UpdateToast } from "@/components/UpdateToast"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import "./globals.css"

// 기계 라벨·숫자용 디스플레이 페이스. 한글은 var(--font-body) 로 폴백.
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "700"],
    variable: "--font-display-grotesk",
    display: "swap",
})

// 비밀값·카운트다운용 모노 페이스.
const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-mono-jetbrains",
    display: "swap",
})

export const metadata: Metadata = {
    title: "Secrets Manager — 비밀번호 보관함",
    description: "로컬 1인용 비밀번호·시크릿 보관함",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Secrets Manager",
    },
    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-192.png",
    },
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#12181c",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="ko"
            className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
        >
            <body>
                <div className="phone-frame">
                    <main className="container">{children}</main>
                    <BottomTabBar />
                    <UpdateToast />
                </div>
                <ServiceWorkerRegister />
            </body>
        </html>
    )
}
