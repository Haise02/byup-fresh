<script setup>
import { ref, computed } from 'vue'
import GlassMeshSubstrate from '@/components/glass/GlassMeshSubstrate.vue'
import PnNavItem from '@/components/layout/PnNavItem.vue'
import PnSysItem from '@/components/layout/PnSysItem.vue'
import PnSidebarPlanCard from '@/components/PnSidebarPlanCard.vue'
import { PN } from '@/tokens/pn.js'
import { useModules } from '@/composables/useModules.js'

const props = defineProps({
  active: { type: String, default: 'panoramica' },
})

const emit = defineEmits(['nav'])

const { modules } = useModules()

function readCollapsed() {
  try { return localStorage.getItem('pn_sidebar_collapsed') === '1' } catch { return false }
}
const collapsed = ref(readCollapsed())

function toggle() {
  collapsed.value = !collapsed.value
  try { localStorage.setItem('pn_sidebar_collapsed', collapsed.value ? '1' : '0') } catch {}
}

const navItems = computed(() => [
  { id: 'panoramica',   label: 'Panoramica',       icon: 'grid' },
  modules.value.sala         ? { id: 'sala',         label: 'Sala',             icon: 'place-table' } : null,
  { id: 'vendita',      label: 'Vendita diretta',  icon: 'commerce-cart' },
  modules.value.prenotazioni ? { id: 'prenotazioni', label: 'Prenotazioni',     icon: 'time-calendar' } : null,
  { id: 'cucina',       label: 'Cucina',            icon: 'food-flame' },
  { id: 'statistiche',  label: 'Statistiche',       icon: 'chart-bar' },
  { id: 'contabilita',  label: 'Contabilità',       icon: 'commerce-wallet' },
].filter(Boolean))

const sysItems = [
  { id: 'supporto',     label: 'Supporto',     icon: 'headphones' },
  { id: 'impostazioni', label: 'Impostazioni', icon: 'gear' },
]

function navTo(id) {
  emit('nav', id)
}
</script>

<template>
  <aside :style="{
    width: collapsed ? '68px' : '252px',
    flexShrink: 0,
    ...PN.GLASS_VIBRANT,
    display: 'flex',
    flexDirection: 'column',
    padding: collapsed ? '20px 10px' : '20px 14px',
    height: '100%',
    position: 'relative',
    transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  }">
    <GlassMeshSubstrate />

    <!-- Logo row -->
    <div :style="{
      display:'flex', alignItems:'center',
      justifyContent: collapsed ? 'center' : 'space-between',
      paddingBottom:'24px', flexShrink:0, position:'relative',
    }">
      <!-- Expanded -->
      <template v-if="!collapsed">
        <div style="padding-left:6px;">
          <img src="/Fresh.png" alt="Byup Fresh" style="height:40px; width:auto; display:block;"/>
        </div>
        <button @click="toggle" title="Comprimi menu" :style="{
          width:'26px', height:'26px', borderRadius:'7px',
          border:`1px solid ${PN.BORDER_LIGHT}`,
          background: PN.WHITE_HUSH, color: PN.MUTED,
          cursor:'pointer', display:'grid', placeItems:'center', flexShrink:0,
        }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </template>

      <!-- Collapsed -->
      <template v-else>
        <div :style="{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }">
          <div :style="{
            width:'32px', height:'32px', borderRadius:'9px',
            background:'linear-gradient(135deg, #FF5A5F, #B53338)',
            display:'grid', placeItems:'center', flexShrink:0,
          }">
            <span :style="{ color:'#fff', fontWeight:800, fontSize:'13px', letterSpacing:'-0.03em' }">B</span>
          </div>
          <button @click="toggle" title="Espandi menu" :style="{
            width:'26px', height:'26px', borderRadius:'7px',
            border:`1px solid ${PN.BORDER_LIGHT}`,
            background: PN.WHITE_HUSH, color: PN.MUTED,
            cursor:'pointer', display:'grid', placeItems:'center', flexShrink:0,
          }">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </template>
    </div>

    <!-- Nav items -->
    <div :style="{ flex:1, display:'flex', flexDirection:'column', gap:'2px', minHeight:0, overflowY:'auto' }">
      <PnNavItem
        v-for="item in navItems"
        :key="item.id"
        v-bind="item"
        :collapsed="collapsed"
        :active="active === item.id"
        @click="navTo(item.id)"
      />
    </div>

    <!-- Plan card (only expanded) -->
    <PnSidebarPlanCard v-if="!collapsed"/>

    <!-- System items -->
    <div :style="{
      display:'flex',
      gap: collapsed ? '0' : '4px',
      flexDirection: collapsed ? 'column' : 'row',
      paddingTop:'10px', marginBottom:'10px',
    }">
      <PnSysItem
        v-for="item in sysItems"
        :key="item.id"
        v-bind="item"
        :collapsed="collapsed"
        :active="active === item.id"
        @click="navTo(item.id)"
      />
    </div>

    <!-- Profile -->
    <button
      title="Profilo"
      @click="navTo('profilo')"
      :style="{
        display:'flex', alignItems:'center',
        gap: collapsed ? '0' : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '10px 8px',
        border:'none', background:'transparent',
        cursor:'pointer', fontFamily:'inherit',
        textAlign:'left', width:'100%',
        borderRadius:'8px',
        borderTop: `1px solid ${PN.BORDER}`,
        paddingTop:'14px',
        transition:'background 0.15s',
      }"
      @mouseenter="$event.currentTarget.style.background = '#f0f1f3'"
      @mouseleave="$event.currentTarget.style.background = 'transparent'"
    >
      <div :style="{
        width:'34px', height:'34px', borderRadius:'50%',
        background:'linear-gradient(135deg, #FF5A5F, #B53338)',
        color:'#fff', display:'grid', placeItems:'center',
        fontWeight:700, fontSize:'13px', flexShrink:0,
      }">MS</div>
      <div v-if="!collapsed" :style="{ minWidth:0, flex:1 }">
        <div :style="{ fontSize:'13px', fontWeight:600, color:PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }">Marco Silvestri</div>
        <div :style="{ fontSize:'11px', color:PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }">Trattoria del Borgo</div>
      </div>
    </button>
  </aside>
</template>
