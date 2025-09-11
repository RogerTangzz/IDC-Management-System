// 初步 TS 化：inspectionAnomaly
// 说明：保留原 JS 版本以便逐步迁移；后续稳定后可删除 .js
// 类型根据当前已知使用场景推导，必要时可再细化

export interface InspectionItem {
    id: number | string
    value: number
    threshold?: number
    name?: string
    [key: string]: any
}

export interface TicketPayload {
    itemId: InspectionItem['id']
    severity: number
    message: string
    createdAt: string
}

export function calculateSeverity(delta: number): number {
    if (delta > 50) return 3
    if (delta > 20) return 2
    if (delta > 0) return 1
    return 0
}

export function detectAnomalies(items: InspectionItem[]): TicketPayload[] {
    const tickets: TicketPayload[] = []
    for (const item of items) {
        if (typeof item.threshold === 'number' && typeof item.value === 'number') {
            const delta = item.value - item.threshold
            if (delta > 0) {
                tickets.push({
                    itemId: item.id,
                    severity: calculateSeverity(delta),
                    message: `${item.name || item.id} 超出阈值 ${delta}`,
                    createdAt: new Date().toISOString()
                })
            }
        }
    }
    return tickets
}

export function generateTickets(items: InspectionItem[]): TicketPayload[] {
    return detectAnomalies(items)
}
