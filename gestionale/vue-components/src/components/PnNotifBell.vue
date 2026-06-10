<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'
import { PN_NOTIFICATIONS } from '@/data/notifications.js'

const open = ref(false)
const items = ref(PN_NOTIFICATIONS.map(n => ({ ...n })))
const containerRef = ref(null)

const unreadCount = computed(() => items.value.filter(i => i.unread).length)

function handleOutsideClick(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    open.value = false
  }
}

function markAllRead() {
  items.value = items.value.map(i => ({ ...i, unread: false }))
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <div ref="containerRef" style="position:relative;">
    <button
      @click="open = !open"
      :style="{
        position:'relative',
        width:'36px', height:'36px', borderRadius:'10px',
        border: `1px solid ${PN.BORDER}`,
        background: open ? PN.SIDE_BG : PN.WHITE,
        color: PN.TEXT,
        cursor:'pointer',
        display:'grid', placeItems:'center',
      }"
    >
      <ByupIcon name="bell" :size="17" :color="PN.TEXT"/>
      <span
        v-if="unreadCount > 0"
        :style="{
          position:'absolute', top:'5px', right:'5px',
          minWidth:'16px', height:'16px', padding:'0 4px', borderRadius:'999px',
          background: PN.PINK, border: `2px solid ${PN.WHITE}`,
          color:'#fff', fontSize:'9.5px', fontWeight:800,
          display:'grid', placeItems:'center', lineHeight:1,
        }"
      >{{ unreadCount }}</span>
    </button>

    <div
      v-if="open"
      :style="{
        position:'absolute', top:'calc(100% + 8px)', right:0,
        width:'380px',
        ...PN.GLASS_MENU,
        zIndex:50,
        overflow:'hidden',
        fontFamily:'inherit',
      }"
    >
      <!-- Header -->
      <div :style="{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px',
        borderBottom: `1px solid ${PN.BORDER_SOFT}`,
      }">
        <div>
          <div :style="{ fontSize:'14px', fontWeight:700, color:PN.TEXT }">Notifiche</div>
          <div :style="{ fontSize:'11.5px', color:PN.MUTED, marginTop:'2px' }">
            {{ unreadCount > 0 ? `${unreadCount} non lette` : 'Tutto letto ✓' }}
          </div>
        </div>
        <button
          v-if="unreadCount > 0"
          @click="markAllRead"
          :style="{
            background:'transparent', border:'none',
            color: PN.PINK, fontSize:'12px', fontWeight:600,
            fontFamily:'inherit', cursor:'pointer', padding:0,
          }"
        >Segna come lette</button>
      </div>

      <!-- List -->
      <div :style="{ maxHeight:'440px', overflowY:'auto' }">
        <div
          v-for="n in items"
          :key="n.id"
          :style="{
            display:'flex', gap:'12px',
            padding:'12px 16px',
            borderBottom: `1px solid ${PN.BORDER_SOFT}`,
            background: n.unread ? '#fff7fa' : PN.WHITE,
            cursor:'pointer', position:'relative',
            transition:'background 0.12s',
          }"
          @mouseenter="$event.currentTarget.style.background = n.unread ? '#ffeef4' : '#fafafa'"
          @mouseleave="$event.currentTarget.style.background = n.unread ? '#fff7fa' : PN.WHITE"
        >
          <span
            v-if="n.unread"
            :style="{
              position:'absolute', left:'6px', top:'18px',
              width:'6px', height:'6px', borderRadius:'50%', background:PN.PINK,
            }"
          />
          <div :style="{
            width:'36px', height:'36px', borderRadius:'10px',
            background:'#f4f4f6', flexShrink:0,
            display:'grid', placeItems:'center',
          }">
            <ByupIcon :name="n.icon" :size="16" color="#6B7280"/>
          </div>
          <div :style="{ flex:1, minWidth:0 }">
            <div :style="{ fontSize:'13px', fontWeight:600, color:PN.TEXT, marginBottom:'2px', lineHeight:1.35 }">{{ n.title }}</div>
            <div :style="{ fontSize:'12px', color:PN.MUTED, lineHeight:1.45, marginBottom:'4px' }">{{ n.body }}</div>
            <div :style="{ fontSize:'11px', color:'#a3a3ad', fontWeight:500 }">{{ n.time }}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div :style="{
        padding:'10px 16px', textAlign:'center',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        background:'#fafafa',
      }">
        <button :style="{
          background:'transparent', border:'none',
          color:PN.TEXT, fontSize:'12px', fontWeight:600,
          fontFamily:'inherit', cursor:'pointer', padding:0,
        }">Vedi tutte le notifiche →</button>
      </div>
    </div>
  </div>
</template>
