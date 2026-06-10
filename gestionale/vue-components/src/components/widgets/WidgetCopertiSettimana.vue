<script setup>
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const DAYS = [
  { d:'L', v:38 }, { d:'M', v:42 }, { d:'M', v:51 },
  { d:'G', v:67, today:true },
  { d:'V', v:0, future:true }, { d:'S', v:0, future:true }, { d:'D', v:0, future:true },
]
const MAX = Math.max(...DAYS.map(d => d.v), 80)
</script>

<template>
  <div :style="{ display:'flex', flexDirection:'column', height:'100%' }">
    <!-- Metric -->
    <div>
      <div :style="{ fontSize:'11.5px', color:PN.MUTED, fontWeight:600, letterSpacing:'0.3px', textTransform:'uppercase', marginBottom:'6px' }">Coperti questa settimana</div>
      <div :style="{ display:'flex', alignItems:'baseline', gap:'12px', marginBottom:'4px', flexWrap:'wrap' }">
        <div :style="{ fontSize:'38px', fontWeight:700, color:PN.TEXT, letterSpacing:'-0.8px', lineHeight:1 }">198</div>
        <div :style="{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'14px', fontWeight:700, color:PN.GREEN }">
          <ByupIcon name="arrow-up-right" :size="14" :color="PN.GREEN"/>+11%
        </div>
      </div>
      <div :style="{ fontSize:'12.5px', color:PN.MUTED }">prev. fine sett: 412</div>
    </div>

    <!-- Bar chart -->
    <div :style="{ flex:1, display:'flex', alignItems:'flex-end', gap:'8px', marginTop:'18px', paddingBottom:'24px', position:'relative' }">
      <div
        v-for="(d, i) in DAYS"
        :key="i"
        :style="{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }"
      >
        <div :style="{
          fontSize:'10.5px',
          color: d.today ? PN.PINK_DARK : PN.MUTED,
          fontWeight: d.today ? 700 : 600,
          opacity: d.future ? 0 : 1,
        }">{{ d.v || '' }}</div>
        <div :style="{
          width:'100%',
          height: d.future ? '6px' : `${(d.v/MAX)*100}%`, minHeight:'6px',
          background: d.today ? PN.PINK : d.future ? '#F0F2F5' : '#D4D6DB',
          borderRadius:'4px',
          border: d.future ? `1px dashed ${PN.MUTED_LIGHT}` : 'none',
        }"/>
        <div :style="{
          fontSize:'11px',
          color: d.today ? PN.PINK_DARK : PN.MUTED,
          fontWeight: d.today ? 700 : 500,
          position:'absolute', bottom:0,
          left:`calc(${i*100/7}% + ${100/14}%)`,
          transform:'translateX(-50%)',
        }">{{ d.d }}</div>
      </div>
    </div>
  </div>
</template>
