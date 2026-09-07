<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { api, type Pedido, urlImagen } from "@/api";

const pedidos = ref<Pedido[]>([]);
const cargando = ref(true);
const informandoId = ref("");
const titular = ref("");
const comprobante = ref<File | null>(null);
const enviandoTransferencia = ref(false);
const errorTransferencia = ref("");
const avisoTransferencia = ref("");
const avisoTransferenciaId = ref("");

const pasos: { id: Pedido["estado"]; label: string }[] = [
  { id: "pendiente", label: "Recibido" },
  { id: "confirmado", label: "Confirmado" },
  { id: "en_camino", label: "En camino" },
  { id: "entregado", label: "Entregado" },
];

function pasoActual(estado: Pedido["estado"]) {
  return pasos.findIndex((p) => p.id === estado);
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function abrirFormulario(pedido: Pedido) {
  informandoId.value = pedido._id;
  titular.value = pedido.transferenciaTitular ?? "";
  comprobante.value = null;
  errorTransferencia.value = "";
  avisoTransferencia.value = "";
}

function seleccionarComprobante(event: Event) {
  comprobante.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

function abrirComprobante(event: MouseEvent, ruta: string) {
  event.preventDefault();
  const ventana = window.open(urlImagen(ruta), "_blank", "noopener,noreferrer");
  if (!ventana) window.location.assign(urlImagen(ruta));
}

async function informarTransferencia(pedido: Pedido) {
  errorTransferencia.value = "";
  avisoTransferencia.value = "";
  if (!titular.value.trim()) {
    errorTransferencia.value =
      "Indicá a nombre de quién se hizo la transferencia.";
    return;
  }
  if (!comprobante.value && !pedido.comprobanteTransferencia) {
    errorTransferencia.value = "Adjuntá una imagen o PDF del comprobante.";
    return;
  }

  enviandoTransferencia.value = true;
  try {
    const actualizado = await api.informarTransferencia(
      pedido._id,
      titular.value,
      comprobante.value ?? undefined,
    );
    pedido.transferenciaInformada = actualizado.transferenciaInformada;
    pedido.transferenciaTitular = actualizado.transferenciaTitular;
    pedido.comprobanteTransferencia = actualizado.comprobanteTransferencia;
    avisoTransferencia.value =
      "Transferencia informada. Queda pendiente de confirmación.";
    avisoTransferenciaId.value = pedido._id;
    informandoId.value = "";
  } catch (err) {
    errorTransferencia.value =
      err instanceof Error
        ? err.message
        : "No se pudo informar la transferencia.";
  } finally {
    enviandoTransferencia.value = false;
  }
}

onMounted(async () => {
  try {
    pedidos.value = await api.getMisPedidos();
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-carbon px-4 pb-10 pt-6">
    <header class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl tracking-wide text-crema">
        Mis pedidos
      </h1>
      <RouterLink to="/" class="font-body text-xs text-crema/60 underline"
        >Volver</RouterLink
      >
    </header>
    <div v-if="cargando" class="font-body text-sm text-crema/40">
      Cargando...
    </div>
    <div v-else-if="!pedidos.length" class="font-body text-sm text-crema/40">
      Todavía no hiciste ningún pedido.
    </div>
    <div class="flex flex-col gap-4">
      <div v-for="p in pedidos" :key="p._id" class="rounded-2xl bg-white/4 p-4">
        <div class="flex items-center justify-between">
          <p class="font-body text-xs text-crema/40">
            {{ fecha(p.createdAt) }}
          </p>
          <span class="font-display text-lg tracking-wide text-queso"
            >${{ p.total.toLocaleString("es-AR") }}</span
          >
        </div>
        <ul class="mt-2 flex flex-col gap-0.5">
          <li
            v-for="item in p.items"
            :key="item.tortilla"
            class="font-body text-sm text-crema/70"
          >
            {{ item.cantidad }}x {{ item.nombre }}
          </li>
        </ul>
        <div
          v-if="p.estado === 'cancelado'"
          class="mt-4 rounded-xl bg-red-500/10 px-3 py-2 font-body text-sm text-red-400"
        >
          Pedido cancelado
        </div>
        <div v-else class="mt-6">
          <div class="relative h-1.5 rounded-full bg-white/10">
            <div
              class="h-full rounded-full bg-brasa transition-all duration-700"
              :style="{
                width: `${(pasoActual(p.estado) / (pasos.length - 1)) * 100}%`,
              }"
            />
            <span
              class="absolute -top-3 -translate-x-1/2 text-lg transition-all duration-700"
              :class="{ 'moto-en-camino': p.estado === 'en_camino' }"
              :style="{
                left: `${(pasoActual(p.estado) / (pasos.length - 1)) * 100}%`,
              }"
              >🛵</span
            >
          </div>
          <div class="mt-3 flex justify-between">
            <span
              v-for="(paso, i) in pasos"
              :key="paso.id"
              class="font-body text-[10px] uppercase tracking-wide"
              :class="
                i <= pasoActual(p.estado) ? 'text-queso' : 'text-crema/30'
              "
              >{{ paso.label }}</span
            >
          </div>
        </div>
        <p
          v-if="
            p.pago === 'transferencia' &&
            !p.pagoConfirmado &&
            !p.transferenciaInformada
          "
          class="mt-3 rounded-lg bg-yellow-500/10 px-3 py-1.5 font-body text-xs text-yellow-400"
        >
          Todavía no informaste la transferencia
        </p>
        <div
          v-if="p.pago === 'transferencia' && !p.pagoConfirmado"
          class="mt-3 rounded-xl bg-white/4 p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-body text-xs text-crema/60">
              {{
                p.transferenciaInformada
                  ? "Transferencia informada"
                  : "¿Ya transferiste?"
              }}
            </p>
            <button
              class="font-body text-xs text-queso underline"
              @click="abrirFormulario(p)"
            >
              {{
                p.transferenciaInformada
                  ? "Actualizar"
                  : "Informar transferencia"
              }}
            </button>
          </div>
          <div v-if="informandoId === p._id" class="mt-3 flex flex-col gap-2">
            <input
              v-model="titular"
              type="text"
              placeholder="Titular de la transferencia"
              class="w-full rounded-lg bg-white/6 px-3 py-2 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              class="font-body text-xs text-crema/60 file:mr-2 file:rounded-full file:border-0 file:bg-brasa file:px-3 file:py-1.5 file:font-body file:text-xs file:font-bold file:text-crema"
              @change="seleccionarComprobante"
            />
            <p
              v-if="p.comprobanteTransferencia"
              class="font-body text-xs text-crema/40"
            >
              Ya hay un comprobante cargado. Adjuntá otro solo si querés
              reemplazarlo.
            </p>
            <p v-if="errorTransferencia" class="font-body text-xs text-red-400">
              {{ errorTransferencia }}
            </p>
            <button
              class="rounded-full bg-brasa px-4 py-2 font-body text-xs font-bold text-crema disabled:opacity-50"
              :disabled="enviandoTransferencia"
              @click="informarTransferencia(p)"
            >
              {{ enviandoTransferencia ? "Enviando..." : "Enviar comprobante" }}
            </button>
          </div>
          <div
            v-if="p.transferenciaInformada"
            class="mt-2 font-body text-xs text-yellow-400"
          >
            Pendiente de confirmación del local · Titular:
            {{ p.transferenciaTitular }}
            <a
              v-if="p.comprobanteTransferencia"
              :href="urlImagen(p.comprobanteTransferencia)"
              target="_blank"
              rel="noreferrer"
              class="ml-1 text-queso underline"
              @click="abrirComprobante($event, p.comprobanteTransferencia)"
              >Ver comprobante</a
            >
          </div>
        </div>
        <p
          v-if="avisoTransferencia && avisoTransferenciaId === p._id"
          class="mt-2 font-body text-xs text-green-400"
        >
          {{ avisoTransferencia }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moto-en-camino {
  animation: vaiven 1s ease-in-out infinite;
}
@keyframes vaiven {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-4px);
  }
}
</style>
