<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { api, type Novedad } from "@/api";
import ConfirmDialog from "./ConfirmDialog.vue";

const novedades = ref<Novedad[]>([]);
const cargando = ref(false);
const editando = ref<string | null>(null);
const guardando = ref(false);
const subiendoFondo = ref(false);
const error = ref("");
const confirmando = ref(false);
const novedadAEliminar = ref<string | null>(null);

const form = reactive({
  eyebrow: "",
  titulo: "",
  descripcion: "",
  cta: "Pedir ahora",
  precio: 0,
  fondoColor: "#0072f5",
  fondoImagen: "",
  colorTitulo: "#FAF6F1",
  orden: 1,
  activa: true,
});

async function cargarNovedades() {
  cargando.value = true;
  try {
    novedades.value = await api.getNovedadesTodas();
  } finally {
    cargando.value = false;
  }
}

onMounted(cargarNovedades);

function limpiar() {
  editando.value = null;
  form.eyebrow = "";
  form.titulo = "";
  form.descripcion = "";
  form.cta = "Pedir ahora";
  form.precio = 0;
  form.fondoColor = "#0072f5";
  form.fondoImagen = "";
  form.colorTitulo = "#FAF6F1";
  form.orden = novedades.value.length + 1;
  form.activa = true;
}

function editar(n: Novedad) {
  editando.value = n._id;
  form.eyebrow = n.eyebrow;
  form.titulo = n.titulo;
  form.descripcion = n.descripcion;
  form.cta = n.cta;
  form.precio = n.precio ?? 0;
  form.fondoImagen =
    n.fondo?.startsWith("http") || n.fondo?.startsWith("/") ? n.fondo : "";
  form.fondoColor = /^#[0-9a-f]{6}$/i.test(n.fondo ?? "")
    ? n.fondo!
    : "#0072f5";
  form.colorTitulo = n.colorTitulo || "#FAF6F1";
  form.orden = n.orden;
  form.activa = n.activa;
}

async function seleccionarFondo(event: Event) {
  const archivo = (event.target as HTMLInputElement).files?.[0];
  if (!archivo) return;
  subiendoFondo.value = true;
  error.value = "";
  try {
    const { url } = await api.subirImagen(archivo);
    form.fondoImagen = url;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "No se pudo subir el fondo";
  } finally {
    subiendoFondo.value = false;
  }
}

async function guardar() {
  if (!form.eyebrow.trim() || !form.titulo.trim() || !form.descripcion.trim()) {
    error.value = "Completá etiqueta, título y descripción";
    return;
  }
  error.value = "";
  guardando.value = true;
  try {
    const data = {
      eyebrow: form.eyebrow,
      titulo: form.titulo,
      descripcion: form.descripcion,
      cta: form.cta,
      precio: form.precio || undefined,
      fondo: form.fondoImagen || form.fondoColor,
      colorTitulo: form.colorTitulo,
      orden: form.orden,
      activa: form.activa,
    };
    if (editando.value) {
      await api.editarNovedad(editando.value, data);
    } else {
      await api.crearNovedad(data);
    }
    limpiar();
    await cargarNovedades();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "No se pudo guardar";
  } finally {
    guardando.value = false;
  }
}

async function borrar(id: string) {
  novedadAEliminar.value = id;
}

async function confirmarBorrado() {
  if (!novedadAEliminar.value) return;
  confirmando.value = true;
  try {
    await api.borrarNovedad(novedadAEliminar.value);
    novedadAEliminar.value = null;
    await cargarNovedades();
  } finally {
    confirmando.value = false;
  }
}
</script>

<template>
  <div class="grid min-w-0 gap-6 overflow-hidden md:grid-cols-2">
    <ConfirmDialog
      :abierto="!!novedadAEliminar"
      titulo="Eliminar novedad"
      mensaje="Esta novedad se quitará definitivamente del carousel. Esta acción no se puede deshacer."
      :confirmando="confirmando"
      @cancelar="novedadAEliminar = null"
      @confirmar="confirmarBorrado"
    />
    <div class="min-w-0 rounded-2xl bg-white/[0.04] p-4 sm:p-5">
      <h3 class="break-words font-display text-xl tracking-wide text-crema">
        {{ editando ? "Editar novedad" : "Nueva novedad (slide del carousel)" }}
      </h3>

      <div class="mt-4 flex min-w-0 flex-col gap-3">
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
        <div class="rounded-xl bg-white/[0.06] p-3">
          <p class="font-body text-xs text-crema/60">Fondo del carousel</p>
          <div class="mt-2 flex items-center gap-3">
            <input
              v-model="form.fondoColor"
              type="color"
              class="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
            />
            <span class="font-body text-xs text-crema/60">Elegir color</span>
          </div>
          <label
            class="mt-3 block cursor-pointer font-body text-xs text-crema/70"
          >
            {{
              subiendoFondo
                ? "Subiendo imagen..."
                : form.fondoImagen
                  ? "Cambiar imagen de fondo"
                  : "Agregar imagen de fondo"
            }}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="mt-2 block w-full max-w-full min-w-0 text-xs text-crema/50"
              :disabled="subiendoFondo"
              @change="seleccionarFondo"
            />
          </label>
          <button
            v-if="form.fondoImagen"
            type="button"
            class="mt-2 font-body text-xs text-red-300 underline"
            @click="form.fondoImagen = ''"
          >
            Usar solo el color
          </button>
        </div>
        <div
          class="flex items-center justify-between rounded-xl bg-white/[0.06] p-3"
        >
          <div>
            <p class="font-body text-xs text-crema/60">Color del título</p>
            <p class="mt-1 font-body text-[11px] text-crema/40">
              Elegí el color del título principal.
            </p>
          </div>
          <input
            v-model="form.colorTitulo"
            type="color"
            class="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
          />
        </div>
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
            {{
              guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Crear novedad"
            }}
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

    <div class="min-w-0 flex flex-col gap-2">
      <div v-if="cargando" class="font-body text-sm text-crema/40">
        Cargando...
      </div>
      <div
        v-for="n in novedades"
        :key="n._id"
        class="flex min-w-0 flex-col gap-3 rounded-xl bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
        :class="{ 'opacity-40': !n.activa }"
      >
        <div class="min-w-0 max-w-full">
          <p
            class="font-body text-[10px] uppercase tracking-widest text-crema/40"
          >
            {{ n.eyebrow }} · orden {{ n.orden }}
            {{ !n.activa ? "· oculta" : "" }}
          </p>
          <p class="break-words font-display text-lg tracking-wide text-crema">
            {{ n.titulo }}
          </p>
          <p class="break-words font-body text-xs text-crema/50">
            {{ n.descripcion }}
          </p>
        </div>
        <div class="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            class="min-w-0 flex-1 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:flex-none"
            @click="editar(n)"
          >
            Editar
          </button>
          <button
            class="min-w-0 flex-1 rounded-full border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-400 sm:flex-none"
            @click="borrar(n._id)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
