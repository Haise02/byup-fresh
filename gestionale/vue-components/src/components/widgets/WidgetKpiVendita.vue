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
  oggi:      { scontrino:'€ 29,70', sDelta:'+€ 0,80', coperti:'42',  cDelta:'+5%', sTrend:[28.4,29.1,28.8,30.2,29.6,30.5,29.7], cTrend:[5,8,6,9,7,8,7] },
  settimana: { scontrino:'€ 31,90', sDelta:'+€ 1,10', coperti:'264', cDelta:'+9%', sTrend:[30.1,31.2,30.8,32.0,31.4,32.6,31.9], cTrend:[34,38,32,42,38,45,35] },
  mese:      { scontrino:'€ 32,40', sDelta:'+€ 1,20', coperti:'753', cDelta:'+8%', sTrend:[30.5,31.0,31.8,32.2,31.6,32.8,32.4], cTrend:[95,108,98,118,105,128,101] },
}
const d = computed(() => DATA[period.value])
const labels = ['L','M','M','G','V','S','D']

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) {
      const idx = periods.indexOf(period.value)
      period.value = periods[(idx + 1) % periods.length]
    }
  }, 2000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    :style="{ display:'flex', flexDirection:'column', height:'100%', gap:'14px' }"
  >
    <PnPeriodToggle :period="period" @update:period="p => { period = p; paused = true }"/>

    <div
      :key="period"
      :style="{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:'22px', animation:'kpi-fade-in 320ms ease-out' }"
    >
      <!-- Scontrino -->
      <div :style="{ display:'flex', alignItems:'center', gap:'16px' }">
        <div>
          <div :style="{ fontSize:'11.5px', color:PN.MUTED, fontWeight:600, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }">Scontrino medio</div>
          <div :style="{ display:'flex', alignItems:'baseline', gap:'10px' }">
            <div :style="{ fontSize:'38px', fontWeight:700, color:PN.TEXT, letterSpacing:'-0.8px', lineHeight:1 }">{{ d.scontrino }}</div>
            <div :style="{ fontSize:'13px', color:PN.GREEN, fontWeight:700 }">{{ d.sDelta }}</div>
          </div>
        </div>
        <div :style="{ flex:1, minWidth:'80px', height:'48px', display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }">
          <div style="width:100%;max-width:160px;"><WSparkline :data="d.sTrend" :color="PN.PINK"/></div>
        </div>
      </div>

      <!-- Coperti -->
      <div :style="{ display:'flex', alignItems:'center', gap:'16px' }">
        <div>
          <div :style="{ fontSize:'11.5px', color:PN.MUTED, fontWeight:600, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }">Coperti {{ period }}</div>
          <div :style="{ display:'flex', alignItems:'baseline', gap:'10px' }">
            <div :style="{ fontSize:'38px', fontWeight:700, color:PN.TEXT, letterSpacing:'-0.8px', lineHeight:1 }">{{ d.coperti }}</div>
            <div :style="{ fontSize:'13px', color:PN.GREEN, fontWeight:700 }">{{ d.cDelta }}</div>
          </div>
        </div>
        <div :style="{ flex:1, minWidth:'80px', height:'48px', display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }">
          <!-- Bar chart -->
          <div :style="{ display:'flex', alignItems:'flex-end', gap:'4px', width:'100%', maxWidth:'160px', height:'44px' }">
            <div v-for="(v,i) in d.cTrend" :key="i" :style="{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', height:'100%' }">
              <div :style="{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }">
                <div :style="{
                  width:'100%',
                  height:`${(v/Math.max(...d.cTrend))*100}%`, minHeight:'4px',
                  background: i === d.cTrend.length-1 ? PN.PINK : PN.PINK_SOFT,
                  borderRadius:'2px',
                }"/>
              </div>
              <div :style="{ fontSize:'8.5px', color:PN.MUTED, fontWeight:600 }">{{ labels[i] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
