<script setup>
import { ref, computed } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'
import { PN_WIDGET_CATALOG } from '@/data/widgetCatalog.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  currentIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'add'])

const query = ref('')
const cat = ref('Tutti')

const cats = computed(() => ['Tutti', ...new Set(PN_WIDGET_CATALOG.map(w => w.category))])

const filtered = computed(() =>
  PN_WIDGET_CATALOG.filter(w => {
    if (cat.value !== 'Tutti' && w.category !== cat.value) return false
    if (query.value && !w.name.toLowerCase().includes(query.value.toLowerCase()) && !w.desc.toLowerCase().includes(query.value.toLowerCase())) return false
    return true
  })
)
</script>

<template>
  <!-- Scrim -->
  <div
    @click="emit('close')"
    :style="{
      position:'absolute', inset:0,
      background:'rgba(15,17,21,0.30)',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition:'opacity 0.2s',
      zIndex:50,
    }"
  />

  <!-- Drawer -->
  <div :style="{
    position:'absolute', top:0, right:0, bottom:0,
    width:'420px', background: PN.WHITE,
    boxShadow:'-12px 0 32px rgba(15,17,21,0.10)',
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition:'transform 0.25s cubic-bezier(.4,.0,.2,1)',
    zIndex:60,
    display:'flex', flexDirection:'column',
  }">
    <!-- Header -->
    <div :style="{ padding:'20px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}` }">
      <div :style="{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }">
        <h2 :style="{ margin:0, fontSize:'18px', fontWeight:700, color:PN.TEXT, letterSpacing:'-0.3px' }">Aggiungi widget</h2>
        <button
          @click="emit('close')"
          :style="{
            width:'30px', height:'30px', borderRadius:'8px',
            border:'none', background:'#F4F5F7', color:PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center',
          }"
        >
          <ByupIcon name="xmark" :size="14"/>
        </button>
      </div>
      <div :style="{ fontSize:'13px', color:PN.MUTED, marginBottom:'14px' }">
        Clicca per aggiungere un widget alla griglia
      </div>

      <!-- Search -->
      <div :style="{
        display:'flex', alignItems:'center', gap:'8px',
        padding:'8px 12px', background:'#F4F5F7', borderRadius:'9px',
      }">
        <ByupIcon name="magnifying-glass" :size="14" :color="PN.MUTED"/>
        <input
          v-model="query"
          placeholder="Cerca widget…"
          :style="{
            flex:1, border:'none', background:'transparent',
            outline:'none', fontFamily:'inherit', fontSize:'13px',
          }"
        />
      </div>

      <!-- Category filters -->
      <div :style="{ display:'flex', gap:'6px', marginTop:'12px', flexWrap:'wrap' }">
        <button
          v-for="c in cats"
          :key="c"
          @click="cat = c"
          :style="{
            padding:'5px 10px', borderRadius:'999px',
            border: `1px solid ${cat === c ? PN.TEXT : PN.BORDER}`,
            background: cat === c ? PN.TEXT : PN.WHITE,
            color: cat === c ? PN.WHITE : PN.TEXT,
            fontSize:'11.5px', fontWeight:600,
            cursor:'pointer', fontFamily:'inherit',
          }"
        >{{ c }}</button>
      </div>
    </div>

    <!-- Widget list -->
    <div :style="{ flex:1, overflow:'auto', padding:'14px 22px 22px' }">
      <div :style="{ display:'flex', flexDirection:'column', gap:'8px' }">
        <div
          v-for="w in filtered"
          :key="w.id"
          :style="{
            display:'flex', alignItems:'center', gap:'12px',
            padding:'12px',
            border: `1px solid ${PN.BORDER}`,
            borderRadius:'10px',
            background: props.currentIds.includes(w.id) ? '#FAFAFB' : PN.WHITE,
            opacity: props.currentIds.includes(w.id) ? 0.6 : 1,
          }"
        >
          <!-- Mini grid sketch -->
          <div :style="{
            width:'56px', height:'44px', borderRadius:'6px',
            background:'#F4F5F7', padding:'4px',
            display:'grid',
            gridTemplateColumns:'repeat(4, 1fr)',
            gridTemplateRows:'repeat(2, 1fr)',
            gap:'2px', flexShrink:0,
          }">
            <div
              v-for="i in 8"
              :key="i"
              :style="{
                background: ((i - 1) % 4) < w.defaultSize.w && Math.floor((i - 1) / 4) < w.defaultSize.h
                  ? PN.TEXT : '#E1E3E8',
                borderRadius:'1.5px',
              }"
            />
          </div>

          <div :style="{ flex:1, minWidth:0 }">
            <div :style="{ fontSize:'13.5px', fontWeight:600, color:PN.TEXT, marginBottom:'2px' }">{{ w.name }}</div>
            <div :style="{ fontSize:'11.5px', color:PN.MUTED }">{{ w.desc }}</div>
          </div>

          <button
            :disabled="props.currentIds.includes(w.id)"
            @click="emit('add', w.id)"
            :style="{
              padding:'7px 12px',
              background: props.currentIds.includes(w.id) ? '#F4F5F7' : PN.TEXT,
              color: props.currentIds.includes(w.id) ? PN.MUTED : PN.WHITE,
              border:'none', borderRadius:'8px',
              fontWeight:600, fontSize:'12px', fontFamily:'inherit',
              cursor: props.currentIds.includes(w.id) ? 'default' : 'pointer',
              whiteSpace:'nowrap',
            }"
          >{{ props.currentIds.includes(w.id) ? 'Già presente' : 'Aggiungi' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
