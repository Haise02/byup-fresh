<script setup>
import PnConnectionStatus from '@/components/PnConnectionStatus.vue'
import PnNotifBell from '@/components/PnNotifBell.vue'
import { PN } from '@/tokens/pn.js'
</script>

<template>
  <header :style="{
    display:'flex', alignItems:'center', gap:'16px',
    padding:'16px 28px 14px',
    borderBottom: `1px solid ${PN.BORDER_HAIR}`,
    background: PN.WHITE_OFF,
    flexShrink: 0,
  }">
    <div style="flex:1;">
      <div :style="{ fontSize:'12px', fontWeight:600, color:PN.MUTED, letterSpacing:'0.4px', textTransform:'uppercase', marginBottom:'4px' }">
        Trattoria del Borgo · Centro storico
      </div>
      <h1 :style="{ margin:0, fontSize:'22px', fontWeight:600, color:PN.TEXT, letterSpacing:'-0.02em' }">
        Buongiorno Marco
      </h1>
    </div>
    <PnConnectionStatus />
    <PnNotifBell />
  </header>
</template>
