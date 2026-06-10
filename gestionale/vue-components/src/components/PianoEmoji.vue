<script setup>
defineProps({
  planId: { type: String, required: true },
  size: { type: Number, default: 24 },
  monochrome: { type: String, default: '' },
})
</script>

<template>
  <!-- free -->
  <svg v-if="planId === 'free'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21 V13" :stroke="monochrome || '#0F1115'" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 14 C9 13 6 11 5.5 8 C5.3 6.5 6.5 6 8 6.3 C10.5 7 12 9 12 14 Z" :fill="monochrome || '#34D399'" :stroke="monochrome ? 'none' : '#10B981'" stroke-width="0.6"/>
    <path d="M12 14 C15 13 18 11 18.5 8 C18.7 6.5 17.5 6 16 6.3 C13.5 7 12 9 12 14 Z" :fill="monochrome || '#10B981'" :stroke="monochrome ? 'none' : '#059669'" stroke-width="0.6"/>
    <path d="M8 7.5 L11.2 13 M16 7.5 L12.8 13" :stroke="monochrome ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.45)'" stroke-width="0.8" stroke-linecap="round"/>
  </svg>

  <!-- starter -->
  <svg v-else-if="planId === 'starter'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6 Q12 4 20 6 L12 22 Z" :fill="monochrome || '#F4C57E'" :stroke="monochrome ? 'none' : '#C9924C'" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M5.4 7 Q12 5.4 18.6 7 L12 20 Z" :fill="monochrome || '#FF6066'"/>
    <circle cx="9.5" cy="11" r="1.4" :fill="monochrome ? 'rgba(255,255,255,0.65)' : '#8B2025'"/>
    <circle cx="14.2" cy="10.7" r="1.4" :fill="monochrome ? 'rgba(255,255,255,0.65)' : '#8B2025'"/>
    <circle cx="12" cy="15.5" r="1.4" :fill="monochrome ? 'rgba(255,255,255,0.65)' : '#8B2025'"/>
  </svg>

  <!-- plus -->
  <svg v-else-if="planId === 'plus'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 13 Q12 23 21 13 Z" :fill="monochrome || '#BE185D'" :stroke="monochrome ? 'none' : '#8B0E45'" stroke-width="0.8" stroke-linejoin="round"/>
    <ellipse cx="12" cy="13" rx="9" ry="1.4" fill="none" :stroke="monochrome ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.55)'" stroke-width="0.8"/>
    <path d="M5 11 Q8 8 11 11 T17 11 T19 12" :stroke="monochrome || '#FBBF24'" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M6 9 Q9 6 12 9 T18 9" :stroke="monochrome || '#F59E0B'" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>

  <!-- business -->
  <svg v-else-if="planId === 'business'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 14 Q3 11 4.5 9 Q4 6 7 6 Q8 4 10.5 5 Q12 3 13.5 5 Q16 4 17 6 Q20 6 19.5 9 Q21 11 19 14 Z" :fill="monochrome || '#FAFAFA'" :stroke="monochrome ? 'none' : '#7C2D3C'" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M8.5 8.5 V13.5 M12 7 V13.5 M15.5 8.5 V13.5" :stroke="monochrome ? 'rgba(0,0,0,0.2)' : 'rgba(124, 45, 60, 0.30)'" stroke-width="0.8" stroke-linecap="round"/>
    <rect x="5" y="14" width="14" height="3.5" rx="1.2" :fill="monochrome || '#7C2D3C'" :stroke="monochrome ? 'none' : '#4A1525'" stroke-width="0.6"/>
    <circle cx="12" cy="15.75" r="0.7" :fill="monochrome ? 'rgba(255,255,255,0.5)' : '#FFC8B0'"/>
  </svg>

  <!-- fallback -->
  <svg v-else :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" :fill="monochrome || '#D1D5DB'"/>
  </svg>
</template>
