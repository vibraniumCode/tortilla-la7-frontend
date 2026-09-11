<script setup lang="ts">
import { computed } from "vue";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";

const { state } = useCart();
const { state: catalogo } = useCatalog();

function tortillasSeleccionadasNoDisponibles(puestoId: string) {
  const seleccionadas = new Set(state.items.map((item) => item.id));
  return catalogo.tortillas
    .filter(
      (tortilla) =>
        seleccionadas.has(tortilla._id) &&
        tortilla.puestosDisponibles?.length &&
        !tortilla.puestosDisponibles.includes(puestoId),
    )
    .map((tortilla) => tortilla.nombre);
}
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
        <p class="font-body text-sm font-medium text-crema">
          {{ puesto.nombre }}
        </p>
        <p class="font-body text-xs text-crema/50">{{ puesto.direccion }}</p>
        <p
          v-if="tortillasSeleccionadasNoDisponibles(puesto._id).length"
          class="mt-1 font-body text-[11px] text-amber-300/80"
        >
          Tus seleccionadas no disponibles aquí:
          {{ tortillasSeleccionadasNoDisponibles(puesto._id).join(", ") }}
        </p>
      </div>
      <div
        class="h-4 w-4 shrink-0 rounded-full border-2"
        :class="
          state.puestoId === puesto._id
            ? 'border-brasa bg-brasa'
            : 'border-crema/30'
        "
      />
    </button>
  </div>
</template>
