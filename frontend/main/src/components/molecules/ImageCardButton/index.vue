<template>
  <v-hover v-slot="{ isHovering, props } = {}">
    <v-sheet
      v-ripple="{ center: true }"
      v-bind="props"
      :min-width="minWidth"
      class="position-relative cursor-pointer d-flex flex-column align-center pa-2"
      :class="{ 'bg-primary-tint': isHovering || selected }"
      @click="$emit('click')"
    >
      <new-indicator
        v-if="newIndicatorShownUntil"
        small
        class="new-indicator"
        :shown-until="newIndicatorShownUntil"
      />
      <img
        :src="img"
        class="non-selectable mt-1"
        alt=""
      >
      <span
        class="text-body-medium mt-1 text-center white-space-nowrap"
        :class="{ 'font-weight-medium': selected }"
      >
        {{ title }}
      </span>
    </v-sheet>
  </v-hover>
</template>
<script>
import NewIndicator from '@/components/atoms/NewIndicator';
export default {
  name: 'ImageCardButton',
  components: { NewIndicator },
  props: {
    title: {
      type: String,
      required: true,
    },
    img: {
      type: [String, Object],
      required: true,
    },
    selected: { type: Boolean },
    minWidth: { type: String, default: null },
    newIndicatorShownUntil: { type: String, default: '' },
  },
  emits: ['click'],
};
</script>
<style scoped lang="scss">
.non-selectable {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.new-indicator {
  position: absolute;
  top: 6px;
  left: calc(50% + 8px);
}
</style>
