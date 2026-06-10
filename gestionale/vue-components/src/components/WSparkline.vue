<script setup>
import { computed } from 'vue'
import { PN } from '@/tokens/pn.js'

const props = defineProps({
  data: { type: Array, required: true },
  color: { type: String, default: () => PN.PINK },
  animated: { type: Boolean, default: false },
})

const VB_W = 200
const VB_H = 60
const PAD = 4

const gradId = computed(() => `spark-grad-${props.color.replace('#', '')}`)
const clipId = computed(() => `spark-clip-${gradId.value}`)

const pts = computed(() => {
  const usableW = VB_W - PAD * 2
  const usableH = VB_H - PAD * 2
  const max = Math.max(...props.data)
  const min = Math.min(...props.data)
  const range = max - min || 1
  return props.data.map((v, i) => {
    const x = PAD + (i / (props.data.length - 1)) * usableW
    const y = PAD + usableH - ((v - min) / range) * usableH
    return [x, y]
  })
})

const path = computed(() => {
  const p = pts.value
  let d = `M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, y1] = p[i]
    const [x2, y2] = p[i + 1]
    const cx = (x1 + x2) / 2
    d += ` C ${cx.toFixed(2)} ${y1.toFixed(2)}, ${cx.toFixed(2)} ${y2.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  return d
})

const fillPath = computed(() => {
  const p = pts.value
  const last = p[p.length - 1]
  return path.value + ` L ${(VB_W - PAD).toFixed(2)} ${(VB_H - PAD).toFixed(2)} L ${PAD} ${(VB_H - PAD).toFixed(2)} Z`
})

const lastPt = computed(() => pts.value[pts.value.length - 1])
</script>

<template>
  <div style="width: 100%; height: 100%; overflow: hidden; display: block;">
    <svg
      :viewBox="`0 0 ${VB_W} ${VB_H}`"
      preserveAspectRatio="none"
      style="width: 100%; height: 100%; display: block; overflow: hidden;"
    >
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   :stop-color="color" stop-opacity="0.28"/>
          <stop offset="100%" :stop-color="color" stop-opacity="0"/>
        </linearGradient>
        <clipPath :id="clipId">
          <rect x="0" y="0" :width="VB_W" :height="VB_H"/>
        </clipPath>
      </defs>
      <g :clip-path="`url(#${clipId})`">
        <path :d="fillPath" :fill="`url(#${gradId})`"/>
        <path
          :d="path"
          fill="none"
          :stroke="color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          path-length="1"
          :style="animated ? {
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: 'spark-draw 1.4s ease-out forwards',
          } : undefined"
          vector-effect="non-scaling-stroke"
        />
        <circle
          v-if="animated"
          :cx="lastPt[0].toFixed(2)"
          :cy="lastPt[1].toFixed(2)"
          r="2.4"
          :fill="color"
          :style="{
            opacity: 0,
            transformOrigin: `${lastPt[0]}px ${lastPt[1]}px`,
            animation: 'spark-pulse 1.6s ease-in-out 1.4s infinite, spark-dot-in 240ms ease-out 1.30s forwards',
          }"
        />
      </g>
    </svg>
  </div>
</template>
