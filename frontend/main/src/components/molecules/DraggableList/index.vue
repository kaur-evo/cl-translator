<template>
  <draggable
    v-model="itemsCopy"
    v-bind="$attrs"
    :tag="tag"
    ghost-class="ghost"
    :class="draggableClasses"
    :force-fallback="true"
    :delay="400"
    :delay-on-touch-only="true"
    @change="$emit('order-change', itemsCopy)"
  >
    <template #item="{ element: item, index }">
      <div
        :class="{ grabbable: !hideHover }"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        />
      </div>
    </template>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: 'DraggableList',
  components: { draggable },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    hideHover: {
      type: Boolean,
    },
    tag: {
      type: String,
      default: 'div',
    },
    draggableClasses: {
      type: String,
      default: '',
    },
  },
  emits: ['order-change'],
  data() {
    return {
      itemsCopy: [],
    };
  },
  watch: {
    items: {
      handler(newVal) {
        this.itemsCopy = [...newVal];
      },
      deep: true,
    },
  },
  mounted() {
    this.itemsCopy = [...this.items];
  },
};
</script>

<style scoped lang="scss">
.ghost {
  opacity: 0.5;
  background: transparent;
}
</style>
