export interface Tortilla {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  nueva?: boolean
}

export const tortillas: Tortilla[] = [
  {
    id: 'roquefort',
    nombre: 'Roquefort',
    descripcion: 'Masa a la piedra, roquefort derretido y un toque de orégano.',
    precio: 3800,
    imagen: '/src/assets/t-roquefort.png',
  },
  {
    id: 'bondiola',
    nombre: 'Bondiola',
    descripcion: 'Bondiola braseada, cebolla caramelizada y provolone.',
    precio: 4500,
    imagen: '/src/assets/t-roquefort.png',
    nueva: true,
  },
  {
    id: 'jamon-queso',
    nombre: 'Jamón y Queso',
    descripcion: 'La clásica, con jamón cocido y muzzarella bien gratinada.',
    precio: 3200,
    imagen: '/src/assets/tortilla.png',
  },
  {
    id: 'veggie',
    nombre: 'Veggie',
    descripcion: 'Morrón asado, cebolla, champiñones y queso de cabra.',
    precio: 3600,
    imagen: '/src/assets/tortilla.png',
  },
]

export interface Zona {
  id: string
  nombre: string
  envio: number
}

export const zonas: Zona[] = [
  { id: 'berazategui', nombre: 'Berazategui', envio: 500 },
  { id: 'quilmes', nombre: 'Quilmes', envio: 700 },
  { id: 'espeleta', nombre: 'Espeleta', envio: 600 },
]
