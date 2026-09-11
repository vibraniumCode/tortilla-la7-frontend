<script setup lang="ts">
import { ref } from "vue";
import { urlImagen } from "@/api";
import { useCatalog } from "@/store/catalog";
import { useCart } from "@/store/cart";

const { state: catalogo } = useCatalog();
const { state: carrito, agregar } = useCart();

const actual = ref(0);
const trackRef = ref<HTMLElement | null>(null);
let startX = 0;

function ir(i: number) {
  if (catalogo.novedades.length === 0) return;
  actual.value = (i + catalogo.novedades.length) % catalogo.novedades.length;
}

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX;
}

function onTouchEnd(e: TouchEvent) {
  const diff = e.changedTouches[0].clientX - startX;
  if (diff > 40) ir(actual.value - 1);
  else if (diff < -40) ir(actual.value + 1);
}

function tortillaDeSlide(slide: (typeof catalogo.novedades)[number]) {
  return slide.tortilla
    ? catalogo.tortillas.find((item) => item._id === slide.tortilla)
    : undefined;
}

function ejecutarCta(slide: (typeof catalogo.novedades)[number]) {
  const tortilla = tortillaDeSlide(slide);
  if (tortilla) {
    agregar(tortilla._id, tortilla.nombre, tortilla.precio);
    carrito.abierto = true;
  }
}

function estiloFondo(fondo?: string) {
  if (!fondo) return { backgroundColor: "#0072f5" };
  return fondo.startsWith("http") || fondo.startsWith("/")
    ? {
        backgroundImage: `url("${urlImagen(fondo)}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: fondo };
}

function usaLineasPredeterminadas(fondo?: string) {
  return !fondo || fondo.toLowerCase() === "#0072f5";
}
</script>

<template>
  <div v-if="catalogo.novedades.length" class="relative">
    <div
      ref="trackRef"
      class="overflow-hidden rounded-3xl"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div
        class="flex transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(-${actual * 100}%)` }"
      >
        <div
          v-for="slide in catalogo.novedades"
          :key="slide._id"
          class="relative w-full shrink-0 overflow-hidden bg-brasa p-7"
          :style="estiloFondo(slide.fondo)"
        >
          <!-- Marcas de parrilla -->
          <svg
            v-if="usaLineasPredeterminadas(slide.fondo)"
            class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
            preserveAspectRatio="none"
            viewBox="0 0 300 200"
          >
            <g stroke="#6b7280" stroke-width="3">
              <line x1="-20" y1="0" x2="60" y2="200" />
              <line x1="20" y1="0" x2="100" y2="200" />
              <line x1="60" y1="0" x2="140" y2="200" />
              <line x1="100" y1="0" x2="180" y2="200" />
              <line x1="140" y1="0" x2="220" y2="200" />
              <line x1="180" y1="0" x2="260" y2="200" />
              <line x1="220" y1="0" x2="300" y2="200" />
              <line x1="260" y1="0" x2="340" y2="200" />
            </g>
          </svg>

          <span
            class="relative z-10 inline-block rounded-full border border-crema/30 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-crema/90"
            :style="{ color: slide.colorTitulo || '#FAF6F1' }"
          >
            {{ slide.eyebrow }}
          </span>

          <h2
            class="relative z-10 mt-3 max-w-[65%] font-display text-5xl leading-[0.9] tracking-wide text-crema"
            :style="{ color: slide.colorTitulo || '#FAF6F1' }"
          >
            {{ slide.titulo }}
          </h2>

          <p
            class="relative z-10 mt-2 max-w-[62%] font-body text-sm text-crema/70"
            :style="{ color: slide.colorTitulo || '#FAF6F1' }"
          >
            {{ slide.descripcion }}
          </p>

          <div class="relative z-10 mt-5 flex items-center gap-3">
            <span
              v-if="slide.precio"
              class="font-display text-2xl tracking-wide text-queso"
              :style="{ color: slide.colorTitulo || '#FAF6F1' }"
            >
              ${{ slide.precio.toLocaleString("es-AR") }}
            </span>
            <button
              v-if="tortillaDeSlide(slide)"
              class="rounded-full bg-crema px-5 py-2.5 font-body text-sm font-bold text-carbon shadow-lg transition-transform active:scale-95"
              @click="ejecutarCta(slide)"
            >
              {{ slide.cta }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dots -->
    <div class="mt-3 flex justify-center gap-2">
      <button
        v-for="(_, i) in catalogo.novedades"
        :key="i"
        class="h-1.5 rounded-full transition-all"
        :class="i === actual ? 'w-6 bg-brasa' : 'w-1.5 bg-crema/20'"
        @click="ir(i)"
      />
    </div>
  </div>
</template>
