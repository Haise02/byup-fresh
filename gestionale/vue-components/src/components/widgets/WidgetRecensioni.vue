<script setup>
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

defineProps({ size: Object })

const REVIEWS = [
  { name:'Laura M.',  stars:5, when:'2h fa',  text:'Cacio e pepe stellare, servizio impeccabile. Torneremo!', source:'Google' },
  { name:'Andrea P.', stars:4, when:'5h fa',  text:"Tutto buono, ma sala un po' rumorosa di sabato sera.",   source:'TheFork' },
  { name:'Sofia R.',  stars:5, when:'1g fa',  text:'Personale gentilissimo, tagliata cotta perfetta. Top.',  source:'Google' },
]
</script>

<template>
  <div :style="{ display:'flex', flexDirection:'column', height:'100%' }">
    <div :style="{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }">
      <div>
        <div :style="{ fontSize:'15px', fontWeight:700, color:PN.TEXT }">Recensioni recenti</div>
        <div :style="{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px' }">
          <div :style="{ display:'flex', gap:'2px' }">
            <ByupIcon v-for="i in 5" :key="i" name="star" :size="13" :color="i <= 4 ? '#F59E0B' : '#E5E7EB'"/>
          </div>
          <span :style="{ fontSize:'13px', fontWeight:700, color:PN.TEXT }">4,7</span>
          <span :style="{ fontSize:'12px', color:PN.MUTED }">· 312 recensioni</span>
        </div>
      </div>
      <div :style="{
        fontSize:'11px', fontWeight:600, color:PN.GREEN,
        background:PN.GREEN_SOFT, padding:'4px 8px', borderRadius:'6px',
      }">+8 questa settimana</div>
    </div>

    <div :style="{ flex:1, display:'flex', flexDirection:'column', gap:'10px', minHeight:0, overflow:'auto' }">
      <div
        v-for="(r, i) in REVIEWS"
        :key="i"
        class="glass-lift-hover"
        :style="{
          flex:'1 0 auto', minHeight:'64px',
          display:'flex', flexDirection:'column', justifyContent:'center',
          padding:'12px', borderRadius:'10px',
          background:'rgba(255, 245, 248, 0.55)',
          backgroundImage:'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 100%)',
          backdropFilter:'blur(12px) saturate(160%)',
          WebkitBackdropFilter:'blur(12px) saturate(160%)',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.70), inset 0 0 0 1px rgba(242, 107, 122, 0.08), 0 1px 2px rgba(15, 17, 21, 0.03)',
        }"
      >
        <div :style="{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }">
          <div :style="{ fontSize:'12.5px', fontWeight:600, color:PN.TEXT }">{{ r.name }}</div>
          <div :style="{ display:'flex', gap:'1px' }">
            <ByupIcon v-for="i in 5" :key="i" name="star" :size="10" :color="i <= r.stars ? '#F59E0B' : '#E5E7EB'"/>
          </div>
          <div :style="{ fontSize:'11px', color:PN.MUTED, marginLeft:'auto' }">{{ r.when }} · {{ r.source }}</div>
        </div>
        <div :style="{ fontSize:'12.5px', color:PN.TEXT, lineHeight:1.5 }">{{ r.text }}</div>
      </div>
    </div>
  </div>
</template>
