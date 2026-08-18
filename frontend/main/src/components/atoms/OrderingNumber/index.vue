<template>
  <span
    class="ordering-number"
    :class="{
      'ordering-number--small': props.small,
      [`bg-${backgroundColor}`]: !!backgroundColor && !props.outlined,
      'ordering-number--borderless': !!props.color && props.color !== 'white' && !props.outlined,
      'small-text': number >= 100,
      [`text-${props.color}`]: props.color && props.outlined,
      'ordering-number--outlined': props.outlined,
    }"
  >
    {{ props.number }}
  </span>
</template>

<script setup name="OrderingNumber">
import { computed } from 'vue';

const props = defineProps({
  number: {
    type: Number,
    required: true,
  },
  small: {
    type: Boolean,
  },
  color: {
    type: String,
    default: null,
  },
  outlined: {
    type: Boolean,
  },
});

const backgroundColor = computed(() => props.color);
</script>

<style lang="less">
.ordering-number {
  display: flex;
  flex-shrink: 0;
  flex-grow: 0;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid;
  font-size: 12px;
  margin: 2px;

  &--small {
    width: 16px;
    height: 16px;
    font-size: 10px;

    &.small-text {
      font-size: 8px;
    }
  }

  &:not(.ordering-number--outlined) {
    border-color: rgba(var(--v-theme-primary-dark));
  }

  &--borderless {
    border: none;
  }

  &.small-text {
    font-size: 10px;
  }
}
</style>
