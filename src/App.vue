<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import DesktopBlock from "@/components/DesktopBlock.vue";

const route = useRoute();
const esZonaAdmin = computed(
  () => route.path === "/admin" || route.path === "/admin/login",
);
</script>

<template>
  <DesktopBlock v-if="!esZonaAdmin">
    <RouterView />
  </DesktopBlock>
  <RouterView v-else />
</template>
