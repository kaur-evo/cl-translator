<template>
  <div
    ref="evocon-v-data-footer"
    class="d-inline-flex flex-nowrap text-no-wrap align-center"
  >
    <div v-if="showRowsPerPage" class="d-flex align-center">
      <span class="text-body-small">{{ $t('Rows per page') }}</span>
      <evocon-v-select
        :model-value="showAllItems ? -1 : options.itemsPerPage"
        :items="itemsPerPageList"
        :disabled="showAllItems"
        :menu-props="{ minWidth: 'auto' }"
        class="ml-2 mb-2"
        item-value="value"
        item-text="text"
        density="compact"
        variant="underlined"
        @update:model-value="$emit('update:options', { ...options, itemsPerPage: $event })"
      />
    </div>
    <span class="text-body-small ml-8 mr-6">{{ pageStart }}-{{ pageEnd }}/{{ totalCountText }}{{ allItemsNotLoaded ? '+' : '' }}</span>
    <evocon-v-button
      :icon="mdiChevronLeft"
      :disabled="isFirstPage || showAllItems"
      @click="onPreviousPageClick"
    />
    <evocon-v-button
      :icon="mdiChevronRight"
      :disabled="isLastPage || showAllItems"
      class="ml-3"
      @click="onNextPageClick"
    />
  </div>
</template>
<script>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

import isElementInViewport from '@/helpers/dom/isElementInViewport';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVSelect from '@/components/atoms/EvoconVSelect/index.vue';

const vectorIcons = {
  mdiChevronLeft,
  mdiChevronRight,
};
export default {
  name: 'EvoconVDataFooter',
  components: {
    EvoconVButton,
    EvoconVSelect,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Object,
      required: true,
    },
    scrollIntoView: {
      type: Boolean,
    },
    showAllItems: {
      type: Boolean,
    },
    allItemsNotLoaded: {
      type: Boolean,
    },
    showRowsPerPage: {
      type: Boolean,
    },
    itemsPerPageList: {
      type: Array,
      default: () => [
        { value: 10, text: '10' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: -1, text: 'All' },
      ],
    },
    hasUnknownTotalItems: {
      type: Boolean,
    },
  },
  emits: ['update:options'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    totalCountText() {
      return this.getTotalCountText(this.hasUnknownTotalItems, this.pagination, this.items);
    },
    isLastPage() {
      return this.getIsLastPage(this.hasUnknownTotalItems, this.validOptions, this.options, this.items, this.pageCount);
    },
    isFirstPage() {
      return this.options.page === 1;
    },
    itemsPerPage() {
      return this.showAllItems ? -1 : this.options.itemsPerPage;
    },
    pageCount() {
      if (this.itemsPerPage === -1) return 1;
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    pageStart() {
      return this.pagination.pageStart + 1;
    },
    page() {
      return this.getPage(this.hasUnknownTotalItems, this.options, this.showAllItems, this.pageCount);
    },
    validOptions() {
      return {
        ...this.options,
        page: this.page,
        itemsPerPage: this.itemsPerPage,
      };
    },
    pagination() {
      return this.getPagination(this.validOptions, this.pageCount, this.items);
    },
    pageEnd() {
      return this.getPageEnd(this.hasUnknownTotalItems, this.pageCount, this.pagination, this.items);
    },
  },
  methods: {
    getPageEnd(hasUknownTotalItems, pageCount, pagination, items) {
      if (hasUknownTotalItems) {
        return pagination.pageStart + items.length;
      }
      if (pageCount === 1 || pagination.itemsLength < pagination.pageStop) {
        return pagination.itemsLength;
      }
      return pagination.pageStop;
    },
    getPagination(validOptions, pageCount, items) {
      const { page, itemsPerPage } = validOptions;
      return {
        page,
        itemsPerPage,
        pageStart: (page * itemsPerPage) - itemsPerPage,
        pageStop: page * itemsPerPage,
        pageCount,
        itemsLength: items.length,
      };
    },
    getPage(hasUnknownTotalItems, options, showAllItems, pageCount) {
      if (hasUnknownTotalItems) {
        return options.page;
      }
      return showAllItems ? 1 : Math.min(pageCount, options.page);
    },
    getTotalCountText(hasUnknownTotalItems, pagination, items) {
      if (hasUnknownTotalItems) {
        if (items.length < pagination.itemsPerPage) {
          return pagination.pageStart + items.length;
        }
        return `${pagination.pageStart + items.length}+`;
      }
      return items.length;
    },
    getIsLastPage(hasUnknownTotalItems, validOptions, options, items, pageCount) {
      if (hasUnknownTotalItems) {
        return validOptions.itemsPerPage > items.length;
      }
      return options.page === pageCount;
    },
    onNextPageClick() {
      this.$emit('update:options', {
        ...this.options,
        page: this.options.page + 1,
      });
      this.doScrollIntoView();
    },
    onPreviousPageClick() {
      this.$emit('update:options', {
        ...this.options,
        page: this.options.page - 1,
      });
      this.doScrollIntoView();
    },
    async doScrollIntoView() {
      if (this.scrollIntoView) {
        setTimeout(() => {
          const element = this.$refs['evocon-v-data-footer'];
          if (!isElementInViewport(element)) {
            element.scrollIntoView({
              behavior: 'instant',
              block: 'nearest',
              inline: 'start',
            });
          }
        }, 200);
      }
    },
  },
};
</script>
