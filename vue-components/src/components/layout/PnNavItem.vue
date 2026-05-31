<script setup>
import { ref } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

const props = defineProps({
  id: String,
  label: String,
  icon: String,
  badge: { type: [String, Number], default: null },
  active: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const hovered = ref(false)

const activeStyle = {
  background: 'rgba(255, 224, 221, 0.65)',
  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
  backdropFilter: 'blur(10px) saturate(160%)',
  WebkitBackdropFilter: 'blur(10px) saturate(160%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75), inset 0 0 0 1px rgba(242, 107, 122, 0.20), 0 2px 6px -2px rgba(190, 24, 93, 0.10)',
}
</script>

<template>
  <button
    @click="emit('click')"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :class="active ? 'glass-shimmer' : ''"
    :title="collapsed ? label : undefined"
    :style="{
      display: 'flex',
      alignItems: 'center',
      gap: collapsed ? '0' : '12px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      padding: collapsed ? '9px' : '9px 10px',
      borderRadius: '10px',
      border: 'none',
      color: active ? PN.PINK_DARK : PN.TEXT,
      fontWeight: active ? 600 : 500,
      fontSize: '13.5px',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      width: '100%',
      position: 'relative',
      transition: 'background 160ms ease, transform 160ms ease',
      ...(active ? activeStyle : {}),
      background: active
        ? undefined
        : hovered ? 'rgba(15, 17, 21, 0.045)' : 'transparent',
      transform: active && hovered ? 'translateX(1px)' : 'translateX(0)',
    }"
  >
    <span :style="{ display:'inline-flex', color: active ? PN.PINK : PN.MUTED, position:'relative', zIndex:3 }">
      <ByupIcon :name="icon" :size="18" :color="active ? PN.PINK : PN.MUTED"/>
    </span>
    <span v-if="!collapsed" :style="{ flex:1, position:'relative', zIndex:3 }">{{ label }}</span>
    <span
      v-if="!collapsed && badge != null"
      :class="active ? 'glass-pulse-glow' : ''"
      :style="{
        fontSize:'10.5px', fontWeight:700,
        color: PN.WHITE, background: PN.PINK,
        padding:'2px 7px', borderRadius:'999px',
        minWidth:18, textAlign:'center',
        position:'relative', zIndex:3,
      }"
    >{{ badge }}</span>
    <span
      v-if="collapsed && badge != null"
      :style="{
        position:'absolute', top:'7px', right:'7px',
        width:'7px', height:'7px', borderRadius:'50%',
        background: PN.PINK, boxShadow:'0 0 0 1.5px white',
      }"
    />
  </button>
</template>
