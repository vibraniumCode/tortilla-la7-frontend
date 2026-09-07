<script setup lang="ts">
import { useCart } from '@/store/cart'

const { state, cantidadTotal, total } = useCart()
</script>

<template>
  <button
    v-if="cantidadTotal > 0"
    class="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-full bg-crema px-5 py-3.5 shadow-2xl active:scale-[0.98]"
    @click="state.abierto = true"
  >
    <span class="flex items-center gap-2 font-body text-sm font-bold text-carbon">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-brasa text-xs text-crema"
      >
        {{ cantidadTotal }}
      </span>
      Ver pedido
    </span>
    <span class="font-display text-lg tracking-wide text-carbon">
      ${{ total.toLocaleString('es-AR') }}
    </span>
  </button>
</template>
