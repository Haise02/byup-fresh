<script setup>
import { ref, shallowRef, defineAsyncComponent, markRaw } from 'vue'
import PnWidgetShell from '@/components/PnWidgetShell.vue'
import { PN_WIDGET_CATALOG } from '@/data/widgetCatalog.js'
import { PN } from '@/tokens/pn.js'

// Lazy-load all widget components
const widgetComponents = {
  WidgetFinancials:       defineAsyncComponent(() => import('@/components/widgets/WidgetFinancials.vue')),
  WidgetIncassi:          defineAsyncComponent(() => import('@/components/widgets/WidgetIncassi.vue')),
  WidgetKpiVendita:       defineAsyncComponent(() => import('@/components/widgets/WidgetKpiVendita.vue')),
  WidgetRiempimento:      defineAsyncComponent(() => import('@/components/widgets/WidgetRiempimento.vue')),
  WidgetPrenotazioniOggi: defineAsyncComponent(() => import('@/components/widgets/WidgetPrenotazioniOggi.vue')),
  WidgetTavoliStato:      defineAsyncComponent(() => import('@/components/widgets/WidgetTavoliStato.vue')),
  WidgetTopPiatti:        defineAsyncComponent(() => import('@/components/widgets/WidgetTopPiatti.vue')),
  WidgetRecensioni:       defineAsyncComponent(() => import('@/components/widgets/WidgetRecensioni.vue')),
  WidgetAzioni:           defineAsyncComponent(() => import('@/components/widgets/WidgetAzioni.vue')),
  WidgetCopertiSettimana: defineAsyncComponent(() => import('@/components/widgets/WidgetCopertiSettimana.vue')),
  WidgetCucinaLive:       defineAsyncComponent(() => import('@/components/widgets/WidgetCucinaLive.vue')),
}

const props = defineProps({
  widgets: { type: Array, required: true },
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits(['remove', 'reorder', 'resize'])

const dragId   = ref(null)
const overId   = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

function handleDragStart(id) {
  return (e) => {
    if (!props.editMode) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    dragId.value = id
    dragOffset.value = { x: 0, y: 0 }

    const onMove = (ev) => {
      dragOffset.value = { x: ev.clientX - startX, y: ev.clientY - startY }
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      const card = el?.closest('[data-widget-id]')
      if (card) overId.value = card.getAttribute('data-widget-id')
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (dragId.value && overId.value && dragId.value !== overId.value) {
        emit('reorder', dragId.value, overId.value)
      }
      dragId.value = null
      overId.value = null
      dragOffset.value = { x: 0, y: 0 }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
}

function getComponent(componentName) {
  return widgetComponents[componentName]
}
</script>

<template>
  <div :style="{
    display:'grid',
    gridTemplateColumns:'repeat(4, 1fr)',
    gap:'16px',
    gridAutoRows:'142px',
    gridAutoFlow:'dense',
  }">
    <div
      v-for="(w, idx) in widgets"
      :key="w.id"
      :data-widget-id="w.id"
      :style="{
        gridColumn: `span ${w.size.w}`,
        gridRow: `span ${w.size.h}`,
        minHeight: 0,
        borderRadius: '14px',
        position: 'relative',
        zIndex: dragId === w.id ? 50 : 1,
        transform: dragId === w.id
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
          : 'none',
        transition: dragId === w.id ? 'none' : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        pointerEvents: dragId === w.id ? 'none' : 'auto',
        outline: overId === w.id && dragId !== w.id ? `2px dashed ${PN.PINK}` : 'none',
        outlineOffset: '4px',
      }"
    >
      <PnWidgetShell
        :edit-mode="editMode"
        :dragging="dragId === w.id"
        :other-dragging="!!dragId && dragId !== w.id"
        :wiggle-delay="(idx * 40) % 200"
        :size="w.size"
        :fixed-size="PN_WIDGET_CATALOG.find(c => c.id === w.id)?.fixedSize || false"
        :theme="PN_WIDGET_CATALOG.find(c => c.id === w.id)?.theme || ''"
        @remove="emit('remove', w.id)"
        @drag-start="handleDragStart(w.id)($event)"
        @resize="(newSize) => emit('resize', w.id, newSize)"
      >
        <component
          :is="getComponent(PN_WIDGET_CATALOG.find(c => c.id === w.id)?.component)"
          :size="w.size"
        />
      </PnWidgetShell>
    </div>
  </div>
</template>
