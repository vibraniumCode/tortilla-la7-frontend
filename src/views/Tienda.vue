<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import DesktopBlock from "@/components/DesktopBlock.vue";
import HeroCarousel from "@/components/HeroCarousel.vue";
import ZoneSelector from "@/components/ZoneSelector.vue";
import ProductCard from "@/components/ProductCard.vue";
import CartButton from "@/components/CartButton.vue";
import CartDrawer from "@/components/CartDrawer.vue";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";
import { useAuth } from "@/store/auth";

const { cantidadTotal } = useCart();
const { state: catalogo, cargar } = useCatalog();
const { state: auth, logout } = useAuth();
const menuAbierto = ref(false);

onMounted(cargar);
</script>

<template>
  <DesktopBlock>
    <main class="min-h-screen bg-carbon px-4 pb-28 pt-6">
      <header class="mb-5 flex items-center justify-between">
        <h1 class="font-display text-2xl tracking-wide text-crema">
          Tortillas <span class="text-brasa">al Paso</span>
        </h1>
        <div class="relative flex items-center gap-3">
          <span class="font-body text-xs text-crema/50">
            {{ cantidadTotal }} en el pedido
          </span>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-crema/15 text-crema/80"
            aria-label="Abrir menú"
            :aria-expanded="menuAbierto"
            @click="menuAbierto = !menuAbierto"
          >
            <span class="flex flex-col gap-1">
              <span class="h-0.5 w-5 bg-current" />
              <span class="h-0.5 w-5 bg-current" />
              <span class="h-0.5 w-5 bg-current" />
            </span>
          </button>
          <div
            v-if="menuAbierto"
            class="absolute right-0 top-12 z-20 flex min-w-44 flex-col gap-1 rounded-xl border border-crema/10 bg-carbon p-2 shadow-xl"
          >
            <RouterLink
              v-if="!auth.usuario"
              to="/login"
              class="rounded-lg px-3 py-2 font-body text-sm text-crema/70 hover:bg-white/5"
              @click="menuAbierto = false"
            >
              Mi cuenta
            </RouterLink>
            <template v-else>
              <RouterLink
                v-if="auth.usuario.rol === 'admin'"
                to="/admin"
                class="rounded-lg px-3 py-2 font-body text-sm text-queso hover:bg-white/5"
                @click="menuAbierto = false"
              >
                Panel admin
              </RouterLink>
              <RouterLink
                to="/mis-pedidos"
                class="rounded-lg px-3 py-2 font-body text-sm text-crema/70 hover:bg-white/5"
                @click="menuAbierto = false"
              >
                Mis pedidos
              </RouterLink>
              <button
                class="rounded-lg px-3 py-2 text-left font-body text-sm text-crema/70 hover:bg-white/5"
                @click="
                  logout();
                  menuAbierto = false;
                "
              >
                Salir
              </button>
            </template>
          </div>
        </div>
      </header>

      <!-- Cargando -->
      <div
        v-if="catalogo.cargando"
        class="py-16 text-center font-body text-sm text-crema/40"
      >
        Cargando la carta...
      </div>

      <!-- Error de conexión -->
      <div
        v-else-if="catalogo.error"
        class="rounded-2xl bg-white/4 p-5 text-center font-body text-sm text-crema/60"
      >
        No pudimos conectar con el servidor.
        <button class="mt-2 block w-full text-brasa underline" @click="cargar">
          Reintentar
        </button>
      </div>

      <template v-else>
        <HeroCarousel />

        <section class="mt-7">
          <ZoneSelector />
        </section>

        <section class="mt-7">
          <h3
            class="font-body text-xs font-semibold uppercase tracking-widest text-crema/50"
          >
            Toda la carta
          </h3>
          <div class="mt-3 flex flex-col gap-3">
            <ProductCard
              v-for="t in catalogo.tortillas"
              :key="t._id"
              :tortilla="t"
            />
          </div>
        </section>
      </template>
    </main>

    <CartButton />
    <CartDrawer />
  </DesktopBlock>
</template>
