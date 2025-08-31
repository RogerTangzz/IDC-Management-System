import Layout from '@/layout'
import ParentView from '@/components/ParentView'

export default [
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
            component: () => import('@/views/business/ticket/index'),
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
            component: () => import('@/views/business/ticket/index'),
            meta: { title: '编辑工单', icon: 'edit', activeMenu: '/business/ticket/list', noCache: true }
          }
        ]
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/business/inspection/index'),
        meta: { title: '巡检管理', icon: 'search' }
      },
      {
        path: 'inspection/create',
        name: 'InspectionCreate',
        hidden: true,
        component: () => import('@/views/business/inspection/create'),
        meta: { title: '开始巡检', icon: 'form' }
      },
      {
        path: 'inspection/edit/:inspectionId',
        name: 'InspectionEdit',
        hidden: true,
        component: () => import('@/views/business/inspection/edit'),
        meta: { title: '继续巡检', icon: 'form' }
      },
      {
        path: 'inspection/detail/:inspectionId',
        name: 'InspectionDetail',
        hidden: true,
        component: () => import('@/views/business/inspection/detail'),
        meta: { title: '巡检详情', icon: 'view' }
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/business/maintenance/plan/index'),
        meta: { title: '维保管理', icon: 'tool' }
      },
      {
        path: 'maintenance/plan/form/:planId?',
        name: 'MaintenancePlanForm',
        hidden: true,
        component: () => import('@/views/business/maintenance/plan/form'),
        meta: { title: '维保计划表单', icon: 'form' }
      },
      {
        path: 'maintenance/plan/detail/:planId',
        name: 'MaintenancePlanDetail',
        hidden: true,
        component: () => import('@/views/business/maintenance/plan/detail'),
        meta: { title: '维保计划详情', icon: 'view' }
      }
    ]
  }
]