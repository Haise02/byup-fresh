<script setup>
import GlassDarkBox from '@/components/glass/GlassDarkBox.vue'

defineProps({ size: Object })

const ORDERS = [
  { table:'7',  items:3, time:"8' 20\"",  status:'amber', label:'In prep' },
  { table:'12', items:2, time:"2' 10\"",  status:'green', label:'Pronto' },
  { table:'3',  items:5, time:"12' 40\"", status:'red',   label:'Ritardo' },
  { table:'9',  items:4, time:"6' 45\"",  status:'amber', label:'In prep' },
  { table:'14', items:1, time:"1' 30\"",  status:'green', label:'Pronto' },
  { table:'5',  items:3, time:"4' 10\"",  status:'green', label:'Pronto' },
  { table:'11', items:6, time:"10' 15\"", status:'red',   label:'Ritardo' },
]

const STATUS = {
  amber: { bg:'rgba(251, 146, 60, 0.18)', fg:'#FDBA74' },
  green: { bg:'rgba(52, 211, 153, 0.18)',  fg:'#86EFAC' },
  red:   { bg:'rgba(248, 113, 113, 0.18)', fg:'#FCA5A5' },
}
</script>

<template>
  <GlassDarkBox
    theme="sunset"
    :style="{
      margin:'-18px -18px -16px -18px',
      height:'calc(100% + 34px)',
      padding:'14px 16px',
      display:'flex', flexDirection:'column',
    }"
  >
    <div :style="{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'4px' }">
      <span :style="{ fontSize:'13px', fontWeight:600, color:'#F3F4F6', letterSpacing:'-0.01em' }">Cucina · live</span>
      <span :style="{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'11px', fontWeight:500, color:'#9CA3AF' }">
        <span :style="{ width:'6px', height:'6px', borderRadius:'999px', background:'#F87171' }"/>
        {{ ORDERS.length }} in coda
      </span>
    </div>

    <div :style="{ display:'flex', flexDirection:'column', gap:'6px', flex:1, minHeight:0, overflowY:'auto', marginTop:'4px' }">
      <div
        v-for="(o, i) in ORDERS"
        :key="i"
        :style="{
          display:'grid', gridTemplateColumns:'auto 1fr auto',
          gap:'10px', alignItems:'center',
          padding:'8px 10px', borderRadius:'9px',
          background:'rgba(255, 255, 255, 0.06)',
          boxShadow:'inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        }"
      >
        <span :style="{
          fontSize:'12px', fontWeight:700, fontVariantNumeric:'tabular-nums',
          color:'#F3F4F6', background:'rgba(255, 255, 255, 0.10)',
          padding:'2px 7px', borderRadius:'6px', minWidth:'22px', textAlign:'center',
        }">{{ o.table }}</span>
        <span :style="{ fontSize:'11.5px', color:'#9CA3AF' }">
          {{ o.items }} portate ·
          <span :style="{ color: STATUS[o.status].fg, fontWeight:600, fontVariantNumeric:'tabular-nums' }">{{ o.time }}</span>
        </span>
        <span :style="{
          fontSize:'10px', fontWeight:700,
          padding:'2px 7px', borderRadius:'5px', letterSpacing:'0.02em',
          background: STATUS[o.status].bg, color: STATUS[o.status].fg,
        }">{{ o.label }}</span>
      </div>
    </div>
  </GlassDarkBox>
</template>
