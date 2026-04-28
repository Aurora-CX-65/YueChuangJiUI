const SETTINGS_KEY = 'author_creative_settings'

const DEFAULT_SETTINGS = {
  fontSize: 16,
  lineHeight: 1.8,
  theme: 'light',
  autoSave: true,
  indent: true,
  smartPunctuation: true
}

export const EditorSettings = {
  get() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.error('读取编辑器设置失败', e)
    }
    return { ...DEFAULT_SETTINGS }
  },

  set(settings) {
    try {
      const merged = { ...DEFAULT_SETTINGS, ...settings }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
      return merged
    } catch (e) {
      console.error('保存编辑器设置失败', e)
      return null
    }
  },

  reset() {
    localStorage.removeItem(SETTINGS_KEY)
    return { ...DEFAULT_SETTINGS }
  }
}
