export default [
  {
    path: '/business',
    component: Layout,
    redirect: '/business/ticket',
    name: 'Business',
    meta: { title: 'IDC运维管理', icon: 'monitor' },
    children: [
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('@/views/business/ticket/index'),
        meta: { title: '工单管理', icon: 'edit' }
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/business/inspection/index'),
        meta: { title: '巡检管理', icon: 'search' }
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/business/maintenance/plan/index'),
        meta: { title: '维保管理', icon: 'tool' }
      }
    ]
  }
]