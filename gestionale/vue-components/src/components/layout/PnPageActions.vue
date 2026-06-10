<script setup>
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'

defineProps({
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-edit', 'add-widget'])
</script>

<template>
  <div :style="{ display:'flex', justifyContent:'flex-end', gap:'10px' }">
    <button
      v-if="editMode"
      @click="emit('add-widget')"
      :style="{
        display:'inline-flex', alignItems:'center', gap:'6px',
        padding:'7px 13px',
        background: PN.TEXT, color: PN.WHITE,
        border:'none', borderRadius:'9px',
        fontWeight:600, fontSize:'12.5px', fontFamily:'inherit', cursor:'pointer',
      }"
    >
      <ByupIcon name="plus" :size="13" color="#fff"/> Aggiungi widget
    </button>
    <button
      @click="emit('toggle-edit')"
      :style="{
        display:'inline-flex', alignItems:'center', gap:'6px',
        padding:'7px 13px',
        background: editMode ? PN.PINK : PN.WHITE,
        color: editMode ? PN.WHITE : PN.TEXT,
        border: `1px solid ${editMode ? PN.PINK : PN.BORDER}`,
        borderRadius:'9px',
        fontWeight:600, fontSize:'12.5px', fontFamily:'inherit', cursor:'pointer',
      }"
    >
      <template v-if="editMode">
        <ByupIcon name="check" :size="13" color="#fff"/> Fine
      </template>
      <template v-else>
        <ByupIcon name="pencil" :size="13" :color="PN.TEXT"/> Personalizza
      </template>
    </button>
  </div>
</template>
