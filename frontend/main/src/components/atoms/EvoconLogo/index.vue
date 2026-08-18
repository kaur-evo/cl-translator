<template>
  <div
    id="app-evocon-logo"
    class="hover-class"
    :class="{ 'hover-class--mobile': isBreakpointSmAndDown, 'pa-3': !isBreakpointSmAndDown }"
    @click="$emit('logo-clicked')"
  >
    <div
      class="evocon-logo"
      :class="{ 'evocon-logo--mobile': isBreakpointSmAndDown }"
    />
  </div>
</template>
<script>
export default {
  name: 'EvoconLogo',
  emits: ['logo-clicked'],
  computed: {
    isBreakpointSmAndDown() {
      return !!this.$vuetify.display.smAndDown;
    },
  },
};
</script>
<style lang="scss" scoped>
$regular-size: 24px;
$mobile-size: 16px;
$hover-offset: 6px;
.evocon-logo {
  position: absolute;
  top: 0;
  left: 0;
  height: $regular-size;
  width: $regular-size;
  background-size: $regular-size;
  background: url("@/assets/icons/ic_evocon_menu_24px.svg") no-repeat;
  margin: $hover-offset;
  &--mobile {
    background-size: $mobile-size;
    height: $mobile-size;
    width: $mobile-size;
  }
}
.hover-class {
  cursor: pointer;
  position: relative;
  display: block;
  height: calc(#{$regular-size} + #{$hover-offset} * 2);
  width: calc(#{$regular-size} + #{$hover-offset} * 2);
  &:after {
    content: "";
    position: absolute;
    display:block;
    opacity: 0;
    border-radius: 50%;
    height: calc(#{$regular-size} + #{$hover-offset} * 2);
    width: calc(#{$regular-size} + #{$hover-offset} * 2);
    top: 0;
    left: 0;
    background: rgb(255, 255, 255);
  }
  &:hover {
    &:after {
      opacity: 0.12;
    }
  }
  &--mobile {
    height: calc(#{$mobile-size} + #{$hover-offset} * 2);
    width: calc(#{$mobile-size} + #{$hover-offset} * 2);
    &:after {
      height: calc(#{$mobile-size} + #{$hover-offset} * 2);
      width: calc(#{$mobile-size} + #{$hover-offset} * 2);
    }
  }
}
</style>
