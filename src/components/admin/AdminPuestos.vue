<script setup lang="ts">
import { reactive, ref } from "vue";
import { api, type Puesto } from "@/api";
import { useCatalog } from "@/store/catalog";
import ConfirmDialog from "./ConfirmDialog.vue";

const { state: catalogo, cargar } = useCatalog();
const editando = ref<string | null>(null);
const guardando = ref(false);
const error = ref("");
const puestoAEliminar = ref<Puesto | null>(null);
const confirmando = ref(false);

const form = reactive({ nombre: "", direccion: "" });

function limpiar() {
  editando.value = null;
  form.nombre = "";
  form.direccion = "";
}

function editar(puesto: Puesto) {
  editando.value = puesto._id;
  form.nombre = puesto.nombre;
  form.direccion = puesto.direccion;
}

async function guardar() {
  if (!form.nombre.trim() || !form.direccion.trim()) {
    error.value = "Completá el nombre y la dirección del puesto";
    return;
  }

  error.value = "";
  guardando.value = true;
  try {
    const datos = { nombre: form.nombre.trim(), direccion: form.direccion.trim() };
    if (editando.value) {
      await api.editarPuesto(editando.value, datos);
    } else {
      await api.crearPuesto(datos);
    }
    limpiar();
    await cargar();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "No se pudo guardar el puesto";
  } finally {
    guardando.value = false;
  }
}

function solicitarBorrado(puesto: Puesto) {
  puestoAEliminar.value = puesto;
}

async function confirmarBorrado() {
  if (!puestoAEliminar.value) return;
  confirmando.value = true;
  error.value = "";
  try {
    await api.borrarPuesto(puestoAEliminar.value._id);
    puestoAEliminar.value = null;
    await cargar();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "No se pudo dar de baja el puesto";
  } finally {
    confirmando.value = false;
  }
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <ConfirmDialog
      :abierto="!!puestoAEliminar"
      titulo="Dar de baja el puesto"
      :mensaje="`${puestoAEliminar?.nombre ?? ''} dejará de estar disponible para nuevos retiros.`"
      :confirmando="confirmando"
      @cancelar="puestoAEliminar = null"
      @confirmar="confirmarBorrado"
    />

    <section class="rounded-2xl bg-white/4 p-5">
      <h3 class="font-display text-xl tracking-wide text-crema">
        {{ editando ? "Editar puesto" : "Nuevo puesto de retiro" }}
      </h3>
      <div class="mt-4 flex flex-col gap-3">
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Nombre (ej.: Berazategui)"
          class="rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model="form.direccion"
          type="text"
          placeholder="Dirección del puesto"
          class="rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>
        <div class="flex gap-2">
          <button
            class="flex-1 rounded-full bg-brasa py-2.5 font-body text-sm font-bold text-crema disabled:opacity-50"
            :disabled="guardando"
            @click="guardar"
          >
            {{ guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear puesto" }}
          </button>
          <button
            v-if="editando"
            class="rounded-full border border-crema/20 px-4 py-2.5 font-body text-sm text-crema/70"
            @click="limpiar"
          >Cancelar</button>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-2">
      <div
        v-for="puesto in catalogo.puestos"
        :key="puesto._id"
        class="flex flex-col gap-3 rounded-xl bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="truncate font-body text-sm font-medium text-crema">{{ puesto.nombre }}</p>
          <p class="truncate font-body text-xs text-crema/50">{{ puesto.direccion }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            class="flex-1 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:flex-none"
            @click="editar(puesto)"
          >Editar</button>
          <button
            class="flex-1 rounded-full border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-400 sm:flex-none"
            @click="solicitarBorrado(puesto)"
          >Dar de baja</button>
        </div>
      </div>
      <p v-if="!catalogo.puestos.length" class="rounded-xl bg-white/4 p-4 font-body text-sm text-crema/50">
        Todavía no hay puestos de retiro cargados.
      </p>
    </section>
  </div>
</template>
