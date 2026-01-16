<template>
  <div class="self-hosted-tiny-editor">
    <textarea :id="editorId"></textarea>
  </div>
</template>

<script>
let uid = 0

export default {
  name: 'SelfHostedTinyEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    init: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editorId: `self-hosted-tiny-${++uid}`,
      tinymceReady: false,
      editorInstance: null
    }
  },
  mounted() {
    this.ensureTinymce()
  },
  beforeUnmount() {
    if (this.editorInstance) {
      this.editorInstance.destroy()
      this.editorInstance = null
    }
  },
  watch: {
    modelValue(val) {
      if (this.tinymceReady && this.editorInstance) {
        const current = this.editorInstance.getContent()
        if (val !== current) {
          this.editorInstance.setContent(val || '')
        }
      }
    }
  },
  methods: {
    async ensureTinymce() {
      if (window.tinymce) {
        this.initEditor()
        return
      }
      const scriptSrc = this.init.tinymceScriptSrc || '/tinymce/tinymce.min.js'
      await this.loadScript(scriptSrc)
      this.initEditor()
    },
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
          if (window.tinymce) {
            resolve()
          } else {
            existing.addEventListener('load', resolve)
            existing.addEventListener('error', reject)
          }
          return
        }
        const s = document.createElement('script')
        s.src = src
        s.referrerPolicy = 'no-referrer'
        s.onload = () => resolve()
        s.onerror = (e) => reject(e)
        document.head.appendChild(s)
      })
    },
    initEditor() {
      const baseConfig = {
        selector: `#${this.editorId}`,
        height: 600,
        menubar: false,
        plugins: [
          'lists', 'link', 'image', 'table', 'code', 'help', 'wordcount', 'fullscreen'
        ],
        toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
                 'alignleft aligncenter alignright alignjustify | ' +
                 'bullist numlist outdent indent | removeformat | help | fullscreen',
        branding: false,
        // 自托管皮肤与内容样式路径
        skin_url: this.init.skin_url || '/tinymce/skins/ui/oxide',
        content_css: this.init.content_css || '/tinymce/skins/content/default/content.css',
        language: this.init.language || 'zh_CN',
        language_url: this.init.language_url || '/tinymce/langs/zh_CN.js',
        setup: (editor) => {
          this.editorInstance = editor
          editor.on('init', () => {
            this.tinymceReady = true
            editor.setContent(this.modelValue || '')
          })
          editor.on('change keyup undo redo', () => {
            const html = editor.getContent()
            this.$emit('update:modelValue', html)
          })
        }
      }
      const config = { ...baseConfig, ...this.init }
      window.tinymce.init(config)
    }
  }
}
</script>

<style scoped>
.self-hosted-tiny-editor {
  width: 100%;
}
</style>

