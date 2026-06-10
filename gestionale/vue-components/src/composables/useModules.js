import { ref, onMounted, onUnmounted } from 'vue'

const MODULES_KEY = 'byup_modules_enabled'

function readModules() {
  try {
    const s = localStorage.getItem(MODULES_KEY)
    return s ? Object.assign({ sala: true, prenotazioni: true }, JSON.parse(s)) : { sala: true, prenotazioni: true }
  } catch {
    return { sala: true, prenotazioni: true }
  }
}

function writeModules(m) {
  try {
    localStorage.setItem(MODULES_KEY, JSON.stringify(m))
    window.dispatchEvent(new Event('byup-modules-change'))
  } catch {}
}

export function useModules() {
  const modules = ref(readModules())

  function update() {
    modules.value = readModules()
  }

  onMounted(() => {
    window.addEventListener('byup-modules-change', update)
    window.addEventListener('storage', update)
  })

  onUnmounted(() => {
    window.removeEventListener('byup-modules-change', update)
    window.removeEventListener('storage', update)
  })

  return { modules, writeModules }
}
