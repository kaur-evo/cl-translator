<template>
  <div
    class="logo-container rounded"
    :class="{ 'logo-container--large': large }"
    @click="$vuetify.display.smAndDown ? setMainNavDrawer(true) : ''"
    @mouseover="$vuetify.display.mdAndUp ? setMainNavDrawerWithDelay(true) : ''"
    @mouseleave="$vuetify.display.mdAndUp && !mainNavDrawerOpen ? setMainNavDrawerWithDelay(false) : ''"
  >
    <img class="evocon-logo" src="@/assets/icons/ic_evocon_menu_24px.svg">
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useMainNavDrawerConfigStore } from '@/stores/index';

export default {
  name: 'ShiftViewEvoconLogoBtn',
  props: {
    large: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState(useMainNavDrawerConfigStore, { mainNavDrawerOpen: 'drawerOpen' }),
  },
  methods: {
    ...mapActions(useMainNavDrawerConfigStore, ['setMainNavDrawer', 'setMainNavDrawerWithDelay']),
  },
};
</script>
<style lang="scss" scoped>
.logo-container {
  min-width: 48px;
  max-width: 48px;
  height: 48px;
  width: 48px;
  cursor: pointer;
  background-color: var(--color-12-primary);
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;

  .evocon-logo {
    display: block;
    height: 24px;
    width: 24px;
  }

  &--large {
    height: 64px;
    width: 64px;
    min-width: 64px;
    max-width: 64px;

    .evocon-logo {
      height: 32px;
      width: 32px;
    }
  }

  &:hover {
    &:after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-12-primary);
      border-radius: inherit;
      pointer-events: none;
    }
  }
}
</style>
