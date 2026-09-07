# Tortillas al Paso — Front

Vue 3 + TypeScript + Tailwind v4. Ya conectado al backend real (Node + Express + MongoDB).

## Cómo correrlo

1. Asegurate de tener el backend corriendo (ver tortillas-backend/README.md).
   Por defecto el front busca la API en http://localhost:4000/api — si tu
   backend corre en otro puerto/dominio, cambialo en el archivo .env
   (VITE_API_URL).
2. npm install
3. npm run dev

## Cuentas y acceso

- **Clientes**: se registran solos en `/login` (pestaña "Crear cuenta").
  Pueden ver el menú sin cuenta, pero **para confirmar un pedido ahora
  hace falta estar logueado** — cada pedido queda atado a la cuenta que
  lo hizo.
- **Mis pedidos** (`/mis-pedidos`): el cliente ve sus pedidos con un
  estado visual (Recibido → Confirmado → En camino → Entregado) y una
  animación de moto cuando está "en camino". OJO: es una animación
  simple, NO es un mapa con la ubicación real del repartidor en vivo —
  eso requiere que el repartidor tenga la app abierta mandando su GPS
  todo el tiempo, más una integración con Google Maps/Mapbox. Es un
  desarrollo bastante más grande; avisame si en algún momento lo querés
  encarar en serio.
- **Admin (dueño)**: no hay registro público. Se crea una sola vez desde
  el backend con `npm run crear-admin` (ver su README). Entra en
  `/admin/login` con ese email/contraseña.
- `/admin` está protegido: si no estás logueado como admin, te redirige
  solo a `/admin/login`.

## Panel de administración

Entrás en http://localhost:5173/admin (o el puerto que use tu Vite).
Tiene 7 pestañas:
- **Pedidos**: los ves en vivo, cambiás su estado (pendiente → confirmado →
  en camino → entregado), y ves el detalle completo (qué tortillas, cuántas
  de cada una, zona/puesto, si pagó en efectivo con cuánto/vuelto, o si
  ya avisó que transfirió).
- **Estadísticas**: ingresos de hoy / últimos 7 días / últimos 30 días,
  un gráfico simple de los últimos 14 días, ventas por zona, por puesto
  de retiro, y las tortillas más vendidas.
- **Tortillas / Puestos de retiro / Zonas de envío / Novedades**: lo de siempre.
- **Pagos**: acá cargás el alias de transferencia que ve el cliente al
  elegir esa forma de pago.

**Aviso sonoro de pedidos nuevos**: mientras tenés el panel abierto,
cada 20 segundos chequea si hay pedidos nuevos en estado "pendiente" y,
si aparece uno, suena un aviso (dos tonos cortos) y el número en la
pestaña "Pedidos" se actualiza. Esto SOLO funciona con el panel abierto
en el navegador — no es una notificación push real que te llegue con la
pantalla apagada o el navegador cerrado. Para eso hace falta otra cosa
(push notifications del navegador, o un bot de Telegram/WhatsApp) —
avisame si lo querés sumar más adelante.

**Ya tiene login real.** Entrás con la cuenta admin que creaste con
`npm run crear-admin` en el backend — nadie más puede entrar a `/admin`
sin esas credenciales.

## Pago con Mercado Pago

El backend ya tiene el enganche listo (ver tortillas-backend/README.md),
pero del lado del front todavía NO agregué el botón de "Pagar con
Mercado Pago" en el checkout — la app hoy solo maneja efectivo y
transferencia. Cuando tengas tu cuenta y access token, avisame y sumamos
esa opción al CartDrawer.

## Falta de tu lado

- Poné tu foto de tortilla sin fondo en public/tortilla.png
  (usá remove.bg para recortarla). Esa ruta es la que el backend
  ya tiene guardada para cada tortilla del seed.
- El HeroCarousel (sección de novedades arriba de todo) tiene contenido
  fijo por ahora — no viene del backend. Si querés que las novedades
  también se administren desde la base, avisame y lo conectamos.

## Cómo está armado

- src/api.ts              -> cliente HTTP hacia el backend (fetch)
- src/store/catalog.ts     -> tortillas, zonas y puestos traídos del backend
- src/store/cart.ts        -> carrito + arma y envía el pedido real (POST /api/pedidos)
- src/store/auth.ts          -> sesión (login, registro, logout), token en localStorage
- src/router.ts             -> rutas: / (tienda), /login, /admin/login, /admin (protegida)
- src/views/
    Tienda.vue              -> la tienda (lo que antes era App.vue entero)
    Login.vue               -> login/registro de clientes
    AdminLogin.vue          -> login del admin
    Admin.vue               -> panel de administración con pestañas
- src/components/admin/
    AdminPedidos.vue        -> listado de pedidos, cambiar estado
    AdminEstadisticas.vue   -> ingresos y ventas agregadas
    AdminConfiguracion.vue  -> alias de transferencia (pestaña "Pagos")
    AdminTortillas.vue      -> alta/edición/baja de tortillas
    AdminPuestos.vue        -> alta/edición/baja de puestos de retiro
    AdminZonas.vue          -> alta/edición de zonas y costo de envío
    AdminNovedades.vue      -> alta/edición/baja de los slides del carousel
- src/components/
    DesktopBlock.vue       -> bloquea el acceso desde PC
    HeroCarousel.vue       -> carousel de novedades (swipe + dots)
    ZoneSelector.vue       -> elegir zona de envío (desde el backend)
    PuestoSelector.vue     -> elegir puesto de retiro (desde el backend)
    ProductCard.vue        -> card de producto con selector de cantidad
    CartButton.vue         -> botón flotante con total
    CartDrawer.vue         -> panel del carrito: entrega, dirección/puesto, comentario, pago
