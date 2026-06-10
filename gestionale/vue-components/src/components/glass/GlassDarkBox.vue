<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: { type: String, default: 'light' }, // 'light' | 'night' | 'sunset'
  tone: { type: String, default: '' },       // 'deeper' | 'lighter'
  nightAccent: { type: Boolean, default: false },
  padding: { type: [String, Number], default: 18 },
  borderRadius: { type: Number, default: 14 },
  animated: { type: Boolean, default: true },
  liftHover: { type: Boolean, default: false },
  tilt: { type: Boolean, default: false },
  as: { type: String, default: 'div' },
})

const isNight  = computed(() => props.theme === 'night')
const isSunset = computed(() => props.theme === 'sunset')
const isDark   = computed(() => isNight.value || isSunset.value)

const bgClass = computed(() => {
  if (isSunset.value) return 'glass-sunset-bg'
  if (isNight.value)  return 'glass-night-bg'
  return 'glass-photo-bg'
})

const classes = computed(() => [
  bgClass.value,
  !isDark.value && props.tone === 'deeper'  ? 'glass-photo-deeper'  : '',
  !isDark.value && props.tone === 'lighter' ? 'glass-photo-lighter' : '',
  isNight.value && props.nightAccent ? 'glass-night-coral' : '',
  props.animated   ? 'glass-gradient-shift' : '',
  props.liftHover  ? 'glass-lift-hover'     : '',
  props.tilt       ? 'glass-tilt-hover'     : '',
].filter(Boolean))

const defaultColor = computed(() => isDark.value ? '#F5F5F7' : '#3A0A0E')

const overlayBg = computed(() => {
  if (isSunset.value) return 'linear-gradient(180deg, rgba(58, 28, 22, 0.55) 0%, rgba(30, 12, 10, 0.62) 100%)'
  if (isNight.value)  return 'linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0.18) 100%)'
  return 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.06) 60%, rgba(255, 200, 176, 0.08) 100%)'
})

const overlayShadow = computed(() => {
  if (isSunset.value) return 'inset 0 1px 0 rgba(255, 200, 170, 0.22), inset 0 0 0 1px rgba(255, 150, 110, 0.16), 0 14px 36px -10px rgba(120, 50, 15, 0.55), 0 4px 10px -4px rgba(120, 50, 15, 0.30)'
  if (isNight.value)  return 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px -10px rgba(0, 0, 0, 0.55), 0 4px 10px -4px rgba(0, 0, 0, 0.30)'
  return 'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(255, 130, 130, 0.18), 0 12px 32px -10px rgba(190, 50, 60, 0.20), 0 4px 10px -4px rgba(190, 50, 60, 0.12)'
})

const overlayBlur = computed(() => isSunset.value ? 'blur(22px) saturate(170%)' : 'blur(6px) saturate(160%)')

const paddingStyle = computed(() =>
  typeof props.padding === 'number' ? `${props.padding}px` : props.padding
)
</script>

<template>
  <component
    :is="as"
    :class="classes"
    :style="{
      position: 'relative',
      isolation: 'isolate',
      color: defaultColor,
      padding: paddingStyle,
      borderRadius: `${borderRadius}px`,
    }"
  >
    <div
      aria-hidden="true"
      :style="{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        borderRadius: `${borderRadius}px`,
        background: overlayBg,
        backdropFilter: overlayBlur,
        WebkitBackdropFilter: overlayBlur,
        boxShadow: overlayShadow,
      }"
    />
    <slot />
  </component>
</template>
