<script setup>
import { ref, computed } from 'vue'
import PnPeriodToggle from '@/components/PnPeriodToggle.vue'
import { PN } from '@/tokens/pn.js'

const props = defineProps({ size: { type: Object, default: () => ({ w: 1, h: 1 }) } })

const period = ref('mese')

const DATA = {
  oggi:      { pct:84, delta:'+6%', sub:'sera in corso',    fasce:[{h:'12',v:62},{h:'13',v:78},{h:'14',v:55},{h:'19',v:88},{h:'20',v:96},{h:'21',v:91},{h:'22',v:64}] },
  settimana: { pct:76, delta:'+3%', sub:'media 7 giorni',   fasce:[{h:'12',v:58},{h:'13',v:74},{h:'14',v:60},{h:'19',v:81},{h:'20',v:92},{h:'21',v:88},{h:'22',v:65}] },
  mese:      { pct:78, delta:'-2%', sub:'media 30 giorni',  fasce:[{h:'12',v:65},{h:'13',v:88},{h:'14',v:72},{h:'19',v:78},{h:'20',v:95},{h:'21',v:92},{h:'22',v:71}] },
}

const d = computed(() => DATA[period.value])
const isPos = computed(() => !d.value.delta.startsWith('-'))
const wW = computed(() => props.size?.w || 1)
const wH = computed(() => props.size?.h || 1)
const sideBySide = computed(() => wW.value >= 2 && wH.value === 1)

function barColor(v) {
  if (v >= 90) return PN.PINK
  if (v >= 70) return PN.WINE
  if (v >= 50) return PN.AMBER
  return PN.MUTED_LIGHT
}
</script>

<template>
  <div :style="{
    display:'flex',
    flexDirection: sideBySide ? 'row' : 'column',
    height:'100%', minHeight:0, gap: sideBySide ? '18px' : '14px',
  }">
    <!-- Left block -->
    <div :style="{
      display:'flex', flexDirection:'column', gap:'10px', flexShrink:0,
      flexBasis: sideBySide ? '38%' : 'auto',
      justifyContent: sideBySide ? 'center' : 'flex-start',
    }">
      <PnPeriodToggle :period="period" @update:period="p => period = p"/>
      <div>
        <div :style="{ fontSize:'11px', color:PN.MUTED, fontWeight:600, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }">Riempimento {{ period }}</div>
        <div :style="{ display:'flex', alignItems:'baseline', gap: sideBySide ? '8px' : '14px', flexWrap:'wrap' }">
          <div :style="{ fontSize: sideBySide ? '44px' : '56px', fontWeight:700, color:PN.TEXT, letterSpacing:'-1.2px', lineHeight:1 }">{{ d.pct }}%</div>
          <div :style="{ fontSize:'14px', color: isPos ? PN.GREEN : PN.RED, fontWeight:700 }">{{ d.delta }}</div>
        </div>
        <div :style="{ fontSize:'12px', color:PN.MUTED, marginTop:'4px' }">{{ d.sub }}</div>
      </div>
    </div>

    <!-- Bar chart -->
    <div :style="{
      flex:1, minWidth:0, minHeight:0,
      display:'flex', flexDirection:'column',
      borderTop: sideBySide ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
      borderLeft: sideBySide ? `1px solid ${PN.BORDER_SOFT}` : 'none',
      paddingTop: sideBySide ? '0' : '10px',
      paddingLeft: sideBySide ? '18px' : '0',
    }">
      <div :style="{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'10px' }">
        <div :style="{ fontSize:'10.5px', color:PN.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }">Occupazione per fascia oraria</div>
        <div :style="{ fontSize:'10px', color:PN.MUTED }">0–100%</div>
      </div>
      <div :style="{ flex:1, display:'flex', alignItems:'stretch', gap:'8px', paddingTop:'4px', position:'relative' }">
        <!-- Gridlines -->
        <div :style="{ position:'absolute', inset:'4px 0 18px 0', display:'flex', flexDirection:'column', justifyContent:'space-between', pointerEvents:'none' }">
          <div v-for="v in [100, 50, 0]" :key="v" :style="{ borderTop:`1px dashed ${PN.BORDER_SOFT}`, position:'relative' }">
            <span :style="{ position:'absolute', right:0, top:'-7px', fontSize:'9px', color:PN.MUTED, background:PN.WHITE, padding:'0 3px' }">{{ v }}</span>
          </div>
        </div>
        <div
          v-for="(f, i) in d.fasce"
          :key="i"
          :style="{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', position:'relative', zIndex:1 }"
        >
          <div :style="{ flex:1, width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center' }">
            <div :style="{ fontSize:'10px', fontWeight:700, color:PN.TEXT, marginBottom:'3px' }">{{ f.v }}%</div>
            <div :style="{
              width:'100%', maxWidth:'26px',
              height:`${(f.v/100)*100}%`, minHeight:'6px',
              background: barColor(f.v),
              borderRadius:'4px 4px 2px 2px',
            }"/>
          </div>
          <div :style="{ fontSize:'10px', color:PN.MUTED, fontWeight:600 }">{{ f.h }}:00</div>
        </div>
      </div>
    </div>
  </div>
</template>
