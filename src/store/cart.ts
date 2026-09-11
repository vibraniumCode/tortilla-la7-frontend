import { reactive, computed, watch } from 'vue'
import { api } from '@/api'
import { useCatalog } from './catalog'
import { useAuth } from './auth'

export interface ItemCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

type Entrega = 'envio' | 'retiro'
type Pago = 'efectivo' | 'transferencia'

const CLAVE_STORAGE = 'carrito'

function estadoGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE)
    if (!crudo) return null
    return JSON.parse(crudo)
  } catch {
    return null
  }
}

const guardado = estadoGuardado()

const state = reactive({
  items: (guardado?.items ?? []) as ItemCarrito[],
  entrega: (guardado?.entrega ?? 'envio') as Entrega,
  zonaId: (guardado?.zonaId ?? '') as string,
  localidad: guardado?.localidad ?? '',
  puestoId: (guardado?.puestoId ?? '') as string,
  pago: (guardado?.pago ?? 'efectivo') as Pago,
  direccion: guardado?.direccion ?? '',
  horarioEntrega: guardado?.horarioEntrega ?? '',
  comentario: guardado?.comentario ?? '',
  montoEfectivo: (guardado?.montoEfectivo ?? null) as number | null,
  abierto: false,
  enviando: false,
  error: '',
  confirmado: false,
  ultimoPedidoId: '',
})

// Guarda automáticamente lo que el cliente va completando, así no se
// pierde si recarga la página o se le corta la conexión a mitad de camino.
watch(
  () => ({
    items: state.items,
    entrega: state.entrega,
    zonaId: state.zonaId,
    localidad: state.localidad,
    puestoId: state.puestoId,
    pago: state.pago,
    direccion: state.direccion,
    horarioEntrega: state.horarioEntrega,
    comentario: state.comentario,
    montoEfectivo: state.montoEfectivo,
  }),
  (valor) => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(valor))
  },
  { deep: true },
)

function agregar(id: string, nombre: string, precio: number, cantidad = 1) {
  const existente = state.items.find((i) => i.id === id)
  if (existente) {
    existente.cantidad += cantidad
  } else {
    state.items.push({ id, nombre, precio, cantidad })
  }
}

function quitar(id: string) {
  state.items = state.items.filter((i) => i.id !== id)
}

function setCantidad(id: string, cantidad: number) {
  const item = state.items.find((i) => i.id === id)
  if (!item) return
  if (cantidad <= 0) {
    quitar(id)
  } else {
    item.cantidad = cantidad
  }
}

const cantidadTotal = computed(() =>
  state.items.reduce((acc, i) => acc + i.cantidad, 0),
)

const subtotal = computed(() =>
  state.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
)

const costoEnvio = computed(() => {
  if (state.entrega !== 'envio') return 0
  const { state: catalogo } = useCatalog()
  const zona = catalogo.zonas.find((z) => z._id === state.zonaId)
  return zona?.envio ?? 0
})

const total = computed(() => subtotal.value + costoEnvio.value)

const vuelto = computed(() => {
  if (state.pago !== 'efectivo' || state.montoEfectivo == null) return null
  return Math.max(0, state.montoEfectivo - total.value)
})

async function confirmarPedido() {
  state.error = ''
  const { state: auth } = useAuth()

  if (state.entrega === 'envio' && !state.direccion.trim()) {
    state.error = 'Falta la dirección para el envío'
    return
  }
  if (state.entrega === 'envio' && !state.zonaId) {
    state.error = 'Elegí una zona de envío'
    return
  }
  if (state.entrega === 'envio' && !state.localidad.trim()) {
    state.error = 'Falta la localidad para el envío'
    return
  }
  if (state.entrega === 'envio' && state.pago !== 'transferencia') {
    state.error = 'Los envíos a domicilio solo aceptan transferencia'
    return
  }
  if (state.entrega === 'envio' && auth.usuario?.puedeElegirHorario && !state.horarioEntrega) {
    state.error = 'Elegí un horario de entrega'
    return
  }
  if (state.entrega === 'retiro' && !state.puestoId) {
    state.error = 'Elegí un puesto de retiro'
    return
  }
  if (
    state.pago === 'efectivo' &&
    state.montoEfectivo != null &&
    state.montoEfectivo < total.value
  ) {
    state.error = 'El monto que pusiste es menor al total del pedido'
    return
  }

  state.enviando = true
  try {
    const pedido = await api.crearPedido({
      items: state.items.map((i) => ({
        tortilla: i.id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      })),
      entrega: state.entrega,
      zona: state.entrega === 'envio' ? state.zonaId : undefined,
      localidad: state.entrega === 'envio' ? state.localidad : undefined,
      puesto: state.entrega === 'retiro' ? state.puestoId : undefined,
      direccion: state.entrega === 'envio' ? state.direccion : undefined,
      horarioEntrega:
        state.entrega === 'envio' && auth.usuario?.puedeElegirHorario
          ? state.horarioEntrega || undefined
          : undefined,
      comentario: state.comentario || undefined,
      pago: state.pago,
      montoEfectivo: state.pago === 'efectivo' ? state.montoEfectivo ?? undefined : undefined,
    })

    state.ultimoPedidoId = pedido._id
    state.confirmado = true
    state.items = []
    state.direccion = ''
    state.localidad = ''
    state.horarioEntrega = ''
    state.comentario = ''
    state.montoEfectivo = null
    localStorage.removeItem(CLAVE_STORAGE)
  } catch (err) {
    state.error =
      err instanceof Error ? err.message : 'No se pudo enviar el pedido'
  } finally {
    state.enviando = false
  }
}

export function useCart() {
  return {
    state,
    agregar,
    quitar,
    setCantidad,
    cantidadTotal,
    subtotal,
    costoEnvio,
    total,
    vuelto,
    confirmarPedido,
  }
}
