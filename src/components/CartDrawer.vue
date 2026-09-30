<script setup lang="ts">
import { useCart } from "@/store/cart";

const { state, setCantidad, subtotal, cantidadTotal, confirmarPedido } =
  useCart();

function cerrar() {
  state.abierto = false;
  if (state.confirmado) state.confirmado = false;
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="state.abierto"
      class="fixed inset-0 z-40 bg-black/60"
      @click="cerrar"
    />
  </Transition>

  <Transition name="slide-up">
    <div
      v-if="state.abierto"
      class="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-carbon px-5 pb-8 pt-4 md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(100%,28rem)] md:rounded-none md:border-l md:border-crema/10 md:px-7 md:pt-7"
    >
      <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-crema/20 md:hidden" />

      <div class="flex items-center justify-between">
        <h2 class="font-display text-2xl tracking-wide text-crema">
          Tu pedido
        </h2>
        <button class="font-body text-sm text-crema/50" @click="cerrar">
          Cerrar
        </button>
      </div>

      <p
        v-if="cantidadTotal === 0 && !state.confirmado"
        class="mt-6 font-body text-sm text-crema/50"
      >
        Todavía no agregaste tortillas.
      </p>

      <template v-else-if="!state.confirmado">
        <div class="mt-5">
          <label
            for="nombre-pedido"
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Pedido a nombre de
          </label>
          <input
            id="nombre-pedido"
            v-model="state.nombrePedido"
            type="text"
            autocomplete="name"
            placeholder="Nombre de quien hace el pedido"
            class="mt-2 w-full rounded-xl bg-white/6 px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          />
        </div>

        <div class="mt-4 flex flex-col gap-3">
          <div
            v-for="item in state.items"
            :key="item.id"
            class="flex items-center justify-between"
          >
            <div class="min-w-0">
              <p class="truncate font-body text-sm font-medium text-crema">
                {{ item.nombre }}
              </p>
              <p class="font-body text-xs text-crema/50">
                ${{ item.precio.toLocaleString("es-AR") }} c/u
              </p>
            </div>
            <div
              class="flex items-center gap-3 rounded-full bg-white/6 px-1 py-1"
            >
              <button
                class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-body text-crema"
                :aria-label="`Quitar una unidad de ${item.nombre}`"
                @click="setCantidad(item.id, item.cantidad - 1)"
              >
                −
              </button>
              <span class="w-4 text-center font-body text-sm text-crema">{{
                item.cantidad
              }}</span>
              <button
                class="flex h-6 w-6 items-center justify-center rounded-full bg-brasa font-body text-crema"
                :aria-label="`Agregar una unidad de ${item.nombre}`"
                @click="setCantidad(item.id, item.cantidad + 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h3
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Entrega
          </h3>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              class="rounded-xl border px-3 py-2.5 font-body text-sm font-medium transition-colors"
              :class="
                state.entrega === 'envio'
                  ? 'border-brasa bg-brasa text-crema'
                  : 'border-crema/15 text-crema/70'
              "
              @click="state.entrega = 'envio'"
            >
              Envío a domicilio
            </button>
            <button
              class="rounded-xl border px-3 py-2.5 font-body text-sm font-medium transition-colors"
              :class="
                state.entrega === 'retiro'
                  ? 'border-brasa bg-brasa text-crema'
                  : 'border-crema/15 text-crema/70'
              "
              @click="state.entrega = 'retiro'"
            >
              Retiro
            </button>
          </div>
          <input
            v-if="state.entrega === 'envio'"
            v-model="state.direccion"
            type="text"
            autocomplete="street-address"
            placeholder="Calle, número, piso/depto"
            class="mt-3 w-full rounded-xl bg-white/6 px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          />
        </div>

        <div class="mt-5">
          <label
            for="comentario-pedido"
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Comentario (opcional)
          </label>
          <textarea
            id="comentario-pedido"
            v-model="state.comentario"
            rows="2"
            placeholder="Algún detalle para el pedido"
            class="mt-2 w-full resize-none rounded-xl bg-white/6 px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          />
        </div>

        <div
          class="mt-6 flex items-center justify-between border-t border-crema/10 pt-4 font-display text-xl tracking-wide text-crema"
        >
          <span>Total de productos</span>
          <span>${{ subtotal.toLocaleString("es-AR") }}</span>
        </div>

        <p v-if="state.error" class="mt-3 font-body text-sm text-red-400">
          {{ state.error }}
        </p>

        <button
          class="mt-5 w-full rounded-full bg-brasa py-3.5 font-body text-sm font-bold text-crema shadow-lg active:scale-[0.98]"
          @click="confirmarPedido"
        >
          Enviar pedido por WhatsApp
        </button>
      </template>

      <div
        v-if="state.confirmado"
        class="mt-8 flex flex-col items-center gap-2 text-center"
      >
        <span class="font-display text-4xl text-queso">¡Pedido preparado!</span>
        <p class="font-body text-sm text-crema/60">
          Se abrió WhatsApp con el resumen. Revisalo y envíaselo a Tortillas La
          7 para confirmar el pedido.
        </p>
        <button
          class="mt-3 rounded-full bg-crema px-5 py-2.5 font-body text-sm font-bold text-carbon"
          @click="cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
