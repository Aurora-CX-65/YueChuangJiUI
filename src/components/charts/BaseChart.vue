<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * 基础 ECharts 图表组件
 * 封装了图表的初始化、更新、销毁等生命周期
 */
const props = defineProps({
  /** 图表配置项 */
  option: {
    type: Object,
    default: () => ({})
  },
  /** 图表宽度 */
  width: {
    type: String,
    default: '100%'
  },
  /** 图表高度 */
  height: {
    type: String,
    default: '400px'
  },
  /** 主题 */
  theme: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chartInstance = null

/** 初始化图表 */
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, props.theme)
  if (props.option && Object.keys(props.option).length > 0) {
    chartInstance.setOption(props.option)
  }
}

/** 更新图表配置 */
const updateChart = () => {
  if (!chartInstance) return
  if (props.option && Object.keys(props.option).length > 0) {
    chartInstance.setOption(props.option, true)
  }
}

/** 窗口大小变化时重新调整图表 */
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/** 监听 option 变化 */
watch(() => props.option, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

/** 获取图表实例 */
const getChartInstance = () => chartInstance

defineExpose({
  getChartInstance
})
</script>
