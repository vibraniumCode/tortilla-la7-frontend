<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/store/auth";

const router = useRouter();
const { state, login, logout } = useAuth();
const error = ref("");
const enviando = ref(false);
const form = reactive({ email: "", password: "" });

async function entrar() {
  error.value = "";
  enviando.value = true;
  try {
    await login(form.email, form.password);
    if (state.usuario?.rol === "admin") {
      router.push("/admin");
      return;
    }
    if (!state.usuario?.puedeElegirHorario && !state.usuario?.envioGratis) {
      logout();
      error.value = "El acceso está habilitado solo para fábricas";
      return;
    }
    router.push("/");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "No se pudo iniciar sesión";
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-carbon px-6">
    <div class="w-full max-w-sm">
      <h1 class="text-center font-display text-3xl tracking-wide text-crema">
        Tortillas <span class="text-brasa">La 7</span>
      </h1>
      <p class="mt-2 text-center font-body text-sm text-crema/50">
        Acceso exclusivo para fábricas
      </p>

      <div class="mt-5 flex flex-col gap-3">
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          autocomplete="username"
          class="rounded-xl bg-white/6 px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          @keyup.enter="entrar"
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Contraseña"
          autocomplete="current-password"
          class="rounded-xl bg-white/6 px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          @keyup.enter="entrar"
        />
        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>
        <button
          class="mt-2 w-full rounded-full bg-brasa py-3 font-body text-sm font-bold text-crema disabled:opacity-50"
          :disabled="enviando"
          @click="entrar"
        >
          {{ enviando ? "Entrando..." : "Entrar" }}
        </button>
        <router-link
          to="/"
          class="mt-1 text-center font-body text-xs text-crema/40 underline"
        >
          Volver a la tienda
        </router-link>
      </div>
    </div>
  </div>
</template>
