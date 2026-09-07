<script setup lang="ts">
import { computed } from 'vue'
import { urlImagen, type Tortilla } from '@/api'
import { useCart } from '@/store/cart'

const props = defineProps<{ tortilla: Tortilla }>()
const { state, agregar, setCantidad } = useCart()

const enCarrito = computed(() =>
  state.items.find((i) => i.id === props.tortilla._id),
)

const cantidad = computed(() => enCarrito.value?.cantidad ?? 0)

function sumar() {
  if (cantidad.value === 0) {
    agregar(props.tortilla._id, props.tortilla.nombre, props.tortilla.precio)
  } else {
    setCantidad(props.tortilla._id, cantidad.value + 1)
  }
}

function restar() {
  setCantidad(props.tortilla._id, cantidad.value - 1)
}
</script>

<template>
  <div class="flex gap-3 rounded-2xl bg-white/[0.04] p-3">
    <img
      :src="urlImagen(tortilla.imagen)"
      :alt="tortilla.nombre"
      class="h-20 w-20 shrink-0 rounded-xl object-cover"
    />

    <div class="flex min-w-0 flex-1 flex-col justify-between">
      <div>
        <div class="flex items-center gap-2">
          <h4 class="truncate font-display text-lg tracking-wide text-crema">
            {{ tortilla.nombre }}
          </h4>
          <span
            v-if="tortilla.nueva"
            class="shrink-0 rounded-full bg-queso px-2 py-0.5 font-body text-[9px] font-bold uppercase text-carbon"
          >
            Nueva
          </span>
        </div>
        <p class="mt-0.5 truncate font-body text-xs text-crema/50">
          {{ tortilla.descripcion }}
        </p>
      </div>

      <div class="mt-2 flex items-center justify-between">
        <span class="font-display text-base tracking-wide text-queso">
          ${{ tortilla.precio.toLocaleString('es-AR') }}
        </span>

        <div v-if="cantidad === 0">
          <button
            class="rounded-full bg-brasa px-4 py-1.5 font-body text-xs font-bold text-crema active:scale-95"
            @click="sumar"
          >
            Agregar
          </button>
        </div>
        <div v-else class="flex items-center gap-3 rounded-full bg-carbon px-1 py-1">
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-body text-crema"
            @click="restar"
          >
            −
          </button>
          <span class="w-4 text-center font-body text-sm text-crema">{{ cantidad }}</span>
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full bg-brasa font-body text-crema"
            @click="sumar"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
