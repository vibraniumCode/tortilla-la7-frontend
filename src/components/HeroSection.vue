<script setup lang="ts">
interface Props {
  nombre: string;
  descripcion?: string;
  precio?: string;
}

withDefaults(defineProps<Props>(), {
  descripcion: "La especialidad de la casa, recién salida de la plancha.",
  precio: "$3.500",
});
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-3xl bg-brasa p-7">
    <!-- Firma visual: marcas de parrilla, no un blob decorativo -->
    <svg
      class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      preserveAspectRatio="none"
      viewBox="0 0 300 200"
    >
      <g stroke="#FAF6F1" stroke-width="3">
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

    <!-- Eyebrow -->
    <span
      class="relative z-10 inline-block rounded-full border border-crema/30 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-crema/90"
    >
      Tortilla del día
    </span>

    <!-- Título -->
    <h2
      class="relative z-10 mt-3 max-w-[65%] font-display text-5xl leading-[0.9] tracking-wide text-crema"
    >
      {{ nombre }}
    </h2>

    <!-- Descripción -->
    <p class="relative z-10 mt-2 max-w-[60%] font-body text-sm text-crema/70">
      {{ descripcion }}
    </p>

    <!-- Precio + CTA -->
    <div class="relative z-10 mt-5 flex items-center gap-3">
      <span class="font-display text-2xl tracking-wide text-queso">{{
        precio
      }}</span>
      <button
        class="rounded-full bg-crema px-5 py-2.5 font-body text-sm font-bold text-carbon shadow-lg transition-transform active:scale-95"
      >
        Pedir ahora
      </button>
    </div>

    <!-- Imagen del producto: reemplazá el src por tu PNG sin fondo -->
    <img
      src="@/assets/t-roquefort.png"
      alt="Tortilla"
      class="absolute -right-8 -bottom-10 z-10 w-44 rotate-[8deg] drop-shadow-2xl"
    />
  </div>
</template>
