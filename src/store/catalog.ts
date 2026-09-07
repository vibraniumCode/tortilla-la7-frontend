import { reactive } from 'vue'
import {
  api,
  type Tortilla,
  type Zona,
  type Puesto,
  type Novedad,
  type Configuracion,
} from '@/api'

const state = reactive({
  tortillas: [] as Tortilla[],
  zonas: [] as Zona[],
  puestos: [] as Puesto[],
  novedades: [] as Novedad[],
  configuracion: null as Configuracion | null,
  cargando: false,
  error: '',
})

async function cargar() {
  state.cargando = true
  state.error = ''
  try {
    const [tortillas, zonas, puestos, novedades, configuracion] = await Promise.all([
      api.getTortillas(),
      api.getZonas(),
      api.getPuestos(),
      api.getNovedades(),
      api.getConfiguracion(),
    ])
    state.tortillas = tortillas
    state.zonas = zonas
    state.puestos = puestos
    state.novedades = novedades
    state.configuracion = configuracion
  } catch (err) {
    state.error =
      err instanceof Error
        ? err.message
        : 'No se pudo conectar con el servidor'
  } finally {
    state.cargando = false
  }
}

export function useCatalog() {
  return { state, cargar }
}
