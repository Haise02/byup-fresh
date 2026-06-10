<script setup>
import { ref, computed } from 'vue'
import PnPeriodToggle from '@/components/PnPeriodToggle.vue'
import WSparkline from '@/components/WSparkline.vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const period = ref('oggi')

const DATA = {
  oggi:      { total:'€ 1.247', trend:'+18%', sub:'vs media giovedì',    spark:[12, 28, 45, 78, 92, 64, 38, 22, 18, 35, 88, 142, 178, 165, 198, 152], labels:['12:00','17:00','21:00'] },
  settimana: { total:'€ 8.420', trend:'+12%', sub:'vs settimana scorsa', spark:[620, 740, 580, 1100, 880, 1340, 1820, 1247, 968, 1450, 1180, 1620],    labels:['Lun','Mer','Ven','Dom'] },
  mese:      { total:'€ 24.380',trend:'+11%', sub:'vs mese scorso',      spark:[380, 480, 320, 690, 540, 840, 720, 1100, 980, 1340, 1180, 1620, 1480, 1820, 2100, 1820, 2280, 1980], labels:['1','10','20','30'] },
}
const d = computed(() => DATA[period.value])
</script>

<template>
  <div :style="{ display:'flex', flexDirection:'column', gap:'14px', height:'100%' }">
    <PnPeriodToggle :period="period" @update:period="p => period = p"/>

    <!-- Metric -->
    <div>
      <div :style="{ fontSize:'11.5px', color:PN.MUTED, fontWeight:600, letterSpacing:'0.3px', textTransform:'uppercase', marginBottom:'6px' }">Incassi {{ period }}</div>
      <div :style="{ display:'flex', alignItems:'baseline', gap:'12px', marginBottom:'4px', flexWrap:'wrap' }">
        <div :style="{ fontSize:'56px', fontWeight:700, color:PN.TEXT, letterSpacing:'-1.4px', lineHeight:1 }">{{ d.total }}</div>
        <div :style="{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'14px', fontWeight:700, color:PN.GREEN }">
          <ByupIcon name="arrow-up-right" :size="14" :color="PN.GREEN"/>
          {{ d.trend }}
        </div>
      </div>
      <div :style="{ fontSize:'12.5px', color:PN.MUTED }">{{ d.sub }}</div>
    </div>

    <!-- Sparkline -->
    <div :style="{ flex:1, minHeight:'36px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }">
      <WSparkline :data="d.spark" :color="PN.PINK" :animated="true"/>
      <div :style="{ display:'flex', justifyContent:'space-between', fontSize:'10.5px', color:PN.MUTED_SOFT, marginTop:'4px' }">
        <span v-for="(l,i) in d.labels" :key="i">{{ l }}</span>
      </div>
    </div>
  </div>
</template>
