import { reactive } from 'vue'
import { api, type Usuario } from '@/api'

const state = reactive({
  usuario: null as Usuario | null,
  cargando: true,
  error: '',
})

function guardarSesion(token: string, usuario: Usuario) {
  localStorage.setItem('token', token)
  state.usuario = usuario
}

async function login(email: string, password: string) {
  state.error = ''
  const sesion = await api.login({ email, password })
  guardarSesion(sesion.token, sesion.usuario)
}

function logout() {
  localStorage.removeItem('token')
  state.usuario = null
}

async function restaurarSesion() {
  const token = localStorage.getItem('token')
  if (!token) {
    state.cargando = false
    return
  }
  try {
    const usuario = await api.me()
    if (usuario.rol !== 'admin' && !usuario.puedeElegirHorario && !usuario.envioGratis) {
      throw new Error('Cuenta sin acceso a esta versión')
    }
    state.usuario = usuario
  } catch {
    localStorage.removeItem('token')
    state.usuario = null
  } finally {
    state.cargando = false
  }
}

export function useAuth() {
  return { state, login, logout, restaurarSesion }
}
