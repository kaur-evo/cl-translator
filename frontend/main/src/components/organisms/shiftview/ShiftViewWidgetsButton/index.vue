<template>
  <div class="container rounded">
    <v-icon>{{ mdiChartBoxOutline }}</v-icon>
  </div>
</template>

<script setup name="ShiftviewWidgetsButton">
import { mdiChartBoxOutline } from '@mdi/js';
</script>

<style scoped>
.container {
  height: 48px;
  width: 48px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(var(--v-theme-black));
}
</style>
