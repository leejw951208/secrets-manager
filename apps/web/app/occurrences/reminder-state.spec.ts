// 결제 리마인더 분류와 요약 계산 회귀 테스트.
import type { ExpenseOccurrence, RecurringExpense } from "@/lib/types"
import {
    classifyReminder,
    daysBetweenIso,
    reminderFilterHref,
    summarizeReminders,
} from "./reminder-state"

function makeExpense(
    overrides: Partial<RecurringExpense> = {},
): RecurringExpense {
    return {
        id: "expense-id",
        name: "넷플릭스",
        category: "구독",
        amount: 17000,
        currency: "KRW",
        recurrence: "MONTHLY",
        dayOfMonth: 1,
        dayOfWeek: null,
        monthOfYear: null,
        startDate: "2026-01-01",
        endDate: null,
        paymentMethod: "카드",
        memo: null,
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...overrides,
    }
}

function makeOccurrence(
    overrides: Partial<ExpenseOccurrence> = {},
): ExpenseOccurrence {
    return {
        id: "occurrence-id",
        expenseId: "expense-id",
        dueDate: "2026-05-17T00:00:00.000Z",
        expectedAmount: 17000,
        actualAmount: null,
        status: "SCHEDULED",
        paidAt: null,
        memo: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        expense: makeExpense(),
        ...overrides,
    }
}

describe("daysBetweenIso", () => {
    it("KST 날짜 문자열 기준으로 일수를 계산한다", () => {
        expect(daysBetweenIso("2026-05-17", "2026-05-16")).toBe(-1)
        expect(daysBetweenIso("2026-05-17", "2026-05-17")).toBe(0)
        expect(daysBetweenIso("2026-05-17", "2026-05-20")).toBe(3)
    })
})

describe("classifyReminder", () => {
    it("예정 건의 날짜 거리에 따라 리마인더 상태를 나눈다", () => {
        const today = "2026-05-17"
        expect(
            classifyReminder(makeOccurrence({ dueDate: "2026-05-16" }), today),
        ).toBe("OVERDUE")
        expect(classifyReminder(makeOccurrence(), today)).toBe("TODAY")
        expect(
            classifyReminder(makeOccurrence({ dueDate: "2026-05-20" }), today),
        ).toBe("DUE_SOON_3")
        expect(
            classifyReminder(makeOccurrence({ dueDate: "2026-05-24" }), today),
        ).toBe("DUE_SOON_7")
        expect(
            classifyReminder(makeOccurrence({ dueDate: "2026-05-25" }), today),
        ).toBe("NORMAL")
    })

    it("완료와 스킵 건은 리마인더를 표시하지 않는다", () => {
        expect(
            classifyReminder(makeOccurrence({ status: "PAID" }), "2026-05-17"),
        ).toBe("NONE")
        expect(
            classifyReminder(
                makeOccurrence({ status: "SKIPPED" }),
                "2026-05-17",
            ),
        ).toBe("NONE")
    })

    it("날짜 파싱 실패 데이터는 일반 예정으로 폴백한다", () => {
        expect(
            classifyReminder(
                makeOccurrence({ dueDate: "not-a-date" }),
                "2026-05-17",
            ),
        ).toBe("NORMAL")
    })
})

describe("summarizeReminders", () => {
    it("연체, 오늘, 3일 이내, 7일 이내만 요약한다", () => {
        const summary = summarizeReminders(
            [
                makeOccurrence({
                    id: "overdue",
                    dueDate: "2026-05-16",
                    expectedAmount: 1000,
                }),
                makeOccurrence({
                    id: "today",
                    dueDate: "2026-05-17",
                    expectedAmount: 2000,
                }),
                makeOccurrence({
                    id: "soon3",
                    dueDate: "2026-05-20",
                    expectedAmount: 3000,
                }),
                makeOccurrence({
                    id: "soon7",
                    dueDate: "2026-05-24",
                    expectedAmount: 4000,
                }),
                makeOccurrence({
                    id: "normal",
                    dueDate: "2026-05-25",
                    expectedAmount: 5000,
                }),
                makeOccurrence({
                    id: "paid",
                    status: "PAID",
                    dueDate: "2026-05-16",
                    expectedAmount: 6000,
                }),
            ],
            "2026-05-17",
        )

        expect(summary).toEqual({
            overdue: { count: 1, total: 1000 },
            today: { count: 1, total: 2000 },
            within3Days: { count: 1, total: 3000 },
            within7Days: { count: 1, total: 4000 },
        })
    })
})

describe("reminderFilterHref", () => {
    it("요약 카드가 결제 리스트 필터로 이동할 URL을 만든다", () => {
        expect(reminderFilterHref("today", "2026-05-17")).toBe(
            "/occurrences?status=SCHEDULED&from=2026-05-17&to=2026-05-17",
        )
        expect(reminderFilterHref("within3Days", "2026-05-17")).toBe(
            "/occurrences?status=SCHEDULED&from=2026-05-17&to=2026-05-20",
        )
        expect(reminderFilterHref("within7Days", "2026-05-17")).toBe(
            "/occurrences?status=SCHEDULED&from=2026-05-17&to=2026-05-24",
        )
        expect(reminderFilterHref("overdue", "2026-05-17")).toBe(
            "/occurrences?status=SCHEDULED&from=2000-01-01&to=2026-05-16",
        )
    })
})
