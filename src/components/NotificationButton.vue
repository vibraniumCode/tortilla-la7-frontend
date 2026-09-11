<script setup lang="ts">
import { onMounted, ref } from "vue";
import { activarNotificaciones } from "@/notificaciones";

const activas = ref(false);
const cargando = ref(false);
const mensaje = ref("");

onMounted(() => {
  if ("Notification" in window && Notification.permission === "granted") {
    activar();
  }
});

async function activar() {
  cargando.value = true;
  mensaje.value = "";
  try {
    await activarNotificaciones();
    activas.value = true;
    mensaje.value = "";
  } catch (error) {
    activas.value = false;
    mensaje.value =
      error instanceof Error ? error.message : "No se pudieron activar";
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-end gap-1">
    <button
      v-if="!activas"
      class="rounded-full border border-queso/50 px-3 py-1.5 font-body text-xs text-queso disabled:opacity-50"
      :disabled="cargando"
      @click="activar"
    >
      {{ cargando ? "Activando..." : "Activar notificaciones" }}
    </button>
    <span v-else class="font-body text-xs text-green-300"
      >Notificaciones activas</span
    >
    <span
      v-if="mensaje && !activas"
      class="max-w-56 text-right font-body text-[10px] text-red-300"
    >
      {{ mensaje }}
    </span>
    <span
      v-if="mensaje && activas"
      class="font-body text-[10px] text-green-300"
    >
      {{ mensaje }}
    </span>
  </div>
</template>
