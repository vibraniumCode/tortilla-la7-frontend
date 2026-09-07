<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api, type Pedido, urlImagen } from "@/api";

const pedidos = ref<Pedido[]>([]);
const cargando = ref(false);
const filtro = ref<"todos" | Pedido["estado"]>("todos");
const CLAVE_PEDIDOS_OCULTOS = "admin-pedidos-ocultos";
const pedidosOcultos = ref<string[]>(cargarPedidosOcultos());

function cargarPedidosOcultos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PEDIDOS_OCULTOS) ?? "[]");
  } catch {
    return [];
  }
}

const estados: { id: Pedido["estado"]; label: string }[] = [
  { id: "pendiente", label: "Pendiente" },
  { id: "confirmado", label: "Confirmado" },
  { id: "en_camino", label: "En camino" },
  { id: "entregado", label: "Entregado" },
  { id: "cancelado", label: "Cancelado" },
];

async function cargarPedidos() {
  cargando.value = true;
  try {
    pedidos.value = await api.getPedidos();
  } finally {
    cargando.value = false;
  }
}

onMounted(cargarPedidos);
defineExpose({ cargarPedidos });

async function cambiarEstado(p: Pedido, estado: Pedido["estado"]) {
  await api.cambiarEstadoPedido(p._id, estado);
  p.estado = estado;
}

async function confirmarPago(p: Pedido) {
  await api.confirmarPago(p._id);
  p.pagoConfirmado = true;
}

function limpiarFinalizados() {
  const finalizados = pedidos.value
    .filter(
      (pedido) =>
        pedido.estado === "entregado" || pedido.estado === "cancelado",
    )
    .map((pedido) => pedido._id);
  if (!finalizados.length) return;

  pedidosOcultos.value = [
    ...new Set([...pedidosOcultos.value, ...finalizados]),
  ];
  pedidos.value = pedidos.value.filter(
    (pedido) => !finalizados.includes(pedido._id),
  );
  localStorage.setItem(
    CLAVE_PEDIDOS_OCULTOS,
    JSON.stringify(pedidosOcultos.value),
  );
}

function abrirComprobante(event: MouseEvent, ruta: string) {
  event.preventDefault();
  const ventana = window.open(urlImagen(ruta), "_blank", "noopener,noreferrer");
  if (!ventana) window.location.assign(urlImagen(ruta));
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pedidosFiltrados = () =>
  (filtro.value === "todos"
    ? pedidos.value
    : pedidos.value.filter((p) => p.estado === filtro.value)
  ).filter((pedido) => !pedidosOcultos.value.includes(pedido._id));
</script>

<template>
  <div>
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap gap-2">
        <button
          class="shrink-0 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors"
          :class="
            filtro === 'todos'
              ? 'border-brasa bg-brasa text-crema'
              : 'border-crema/15 text-crema/70'
          "
          @click="filtro = 'todos'"
        >
          Todos
        </button>
        <button
          v-for="e in estados"
          :key="e.id"
          class="shrink-0 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors"
          :class="
            filtro === e.id
              ? 'border-brasa bg-brasa text-crema'
              : 'border-crema/15 text-crema/70'
          "
          @click="filtro = e.id"
        >
          {{ e.label }}
        </button>
      </div>
      <button
        class="shrink-0 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70"
        @click="cargarPedidos"
      >
        Actualizar
      </button>
      <button
        v-if="
          pedidos.some((pedido) =>
            ['entregado', 'cancelado'].includes(pedido.estado),
          )
        "
        class="shrink-0 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70"
        @click="limpiarFinalizados"
      >
        Limpiar finalizados
      </button>
    </div>

    <div v-if="cargando" class="font-body text-sm text-crema/40">
      Cargando...
    </div>
    <div
      v-else-if="pedidosFiltrados().length === 0"
      class="font-body text-sm text-crema/40"
    >
      No hay pedidos acá.
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="p in pedidosFiltrados()"
        :key="p._id"
        class="rounded-xl bg-white/4 p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="font-body text-xs text-crema/40">
              {{ fechaCorta(p.createdAt) }}
            </p>
            <p class="font-body text-sm text-crema/70">
              {{
                p.entrega === "envio"
                  ? `Envío · ${p.zona?.nombre ?? "-"}`
                  : `Retiro · ${p.puesto?.nombre ?? "-"}`
              }}
            </p>
          </div>
          <span class="font-display text-lg tracking-wide text-queso">
            ${{ p.total.toLocaleString("es-AR") }}
          </span>
        </div>

        <!-- Items -->
        <ul class="mt-3 flex flex-col gap-1">
          <li
            v-for="item in p.items"
            :key="item.tortilla"
            class="flex justify-between font-body text-sm text-crema/80"
          >
            <span>{{ item.cantidad }}x {{ item.nombre }}</span>
            <span
              >${{
                (item.precio * item.cantidad).toLocaleString("es-AR")
              }}</span
            >
          </li>
        </ul>

        <p v-if="p.direccion" class="mt-2 font-body text-xs text-crema/50">
          📍 {{ p.direccion }}
        </p>
        <p v-if="p.comentario" class="mt-1 font-body text-xs text-crema/50">
          💬 {{ p.comentario }}
        </p>

        <!-- Pago -->
        <div class="mt-2 flex flex-wrap items-center gap-2 font-body text-xs">
          <span class="rounded-full bg-white/6 px-2 py-1 text-crema/70">
            {{ p.pago === "efectivo" ? "Efectivo" : "Transferencia" }}
          </span>
          <span
            v-if="p.pago === 'efectivo' && p.montoEfectivo"
            class="text-crema/50"
          >
            Paga con ${{ p.montoEfectivo.toLocaleString("es-AR") }} · vuelto ${{
              (p.montoEfectivo - p.total).toLocaleString("es-AR")
            }}
          </span>
          <span
            v-if="p.pago === 'transferencia'"
            class="rounded-full px-2 py-1"
            :class="
              p.pagoConfirmado
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            "
          >
            {{
              p.pagoConfirmado ? "Pago confirmado" : "Esperando confirmación"
            }}
          </span>
        </div>

        <div
          v-if="p.pago === 'transferencia' && p.transferenciaInformada"
          class="mt-3 rounded-lg bg-yellow-500/10 p-3"
        >
          <p class="font-body text-xs text-yellow-300">
            Transferencia informada por {{ p.transferenciaTitular }}
          </p>
          <a
            v-if="p.comprobanteTransferencia"
            :href="urlImagen(p.comprobanteTransferencia)"
            target="_blank"
            rel="noreferrer"
            class="mt-1 inline-block font-body text-xs text-queso underline"
            @click="abrirComprobante($event, p.comprobanteTransferencia)"
          >
            Abrir comprobante
          </a>
          <button
            v-if="!p.pagoConfirmado"
            class="mt-2 block rounded-full bg-green-600 px-3 py-1.5 font-body text-xs font-bold text-crema"
            @click="confirmarPago(p)"
          >
            Confirmar que llegó
          </button>
        </div>

        <!-- Estado -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="e in estados"
            :key="e.id"
            class="rounded-full border px-3 py-1 font-body text-[11px] font-medium transition-colors"
            :class="
              p.estado === e.id
                ? 'border-brasa bg-brasa text-crema'
                : 'border-crema/15 text-crema/60'
            "
            @click="cambiarEstado(p, e.id)"
          >
            {{ e.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
