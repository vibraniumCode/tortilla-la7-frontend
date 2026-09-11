import { api } from './api'

function convertirClave(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const datos = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(datos, (caracter) => caracter.charCodeAt(0))
}

export async function activarNotificaciones() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Este navegador no admite notificaciones push')
  }

  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') throw new Error('No se otorgó permiso para notificaciones')

  const { configurada, clave } = await api.clavePublicaNotificaciones()
  if (!configurada || !clave) throw new Error('Las notificaciones todavía no están configuradas en el servidor')

  const registro = await navigator.serviceWorker.ready
  const suscripcion =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertirClave(clave),
    }))
  await api.guardarSuscripcion(suscripcion.toJSON())
}

export function notificacionesActivas() {
  return 'Notification' in window && Notification.permission === 'granted'
}
