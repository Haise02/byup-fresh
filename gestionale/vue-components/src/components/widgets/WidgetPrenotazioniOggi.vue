<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const ITEMS = [
  { time:'19:30', name:'Famiglia Rossi',  covers:4, table:'T7',  tag:'compleanno', note:'compleanno · torta' },
  { time:'20:00', name:'Bianchi M.',      covers:2, table:'T3' },
  { time:'20:15', name:'Conte (regular)', covers:6, table:'T12', vip:true },
  { time:'20:30', name:'Walk-in attesa',  covers:2, table:'—',   tag:'walkin' },
  { time:'21:00', name:'Greco',           covers:3, table:'T5' },
  { time:'21:30', name:'De Luca',         covers:2, table:'T9',  tag:'allergia', note:'allergia noci' },
  { time:'21:45', name:'Marini',          covers:4, table:'T2' },
  { time:'22:00', name:'Rinaldi',         covers:2, table:'T11', vip:true },
  { time:'22:15', name:'Esposito',        covers:5, table:'T4',  tag:'finestra', note:'tavolo finestra' },
]

const TAG_STYLE = {
  compleanno: { bg:'#EDE9FE', fg:'#7C3AED', label:'Compleanno' },
  allergia:   { bg:'#FEE2E2', fg:'#DC2626', label:'Allergia' },
  walkin:     { bg:'#FEF3C7', fg:'#92400E', label:'Walk-in' },
  finestra:   { bg:'#DBEAFE', fg:'#1E40AF', label:'Finestra' },
}

const interacting = ref(false)
const scrollEl = ref(null)
let raf = null

onMounted(() => {
  let last = performance.now()
  let posFloat = 0
  const SPEED = 28

  function tick(now) {
    if (!interacting.value && scrollEl.value) {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const el = scrollEl.value
      const halfH = el.scrollHeight / 2
      if (halfH > 0) {
        posFloat += SPEED * dt
        if (posFloat >= halfH) posFloat -= halfH
        el.scrollTop = Math.round(posFloat)
      }
    } else {
      last = now
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <div :style="{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }">
    <div :style="{ display:'flex', alignItems:'baseline', gap:'12px', marginBottom:'12px', flexShrink:0 }">
      <div :style="{ fontSize:'22px', fontWeight:600, color:PN.TEXT, letterSpacing:'-0.02em' }">23 prenotazioni</div>
      <div :style="{ fontSize:'12px', color:PN.MUTED }">· 67 coperti · 84% riempimento</div>
    </div>

    <div
      ref="scrollEl"
      @mouseenter="interacting = true"
      @mouseleave="interacting = false"
      :style="{
        flex:1, minHeight:0,
        overflowY:'auto', overflowX:'hidden',
        position:'relative',
        margin:'0 -4px', padding:'0 4px',
      }"
    >
      <div :style="{ display:'flex', flexDirection:'column', gap:'6px' }">
        <div
          v-for="(it, i) in [...ITEMS, ...ITEMS]"
          :key="i"
          :style="{
            display:'grid', gridTemplateColumns:'48px 1fr auto', gap:'12px', alignItems:'center',
            padding:'10px 12px', borderRadius:'10px',
            background:PN.WHITE, border:`1px solid ${PN.BORDER_HAIR}`,
            boxShadow:'0 1px 0 rgba(15, 17, 21, 0.02)', flexShrink:0,
          }"
        >
          <div :style="{ fontSize:'13px', fontWeight:600, color:PN.TEXT, fontVariantNumeric:'tabular-nums' }">{{ it.time }}</div>
          <div :style="{ minWidth:0 }">
            <div :style="{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:500, color:PN.TEXT, flexWrap:'wrap' }">
              {{ it.name }}
              <span v-if="it.vip" :style="{ fontSize:'9.5px', fontWeight:600, padding:'2px 6px', borderRadius:'999px', background:PN.WINE_SOFT, color:PN.WINE, letterSpacing:'0.4px' }">VIP</span>
              <span
                v-if="it.tag"
                :style="{
                  fontSize:'9.5px', fontWeight:600, padding:'2px 7px', borderRadius:'999px',
                  background: TAG_STYLE[it.tag].bg, color: TAG_STYLE[it.tag].fg, letterSpacing:'0.2px',
                }"
              >{{ TAG_STYLE[it.tag].label }}</span>
            </div>
            <div v-if="it.note" :style="{ fontSize:'11.5px', color:PN.MUTED, marginTop:'2px' }">{{ it.note }}</div>
          </div>
          <div :style="{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:PN.MUTED, fontWeight:600 }">
            <ByupIcon name="people-customer" :size="12" :color="PN.MUTED"/> {{ it.covers }} · {{ it.table }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
