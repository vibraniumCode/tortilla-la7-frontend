<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api, type Zona } from '@/api'
import { useCatalog } from '@/store/catalog'

const { state: catalogo, cargar } = useCatalog()

const editando = ref<string | null>(null)
const guardando = ref(false)
const error = ref('')

const form = reactive({
  nombre: '',
  envio: 0,
})

function limpiar() {
  editando.value = null
  form.nombre = ''
  form.envio = 0
}

function editar(z: Zona) {
  editando.value = z._id
  form.nombre = z.nombre
  form.envio = z.envio
}

async function guardar() {
  if (!form.nombre.trim() || form.envio < 0) {
    error.value = 'Completá nombre y un costo de envío válido'
    return
  }
  error.value = ''
  guardando.value = true
  try {
    if (editando.value) {
      await api.editarZona(editando.value, { ...form })
    } else {
      await api.crearZona({ ...form })
    }
    limpiar()
    await cargar()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo guardar'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <div class="rounded-2xl bg-white/[0.04] p-5">
      <h3 class="font-display text-xl tracking-wide text-crema">
        {{ editando ? 'Editar zona' : 'Nueva zona de envío' }}
      </h3>

      <div class="mt-4 flex flex-col gap-3">
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Nombre (ej: Quilmes)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm text-crema/40">$</span>
          <input
            v-model.number="form.envio"
            type="number"
            min="0"
            placeholder="Costo de envío"
            class="w-full rounded-xl bg-white/[0.06] py-2.5 pl-8 pr-4 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          />
        </div>

        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>

        <div class="flex gap-2">
          <button
            class="flex-1 rounded-full bg-brasa py-2.5 font-body text-sm font-bold text-crema disabled:opacity-50"
            :disabled="guardando"
            @click="guardar"
          >
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear zona' }}
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
      <div
        v-for="z in catalogo.zonas"
        :key="z._id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/[0.04] p-4"
      >
        <p class="min-w-0 truncate font-body text-sm font-medium text-crema">{{ z.nombre }}</p>
        <div class="flex shrink-0 items-center gap-3">
          <span class="font-display text-sm text-queso">${{ z.envio.toLocaleString('es-AR') }}</span>
          <button
            class="rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70"
            @click="editar(z)"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
