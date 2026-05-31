<script setup>
import GlassDarkBox from '@/components/glass/GlassDarkBox.vue'

defineProps({ size: Object })

const DISHES = [
  { name:'Cacio e pepe',      sales:142, rev:1988, trend:'+12%', up:true },
  { name:'Tagliata di manzo', sales:89,  rev:2225, trend:'+8%',  up:true },
  { name:'Tiramisù della casa',sales:76, rev:532,  trend:'+24%', up:true },
  { name:'Carbonara',         sales:68,  rev:952,  trend:'-3%',  up:false },
  { name:'Bruschetta mista',  sales:54,  rev:432,  trend:'+5%',  up:true },
]

const MAX = Math.max(...DISHES.map(d => d.sales))
</script>

<template>
  <GlassDarkBox
    theme="sunset"
    :style="{
      margin:'-18px -18px -16px -18px',
      height:'calc(100% + 34px)',
      display:'flex', flexDirection:'column',
    }"
  >
    <div :style="{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'14px' }">
      <div :style="{ fontSize:'15px', fontWeight:700, color:'#F5F5F7' }">Top piatti questa settimana</div>
    </div>

    <div :style="{ flex:1, display:'flex', flexDirection:'column', gap:'10px', minHeight:0, overflowY:'auto' }">
      <div
        v-for="(d, i) in DISHES"
        :key="i"
        :style="{ flex:'1 0 auto', minHeight:'38px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'5px' }"
      >
        <div :style="{ display:'flex', justifyContent:'space-between' }">
          <div :style="{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#F5F5F7', fontWeight:600 }">
            <span :style="{
              width:'18px', height:'18px', borderRadius:'5px',
              background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.08)',
              color: i === 0 ? '#fff' : 'rgba(255,255,255,0.70)',
              display:'grid', placeItems:'center',
              fontSize:'10.5px', fontWeight:700,
              boxShadow: i === 0 ? '0 0 10px rgba(255, 96, 102, 0.50)' : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
              flexShrink:0,
            }">{{ i + 1 }}</span>
            {{ d.name }}
          </div>
          <div :style="{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }">
            <span :style="{ color:'rgba(255,255,255,0.55)' }">{{ d.sales }}× · </span>
            <span :style="{ color:'#F5F5F7', fontWeight:600 }">€{{ d.rev.toLocaleString('it') }}</span>
            <span :style="{ color: d.up ? '#86EFAC' : '#FCA5A5', fontWeight:600, minWidth:'36px', textAlign:'right' }">{{ d.trend }}</span>
          </div>
        </div>
        <div :style="{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'99px', overflow:'hidden' }">
          <div :style="{
            height:'100%',
            width:`${(d.sales/MAX)*100}%`,
            background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.30)',
            borderRadius:'99px',
            boxShadow: i === 0 ? '0 0 8px rgba(255, 96, 102, 0.40)' : 'none',
          }"/>
        </div>
      </div>
    </div>
  </GlassDarkBox>
</template>
