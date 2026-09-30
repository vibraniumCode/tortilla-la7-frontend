<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { api } from "@/api";

const form = reactive({
  whatsapp: "",
  aliasTransferencia: "",
  cbu: "",
  titular: "",
});

const cargando = ref(false);
const guardando = ref(false);
const guardado = ref(false);
const error = ref("");

async function cargar() {
  cargando.value = true;
  try {
    const config = await api.getConfiguracion();
    form.whatsapp = config.whatsapp ?? "";
    form.aliasTransferencia = config.aliasTransferencia ?? "";
    form.cbu = config.cbu ?? "";
    form.titular = config.titular ?? "";
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);

async function guardar() {
  error.value = "";
  guardado.value = false;
  guardando.value = true;
  try {
    await api.editarConfiguracion({ ...form });
    guardado.value = true;
    setTimeout(() => (guardado.value = false), 2500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "No se pudo guardar";
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <div class="max-w-md rounded-2xl bg-white/4 p-5">
    <h3 class="font-display text-xl tracking-wide text-crema">
      Contacto y pagos
    </h3>
    <p class="mt-1 font-body text-xs text-crema/50">
      Configurá el WhatsApp donde recibirás los pedidos. Ingresá el número
      internacional, solo dígitos y sin + ni espacios (por ejemplo, 54911...).
    </p>

    <div v-if="cargando" class="mt-4 font-body text-sm text-crema/40">
      Cargando...
    </div>

    <div v-else class="mt-4 flex flex-col gap-3">
      <div>
        <label class="font-body text-xs text-crema/50"
          >WhatsApp de Tortillas La 7</label
        >
        <input
          v-model="form.whatsapp"
          type="tel"
          inputmode="numeric"
          placeholder="54911..."
          class="mt-1 w-full rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
      </div>
      <div>
        <label class="font-body text-xs text-crema/50">Alias</label>
        <input
          v-model="form.aliasTransferencia"
          type="text"
          placeholder="tortillas.alpaso.mp"
          class="mt-1 w-full rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
      </div>
      <div>
        <label class="font-body text-xs text-crema/50">CBU (opcional)</label>
        <input
          v-model="form.cbu"
          type="text"
          placeholder="0000003100...."
          class="mt-1 w-full rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
      </div>
      <div>
        <label class="font-body text-xs text-crema/50"
          >Titular (opcional)</label
        >
        <input
          v-model="form.titular"
          type="text"
          placeholder="Nombre del titular de la cuenta"
          class="mt-1 w-full rounded-xl bg-white/6 px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
      </div>

      <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>
      <p v-if="guardado" class="font-body text-sm text-green-400">Guardado ✓</p>

      <button
        class="mt-1 rounded-full bg-brasa py-2.5 font-body text-sm font-bold text-crema disabled:opacity-50"
        :disabled="guardando"
        @click="guardar"
      >
        {{ guardando ? "Guardando..." : "Guardar" }}
      </button>
    </div>
  </div>
</template>
