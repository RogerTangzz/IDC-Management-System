import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import ParentView from '@/components/ParentView/index.vue'

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
                    }
                ]
            },
            {
                path: 'inspection',
                name: 'Inspection',
                component: () => import('@/views/business/inspection/index.vue'),
                meta: { title: '巡检管理', icon: 'search' }
            },
            {
                path: 'inspection/create',
                name: 'InspectionCreate',
                hidden: true,
                component: () => import('@/views/business/inspection/create.vue'),
                meta: { title: '开始巡检', icon: 'form' }
            },
            {
                path: 'inspection/edit/:inspectionId',
                name: 'InspectionEdit',
                hidden: true,
                component: () => import('@/views/business/inspection/edit.vue'),
                meta: { title: '继续巡检', icon: 'form' }
            },
            {
                path: 'inspection/detail/:inspectionId',
                name: 'InspectionDetail',
                hidden: true,
                component: () => import('@/views/business/inspection/detail.vue'),
                meta: { title: '巡检详情', icon: 'view' }
            },
            {
                path: 'maintenance',
                name: 'Maintenance',
                component: () => import('@/views/business/maintenance/plan/index.vue'),
                meta: { title: '维保管理', icon: 'tool' }
            },
            {
                path: 'maintenance/plan/form/:planId?',
                name: 'MaintenancePlanForm',
                hidden: true,
                component: () => import('@/views/business/maintenance/plan/form.vue'),
                meta: { title: '维保计划表单', icon: 'form' }
            },
            {
                path: 'maintenance/plan/detail/:planId',
                name: 'MaintenancePlanDetail',
                hidden: true,
                component: () => import('@/views/business/maintenance/plan/detail.vue'),
                meta: { title: '维保计划详情', icon: 'view' }
            }
        ]
    }
]

export default businessRoutes