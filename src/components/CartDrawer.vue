<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";
import { useAuth } from "@/store/auth";
import PuestoSelector from "./PuestoSelector.vue";

const {
  state,
  setCantidad,
  subtotal,
  costoEnvio,
  total,
  vuelto,
  cantidadTotal,
  confirmarPedido,
} = useCart();

const { state: catalogo } = useCatalog();
const { state: auth } = useAuth();

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
      class="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-carbon px-5 pb-8 pt-4"
    >
      <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-crema/20" />

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

      <div
        v-else-if="!auth.usuario && !state.confirmado"
        class="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-white/[0.04] p-5 text-center"
      >
        <p class="font-body text-sm text-crema/70">
          Para hacer el pedido necesitás iniciar sesión o crear una cuenta. Es
          rápido y así también vas a poder ver el estado de tus pedidos.
        </p>
        <RouterLink
          to="/login"
          class="rounded-full bg-brasa px-5 py-2.5 font-body text-sm font-bold text-crema"
          @click="cerrar"
        >
          Iniciar sesión / Crear cuenta
        </RouterLink>
      </div>

      <template v-else-if="!state.confirmado">
        <!-- Items -->
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
              class="flex items-center gap-3 rounded-full bg-white/[0.06] px-1 py-1"
            >
              <button
                class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-body text-crema"
                @click="setCantidad(item.id, item.cantidad - 1)"
              >
                −
              </button>
              <span class="w-4 text-center font-body text-sm text-crema">{{
                item.cantidad
              }}</span>
              <button
                class="flex h-6 w-6 items-center justify-center rounded-full bg-brasa font-body text-crema"
                @click="setCantidad(item.id, item.cantidad + 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Entrega -->
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
              Retiro en puesto
            </button>
          </div>

          <template v-if="state.entrega === 'envio'">
            <p class="mt-2 font-body text-xs text-crema/40">
              Costo de envío: ${{ costoEnvio.toLocaleString("es-AR") }}
            </p>
            <input
              v-model="state.direccion"
              type="text"
              placeholder="Calle, número, piso/depto"
              class="mt-3 w-full rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
            />
          </template>

          <template v-else>
            <p class="mt-2 font-body text-xs text-crema/40">
              Elegí dónde retirar
            </p>
            <PuestoSelector />
          </template>
        </div>

        <!-- Comentario -->
        <div class="mt-5">
          <h3
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Comentario del pedido
          </h3>
          <textarea
            v-model="state.comentario"
            rows="2"
            placeholder="Ej: timbre roto, tocar bocina, sin cebolla, etc."
            class="mt-2 w-full resize-none rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          />
        </div>

        <!-- Pago -->
        <div class="mt-5">
          <h3
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Forma de pago
          </h3>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              class="rounded-xl border px-3 py-2.5 font-body text-sm font-medium transition-colors"
              :class="
                state.pago === 'efectivo'
                  ? 'border-brasa bg-brasa text-crema'
                  : 'border-crema/15 text-crema/70'
              "
              @click="state.pago = 'efectivo'"
            >
              Efectivo
            </button>
            <button
              class="rounded-xl border px-3 py-2.5 font-body text-sm font-medium transition-colors"
              :class="
                state.pago === 'transferencia'
                  ? 'border-brasa bg-brasa text-crema'
                  : 'border-crema/15 text-crema/70'
              "
              @click="state.pago = 'transferencia'"
            >
              Transferencia
            </button>
          </div>

          <!-- Transferencia: mostrar el alias -->
          <div
            v-if="state.pago === 'transferencia'"
            class="mt-3 rounded-xl bg-white/[0.06] p-4"
          >
            <p class="font-body text-xs text-crema/50">
              Transferí a este alias
            </p>
            <p class="mt-1 font-display text-xl tracking-wide text-queso">
              {{
                catalogo.configuracion?.aliasTransferencia ||
                "Todavía no cargado"
              }}
            </p>
            <p
              v-if="catalogo.configuracion?.titular"
              class="mt-1 font-body text-xs text-crema/40"
            >
              Titular: {{ catalogo.configuracion.titular }}
            </p>
          </div>

          <!-- Efectivo: preguntar con cuánto paga, para saber el vuelto -->
          <div v-if="state.pago === 'efectivo'" class="mt-3">
            <p class="font-body text-xs text-crema/50">
              ¿Con cuánto vas a pagar?
            </p>
            <div class="mt-2 flex gap-2">
              <button
                class="rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors"
                :class="
                  state.montoEfectivo === null
                    ? 'border-brasa bg-brasa text-crema'
                    : 'border-crema/15 text-crema/70'
                "
                @click="state.montoEfectivo = null"
              >
                Pago justo
              </button>
              <input
                :value="state.montoEfectivo ?? ''"
                type="number"
                min="0"
                placeholder="Otro monto"
                class="flex-1 rounded-full bg-white/[0.06] px-4 py-1.5 font-body text-xs text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
                @input="
                  state.montoEfectivo =
                    ($event.target as HTMLInputElement).valueAsNumber || null
                "
              />
            </div>
            <p
              v-if="vuelto !== null"
              class="mt-2 font-body text-xs text-crema/50"
            >
              Vuelto:
              <span class="text-queso"
                >${{ vuelto.toLocaleString("es-AR") }}</span
              >
            </p>
          </div>
        </div>

        <!-- Resumen -->
        <div class="mt-6 flex flex-col gap-1 border-t border-crema/10 pt-4">
          <div class="flex justify-between font-body text-sm text-crema/60">
            <span>Subtotal</span>
            <span>${{ subtotal.toLocaleString("es-AR") }}</span>
          </div>
          <div class="flex justify-between font-body text-sm text-crema/60">
            <span>Envío</span>
            <span>${{ costoEnvio.toLocaleString("es-AR") }}</span>
          </div>
          <div
            class="mt-1 flex justify-between font-display text-xl tracking-wide text-crema"
          >
            <span>Total</span>
            <span>${{ total.toLocaleString("es-AR") }}</span>
          </div>
        </div>

        <p v-if="state.error" class="mt-3 font-body text-sm text-red-400">
          {{ state.error }}
        </p>

        <button
          class="mt-5 w-full rounded-full bg-brasa py-3.5 font-body text-sm font-bold text-crema shadow-lg active:scale-[0.98] disabled:opacity-50"
          :disabled="state.enviando"
          @click="confirmarPedido"
        >
          {{ state.enviando ? "Enviando..." : "Confirmar pedido" }}
        </button>
      </template>

      <!-- Pantalla de éxito -->
      <div
        v-if="state.confirmado"
        class="mt-8 flex flex-col items-center gap-2 text-center"
      >
        <span class="font-display text-4xl text-queso">¡Listo!</span>
        <p class="font-body text-sm text-crema/60">
          Tu pedido fue enviado. En breve nos contactamos para confirmarlo.
        </p>

        <template v-if="state.pago === 'transferencia'">
          <div class="mt-2 rounded-xl bg-white/[0.06] p-4">
            <p class="font-body text-xs text-crema/50">
              No te olvides de transferir a
            </p>
            <p class="mt-1 font-display text-lg tracking-wide text-queso">
              {{ catalogo.configuracion?.aliasTransferencia }}
            </p>
          </div>
          <p class="mt-3 font-body text-xs text-crema/50">
            Después de cerrar este aviso podés informar la transferencia desde
            “Mis pedidos”, adjuntando el comprobante.
          </p>
        </template>

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
