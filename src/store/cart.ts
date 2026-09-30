import { reactive, computed, watch } from 'vue'
import { useCatalog } from './catalog'

export interface ItemCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

type Entrega = 'envio' | 'retiro'

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
  nombrePedido: guardado?.nombrePedido ?? '',
  entrega: (guardado?.entrega ?? 'envio') as Entrega,
  direccion: guardado?.direccion ?? '',
  comentario: guardado?.comentario ?? '',
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
    nombrePedido: state.nombrePedido,
    entrega: state.entrega,
    direccion: state.direccion,
    comentario: state.comentario,
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

const total = computed(() => subtotal.value)

function confirmarPedido() {
  state.error = ''

  if (!state.items.length) {
    state.error = 'Agregá al menos una tortilla al pedido'
    return
  }
  if (!state.nombrePedido.trim()) {
    state.error = 'Indicá a nombre de quién es el pedido'
    return
  }

  if (state.entrega === 'envio' && !state.direccion.trim()) {
    state.error = 'Indicá la dirección para el envío'
    return
  }
  const { state: catalogo } = useCatalog()
  const telefono = catalogo.configuracion?.whatsapp?.replace(/\D/g, '')
  if (!telefono) {
    state.error = 'El WhatsApp de Tortillas La 7 todavía no está configurado'
    return
  }

  const lineas = state.items.map(
    (item) => `• ${item.cantidad} x ${item.nombre} — $${(item.precio * item.cantidad).toLocaleString('es-AR')}`,
  )
  const mensaje = [
    'Hola, quiero hacer este pedido en Tortillas La 7:',
    '',
    ...lineas,
    '',
    `Total de productos: $${subtotal.value.toLocaleString('es-AR')}`,
    `Nombre: ${state.nombrePedido.trim()}`,
    `Modalidad: ${state.entrega === 'envio' ? 'Envío a domicilio' : 'Retiro'}`,
    ...(state.entrega === 'envio'
      ? [`Dirección: ${state.direccion.trim()}`]
      : []),
    ...(state.comentario.trim() ? [`Comentario: ${state.comentario.trim()}`] : []),
  ].join('\n')
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`

  const ventanaWhatsApp = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  if (!ventanaWhatsApp) {
    state.error = 'No se pudo abrir WhatsApp. Habilitá las ventanas emergentes e intentá de nuevo.'
    return
  }
  state.confirmado = true
  state.items = []
  state.nombrePedido = ''
  state.direccion = ''
  state.comentario = ''
  localStorage.removeItem(CLAVE_STORAGE)
}

export function useCart() {
  return {
    state,
    agregar,
    quitar,
    setCantidad,
    cantidadTotal,
    subtotal,
    total,
    confirmarPedido,
  }
}
