<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCatalog } from '@/store/catalog'
import { useAuth } from '@/store/auth'
import { api } from '@/api'
import AdminTortillas from '@/components/admin/AdminTortillas.vue'
import AdminPuestos from '@/components/admin/AdminPuestos.vue'
import AdminZonas from '@/components/admin/AdminZonas.vue'
import AdminNovedades from '@/components/admin/AdminNovedades.vue'
import AdminPedidos from '@/components/admin/AdminPedidos.vue'
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.vue'
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.vue'

type Tab = 'tortillas' | 'puestos' | 'zonas' | 'novedades' | 'pedidos' | 'estadisticas' | 'pagos'

const tab = ref<Tab>('pedidos')
const { cargar } = useCatalog()
const { state: auth, logout } = useAuth()
const router = useRouter()

const pedidosPendientes = ref(0)
let intervalo: ReturnType<typeof setInterval> | null = null
let primerCheo = true

function sonarAviso() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.connect(ctx.destination)
    ;[880, 1046].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.15)
    })
  } catch {
    // si el navegador bloquea el audio (falta interacción previa), no pasa nada grave
  }
}

async function chequearPedidosNuevos() {
  try {
    const pedidos = await api.getPedidos()
    const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length
    if (!primerCheo && pendientes > pedidosPendientes.value) {
      sonarAviso()
    }
    pedidosPendientes.value = pendientes
    primerCheo = false
  } catch {
    // si falla el chequeo, se reintenta en el próximo intervalo
  }
}

onMounted(() => {
  cargar()
  chequearPedidosNuevos()
  intervalo = setInterval(chequearPedidosNuevos, 20000)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

function salir() {
  logout()
  router.push('/admin/login')
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'tortillas', label: 'Tortillas' },
  { id: 'puestos', label: 'Puestos de retiro' },
  { id: 'zonas', label: 'Zonas de envío' },
  { id: 'novedades', label: 'Novedades' },
  { id: 'pagos', label: 'Pagos' },
]
</script>

<template>
  <div class="min-h-screen bg-carbon px-4 py-6 sm:px-6 sm:py-8">
    <header class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl tracking-wide text-crema sm:text-3xl">
          Panel <span class="text-brasa">Tortillas al Paso</span>
        </h1>
        <p class="mt-1 font-body text-xs text-crema/50 sm:text-sm">
          {{ auth.usuario?.nombre }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/"
          class="rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:px-4 sm:py-2 sm:text-sm"
        >
          Ver tienda
        </RouterLink>
        <button
          class="rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:px-4 sm:py-2 sm:text-sm"
          @click="salir"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <nav class="mb-6 flex flex-wrap gap-2 sm:mb-8">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="relative shrink-0 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm"
        :class="
          tab === t.id
            ? 'border-brasa bg-brasa text-crema'
            : 'border-crema/15 text-crema/70'
        "
        @click="tab = t.id"
      >
        {{ t.label }}
        <span
          v-if="t.id === 'pedidos' && pedidosPendientes > 0"
          class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-queso px-1 font-body text-[10px] font-bold text-carbon"
        >
          {{ pedidosPendientes }}
        </span>
      </button>
    </nav>

    <AdminPedidos v-if="tab === 'pedidos'" />
    <AdminEstadisticas v-else-if="tab === 'estadisticas'" />
    <AdminTortillas v-else-if="tab === 'tortillas'" />
    <AdminPuestos v-else-if="tab === 'puestos'" />
    <AdminZonas v-else-if="tab === 'zonas'" />
    <AdminNovedades v-else-if="tab === 'novedades'" />
    <AdminConfiguracion v-else-if="tab === 'pagos'" />
  </div>
</template>
