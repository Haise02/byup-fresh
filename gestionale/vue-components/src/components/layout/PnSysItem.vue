<script setup>
import { ref } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

const props = defineProps({
  id: String,
  label: String,
  icon: String,
  active: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const hovered = ref(false)

const activeStyle = {
  background: 'rgba(255, 224, 221, 0.60)',
  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0) 100%)',
  backdropFilter: 'blur(8px) saturate(160%)',
  WebkitBackdropFilter: 'blur(8px) saturate(160%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70), inset 0 0 0 1px rgba(242, 107, 122, 0.18)',
}
</script>

<template>
  <button
    @click="emit('click')"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :title="label"
    :style="{
      flex: collapsed ? 'unset' : 1,
      width: collapsed ? '100%' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: collapsed ? '0' : '6px',
      padding: collapsed ? '8px' : '8px 6px',
      borderRadius: '10px',
      border: 'none',
      color: active ? PN.PINK_DARK : hovered ? PN.TEXT : PN.MUTED,
      fontWeight: active ? 600 : 500,
      fontSize: '11.5px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      transition: 'background 160ms ease, color 160ms ease',
      ...(active ? activeStyle : {}),
      background: active ? undefined : hovered ? 'rgba(15, 17, 21, 0.045)' : 'transparent',
    }"
  >
    <ByupIcon :name="icon" :size="14"/>
    <span v-if="!collapsed">{{ label }}</span>
  </button>
</template>
