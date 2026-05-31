<script setup>
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const TABLES = [
  { id:'T1',  s:'libero' },
  { id:'T2',  s:'occupato', t:'45m' },
  { id:'T3',  s:'occupato', t:'12m' },
  { id:'T4',  s:'prenotato', t:'20:30' },
  { id:'T5',  s:'prenotato', t:'21:00' },
  { id:'T6',  s:'occupato', t:'1h10' },
  { id:'T7',  s:'occupato', t:'48m' },
  { id:'T8',  s:'libero' },
  { id:'T9',  s:'occupato', t:'12m' },
  { id:'T10', s:'prenotato', t:'20:45' },
  { id:'T11', s:'dapulire' },
  { id:'T12', s:'libero' },
]

const COLORS = {
  libero:    { bg:'#F4F5F7',          fg: '#6B7280', label:'Libero' },
  occupato:  { bg:'#FFE0DD',          fg: '#E04347', label:'Occupato' },
  prenotato: { bg: '#DBEAFE',         fg: '#2563EB', label:'Prenotato' },
  dapulire:  { bg: '#EDE9FE',         fg: '#7C3AED', label:'Da pulire' },
}

const occupati = TABLES.filter(t => t.s === 'occupato').length
</script>

<template>
  <div :style="{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }">
    <div :style="{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'10px', flexShrink:0 }">
      <div :style="{ fontSize:'22px', fontWeight:700, color:PN.TEXT, letterSpacing:'-0.4px' }">{{ occupati }}/{{ TABLES.length }} occupati</div>
      <div :style="{ fontSize:'12px', color:PN.MUTED }">Sala principale</div>
    </div>

    <div :style="{
      flex:1, minHeight:0, overflowY:'auto',
      display:'grid',
      gridTemplateColumns:'repeat(auto-fill, minmax(54px, 1fr))',
      gridAutoRows:'min-content',
      gap:'6px', marginBottom:'10px',
    }">
      <div
        v-for="t in TABLES"
        :key="t.id"
        :style="{
          padding:'8px 6px',
          background: COLORS[t.s].bg,
          borderRadius:'7px',
          textAlign:'center', minHeight:'42px',
          display:'flex', flexDirection:'column', justifyContent:'center',
        }"
      >
        <div :style="{ fontSize:'12px', fontWeight:700, color:COLORS[t.s].fg, lineHeight:1.2 }">{{ t.id }}</div>
        <div v-if="t.t" :style="{ fontSize:'10px', color:COLORS[t.s].fg, fontWeight:500, opacity:0.85, lineHeight:1.2, marginTop:'1px' }">{{ t.t }}</div>
      </div>
    </div>

    <div :style="{ display:'flex', flexWrap:'wrap', gap:'8px', flexShrink:0, paddingTop:'8px', borderTop:`1px solid ${PN.BORDER_SOFT}` }">
      <div
        v-for="([k, c]) in Object.entries(COLORS)"
        :key="k"
        :style="{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:PN.MUTED, whiteSpace:'nowrap' }"
      >
        <span :style="{ width:'8px', height:'8px', borderRadius:'2px', background:c.fg }"/>
        {{ c.label }}
      </div>
    </div>
  </div>
</template>
