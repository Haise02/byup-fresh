<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  tone: { type: String, default: '' }, // 'cool' | 'neutral' | ''
  fixed: { type: Boolean, default: false },
})

const el = ref(null)

onMounted(() => {
  if (!el.value || !el.value.parentElement) return
  const parent = el.value.parentElement
  if (getComputedStyle(parent).isolation !== 'isolate') {
    parent.style.isolation = 'isolate'
  }
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative'
  }
})
</script>

<template>
  <div
    ref="el"
    aria-hidden="true"
    :class="[
      'glass-mesh-substrate',
      tone === 'cool' ? 'glass-mesh-cool' : '',
      tone === 'neutral' ? 'glass-mesh-neutral' : '',
      fixed ? 'glass-mesh-fixed' : '',
    ]"
  />
</template>
