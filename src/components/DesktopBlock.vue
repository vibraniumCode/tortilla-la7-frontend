<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isDesktop = ref(false)

function checkScreen() {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})

defineExpose({ isDesktop })
</script>

<template>
  <div
    v-if="isDesktop"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-carbon px-8 text-center"
  >
    <span class="font-display text-6xl tracking-wide text-queso">📱</span>
    <h1 class="font-display text-3xl tracking-wide text-crema">
      Solo por celular
    </h1>
    <p class="max-w-xs text-sm text-crema/60">
      Esta app está pensada para pedir desde el celular. Abrila desde tu
      dispositivo móvil.
    </p>
  </div>
  <slot v-else />
</template>
