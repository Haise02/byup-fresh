<script setup>
import { ref, computed } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

const props = defineProps({
  title: String,
  editMode: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
  otherDragging: { type: Boolean, default: false },
  wiggleDelay: { type: Number, default: 0 },
  size: { type: Object, default: () => ({ w: 1, h: 1 }) },
  fixedSize: { type: Boolean, default: false },
  theme: { type: String, default: '' },
})

const emit = defineEmits(['remove', 'drag-start', 'resize'])

const hover = ref(false)

const w = computed(() => props.size?.w || 1)
const h = computed(() => props.size?.h || 1)
const isWide = computed(() => w.value > 1)
const isTall = computed(() => h.value > 1)
const inEditWiggle = computed(() => props.editMode && !props.dragging)

function cycleWide() {
  emit('resize', { w: w.value === 4 ? 1 : w.value === 2 ? 4 : 2, h: h.value })
}
function cycleTall() {
  emit('resize', { w: w.value, h: h.value === 4 ? 1 : h.value === 2 ? 4 : 2 })
}

const auroraSurface = computed(() => {
  if (props.theme !== 'aurora') return null
  return {
    background:
      'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
      'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
      'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
      'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)',
    border: `1px solid ${props.editMode && hover.value ? PN.PINK : 'rgba(190, 175, 220, 0.14)'}`,
    boxShadow: props.editMode && hover.value ? PN.CARD_SHADOW_HOVER : PN.CARD_SHADOW,
  }
})

const dragStyle = computed(() => {
  if (props.dragging) {
    return {
      ...PN.GLASS_DRAG,
      borderRadius: '14px',
      transform: 'scale(1.04) rotate(-0.5deg)',
    }
  }
  return {
    ...(auroraSurface.value || {
      background: PN.WHITE,
      border: `1px solid ${props.editMode && hover.value ? PN.PINK : PN.BORDER_HAIR}`,
      boxShadow: props.editMode && hover.value ? PN.CARD_SHADOW_HOVER : PN.CARD_SHADOW,
    }),
    animation: inEditWiggle.value
      ? `wiggle-edit 0.42s ease-in-out infinite ${props.wiggleDelay}ms`
      : 'none',
    transformOrigin: 'center center',
    opacity: props.otherDragging ? 0.92 : 1,
  }
})

const cornerDots = computed(() => {
  const m = PN.MUTED
  return (
    `radial-gradient(circle at 100% 100%, ${m} 1.4px, transparent 2px) 0 0/4px 4px,` +
    `radial-gradient(circle at 100% 100%, ${m} 1.4px, transparent 2px) 4px 0/4px 4px,` +
    `radial-gradient(circle at 100% 100%, ${m} 1.4px, transparent 2px) 0 4px/4px 4px`
  )
})
</script>

<template>
  <div
    :class="(!editMode && !dragging) ? 'glass-lift-hover' : ''"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :style="{
      position:'relative',
      borderRadius:'14px',
      padding:'18px 18px 16px',
      height:'100%',
      overflow:'hidden',
      display:'flex', flexDirection:'column',
      transition: dragging
        ? 'transform 60ms ease-out'
        : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out',
      ...dragStyle,
    }"
  >
    <!-- Edit controls -->
    <div
      v-if="editMode"
      :style="{
        position:'absolute', top:'8px', right:'8px',
        display:'flex', gap:'4px', zIndex:2,
        opacity: hover ? 1 : 0.6,
        transition:'opacity 0.15s',
      }"
    >
      <button
        @mousedown="$emit('drag-start', $event)"
        title="Sposta"
        :style="{
          width:'26px', height:'26px', borderRadius:'6px',
          background:PN.WHITE, border:`1px solid ${PN.BORDER_LIGHT}`,
          cursor:'grab', display:'grid', placeItems:'center', color:PN.MUTED,
        }"
      >
        <ByupIcon name="grip" :size="14"/>
      </button>

      <template v-if="!fixedSize">
        <button
          @click="cycleWide"
          :title="isWide ? 'Riduci larghezza' : 'Espandi orizzontale'"
          :style="{
            width:'26px', height:'26px', borderRadius:'6px',
            background: isWide ? PN.PINK : PN.WHITE,
            border: `1px solid ${isWide ? PN.PINK : PN.BORDER_LIGHT}`,
            cursor:'pointer', display:'grid', placeItems:'center',
            color: isWide ? PN.WHITE : PN.MUTED,
            fontSize:'14px', fontWeight:700, lineHeight:1,
            transition:'background 150ms ease, color 150ms ease',
          }"
        >↔</button>
        <button
          @click="cycleTall"
          :title="isTall ? 'Riduci altezza' : 'Espandi verticale'"
          :style="{
            width:'26px', height:'26px', borderRadius:'6px',
            background: isTall ? PN.PINK : PN.WHITE,
            border: `1px solid ${isTall ? PN.PINK : PN.BORDER_LIGHT}`,
            cursor:'pointer', display:'grid', placeItems:'center',
            color: isTall ? PN.WHITE : PN.MUTED,
            fontSize:'14px', fontWeight:700, lineHeight:1,
            transition:'background 150ms ease, color 150ms ease',
          }"
        >↕</button>
      </template>

      <button
        @click="$emit('remove')"
        title="Rimuovi"
        :style="{
          width:'26px', height:'26px', borderRadius:'6px',
          background:PN.WHITE, border:`1px solid ${PN.BORDER_LIGHT}`,
          cursor:'pointer', display:'grid', placeItems:'center', color:PN.RED,
        }"
      >
        <ByupIcon name="xmark" :size="13"/>
      </button>
    </div>

    <!-- Resize dots -->
    <div
      v-if="editMode && !fixedSize"
      aria-hidden="true"
      :style="{
        position:'absolute', right:'6px', bottom:'6px',
        width:'14px', height:'14px',
        opacity: hover ? 0.7 : 0.30,
        transition:'opacity 0.2s',
        pointerEvents:'none', zIndex:2,
        background: cornerDots,
        backgroundRepeat:'no-repeat',
      }"
    />

    <!-- Content -->
    <div :style="{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }">
      <slot />
    </div>
  </div>
</template>
