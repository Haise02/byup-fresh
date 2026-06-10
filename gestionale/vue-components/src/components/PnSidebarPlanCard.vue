<script setup>
import { ref, computed } from 'vue'
import GlassDarkBox from '@/components/glass/GlassDarkBox.vue'
import PianoEmoji from '@/components/PianoEmoji.vue'
import { PN } from '@/tokens/pn.js'

const ORDINI_INCLUSI = 1850
const ORDINI_CASSA   = 980
const UTENTI_APP     = 880
const ordiniApp      = UTENTI_APP * 0.5
const ORDINI_USATI   = ORDINI_CASSA + ordiniApp
const ordiniRisparmiati = UTENTI_APP - ordiniApp
const pct = computed(() => Math.min(100, Math.round((ORDINI_USATI / ORDINI_INCLUSI) * 100)))
const fillColor = computed(() => pct.value >= 90 ? PN.PINK : pct.value >= 75 ? PN.AMBER : PN.GREEN)

const barHover = ref(false)
const ctaHover = ref(false)
</script>

<template>
  <GlassDarkBox
    theme="sunset"
    padding="14px 14px 12px"
    :border-radius="12"
    :style="{ margin:'14px 0 10px', display:'flex', flexDirection:'column', gap:'12px' }"
  >
    <!-- Piano label -->
    <div :style="{
      display:'inline-flex', alignItems:'center', gap:'6px',
      fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.85)',
      letterSpacing:'0.04em', textTransform:'uppercase',
    }">
      <PianoEmoji plan-id="starter" :size="16" monochrome="rgba(255,255,255,0.95)"/>
      Piano Starter
    </div>

    <!-- Percentuale -->
    <div>
      <div :style="{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'6px' }">
        <span :style="{
          fontSize:'22px', fontWeight:600, color:'#F5F5F7',
          letterSpacing:'-0.02em', lineHeight:1, fontVariantNumeric:'tabular-nums',
        }">{{ pct }}%</span>
        <span :style="{ fontSize:'11px', color:'rgba(255,255,255,0.60)' }">ordini usati</span>
      </div>

      <!-- Barra -->
      <div
        @mouseenter="barHover = true"
        @mouseleave="barHover = false"
        style="position:relative; cursor:help;"
      >
        <div :style="{
          height:'6px', borderRadius:'999px', background:'rgba(255,255,255,0.18)',
          overflow:'hidden', position:'relative',
        }">
          <div :style="{
            position:'absolute', top:0, left:0, bottom:0,
            width: `${pct}%`,
            background: fillColor,
            borderRadius:'999px',
            transition:'box-shadow 200ms ease-out',
            boxShadow: barHover ? `0 0 0 2px ${fillColor}33` : 'none',
          }"/>
        </div>

        <!-- Tooltip -->
        <div
          v-if="barHover"
          :style="{
            position:'absolute', bottom:'calc(100% + 10px)',
            left:'50%', transform:'translateX(-50%)',
            width:'200px', maxWidth:'100%',
            padding:'10px 12px',
            background:'rgba(15, 17, 21, 0.62)',
            backdropFilter:'blur(18px) saturate(180%)',
            WebkitBackdropFilter:'blur(18px) saturate(180%)',
            color:'#fff', borderRadius:'10px',
            fontSize:'10.5px', lineHeight:1.5, fontWeight:400,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.08), 0 12px 32px -8px rgba(0,0,0,0.50)',
            zIndex:50, textAlign:'left',
          }"
        >
          <div style="font-weight:600;margin-bottom:4px;">
            {{ ORDINI_USATI.toLocaleString('it-IT') }} di {{ ORDINI_INCLUSI.toLocaleString('it-IT') }} ordini
          </div>
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <span style="opacity:0.75;">Cassa · {{ ORDINI_CASSA.toLocaleString('it-IT') }} × 1</span>
            <span>{{ ORDINI_CASSA.toLocaleString('it-IT') }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <span style="opacity:0.75;">App · {{ UTENTI_APP.toLocaleString('it-IT') }} × 0,5</span>
            <span>{{ ordiniApp.toLocaleString('it-IT') }}</span>
          </div>
          <div style="height:1px;background:rgba(255,255,255,0.15);margin:6px 0;"/>
          <div style="display:flex;justify-content:space-between;gap:8px;font-weight:600;">
            <span>Ne restano</span>
            <span>{{ (ORDINI_INCLUSI - ORDINI_USATI).toLocaleString('it-IT') }}</span>
          </div>
          <div style="margin-top:6px;color:#86EFAC;font-size:10px;">
            Risparmiati <b>{{ ordiniRisparmiati.toLocaleString('it-IT') }}</b> ordini grazie ai pagamenti app
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <button
      @mouseenter="ctaHover = true"
      @mouseleave="ctaHover = false"
      class="glass-shimmer"
      :style="{
        padding:'9px 12px',
        background: ctaHover ? '#FFF5F8' : '#FFFFFF',
        color:'#7C2D3C',
        border:'1px solid rgba(255,255,255,0.85)',
        borderRadius:'9px',
        fontWeight:700, fontSize:'12px', fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.90), 0 4px 10px -4px rgba(20, 6, 12, 0.40)',
        transition:'background 180ms ease-out',
        position:'relative',
      }"
    >
      <span style="position:relative;z-index:3;">{{ ctaHover ? 'Ottienilo ora' : 'Passa a Plus' }}</span>
      <span :style="{
        fontSize:'14px', lineHeight:1,
        transform: ctaHover ? 'translateX(2px)' : 'translateX(0)',
        transition:'transform 180ms ease-out',
        position:'relative', zIndex:3,
      }">→</span>
    </button>
  </GlassDarkBox>
</template>
