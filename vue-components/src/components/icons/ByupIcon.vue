<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 16 },
  color: { type: String, default: 'currentColor' },
})

const icons = {
  'grid': `<path d="M6 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Zm0 8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-3Zm-9 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6Z"/>`,
  'magnifying-glass': `<path fill-rule="evenodd" clip-rule="evenodd" d="M3 10.5a7.5 7.5 0 1 1 13.39 4.6l4 4.01a1.4 1.4 0 0 1-2 2l-4-4A7.5 7.5 0 0 1 3 10.5Zm7.5-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>`,
  'bell': `<path d="M12 2a7 7 0 0 0-7 7v3.4c0 .65-.2 1.3-.55 1.85L3.1 16.45A1 1 0 0 0 3.95 18h16.1a1 1 0 0 0 .85-1.55l-1.35-2.2A3.5 3.5 0 0 1 19 12.4V9a7 7 0 0 0-7-7Zm-2.45 17.5a2.5 2.5 0 0 0 4.9 0h-4.9Z"/>`,
  'gear': `<path d="M10.6 1.5h2.8a1.2 1.2 0 0 1 1.2 1.2v1.1a1.2 1.2 0 0 0 .7 1.1l.1.1a1.2 1.2 0 0 0 1.3-.1l.8-.8a1.2 1.2 0 0 1 1.7 0l2 2a1.2 1.2 0 0 1 0 1.7l-.8.8a1.2 1.2 0 0 0-.1 1.3l.1.1c.3.4.7.7 1.1.7h1.1A1.2 1.2 0 0 1 22 11.4v2.8a1.2 1.2 0 0 1-1.2 1.2h-1.1a1.2 1.2 0 0 0-1.1.7l-.1.1a1.2 1.2 0 0 0 .1 1.3l.8.8a1.2 1.2 0 0 1 0 1.7l-2 2a1.2 1.2 0 0 1-1.7 0l-.8-.8a1.2 1.2 0 0 0-1.3-.1l-.1.1c-.4.3-.7.7-.7 1.1v1.1A1.2 1.2 0 0 1 12.6 22h-2.8a1.2 1.2 0 0 1-1.2-1.2v-1.1a1.2 1.2 0 0 0-.7-1.1l-.1-.1a1.2 1.2 0 0 0-1.3.1l-.8.8a1.2 1.2 0 0 1-1.7 0l-2-2a1.2 1.2 0 0 1 0-1.7l.8-.8a1.2 1.2 0 0 0 .1-1.3l-.1-.1a1.2 1.2 0 0 0-1.1-.7H2.2A1.2 1.2 0 0 1 1 11.6V8.8A1.2 1.2 0 0 1 2.2 7.6h1.1a1.2 1.2 0 0 0 1.1-.7l.1-.1a1.2 1.2 0 0 0-.1-1.3l-.8-.8a1.2 1.2 0 0 1 0-1.7l2-2a1.2 1.2 0 0 1 1.7 0l.8.8a1.2 1.2 0 0 0 1.3.1l.1-.1c.4-.3.7-.7.7-1.1V2.7A1.2 1.2 0 0 1 10.6 1.5ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/>`,
  'plus': `<path d="M12 4a1.25 1.25 0 0 0-1.25 1.25v5.5h-5.5a1.25 1.25 0 0 0 0 2.5h5.5v5.5a1.25 1.25 0 0 0 2.5 0v-5.5h5.5a1.25 1.25 0 0 0 0-2.5h-5.5v-5.5A1.25 1.25 0 0 0 12 4Z"/>`,
  'xmark': `<path d="M5.65 5.65a1.25 1.25 0 0 1 1.77 0L12 10.23l4.58-4.58a1.25 1.25 0 1 1 1.77 1.77L13.77 12l4.58 4.58a1.25 1.25 0 1 1-1.77 1.77L12 13.77l-4.58 4.58a1.25 1.25 0 0 1-1.77-1.77L10.23 12 5.65 7.42a1.25 1.25 0 0 1 0-1.77Z"/>`,
  'grip': `<path d="M9 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>`,
  'check': `<path d="M19.7 6.3a1.2 1.2 0 0 1 0 1.7l-9.5 9.5a1.2 1.2 0 0 1-1.7 0l-4.5-4.5a1.2 1.2 0 1 1 1.7-1.7l3.65 3.65 8.65-8.65a1.2 1.2 0 0 1 1.7 0Z"/>`,
  'pencil': `<path d="M17.7 2.3a2.8 2.8 0 0 1 4 4l-1.4 1.4-4-4 1.4-1.4Zm-2.45 2.45 4 4L8.6 19.4a2 2 0 0 1-.95.55l-3.65.9a.8.8 0 0 1-.95-.95l.9-3.65a2 2 0 0 1 .55-.95L15.25 4.75Z"/>`,
  'arrow-up-right': `<path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'arrow-down-right': `<path d="M7 7l10 10M17 17H7M17 17V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'star': `<path d="M12 2l2.9 6.4L22 9.24l-5.5 5.12L17.82 22 12 18.6 6.18 22l1.32-7.64L2 9.24l7.1-.84L12 2Z"/>`,
  'people-customer': `<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM6 6a6 6 0 1 1 12 0A6 6 0 0 1 6 6Zm-3.5 14a9.5 9.5 0 0 1 19 0H2.5Z"/>`,
  'people-staff-group': `<path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm6 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM1 18a8 8 0 0 1 16 0H1Zm14.5-1a6.5 6.5 0 0 1 6.5 6.5h-4.5A8 8 0 0 0 15.5 17Z"/>`,
  'headphones': `<path d="M4 13V12a8 8 0 0 1 16 0v1M2 16.5A2.5 2.5 0 0 1 4.5 14H6v5H4.5A2.5 2.5 0 0 1 2 16.5Zm20 0A2.5 2.5 0 0 1 19.5 19H18v-5h1.5A2.5 2.5 0 0 1 22 16.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'place-table': `<path d="M3 6h18M3 12h18M9 6v12M15 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'commerce-cart': `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'commerce-wallet': `<path fill-rule="evenodd" clip-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v1h14V6a1 1 0 0 0-1-1H6Zm13 4H5v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8Zm-4 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"/>`,
  'commerce-receipt': `<path d="M4 2h16v20l-4-3-4 3-4-3-4 3V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'commerce-bank-cards': `<rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 10h20" stroke="currentColor" stroke-width="2"/>`,
  'time-calendar': `<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  'time-history': `<path d="M3 12a9 9 0 1 1 18 0A9 9 0 0 1 3 12Z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  'food-flame': `<path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-4-4-5-4-9ZM9 17c0 1.66 1.34 3 3 3s3-1.34 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'food-meal': `<path d="M2 20h20M6 4v6a6 6 0 0 0 12 0V4M6 4H2M18 4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'chart-bar': `<path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'download': `<path d="M12 3v13M7 12l5 5 5-5M3 17v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'sparkles': `<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM5 15l.75 2.25L8 18l-2.25.75L5 21l-.75-2.25L2 18l2.25-.75L5 15ZM19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3Z"/>`,
  'status-tip': `<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm1 13h-2v-6h2v6Zm-1-8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>`,
  'status-feature': `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>`,
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="color"
    style="flex-shrink: 0; display: inline-block; vertical-align: middle;"
    v-html="icons[name] || icons['sparkles']"
  />
</template>
