<script setup>
import { computed } from 'vue'
import GlassDarkBox from '@/components/glass/GlassDarkBox.vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'

const props = defineProps({ size: { type: Object, default: () => ({ w: 1, h: 1 }) } })

const ACTIONS = [
  { label:'Nuova prenotazione',  icon:'time-calendar',      color:'#FB7185' },
  { label:'Aggiungi piatto',     icon:'food-meal',          color:'#F472B6' },
  { label:'Apri cassa',          icon:'commerce-wallet',    color:'#34D399' },
  { label:'Stampa QR tavolo',    icon:'place-table',        color:'#60A5FA' },
  { label:'Invita staff',        icon:'people-staff-group', color:'#A78BFA' },
  { label:'Fine turno',          icon:'time-history',       color:'#FBBF24' },
  { label:'Esporta giornaliero', icon:'download',           color:'#22D3EE' },
  { label:'Promo flash',         icon:'sparkles',           color:'#FF6066' },
]

const w = computed(() => props.size?.w || 1)
const h = computed(() => props.size?.h || 1)
const isFullBanner = computed(() => w.value === 4 && h.value === 2)
const showLabels = computed(() => isFullBanner.value)

function btnMouseenter(e, color) {
  e.currentTarget.style.background = `${color}1A`
  e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${color}40, 0 8px 20px -6px ${color}55`
}
function btnMouseleave(e) {
  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)'
}
</script>

<template>
  <GlassDarkBox
    theme="night"
    :night-accent="true"
    :style="{
      margin:'-18px -18px -16px -18px',
      height:'calc(100% + 34px)',
      display:'flex', flexDirection:'column', minHeight:0,
    }"
  >
    <div :style="{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'12px', flexShrink:0 }">
      <div :style="{ fontSize:'15px', fontWeight:700, color:'#F5F5F7', letterSpacing:'-0.01em' }">Azioni rapide</div>
      <div :style="{ fontSize:'11.5px', color:'rgba(255,255,255,0.50)' }">{{ ACTIONS.length }} shortcut</div>
    </div>

    <div :style="{
      flex:1, minHeight:0, overflowY:'auto',
      display:'grid',
      gridTemplateColumns: isFullBanner ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(54px, 1fr))',
      gridTemplateRows: isFullBanner ? 'repeat(2, 1fr)' : 'none',
      gridAutoRows: isFullBanner ? undefined : 'minmax(54px, 1fr)',
      gap: isFullBanner ? '10px' : '6px',
      alignContent:'start',
    }">
      <button
        v-for="(a, i) in ACTIONS"
        :key="i"
        class="glass-lift-hover"
        :title="a.label"
        :style="{
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap: showLabels ? '6px' : '0',
          background:'rgba(255,255,255,0.04)',
          border:'none', borderRadius: showLabels ? '14px' : '10px',
          padding: showLabels ? '8px 6px' : '6px',
          cursor:'pointer', fontFamily:'inherit', color:'#F5F5F7',
          boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.06)',
          transition:'background 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease',
          minHeight:0,
        }"
        @mouseenter="btnMouseenter($event, a.color)"
        @mouseleave="btnMouseleave($event)"
      >
        <span :style="{
          width: showLabels ? '42px' : '36px',
          height: showLabels ? '42px' : '36px',
          borderRadius: showLabels ? '12px' : '10px',
          background:`linear-gradient(135deg, ${a.color}DD 0%, ${a.color}88 100%)`,
          color:'#fff', display:'grid', placeItems:'center', flexShrink:0,
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.30), 0 4px 12px -2px ${a.color}77`,
        }">
          <ByupIcon :name="a.icon" :size="showLabels ? 20 : 18" color="#fff"/>
        </span>
        <span
          v-if="showLabels"
          :style="{
            fontSize:'10.5px', fontWeight:600, textAlign:'center', lineHeight:1.2,
            color:'rgba(255,255,255,0.92)', maxWidth:'100%', overflow:'hidden',
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
          }"
        >{{ a.label }}</span>
      </button>
    </div>
  </GlassDarkBox>
</template>
