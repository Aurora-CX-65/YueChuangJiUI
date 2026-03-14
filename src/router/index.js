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
        path: 'books/:bookId/chapters/:chapterId',
        name: 'ChapterReading',
        component: () => import('../views/books/ChapterReading.vue'),
        meta: { 
          title: '章节阅读',
          description: '在线阅读书籍章节'
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
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('../views/NotificationsView.vue'),
        meta: {
          title: '通知中心',
          description: '查看与管理通知',
          requiresAuth: true
        }
      },
      {
        path: 'users/:id',
        name: 'UserProfile',
        component: () => import('../views/UserProfileView.vue'),
        meta: {
          title: '用户主页',
          description: '查看用户公开信息'
        }
      },
      {
        path: 'author/apply',
        name: 'AuthorApply',
        component: () => import('../views/author/AuthorApply.vue'),
        meta: {
          title: '申请成为作者',
          description: '申请成为平台作者',
          requiresAuth: true
        }
      },
      {
        path: 'authors/:id',
        redirect: to => {
          return { name: 'UserProfile', params: { id: to.params.id } }
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
    path: '/login',
    redirect: '/auth/login'
  }
  ,
  {
    path: '/author',
    component: () => import('../layouts/AuthorLayout.vue'),
    // 移除这里的 redirect 属性，完全由路由守卫 beforeEachGuard 处理分流
    meta: {
      // 允许 author 和 editor 访问
      requiresRole: ['author', 'editor']
    },
    children: [
      // === 作者专用路由 ===
      {
        path: 'dashboard',
        name: 'AuthorDashboard',
        component: () => import('../views/author/AuthorDashboard.vue'),
        meta: { title: '作者中心 - 仪表盘', requiresRole: 'author' }
      },
      {
        path: 'books',
        name: 'AuthorBooks',
        component: () => import('../views/author/AuthorBooks.vue'),
        meta: { title: '作者中心 - 作品管理', requiresRole: 'author' }
      },
      {
        path: 'books/create',
        name: 'AuthorBookCreate',
        component: () => import('../views/author/AuthorBookCreate.vue'),
        meta: { title: '作者中心 - 创建新书', requiresRole: 'author' }
      },
      {
        path: 'books/:id/edit',
        name: 'AuthorBookEdit',
        component: () => import('../views/author/AuthorBookEdit.vue'),
        meta: { title: '作者中心 - 编辑书籍', requiresRole: 'author' }
      },
      {
        path: 'books/:id/chapters',
        name: 'AuthorChapterManager',
        component: () => import('../views/author/AuthorChapterManager.vue'),
        meta: { title: '作者中心 - 章节管理', requiresRole: 'author' }
      },
      {
        path: 'books/:id/characters',
        name: 'AuthorCharacterManager',
        component: () => import('../views/author/AuthorCharacterManager.vue'),
        meta: { title: '作者中心 - 角色管理', requiresRole: 'author' }
      },
      {
        path: 'books/:id/outlines',
        name: 'AuthorOutlineManager',
        component: () => import('../views/author/AuthorOutlineManager.vue'),
        meta: { title: '作者中心 - 大纲管理', requiresRole: 'author' }
      },
      {
        path: 'books/:id/timelines',
        name: 'AuthorTimelineManager',
        component: () => import('../views/author/AuthorTimelineManager.vue'),
        meta: { title: '作者中心 - 时间线管理', requiresRole: 'author' }
      },
      {
        path: 'books/:id/chapters/create',
        name: 'AuthorChapterCreate',
        component: () => import('../views/author/AuthorChapterEditor.vue'),
        meta: { title: '作者中心 - 创建章节', requiresRole: 'author' }
      },
      {
        path: 'books/:id/chapters/:chapterId/edit',
        name: 'AuthorChapterEdit',
        component: () => import('../views/author/AuthorChapterEditor.vue'),
        meta: { title: '作者中心 - 编辑章节', requiresRole: 'author' }
      },
      {
        path: 'comments',
        name: 'AuthorComments',
        component: () => import('../views/author/AuthorComments.vue'),
        meta: { title: '作者中心 - 评论互动', requiresRole: 'author' }
      },
      {
        path: 'settings',
        name: 'AuthorSettings',
        component: () => import('../views/author/AuthorSettings.vue'),
        meta: { title: '作者中心 - 创作设置', requiresRole: 'author' }
      },

      // === 编辑专用路由（复用 Admin 组件） ===
      {
        path: 'review-dashboard',
        name: 'EditorDashboard',
        component: () => import('../views/author/EditorDashboard.vue'),
        meta: { title: '编辑中心 - 仪表盘', requiresRole: 'editor' }
      },
      {
        path: 'chapter-management',
        name: 'AdminChapterManagement',
        component: () => import('../views/admin/AdminChapterManagement.vue'),
        meta: {
          title: '章节管理',
          description: '管理平台所有章节（下架/恢复）',
          requiresRole: 'admin'
        }
      },
      {
        path: 'chapter-management/:bookId',
        name: 'AdminBookChapters',
        component: () => import('../views/admin/AdminBookChapters.vue'),
        meta: {
          title: '书籍章节列表',
          description: '管理指定书籍的章节',
          requiresRole: 'admin'
        }
      },
      {
        path: 'book-reviews',
        name: 'EditorBookReviews',
        component: () => import('../views/admin/AdminBookReviews.vue'),
        meta: { title: '编辑中心 - 书籍审核', requiresRole: 'editor' }
      },
      {
        path: 'chapter-reviews',
        name: 'EditorChapterReviews',
        component: () => import('../views/admin/AdminChapterReviews.vue'),
        meta: { title: '编辑中心 - 章节审核', requiresRole: 'editor' }
      },
      {
        path: 'comment-reviews',
        name: 'EditorCommentReviews',
        component: () => import('../views/admin/AdminCommentReviews.vue'),
        meta: { title: '编辑中心 - 评论审核', requiresRole: 'editor' }
      },
      {
        path: 'author-applications',
        name: 'EditorAuthorApplications',
        component: () => import('../views/admin/AdminAuthorApplications.vue'),
        meta: { title: '编辑中心 - 作者申请', requiresRole: 'editor' }
      },
      {
        path: 'chapter-management',
        name: 'EditorChapterManagement',
        component: () => import('../views/admin/AdminChapterManagement.vue'),
        meta: { title: '编辑中心 - 章节管理', requiresRole: 'editor' }
      },
      {
        path: 'chapter-management/:bookId',
        name: 'EditorBookChapters',
        component: () => import('../views/admin/AdminBookChapters.vue'),
        meta: { title: '编辑中心 - 书籍章节', requiresRole: 'editor' }
      }
    ]
  },
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
          description: '管理平台书籍',
          requiresRole: 'admin'
        }
      },
      {
        path: 'chapter-management',
        name: 'AdminChapterManagement',
        component: () => import('../views/admin/AdminChapterManagement.vue'),
        meta: {
          title: '章节管理',
          description: '管理平台所有章节（下架/恢复）',
          requiresRole: 'admin'
        }
      },
      {
        path: 'chapter-management/:bookId',
        name: 'AdminBookChapters',
        component: () => import('../views/admin/AdminBookChapters.vue'),
        meta: {
          title: '书籍章节列表',
          description: '管理指定书籍的章节',
          requiresRole: 'admin'
        }
      },
      {
        path: 'book-reviews',
        name: 'AdminBookReviews',
        component: () => import('../views/admin/AdminBookReviews.vue'),
        meta: {
          title: '书籍审核',
          description: '审核作者提交的书籍',
          requiresRole: 'admin'
        }
      },
      {
        path: 'chapter-reviews',
        name: 'AdminChapterReviews',
        component: () => import('../views/admin/AdminChapterReviews.vue'),
        meta: {
          title: '章节审核',
          description: '审核作者提交的章节',
          requiresRole: 'admin'
        }
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/admin/AdminComments.vue'),
        meta: {
          title: '评论管理',
          description: '管理平台评论',
          requiresRole: 'admin'
        }
      },
      {
        path: 'comment-reviews',
        name: 'AdminCommentReviews',
        component: () => import('../views/admin/AdminCommentReviews.vue'),
        meta: {
          title: '评论审核',
          description: '审核用户评论',
          requiresRole: 'admin'
        }
      },
      {
        path: 'author-applications',
        name: 'AdminAuthorApplications',
        component: () => import('../views/admin/AdminAuthorApplications.vue'),
        meta: {
          title: '作者申请审核',
          description: '审核作者申请',
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
        path: 'logs',
        name: 'AdminOperationLogs',
        component: () => import('../views/admin/AdminOperationLogs.vue'),
        meta: {
          title: '操作日志',
          description: '查看系统操作日志',
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
