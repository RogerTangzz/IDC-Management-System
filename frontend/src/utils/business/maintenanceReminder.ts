// 初步 TS 化：maintenanceReminder
// 说明：保留原 JS 版本；后续可统一导入 TS 版本。

export interface MaintenancePlan {
    id: number | string
    nextTime: string // ISO string
    advanceHours?: number // 提前提醒小时数
    name?: string
    [key: string]: any
}

export interface ReminderPayload {
    planId: MaintenancePlan['id']
    dueInHours: number
    message: string
    createdAt: string
}

export function listUpcoming(plans: MaintenancePlan[], now: Date = new Date()): ReminderPayload[] {
    const res: ReminderPayload[] = []
    for (const p of plans) {
        if (!p.nextTime) continue
        const due = new Date(p.nextTime).getTime() - now.getTime()
        const hours = due / 36e5
        const advance = typeof p.advanceHours === 'number' ? p.advanceHours : 0
        if (hours <= advance) {
            res.push({
                planId: p.id,
                dueInHours: hours,
                message: `${p.name || p.id} 计划即将到期 (剩余 ${hours.toFixed(1)} 小时)`,
                createdAt: new Date().toISOString()
            })
        }
    }
    return res
}
