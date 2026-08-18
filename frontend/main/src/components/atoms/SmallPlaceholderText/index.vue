<template>
  <div class="fill-height small-placeholder-text">
    <div class="d-flex flex-grow-1 justify-center align-center">
      <div class="text-center">
        <div class="text-uppercase">
          {{ primaryText }}
        </div>
        <div class="text-body-medium mt-2">
          {{ secondaryText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SmallPlaceholderText',
  props: {
    primaryText: {
      type: String,
      default: '',
    },
    secondaryText: {
      type: String,
      default: '',
    },
  },
};
</script>
<style lang="scss" scoped>
.small-placeholder-text {
  display: flex;
  flex-direction: column;
}
</style>
