<template>
  <div
    class="header-block-button rounded d-flex align-center cursor-pointer text-truncate"
    :class="large ? 'pa-2' : 'pa-1'"
    @click="$emit('click', $event)"
  >
    <slot name="navigation-arrows" />
    <div class="text-truncate px-2" :class="`${titleClass} font-weight-medium d-flex justify-center`">
      <div class="flex-shrink-1 flex-grow-0 text-truncate">
        {{ title }}
      </div>
      <slot name="live-indicator" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'HeaderBlockButton',
  props: {
    title: { type: String, default: '' },
    titleClass: { type: String, default: '' },
    large: { type: Boolean, default: false },
  },
  emits: ['click'],
};
</script>
<style lang="less" scoped>
.header-block-button {
  background-color: rgb(var(--v-theme-black));

  &:hover {
    background-color: rgb(var(--v-theme-lw-gray));
  }
}
</style>
