"use client"
// 카테고리 관리 바텀시트. 목록 표시·추가·인라인 수정·삭제를 지원한다.
// 모든 쓰기 후 목록 재조회 및 onChanged 콜백 호출.
import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { useVault } from "../../_lib/vault-context"
import {
    listAssetCategories,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    type AssetCategory,
} from "@/lib/vault-client"
import { isApiError } from "@/lib/api-error"
import { CATEGORY_PALETTE } from "../_lib/asset-categories"

// ─── ColorPicker ─────────────────────────────────────────────────────────────

interface ColorPickerProps {
    value: string
    onChange: (color: string) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORY_PALETTE.map((color) => (
                <button
                    key={color}
                    type="button"
                    aria-label={color}
                    aria-pressed={value === color}
                    onClick={() => onChange(color)}
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: color,
                        border:
                            value === color
                                ? "3px solid var(--color-text)"
                                : "3px solid transparent",
                        cursor: "pointer",
                        padding: 0,
                        outline: "none",
                    }}
                />
            ))}
        </div>
    )
}

// ─── AddSection ──────────────────────────────────────────────────────────────

interface AddSectionProps {
    onAdd: (name: string, color: string) => Promise<void>
    onActivity: () => void
}

function AddSection({ onAdd, onActivity }: AddSectionProps) {
    const [name, setName] = useState("")
    const [color, setColor] = useState(CATEGORY_PALETTE[0] ?? "#f2994a")
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || saving) return
        setSaving(true)
        try {
            await onAdd(name.trim(), color)
            setName("")
            setColor(CATEGORY_PALETTE[0] ?? "#f2994a")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                }}
            >
                새 카테고리
            </div>
            <input
                type="text"
                className="input"
                placeholder="이름 (최대 20자)"
                value={name}
                maxLength={20}
                onChange={(e) => {
                    onActivity()
                    setName(e.target.value)
                }}
                style={{ marginBottom: 10 }}
            />
            <ColorPicker
                value={color}
                onChange={(c) => {
                    onActivity()
                    setColor(c)
                }}
            />
            <button
                type="submit"
                className="btn"
                disabled={!name.trim() || saving}
                style={{ width: "100%", marginTop: 12 }}
            >
                {saving ? "추가 중…" : "+ 추가"}
            </button>
        </form>
    )
}

// ─── CategoryRow ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
    category: AssetCategory
    onEdit: (
        id: string,
        patch: { name?: string; color?: string },
    ) => Promise<void>
    onDelete: (category: AssetCategory) => void
    onActivity: () => void
}

function CategoryRow({
    category,
    onEdit,
    onDelete,
    onActivity,
}: CategoryRowProps) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(category.name)
    const [color, setColor] = useState(category.color)
    const [saving, setSaving] = useState(false)

    function cancelEdit() {
        onActivity()
        setEditing(false)
        setName(category.name)
        setColor(category.color)
    }

    async function handleSave() {
        if (saving) return
        setSaving(true)
        try {
            await onEdit(category.id, {
                name: name.trim() || category.name,
                color,
            })
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }

    if (editing) {
        return (
            <div
                style={{
                    padding: "12px 0",
                    borderBottom: "1px solid var(--color-border)",
                }}
            >
                <input
                    type="text"
                    className="input"
                    value={name}
                    maxLength={20}
                    onChange={(e) => {
                        onActivity()
                        setName(e.target.value)
                    }}
                    style={{ marginBottom: 10 }}
                />
                <ColorPicker
                    value={color}
                    onChange={(c) => {
                        onActivity()
                        setColor(c)
                    }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={cancelEdit}
                        style={{ flex: 1 }}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="btn"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ flex: 1 }}
                    >
                        {saving ? "저장 중…" : "저장"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--color-border)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                    aria-hidden="true"
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: category.color,
                        flexShrink: 0,
                    }}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {category.name}
                </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
                <button
                    type="button"
                    className="btn-text"
                    onClick={() => {
                        onActivity()
                        setEditing(true)
                    }}
                >
                    수정
                </button>
                <button
                    type="button"
                    className="btn-text"
                    style={{ color: "var(--color-danger, #ef4444)" }}
                    onClick={() => {
                        onActivity()
                        onDelete(category)
                    }}
                >
                    삭제
                </button>
            </div>
        </div>
    )
}

// ─── CategoryManager (main export) ───────────────────────────────────────────

interface Props {
    onClose: () => void
    onChanged?: () => void
}

export function CategoryManager({ onClose, onChanged }: Props) {
    const { resetIdle } = useVault()
    const [categories, setCategories] = useState<AssetCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pendingDelete, setPendingDelete] = useState<AssetCategory | null>(
        null,
    )

    async function loadCategories() {
        setLoading(true)
        setError(null)
        try {
            const data = await listAssetCategories()
            setCategories(data)
        } catch (e) {
            setError(isApiError(e) ? e.message : "불러오지 못했습니다.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadCategories()
    }, [])

    async function handleAdd(name: string, color: string) {
        setError(null)
        try {
            await createAssetCategory(name, color)
            await loadCategories()
            onChanged?.()
        } catch (e) {
            setError(isApiError(e) ? e.message : "추가에 실패했습니다.")
        }
    }

    async function handleEdit(
        id: string,
        patch: { name?: string; color?: string },
    ) {
        setError(null)
        try {
            await updateAssetCategory(id, patch)
            await loadCategories()
            onChanged?.()
        } catch (e) {
            setError(isApiError(e) ? e.message : "수정에 실패했습니다.")
        }
    }

    async function confirmDelete() {
        if (!pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setError(null)
        try {
            await deleteAssetCategory(target.id)
            await loadCategories()
            onChanged?.()
        } catch (e) {
            setError(isApiError(e) ? e.message : "삭제에 실패했습니다.")
        }
    }

    return (
        <div
            className="dialog-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="카테고리 관리"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="sheet">
                <div className="sheet-grip" aria-hidden="true" />
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                        카테고리 관리
                    </div>
                    <button
                        type="button"
                        className="btn-text"
                        aria-label="닫기"
                        onClick={() => {
                            resetIdle()
                            onClose()
                        }}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="error-box"
                        style={{ marginBottom: 12 }}
                    >
                        {error}
                    </div>
                )}

                <AddSection onAdd={handleAdd} onActivity={resetIdle} />

                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "22px 0",
                            fontSize: 13,
                            color: "var(--color-text-muted)",
                            fontWeight: 600,
                        }}
                    >
                        불러오는 중…
                    </div>
                ) : categories.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "22px 0",
                            fontSize: 13,
                            color: "var(--color-text-muted)",
                            fontWeight: 600,
                        }}
                    >
                        아직 카테고리가 없어요.
                    </div>
                ) : (
                    <div>
                        {categories.map((cat) => (
                            <CategoryRow
                                key={cat.id}
                                category={cat}
                                onEdit={handleEdit}
                                onDelete={(c) => {
                                    resetIdle()
                                    setPendingDelete(c)
                                }}
                                onActivity={resetIdle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {pendingDelete && (
                <ConfirmDialog
                    open
                    title="카테고리 삭제"
                    message="이 카테고리의 지출은 미분류가 됩니다."
                    confirmLabel="삭제"
                    destructive
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        resetIdle()
                        setPendingDelete(null)
                    }}
                />
            )}
        </div>
    )
}
