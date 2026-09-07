<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/store/auth'

const router = useRouter()
const { state, login, logout } = useAuth()

const form = reactive({ email: '', password: '' })
const error = ref('')
const enviando = ref(false)

async function entrar() {
  error.value = ''
  enviando.value = true
  try {
    await login(form.email, form.password)
    if (state.usuario?.rol !== 'admin') {
      logout()
      error.value = 'Esta cuenta no tiene permisos de administrador'
      return
    }
    router.push('/admin')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo iniciar sesión'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-carbon px-6">
    <div class="w-full max-w-sm">
      <h1 class="text-center font-display text-3xl tracking-wide text-crema">
        Panel <span class="text-brasa">Tortillas al Paso</span>
      </h1>
      <p class="mt-1 text-center font-body text-sm text-crema/50">
        Acceso solo para administradores
      </p>

      <div class="mt-6 flex flex-col gap-3">
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          @keyup.enter="entrar"
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Contraseña"
          class="rounded-xl bg-white/[0.06] px-4 py-3 font-body text-sm text-crema placeholder:text-crema/30 focus:outline-none focus:ring-2 focus:ring-brasa"
          @keyup.enter="entrar"
        />

        <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>

        <button
          class="mt-2 w-full rounded-full bg-brasa py-3 font-body text-sm font-bold text-crema disabled:opacity-50"
          :disabled="enviando"
          @click="entrar"
        >
          {{ enviando ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </div>
  </div>
</template>
