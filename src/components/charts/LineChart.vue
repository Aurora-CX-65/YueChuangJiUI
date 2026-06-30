<template>
  <BaseChart :option="chartOption" :width="width" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

/**
 * 折线图组件
 * 用于展示趋势数据
 */
const props = defineProps({
  /** 图表标题 */
  title: {
    type: String,
    default: ''
  },
  /** X轴数据 */
  xAxisData: {
    type: Array,
    default: () => []
  },
  /** 系列数据 */
  seriesData: {
    type: Array,
    default: () => []
  },
  /** 系列名称 */
  seriesName: {
    type: String,
    default: '数据'
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
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: props.xAxisData
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: props.seriesName,
      type: 'line',
      data: props.seriesData,
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}))
</script>
