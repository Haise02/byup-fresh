<script setup>
import { PN } from '@/tokens/pn.js'

const props = defineProps({
  period: { type: String, required: true },
})

const emit = defineEmits(['update:period'])
</script>

<template>
  <div :style="{ display:'flex', gap:'4px', padding:'3px', background:'#F4F5F7', borderRadius:'8px', alignSelf:'flex-start' }">
    <button
      v-for="p in ['oggi','settimana','mese']"
      :key="p"
      @click="emit('update:period', p)"
      :style="{
        padding: '4px 10px',
        background: period === p ? PN.WHITE : 'transparent',
        color: period === p ? PN.TEXT : PN.MUTED,
        border: 'none',
        borderRadius: '6px',
        fontSize: '11.5px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        textTransform: 'capitalize',
        boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }"
    >{{ p }}</button>
  </div>
</template>
