import type { Puesto, Tortilla } from '@/api'

export function disponibleEnPuesto(tortilla: Tortilla, puestoId: string) {
  return (
    tortilla.puestosDisponibles === undefined ||
    tortilla.puestosDisponibles.includes(puestoId)
  )
}

export function disponibleParaEnvio(tortilla: Tortilla, puestos: Puesto[]) {
  return (
    tortilla.puestosDisponibles === undefined ||
    puestos.every((puesto) =>
      tortilla.puestosDisponibles!.includes(puesto._id),
    )
  )
}
