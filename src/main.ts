import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { useAuth } from './store/auth'

const { restaurarSesion } = useAuth()

restaurarSesion().finally(() => {
  createApp(App).use(router).mount('#app')

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('No se pudo registrar la app instalable:', error)
      })
    })
  }
})
