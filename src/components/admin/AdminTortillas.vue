<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { api, urlImagen, type Puesto, type Tortilla } from "@/api";
import { useCatalog } from "@/store/catalog";

const { cargar } = useCatalog();
const tortillasAdmin = ref<Tortilla[]>([]);
const puestos = ref<Puesto[]>([]);
const cambiandoPuesto = ref("");

const editando = ref<string | null>(null);
const guardando = ref(false);
const subiendoImagen = ref(false);
const error = ref("");

const form = reactive({
  nombre: "",
  descripcion: "",
  precio: 0,
  nueva: false,
  imagen: "",
});

const previewUrl = ref("");

async function cargarTortillasAdmin() {
  const [tortillas, puestosCargados] = await Promise.all([
    api.getTortillasTodas(),
    api.getPuestos(),
  ]);
  tortillasAdmin.value = tortillas;
  puestos.value = puestosCargados;
}

onMounted(cargarTortillasAdmin);

function limpiar() {
  editando.value = null;
  form.nombre = "";
  form.descripcion = "";
  form.precio = 0;
  form.nueva = false;
  form.imagen = "";
  previewUrl.value = "";
}

function editar(t: Tortilla) {
  editando.value = t._id;
  form.nombre = t.nombre;
  form.descripcion = t.descripcion;
  form.precio = t.precio;
  form.nueva = !!t.nueva;
  form.imagen = t.imagen;
  previewUrl.value = urlImagen(t.imagen);
}

async function onArchivoSeleccionado(e: Event) {
  const input = e.target as HTMLInputElement;
  const archivo = input.files?.[0];
  if (!archivo) return;

  error.value = "";
  subiendoImagen.value = true;
  try {
    const { url } = await api.subirImagen(archivo);
    form.imagen = url;
    previewUrl.value = urlImagen(url);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "No se pudo subir la imagen";
  } finally {
    subiendoImagen.value = false;
  }
}

async function guardar() {
  if (!form.nombre.trim() || !form.descripcion.trim() || form.precio <= 0) {
    error.value = "Completá nombre, descripción y un precio válido";
    return;
  }
  if (!form.imagen) {
    error.value = "Subí una imagen para la tortilla";
    return;
  }
  error.value = "";
  guardando.value = true;
  try {
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      nueva: form.nueva,
      imagen: form.imagen,
    };
    if (editando.value) {
      await api.editarTortilla(editando.value, data);
    } else {
      await api.crearTortilla(data);
    }
    limpiar();
    await Promise.all([cargar(), cargarTortillasAdmin()]);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "No se pudo guardar";
  } finally {
    guardando.value = false;
  }
}

async function borrar(id: string) {
  if (!confirm("¿Dar de baja esta tortilla?")) return;
  await api.borrarTortilla(id);
  await Promise.all([cargar(), cargarTortillasAdmin()]);
}

function puestoHabilitado(tortilla: Tortilla, puestoId: string) {
  return (
    !tortilla.puestosDisponibles ||
    tortilla.puestosDisponibles.includes(puestoId)
  );
}

async function cambiarDisponibilidad(tortilla: Tortilla, puesto: Puesto) {
  const clave = `${tortilla._id}-${puesto._id}`;
  cambiandoPuesto.value = clave;
  error.value = "";
  try {
    const actualizada = await api.cambiarDisponibilidadPuesto(
      tortilla._id,
      puesto._id,
      !puestoHabilitado(tortilla, puesto._id),
    );
    tortilla.puestosDisponibles = actualizada.puestosDisponibles;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "No se pudo actualizar el puesto";
  } finally {
    cambiandoPuesto.value = "";
  }
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <!-- Formulario -->
    <div class="rounded-2xl bg-white/[0.04] p-5">
      <h3 class="font-display text-xl tracking-wide text-crema">
        {{ editando ? "Editar tortilla" : "Nueva tortilla" }}
      </h3>

      <div class="mt-4 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]"
          >
            <img
              v-if="previewUrl"
              :src="previewUrl"
              alt=""
              class="h-full w-full object-cover"
            />
            <span v-else class="font-body text-[10px] text-crema/30"
              >Sin foto</span
            >
          </div>
          <label
            class="cursor-pointer rounded-full border border-crema/20 px-4 py-2 font-body text-xs text-crema/70"
          >
            {{ subiendoImagen ? "Subiendo..." : "Elegir imagen" }}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              class="hidden"
              :disabled="subiendoImagen"
              @change="onArchivoSeleccionado"
            />
          </label>
        </div>

        <input
          v-model="form.nombre"
          type="text"
          placeholder="Nombre (ej: Jamón y Mozzarella)"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Descripción corta"
          class="resize-none rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model.number="form.precio"
          type="number"
          min="0"
          placeholder="Precio"
          class="rounded-xl bg-white/[0.06] px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <label class="flex items-center gap-2 font-body text-sm text-crema/70">
          <input v-model="form.nueva" type="checkbox" class="accent-brasa" />
          Marcar como "Nueva"
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
                  : "Crear tortilla"
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

    <!-- Lista -->
    <div class="flex flex-col gap-2">
      <div
        v-for="t in tortillasAdmin"
        :key="t._id"
        class="flex flex-col gap-3 rounded-xl bg-white/[0.04] p-4 sm:flex-row sm:items-center"
      >
        <div class="flex items-center gap-3">
          <img
            :src="urlImagen(t.imagen)"
            :alt="t.nombre"
            class="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-body text-sm font-medium text-crema">
              {{ t.nombre }}
              <span v-if="t.nueva" class="ml-1 text-[10px] uppercase text-queso"
                >nueva</span
              >
            </p>
            <p class="truncate font-body text-xs text-crema/50">
              {{ t.descripcion }}
            </p>
            <p class="font-display text-sm text-queso">
              ${{ t.precio.toLocaleString("es-AR") }}
            </p>
            <div v-if="puestos.length" class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="puesto in puestos"
                :key="puesto._id"
                type="button"
                class="rounded-full border px-2 py-1 font-body text-[10px] transition-colors disabled:opacity-50"
                :class="
                  puestoHabilitado(t, puesto._id)
                    ? 'border-green-400/30 text-green-300'
                    : 'border-red-400/30 text-red-300'
                "
                :disabled="cambiandoPuesto === `${t._id}-${puesto._id}`"
                @click="cambiarDisponibilidad(t, puesto)"
              >
                {{
                  puestoHabilitado(t, puesto._id)
                    ? "Habilitada"
                    : "Deshabilitada"
                }}
                ·
                {{ puesto.nombre }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 gap-2 sm:ml-auto">
          <button
            class="flex-1 rounded-full border border-crema/20 px-3 py-1.5 font-body text-xs text-crema/70 sm:flex-none"
            @click="editar(t)"
          >
            Editar
          </button>
          <button
            class="flex-1 rounded-full border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-400 sm:flex-none"
            @click="borrar(t._id)"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
