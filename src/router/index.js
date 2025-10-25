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