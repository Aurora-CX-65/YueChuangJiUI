<template>
  <div class="reading-page" :class="[currentTheme.className, { 'hide-cursor': !showMenu }]" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <transition name="slide-down">
      <div v-show="showMenu" class="top-bar">
        <div class="left-actions">
          <el-button link @click="goBack" class="nav-btn">
            <el-icon><ArrowLeft /></el-icon> 返回书页
          </el-button>
          <span class="book-title-nav" v-if="bookTitle">{{ bookTitle }}</span>
        </div>
        <div class="right-actions">
          <el-button link @click="router.push('/')" class="nav-btn">首页</el-button>
          <el-button link @click="router.push('/profile')" class="nav-btn">个人中心</el-button>
        </div>
      </div>
    </transition>

    <!-- 侧边工具栏 -->
    <div class="side-toolbar">
      <el-tooltip content="目录/书签" placement="left">
        <div class="toolbar-item" @click="showCatalog = true">
          <el-icon><List /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="添加书签" placement="left">
        <div class="toolbar-item" @click="handleAddBookmark">
          <el-icon><Collection /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="设置" placement="left">
        <div class="toolbar-item" :class="{ active: showSettings }" @click.stop="toggleSettings">
          <el-icon><Setting /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip :content="isDarkMode ? '日间模式' : '夜间模式'" placement="left">
        <div class="toolbar-item" @click="toggleDarkMode">
          <el-icon v-if="isDarkMode"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- 设置面板 -->
    <transition name="fade">
      <div v-if="showSettings" class="settings-panel" @click.stop>
        <div class="setting-row">
          <span class="label">背景</span>
          <div class="theme-options">
            <div 
              v-for="theme in themes" 
              :key="theme.name"
              class="theme-circle"
              :class="{ active: settings.theme === theme.name }"
              :style="{ backgroundColor: theme.bgColor }"
              @click="setTheme(theme.name)"
              :title="theme.label"
            >
              <el-icon v-if="settings.theme === theme.name" :style="{ color: theme.textColor }"><Check /></el-icon>
            </div>
          </div>
        </div>
        
        <div class="setting-row">
          <span class="label">字号</span>
          <div class="control-group">
            <el-button size="small" @click="adjustFontSize(-2)">A-</el-button>
            <span class="value-display">{{ settings.fontSize }}</span>
            <el-button size="small" @click="adjustFontSize(2)">A+</el-button>
          </div>
        </div>

        <div class="setting-row">
          <span class="label">宽度</span>
          <div class="control-group">
            <el-button size="small" @click="adjustWidth(-100)">
              <el-icon><Remove /></el-icon>
            </el-button>
            <span class="value-display">{{ widthDisplay }}</span>
            <el-button size="small" @click="adjustWidth(100)">
              <el-icon><CirclePlus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 主要阅读区域 -->
    <div class="content-wrapper" :style="contentStyle" @click="handleContentClick">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="15" animated />
      </div>

      <div v-else-if="error" class="error-state">
        <el-empty description="章节加载失败">
          <el-button type="primary" @click="fetchChapter">重试</el-button>
        </el-empty>
      </div>

      <div v-else-if="chapter" class="chapter-content">
        <div class="chapter-header">
          <h1 class="chapter-title">第{{ chapter.sortOrder }}章 {{ chapter.title }}</h1>
          <div class="chapter-meta">
            <span>{{ chapter.wordCount || 0 }} 字</span>
            <span class="separator">·</span>
            <span>{{ formatDate(chapter.publishTime) }}</span>
          </div>
        </div>

        <div class="chapter-body" v-html="chapter.content"></div>

        <div class="chapter-footer">
           <div class="nav-buttons">
             <el-button 
               class="nav-btn-large"
               :disabled="!hasPrevChapter" 
               @click.stop="prevChapter"
             >
               上一章
             </el-button>
             <el-button 
               class="nav-btn-large"
               @click.stop="showCatalog = true"
             >
               目录
             </el-button>
             <el-button 
               class="nav-btn-large"
               :disabled="!hasNextChapter" 
               @click.stop="nextChapter"
             >
               下一章
             </el-button>
           </div>
        </div>
      </div>
    </div>

    <!-- 目录/书签抽屉 -->
    <el-drawer
      v-model="showCatalog"
      :title="null"
      :with-header="false"
      direction="ltr"
      size="320px"
      :append-to-body="true"
      class="catalog-drawer"
    >
      <el-tabs v-model="activeTab" stretch class="catalog-tabs">
        <el-tab-pane label="目录" name="catalog">
          <div class="catalog-list">
            <div 
              v-for="item in chaptersList" 
              :key="item.id"
              class="catalog-item"
              :class="{ active: item.id == chapterId }"
              @click="goToChapter(item.id)"
            >
              <span class="chapter-name">{{ item.sortOrder }}. {{ item.title }}</span>
              <el-tag size="small" v-if="item.status === 'vip'" type="warning">VIP</el-tag>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="书签" name="bookmark">
          <div class="bookmark-list" v-if="bookmarks.length > 0">
            <div 
              v-for="item in bookmarks" 
              :key="item.id"
              class="bookmark-item"
              @click="goToBookmark(item)"
            >
              <div class="bookmark-info">
                <div class="bookmark-chapter">{{ item.chapterTitle }}</div>
                <div class="bookmark-meta">
                  <span class="bookmark-time">{{ formatDate(item.createdAt) }}</span>
                  <span class="bookmark-progress">{{ getProgressText(item) }}</span>
                </div>
                <div class="bookmark-note" v-if="item.note">{{ item.note }}</div>
              </div>
              <el-button 
                link 
                type="danger" 
                class="delete-btn"
                @click.stop="handleDeleteBookmark(item)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无书签" />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { ChapterService } from '@/services/chapter-service';
import { BookService } from '@/services/book-service'; // 假设有这个服务来获取书名
import { ElMessage } from 'element-plus';
import { ReadingProgressService } from '@/services/reading-progress-service.js';
import { BookmarkService } from '@/services/bookmark-service.js';
import { 
  ArrowLeft, List, Setting, Sunny, Moon, Check, 
  Remove, CirclePlus, Collection, Delete
} from '@element-plus/icons-vue';
import { formatDate } from '@/utils/formatters';
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();

// --- 状态定义 ---
const loading = ref(false);
const error = ref(null);
const chapter = ref(null);
const chaptersList = ref([]);
const bookmarks = ref([]);
const bookTitle = ref('');
const showMenu = ref(false);
const showSettings = ref(false);
const showCatalog = ref(false);
const activeTab = ref('catalog'); // catalog or bookmark

const bookId = computed(() => route.params.bookId);
const chapterId = computed(() => route.params.chapterId);

// --- 阅读进度记录 ---
let startTime = Date.now();
const saveProgress = async (cId = chapterId.value) => {
  if (!bookId.value || !cId) return;
  
  const duration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
  // 重置开始时间，避免重复计算
  startTime = Date.now();
  
  try {
    await ReadingProgressService.recordReading({
      bookId: bookId.value,
      chapterId: cId,
      position: Math.floor(window.scrollY || 0), // 确保是整数
      readingTime: duration
    });
  } catch (e) {
    console.error('Failed to save reading progress', e);
    // 静默失败，不打扰用户
  }
};

// --- 阅读设置 ---
const themes = [
  { name: 'default', label: '默认', bgColor: '#f6f7f9', textColor: '#333', className: 'theme-default' },
  { name: 'parchment', label: '羊皮纸', bgColor: '#f5f1e8', textColor: '#5c5d58', className: 'theme-parchment' },
  { name: 'eye-care', label: '护眼', bgColor: '#e3edcd', textColor: '#333', className: 'theme-eye-care' },
  { name: 'dark', label: '夜间', bgColor: '#1a1a1a', textColor: '#999', className: 'theme-dark' },
];

const defaultSettings = {
  theme: 'default',
  fontSize: 18,
  width: 800,
  fontFamily: 'system-ui'
};

const settings = ref({ ...defaultSettings });

// 从 localStorage 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('yuechuangji-reading-settings');
  if (saved) {
    try {
      settings.value = { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }
};

const saveSettings = () => {
  localStorage.setItem('yuechuangji-reading-settings', JSON.stringify(settings.value));
};

// --- 计算属性 ---
const currentTheme = computed(() => themes.find(t => t.name === settings.value.theme) || themes[0]);
const isDarkMode = computed(() => settings.value.theme === 'dark');

const pageStyle = computed(() => ({
  backgroundColor: currentTheme.value.bgColor,
  color: currentTheme.value.textColor
}));

const contentStyle = computed(() => ({
  maxWidth: `${settings.value.width}px`,
  fontSize: `${settings.value.fontSize}px`,
  fontFamily: settings.value.fontFamily
}));

const widthDisplay = computed(() => {
  if (settings.value.width >= 1200) return '宽屏';
  if (settings.value.width <= 600) return '窄屏';
  return '标准';
});

// --- 导航逻辑 ---
const currentChapterIndex = computed(() => {
  if (!chaptersList.value.length || !chapterId.value) return -1;
  return chaptersList.value.findIndex(c => String(c.id) === String(chapterId.value));
});

const hasPrevChapter = computed(() => currentChapterIndex.value > 0);
const hasNextChapter = computed(() => currentChapterIndex.value !== -1 && currentChapterIndex.value < chaptersList.value.length - 1);

// --- 方法 ---

const fetchChapter = async () => {
  if (!chapterId.value) return;
  
  loading.value = true;
  error.value = null;
  // 关闭菜单和设置
  showMenu.value = false;
  showSettings.value = false;

  try {
    const data = await ChapterService.getChapterById(chapterId.value);
    if (data) {
      chapter.value = data;
      
      // 处理滚动位置
      setTimeout(() => {
        const queryPos = route.query.position;
        if (queryPos) {
           window.scrollTo({ top: Number(queryPos), behavior: 'smooth' });
        } else {
           window.scrollTo(0, 0);
        }
      }, 100);
    } else {
      throw new Error('章节内容为空');
    }
  } catch (err) {
    console.error('Failed to load chapter:', err);
    error.value = err;
    ElMessage.error(err.message || '加载章节失败');
  } finally {
    loading.value = false;
  }
};

const fetchChaptersList = async () => {
  if (!bookId.value) return;
  
  try {
    // 获取书名信息（可选，优化体验）
    BookService.getBookById(bookId.value).then(res => {
      bookTitle.value = res?.title || '';
    }).catch(() => {});

    const data = await ChapterService.getChaptersByBookId(bookId.value, 1, 1000); 
    const list = data.records || data || [];
    chaptersList.value = list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (err) {
    console.error('Failed to fetch chapter list:', err);
  }
};

const fetchBookmarks = async () => {
  if (!bookId.value) return;
  try {
    const data = await BookmarkService.getBookBookmarks(bookId.value);
    bookmarks.value = data || [];
  } catch (err) {
    console.error('Failed to fetch bookmarks:', err);
  }
};

const handleAddBookmark = async () => {
  if (!chapterId.value) return;
  
  try {
    // 获取当前滚动位置
    const position = Math.floor(window.scrollY || 0);
    // 获取当前章节内容摘要（可选，这里简单取前几个字作为note，或者让用户输入）
    // 为了更好的体验，可以弹窗让用户输入备注
    
    ElMessageBox.prompt('请输入书签备注（可选）', '添加书签', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{0,50}$/,
      inputErrorMessage: '备注不能超过50个字'
    }).then(async ({ value }) => {
      await BookmarkService.addBookmark({
        bookId: bookId.value,
        chapterId: chapterId.value,
        position: position,
        note: value || ''
      });
      ElMessage.success('书签添加成功');
      // 刷新书签列表
      fetchBookmarks();
    }).catch(() => {
      // 取消操作
    });
  } catch (err) {
    console.error('Failed to add bookmark:', err);
    ElMessage.error('添加书签失败');
  }
};

const handleDeleteBookmark = async (item) => {
  try {
    await BookmarkService.deleteBookmark(item.id);
    ElMessage.success('删除成功');
    // 从列表中移除
    bookmarks.value = bookmarks.value.filter(b => b.id !== item.id);
  } catch (err) {
    console.error('Failed to delete bookmark:', err);
    ElMessage.error('删除失败');
  }
};

const goToBookmark = (item) => {
  if (String(item.chapterId) === String(chapterId.value)) {
    // 同一章，直接滚动
    window.scrollTo({ top: item.position, behavior: 'smooth' });
    showCatalog.value = false;
  } else {
    // 跳转到新章节，并携带位置参数
    router.push({ 
      name: 'ChapterReading', 
      params: { bookId: bookId.value, chapterId: item.chapterId },
      query: { position: item.position }
    });
    showCatalog.value = false;
  }
};

const getProgressText = (item) => {
  // 可以根据位置计算百分比，但需要知道章节总高度，这里简单显示位置
  // 或者如果后端返回了章节进度百分比更好
  return `位置: ${item.position}`;
};

const prevChapter = () => {
  if (hasPrevChapter.value) {
    const prev = chaptersList.value[currentChapterIndex.value - 1];
    router.push({ name: 'ChapterReading', params: { bookId: bookId.value, chapterId: prev.id } });
  }
};

const nextChapter = () => {
  if (hasNextChapter.value) {
    const next = chaptersList.value[currentChapterIndex.value + 1];
    router.push({ name: 'ChapterReading', params: { bookId: bookId.value, chapterId: next.id } });
  }
};

const goToChapter = (id) => {
  router.push({ name: 'ChapterReading', params: { bookId: bookId.value, chapterId: id } });
  showCatalog.value = false;
};

const goBack = () => {
  router.push({ name: 'BookDetail', params: { id: bookId.value } });
};

// --- 交互与设置 ---
const handleContentClick = () => {
  showMenu.value = !showMenu.value;
  if (!showMenu.value) {
    showSettings.value = false;
  }
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const toggleDarkMode = () => {
  if (isDarkMode.value) {
    setTheme('default');
  } else {
    setTheme('dark');
  }
};

const setTheme = (themeName) => {
  settings.value.theme = themeName;
  saveSettings();
};

const adjustFontSize = (delta) => {
  const newSize = settings.value.fontSize + delta;
  if (newSize >= 12 && newSize <= 48) {
    settings.value.fontSize = newSize;
    saveSettings();
  }
};

const adjustWidth = (delta) => {
  const newWidth = settings.value.width + delta;
  if (newWidth >= 600 && newWidth <= 1400) {
    settings.value.width = newWidth;
    saveSettings();
  }
};

// --- 键盘监听 ---
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') {
    prevChapter();
  } else if (e.key === 'ArrowRight') {
    nextChapter();
  }
};

onMounted(() => {
  loadSettings();
  fetchChapter();
  fetchChaptersList();
  fetchBookmarks();
  window.addEventListener('keydown', handleKeydown);
  // 重置计时器
  startTime = Date.now();
  // 立即保存一次（记录历史）
  // 延迟一点点确保 bookId 和 chapterId 准备好（虽然 computed 应该是同步的，但稳妥起见）
  setTimeout(() => saveProgress(), 1000);
  // 启动自动保存
  startAutoSave();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  stopAutoSave();
});

// 自动保存定时器
let autoSaveTimer = null;
const startAutoSave = () => {
  stopAutoSave();
  // 每 30 秒自动保存一次进度
  autoSaveTimer = setInterval(() => {
    saveProgress();
  }, 30000);
};

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
};

// 路由离开前保存进度
onBeforeRouteLeave(async (to, from) => {
  await saveProgress();
});

watch(() => route.params.chapterId, async (newId, oldId) => {
  if (oldId) {
    await saveProgress(oldId);
  }
  if (newId) {
    fetchChapter();
    // 重置计时器
    startTime = Date.now();
  }
});
</script>

<style scoped>
.reading-page {
  min-height: 100vh;
  position: relative;
  transition: background-color 0.3s, color 0.3s;
}

/* 顶部导航 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.theme-dark .top-bar {
  background-color: rgba(30, 30, 30, 0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  color: #999;
}

.book-title-nav {
  font-weight: bold;
  margin-left: 10px;
  font-size: 14px;
}

.nav-btn {
  font-size: 14px;
  color: inherit;
}

.nav-btn:hover {
  color: var(--el-color-primary);
}

/* 侧边工具栏 */
.side-toolbar {
  position: fixed;
  right: 0;
  bottom: 100px;
  z-index: 90;
  display: flex;
  flex-direction: column;
}

.toolbar-item {
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 20px;
  color: #666;
  transition: all 0.2s;
}

.theme-dark .toolbar-item {
  background-color: #333;
  border-color: #444;
  color: #999;
}

.toolbar-item:first-child {
  border-top-left-radius: 8px;
}
.toolbar-item:last-child {
  border-bottom-left-radius: 8px;
  border-bottom: none;
}

.toolbar-item:hover, .toolbar-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.theme-dark .toolbar-item:hover, .theme-dark .toolbar-item.active {
  background-color: #444;
  color: var(--el-color-primary);
}

/* 设置面板 */
.settings-panel {
  position: fixed;
  right: 60px;
  bottom: 100px;
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 20px;
  z-index: 95;
}

.theme-dark .settings-panel {
  background-color: #333;
  color: #ccc;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}

.setting-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row .label {
  width: 50px;
  font-size: 14px;
  color: #666;
}

.theme-dark .setting-row .label {
  color: #999;
}

.theme-options {
  display: flex;
  gap: 10px;
  flex: 1;
}

.theme-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.theme-circle:hover {
  transform: scale(1.1);
}

.theme-circle.active {
  border: 2px solid var(--el-color-primary);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: space-between;
}

.value-display {
  font-size: 14px;
  min-width: 40px;
  text-align: center;
}

/* 阅读内容区 */
.content-wrapper {
  margin: 0 auto;
  padding: 60px 40px;
  min-height: 100vh;
  cursor: text; /* 指示这是文本区域 */
  transition: max-width 0.3s ease;
}

.chapter-title {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 1em;
  line-height: 1.4;
}

.chapter-meta {
  font-size: 0.8em;
  opacity: 0.6;
  margin-bottom: 3em;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 10px;
}

.separator {
  margin: 0 8px;
}

.chapter-body {
  line-height: 1.8;
  text-align: justify;
}

.chapter-body :deep(p) {
  margin-bottom: 1.2em;
  text-indent: 2em;
}

/* 底部导航 */
.chapter-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav-btn-large {
  width: 120px;
  height: 40px;
}

/* 目录/书签列表 */
.catalog-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.catalog-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.catalog-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.catalog-list, .bookmark-list {
  padding: 10px 0;
}

.catalog-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.catalog-item:hover {
  background-color: #f5f7fa;
  color: var(--el-color-primary);
}

.catalog-item.active {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.chapter-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.bookmark-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bookmark-item:hover {
  background-color: #f5f7fa;
}

.bookmark-info {
  flex: 1;
  overflow: hidden;
}

.bookmark-chapter {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
}

.bookmark-note {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  padding: 4px;
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.bookmark-item:hover .delete-btn {
  opacity: 1;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 40px 15px;
    font-size: 16px !important; /* 强制覆盖，避免移动端字体过小或过大 */
  }
  
  .side-toolbar {
    bottom: 20px;
    right: 20px;
    flex-direction: row;
  }
  
  .toolbar-item {
    border-bottom: none;
    border-right: 1px solid #eee;
  }
  
  .toolbar-item:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  
  .toolbar-item:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-right: none;
    border-bottom-left-radius: 0;
  }
  
  .settings-panel {
    right: 20px;
    bottom: 80px;
    width: calc(100vw - 40px);
  }
}
</style>
