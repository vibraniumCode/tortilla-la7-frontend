<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/store/auth";

const router = useRouter();
const { login, registro } = useAuth();

const modo = ref<"login" | "registro">("login");
const error = ref("");
const enviando = ref(false);

const form = reactive({
  nombre: "",
  email: "",
  password: "",
  telefono: "",
});

async function enviar() {
  error.value = "";

  if (modo.value === "registro" && form.password.length < 6) {
    error.value = "La contraseña debe tener al menos 6 caracteres";
    return;
  }

  enviando.value = true;
  try {
    if (modo.value === "login") {
      await login(form.email, form.password);
    } else {
      await registro(form.nombre, form.email, form.password, form.telefono);
    }
    router.push("/");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Ocurrió un error";
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-carbon px-6">
    <div class="w-full max-w-sm">
      <h1 class="text-center font-display text-3xl tracking-wide text-crema">
        Parrilla <span class="text-brasa">La 7</span>
      </h1>

      <div class="mt-6 flex rounded-full bg-white/[0.06] p-1">
        <button
          class="flex-1 rounded-full py-2 font-body text-sm font-medium transition-colors"
          :class="modo === 'login' ? 'bg-brasa text-crema' : 'text-crema/60'"
          @click="modo = 'login'"
        >
          Iniciar sesión
        </button>
        <button
          class="flex-1 rounded-full py-2 font-body text-sm font-medium transition-colors"
          :class="modo === 'registro' ? 'bg-brasa text-crema' : 'text-crema/60'"
          @click="modo = 'registro'"
        >
          Crear cuenta
        </button>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        <input
          v-if="modo === 'registro'"
          v-model="form.nombre"
          type="text"
          placeholder="Nombre y apellido"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-if="modo === 'registro'"
          v-model="form.telefono"
          type="tel"
          placeholder="Teléfono (opcional)"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Contraseña"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          @keyup.enter="enviar"
        />

        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>

        <button
          class="mt-2 w-full rounded-full bg-brasa py-3 font-body text-sm font-bold text-crema disabled:opacity-50"
          :disabled="enviando"
          @click="enviar"
        >
          {{
            enviando
              ? "Un momento..."
              : modo === "login"
                ? "Entrar"
                : "Crear cuenta"
          }}
        </button>

        <router-link
          to="/"
          class="mt-1 text-center font-body text-xs text-crema/40 underline"
        >
          Seguir sin cuenta
        </router-link>
      </div>
    </div>
  </div>
</template>
