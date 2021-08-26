import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: 'table' }
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: { title: 'Tree', icon: 'tree' }
      }
    ]
  },

  {
    path: '/vue-i18',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'VueI18',
        component: () => import('@/views/vueI18/index'),
        meta: { title: 'vue国际化', icon: '' }
      }
    ]
  },

  {
    path: '/title-tree',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'TitleTree',
        component: () => import('@/views/titleTree/index'),
        meta: { title: '标题树', icon: '' }
      }
    ]
  },

  {
    path: '/visual-layout',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'VisualLayout',
        component: () => import('@/views/visualLayout/index'),
        meta: { title: '可视化布局', icon: '' }
      }
    ]
  },

  {
    path: '/object-fit',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ObjectFit',
        component: () => import('@/views/objectFit/index'),
        meta: { title: 'ObjectFit', icon: '' }
      }
    ]
  },

  {
    path: '/license',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'License',
        component: () => import('@/views/license/index'),
        meta: { title: '许可证', icon: '' }
      }
    ]
  },

  {
    path: '/error-handler',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ErrorHandler',
        component: () => import('@/views/errorHandler/index'),
        meta: { title: '异常处理', icon: '' }
      }
    ]
  },

  {
    path: '/render-function',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'RenderFunction',
        component: () => import('@/views/renderFunction/index'),
        meta: { title: '渲染函数', icon: '' }
      }
    ]
  },

  {
    path: '/common-regular-expression',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'CommonRegularExpression',
        component: () => import('@/views/commonRegularExpression/index'),
        meta: { title: '常用正则表达式', icon: 'regular' }
      }
    ]
  },

  {
    path: '/mock-demo',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'MockDemo',
        component: () => import('@/views/mockDemo/index'),
        meta: { title: '测试mock是否生效', icon: '' }
      }
    ]
  },

  {
    path: '/slot',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Slot',
        component: () => import('@/views/slot/index'),
        meta: { title: '插槽', icon: '' }
      }
    ]
  },

  {
    path: '/ext-name',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ExtName',
        component: () => import('@/views/extName/index'),
        meta: { title: '提取文件后缀名', icon: '' }
      }
    ]
  },

  {
    path: '/file-signature',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'FileSignature',
        component: () => import('@/views/fileSignature/index'),
        meta: { title: '精确校验文件类型', icon: '' }
      }
    ]
  },

  {
    path: '/dynamic-form-demo',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'DynamicFormDemo',
        component: () => import('@/views/dynamicForm/demo'),
        meta: { title: '动态表单', icon: 'form' }
      }
    ]
  },

  {
    path: '/table-select-in-dialog',
    component: Layout,
    redirect: '/table-select-in-dialog/radio',
    name: 'TableSelectInDialog',
    meta: {
      title: '表格选中数据回显',
      icon: ''
    },
    children: [
      {
        path: 'radio',
        name: 'TableSelectInDialogRadio',
        component: () => import('@/views/tableSelectInDialog/radio'),
        meta: { title: '单选', icon: '' }
      },
      {
        path: 'checkbox',
        name: 'TableSelectInDialogCheckbox',
        component: () => import('@/views/tableSelectInDialog/checkbox'),
        meta: { title: '多选', icon: '' }
      }
    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Nested',
      icon: 'nested'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        name: 'Menu2',
        meta: { title: 'menu2' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
