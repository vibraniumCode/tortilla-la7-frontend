<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useCatalog } from "@/store/catalog";
import { useAuth } from "@/store/auth";
import AdminTortillas from "@/components/admin/AdminTortillas.vue";
import AdminNovedades from "@/components/admin/AdminNovedades.vue";
import AdminConfiguracion from "@/components/admin/AdminConfiguracion.vue";

type Tab = "tortillas" | "novedades" | "contacto";
const tab = ref<Tab>("tortillas");
const { cargar } = useCatalog();
const { state: auth, logout } = useAuth();
const router = useRouter();

onMounted(cargar);

function salir() {
  logout();
  router.push("/admin/login");
}

const tabs: { id: Tab; label: string }[] = [
  { id: "tortillas", label: "Tortillas" },
  { id: "novedades", label: "Novedades" },
  { id: "contacto", label: "WhatsApp y pagos" },
];
</script>

<template>
  <div class="min-h-screen bg-carbon px-4 py-6 sm:px-6 sm:py-8">
    <header
      class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="font-display text-2xl tracking-wide text-crema sm:text-3xl">
          Panel <span class="text-brasa">Tortillas La 7</span>
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
      </button>
    </nav>

    <AdminTortillas v-if="tab === 'tortillas'" />
    <AdminNovedades v-else-if="tab === 'novedades'" />
    <AdminConfiguracion v-else-if="tab === 'contacto'" />
  </div>
</template>
