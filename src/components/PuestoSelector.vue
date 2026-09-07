<script setup lang="ts">
import { useCart } from '@/store/cart'
import { useCatalog } from '@/store/catalog'

const { state } = useCart()
const { state: catalogo } = useCatalog()
</script>

<template>
  <div class="mt-3 flex flex-col gap-2">
    <button
      v-for="puesto in catalogo.puestos"
      :key="puesto._id"
      class="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors"
      :class="
        state.puestoId === puesto._id
          ? 'border-brasa bg-brasa/10'
          : 'border-crema/15'
      "
      @click="state.puestoId = puesto._id"
    >
      <div>
        <p class="font-body text-sm font-medium text-crema">{{ puesto.nombre }}</p>
        <p class="font-body text-xs text-crema/50">{{ puesto.direccion }}</p>
      </div>
      <div
        class="h-4 w-4 shrink-0 rounded-full border-2"
        :class="state.puestoId === puesto._id ? 'border-brasa bg-brasa' : 'border-crema/30'"
      />
    </button>
  </div>
</template>
