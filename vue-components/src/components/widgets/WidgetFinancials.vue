<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PnPeriodToggle from '@/components/PnPeriodToggle.vue'
import WSparkline from '@/components/WSparkline.vue'
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const period = ref('oggi')
const paused = ref(false)
const periods = ['oggi', 'settimana', 'mese']
let timer = null

const DATA = {
  oggi:      { total: '€ 1.247', trend: '+18%', sub: 'vs media giovedì',    spark: [12, 28, 45, 78, 92, 64, 38, 22, 18, 35, 88, 142, 178, 165, 198, 152], scontrino: '€ 29,70', sDelta: '+€ 0,80', coperti: '42',  cDelta: '+5%' },
  settimana: { total: '€ 8.420', trend: '+12%', sub: 'vs settimana scorsa', spark: [620, 740, 580, 1100, 880, 1340, 1820, 1247, 968, 1450, 1180, 1620],    scontrino: '€ 31,90', sDelta: '+€ 1,10', coperti: '264', cDelta: '+9%' },
  mese:      { total: '€ 24.380',trend: '+11%', sub: 'vs mese scorso',      spark: [380, 480, 320, 690, 540, 840, 720, 1100, 980, 1340, 1180, 1620, 1480, 1820, 2100, 1820, 2280, 1980], scontrino: '€ 32,40', sDelta: '+€ 1,20', coperti: '753', cDelta: '+8%' },
}

const d = computed(() => DATA[period.value])

function startTimer() {
  timer = setInterval(() => {
    if (!paused.value) {
      const idx = periods.indexOf(period.value)
      period.value = periods[(idx + 1) % periods.length]
    }
  }, 2400)
}

onMounted(startTimer)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    :style="{ display:'flex', flexDirection:'column', height:'100%', gap:'12px' }"
  >
    <PnPeriodToggle :period="period" @update:period="p => { period = p; paused = true }"/>

    <div :key="period + '-top'" style="animation: fin-fade-in 320ms ease-out;">
      <div :style="{ fontSize:'11px', color:PN.MUTED, fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'4px' }">
        Incassi {{ period }}
      </div>
      <div :style="{ display:'flex', alignItems:'baseline', gap:'10px' }">
        <span :style="{ fontSize:'30px', fontWeight:600, color:PN.TEXT, lineHeight:1, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }">{{ d.total }}</span>
        <span :style="{ fontSize:'12px', color:PN.GREEN, fontWeight:600 }">{{ d.trend }}</span>
        <span :style="{ fontSize:'11px', color:PN.MUTED, marginLeft:'auto' }">{{ d.sub }}</span>
      </div>
      <div :style="{ marginTop:'8px', height:'56px', overflow:'hidden', borderRadius:'8px' }">
        <WSparkline :data="d.spark" :color="PN.PINK" :animated="true"/>
      </div>
    </div>

    <div
      :key="period + '-bot'"
      :style="{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px',
        animation:'fin-fade-in 320ms ease-out 60ms both',
        marginTop:'auto',
      }"
    >
      <div
        v-for="card in [{ label:'Scontrino', value:d.scontrino, delta:d.sDelta }, { label:`Coperti ${period}`, value:d.coperti, delta:d.cDelta }]"
        :key="card.label"
        :style="{
          padding:'10px 12px',
          background:PN.WHITE_OFF,
          border:`1px solid ${PN.BORDER_HAIR}`,
          borderRadius:'10px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.6)',
        }"
      >
        <div :style="{ fontSize:'10.5px', color:PN.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:'4px' }">{{ card.label }}</div>
        <div :style="{ display:'flex', alignItems:'baseline', gap:'6px' }">
          <span :style="{ fontSize:'17px', fontWeight:600, color:PN.TEXT, lineHeight:1, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums' }">{{ card.value }}</span>
          <span :style="{ fontSize:'11px', color:PN.GREEN, fontWeight:600 }">{{ card.delta }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
