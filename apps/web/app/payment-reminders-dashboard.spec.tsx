// 대시보드 리마인더 빈 상태 렌더링 회귀 테스트.
import { render, screen } from "@testing-library/react"
import DashboardPage from "./page"

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({
        children,
        href,
        ...rest
    }: { children: React.ReactNode; href: string } & Record<
        string,
        unknown
    >) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}))

const getOccurrencesMock = jest.fn()
const getExpensesMock = jest.fn()

jest.mock("@/lib/api-client", () => ({
    getOccurrences: (...args: unknown[]) => getOccurrencesMock(...args),
    getExpenses: (...args: unknown[]) => getExpensesMock(...args),
}))

describe("DashboardPage 결제 리마인더", () => {
    beforeEach(() => {
        getOccurrencesMock.mockReset()
        getExpensesMock.mockReset()
    })

    it("리마인더가 0건이면 빈 상태 문구와 진입 링크를 표시한다", async () => {
        getOccurrencesMock.mockResolvedValue([])
        getExpensesMock.mockResolvedValue([])

        render(await DashboardPage())

        expect(screen.getByText("처리할 리마인더가 없습니다.")).not.toBeNull()
        expect(
            screen
                .getAllByRole("link", { name: "정기 지출 추가" })[0]
                ?.getAttribute("href"),
        ).toBe("/expenses/new")
        expect(
            screen
                .getByRole("link", { name: "결제 리스트" })
                .getAttribute("href"),
        ).toBe("/occurrences")
    })
})
