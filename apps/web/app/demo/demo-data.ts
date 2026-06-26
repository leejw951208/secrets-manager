// 공개 데모(/demo)용 가짜 데이터. 실제 금고·서버·암호화와 무관한 메모리 상수다.
// 여기 값은 전부 예시이며 실제 비밀번호가 아니다. vault-client 를 절대 import 하지 않는다.

export interface DemoField {
    name: string
    value: string
    // 상세에서 마스킹할지 여부. 미지정이면 이름 휴리스틱으로 폴백한다(실제 화면과 동일 규칙).
    sensitive?: boolean
}

export interface DemoSecret {
    id: string
    label: string
    fields: DemoField[]
    memo: string
    createdAt: string
    updatedAt: string
}

// 데모 진입 시 채워진 것처럼 보이는 예시 항목들. 값은 모두 가짜다.
export const DEMO_SEED: DemoSecret[] = [
    {
        id: "demo-1",
        label: "국민은행 인터넷뱅킹",
        fields: [
            { name: "아이디", value: "demo_kbuser", sensitive: false },
            { name: "비밀번호", value: "예시-Bank!2024", sensitive: true },
            { name: "보안카드", value: "12-34-56-78", sensitive: true },
        ],
        memo: "이체 한도 변경은 영업점 방문 필요.",
        createdAt: "2026-01-12T09:20:00.000Z",
        updatedAt: "2026-03-04T14:05:00.000Z",
    },
    {
        id: "demo-2",
        label: "네이버",
        fields: [
            { name: "아이디", value: "demo.naver", sensitive: false },
            { name: "비밀번호", value: "예시-Naver#88", sensitive: true },
        ],
        memo: "",
        createdAt: "2026-02-01T03:00:00.000Z",
        updatedAt: "2026-02-01T03:00:00.000Z",
    },
    {
        id: "demo-3",
        label: "Gmail",
        fields: [
            { name: "아이디", value: "demo.user@gmail.com", sensitive: false },
            { name: "비밀번호", value: "예시-Gmail$secret", sensitive: true },
            { name: "복구 코드", value: "abcd-efgh-ijkl", sensitive: true },
        ],
        memo: "2단계 인증 앱: 데모 폰.",
        createdAt: "2025-11-20T22:10:00.000Z",
        updatedAt: "2026-05-18T08:42:00.000Z",
    },
    {
        id: "demo-4",
        label: "넷플릭스",
        fields: [
            { name: "아이디", value: "demo@example.com", sensitive: false },
            { name: "비밀번호", value: "예시-Watch%now", sensitive: true },
            { name: "프로필 PIN", value: "0000", sensitive: true },
        ],
        memo: "",
        createdAt: "2026-04-09T11:33:00.000Z",
        updatedAt: "2026-04-09T11:33:00.000Z",
    },
    {
        id: "demo-5",
        label: "회사 VPN",
        fields: [
            { name: "아이디", value: "demo.corp", sensitive: false },
            { name: "비밀번호", value: "예시-Vpn&pass1", sensitive: true },
            { name: "서버 주소", value: "vpn.demo.example.com", sensitive: false },
        ],
        memo: "접속 전 OTP 앱 코드 입력.",
        createdAt: "2026-03-22T01:15:00.000Z",
        updatedAt: "2026-06-01T19:55:00.000Z",
    },
]
