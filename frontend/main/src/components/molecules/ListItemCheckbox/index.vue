<template>
  <v-list-item-action class="my-0 list-item-action">
    <v-icon
      v-if="!isSingleSelect || (isSingleSelect && value)"
      v-bind="$attrs"
      :color="color"
      class="list-item-checkbox"
      @click="$emit('click', $event)"
    >
      {{ checkboxIcon }}
    </v-icon>
  </v-list-item-action>
</template>
<script>
import {
  mdiMinusBox,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiCheckboxMarkedCircle,
} from '@mdi/js';

export default {
  name: 'ListItemCheckbox',
  props: {
    value: { type: Boolean },
    indeterminate: { type: Boolean },
    disabled: { type: Boolean },
    error: { type: Boolean },
    isSingleSelect: { type: Boolean },
    dark: { type: Boolean },
  },
  emits: ['click'],
  computed: {
    checkboxIcon() {
      if (this.isSingleSelect && this.disabled && !this.value) return '';
      if (this.isSingleSelect) {
        return mdiCheckboxMarkedCircle;
      }
      if (this.indeterminate) {
        return mdiMinusBox;
      }
      if (this.value) {
        return mdiCheckboxMarked;
      }
      return mdiCheckboxBlankOutline;
    },
    color() {
      if (this.disabled) return 'secondary-text';
      if (this.error) return 'error';
      if (this.value || this.indeterminate) return 'primary';
      if (this.isSingleSelect) return 'transparent';
      return this.dark ? 'white' : 'secondary-text';
    },
  },
};
</script>
<style lang="scss">
.list-item-action {
  width: 24px;
}
</style>
