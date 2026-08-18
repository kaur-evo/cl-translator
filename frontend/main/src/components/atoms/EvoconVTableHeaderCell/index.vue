<template>
  <th
    :class="cellClass"
    :style="header.style"
    :width="header.width"
    class="px-2 header-cell position-sticky"
    @click="onSort(header)"
  >
    <v-row
      class="flex-nowrap justify-center align-center"
      v-bind="props"
    >
      <v-col
        class="flex-grow-1 flex-shrink-0"
        :class="cellLabelContainerClass"
      >
        <div class="d-inline-flex align-center fill-height">
          <img
            v-if="header.prependImage"
            class="mr-1"
            width="16"
            height="16"
            alt=""
            :src="header.prependImage"
          >
          <v-icon
            v-if="header.headerPrependIcon"
            :size="header.headerPrependIconSize ?? 16"
            :color="header.headerPrependIconColor"
            class="mr-1"
          >
            {{ header.headerPrependIcon }}
          </v-icon>
          <span class="header-text">{{ headerText }}</span>
          <span v-if="header.appendText" class="header-append-text ml-1"> {{ header.appendText }}</span>
          <v-icon
            v-if="header.headerAppendIcon"
            :size="header.headerAppendIconSize ?? 16"
            :color="header.headerAppendIconColor"
            :class="header.headerAppendIconClass"
          >
            {{ header.headerAppendIcon }}
          </v-icon>
          <icon-with-tooltip
            v-if="!!tooltipContent"
            :text="tooltipContent"
            :icon="mdiInformationOutline"
            size="14"
            additional-classes="ml-1"
          />
        </div>
      </v-col>
      <v-col class="flex-shrink-1 flex-grow-0 pa-0">
        <v-icon
          size="16"
          :color="isSortByColumn ? 'primary' : 'grey'"
          class="ml-1 sort-arrow"
          :class="isSortByColumn ? 'active-sort-column' : ''"
        >
          {{ isSortDescColumn ? mdiArrowDown : mdiArrowUp }}
        </v-icon>
      </v-col>
    </v-row>
  </th>
</template>
<script>
import isFunction from 'lodash/isFunction';
import {
  mdiArrowUp, mdiArrowDown, mdiInformationOutline,
} from '@mdi/js';

import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
const icons = {
  mdiArrowUp, mdiArrowDown, mdiInformationOutline,
};
export default {
  name: 'EvoconVTableHeaderCell',
  components: { IconWithTooltip },
  props: {
    header: { type: Object, required: true },
    options: { type: Object, required: true },
    hidden: { type: Boolean },
    fixed: { type: Boolean },
    modelValue: { type: String, default: '' },
    tooltipContent: { type: String, default: '' },
  },
  emits: ['update:options'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    sortable() {
      return this.header?.sortable === undefined || !!this.header.sortable;
    },
    cellClass() {
      const classStrList = [];
      if (this.fixed) classStrList.push('fixed');
      if (this.hidden) classStrList.push('d-none');
      if (this.sortable) classStrList.push('sortable cursor-pointer');
      if (this.isNumberColumn) classStrList.push('numeric-header');
      return classStrList.join(' ');
    },
    isNumberColumn() {
      return this.header?.type === 'number';
    },
    cellLabelContainerClass() {
      const classStrList = [];
      if (this.isNumberColumn) classStrList.push('justify-end text-right text-no-wrap');
      if (this.isSortByColumn) {
        classStrList.push('text-primary-text');
      } else {
        classStrList.push('text-secondary-text');
      }
      return classStrList.join(' ');
    },
    isSortByColumn() {
      if (!this.options.sortBy) return false;
      return this.options.sortBy.key === this.modelValue;
    },
    isSortDescColumn() {
      if (this.isSortByColumn) {
        if (!this.options.sortBy) return false;
        return this.options.sortBy.order === 'desc';
      }
      return this.header.defaultDirection === 'desc';
    },
    headerText() {
      if (isFunction(this.header.text)) {
        return this.header.text();
      }
      return this.header.text;
    },
  },
  methods: {
    onSort(header) {
      if (this.sortable) {
        const prevSortBy = this.options.sortBy?.key;
        const prevOrder = this.options.sortBy?.order;
        const newSortBy = this.modelValue;
        let newOrder = header.defaultDirection || 'asc';
        if (newSortBy === prevSortBy) {
          newOrder = prevOrder === 'asc' ? 'desc' : 'asc';
        }
        this.$emit('update:options', { ...this.options, sortBy: { key: newSortBy, order: newOrder } });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.header-cell {
  transition: background-color 0.5s ease-in-out;
  background: white;
  line-height: 12px;
  &.fixed {
    position: sticky;
    left: 0;
    z-index: 3;
    background: white;
  }
  .sort-arrow {
    visibility: hidden;
    color: rgb(var(--v-theme-secondary-dark)) !important;
    &.active-sort-column {
      visibility: visible;
    }
  }
  &.sortable:hover {
    background: rgb(var(--v-theme-quaternary-dark-2)) !important;
    .sort-arrow {
      visibility: visible;
    }
  }
  .header-text, .header-append-text {
    font-size: 12px;
    line-height: 12px;
    font-weight: 600;
  }
}
</style>
