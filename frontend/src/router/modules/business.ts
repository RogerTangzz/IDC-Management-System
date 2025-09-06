import type { RouteRecordRaw } from 'vue-router'
// 说明：直接静态 import Layout 在某些加载顺序下会与权限/路由 store 形成循环，导致 "Cannot access 'Layout' before initialization"。
// 改为动态 lazy import，避免在模块初始化阶段访问未完成初始化的 Layout 变量。
const Layout = () => import('@/layout/index.vue')
const ParentView = () => import('@/components/ParentView/index.vue')

// 业务管理相关嵌套路由
const businessRoutes: RouteRecordRaw[] = [
    {
        path: '/business',
    component: Layout,
        redirect: '/business/ticket/list',
        name: 'Business',
        meta: { title: 'IDC运维管理', icon: 'monitor' },
        children: [
            {
                path: 'ticket',
                component: ParentView,
                name: 'Ticket',
                redirect: '/business/ticket/list',
                meta: { title: '工单管理', icon: 'edit' },
                children: [
                    {
                        path: 'list',
                        name: 'TicketList',
                        component: () => import('@/views/business/ticket/index.vue'),
                        meta: { title: '工单列表', icon: 'edit' }
                    },
                    {
                        path: 'detail/:ticketId',
                        name: 'TicketDetail',
                        hidden: true,
                        component: () => import('@/views/business/ticket/detail.vue'),
                        meta: { title: '工单详情', icon: 'view', activeMenu: '/business/ticket/list' }
                    },
                    {
                        path: 'edit/:ticketId',
                        name: 'TicketEdit',
                        hidden: true,
                        component: () => import('@/views/business/ticket/index.vue'),
                        meta: { title: '编辑工单', icon: 'edit', activeMenu: '/business/ticket/list', noCache: true }
                    },
                    {
                        path: 'report',
                        name: 'TicketReport',
                        component: () => import('@/views/business/ticket/report.vue'),
                        meta: { title: '工单报表', icon: 'chart', noCache: true }
                    }
                ]
            },
            {
                path: 'asset',
                component: ParentView,
                name: 'Asset',
                meta: { title: '资产管理', icon: 'tool' },
                children: [
                    {
                        path: 'rack',
                        name: 'RackList',
                        component: () => import('@/views/business/asset/rack/index.vue'),
                        meta: { title: '机柜使用', icon: 'list' }
                    },
                    {
                        path: 'rack/detail/:rackId',
                        name: 'RackDetail',
                        hidden: true,
                        component: () => import('@/views/business/asset/rack/detail.vue'),
                        meta: { title: '机柜详情', activeMenu: '/business/asset/rack' }
                    }
                    // 注意：移除了 room 路由，避免导入不存在的文件报错
                ]
            },
            {
                path: 'message',
                name: 'Message',
                component: () => import('@/views/business/message/index.vue'),
                meta: { title: '消息中心', icon: 'bell' }
            },
            {
                path: 'settings',
                component: ParentView,
                name: 'BusinessSettings',
                meta: { title: '业务设置', icon: 'setting' },
                children: [
                    {
                        path: 'sla',
                        name: 'SlaSettings',
                        component: () => import('@/views/business/settings/sla.vue'),
                        meta: { title: 'SLA 阈值设置', icon: 'setting', noCache: true }
                    }
                ]
            },
            {
                path: 'inspection',
                component: ParentView,
                name: 'Inspection',
                redirect: '/business/inspection/list',
                meta: { title: '巡检管理', icon: 'search' },
                children: [
                    {
                        path: 'list',
                        name: 'InspectionList',
                        component: () => import('@/views/business/inspection/index.vue'),
                        meta: { title: '巡检列表', icon: 'list' }
                    },
                    {
                        path: 'create',
                        name: 'InspectionCreate',
                        hidden: true,
                        component: () => import('@/views/business/inspection/create.vue'),
                        meta: { title: '开始巡检', icon: 'form', activeMenu: '/business/inspection/list' }
                    },
                    {
                        path: 'edit/:inspectionId',
                        name: 'InspectionEdit',
                        hidden: true,
                        component: () => import('@/views/business/inspection/edit.vue'),
                        meta: { title: '继续巡检', icon: 'form', activeMenu: '/business/inspection/list' }
                    },
                    {
                        path: 'detail/:inspectionId',
                        name: 'InspectionDetail',
                        hidden: true,
                        component: () => import('@/views/business/inspection/detail.vue'),
                        meta: { title: '巡检详情', icon: 'view', activeMenu: '/business/inspection/list' }
                    }
                ]
            },
            {
                path: 'maintenance',
                component: ParentView,
                name: 'Maintenance',
                redirect: '/business/maintenance/plan',
                meta: { title: '维保管理', icon: 'tool' },
                children: [
                    {
                        path: 'plan',
                        name: 'MaintenancePlan',
                        component: () => import('@/views/business/maintenance/plan/index.vue'),
                        meta: { title: '计划列表', icon: 'list' }
                    },
                    {
                        path: 'plan/form/:planId?',
                        name: 'MaintenancePlanForm',
                        hidden: true,
                        component: () => import('@/views/business/maintenance/plan/form.vue'),
                        meta: { title: '计划表单', icon: 'form', activeMenu: '/business/maintenance/plan' }
                    },
                    {
                        path: 'plan/detail/:planId',
                        name: 'MaintenancePlanDetail',
                        hidden: true,
                        component: () => import('@/views/business/maintenance/plan/detail.vue'),
                        meta: { title: '计划详情', icon: 'view', activeMenu: '/business/maintenance/plan' }
                    }
                ]
            }
        ]
    }
]

export default businessRoutes
