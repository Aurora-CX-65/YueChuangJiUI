<template>
  <BaseChart :option="chartOption" :width="width" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

/**
 * 饼图组件
 * 用于展示占比数据
 */
const props = defineProps({
  /** 图表标题 */
  title: {
    type: String,
    default: ''
  },
  /** 系列数据 [{name: '分类名', value: 数值}] */
  seriesData: {
    type: Array,
    default: () => []
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
  }
})

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '60%',
      data: props.seriesData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))
</script>
