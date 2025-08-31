// 业务 / 系统实体类型集中定义（可逐步补充完善）
// 说明：根据常见 RuoYi 返回结构及当前前端使用场景抽取的核心字段。
// 若后端字段存在差异，可在实际使用处通过交叉类型 (&) 或扩展接口方式补充。

interface BaseEntity {
    createBy?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
    remark?: string
    params?: Record<string, any>
}

// ---------------- 系统管理 ----------------
interface User extends BaseEntity {
    userId: number | string
    userName: string
    nickName?: string
    deptId?: number | string
    email?: string
    phonenumber?: string
    sex?: '0' | '1' | '2'
    avatar?: string
    status?: '0' | '1'
    roles?: Role[]
    roleIds?: (number | string)[]
    dept?: Dept
    admin?: boolean
}

interface Role extends BaseEntity {
    roleId: number | string
    roleName: string
    roleKey: string
    roleSort?: number
    dataScope?: string
    status?: string
    menuIds?: (number | string)[]
    deptIds?: (number | string)[]
    flag?: boolean
}

interface Dept extends BaseEntity {
    deptId: number | string
    parentId?: number | string
    deptName: string
    orderNum?: number
    leader?: string
    phone?: string
    email?: string
    status?: string
    children?: Dept[]
}

interface Menu extends BaseEntity {
    menuId: number | string
    parentId?: number | string
    menuName: string
    path: string
    component?: string
    visible?: string
    icon?: string
    orderNum?: number
    isFrame?: number
    children?: Menu[]
    perms?: string
}

// 后端返回前端动态加载的路由节点（菜单路由）
interface MenuRouteMeta {
    title?: string
    icon?: string
    noCache?: boolean
    breadcrumb?: boolean
    activeMenu?: string
    affix?: boolean
    link?: string
}
interface MenuRouteNode {
    hidden?: boolean
    alwaysShow?: boolean
    name?: string
    path: string
    redirect?: string
    component?: string
    permissions?: string[]
    roles?: string[]
    meta?: MenuRouteMeta
    children?: MenuRouteNode[]
}
interface RouterResponse { msg: string; code: number; data: MenuRouteNode[] }

interface DictType extends BaseEntity {
    dictId: number | string
    dictName: string
    dictType: string
    status?: string
}

interface DictData extends BaseEntity {
    dictCode: number | string
    dictSort?: number
    dictLabel: string
    dictValue: string
    dictType: string
    cssClass?: string
    listClass?: string
    isDefault?: string
    status?: string
}

interface Post extends BaseEntity {
    postId: number | string
    postCode?: string
    postName: string
    postSort?: number
    status?: string
}

interface Notice extends BaseEntity {
    noticeId: number | string
    noticeTitle: string
    noticeType?: string
    noticeContent?: string
    status?: string
}

interface Config extends BaseEntity {
    configId: number | string
    configName: string
    configKey: string
    configValue: string
    configType?: string
}

// ---------------- 监控 / 调度 ----------------
interface Job extends BaseEntity {
    jobId: number | string
    jobName: string
    jobGroup: string
    invokeTarget: string
    cronExpression: string
    misfirePolicy?: string
    concurrent?: string
    status?: string
    nextValidTime?: string
}

interface JobLog extends BaseEntity {
    jobLogId: number | string
    jobName: string
    jobGroup: string
    invokeTarget: string
    status?: string
    exceptionInfo?: string
    startTime?: string
    stopTime?: string
}

interface ServerStatus {
    cpu?: { used?: number; sys?: number; free?: number; cpuNum?: number }
    memory?: { total?: number; used?: number; free?: number }
    jvm?: { total?: number; used?: number; free?: number; version?: string; name?: string }
    sys?: { computerName?: string; computerIp?: string; osName?: string; osArch?: string }
    disk?: Array<{ dirName?: string; sysTypeName?: string; typeName?: string; total?: number; free?: number; used?: number; usage?: number }>
}

interface CacheSummary {
    cacheNames?: string[]
    redisVersion?: string
    mode?: string
    connectedClients?: number
    uptime?: number
    memoryUsed?: number
    memoryPeak?: number
}

interface CacheEntry {
    key: string
    value: any
    ttl?: number
    size?: number
}

interface OperLog extends BaseEntity {
    operId: number | string
    title?: string
    businessType?: number
    method?: string
    requestMethod?: string
    operatorType?: number
    operName?: string
    deptName?: string
    operUrl?: string
    operIp?: string
    operLocation?: string
    operParam?: string
    jsonResult?: string
    status?: number
    errorMsg?: string
    operTime?: string
}

interface LoginInfo extends BaseEntity {
    infoId: number | string
    userName?: string
    ipaddr?: string
    loginLocation?: string
    browser?: string
    os?: string
    status?: string
    msg?: string
    loginTime?: string
}

interface NoticeTemplate extends BaseEntity {
    id: number | string
    name: string
    type?: string
    content?: string
    status?: string
}

// ---------------- 业务域 ----------------
interface Ticket extends BaseEntity {
    ticketId: number | string
    title: string
    status?: string
    priority?: string
    assigneeId?: number | string
    creatorId?: number | string
    dueTime?: string
    type?: string
    anomalyCount?: number
}

interface MaintenancePlan extends BaseEntity {
    planId: number | string
    name: string
    cycle?: string
    nextTime?: string
    status?: string
    approverId?: number | string
    executionCount?: number
}

interface MaintenanceExecution extends BaseEntity {
    executionId: number | string
    planId: number | string
    startTime?: string
    endTime?: string
    status?: string
    result?: string
}

interface ApprovalRecord extends BaseEntity {
    id: number | string
    planId?: number | string
    approverId?: number | string
    approverName?: string
    action?: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REVOKE'
    comment?: string
    createTime?: string
}

interface Inspection extends BaseEntity {
    inspectionId: number | string
    floor?: string | number
    status?: string
    startTime?: string
    endTime?: string
    anomalyCount?: number
}

interface InspectionItem extends BaseEntity {
    itemId: number | string
    inspectionId?: number | string
    name: string
    value?: string | number
    threshold?: string | number
    abnormal?: boolean
}

interface InspectionStatistics {
    total?: number
    anomalies?: number
    anomalyRate?: number
    floors?: Array<{ floor: string | number; count: number; anomalies: number }>
    recent?: Array<{ date: string; count: number; anomalies: number }>
}

interface IndustryStandard extends BaseEntity {
    id: number | string
    itemName?: string
    threshold?: string | number
    unit?: string
    category?: string
}

interface ThresholdHistoryRecord extends BaseEntity {
    id: number | string
    itemId?: number | string
    oldValue?: string | number
    newValue?: string | number
    changeUser?: string
    changeTime?: string
}

// 统一导出空语句避免成为全局脚本
export { }
