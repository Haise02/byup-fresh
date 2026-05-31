<script setup>
import { ref } from 'vue'
import GlassMeshSubstrate from '@/components/glass/GlassMeshSubstrate.vue'
import PnSidebar from '@/components/layout/PnSidebar.vue'
import PnHeader from '@/components/layout/PnHeader.vue'
import PnPageActions from '@/components/layout/PnPageActions.vue'
import PnGrid from '@/components/PnGrid.vue'
import PnAddWidgetDrawer from '@/components/PnAddWidgetDrawer.vue'
import ByupIcon from '@/components/icons/ByupIcon.vue'
import { PN } from '@/tokens/pn.js'
import { PN_WIDGET_CATALOG, DEFAULT_LAYOUT } from '@/data/widgetCatalog.js'

const editMode    = ref(false)
const drawerOpen  = ref(false)
const widgets     = ref(DEFAULT_LAYOUT.map(w => ({ ...w })))

function removeWidget(id) {
  widgets.value = widgets.value.filter(w => w.id !== id)
}

function addWidget(id) {
  const def = PN_WIDGET_CATALOG.find(c => c.id === id)
  if (!def) return
  widgets.value = [...widgets.value, { id, size: { ...def.defaultSize } }]
  drawerOpen.value = false
}

function resizeWidget(id, newSize) {
  widgets.value = widgets.value.map(w => w.id === id ? { ...w, size: newSize } : w)
}

function reorderWidgets(fromId, toId) {
  const arr = [...widgets.value]
  const fromIdx = arr.findIndex(w => w.id === fromId)
  const toIdx   = arr.findIndex(w => w.id === toId)
  if (fromIdx < 0 || toIdx < 0) return
  const [moved] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, moved)
  widgets.value = arr
}
</script>

<template>
  <div class="frame" style="display:flex; flex:1; height:100%; position:relative; overflow:hidden;">
    <GlassMeshSubstrate />
    <PnSidebar active="panoramica" />

    <main style="flex:1; display:flex; flex-direction:column; min-width:0; position:relative;">
      <PnHeader />

      <div
        class="pn-scroll"
        :style="{
          flex:1, overflow:'auto',
          padding:'16px 28px 24px',
          background: PN.BG,
          display:'flex', flexDirection:'column', gap:'14px',
        }"
      >
        <PnPageActions
          :edit-mode="editMode"
          @toggle-edit="editMode = !editMode"
          @add-widget="drawerOpen = true"
        />

        <!-- Edit mode banner -->
        <div
          v-if="editMode"
          :style="{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'10px 14px',
            background: PN.PINK_SOFT,
            border: `1px dashed ${PN.PINK}`,
            borderRadius:'10px',
            fontSize:'13px', color: PN.PINK_DARK, fontWeight:600,
          }"
        >
          <ByupIcon name="pencil" :size="14" :color="PN.PINK_DARK"/>
          Modalità personalizzazione attiva — trascina, rimuovi o aggiungi widget. Clicca
          <em style="font-style:normal; text-decoration:underline;">Fine</em> per salvare.
        </div>

        <PnGrid
          :widgets="widgets"
          :edit-mode="editMode"
          @remove="removeWidget"
          @reorder="reorderWidgets"
          @resize="resizeWidget"
        />

        <!-- Add widget button (edit mode) -->
        <button
          v-if="editMode"
          @click="drawerOpen = true"
          :style="{
            padding:'24px',
            background:'transparent',
            border: `2px dashed ${PN.MUTED_LIGHT}`,
            borderRadius:'14px',
            cursor:'pointer', fontFamily:'inherit',
            color: PN.MUTED, fontWeight:600, fontSize:'13.5px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          }"
        >
          <ByupIcon name="plus" :size="16"/> Aggiungi widget
        </button>
      </div>

      <!-- Drawer (positioned inside main) -->
      <PnAddWidgetDrawer
        :open="drawerOpen"
        :current-ids="widgets.map(w => w.id)"
        @close="drawerOpen = false"
        @add="addWidget"
      />
    </main>
  </div>
</template>
