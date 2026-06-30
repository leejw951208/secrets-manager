"use client"
// 지출 신규 추가 라우트. ExpenseForm 을 빈 상태로 mount 한다.
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { listAssetCategories, type AssetCategory } from "@/lib/vault-client"
import { ExpenseForm } from "../_components/ExpenseForm"

export default function NewExpensePage() {
    const router = useRouter()
    const [categories, setCategories] = useState<AssetCategory[]>([])

    useEffect(() => {
        listAssetCategories()
            .then(setCategories)
            .catch(() => {})
    }, [])

    const back = () => {
        router.push("/asset")
        router.refresh()
    }
    return (
        <ExpenseForm
            categories={categories}
            initial={null}
            onSaved={back}
            onCancel={back}
            onDeleted={back}
        />
    )
}
