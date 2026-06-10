<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { PN } from '@/tokens/pn.js'

function getStatus() {
  if (!navigator.onLine) return 'offline'
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' ||
      (conn.downlink !== undefined && conn.downlink < 0.5))) return 'instabile'
  return 'online'
}

const realStatus = ref(getStatus())
const demoOverride = ref(null)
const showRestored = ref(false)
const restoredTimer = ref(null)

const DEMO_CYCLE = ['online', 'instabile', 'offline']

const status = ref(getStatus())

function update() {
  const prev = realStatus.value
  realStatus.value = getStatus()
  if (prev === 'offline' && realStatus.value === 'online') {
    showRestored.value = true
    restoredTimer.value = setTimeout(() => { showRestored.value = false }, 2500)
  }
  status.value = demoOverride.value ?? realStatus.value
}

function handleDemoClick() {
  const current = demoOverride.value ?? realStatus.value
  const idx = DEMO_CYCLE.indexOf(current)
  const next = DEMO_CYCLE[(idx + 1) % DEMO_CYCLE.length]
  if (current === 'offline' && next === 'online') {
    showRestored.value = true
    if (restoredTimer.value) clearTimeout(restoredTimer.value)
    restoredTimer.value = setTimeout(() => { showRestored.value = false }, 2500)
  }
  demoOverride.value = next
  status.value = next
}

onMounted(() => {
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn) conn.addEventListener('change', update)
})

onUnmounted(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
  if (restoredTimer.value) clearTimeout(restoredTimer.value)
})
</script>

<template>
  <div
    @click="handleDemoClick"
    title="Clicca per simulare stati connessione"
    :style="{
      display:'flex', alignItems:'center', gap:'5px',
      padding: status === 'instabile' ? '5px 9px' : '5px 7px',
      borderRadius:'8px',
      background: status === 'instabile' ? '#FEF3C7' : status === 'offline' ? '#FEE2E2' : 'transparent',
      border: `1px solid ${status === 'instabile' ? '#FDE68A' : status === 'offline' ? '#FECACA' : 'transparent'}`,
      cursor:'pointer',
      transition:'background .2s, border-color .2s',
    }"
  >
    <!-- WiFi icon -->
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;display:block;">
      <path d="M1.42 9a16 16 0 0 1 21.16 0"
        :stroke="status === 'instabile' ? '#D97706' : status === 'offline' ? '#DC2626' : '#C4C9D4'"
        stroke-width="2" stroke-linecap="round"
        :opacity="status === 'instabile' ? 0.2 : 1"/>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"
        :stroke="status === 'instabile' ? '#D97706' : status === 'offline' ? '#DC2626' : '#C4C9D4'"
        stroke-width="2" stroke-linecap="round"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"
        :stroke="status === 'instabile' ? '#D97706' : status === 'offline' ? '#DC2626' : '#C4C9D4'"
        stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="20" r="1.5"
        :fill="status === 'instabile' ? '#D97706' : status === 'offline' ? '#DC2626' : '#C4C9D4'"/>
    </svg>
    <span v-if="status === 'instabile'" :style="{ fontSize:'12px', fontWeight:700, color:'#D97706', letterSpacing:'0.1px' }">
      Instabile
    </span>
  </div>

  <!-- Offline/restored banner -->
  <Teleport to="body">
    <div
      v-if="status === 'offline' || showRestored"
      :style="{
        position:'fixed', top:0, left:0, right:0, zIndex:9999,
        background: showRestored ? '#15803D' : '#B91C1C',
        color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        padding:'11px 24px',
        fontSize:'13.5px', fontWeight:600, letterSpacing:'0.1px',
        boxShadow: showRestored ? '0 2px 12px rgba(21,128,61,0.2)' : '0 2px 16px rgba(185,28,28,0.25)',
        animation:'pn-banner-in .22s ease-out',
      }"
    >
      {{ showRestored ? '✓  Connessione ripristinata' : '⚠  Connessione assente — verifica la rete' }}
    </div>
  </Teleport>
</template>
