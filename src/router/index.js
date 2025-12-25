import { createRouter, createWebHistory } from 'vue-router';
import FullLayout from '../layouts/FullLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import Home from '../views/Home.vue';
import { beforeEachGuard, afterEachGuard, routeErrorHandler } from './route-guards.js';

const routes = [
  {
    path: '/',
    component: FullLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { 
          title: '首页',
          description: '发现优质内容，开启阅读之旅'
        }
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('../views/BooksView.vue'),
        meta: { 
          title: '书籍',
          description: '浏览和搜索书籍'
        }
      },
      {
        path: 'ranking',
        name: 'Ranking',
        component: () => import('../views/RankingView.vue'),
        meta: { 
          title: '排行榜',
          description: '热门书籍排行榜'
        }
      },
      {
        path: 'books/:id',
        name: 'BookDetail',
        component: () => import('../views/books/BookDetail.vue'),
        meta: { 
          title: '书籍详情',
          description: '查看书籍详细信息'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: {
          title: '个人中心',
          description: '查看与管理个人信息',
          requiresAuth: true
        }
      }
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../components/LoginForm.vue'),
        meta: { 
          title: '登录',
          description: '欢迎回来！登录以继续您的创作或阅读之旅。',
          requiresGuest: true
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../components/RegisterForm.vue'),
        meta: { 
          title: '注册',
          description: '加入阅创集，开启您的创作与阅读新篇章。',
          requiresGuest: true
        },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('../components/ForgotPasswordForm.vue'),
        meta: { 
          title: '找回密码',
          description: '找回您的帐户。请输入您的邮箱以接收密码重置链接。',
          requiresGuest: true
        },
      },
    ],
  }
  ,
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
        meta: {
          title: '管理后台',
          description: '平台管理仪表盘',
          requiresRole: 'admin'
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers.vue'),
        meta: {
          title: '用户管理',
          description: '管理平台用户账户',
          requiresRole: 'admin'
        }
      },
      {
        path: 'books',
        name: 'AdminBooks',
        component: () => import('../views/admin/AdminBooks.vue'),
        meta: {
          title: '书籍管理',
          description: '管理与审核书籍',
          requiresRole: 'admin'
        }
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/admin/AdminComments.vue'),
        meta: {
          title: '评论管理',
          description: '管理与审核评论',
          requiresRole: 'admin'
        }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/AdminCategories.vue'),
        meta: {
          title: '分类管理',
          description: '管理书籍分类',
          requiresRole: 'admin'
        }
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('../views/admin/AdminTags.vue'),
        meta: {
          title: '标签管理',
          description: '管理书籍标签',
          requiresRole: 'admin'
        }
      },
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: () => import('../views/admin/AdminNotifications.vue'),
        meta: {
          title: '通知管理',
          description: '管理系统通知',
          requiresRole: 'admin'
        }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/AdminSettings.vue'),
        meta: {
          title: '系统设置',
          description: '平台基础设置',
          requiresRole: 'admin'
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 注册路由守卫
router.beforeEach(beforeEachGuard);
router.afterEach(afterEachGuard);
router.onError(routeErrorHandler);

export default router;
