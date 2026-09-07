<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api, type Estadisticas } from '@/api'

const stats = ref<Estadisticas | null>(null)
const cargando = ref(false)

async function cargar() {
  cargando.value = true
  try {
    stats.value = await api.getEstadisticas()
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

const maxDia = computed(() => {
  if (!stats.value) return 1
  return Math.max(1, ...stats.value.porDia.map((d) => d.total))
})

function diaCorto(fecha: string) {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
}

function money(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}
</script>

<template>
  <div v-if="cargando" class="font-body text-sm text-crema/40">Cargando...</div>

  <div v-else-if="stats" class="flex flex-col gap-6">
    <!-- Tarjetas de ingresos -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-2xl bg-white/[0.04] p-4">
        <p class="font-body text-xs uppercase tracking-widest text-crema/40">Hoy</p>
        <p class="mt-1 font-display text-2xl tracking-wide text-queso">{{ money(stats.hoy) }}</p>
      </div>
      <div class="rounded-2xl bg-white/[0.04] p-4">
        <p class="font-body text-xs uppercase tracking-widest text-crema/40">Últimos 7 días</p>
        <p class="mt-1 font-display text-2xl tracking-wide text-queso">{{ money(stats.semana) }}</p>
      </div>
      <div class="rounded-2xl bg-white/[0.04] p-4">
        <p class="font-body text-xs uppercase tracking-widest text-crema/40">Últimos 30 días</p>
        <p class="mt-1 font-display text-2xl tracking-wide text-queso">{{ money(stats.mes) }}</p>
      </div>
    </div>

    <!-- Gráfico simple por día -->
    <div class="rounded-2xl bg-white/[0.04] p-4">
      <p class="font-body text-xs uppercase tracking-widest text-crema/40">Últimos 14 días</p>
      <div class="mt-4 flex items-end gap-1.5" style="height: 120px">
        <div
          v-for="d in stats.porDia"
          :key="d.fecha"
          class="group relative flex-1 rounded-t bg-brasa transition-colors hover:bg-queso"
          :style="{ height: `${Math.max(4, (d.total / maxDia) * 100)}%` }"
        >
          <span
            class="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-carbon px-1.5 py-0.5 font-body text-[10px] text-crema opacity-0 group-hover:opacity-100"
          >
            {{ money(d.total) }}
          </span>
        </div>
      </div>
      <div class="mt-1 flex gap-1.5">
        <span
          v-for="d in stats.porDia"
          :key="d.fecha"
          class="flex-1 text-center font-body text-[9px] uppercase text-crema/30"
        >
          {{ diaCorto(d.fecha) }}
        </span>
      </div>
    </div>

    <!-- Envío vs retiro -->
    <div class="rounded-2xl bg-white/[0.04] p-4">
      <p class="font-body text-xs uppercase tracking-widest text-crema/40">
        Envío vs. retiro ({{ stats.totalPedidos }} pedidos)
      </p>
      <div class="mt-3 flex gap-4 font-body text-sm text-crema/80">
        <span>🛵 Envío: {{ stats.entregaVsRetiro.envio }}</span>
        <span>🏠 Retiro: {{ stats.entregaVsRetiro.retiro }}</span>
      </div>
    </div>

    <!-- Por zona -->
    <div class="rounded-2xl bg-white/[0.04] p-4">
      <p class="font-body text-xs uppercase tracking-widest text-crema/40">Ventas por zona</p>
      <div class="mt-3 flex flex-col gap-2">
        <div
          v-for="z in stats.porZona"
          :key="z.nombre"
          class="flex items-center justify-between font-body text-sm"
        >
          <span class="text-crema/80">{{ z.nombre }} <span class="text-crema/40">· {{ z.pedidos }} pedidos</span></span>
          <span class="font-display text-queso">{{ money(z.total) }}</span>
        </div>
        <p v-if="!stats.porZona.length" class="font-body text-xs text-crema/40">Sin ventas por envío todavía.</p>
      </div>
    </div>

    <!-- Por puesto -->
    <div class="rounded-2xl bg-white/[0.04] p-4">
      <p class="font-body text-xs uppercase tracking-widest text-crema/40">Ventas por puesto (retiro)</p>
      <div class="mt-3 flex flex-col gap-2">
        <div
          v-for="p in stats.porPuesto"
          :key="p.nombre"
          class="flex items-center justify-between font-body text-sm"
        >
          <span class="text-crema/80">{{ p.nombre }} <span class="text-crema/40">· {{ p.pedidos }} pedidos</span></span>
          <span class="font-display text-queso">{{ money(p.total) }}</span>
        </div>
        <p v-if="!stats.porPuesto.length" class="font-body text-xs text-crema/40">Sin retiros todavía.</p>
      </div>
    </div>

    <!-- Por tortilla -->
    <div class="rounded-2xl bg-white/[0.04] p-4">
      <p class="font-body text-xs uppercase tracking-widest text-crema/40">Más vendidas</p>
      <div class="mt-3 flex flex-col gap-2">
        <div
          v-for="t in stats.porTortilla"
          :key="t.nombre"
          class="flex items-center justify-between font-body text-sm"
        >
          <span class="text-crema/80">{{ t.nombre }}</span>
          <span class="text-crema/60">{{ t.cantidad }} un. · <span class="font-display text-queso">{{ money(t.total) }}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>
