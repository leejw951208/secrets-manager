// 결제 리마인더 상태 분류와 요약 계산을 담당한다.
import { addDaysIso, formatDate } from "@/lib/format"
import type { ExpenseOccurrence } from "@/lib/types"

export type ReminderState =
    | "OVERDUE"
    | "TODAY"
    | "DUE_SOON_3"
    | "DUE_SOON_7"
    | "NORMAL"
    | "NONE"

export type ReminderBucketKey =
    | "overdue"
    | "today"
    | "within3Days"
    | "within7Days"

export interface ReminderBucket {
    count: number
    total: number
}

export type ReminderSummary = Record<ReminderBucketKey, ReminderBucket>

export const REMINDER_LABELS: Record<ReminderState, string> = {
    OVERDUE: "연체",
    TODAY: "오늘",
    DUE_SOON_3: "3일 이내",
    DUE_SOON_7: "7일 이내",
    NORMAL: "예정",
    NONE: "",
}

export const REMINDER_SUMMARY_LABELS: Record<ReminderBucketKey, string> = {
    overdue: "연체",
    today: "오늘",
    within3Days: "3일 이내",
    within7Days: "7일 이내",
}

const OVERDUE_FROM = "2000-01-01"

function toUtcDay(value: string): number {
    const [year, month, day] = value.split("-").map(Number)
    return Date.UTC(year!, month! - 1, day!)
}

export function daysBetweenIso(today: string, dueDate: string | Date): number {
    let dueIso: string
    try {
        dueIso = formatDate(dueDate)
    } catch {
        return Number.NaN
    }
    const diffMs = toUtcDay(dueIso) - toUtcDay(today)
    return Math.round(diffMs / 86_400_000)
}

export function classifyReminder(
    occurrence: Pick<ExpenseOccurrence, "dueDate" | "status">,
    today: string,
): ReminderState {
    if (occurrence.status !== "SCHEDULED") return "NONE"

    const days = daysBetweenIso(today, occurrence.dueDate)
    if (!Number.isFinite(days)) return "NORMAL"
    if (days < 0) return "OVERDUE"
    if (days === 0) return "TODAY"
    if (days <= 3) return "DUE_SOON_3"
    if (days <= 7) return "DUE_SOON_7"
    return "NORMAL"
}

export function createEmptyReminderSummary(): ReminderSummary {
    return {
        overdue: { count: 0, total: 0 },
        today: { count: 0, total: 0 },
        within3Days: { count: 0, total: 0 },
        within7Days: { count: 0, total: 0 },
    }
}

export function summarizeReminders(
    occurrences: ExpenseOccurrence[],
    today: string,
): ReminderSummary {
    const summary = createEmptyReminderSummary()

    for (const occurrence of occurrences) {
        const state = classifyReminder(occurrence, today)
        const amount = occurrence.actualAmount ?? occurrence.expectedAmount
        if (state === "OVERDUE") {
            summary.overdue.count += 1
            summary.overdue.total += amount
        } else if (state === "TODAY") {
            summary.today.count += 1
            summary.today.total += amount
        } else if (state === "DUE_SOON_3") {
            summary.within3Days.count += 1
            summary.within3Days.total += amount
        } else if (state === "DUE_SOON_7") {
            summary.within7Days.count += 1
            summary.within7Days.total += amount
        }
    }

    return summary
}

export function reminderFilterHref(
    bucket: ReminderBucketKey,
    today: string,
): string {
    const params = new URLSearchParams({ status: "SCHEDULED" })
    if (bucket === "overdue") {
        params.set("from", OVERDUE_FROM)
        params.set("to", addDaysIso(today, -1))
    } else if (bucket === "today") {
        params.set("from", today)
        params.set("to", today)
    } else if (bucket === "within3Days") {
        params.set("from", today)
        params.set("to", addDaysIso(today, 3))
    } else {
        params.set("from", today)
        params.set("to", addDaysIso(today, 7))
    }

    return `/occurrences?${params.toString()}`
}
