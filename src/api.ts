const apiConfigurada = import.meta.env.VITE_API_URL?.trim()
const API_URL =
  apiConfigurada && /^https?:\/\//.test(apiConfigurada)
    ? apiConfigurada.replace(/\/+$/, '')
    : import.meta.env.PROD
      ? 'https://tortilla-la7-backend.onrender.com/api'
      : 'http://localhost:4000/api'
const ASSET_URL = API_URL.replace(/\/api\/?$/, '')

// Arma la URL completa de una imagen guardada por el backend
// (que devuelve rutas relativas tipo /uploads/archivo.png)
export function urlImagen(ruta: string): string {
  if (!ruta) return ''
  if (ruta.startsWith('http')) return ruta
  return `${ASSET_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
}

export interface Tortilla {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  nueva?: boolean
}

export interface Zona {
  _id: string
  nombre: string
  envio: number
}

export interface Puesto {
  _id: string
  nombre: string
  direccion: string
}

export interface Novedad {
  _id: string
  eyebrow: string
  titulo: string
  descripcion: string
  cta: string
  precio?: number
  tortilla?: string
  orden: number
  activa: boolean
}

export interface ItemPedido {
  tortilla: string
  nombre: string
  precio: number
  cantidad: number
}

export interface NuevoPedido {
  items: ItemPedido[]
  entrega: 'envio' | 'retiro'
  zona?: string
  puesto?: string
  direccion?: string
  comentario?: string
  pago: 'efectivo' | 'transferencia'
  montoEfectivo?: number
}

export interface Pedido {
  _id: string
  items: ItemPedido[]
  entrega: 'envio' | 'retiro'
  zona?: Zona
  puesto?: Puesto
  direccion?: string
  comentario?: string
  pago: 'efectivo' | 'transferencia'
  montoEfectivo?: number
  pagoConfirmado: boolean
  transferenciaInformada: boolean
  transferenciaTitular?: string
  comprobanteTransferencia?: string
  subtotal: number
  costoEnvio: number
  total: number
  estado: 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado'
  createdAt: string
}

export interface Configuracion {
  aliasTransferencia: string
  cbu?: string
  titular?: string
}

export interface Estadisticas {
  hoy: number
  semana: number
  mes: number
  porDia: { fecha: string; total: number }[]
  porZona: { nombre: string; total: number; pedidos: number }[]
  porPuesto: { nombre: string; total: number; pedidos: number }[]
  porTortilla: { nombre: string; cantidad: number; total: number }[]
  entregaVsRetiro: { envio: number; retiro: number }
  totalPedidos: number
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'cliente' | 'admin'
}

export interface Sesion {
  token: string
  usuario: Usuario
}

async function pedir<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Error ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Auth
  registro: (data: { nombre: string; email: string; password: string; telefono?: string }) =>
    pedir<Sesion>('/auth/registro', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    pedir<Sesion>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => pedir<Usuario>('/auth/me'),

  // Tortillas
  getTortillas: () => pedir<Tortilla[]>('/tortillas'),
  crearTortilla: (data: Partial<Tortilla>) =>
    pedir<Tortilla>('/tortillas', { method: 'POST', body: JSON.stringify(data) }),
  editarTortilla: (id: string, data: Partial<Tortilla>) =>
    pedir<Tortilla>(`/tortillas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  borrarTortilla: (id: string) => pedir(`/tortillas/${id}`, { method: 'DELETE' }),

  // Zonas
  getZonas: () => pedir<Zona[]>('/zonas'),
  crearZona: (data: Partial<Zona>) =>
    pedir<Zona>('/zonas', { method: 'POST', body: JSON.stringify(data) }),
  editarZona: (id: string, data: Partial<Zona>) =>
    pedir<Zona>(`/zonas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Puestos
  getPuestos: () => pedir<Puesto[]>('/puestos'),
  crearPuesto: (data: Partial<Puesto>) =>
    pedir<Puesto>('/puestos', { method: 'POST', body: JSON.stringify(data) }),
  editarPuesto: (id: string, data: Partial<Puesto>) =>
    pedir<Puesto>(`/puestos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  borrarPuesto: (id: string) => pedir(`/puestos/${id}`, { method: 'DELETE' }),

  // Novedades
  getNovedades: () => pedir<Novedad[]>('/novedades'),
  getNovedadesTodas: () => pedir<Novedad[]>('/novedades/todas'),
  crearNovedad: (data: Partial<Novedad>) =>
    pedir<Novedad>('/novedades', { method: 'POST', body: JSON.stringify(data) }),
  editarNovedad: (id: string, data: Partial<Novedad>) =>
    pedir<Novedad>(`/novedades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  borrarNovedad: (id: string) => pedir(`/novedades/${id}`, { method: 'DELETE' }),

  // Pedidos
  crearPedido: (pedido: NuevoPedido) =>
    pedir<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(pedido) }),
  getPedidos: () => pedir<Pedido[]>('/pedidos'),
  getMisPedidos: () => pedir<Pedido[]>('/pedidos/mios'),
  getEstadisticas: () => pedir<Estadisticas>('/pedidos/estadisticas'),
  cambiarEstadoPedido: (id: string, estado: Pedido['estado']) =>
    pedir<Pedido>(`/pedidos/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado }) }),
  informarTransferencia: async (id: string, titular: string, comprobante?: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('titular', titular)
    if (comprobante) formData.append('comprobante', comprobante)

    const res = await fetch(`${API_URL}/pedidos/${id}/transferencia`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Error ${res.status}`)
    }

    return res.json() as Promise<Pedido>
  },
  confirmarPago: (id: string) =>
    pedir<Pedido>(`/pedidos/${id}/pago-confirmado`, { method: 'PUT' }),

  // Configuración
  getConfiguracion: () => pedir<Configuracion>('/configuracion'),
  editarConfiguracion: (data: Partial<Configuracion>) =>
    pedir<Configuracion>('/configuracion', { method: 'PUT', body: JSON.stringify(data) }),

  // Subida de imágenes
  subirImagen: async (archivo: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('imagen', archivo)

    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'No se pudo subir la imagen')
    }

    return res.json()
  },
}
