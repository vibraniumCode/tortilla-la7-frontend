<script setup lang="ts">
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";

const { state } = useCart();
const { state: catalogo } = useCatalog();
</script>

<template>
  <div>
    <h3
      class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
    >
      Zona de envío
    </h3>
    <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <button
        v-for="zona in catalogo.zonas"
        :key="zona._id"
        class="min-w-0 rounded-xl border px-3 py-2 font-body text-sm font-medium leading-tight transition-colors"
        :class="
          state.zonaId === zona._id
            ? 'border-brasa bg-brasa text-crema'
            : 'border-crema/15 text-crema/70'
        "
        @click="state.zonaId = zona._id"
      >
        {{ zona.nombre }}
      </button>
    </div>
  </div>
</template>
