import { createRouter, createWebHistory } from 'vue-router'
import Tienda from '@/views/Tienda.vue'
import Admin from '@/views/Admin.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import Login from '@/views/Login.vue'
import MisPedidos from '@/views/MisPedidos.vue'
import { useAuth } from '@/store/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tienda', component: Tienda },
    { path: '/login', name: 'login', component: Login },
    { path: '/mis-pedidos', name: 'mis-pedidos', component: MisPedidos },
    { path: '/admin/login', name: 'admin-login', component: AdminLogin },
    { path: '/admin', name: 'admin', component: Admin },
  ],
})

router.beforeEach((to) => {
  const { state } = useAuth()

  if (to.path === '/admin' && state.usuario?.rol !== 'admin') {
    return { path: '/admin/login' }
  }

  if (to.path === '/mis-pedidos' && !state.usuario) {
    return { path: '/login' }
  }
})
