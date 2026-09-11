<script setup lang="ts">
const props = defineProps<{
  abierto: boolean;
  titulo: string;
  mensaje: string;
  confirmando?: boolean;
}>();

const emit = defineEmits<{
  cancelar: [];
  confirmar: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="props.abierto"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        @click.self="emit('cancelar')"
      >
        <div
          class="w-full max-w-sm rounded-2xl border border-white/10 bg-[#211e1c] p-5 shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="props.titulo"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-300"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v4m0 4h.01M5.2 19h13.6a1.8 1.8 0 0 0 1.56-2.7L13.56 4.6a1.8 1.8 0 0 0-3.12 0L3.64 16.3A1.8 1.8 0 0 0 5.2 19Z"
                />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="font-display text-xl tracking-wide text-crema">
                {{ props.titulo }}
              </h2>
              <p
                class="mt-1 break-words font-body text-sm leading-relaxed text-crema/60"
              >
                {{ props.mensaje }}
              </p>
            </div>
          </div>
          <div
            class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              class="rounded-full border border-crema/15 px-4 py-2.5 font-body text-sm text-crema/70 transition-colors hover:bg-white/5"
              :disabled="props.confirmando"
              @click="emit('cancelar')"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-full bg-red-500/90 px-4 py-2.5 font-body text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              :disabled="props.confirmando"
              @click="emit('confirmar')"
            >
              {{ props.confirmando ? "Eliminando..." : "Eliminar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.18s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
