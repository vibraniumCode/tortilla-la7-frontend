<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api, type Novedad } from '@/api'

const novedades = ref<Novedad[]>([])
const cargando = ref(false)
const editando = ref<string | null>(null)
const guardando = ref(false)
const error = ref('')

const form = reactive({
  eyebrow: '',
  titulo: '',
  descripcion: '',
  cta: 'Pedir ahora',
  precio: 0,
  orden: 1,
  activa: true,
})

async function cargarNovedades() {
  cargando.value = true
  try {
    novedades.value = await api.getNovedadesTodas()
  } finally {
    cargando.value = false
  }
}

onMounted(cargarNovedades)

function limpiar() {
  editando.value = null
  form.eyebrow = ''
  form.titulo = ''
  form.descripcion = ''
  form.cta = 'Pedir ahora'
  form.precio = 0
  form.orden = novedades.value.length + 1
  form.activa = true
}

function editar(n: Novedad) {
  editando.value = n._id
  form.eyebrow = n.eyebrow
  form.titulo = n.titulo
  form.descripcion = n.descripcion
  form.cta = n.cta
  form.precio = n.precio ?? 0
  form.orden = n.orden
  form.activa = n.activa
}

async function guardar() {
  if (!form.eyebrow.trim() || !form.titulo.trim() || !form.descripcion.trim()) {
    error.value = 'Completá etiqueta, título y descripción'
    return
  }
  error.value = ''
  guardando.value = true
  try {
    const data = {
      eyebrow: form.eyebrow,
      titulo: form.titulo,
      descripcion: form.descripcion,
      cta: form.cta,
      precio: form.precio || undefined,
      orden: form.orden,
      activa: form.activa,
    }
    if (editando.value) {
      await api.editarNovedad(editando.value, data)
    } else {
      await api.crearNovedad(data)
    }
    limpiar()
    await cargarNovedades()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo guardar'
  } finally {
    guardando.value = false
  }
}

async function borrar(id: string) {
  if (!confirm('¿Quitar esta novedad del carousel?')) return
  await api.borrarNovedad(id)
  await cargarNovedades()
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <div class="rounded-2xl bg-white/[0.04] p-5">
      <h3 class="font-display text-xl tracking-wide text-crema">
        {{ editando ? 'Editar novedad' : 'Nueva novedad (slide del carousel)' }}
      </h3>

      <div class="mt-4 flex flex-col gap-3">
        <input
          v-model="form.eyebrow"
          type="text"
          placeholder="Etiqueta (ej: Tortilla del día, Novedad)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model="form.titulo"
          type="text"
          placeholder="Título grande"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Descripción corta"
          class="resize-none rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model="form.cta"
          type="text"
          placeholder="Texto del botón (ej: Pedir ahora)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model.number="form.precio"
          type="number"
          min="0"
          placeholder="Precio (opcional, dejar 0 para no mostrar)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model.number="form.orden"
          type="number"
          min="1"
          placeholder="Orden (1, 2, 3...)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <label class="flex items-center gap-2 font-body text-sm text-crema/70">
          <input v-model="form.activa" type="checkbox" class="accent-brasa" />
          Visible en el carousel
        </label>

        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>

        <div class="flex gap-2">
          <button
            class="flex-1 rounded-full bg-brasa py-2.5 font-body text-sm font-bold text-crema disabled:opacity-50"
            :disabled="guardando"
            @click="guardar"
          >
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear novedad' }}
          </button>
          <button
            v-if="editando"
            class="rounded-full border border-crema/20 px-4 py-2.5 font-body text-sm text-crema/70"
            @click="limpiar"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div v-if="cargando" class="font-body text-sm text-crema/40">Cargando...</div>
      <div
        v-for="n in novedades"
        :key="n._id"
        class="flex flex-col gap-3 rounded-xl bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
        :class="{ 'opacity-40': !n.activa }"
      >
        <div class="min-w-0">
          <p class="font-body text-[10px] uppercase tracking-widest text-crema/40">
            {{ n.eyebrow }} · orden {{ n.orden }} {{ !n.activa ? '· oculta' : '' }}
          </p>
          <p class="truncate font-display text-lg tracking-wide text-crema">{{ n.titulo }}</p>
          <p class="truncate font-body text-xs text-crema/50">{{ n.descripcion }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            class="flex-1 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:flex-none"
            @click="editar(n)"
          >
            Editar
          </button>
          <button
            class="flex-1 rounded-full border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-400 sm:flex-none"
            @click="borrar(n._id)"
          >
            Ocultar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
