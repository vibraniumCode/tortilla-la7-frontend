<script setup lang="ts">
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";
import type { Puesto } from "@/api";

const { state: carrito } = useCart();
const { state: catalogo } = useCatalog();

function tortillasNoDisponibles(puesto: Puesto) {
  const idsPedido = new Set(carrito.items.map((item) => item.id));
  return catalogo.tortillas
    .filter(
      (tortilla) =>
        idsPedido.has(tortilla._id) &&
        tortilla.puestosDisponibles !== undefined &&
        !tortilla.puestosDisponibles.includes(puesto._id),
    )
    .map((tortilla) => tortilla.nombre);
}
</script>

<template>
  <div class="mt-3 flex flex-col gap-2">
    <button
      v-for="puesto in catalogo.puestos"
      :key="puesto._id"
      type="button"
      class="rounded-xl border px-4 py-3 text-left transition-colors"
      :class="carrito.puestoId === puesto._id ? 'border-brasa bg-brasa/10' : 'border-crema/15'"
      @click="carrito.puestoId = puesto._id"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="font-body text-sm font-medium text-crema">{{ puesto.nombre }}</p>
          <p class="font-body text-xs text-crema/50">{{ puesto.direccion }}</p>
        </div>
        <span
          class="h-4 w-4 shrink-0 rounded-full border-2"
          :class="carrito.puestoId === puesto._id ? 'border-brasa bg-brasa' : 'border-crema/30'"
        />
      </div>
      <p
        v-if="tortillasNoDisponibles(puesto).length"
        class="mt-2 font-body text-xs text-amber-300/90"
      >
        No disponible en este puesto: {{ tortillasNoDisponibles(puesto).join(", ") }}
      </p>
    </button>
    <p v-if="!catalogo.puestos.length" class="rounded-xl bg-white/4 p-4 font-body text-sm text-crema/50">
      No hay puestos de retiro disponibles por el momento.
    </p>
  </div>
</template>
